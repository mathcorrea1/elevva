"""Adult-only content authoring. No student lookup or private evidence enters this path."""
import asyncio
import hashlib
import json
import re
from datetime import datetime, timezone, timedelta
from pathlib import Path
from typing import Literal
import httpx
from fastapi import APIRouter, Depends, Header, HTTPException, Query
from pydantic import BaseModel, ConfigDict, Field, model_validator
from sqlalchemy import select, func, update, or_
from sqlalchemy.orm import Session
from app.core.auth import identity
from app.core.config import settings
from app.core.database import session
from app.features import models as m
from app.features import ai
from app.features.contracts import Input
from app.features.levels import LiteracyLevel
from app.features.learning import command
from app.features.catalog.router import capture_revision
from .router import teacher
from .contracts import LessonCommand
from .service import body_for, dto_lesson

router = APIRouter()
PROMPT = Path(__file__).resolve().parents[3] / 'ia' / 'instrucoes-criacao.md'
Mechanic = Literal['single', 'multiple', 'order', 'matching', 'text']

class Generate(Input):
    objective: str = Field(min_length=12, max_length=1200)
    literacy_level: LiteracyLevel
    mechanics: list[Mechanic] = Field(min_length=1, max_length=5)
    activity_count: int = Field(default=3, ge=1, le=6)
    privacy_confirmed: Literal[True]

    @model_validator(mode='after')
    def bounded(self):
        if len(set(self.mechanics)) != len(self.mechanics) or len(self.mechanics) > self.activity_count:
            raise ValueError('Escolha formatos distintos, até a quantidade de atividades.')
        if re.search(r'https?://|\b[\w.+-]+@[\w.-]+\.[a-z]{2,}|\b\d{3}\.?\d{3}\.?\d{3}-?\d{2}\b|(?:\+?55\s*)?\(?\d{2}\)?[\s-]*9?\d{4}[\s-]?\d{4}\b', self.objective, re.I):
            raise ValueError('Use apenas o objetivo pedagógico, sem contato, documentos ou links.')
        return self

class Strict(BaseModel):
    model_config = ConfigDict(extra='forbid', strict=True)

class GeneratedQuestion(Strict):
    kind: Mechanic
    prompt: str = Field(min_length=2, max_length=500)
    skill: str = Field(min_length=2, max_length=100)
    instruction: str = Field(max_length=500)
    options: list[str] = Field(max_length=8)
    targets: list[str] = Field(max_length=8)
    answer_indices: list[int] = Field(max_length=8)
    accepted_answers: list[str] = Field(max_length=10)
    feedback_correct: str = Field(min_length=2, max_length=300)
    feedback_incorrect: str = Field(min_length=2, max_length=300)
    hint: str = Field(max_length=300)
    reading_allowed: bool
    ignore_accents: bool

class GeneratedScreen(Strict):
    type: Literal['text', 'activity', 'completion']
    title: str = Field(min_length=2, max_length=160)
    text: str = Field(max_length=1500)
    question: GeneratedQuestion | None

class Proposal(Strict):
    refusal: bool
    title: str = Field(min_length=2, max_length=120)
    description: str = Field(min_length=2, max_length=600)
    objective: str = Field(min_length=2, max_length=1000)
    skills: list[str] = Field(min_length=1, max_length=10)
    audience: str = Field(max_length=500)
    adaptations: str = Field(max_length=1000)
    screens: list[GeneratedScreen] = Field(max_length=8)
    warnings: list[str] = Field(min_length=1, max_length=8)

