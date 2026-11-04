from datetime import date
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.auth import identity
from app.core.database import session
from app.features.learning import grant, history, report


router = APIRouter()


def period(start, end):
    if start and end and start > end:
        raise HTTPException(422, 'Período inválido')
    return start.isoformat() if start else None, end.isoformat() if end else None


@router.get('/students/{sid}/history')
def student_history(sid: str, adult=Depends(identity), db: Session = Depends(session, scope='function')):
    grant(db, adult, sid)
    return history(db, sid)


@router.get('/students/{sid}/report')
def student_report(sid: str, start: date | None = None, end: date | None = None,
                   adult=Depends(identity), db: Session = Depends(session, scope='function')):
    grant(db, adult, sid)
    return report(db, sid, *period(start, end))
