from fastapi import APIRouter, Depends, Header, HTTPException, Query
from sqlalchemy import select, func
from sqlalchemy.orm import Session
from app.core.auth import identity
from app.core.database import session
from app.features import models as m
from app.features.learning import grant, command, check_version, dto
from app.features.activities.journey import attempt_result
from .contracts import Progress, AnswerDraft, HumanJudgement
from .grading import safe_item, result_for

router = APIRouter()


def payload(db, attempt, include_content=True):
    assignment = db.get(m.Assignment, attempt.assignment_id)
    screens = []
    for source in assignment.snapshot.get('screens', []):
        screen = {k: v for k, v in source.items() if k != 'question'}
        if source.get('question'): screen['item_id'] = source['question']['id']
        screens.append(screen)
    import hashlib
    items=[safe_item(i) for i in assignment.snapshot['items']]
    for item in items:
        key='options' if item.get('kind')=='order' else 'targets' if item.get('kind')=='matching' else None
        if key:item[key]=sorted(item[key],key=lambda o:hashlib.sha256((attempt.id+item['id']+o['id']).encode()).hexdigest())
    result={**dto(attempt,() if include_content else ('interactions',)),
            'interaction_counts':{i['id']:sum(e.get('kind')=='answer' and e.get('item_id')==i['id'] for e in attempt.interactions) for i in assignment.snapshot['items']},
            'lesson_title': assignment.snapshot['title'], 'result': attempt_result(assignment, attempt),
            'item_results': {i['id']: result_for(i, attempt.responses[i['id']], attempt.interactions)
                             for i in assignment.snapshot['items'] if i['id'] in attempt.responses}}
    if include_content:result.update({'items':items,'screens':screens,'instructions':assignment.snapshot.get('instructions','')})
    return result


def active(db, sid, aid, finished=False):
    attempt = db.get(m.Attempt, aid)
    if not attempt or attempt.student_id != sid or (not finished and attempt.status != 'in_progress'):
        raise HTTPException(409, 'Tentativa indisponível para esta operação.')
    return attempt, db.get(m.Assignment, attempt.assignment_id)


@router.get('/students/{sid}/attempts/{aid}')
def get_attempt(sid: str, aid: str, adult=Depends(identity), db: Session = Depends(session, scope='function')):
    grant(db, adult, sid)
    attempt, _ = active(db, sid, aid, True)
    return payload(db, attempt)


@router.post('/students/{sid}/attempts/{aid}/progress')
def progress(sid: str, aid: str, body: Progress, adult=Depends(identity), db: Session = Depends(session, scope='function'), key: str = Header('', alias='Idempotency-Key')):
    grant(db, adult, sid)
    def action():
        attempt, assignment = active(db, sid, aid)
        screens = assignment.snapshot.get('screens', [])
        if body.cursor >= len(screens) or (body.acknowledge_screen and body.acknowledge_screen not in {s['id'] for s in screens}):
            raise HTTPException(422, 'Tela não pertence à versão atribuída.')
        check_version(db, m.Attempt, aid, body.version); db.refresh(attempt)
        attempt.cursor = body.cursor
        if body.acknowledge_screen: attempt.visited = sorted(set(attempt.visited + [body.acknowledge_screen]))
        db.flush()
        return payload(db, attempt,False)
    return command(db, adult, key, 'lesson-progress:'+sid+':'+aid, body.model_dump(), action)


