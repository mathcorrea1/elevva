from fastapi import HTTPException
from sqlalchemy import select,func
from app.features import models as m
from app.core.config import settings
from app.features.learning import grant
from .contracts import LessonCommand

def revision_for(db,content):
    return db.scalar(select(m.ContentRevision).where(m.ContentRevision.content_id==content.id,m.ContentRevision.version==content.version))

def lesson_access(db,adult,content,revision=None):
    if not content or content.kind!='lesson':raise HTTPException(404,'Aula indisponível.')
    revision=revision or revision_for(db,content)
    if not revision:raise HTTPException(409,'Aula sem versão preservada.')
    if content.author_id==adult.id:return revision,None
    share=db.scalar(select(m.ContentShare).where(m.ContentShare.revision_id==revision.id,m.ContentShare.recipient_id==adult.id,m.ContentShare.status=='accepted'))
    if share:return revision,share
    if revision.publication_status=='published' and revision.snapshot['body'].get('visibility')=='public' and not content.archived_at:return revision,None
    raise HTTPException(404,'Aula não compartilhada com esta conta.')

def validate_media(db,body,adult,source_content=None):
    def visit(value):
        if isinstance(value,dict):
            if value.get('asset_id'):
                asset=db.get(m.MediaAsset,value['asset_id'])
                if not asset:raise HTTPException(422,'Imagem indisponível.')
                if asset.owner_id!=adult.id:
                    from app.features.trails.media import references
                    if not source_content or not references(source_content.body,value['asset_id']):raise HTTPException(422,'Imagem não pertence ao autor nem à versão autorizada de origem.')
            for v in value.values():visit(v)
        elif isinstance(value,list):
            for v in value:visit(v)
    visit(body)

def body_for(command:LessonCommand):
    data=command.model_dump();data.pop('title')
    data['items']=[s.question.model_dump() for s in command.screens if s.question]
    data['instructions']=command.objective
    data['activity_kinds']=sorted({q['kind'] for q in data['items']})
    data['schema_version']='lesson-screens-v1'
    return data

def dto_lesson(db,row,adult,revision=None,summary=False):
    revision,share=lesson_access(db,adult,row,revision)
    body=revision.snapshot['body']
    author=db.get(m.Adult,row.author_id)
    result={'id':row.id,'title':revision.snapshot['title'],'version':revision.version,'revision_id':revision.id,'status':revision.publication_status,'author_id':row.author_id,'author_name':author.display_name if author else 'Autor indisponível',
        'origin_content_id':row.origin_content_id,'origin_version':row.origin_version,'archived_at':row.archived_at,
        'description':body.get('description',''),'cover':body.get('cover'),'screen_count':len(body.get('screens',[])),'activity_kinds':body.get('activity_kinds',[]),
        'permissions':{'edit':row.author_id==adult.id,'copy':row.author_id==adult.id or not share or share.can_copy,'redistribute':(row.author_id==adult.id or not share or share.can_redistribute) and (not row.origin_content_id or row.body.get('origin_license',{}).get('redistribute',False))}}
    if not summary:result['body']=body
    return result

def assign_revision(db,adult,sid,revision,batch=None):
    grant(db,adult,sid)
    content=db.get(m.Content,revision.content_id);lesson_access(db,adult,content,revision)
    if content.archived_at:raise HTTPException(409,'Aula arquivada, sem novas atribuições.')
    if revision.publication_status!='published' and not(revision.publication_status=='synthetic' and settings().eleva_env in ('test','development')):raise HTTPException(409,'Aula ainda é rascunho. Publique após revisão ou disponibilize demonstração técnica.')
    db.scalar(select(m.Student).where(m.Student.id==sid).with_for_update())
    # Compact stage summary; the complete objective remains in the immutable revision/player.
    stage=m.LearningStage(student_id=sid,title=revision.snapshot['title'],description=revision.snapshot['body'].get('objective','')[:500],created_by=adult.id,lesson_revision_id=revision.id,lesson_snapshot={'image':revision.snapshot['body'].get('cover'),'source':'lesson-library','batch_id':batch})
    db.add(stage);db.flush()
    position=(db.scalar(select(func.max(m.Assignment.position)).where(m.Assignment.student_id==sid)) or 0)+1
    task=m.Assignment(student_id=sid,content_id=content.id,content_version=revision.version,content_revision_id=revision.id,snapshot={},stage_id=stage.id,position=position,created_by=adult.id)
    db.add(task);db.flush();return task
