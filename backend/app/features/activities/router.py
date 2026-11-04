from fastapi import APIRouter, Depends, Header, HTTPException
from sqlalchemy import select, func
from sqlalchemy.orm import Session
from app.core.auth import identity
from app.core.config import settings
from app.core.database import session
from app.features import contracts as c
from app.features import models as m
from app.features.learning import dto, grant, command, check_version


router = APIRouter()


@router.get('/students/{sid}/assignments')
def assignments(sid: str, adult=Depends(identity), db: Session = Depends(session, scope='function')):
    grant(db, adult, sid)
    rows = list(db.scalars(select(m.Assignment).where(m.Assignment.student_id == sid).order_by(m.Assignment.position)))
    from app.features.activities.journey import journey
    states={t['id']:t for s in journey(db,sid)['stages'] for t in s['tasks']}
    output = []
    for row in rows:
        output.append({**dto(row, ('snapshot',)), 'title': row.snapshot['title'], 'locked': states[row.id]['locked']})
    return output


@router.post('/students/{sid}/assignments')
def assign(sid: str, body: c.Assign, adult=Depends(identity), db: Session = Depends(session, scope='function'),
           key: str = Header('', alias='Idempotency-Key')):
    grant(db, adult, sid)
    def action():
        student = db.scalar(select(m.Student).where(m.Student.id == sid).with_for_update())
        content = db.get(m.Content, body.content_id)
        if not content or content.archived_at or content.kind != 'activity' or content.status not in ('published', 'synthetic'):
            raise HTTPException(422, 'Escolha atividade publicada ou exemplo sintético de desenvolvimento')
        if content.status == 'synthetic' and settings().eleva_env not in ('test', 'development'):
            raise HTTPException(422)
        position = db.scalar(select(func.max(m.Assignment.position)).where(m.Assignment.student_id == student.id)) or 0
        row = m.Assignment(student_id=sid, content_id=content.id, content_version=content.version,
                           snapshot={'title': content.title, **content.body}, position=position + 1, created_by=adult.id)
        db.add(row)
        db.flush()
        return dto(row, ('snapshot',))
    return command(db, adult, key, f'assign:{sid}', body.model_dump(), action)


@router.post('/students/{sid}/assignments/{aid}/start')
def start(sid: str, aid: str, adult=Depends(identity), db: Session = Depends(session, scope='function'),
          key: str = Header('', alias='Idempotency-Key')):
    grant(db, adult, sid)
    def action():
        if not db.scalar(select(m.Assessment.id).where(m.Assessment.student_id == sid).limit(1)):
            raise HTTPException(409, 'Registre a avaliação inicial antes de iniciar a trilha. Não é necessário inventar um nível.')
        row = db.scalar(select(m.Assignment).where(m.Assignment.id == aid, m.Assignment.student_id == sid).with_for_update())
        if not row or row.completed_at:
            raise HTTPException(409, 'Tarefa indisponível ou já concluída')
        from app.features.activities.journey import journey
        stage = db.get(m.LearningStage,row.stage_id) if row.stage_id else None
        scope=stage.enrollment_id if stage else None
        path=journey(db,sid,scope)
        task=next(t for s in path['stages'] for t in s['tasks'] if t['id']==aid)
        if task['locked']:raise HTTPException(409,task['block_reason'])
        attempt = db.scalar(select(m.Attempt).where(m.Attempt.assignment_id == aid, m.Attempt.status == 'in_progress'))
        if not attempt:
            if db.scalar(select(m.Attempt.id).where(m.Attempt.assignment_id==aid,m.Attempt.status=='finished').limit(1)):
                raise HTTPException(409,'Use Nova tentativa para responder novamente. A entrega anterior será preservada.')
            attempt = m.Attempt(assignment_id=aid, student_id=sid, adult_id=adult.id)
            db.add(attempt)
            db.flush()
        from app.features.lessons.player import payload
        return payload(db,attempt)
    return command(db, adult, key, f'start:{sid}:{aid}', {}, action)


