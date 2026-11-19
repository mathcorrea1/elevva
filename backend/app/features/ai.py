import hashlib
import json
import asyncio
from pathlib import Path
from typing import Literal, Annotated
from datetime import datetime, timezone, timedelta
import httpx
from pydantic import BaseModel, ConfigDict, Field, ValidationError
from fastapi import APIRouter, Depends, Header, HTTPException
from sqlalchemy import select, func, update
from sqlalchemy.orm import Session
from app.core.auth import identity
from app.core.config import settings
from app.core.database import session
from .models import Analysis, Content, Assignment, Student, AIGate, LessonGeneration, now
from .contracts import Analyze, Review
from .learning import grant, history, dto

router = APIRouter()
Identifier = Annotated[str, Field(min_length=1, max_length=100)]
PROMPT = Path(__file__).resolve().parents[2] / 'ia' / 'instrucoes-analise.md'


class Recommendation(BaseModel):
    model_config = ConfigDict(extra='forbid')
    activity_id: Identifier
    reason: str = Field(min_length=1, max_length=500)
    evidence_ids: list[Identifier] = Field(min_length=1, max_length=10)
    source_ids: list[Identifier] = Field(min_length=1, max_length=5)


class Result(BaseModel):
    model_config = ConfigDict(extra='forbid')
    state: Literal['insufficient', 'suggestion']
    suggested_level: Literal['pre-silabico', 'silabico', 'silabico-alfabetico', 'alfabetico'] | None
    summary: str = Field(min_length=1, max_length=1000)
    evidence_ids: list[Identifier] = Field(max_length=20)
    limitations: list[Annotated[str, Field(min_length=1, max_length=500)]] = Field(min_length=1, max_length=10)
    recommendations: list[Recommendation] = Field(max_length=3)


def validate_result(value, snapshot):
    parsed = Result.model_validate(value)
    evidence = {e['id'] for e in snapshot['evidence']}
    allowed = {a['id'] for a in snapshot['allowed_activities']}
    sources = {s['id'] for s in snapshot['sources']}
    if not set(parsed.evidence_ids) <= evidence:
        raise ValueError('unknown evidence')
    if parsed.state == 'insufficient' and parsed.suggested_level is not None:
        raise ValueError('insufficiency cannot suggest level')
    if parsed.state == 'suggestion' and ((not snapshot['rubric']['approved'] and not snapshot.get('technical_test', False)) or not parsed.evidence_ids or parsed.suggested_level is None):
        raise ValueError('suggestion requires approved instrument and evidence')
    for rec in parsed.recommendations:
        if rec.activity_id not in allowed or not set(rec.evidence_ids) <= evidence or not set(rec.source_ids) <= sources:
            raise ValueError('unknown recommendation references')
    # These are safety/content checks, not evidence of pedagogical correctness.
    text = json.dumps(value, ensure_ascii=False).lower()
    if any(w in text for w in ('diagnóstico de', 'diagnostico de', 'tem autismo', 'tem dislexia', 'tem tdah')):
        raise ValueError('clinical claim')
    return parsed.model_dump()


