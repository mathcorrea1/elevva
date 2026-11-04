from datetime import date
from fastapi import APIRouter, Depends, Header, HTTPException, Query
from sqlalchemy import select,func
from sqlalchemy.orm import Session
from app.core.auth import identity
from app.core.database import session
from app.features import contracts as c
from app.features import models as m
from app.features.learning import dto, grant, command, report


router = APIRouter()


@router.get('/teaching/context')
def context(school_id: str | None = None, classroom_id: str | None = None, search: str = Query('',max_length=120),
            start: date | None = None, end: date | None = None,
            offset:int=Query(0,ge=0),limit:int=Query(20,ge=1,le=50),
            adult=Depends(identity), db: Session = Depends(session, scope='function')):
    if adult.profession != 'teacher':
        raise HTTPException(403)
    dates = period(start, end)
    schools = list(db.scalars(select(m.School).where(m.School.owner_id == adult.id).order_by(m.School.name)))
    if school_id and school_id not in {s.id for s in schools}:
        raise HTTPException(404)
    rooms = list(db.scalars(select(m.Classroom).where(m.Classroom.teacher_id == adult.id,
                    m.Classroom.school_id.in_([school_id] if school_id else [s.id for s in schools])).order_by(m.Classroom.name)))
    if classroom_id and classroom_id not in {r.id for r in rooms}:
        raise HTTPException(404, 'Turma indisponível neste contexto.')
    students = []
    pagination={'total':0,'offset':offset,'next_offset':None}
    summary={'students':0,'pending_assessments':0,'completed_tasks':0,'pending_tasks':0,'pending_followups':0}
    if classroom_id:
        query = select(m.Student).join(m.Enrollment, m.Enrollment.student_id == m.Student.id)
        query=query.join(m.Grant, m.Grant.student_id == m.Student.id).where(m.Enrollment.classroom_id == classroom_id,
                m.Grant.adult_id == adult.id, m.Grant.active == True)
        from app.features.reports.cohort import aggregates
        totals,_,_=aggregates(db,query,*dates)
        ids=query.with_only_columns(m.Student.id)
        summary={'students':totals['students'],'pending_assessments':totals['pending_assessments'],'completed_tasks':totals['completed_tasks'],
            'pending_tasks':db.scalar(select(func.count()).select_from(m.Assignment).where(m.Assignment.student_id.in_(ids),m.Assignment.completed_at.is_(None))),
            'pending_followups':db.scalar(select(func.count()).select_from(m.AttentionFlag).where(m.AttentionFlag.student_id.in_(ids),m.AttentionFlag.resolved_at.is_(None)))}
        if search:query=query.where(m.Student.name.ilike('%'+search.strip()+'%'))
        matching_count=db.scalar(select(func.count()).select_from(query.subquery()))
        pagination={'total':matching_count,'offset':offset,'next_offset':offset+limit if offset+limit<matching_count else None}
        visible=db.scalars(query.order_by(m.Student.name,m.Student.id).offset(offset).limit(limit)).all()
        for student in visible:
            data = report(db, student.id, *dates)
            students.append({**dto(student), 'role': 'teacher',
                'next_step': 'assessment' if not db.scalar(select(m.Assessment.id).where(m.Assessment.student_id == student.id).limit(1)) else 'activity',
                'completed_tasks': data['completed_tasks'], 'assigned_tasks': data['assigned_tasks'],
                'assessments': data['assessments'], 'observations': data['observations'],
                'pending_tasks': len(db.scalars(select(m.Assignment.id).where(m.Assignment.student_id == student.id, m.Assignment.completed_at.is_(None))).all()),
                'pending_followups': len(db.scalars(select(m.AttentionFlag.id).where(m.AttentionFlag.student_id == student.id, m.AttentionFlag.resolved_at.is_(None))).all())})
    # Counts refer to all authorized students in the context, before the text search.
    return {'schools': [dto(s) for s in schools], 'classrooms': [dto(r) for r in rooms],
            'students': students, 'summary': summary,'pagination':pagination, 'period': {'start': dates[0], 'end': dates[1]},
            'note': 'Somente estudantes com vínculo ativo. Matrícula não concede acesso.'}


