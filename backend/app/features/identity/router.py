from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from app.core.auth import identity, test_token
from app.core.config import settings
from app.core.database import session
from app.features import contracts as c
from app.features import models as m
from app.features.learning import dto


router = APIRouter()


@router.post('/dev/session/{label}')
def dev_session(label: str, request: Request, db: Session = Depends(session, scope='function')):
    if not settings().enable_test_identities or settings().eleva_env not in ('development', 'test'):
        raise HTTPException(404)
    if request.client.host not in ('127.0.0.1', '::1', 'testclient') or label not in ('A', 'B', 'P', 'Q'):
        raise HTTPException(403)
    adult = db.get(m.Adult, 'test-' + label)
    if not adult:
        raise HTTPException(409, 'Execute o seed sintético local primeiro')
    return {'token': test_token(adult.id), 'adult': dto(adult), 'environment': 'isolated-development'}


@router.get('/me')
def me(adult=Depends(identity)):
    return {**dto(adult), 'capabilities': {'review_pedagogy': adult.id in settings().pedagogical_reviewer_subjects.split(',')}}


@router.patch('/me')
def profile(body: c.Profile, adult=Depends(identity), db: Session = Depends(session, scope='function')):
    adult.display_name, adult.profession = body.display_name, body.profession
    db.flush()
    return dto(adult)


@router.put('/me/preferences')
def preferences(body: c.Preferences, adult=Depends(identity)):
    adult.preferences = body.model_dump()
    return adult.preferences