def snapshot_for(db, sid, synthetic):
    events = history(db, sid)[:20]
    instrument = next((e.get('instrument_snapshot') for e in events if e['kind'] == 'assessment' and e.get('instrument_snapshot')), None) if not synthetic else None
    evidence = []
    for e in events:
        if e['kind'] == 'assessment':
            if synthetic and e['synthetic'] and e['instrument'] == 'synthetic-integration-v1':
                items = [{'item': 'som-inicial', 'response': i['response']} for i in e['evidence']
                         if i['item'] == 'som-inicial' and i['response'] in ('A', 'B')]
                evidence.append({'id': e['id'], 'type': 'assessment', 'items': items, 'synthetic': True})
            elif instrument and e.get('instrument_snapshot') and e['instrument_snapshot']['review_id'] == instrument['review_id']:
                evidence.append({'id': e['id'], 'type': 'assessment', 'items': [{'item': i['item'], 'response': i['response']} for i in e['evidence']], 'instrument_version': instrument['version']})
            else:
                evidence.append({'id': e['id'], 'type': 'assessment', 'content_omitted': 'Descriptive evidence awaits approved structured instrument D03'})
        elif e['kind'] == 'attempt' and e['status'] == 'finished':
            task = db.get(Assignment, e['assignment_id'])
            from app.features.lessons.grading import comparison_result
            evidence.append({'id': e['id'], 'type': 'attempt', 'assignment_id':task.id,'attempt_policy':'submissions_preserved_do_not_average_retries','content_id': task.content_id, 'version': task.content_version,
                             'items': [{'id': i['id'], 'kind':i.get('kind','single_legacy'), 'correct': comparison_result(i,e)[1]['correct'], 'needs_review':comparison_result(i,e)[1]['needs_review']}
                                       for i in task.snapshot['items'] if i['id'] in e['responses']]})
        # Deliberately do not send free text (may contain names/diagnoses/injection).
    activities = list(db.scalars(select(Content).where(Content.status == ('synthetic' if synthetic else 'published'), Content.kind == 'activity',Content.archived_at.is_(None))))
    references = [{'id': instrument['review_id'] + ':' + str(index), 'title': r['title'], 'text': r['excerpt']} for index, r in enumerate(instrument['references'])] if instrument else []
    return {'schema_version': '1', 'evidence': evidence, 'technical_test': synthetic,
            'previous_confirmed_level': db.get(Student, sid).confirmed_level,
            'rubric': {'id': 'synthetic-integration-v1' if synthetic else instrument['id'] if instrument else None,
                       'approved': bool(instrument), 'scope': 'technical_test_only' if synthetic else 'reviewed' if instrument else 'pending_D03',
                       'rules': 'Teste sintético: apenas quando item som-inicial=A e resposta=A sugerir silabico; resposta=B sugerir pre-silabico. Sem correspondência, insuficiência.' if synthetic else instrument['rubric_text'] if instrument else None},
            'allowed_activities': [{'id': a.id, 'title': a.title, 'instructions': a.body['instructions']} for a in activities],
            'sources': [{'id': 'synthetic-corpus-v1', 'text': 'Exemplo inteiramente fictício para teste de integração, sem validade pedagógica.'}] if synthetic else references}


async def _provider_request(snapshot, instruction, schema=None, schema_name='eleva_analysis', max_tokens=None):
    cfg = settings()
    async with asyncio.timeout(cfg.ai_timeout_seconds), httpx.AsyncClient(timeout=cfg.ai_timeout_seconds) as client:
        response = await client.post('https://api.groq.com/openai/v1/chat/completions',
            headers={'Authorization': 'Bearer ' + cfg.groq_api_key}, json={
                'model': cfg.groq_model, 'temperature': 0, 'reasoning_effort': 'low', 'max_completion_tokens': max_tokens or cfg.ai_max_completion_tokens,
                'response_format': {'type': 'json_schema', 'json_schema': {'name': schema_name, 'strict': True, 'schema': schema or Result.model_json_schema()}},
                'messages': [{'role': 'system', 'content': instruction},
                             {'role': 'user', 'content': json.dumps(snapshot, ensure_ascii=False)}]})
        if response.status_code == 429:
            return 'quota', None, None, response.headers.get('x-request-id')
        if response.status_code != 200:
            return 'provider_error', None, None, response.headers.get('x-request-id')
        data = response.json()
        data['usage'] = {**(data.get('usage') or {}), 'reported_model': data.get('model'),
                         'completion_id': data.get('id'),
                         'rate_limits': {k: response.headers[k] for k in ('retry-after', 'x-ratelimit-remaining-requests', 'x-ratelimit-remaining-tokens') if k in response.headers}}
        provider_request_id = response.headers.get('x-request-id') or data.get('id')
        choice = data['choices'][0]
        if choice['message'].get('refusal') or choice.get('finish_reason') == 'content_filter':
            return 'refused', None, data.get('usage'), provider_request_id
        if choice.get('finish_reason') != 'stop':
            return 'truncated', None, data.get('usage'), provider_request_id
        return 'completed', json.loads(choice['message']['content']), data.get('usage'), provider_request_id


