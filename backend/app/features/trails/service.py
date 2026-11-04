from fastapi import HTTPException
from sqlalchemy import select,func,or_
from app.core.json_queries import values,key
from app.core.config import settings
from app.features import models as m
from app.features.learning import dto
from .contracts import TrailCommand

def visible(row,adult):
    return row.author_id==adult.id or (not row.archived_at and (row.status=='published' or (row.status=='synthetic' and settings().eleva_env in ('test','development'))))

def catalog_query(db,adult):
    source=func.json_extract(m.TrailDefinition.body,'$.lessons') if db.bind.dialect.name=='sqlite' else m.TrailDefinition.body['lessons']
    lesson=values(db,source,'trail_lesson');revision_id=key(db,lesson.c.value,'lesson_revision_id')
    shared=select(m.ContentShare.id).where(m.ContentShare.revision_id==m.ContentRevision.id,m.ContentShare.recipient_id==adult.id,m.ContentShare.status=='accepted').correlate(m.ContentRevision).exists()
    public=(m.ContentRevision.publication_status=='published') & (m.ContentRevision.snapshot['body']['visibility'].as_string()=='public')
    authorized=select(m.ContentRevision.id).join(m.Content,m.Content.id==m.ContentRevision.content_id).where(m.ContentRevision.id==revision_id,or_(m.Content.author_id==adult.id,shared,public)).correlate(lesson).exists()
    forbidden=select(lesson.c.value).where(revision_id.is_not(None),~authorized).correlate(m.TrailDefinition).exists()
    statuses=['published']+(['synthetic'] if settings().eleva_env in ('test','development') else [])
    return select(m.TrailDefinition).where(or_(m.TrailDefinition.author_id==adult.id,(m.TrailDefinition.archived_at.is_(None)&m.TrailDefinition.status.in_(statuses)&~forbidden)))

def validate_image(db,ref,adult):
    if ref and ref.asset_id:
        asset=db.get(m.MediaAsset,ref.asset_id)
        if not asset or asset.owner_id!=adult.id:raise HTTPException(422,'Imagem indisponível para este autor.')

def build(db,body:TrailCommand,adult):
    if len({l.key for l in body.lessons})!=len(body.lessons):raise HTTPException(422,'Aulas devem ter identificadores distintos.')
    if body.status=='synthetic' and settings().eleva_env not in ('test','development'):raise HTTPException(422,'Demonstração sintética indisponível neste ambiente.')
    if body.status=='published' and any(l.advance_percent is not None for l in body.lessons):raise HTTPException(409,'Critério adicional de acertos aguarda revisão pedagógica específica. Teste técnico somente em demonstração sintética.')
    validate_image(db,body.cover,adult)
    lessons=[]
    for lesson in body.lessons:
        contents=[]
        if lesson.lesson_revision_id:
            from app.features.lessons.service import lesson_access
            revision=db.get(m.ContentRevision,lesson.lesson_revision_id)
            content=db.get(m.Content,revision.content_id) if revision else None
            if not revision or not content or content.archived_at:raise HTTPException(422,'Versão da aula indisponível.')
            lesson_access(db,adult,content,revision)
            if lesson.image and lesson.image.asset_id:
                from app.features.trails.media import references
                asset=db.get(m.MediaAsset,lesson.image.asset_id)
                if not asset or (asset.owner_id!=adult.id and not references(revision.snapshot,asset.id)):raise HTTPException(422,'Imagem fora da versão autorizada de origem.')
            if body.status!='draft' and revision.publication_status not in (['published','synthetic'] if body.status=='synthetic' else ['published']):raise HTTPException(409,'Disponibilize a versão da aula antes de publicar a trilha.')
            lessons.append({**lesson.model_dump(exclude={'items','content_ids'}),'contents':[]})
            continue
        elif lesson.items:
            validate_image(db,lesson.image,adult)
            content=m.Content(author_id=adult.id,kind='activity',title=lesson.title,
                status='synthetic' if body.status=='synthetic' else 'draft',body={'instructions':lesson.instructions,'items':[i.model_dump() for i in lesson.items],'rubric_text':None})
            db.add(content);db.flush();contents=[content]
            db.add(m.ContentRevision(content_id=content.id,version=1,captured_by=adult.id,snapshot={'kind':content.kind,'title':content.title,'body':content.body}))
        else:
            validate_image(db,lesson.image,adult)
            for cid in lesson.content_ids:
                content=db.get(m.Content,cid)
                allowed=content and content.kind=='activity' and not content.archived_at and (content.author_id==adult.id or content.status=='published' or (content.status=='synthetic' and settings().eleva_env in ('test','development')))
                if not allowed:raise HTTPException(422,'Atividade indisponível para esta aula.')
                if not content.body.get('items') or not any(i.get('required',True) for i in content.body['items']):raise HTTPException(422,'Aula exige itens executáveis e pelo menos uma questão obrigatória.')
                contents.append(content)
        if body.status=='published' and any(c.status!='published' for c in contents):raise HTTPException(409,'Publicação exige conteúdos publicados após revisão. Exemplos não são aprovação pedagógica.')
        if body.status=='synthetic' and any(c.status not in ('synthetic','published') for c in contents):raise HTTPException(422,'Demonstração usa somente conteúdo sintético ou publicado.')
        lessons.append({**lesson.model_dump(exclude={'items','content_ids'}),'contents':[{'id':c.id,'version':c.version,'title':c.title,**c.body} for c in contents]})
    return {'cover':body.cover.model_dump() if body.cover else None,'scenario':body.scenario,'availability':body.availability,'lessons':lessons}

