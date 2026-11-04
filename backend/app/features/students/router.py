import hashlib
import secrets
from datetime import datetime, timedelta, timezone
from fastapi import APIRouter, Depends, Header, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session
from app.core.auth import identity
from app.core.database import session
from app.features import contracts as c
from app.features import models as m
from app.features.learning import dto, grant, command, check_version


router = APIRouter()


@router.get('/students')
def students(adult=Depends(identity), db: Session = Depends(session, scope='function')):
    return [{**dto(s), 'role': g.role} for s, g in db.execute(select(m.Student, m.Grant).join(m.Grant)
            .where(m.Grant.adult_id == adult.id, m.Grant.active == True).order_by(m.Student.name))]


@router.post('/students', status_code=201)
def create_student(body: c.CreateStudent, adult=Depends(identity), db: Session = Depends(session, scope='function'),
                   key: str = Header('', alias='Idempotency-Key')):
    def action():
        student = m.Student(**body.model_dump())
        db.add(student)
        db.flush()
        db.add(m.Grant(student_id=student.id, adult_id=adult.id, role='owner'))
        db.add(m.AuditEvent(student_id=student.id, adult_id=adult.id, action='student.created', resource_id=student.id))
        return {**dto(student), 'role': 'owner'}
    return command(db, adult, key, 'create-student', body.model_dump(), action)


@router.get('/students/{sid}')
def student_detail(sid: str, adult=Depends(identity), db: Session = Depends(session, scope='function')):
    g = grant(db, adult, sid)
    has_assessment = db.scalar(select(m.Assessment.id).where(m.Assessment.student_id == sid).limit(1)) is not None
    return {**dto(db.get(m.Student, sid)), 'role': g.role, 'next_step': 'activity' if has_assessment else 'assessment'}


@router.get('/students/{sid}/grants')
def grants(sid: str, adult=Depends(identity), db: Session = Depends(session, scope='function')):
    grant(db, adult, sid, manage=True)
    return [dto(g) for g in db.scalars(select(m.Grant).where(m.Grant.student_id == sid))]


@router.patch('/students/{sid}/profile')
def update_student(sid: str, body: c.UpdateStudent, adult=Depends(identity), db: Session = Depends(session, scope='function'),
                   key: str = Header('', alias='Idempotency-Key')):
    grant(db, adult, sid, manage=True)
    def action():
        check_version(db, m.Student, sid, body.version)
        row = db.get(m.Student, sid, populate_existing=True)
        row.name, row.birth_date, row.supports = body.name, body.birth_date, body.supports
        db.flush()
        return {**dto(row), 'role': 'owner'}
    return command(db, adult, key, f'student-profile:{sid}', body.model_dump(), action)


@router.post('/students/{sid}/invitations')
def invite(sid: str, body: c.Invite, adult=Depends(identity), db: Session = Depends(session, scope='function'),
           key: str = Header('', alias='Idempotency-Key')):
    grant(db, adult, sid, manage=True)
    def action():
        token = secrets.token_urlsafe(32)
        if not db.get(m.Adult, body.recipient_id) or body.recipient_id == adult.id:
            raise HTTPException(422, 'Destinatário deve ter conta Eleva distinta. Solicite seu identificador de conta.')
        row = m.Invitation(student_id=sid, role=body.role, recipient_id=body.recipient_id, created_by=adult.id,
                           token_hash=hashlib.sha256(token.encode()).hexdigest(),
                           expires_at=(datetime.now(timezone.utc) + timedelta(hours=24)).isoformat())
        db.add(row)
        db.flush()
        return {'id': row.id, 'token': token, 'expires_at': row.expires_at}
    return command(db, adult, key, f'invite:{sid}', body.model_dump(), action)


@router.post('/invitations/accept')
def accept_invite(body: c.AcceptInvite, adult=Depends(identity), db: Session = Depends(session, scope='function'),
                  key: str = Header('', alias='Idempotency-Key')):
    def action():
        inv = db.scalar(select(m.Invitation).where(m.Invitation.token_hash == hashlib.sha256(body.token.encode()).hexdigest()).with_for_update())
        if not inv or inv.expires_at <= m.now() or inv.accepted_by or inv.recipient_id != adult.id:
            raise HTTPException(409, 'Convite inválido, utilizado ou expirado')
        g = db.scalar(select(m.Grant).where(m.Grant.student_id == inv.student_id, m.Grant.adult_id == adult.id))
        if g and g.active:
            raise HTTPException(409, 'Esta conta já possui vínculo')
        if g:
            g.role, g.active, g.can_view_care = inv.role, True, False
        else:
            db.add(m.Grant(student_id=inv.student_id, adult_id=adult.id, role=inv.role))
        inv.accepted_by = adult.id
        db.add(m.AuditEvent(student_id=inv.student_id, adult_id=adult.id, action='invitation.accepted', resource_id=inv.id))
        return {'student_id': inv.student_id}
    return command(db, adult, key, 'accept-invite', body.model_dump(), action)


@router.delete('/students/{sid}/grants/{gid}')
def revoke(sid: str, gid: str, adult=Depends(identity), db: Session = Depends(session, scope='function')):
    grant(db, adult, sid, manage=True)
    row = db.get(m.Grant, gid)
    if not row or row.student_id != sid or row.role == 'owner':
        raise HTTPException(409, 'Vínculo não pode ser revogado por esta operação')
    if row.active:
        row.active = False
        row.can_view_care = False
        db.add(m.AuditEvent(student_id=sid, adult_id=adult.id, action='grant.revoked', resource_id=gid))
    return {'revoked': True}


@router.get('/students/{sid}/audit')
def audit(sid: str, adult=Depends(identity), db: Session = Depends(session, scope='function')):
    grant(db, adult, sid, manage=True)
    return [dto(r) for r in db.scalars(select(m.AuditEvent).where(m.AuditEvent.student_id == sid).order_by(m.AuditEvent.created_at.desc()))]
