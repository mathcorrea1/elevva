from fastapi import APIRouter, Depends, Header, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session
from app.core.auth import identity
from app.core.config import settings
from app.core.database import session
from app.features import contracts as c
from app.features import models as m
from app.features.learning import dto, grant, command, check_version, history


router = APIRouter()


@router.post('/students/{sid}/assessments')
def assessment(sid: str, body: c.AssessmentCommand, adult=Depends(identity), db: Session = Depends(session, scope='function'),
               key: str = Header('', alias='Idempotency-Key')):
    grant(db, adult, sid)
    if body.synthetic and settings().eleva_env not in ('development', 'test'):
        raise HTTPException(422, 'Instrumento sintético é exclusivo de teste')
    def action():
        snapshot = None
        instrument = db.get(m.Content, body.instrument)
        if instrument:
            review = db.scalar(select(m.ContentReview).where(m.ContentReview.content_id == instrument.id,
                               m.ContentReview.content_version == instrument.version, m.ContentReview.approved == True))
            if instrument.kind != 'instrument' or instrument.status != 'published' or not review:
                raise HTTPException(409, 'Instrumento ainda não revisado e publicado')
            items = {i['id']: i for i in instrument.body['items']}
            if len({e.item for e in body.evidence}) != len(body.evidence):
                raise HTTPException(422, 'Uma resposta por item do instrumento; registre novas aplicações como outra avaliação')
            if any(e.item not in items or e.response not in items[e.item]['choices'] for e in body.evidence):
                raise HTTPException(422, 'Use IDs e alternativas do instrumento; descrição livre deve ficar nas notas')
            snapshot = {'id': instrument.id, 'version': instrument.version, 'rubric_text': instrument.body['rubric_text'],
                        'items': instrument.body['items'], 'review_id': review.id, 'references': review.references}
        row = m.Assessment(student_id=sid, adult_id=adult.id, instrument_snapshot=snapshot, **body.model_dump())
        db.add(row)
        db.flush()
        return dto(row)
    return command(db, adult, key, f'assess:{sid}', body.model_dump(), action)


@router.post('/students/{sid}/observations')
def observation(sid: str, body: c.ObservationCommand, adult=Depends(identity), db: Session = Depends(session, scope='function'),
                key: str = Header('', alias='Idempotency-Key')):
    grant(db, adult, sid)
    def action():
        row = m.Observation(student_id=sid, adult_id=adult.id,context=body.context,text=body.text,
                            details={'skill':body.skill,'support':body.support,'needs_support':body.needs_support})
        db.add(row)
        db.flush()
        return dto(row)
    return command(db, adult, key, f'observe:{sid}', body.model_dump(), action)


@router.post('/students/{sid}/level-confirmations')
def confirm_level(sid: str, body: c.LevelCommand, adult=Depends(identity), db: Session = Depends(session, scope='function'),
                  key: str = Header('', alias='Idempotency-Key')):
    g = grant(db, adult, sid)
    if g.role != 'teacher' and not (g.role == 'owner' and adult.profession == 'teacher'):
        raise HTTPException(403, 'Confirmação exige vínculo docente explícito')
    def action():
        allowed = {e['id'] for e in history(db, sid)}
        if not set(body.evidence_ids) <= allowed:
            raise HTTPException(422, 'Evidências devem pertencer à criança')
        check_version(db, m.Student, sid, body.version)
        student = db.get(m.Student, sid, populate_existing=True)
        student.confirmed_level = body.level
        row = m.LevelConfirmation(student_id=sid, adult_id=adult.id, level=body.level,
                                  justification=body.justification, evidence_ids=body.evidence_ids)
        db.add(row)
        db.flush()
        return dto(student)
    return command(db, adult, key, f'confirm-level:{sid}', body.model_dump(), action)
