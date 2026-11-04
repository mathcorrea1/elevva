from fastapi import APIRouter, Depends, Header
from sqlalchemy.orm import Session
from sqlalchemy import select
from app.core.auth import identity
from app.core.database import session
from app.features import contracts as c
from app.features import models as m
from app.features.learning import dto, command


router = APIRouter()


@router.post('/feedback')
def feedback(body: c.FeedbackCommand, adult=Depends(identity), db: Session = Depends(session, scope='function'), key: str = Header('', alias='Idempotency-Key')):
    def action():
        row = m.Feedback(adult_id=adult.id, text=body.text)
        db.add(row)
        db.flush()
        return dto(row)
    return command(db, adult, key, 'feedback', body.model_dump(), action)


@router.get('/feedback')
def my_feedback(adult=Depends(identity), db: Session = Depends(session, scope='function')):
    return [dto(r) for r in db.scalars(select(m.Feedback).where(m.Feedback.adult_id == adult.id).order_by(m.Feedback.created_at.desc()))]


@router.get('/me/follow-up')
def followup(adult=Depends(identity), db: Session = Depends(session, scope='function')):
    row = db.scalar(select(m.FollowupEvent).where(m.FollowupEvent.adult_id == adult.id).order_by(m.FollowupEvent.created_at.desc()))
    return dto(row) if row else {'enabled': False, 'notice_version': '2026-10-22-v1', 'created_at': None}


@router.post('/me/follow-up')
def change_followup(body: c.FollowupCommand, adult=Depends(identity), db: Session = Depends(session, scope='function'), key: str = Header('', alias='Idempotency-Key')):
    def action():
        row = m.FollowupEvent(adult_id=adult.id, **body.model_dump())
        db.add(row)
        db.flush()
        return dto(row)
    return command(db, adult, key, 'follow-up', body.model_dump(), action)
