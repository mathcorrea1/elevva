from fastapi import APIRouter, Depends, Header, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session
from app.core.auth import identity
from app.core.database import session
from app.features.models import Guidance
from app.features.contracts import GuidanceCommand
from app.features.learning import grant, dto, command

router = APIRouter()


@router.get('/students/{sid}/guidance')
def guidance(sid: str, adult=Depends(identity), db: Session = Depends(session, scope='function')):
    grant(db, adult, sid)
    return [dto(r) for r in db.scalars(select(Guidance).where(Guidance.student_id == sid).order_by(Guidance.created_at.desc()))]


@router.post('/students/{sid}/guidance')
def create_guidance(sid: str, body: GuidanceCommand, adult=Depends(identity), db: Session = Depends(session, scope='function'), key: str = Header('', alias='Idempotency-Key')):
    g = grant(db, adult, sid)
    if g.role != 'teacher' and not (g.role == 'owner' and adult.profession == 'teacher'):
        raise HTTPException(403, 'Autoria de orientação exige vínculo docente')
    def action():
        row = Guidance(student_id=sid, adult_id=adult.id, **body.model_dump())
        db.add(row)
        db.flush()
        return dto(row)
    return command(db, adult, key, f'guidance:{sid}', body.model_dump(), action)
