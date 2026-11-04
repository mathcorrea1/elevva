import hashlib
import json
from datetime import datetime
from zoneinfo import ZoneInfo
from fastapi import HTTPException
from sqlalchemy import select, update
from sqlalchemy.exc import IntegrityError
from app.features.models import Grant, Command, Student, Assessment, Observation, Attempt, Assignment, LevelConfirmation


def dto(row, exclude=()):
    return {c.name: (getattr(row, c.name).isoformat() if hasattr(getattr(row, c.name), 'isoformat') else getattr(row, c.name))
            for c in row.__table__.columns if c.name not in exclude}


def grant(db, adult, student_id, manage=False):
    record = db.scalar(select(Grant).where(Grant.student_id == student_id, Grant.adult_id == adult.id, Grant.active == True))
    if not record or (manage and record.role != 'owner'):
        raise HTTPException(404, 'Recurso indisponível para esta conta')
    return record


def command(db, adult, key, route, payload, action):
    if not key or len(key) > 100:
        raise HTTPException(400, 'Idempotency-Key obrigatório, até 100 caracteres')
    fingerprint = hashlib.sha256(json.dumps([route, payload], sort_keys=True, ensure_ascii=False, default=str).encode()).hexdigest()
    existing = db.scalar(select(Command).where(Command.adult_id == adult.id, Command.key == key))
    if existing:
        if existing.fingerprint != fingerprint:
            raise HTTPException(409, 'Chave já usada por outro comando')
        return existing.response
    try:
        with db.begin_nested():
            marker = Command(adult_id=adult.id, key=key, fingerprint=fingerprint, response={})
            db.add(marker)
            db.flush()  # Unique reservation before applying effects, also for concurrent retries.
            response = action()
            db.flush()
            marker.response = response
        return response
    except IntegrityError:
        existing = db.scalar(select(Command).where(Command.adult_id == adult.id, Command.key == key))
        if existing and existing.fingerprint == fingerprint:
            return existing.response
        raise HTTPException(409, 'Conflito de gravação; atualize e tente novamente')


def check_version(db, model, record_id, version):
    result = db.execute(update(model).where(model.id == record_id, model.version == version)
                        .values(version=version + 1).execution_options(synchronize_session=False))
    if result.rowcount != 1:
        raise HTTPException(409, 'Dados alterados; recarregue antes de salvar')


def history(db, student_id):
    events = []
    for model, kind in [(Assessment, 'assessment'), (Observation, 'observation'), (Attempt, 'attempt'), (LevelConfirmation, 'level_confirmation')]:
        for row in db.scalars(select(model).where(model.student_id == student_id)):
            events.append({'kind': kind, **dto(row)})
    return sorted(events, key=lambda v: v['created_at'], reverse=True)


def report(db, student_id, start=None, end=None):
    def in_period(timestamp):
        day = datetime.fromisoformat(timestamp).astimezone(ZoneInfo('America/Sao_Paulo')).date().isoformat()
        return (not start or day >= start) and (not end or day <= end)
    events = [e for e in history(db, student_id) if in_period(
        e['finished_at'] if e['kind'] == 'attempt' and e.get('finished_at') else e['created_at'])]
    tasks = list(db.scalars(select(Assignment).where(Assignment.student_id == student_id)))
    attempts = [e for e in events if e['kind'] == 'attempt' and e['status'] == 'finished']
    groups = {}
    first_attempts={}
    for a in db.scalars(select(Attempt).where(Attempt.student_id==student_id,Attempt.status=='finished').order_by(Attempt.finished_at,Attempt.id)):
        first_attempts.setdefault(a.assignment_id,a.id)
    series = {}
    for event in events:
        if event['kind'] == 'attempt' and event['status'] != 'finished':
            continue
        timestamp = event.get('finished_at') or event['created_at']
        day = datetime.fromisoformat(timestamp).astimezone(ZoneInfo('America/Sao_Paulo')).date().isoformat()
        point = series.setdefault(day, {'day': day, 'activities': 0, 'assessments': 0, 'observations': 0})
        field = {'attempt': 'activities', 'assessment': 'assessments', 'observation': 'observations'}.get(event['kind'])
        if field:
            point[field] += 1
    for attempt in attempts:
        if first_attempts[attempt['assignment_id']]!=attempt['id']:continue
        assignment = db.get(Assignment, attempt['assignment_id'])
        for item in assignment.snapshot.get('items', []):
            if item['id'] in attempt['responses']:
                from app.features.lessons.grading import comparison_result
                first_event=next((e for e in attempt.get('interactions',[]) if e.get('kind')=='answer' and e.get('item_id')==item['id']),None)
                supports=sorted(first_event.get('supports_used',attempt.get('supports_used',[])) if first_event else attempt.get('supports_used',[]))
                key=assignment.content_id+':'+str(assignment.content_version)+':'+json.dumps(supports)
                group=groups.setdefault(key,{'content_id':assignment.content_id,'version':assignment.content_version,'title':assignment.snapshot['title'],
                    'supports_used':supports,'attempt_policy':'first_confirmation_in_first_submission' if item.get('kind') else 'first_submission_per_assignment','responses':0,'correct':0})
                _,outcome=comparison_result(item,attempt)
                group.setdefault('pending_review',0)
                if outcome['needs_review']:group['pending_review']+=1
                else:
                    group['responses'] += 1
                    group['correct'] += int(outcome['correct'])
    from app.features.activities.journey import journey
    path = journey(db, student_id)
    completed_stages = [s for s in path['stages'] if s['state'] == 'completed' and
                        in_period(max(t['completed_at'] for t in s['tasks']))]
    courses={}
    for stage in path['stages']:
        if stage.get('enrollment_id'):courses.setdefault(stage['enrollment_id'],[]).append(stage)
    completed_courses=[stages for stages in courses.values() if all(s['state']=='completed' for s in stages) and in_period(max(t['completed_at'] for s in stages for t in s['tasks']))]
    return {'student_id': student_id, 'confirmed_level': db.get(Student, student_id).confirmed_level,
            'series': sorted(series.values(), key=lambda p: p['day']),
            'completed_stages': len(completed_stages), 'total_stages': len(path['stages']),
            'completed_trails':len(completed_courses),'total_trails':len(courses),
            'achievements': path['achievements'],
            'period': {'start': start, 'end': end, 'timezone': 'America/Sao_Paulo'}, 'assigned_tasks': len(tasks),
            'completed_tasks': sum(bool(t.completed_at) and in_period(t.completed_at) for t in tasks),
            'finished_attempts': len(attempts), 'observations': sum(e['kind'] == 'observation' for e in events),
            'assessments': sum(e['kind'] == 'assessment' for e in events), 'comparable_results': list(groups.values()),
            'events': events, 'limitations': ['Contagens de registros; não representam percentual de alfabetização.',
                                              'Classificação pedagógica depende de instrumento e revisão (D03).']}