def snapshot(row):return {'id':row.id,'title':row.title,'description':row.description,'version':row.version,'status':row.status,**row.body}

def enroll(db,sid,trail,adult):
    existing=db.scalar(select(m.TrailEnrollment).where(m.TrailEnrollment.student_id==sid,m.TrailEnrollment.trail_id==trail.id,m.TrailEnrollment.trail_version==trail.version))
    if existing:return existing
    db.scalar(select(m.Student).where(m.Student.id==sid).with_for_update())
    for lesson in trail.body['lessons']:
        if lesson.get('lesson_revision_id'):
            from app.features.lessons.service import lesson_access
            revision=db.get(m.ContentRevision,lesson['lesson_revision_id'])
            if not revision:raise HTTPException(409,'Versão da aula indisponível.')
            lesson_access(db,adult,db.get(m.Content,revision.content_id),revision)
            continue
        for content in lesson['contents']:
            current=db.get(m.Content,content['id'])
            if not current or current.archived_at or current.version!=content['version'] or current.status not in ('published','synthetic'):
                raise HTTPException(409,'Uma atividade da trilha mudou ou foi arquivada. O autor precisa preparar uma versão atual; percursos já atribuídos são preservados.')
    row=m.TrailEnrollment(student_id=sid,trail_id=trail.id,trail_version=trail.version,snapshot=snapshot(trail),created_by=adult.id)
    db.add(row);db.flush()
    position=db.scalar(select(func.max(m.Assignment.position)).where(m.Assignment.student_id==sid)) or 0
    for lesson in trail.body['lessons']:
        stage=m.LearningStage(student_id=sid,title=lesson['title'],description=lesson['objective'],created_by=adult.id,enrollment_id=row.id,lesson_snapshot={k:v for k,v in lesson.items() if k!='contents'},lesson_revision_id=lesson.get('lesson_revision_id'))
        db.add(stage);db.flush()
        if lesson.get('lesson_revision_id'):
            revision=db.get(m.ContentRevision,lesson['lesson_revision_id']);position+=1
            db.add(m.Assignment(student_id=sid,stage_id=stage.id,content_id=revision.content_id,content_version=revision.version,content_revision_id=revision.id,snapshot={},position=position,created_by=adult.id))
            continue
        for content in lesson['contents']:
            position+=1
            db.add(m.Assignment(student_id=sid,stage_id=stage.id,content_id=content['id'],content_version=content['version'],snapshot={**content,'advance_percent':lesson.get('advance_percent')},position=position,created_by=adult.id))
    db.flush();return row