@router.post('/students/{sid}/attempts/{aid}/draft')
def draft(sid: str, aid: str, body: AnswerDraft, adult=Depends(identity), db: Session = Depends(session, scope='function'), key: str = Header('', alias='Idempotency-Key')):
    grant(db, adult, sid)
    def action():
        attempt, assignment = active(db, sid, aid)
        item = next((i for i in assignment.snapshot['items'] if i['id'] == body.item_id), None)
        if not item: raise HTTPException(422, 'Questão indisponível.')
        # Drafts can be incomplete but must remain bounded and contain only authored IDs.
        value = body.value; kind = item.get('kind')
        ids = {o['id'] for o in item.get('options', [])}
        valid = (kind == 'text' and isinstance(value, str) and len(value) <= 200) or \
                (kind == 'single' and (value is None or value in ids if isinstance(value, str) or value is None else False)) or \
                (kind in ('multiple', 'order') and isinstance(value, list) and len(value) <= 12 and all(isinstance(v, str) and v in ids for v in value) and len(set(value)) == len(value)) or \
                (kind == 'matching' and isinstance(value, dict) and len(value) <= 12 and set(value) <= ids and all(isinstance(v, str) and v in {t['id'] for t in item['targets']} for v in value.values()))
        if not valid: raise HTTPException(422, 'Rascunho incompatível com a atividade.')
        check_version(db, m.Attempt, aid, body.version); db.refresh(attempt)
        attempt.drafts = {**attempt.drafts, item['id']: value}
        db.flush(); return payload(db, attempt,False)
    return command(db, adult, key, 'lesson-draft:'+sid+':'+aid, body.model_dump(), action)


@router.post('/students/{sid}/attempts/{aid}/review-answer')
def review(sid: str, aid: str, body: HumanJudgement, adult=Depends(identity), db: Session = Depends(session, scope='function'), key: str = Header('', alias='Idempotency-Key')):
    grant(db, adult, sid)
    if adult.profession != 'teacher': raise HTTPException(403, 'Revisão pedagógica exige docente vinculado.')
    def action():
        attempt, assignment = active(db, sid, aid, True)
        item = next((i for i in assignment.snapshot['items'] if i['id'] == body.item_id), None)
        if not item or item['id'] not in attempt.responses: raise HTTPException(422, 'Resposta indisponível.')
        if item.get('kind') != 'text': raise HTTPException(422, 'Esta revisão se aplica à resposta escrita.')
        value=attempt.responses[item['id']]
        if body.response_event_id:
            event=next((e for e in attempt.interactions if e.get('id')==body.response_event_id and e.get('kind')=='answer' and e.get('item_id')==item['id']),None)
            if not event:raise HTTPException(422,'Interação não pertence a esta questão e tentativa.')
            value=event['response']
        check_version(db, m.Attempt, aid, body.version); db.refresh(attempt)
        attempt.interactions = attempt.interactions + [{'id': m.uid(), 'kind': 'review', 'item_id': item['id'],
            'response': value, 'correct': body.correct, 'note': body.note, 'adult_id': adult.id, 'at': m.now(),'response_event_id':body.response_event_id}]
        if attempt.status == 'finished' and not assignment.completed_at and attempt_result(assignment, attempt)['passed']:
            assignment.completed_at = m.now()
        db.flush(); return payload(db, attempt,False)
    return command(db, adult, key, 'review-answer:'+sid+':'+aid, body.model_dump(), action)


@router.get('/students/{sid}/lesson-assignments')
def assigned_lessons(sid: str, offset: int = Query(0, ge=0), limit: int = Query(20, ge=1, le=50), adult=Depends(identity), db: Session = Depends(session, scope='function')):
    grant(db, adult, sid)
    query = select(m.Assignment).where(m.Assignment.student_id == sid, m.Assignment.content_revision_id.is_not(None))
    total = db.scalar(select(func.count()).select_from(query.subquery()))
    rows = list(db.scalars(query.order_by(m.Assignment.position.desc()).offset(offset).limit(limit)))
    from app.features.activities.journey import journey
    states={t['id']:t for s in journey(db,sid)['stages'] for t in s['tasks']}
    return {'items': [{'id': r.id, 'title': r.snapshot['title'], 'completed_at': r.completed_at,
        'cover': r.snapshot.get('cover'), 'runner': 'screens','locked':states[r.id]['locked'],'state':states[r.id]['state'],'block_reason':states[r.id]['block_reason'],
        'latest_result':states[r.id]['latest_result'],
        'version': r.content_version, 'stage_id': r.stage_id} for r in rows], 'total': total,
        'next_offset': offset+limit if offset+limit < total else None}
