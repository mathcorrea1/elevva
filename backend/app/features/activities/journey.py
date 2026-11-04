from fastapi import APIRouter, Depends, Header, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy import select, func
from sqlalchemy.orm import Session
from app.core.auth import identity
from app.core.database import session
from app.core.config import settings
from app.features import models as m
from app.features.learning import grant, command

router = APIRouter()


def journey(db, sid, enrollment_id=None):
    rows = list(db.scalars(select(m.Assignment).where(m.Assignment.student_id == sid).order_by(m.Assignment.position)))
    started = set(db.scalars(select(m.Attempt.assignment_id).where(m.Attempt.student_id == sid, m.Attempt.status == 'in_progress')))
    assessed = bool(db.scalar(select(m.Assessment.id).where(m.Assessment.student_id == sid).limit(1)))
    groups = {}
    blocked_scopes = {}
    blocked_lessons = {}
    for row in rows:
        stage = db.get(m.LearningStage, row.stage_id) if row.stage_id else None
        scope = (stage.enrollment_id or ('lesson:'+stage.id if stage.lesson_revision_id else None)) if stage else None
        if enrollment_id is not None and scope != (None if enrollment_id=='legacy' else enrollment_id):
            continue
        enrollment = db.get(m.TrailEnrollment,scope) if scope and not scope.startswith('lesson:') else None
        sequential = not enrollment or enrollment.snapshot.get('availability','sequential')=='sequential'
        blocked = not assessed or blocked_lessons.get(stage.id if stage else row.id,False) or (blocked_scopes.get(scope,False) if sequential else False)
        key = stage.id if stage else 'legacy:' + row.id
        group = groups.setdefault(key, {'id': key, 'title': stage.title if stage else row.snapshot['title'],
                                       'description': stage.description if stage else 'Uma atividade para seguir aprendendo.',
                                       'enrollment_id':scope,'lesson':stage.lesson_snapshot if stage else {},'tasks': []})
        attempts=list(db.scalars(select(m.Attempt).where(m.Attempt.assignment_id==row.id).order_by(m.Attempt.created_at)))
        delivered=[a for a in attempts if a.status=='finished']
        latest=delivered[-1] if delivered else None
        state = 'completed' if row.completed_at else 'locked' if blocked else 'in_progress' if row.id in started else 'available'
        group['tasks'].append({'id': row.id, 'title': row.snapshot['title'], 'locked': state == 'locked',
                               'completed_at': row.completed_at, 'state': state,
                               'instructions': row.snapshot.get('instructions', ''),
                               'item_count': len(row.snapshot.get('items', [])),
                               'runner':'screens' if row.snapshot.get('screens') else 'choices',
                               'attempt_count':len(delivered),'latest_result':attempt_result(row,latest) if latest else None,
                               'supports_used':latest.supports_used if latest else [],
                               'block_reason': ('Registre a avaliação inicial.' if not assessed else 'Conclua a atividade anterior.') if state == 'locked' else None})
        if not row.completed_at:
            blocked_scopes[scope] = True
            blocked_lessons[stage.id if stage else row.id] = True
    stages = list(groups.values())
    for stage in stages:
        stage['completed'] = sum(t['state'] == 'completed' for t in stage['tasks'])
        stage['total'] = len(stage['tasks'])
        stage['state'] = ('completed' if stage['completed'] == stage['total'] else
                          'in_progress' if stage['completed'] or any(t['state'] == 'in_progress' for t in stage['tasks']) else
                          'available' if any(t['state'] == 'available' for t in stage['tasks']) else 'locked')
    visible_tasks=[t for s in stages for t in s['tasks']]
    completed = sum(bool(t['completed_at']) for t in visible_tasks)
    achieved = []
    if completed:
        achieved.append({'id': 'first-task', 'title': 'Primeira descoberta', 'description': 'Uma atividade concluída e salva.'})
    if any(s['state'] == 'completed' for s in stages):
        achieved.append({'id': 'first-stage', 'title': 'Um caminho completo', 'description': 'Todas as atividades de uma etapa concluídas.'})
    if completed >= 5:
        achieved.append({'id': 'five-tasks', 'title': 'Cinco descobertas', 'description': 'Cinco atividades concluídas e salvas.'})
    return {'stages': stages, 'completed_tasks': completed, 'total_tasks': len(visible_tasks),
            'achievements': achieved, 'assessment_required': not assessed,
            'note': 'Conquistas registram participação; não classificam alfabetização.'}