def provider(snapshot, instruction):
    # Sync API endpoint runs in FastAPI's worker pool; the HTTP operation has a total deadline.
    try:
        return asyncio.run(_provider_request(snapshot, instruction))
    except TimeoutError:
        raise httpx.ReadTimeout('AI total deadline exceeded')


@router.post('/students/{sid}/analyses')
def analyze(sid: str, body: Analyze, adult=Depends(identity), db: Session = Depends(session, scope='function'),
            key: str = Header('', alias='Idempotency-Key')):
    grant(db, adult, sid)
    cfg = settings()
    if body.synthetic_instrument and not (cfg.ai_allow_synthetic and cfg.eleva_env in ('development', 'test')):
        raise HTTPException(422, 'Instrumento sintético não habilitado')
    if not cfg.groq_api_key:
        raise HTTPException(503, 'A análise com IA ainda não está disponível neste ambiente. Seus registros e resultados anteriores continuam acessíveis.')
    if not key:
        raise HTTPException(400, 'Idempotency-Key obrigatório')
    snapshot = snapshot_for(db, sid, body.synthetic_instrument)
    instruction = PROMPT.read_text(encoding='utf-8')
    if body.synthetic_instrument:
        instruction += '\nModo técnico sintético isolado: a rubrica NÃO é aprovada. Exclusivamente neste teste, exercite o campo suggestion usando as regras artificiais explícitas do snapshot. Identifique o resultado como teste sem validade pedagógica. Esta exceção nunca autoriza uso com estudantes reais.'
    prompt_hash = hashlib.sha256(instruction.encode()).hexdigest()
    snapshot_hash = hashlib.sha256(json.dumps(snapshot, sort_keys=True).encode()).hexdigest()
    # Key tied to actor/student, persisted before network; retried interrupted calls do not charge again.
    request_hash = hashlib.sha256((adult.id + ':' + sid + ':' + key).encode()).hexdigest()
    existing = db.scalar(select(Analysis).where(Analysis.command_key == request_hash))
    if existing:
        if existing.snapshot_hash != snapshot_hash:
            raise HTTPException(409, 'Chave de análise já usada com outras evidências')
        return dto(existing)
    cutoff = (datetime.now(timezone.utc) - timedelta(hours=24)).isoformat()
    cached = db.scalar(select(Analysis).where(Analysis.student_id == sid, Analysis.snapshot_hash == snapshot_hash,
                       Analysis.prompt_version == prompt_hash, Analysis.model == cfg.groq_model,
                       Analysis.status == 'completed', Analysis.created_at >= cutoff).order_by(Analysis.created_at.desc()))
    if cached:
        row = Analysis(student_id=sid, adult_id=adult.id, snapshot=snapshot, snapshot_hash=snapshot_hash,
                       prompt_version=prompt_hash, model=cfg.groq_model, origin='cached', status='completed',
                       command_key=request_hash, result=cached.result, usage={'cached_from': cached.id, 'source_date': cached.created_at})
        db.add(row)
        db.flush()
        return dto(row)
    gate = db.scalar(select(AIGate).where(AIGate.id == 1).with_for_update())
    if not gate:
        gate = AIGate(id=1, busy=False)
        db.add(gate)
        db.flush()
    if gate.busy or (gate.last_started_at and (datetime.now(timezone.utc) - datetime.fromisoformat(gate.last_started_at)).total_seconds() < cfg.ai_min_start_interval_seconds):
        raise HTTPException(429, 'Aguarde antes de iniciar outra análise', headers={'Retry-After': str(cfg.ai_min_start_interval_seconds)})
    day = datetime.now(timezone.utc).date().isoformat()
    project_count = db.scalar(select(func.count()).select_from(Analysis).where(Analysis.created_at >= day, Analysis.origin == 'live'))
    user_count = db.scalar(select(func.count()).select_from(Analysis).where(Analysis.created_at >= day, Analysis.adult_id == adult.id, Analysis.origin == 'live'))
    project_count += db.scalar(select(func.count()).select_from(LessonGeneration).where(LessonGeneration.created_at >= day, LessonGeneration.origin == 'live'))
    user_count += db.scalar(select(func.count()).select_from(LessonGeneration).where(LessonGeneration.created_at >= day, LessonGeneration.adult_id == adult.id, LessonGeneration.origin == 'live'))
    if project_count >= cfg.ai_project_daily_limit or user_count >= cfg.ai_user_daily_limit:
        raise HTTPException(429, 'Limite diário local atingido; consulte os registros e o último resultado')
    if len(json.dumps(snapshot, ensure_ascii=False)) > cfg.ai_max_snapshot_characters:
        raise HTTPException(422, 'Recorte de evidências excede limite; reduza itens/observações')
    row = Analysis(student_id=sid, adult_id=adult.id, snapshot=snapshot, snapshot_hash=snapshot_hash,
                   prompt_version=prompt_hash, model=cfg.groq_model, command_key=request_hash)
    gate.busy, gate.last_started_at = True, now()
    db.add(row)
    db.commit()  # Persist pending before external request, independent of learning writes.
    try:
        status, output, usage, provider_id = provider(snapshot, instruction)
        if output is not None:
            row.result = validate_result(output, snapshot)
        row.status, row.usage, row.request_id = status, usage, provider_id
    except httpx.TimeoutException:
        row.status = 'timeout'
    except (ValueError, KeyError, IndexError, TypeError, ValidationError):
        row.status = 'invalid_response'
    except httpx.HTTPError:
        row.status = 'unavailable'
    gate.busy = False
    db.commit()
    grant(db, adult, sid)
    return dto(row)