@router.post('/students/{sid}/attempts/{aid}/responses')
def response(sid: str, aid: str, body: c.ResponseCommand, adult=Depends(identity), db: Session = Depends(session, scope='function'),
             key: str = Header('', alias='Idempotency-Key')):
    grant(db, adult, sid)
    def action():
        attempt = db.get(m.Attempt, aid)
        if not attempt or attempt.student_id != sid or attempt.status != 'in_progress':
            raise HTTPException(409, 'Tentativa indisponível')
        assignment = db.get(m.Assignment, attempt.assignment_id)
        item = next((v for v in assignment.snapshot['items'] if v['id'] == body.item_id), None)
        if not item:
            raise HTTPException(422, 'Resposta inválida')
        from app.features.lessons.grading import validate_response,grade
        value=body.choice if body.choice is not None else body.value
        validate_response(item,value)
        feedback=None
        if item.get('kind'):
            events=[e for e in attempt.interactions if e.get('kind')=='answer' and e.get('item_id')==item['id']]
            maximum=item.get('max_attempts') or 100
            if events and (not item.get('allow_retry',True) or len(events)>=maximum):raise HTTPException(409,'As tentativas configuradas para esta questão foram utilizadas. A entrega anterior foi preservada.')
            feedback=grade(item,value)
        check_version(db, m.Attempt, aid, body.version)
        db.refresh(attempt)
        attempt.responses = {**attempt.responses, body.item_id: value}
        attempt.drafts={k:v for k,v in attempt.drafts.items() if k!=item['id']}
        if feedback:attempt.interactions=attempt.interactions+[{'id':m.uid(),'kind':'answer','item_id':item['id'],'response':value,**feedback,'at':m.now(),'adult_id':adult.id,'supports_used':body.supports_used}]
        attempt.supports_used = sorted(set(attempt.supports_used + body.supports_used))
        db.flush()
        from app.features.lessons.player import payload
        return {**payload(db,attempt,False),**({'feedback':feedback} if feedback else {})}
    return command(db, adult, key, f'response:{sid}:{aid}', body.model_dump(), action)


@router.post('/students/{sid}/attempts/{aid}/finish')
def finish(sid: str, aid: str, body: c.Version, adult=Depends(identity), db: Session = Depends(session, scope='function'),
           key: str = Header('', alias='Idempotency-Key')):
    grant(db, adult, sid)
    def action():
        attempt = db.get(m.Attempt, aid)
        if not attempt or attempt.student_id != sid or attempt.status != 'in_progress':
            raise HTTPException(409, 'Tentativa indisponível')
        assignment = db.get(m.Assignment, attempt.assignment_id)
        if any(i['id'] not in attempt.responses for i in assignment.snapshot['items'] if i.get('required',True)):
            raise HTTPException(422, 'Responda todos os itens antes de concluir')
        if any(s['id'] not in attempt.visited for s in assignment.snapshot.get('screens',[]) if s['type'] not in ('activity','completion')):
            raise HTTPException(422,'Percorra as telas da aula antes de entregar. Vídeo pode ser acompanhado pela alternativa textual; não é exigido tempo de exibição.')
        from app.features.activities.journey import journey
        before = {a['id'] for a in journey(db, sid)['achievements']}
        check_version(db, m.Attempt, aid, body.version)
        db.refresh(attempt)
        attempt.status, attempt.finished_at = 'finished', m.now()
        from app.features.activities.journey import attempt_result
        result=attempt_result(assignment,attempt)
        if result['passed'] and not assignment.completed_at:assignment.completed_at = attempt.finished_at
        db.flush()
        path = journey(db, sid)
        stage = next(s for s in path['stages'] if any(t['id'] == assignment.id for t in s['tasks']))
        from app.features.lessons.player import payload
        return {**payload(db,attempt,False), 'result':result,'feedback': {'stage_completed': stage['state'] == 'completed',
                'stage_title': stage['title'], 'completed_tasks': path['completed_tasks'],
                'new_achievements': [a for a in path['achievements'] if a['id'] not in before]}}
    return command(db, adult, key, f'finish:{sid}:{aid}', body.model_dump(), action)


@router.post('/students/{sid}/assignments/{aid}/retry')
def retry(sid:str,aid:str,adult=Depends(identity),db:Session=Depends(session,scope='function'),key:str=Header('',alias='Idempotency-Key')):
    grant(db,adult,sid)
    def action():
        row=db.scalar(select(m.Assignment).where(m.Assignment.id==aid,m.Assignment.student_id==sid).with_for_update())
        if not row or row.completed_at:raise HTTPException(409,'Esta tarefa já foi concluída ou está indisponível. Para prática posterior, faça uma nova atribuição.')
        previous=db.scalar(select(m.Attempt).where(m.Attempt.assignment_id==aid,m.Attempt.status=='finished').order_by(m.Attempt.finished_at.desc(),m.Attempt.id.desc()).limit(1))
        if not previous:raise HTTPException(409,'Não há entrega anterior para repetir.')
        from app.features.activities.journey import attempt_result
        if row.snapshot.get('require_review_for_advance') and attempt_result(row,previous)['pending_review']:raise HTTPException(409,'A entrega está salva e aguarda revisão docente. Não é necessário refazer a aula para aguardar.')
        existing=db.scalar(select(m.Attempt).where(m.Attempt.assignment_id==aid,m.Attempt.status=='in_progress'))
        attempt=existing or m.Attempt(assignment_id=aid,student_id=sid,adult_id=adult.id)
        if not existing:db.add(attempt);db.flush()
        from app.features.lessons.player import payload
        return payload(db,attempt)
    return command(db,adult,key,'retry:'+sid+':'+aid,{},action)
