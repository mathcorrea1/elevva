from fastapi import APIRouter, Depends, Header, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session
from app.core.auth import identity
from app.core.config import settings
from app.core.database import session
from app.features import contracts as c
from app.features import models as m
from app.features.learning import dto, command, check_version


router = APIRouter()


@router.post('/content/{cid}/archive')
def archive(cid: str, body: c.Version, adult=Depends(identity), db: Session = Depends(session, scope='function'),
            key: str = Header('', alias='Idempotency-Key')):
    row = db.get(m.Content, cid)
    if not row or row.author_id != adult.id:
        raise HTTPException(404)
    def action():
        check_version(db, m.Content, cid, body.version)
        db.refresh(row)
        row.archived_at = m.now()
        db.flush()
        return dto(row)
    return command(db, adult, key, 'archive:' + cid, body.model_dump(), action)


@router.post('/content/{cid}/restore')
def restore(cid: str, body: c.Version, adult=Depends(identity), db: Session = Depends(session, scope='function'),
            key: str = Header('', alias='Idempotency-Key')):
    row = db.get(m.Content, cid)
    if not row or row.author_id != adult.id:
        raise HTTPException(404)
    def action():
        check_version(db, m.Content, cid, body.version)
        db.refresh(row)
        row.archived_at = None
        # Restored content must be reviewed for the new version before publication.
        if row.status == 'published':
            row.status = 'draft'
        db.flush()
        return dto(row)
    return command(db, adult, key, 'restore:' + cid, body.model_dump(), action)


def validate_content(body):
    if body.kind != 'guidance' and not body.items:
        raise HTTPException(422, 'Atividade ou instrumento precisa de itens executáveis')
    if body.kind == 'guidance' and body.items:
        raise HTTPException(422, 'Orientação não possui itens de execução')
    if len({i.id for i in body.items}) != len(body.items) or any(i.answer >= len(i.choices) for i in body.items):
        raise HTTPException(422, 'IDs de itens únicos e gabarito válido')


def capture_revision(db, row, adult):
    existing = db.scalar(select(m.ContentRevision).where(
        m.ContentRevision.content_id == row.id, m.ContentRevision.version == row.version))
    if not existing:
        db.add(m.ContentRevision(content_id=row.id, version=row.version, captured_by=adult.id,
                                snapshot={'kind': row.kind, 'title': row.title, 'body': row.body}))
        db.flush()


@router.get('/content')
def content(adult=Depends(identity), db: Session = Depends(session, scope='function')):
    rows = list(db.scalars(select(m.Content).where(
        ((m.Content.status == 'published') | (m.Content.author_id == adult.id) |
        (adult.id in settings().pedagogical_reviewer_subjects.split(',')) |
        ((m.Content.status == 'synthetic') if settings().eleva_env in ('test', 'development') else False)),m.Content.kind != 'lesson')))
    result = []
    for row in rows:
        review = db.scalar(select(m.ContentReview).where(m.ContentReview.content_id == row.id, m.ContentReview.content_version == row.version))
        if not row.archived_at or row.author_id == adult.id:
            result.append({**dto(row), 'review': dto(review) if review else None})
    return result


@router.post('/content')
def create_content(body: c.ContentCommand, adult=Depends(identity), db: Session = Depends(session, scope='function'),
                   key: str = Header('', alias='Idempotency-Key')):
    if adult.profession != 'teacher':
        raise HTTPException(403, 'Autoria exige perfil docente; acesso à criança continua exigindo vínculo')
    validate_content(body)
    def action():
        row = m.Content(author_id=adult.id, kind=body.kind, title=body.title,
                        body={'instructions': body.instructions, 'items': [i.model_dump() for i in body.items], 'rubric_text': body.rubric_text})
        db.add(row)
        db.flush()
        capture_revision(db, row, adult)
        return dto(row)
    return command(db, adult, key, 'create-content', body.model_dump(), action)