def period(start, end):
    if start and end and start > end:
        raise HTTPException(422, 'Período inválido')
    return start.isoformat() if start else None, end.isoformat() if end else None


@router.get('/schools')
def schools(adult=Depends(identity), db: Session = Depends(session, scope='function')):
    return [dto(r) for r in db.scalars(select(m.School).where(m.School.owner_id == adult.id))]


@router.post('/schools')
def create_school(body: c.SchoolCommand, adult=Depends(identity), db: Session = Depends(session, scope='function'), key: str = Header('', alias='Idempotency-Key')):
    if adult.profession != 'teacher':
        raise HTTPException(403, 'Gestão de escola exige perfil docente')
    def action():
        row = m.School(owner_id=adult.id, name=body.name)
        db.add(row)
        db.flush()
        return dto(row)
    return command(db, adult, key, 'school', body.model_dump(), action)


@router.get('/classrooms')
def classrooms(adult=Depends(identity), db: Session = Depends(session, scope='function')):
    return [dto(r) for r in db.scalars(select(m.Classroom).where(m.Classroom.teacher_id == adult.id))]


@router.post('/classrooms')
def create_classroom(body: c.ClassroomCommand, adult=Depends(identity), db: Session = Depends(session, scope='function'), key: str = Header('', alias='Idempotency-Key')):
    school = db.get(m.School, body.school_id)
    if not school or school.owner_id != adult.id or adult.profession != 'teacher':
        raise HTTPException(404)
    def action():
        row = m.Classroom(school_id=school.id, teacher_id=adult.id, name=body.name)
        db.add(row)
        db.flush()
        return dto(row)
    return command(db, adult, key, 'classroom', body.model_dump(), action)


@router.post('/classrooms/{cid}/enrollments')
def enroll(cid: str, body: c.EnrollmentCommand, adult=Depends(identity), db: Session = Depends(session, scope='function'), key: str = Header('', alias='Idempotency-Key')):
    room = db.get(m.Classroom, cid)
    if not room or room.teacher_id != adult.id:
        raise HTTPException(404)
    grant(db, adult, body.student_id)
    def action():
        row = db.scalar(select(m.Enrollment).where(m.Enrollment.classroom_id == cid, m.Enrollment.student_id == body.student_id))
        if not row:
            row = m.Enrollment(classroom_id=cid, student_id=body.student_id)
            db.add(row)
            db.flush()
        return dto(row)
    return command(db, adult, key, f'enroll:{cid}', body.model_dump(), action)


@router.get('/classrooms/{cid}/report')
def collective(cid: str, start: date | None = None, end: date | None = None, offset:int=Query(0,ge=0),limit:int=Query(20,ge=1,le=50),adult=Depends(identity), db: Session = Depends(session, scope='function')):
    room = db.get(m.Classroom, cid)
    if not room or room.teacher_id != adult.id:
        raise HTTPException(404)
    query=select(m.Enrollment.student_id).join(m.Grant, m.Grant.student_id == m.Enrollment.student_id).where(m.Enrollment.classroom_id == cid, m.Grant.adult_id == adult.id, m.Grant.active == True)
    total=db.scalar(select(func.count()).select_from(query.subquery()))
    visible=list(db.scalars(query.order_by(m.Enrollment.student_id).offset(offset).limit(limit)))
    from app.features.reports.cohort import aggregates
    totals,_,series=aggregates(db,select(m.Student).where(m.Student.id.in_(query)),*period(start,end))
    profiles=[{**dto(db.get(m.Student,sid)),'role':grant(db,adult,sid).role} for sid in visible]
    return {'classroom': dto(room), 'students': [report(db, sid, *period(start, end)) for sid in visible],
            'student_profiles':profiles,'totals':totals,'series':series,
            'pagination':{'total':total,'offset':offset,'next_offset':offset+limit if offset+limit<total else None},
            'note': 'Detalhes desta página de estudantes com vínculo ativo. Matrícula não concede acesso. O panorama reúne as contagens de todo o filtro.'}