def validated_proposal(value, request):
    parsed = Proposal.model_validate(value)
    if parsed.refusal:
        return None
    screens = []
    for index, s in enumerate(parsed.screens):
        question = None
        if s.type == 'activity':
            q = s.question
            if not q or q.kind not in request.mechanics:
                raise ValueError('unsupported mechanic')
            if any(not x.strip() or len(x)>120 for x in q.options+q.targets):
                raise ValueError('invalid element')
            if q.kind != 'matching' and q.targets or q.kind != 'text' and q.accepted_answers:
                raise ValueError('unused answer field')
            options = [{'id':f'o{i}', 'text':text} for i,text in enumerate(q.options)]
            targets = [{'id':f't{i}', 'text':text} for i,text in enumerate(q.targets)]
            if q.kind == 'text':
                if options or targets or q.answer_indices: raise ValueError('text has options')
                answer = q.accepted_answers
            elif q.kind == 'matching':
                if len(q.answer_indices)!=len(options) or sorted(q.answer_indices)!=list(range(len(targets))): raise ValueError('invalid pairs')
                answer = {f'o{i}':f't{v}' for i,v in enumerate(q.answer_indices)}
            else:
                if any(i<0 or i>=len(options) for i in q.answer_indices):raise ValueError('invalid answer index')
                answer = [f'o{i}' for i in q.answer_indices]
                if q.kind=='single':
                    if len(answer)!=1:raise ValueError('single answer length')
                    answer=answer[0]
            question = {'id':f'q{index}', 'kind':q.kind,'prompt':q.prompt,'skill':q.skill,'instruction':q.instruction,
                        'options':options,'targets':targets,'answer':answer,'reading_allowed':q.reading_allowed,
                        'feedback_correct':q.feedback_correct,'feedback_incorrect':q.feedback_incorrect,'hint':q.hint,
                        'normalization':{'ignore_case':True,'collapse_spaces':True,'ignore_accents':q.ignore_accents,'unmatched':'human_review'}}
        elif s.question is not None:raise ValueError('content has question')
        screens.append({'id':f's{index}','type':s.type,'title':s.title,'text':s.text,'question':question})
    if not screens or screens[0]['type']!='text' or screens[-1]['type']!='completion':raise ValueError('missing boundaries')
    qs=[s['question'] for s in screens if s['question']]
    if len(qs)!=request.activity_count or {q['kind'] for q in qs}!=set(request.mechanics):raise ValueError('wrong activity coverage')
    text=json.dumps(value,ensure_ascii=False).lower()
    if re.search(r'https?://|\b[\w.+-]+@[\w.-]+\.[a-z]{2,}|diagn[oó]stico de|tem autismo|tem dislexia|tem tdah|\bpornografia\b|sexo expl[ií]cito|matar algu[eé]m|envie sua senha|n[uú]mero do seu cart[aã]o',text):raise ValueError('unsafe content')
    lesson=LessonCommand(title=parsed.title,description=parsed.description,objective=parsed.objective,skills=parsed.skills,
                         audience=parsed.audience,adaptations=parsed.adaptations, literacy_level=request.literacy_level,screens=screens)
    return {'lesson':lesson.model_dump(),'warnings':parsed.warnings,'review_required':True}

def generation_dto(row):
    return {key:getattr(row,key) for key in ('id','status','origin','model','request_id','prompt_version','created_at','result','usage','content_id')}

def owned(db,adult,gid):
    teacher(adult)
    row=db.get(m.LessonGeneration,gid)
    if not row or row.adult_id!=adult.id:raise HTTPException(404,'Proposta indisponível para esta conta.')
    return row

def provider(request,instruction):
    try:
        return asyncio.run(ai._provider_request(request,instruction,Proposal.model_json_schema(),'eleva_lesson',settings().ai_lesson_max_completion_tokens))
    except TimeoutError:raise httpx.ReadTimeout('AI total deadline exceeded')

@router.get('/ai/lesson-generations')
def generations(offset:int=Query(0,ge=0),adult=Depends(identity),db:Session=Depends(session,scope='function')):
    teacher(adult)
    query=select(m.LessonGeneration).where(m.LessonGeneration.adult_id==adult.id)
    total=db.scalar(select(func.count()).select_from(query.subquery()))
    rows=db.scalars(query.order_by(m.LessonGeneration.created_at.desc(),m.LessonGeneration.id).offset(offset).limit(10))
    return {'items':[{k:v for k,v in generation_dto(r).items() if k!='result'} for r in rows],'total':total,'next_offset':offset+10 if offset+10<total else None}

@router.get('/ai/lesson-generations/{gid}')
def detail(gid:str,adult=Depends(identity),db:Session=Depends(session,scope='function')):
    return generation_dto(owned(db,adult,gid))

