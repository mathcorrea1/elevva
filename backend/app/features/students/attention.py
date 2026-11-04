from fastapi import APIRouter, Depends, Header, HTTPException
from sqlalchemy import select, update
from sqlalchemy.orm import Session
from app.core.auth import identity
from app.core.database import session
from app.features.models import AttentionFlag, now
from app.features.contracts import AttentionCommand
from app.features.learning import dto, grant, command

router = APIRouter()


@router.get('/students/{sid}/attention')
def flags(sid: str, adult=Depends(identity), db: Session = Depends(session, scope='function')):
    grant(db, adult, sid)
    return [dto(r) for r in db.scalars(select(AttentionFlag).where(AttentionFlag.student_id == sid).order_by(AttentionFlag.created_at.desc()))]


@router.post('/students/{sid}/attention')
def add_flag(sid: str, body: AttentionCommand, adult=Depends(identity), db: Session = Depends(session, scope='function'), key: str = Header('', alias='Idempotency-Key')):
    grant(db, adult, sid)
    def action():
        row = AttentionFlag(student_id=sid, adult_id=adult.id, reason=body.reason)
        db.add(row)
        db.flush()
        return dto(row)
    return command(db, adult, key, f'attention:{sid}', body.model_dump(), action)


@router.post('/students/{sid}/attention/{fid}/resolve')
def resolve(sid: str, fid: str, adult=Depends(identity), db: Session = Depends(session, scope='function')):
    grant(db, adult, sid)
    row = db.get(AttentionFlag, fid)
    if not row or row.student_id != sid:
        raise HTTPException(404)
    if not row.resolved_at:
        db.execute(update(AttentionFlag).where(AttentionFlag.id == fid, AttentionFlag.resolved_at.is_(None))
                   .values(resolved_at=now(), resolved_by=adult.id))
        db.refresh(row)
    return dto(row)