@router.get('/students/{sid}/analyses')
def analyses(sid: str, adult=Depends(identity), db: Session = Depends(session, scope='function')):
    grant(db, adult, sid)
    return [dto(r) for r in db.scalars(select(Analysis).where(Analysis.student_id == sid).order_by(Analysis.created_at.desc()))]


@router.post('/students/{sid}/analyses/{aid}/review')
def review(sid: str, aid: str, body: Review, adult=Depends(identity), db: Session = Depends(session, scope='function')):
    grant(db, adult, sid)
    row = db.get(Analysis, aid)
    if not row or row.student_id != sid:
        raise HTTPException(404)
    if row.review and row.reviewed_by == adult.id and row.review == body.decision and row.review_note == body.note and row.revised_result == body.revised_result:
        return dto(row)
    if row.status != 'completed' or row.review:
        raise HTTPException(409, 'Análise indisponível para revisão')
    revised = None
    if body.decision == 'edited':
        if not body.revised_result or len(body.note) < 10:
            raise HTTPException(422, 'Ajuste exige resultado completo e justificativa de pelo menos 10 caracteres')
        try:
            revised = validate_result(body.revised_result, row.snapshot)
        except ValueError:
            raise HTTPException(422, 'Ajuste contém referência ou conteúdo inválido')
    result = db.execute(update(Analysis).where(Analysis.id == aid, Analysis.review.is_(None))
                        .values(review=body.decision, reviewed_by=adult.id, reviewed_at=now(), revised_result=revised, review_note=body.note))
    if result.rowcount != 1:
        raise HTTPException(409, 'Revisão já registrada por outro adulto')
    db.refresh(row)
    return dto(row)