@router.post('/ai/lesson-generations')
def generate(body:Generate,adult=Depends(identity),db:Session=Depends(session,scope='function'),key:str=Header('',alias='Idempotency-Key')):
    teacher(adult);cfg=settings()
    if not key or len(key)>100:raise HTTPException(400,'Chave de operação obrigatória, com até 100 caracteres.')
    request=body.model_dump(exclude={'privacy_confirmed'})
    instruction=PROMPT.read_text(encoding='utf-8');ph=hashlib.sha256(instruction.encode()).hexdigest()
    ih=hashlib.sha256(json.dumps(request,sort_keys=True).encode()).hexdigest()
    kh=hashlib.sha256((adult.id+':lesson:'+key).encode()).hexdigest()
    old=db.scalar(select(m.LessonGeneration).where(m.LessonGeneration.command_key==kh))
    if old:
        if old.input_hash!=ih:raise HTTPException(409,'Esta operação já foi usada com outro pedido.')
        return generation_dto(old)
    if not cfg.groq_api_key:raise HTTPException(503,'Configure GROQ_API_KEY no backend para gerar aulas. A criação manual continua disponível.')
    cutoff=(datetime.now(timezone.utc)-timedelta(hours=24)).isoformat()
    cached=db.scalar(select(m.LessonGeneration).where(m.LessonGeneration.adult_id==adult.id,m.LessonGeneration.input_hash==ih,m.LessonGeneration.prompt_version==ph,m.LessonGeneration.model==cfg.groq_model,m.LessonGeneration.status=='completed',m.LessonGeneration.created_at>=cutoff).order_by(m.LessonGeneration.created_at.desc()))
    row=m.LessonGeneration(adult_id=adult.id,command_key=kh,input_hash=ih,request_data=request,prompt_version=ph,model=cfg.groq_model)
    if cached:
        row.status='completed';row.origin='cached';row.result=cached.result;row.usage={'cached_from':cached.id,'source_date':cached.created_at}
        db.add(row);db.flush();return generation_dto(row)
    gate=db.get(m.AIGate,1)
    if not gate:db.add(m.AIGate(id=1,busy=False));db.flush()
    day=datetime.now(timezone.utc).date().isoformat()
    def count(model,personal=False):return db.scalar(select(func.count()).select_from(model).where(model.created_at>=day,model.origin=='live',*((model.adult_id==adult.id,) if personal else ())))
    if sum(count(model) for model in (m.Analysis,m.LessonGeneration))>=cfg.ai_project_daily_limit or sum(count(model,True) for model in (m.Analysis,m.LessonGeneration))>=cfg.ai_user_daily_limit:raise HTTPException(429,'Limite diário de IA atingido. Continue no editor manual.')
    threshold=(datetime.now(timezone.utc)-timedelta(seconds=cfg.ai_min_start_interval_seconds)).isoformat()
    lock=db.execute(update(m.AIGate).where(m.AIGate.id==1,m.AIGate.busy==False,or_(m.AIGate.last_started_at.is_(None),m.AIGate.last_started_at<=threshold)).values(busy=True,last_started_at=m.now()))
    if lock.rowcount!=1:raise HTTPException(429,'Uma criação está em processamento. Aguarde e tente novamente.',headers={'Retry-After':str(cfg.ai_min_start_interval_seconds)})
    db.add(row);db.commit()
    try:
        status,output,usage,request_id=provider(request,instruction)
        row.usage,row.request_id=usage,request_id
        if status=='completed':
            row.result=validated_proposal(output,body)
            status='completed' if row.result else 'refused'
        row.status=status
    except httpx.TimeoutException:row.status='timeout'
    except httpx.HTTPError:row.status='unavailable'
    except (ValueError,TypeError,KeyError,IndexError):row.status='invalid_response'
    finally:db.execute(update(m.AIGate).where(m.AIGate.id==1).values(busy=False))
    db.commit()
    return generation_dto(row)

@router.post('/ai/lesson-generations/{gid}/draft')
def use_proposal(gid:str,adult=Depends(identity),db:Session=Depends(session,scope='function'),key:str=Header('',alias='Idempotency-Key')):
    row=owned(db,adult,gid)
    if row.status!='completed' or not row.result:raise HTTPException(409,'Esta proposta ainda não está pronta para edição.')
    def action():
        # One proposal creates one draft even with a different retry key.
        db.execute(update(m.LessonGeneration).where(m.LessonGeneration.id==gid).values(status='completed'))
        db.refresh(row)
        if row.content_id:return dto_lesson(db,db.get(m.Content,row.content_id),adult)
        proposal=LessonCommand.model_validate(row.result['lesson'])
        content=m.Content(author_id=adult.id,kind='lesson',title=proposal.title,body=body_for(proposal),status='draft')
        db.add(content);db.flush();capture_revision(db,content,adult)
        row.content_id=content.id;db.flush()
        return dto_lesson(db,content,adult)
    return command(db,adult,key,'generation-draft:'+gid,{},action)