@router.post('/content/{cid}/revisions')
def revise_content(cid: str, body: c.ReviseContent, adult=Depends(identity),
                   db: Session = Depends(session, scope='function'), key: str = Header('', alias='Idempotency-Key')):
    row = db.scalar(select(m.Content).where(m.Content.id == cid).with_for_update())
    if not row or row.author_id != adult.id:
        raise HTTPException(404, 'Rascunho indisponível para esta conta')
    validate_content(body)
    def action():
        if row.status != 'draft' or row.archived_at:
            raise HTTPException(409, 'Conteúdo publicado ou sintético não pode ser alterado por este comando')
        if row.kind != body.kind:
            raise HTTPException(422, 'Para mudar o tipo, crie outro conteúdo')
        capture_revision(db, row, adult)
        check_version(db, m.Content, cid, body.version)
        db.refresh(row)
        row.title = body.title
        row.body = {'instructions': body.instructions, 'items': [i.model_dump() for i in body.items],
                    'rubric_text': body.rubric_text}
        db.flush()
        capture_revision(db, row, adult)
        return {**dto(row), 'review': None}
    return command(db, adult, key, 'revise-content:' + cid, body.model_dump(), action)


@router.get('/content/{cid}/revisions')
def revisions(cid: str, adult=Depends(identity), db: Session = Depends(session, scope='function')):
    row = db.get(m.Content, cid)
    if not row or (row.author_id != adult.id and adult.id not in settings().pedagogical_reviewer_subjects.split(',')):
        raise HTTPException(404, 'Histórico de autoria indisponível para esta conta')
    rows = list(db.scalars(select(m.ContentRevision).where(m.ContentRevision.content_id == cid)
                          .order_by(m.ContentRevision.version.desc())))
    result = []
    for revision in rows:
        review = db.scalar(select(m.ContentReview).where(m.ContentReview.content_id == cid,
                                                        m.ContentReview.content_version == revision.version))
        result.append({**dto(revision), 'review': dto(review) if review else None})
    return result


@router.post('/content/{cid}/publish')
def publish(cid: str, body: c.Publish, adult=Depends(identity), db: Session = Depends(session, scope='function')):
    row = db.scalar(select(m.Content).where(m.Content.id == cid).with_for_update())
    if not row or row.author_id != adult.id:
        raise HTTPException(404)
    review = db.scalar(select(m.ContentReview).where(m.ContentReview.content_id == cid,
                       m.ContentReview.content_version == body.version, m.ContentReview.approved == True))
    if row.archived_at or row.version != body.version or not review:
        raise HTTPException(409, 'Publicação exige revisão favorável desta versão por revisor designado (D03)')
    row.status = 'published'
    db.flush()
    return dto(row)


@router.post('/content/{cid}/reviews')
def review_content(cid: str, body: c.ContentReviewCommand, adult=Depends(identity), db: Session = Depends(session, scope='function')):
    if adult.id not in settings().pedagogical_reviewer_subjects.split(','):
        raise HTTPException(403, 'Revisor pedagógico precisa ser designado explicitamente; profissão não basta')
    row = db.scalar(select(m.Content).where(m.Content.id == cid).with_for_update())
    if not row or row.version != body.version:
        raise HTTPException(409, 'Versão indisponível')
    if body.approved and row.kind == 'instrument' and (not row.body.get('rubric_text') or not row.body.get('items')):
        raise HTTPException(422, 'Instrumento exige itens e rubrica explícita antes da revisão favorável')
    existing = db.scalar(select(m.ContentReview).where(m.ContentReview.content_id == cid, m.ContentReview.content_version == body.version))
    if existing:
        if existing.reviewer_id == adult.id and existing.approved == body.approved and existing.note == body.note and existing.references == [r.model_dump() for r in body.references]:
            return dto(existing)
        raise HTTPException(409, 'Revisão desta versão já registrada')
    result = m.ContentReview(content_id=cid, content_version=body.version, reviewer_id=adult.id,
                             approved=body.approved, note=body.note, references=[r.model_dump() for r in body.references])
    db.add(result)
    db.flush()
    return dto(result)