def attempt_result(assignment,attempt):
    items=assignment.snapshot.get('items',[])
    from app.features.lessons.grading import result_for
    answered=[i for i in items if i['id'] in attempt.responses]
    outcomes={i['id']:result_for(i,attempt.responses[i['id']],attempt.interactions) for i in answered}
    required=[i for i in items if i.get('required',True)]
    correct=sum(outcomes[i['id']]['correct'] is True for i in answered)
    pending=sum(outcomes[i['id']]['needs_review'] for i in answered)
    required_correct=sum(outcomes.get(i['id'],{}).get('correct') is True for i in required)
    percent=assignment.snapshot.get('advance_percent')
    passed=all(i['id'] in attempt.responses for i in required) and (percent is None or required_correct*100>=percent*len(required))
    if pending and assignment.snapshot.get('require_review_for_advance'):passed=False
    return {'correct':correct,'valid_items':sum(not o['needs_review'] for o in outcomes.values()),'pending_review':pending,'total_items':len(items),'required_items':len(required),
            'required_answered':sum(i['id'] in attempt.responses for i in required),'advance_percent':percent,'passed':passed,
            'scale':None,'note':'Acertos objetivos desta versão; não são nível de alfabetização. Sem nota consolidada entre conteúdos incompatíveis.'}


@router.get('/students/{sid}/journey')
def get_journey(sid: str, legacy:bool=False, adult=Depends(identity), db: Session = Depends(session, scope='function')):
    grant(db, adult, sid)
    return journey(db, sid,'legacy' if legacy else None)


class StageCommand(BaseModel):
    model_config = {'str_strip_whitespace': True}
    title: str = Field(min_length=2, max_length=120)
    description: str = Field(default='', max_length=500)
    content_ids: list[str] = Field(min_length=1, max_length=6)


@router.post('/students/{sid}/stages')
def create_stage(sid: str, body: StageCommand, adult=Depends(identity), db: Session = Depends(session, scope='function'),
                 key: str = Header('', alias='Idempotency-Key')):
    grant(db, adult, sid)
    def action():
        db.scalar(select(m.Student).where(m.Student.id == sid).with_for_update())
        if len(set(body.content_ids)) != len(body.content_ids):
            raise HTTPException(422, 'Escolha atividades distintas para esta etapa.')
        contents = [db.get(m.Content, cid) for cid in body.content_ids]
        for content in contents:
            if not content or content.archived_at or content.kind != 'activity' or content.status not in ('published', 'synthetic'):
                raise HTTPException(422, 'Atividade indisponível para atribuição.')
            if content.status == 'synthetic' and settings().eleva_env not in ('test', 'development'):
                raise HTTPException(422)
        stage = m.LearningStage(student_id=sid, title=body.title.strip(), description=body.description.strip(), created_by=adult.id)
        db.add(stage)
        db.flush()
        position = db.scalar(select(func.max(m.Assignment.position)).where(m.Assignment.student_id == sid)) or 0
        for offset, content in enumerate(contents, 1):
            db.add(m.Assignment(student_id=sid, content_id=content.id, content_version=content.version,
                    stage_id=stage.id, snapshot={'title': content.title, **content.body},
                    position=position + offset, created_by=adult.id))
        db.flush()
        return {'id': stage.id, 'title': stage.title}
    return command(db, adult, key, 'stage:' + sid, body.model_dump(), action)
