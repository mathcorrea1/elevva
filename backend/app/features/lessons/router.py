from fastapi import APIRouter,Depends,Header,HTTPException,Query
from sqlalchemy import select,func,or_
from sqlalchemy.orm import Session
from app.core.auth import identity
from app.core.database import session
from app.core.config import settings
from app.features import models as m
from app.features.learning import command,check_version,dto,grant
from app.features.contracts import Version
from app.features.catalog.router import capture_revision
from .contracts import LessonCommand,LessonEdit,Share,BulkAssign
from .service import revision_for,lesson_access,body_for,dto_lesson,assign_revision,validate_media
from pydantic import ValidationError
from app.features.levels import LiteracyLevel
from app.core.validation import describe
router=APIRouter()

def teacher(adult):
    if adult.profession!='teacher':raise HTTPException(403,'Biblioteca e autoria exigem contexto docente; dados de estudantes continuam exigindo vínculo.')

@router.get('/lessons')
def library(scope:str='mine',q:str=Query('',max_length=120),offset:int=Query(0,ge=0),limit:int=Query(20,ge=1,le=50),level:LiteracyLevel|None=None,adult=Depends(identity),db:Session=Depends(session,scope='function')):
    teacher(adult)
    if scope not in ('mine','shared','received','public'):raise HTTPException(422)
    query=select(m.Content).where(m.Content.kind=='lesson',m.Content.archived_at.is_(None))
    if scope in ('shared','received'):
        shared_query=select(m.ContentShare).join(m.Content,m.Content.id==m.ContentShare.content_id).where(m.Content.kind=='lesson',m.Content.archived_at.is_(None),m.ContentShare.recipient_id==adult.id,m.ContentShare.status==('pending' if scope=='received' else 'accepted'))
        if q:shared_query=shared_query.where(m.Content.title.ilike('%'+q.strip()+'%'))
        if level:shared_query=shared_query.join(m.ContentRevision,m.ContentRevision.id==m.ContentShare.revision_id).where(m.ContentRevision.snapshot['body']['literacy_level'].as_string()==level)
        total=db.scalar(select(func.count()).select_from(shared_query.subquery()));shares=db.scalars(shared_query.order_by(m.ContentShare.created_at,m.ContentShare.id).offset(offset).limit(limit))
        items=[]
        for share in shares:
            row=db.get(m.Content,share.content_id);revision=db.get(m.ContentRevision,share.revision_id)
            if scope=='received':
                author=db.get(m.Adult,row.author_id)
                items.append({'id':row.id,'title':revision.snapshot['title'],'version':revision.version,'revision_id':revision.id,'share_id':share.id,'author_id':row.author_id,'author_name':author.display_name if author else 'Autor indisponível','description':'Convite de conteúdo. Aceitar não compartilha estudantes ou relatórios.'})
            else:items.append({**dto_lesson(db,row,adult,revision,True),'share_id':share.id})
        return {'items':items,'total':total,'offset':offset,'next_offset':offset+limit if offset+limit<total else None}
    if scope=='mine':query=query.where(m.Content.author_id==adult.id)
    elif scope=='public':query=query.where(m.Content.status=='published',m.Content.body['visibility'].as_string()=='public')
    if q:query=query.where(m.Content.title.ilike('%'+q.strip()+'%'))
    if level:query=query.where(m.Content.body['literacy_level'].as_string()==level)
    total=db.scalar(select(func.count()).select_from(query.subquery()))
    rows=list(db.scalars(query.order_by(m.Content.title,m.Content.id).offset(offset).limit(limit)).unique())
    items=[dto_lesson(db,row,adult,summary=True) for row in rows]
    return {'items':items,'total':total,'offset':offset,'next_offset':offset+limit if offset+limit<total else None}

@router.post('/lessons')
def create(body:LessonCommand,adult=Depends(identity),db:Session=Depends(session,scope='function'),key:str=Header('',alias='Idempotency-Key')):
    teacher(adult)
    def action():
        value=body_for(body);validate_media(db,value,adult)
        row=m.Content(author_id=adult.id,kind='lesson',title=body.title,body=value,status='draft');db.add(row);db.flush();capture_revision(db,row,adult)
        return dto_lesson(db,row,adult)
    return command(db,adult,key,'create-lesson',body.model_dump(),action)

@router.get('/lessons/{lid}')
def detail(lid:str,revision_id:str|None=None,adult=Depends(identity),db:Session=Depends(session,scope='function')):
    teacher(adult);row=db.get(m.Content,lid);revision=db.get(m.ContentRevision,revision_id) if revision_id else None
    if revision_id and not revision:raise HTTPException(404)
    if revision and revision.content_id!=lid:raise HTTPException(404)
    return dto_lesson(db,row,adult,revision)

@router.post('/lessons/{lid}/revisions')
def revise(lid:str,body:LessonEdit,adult=Depends(identity),db:Session=Depends(session,scope='function'),key:str=Header('',alias='Idempotency-Key')):
    teacher(adult);row=db.get(m.Content,lid)
    if not row or row.kind!='lesson' or row.author_id!=adult.id:raise HTTPException(404)
    def action():
        value=body_for(body);validate_media(db,value,adult,row if row.origin_content_id else None)
        if row.origin_content_id:value['origin_license']=row.body.get('origin_license',{'redistribute':False})
        if row.archived_at:raise HTTPException(409,'Aula arquivada.')
        check_version(db,m.Content,lid,body.version);db.refresh(row);row.title,row.body,row.status=body.title,value,'draft'
        db.flush();capture_revision(db,row,adult);return dto_lesson(db,row,adult)
    return command(db,adult,key,'revise-lesson:'+lid,body.model_dump(),action)

@router.post('/lessons/{lid}/publish')
def publish(lid:str,body:Version,synthetic:bool=False,adult=Depends(identity),db:Session=Depends(session,scope='function'),key:str=Header('',alias='Idempotency-Key')):
    teacher(adult);row=db.get(m.Content,lid)
    if not row or row.kind!='lesson' or row.author_id!=adult.id:raise HTTPException(404)
    def action():
        if row.version!=body.version or row.archived_at:raise HTTPException(409,'Versão indisponível.')
        try:LessonCommand.model_validate({'title':row.title,**{k:v for k,v in row.body.items() if k in LessonCommand.model_fields}})
        except ValidationError as e:
            errors=[describe(error) for error in e.errors()[:4]]
            raise HTTPException(422,'Complete a aula antes de disponibilizar: '+'; '.join(errors))
        if row.origin_content_id and row.body.get('visibility')=='public' and not row.body.get('origin_license',{}).get('redistribute'):raise HTTPException(403,'A cópia foi autorizada para personalização e uso, sem publicação pública.')
        if synthetic:
            if settings().eleva_env not in ('test','development'):raise HTTPException(403)
            row.status='synthetic'
        else:
            review=db.scalar(select(m.ContentReview).where(m.ContentReview.content_id==lid,m.ContentReview.content_version==body.version,m.ContentReview.approved==True))
            if not review:raise HTTPException(409,'Publicação aguarda revisão pedagógica favorável desta versão (D03).')
            if any(s['type'] in ('video','text_video') and not s.get('media_reviewed') for s in row.body['screens']):raise HTTPException(409,'Revise direitos, público, legendas e alternativa textual dos vídeos antes da publicação.')
            row.status='published'
        revision=revision_for(db,row);revision.publication_status=row.status
        db.flush();return dto_lesson(db,row,adult)
    return command(db,adult,key,'publish-lesson:'+lid,{'version':body.version,'synthetic':synthetic},action)

@router.post('/lessons/{lid}/copy')
def copy(lid:str,body:Version,adult=Depends(identity),db:Session=Depends(session,scope='function'),key:str=Header('',alias='Idempotency-Key')):
    teacher(adult);source=db.get(m.Content,lid);revision=db.scalar(select(m.ContentRevision).where(m.ContentRevision.content_id==lid,m.ContentRevision.version==body.version))
    if not source or not revision:raise HTTPException(404)
    revision,share=lesson_access(db,adult,source,revision)
    if share and not share.can_copy:raise HTTPException(403,'O autor não concedeu cópia para personalização.')
    def action():
        redistribute=source.body.get('origin_license',{}).get('redistribute',False) if source.origin_content_id else not share or share.can_redistribute
        row=m.Content(author_id=adult.id,kind='lesson',title=revision.snapshot['title'][:110]+' · cópia',body={**revision.snapshot['body'],'visibility':'private','origin_license':{'redistribute':redistribute,'source_revision_id':revision.id}},status='draft',origin_content_id=lid,origin_version=body.version)
        db.add(row);db.flush();capture_revision(db,row,adult);return dto_lesson(db,row,adult)
    return command(db,adult,key,'copy-lesson:'+lid,body.model_dump(),action)

@router.post('/lessons/{lid}/shares')
def share(lid:str,body:Share,adult=Depends(identity),db:Session=Depends(session,scope='function'),key:str=Header('',alias='Idempotency-Key')):
    teacher(adult);source=db.get(m.Content,lid);revision=db.get(m.ContentRevision,body.revision_id)
    if not revision or revision.content_id!=lid:raise HTTPException(404)
    revision,permission=lesson_access(db,adult,source,revision)
    if source.origin_content_id and not source.body.get('origin_license',{}).get('redistribute'):raise HTTPException(403,'A origem desta cópia não permite redistribuição.')
    if permission and not permission.can_redistribute:raise HTTPException(403,'Redistribuição não autorizada pelo autor.')
    recipient=db.get(m.Adult,body.recipient_id)
    if not recipient or recipient.profession!='teacher' or recipient.id==adult.id:raise HTTPException(422,'Informe identificador de outra conta docente.')
    if revision.publication_status=='draft':raise HTTPException(409,'Compartilhe uma versão publicada ou disponibilizada como demonstração técnica.')
    def action():
        exists=db.scalar(select(m.ContentShare).where(m.ContentShare.revision_id==revision.id,m.ContentShare.recipient_id==recipient.id))
        if exists:raise HTTPException(409,'Versão já enviada a esse destinatário.')
        row=m.ContentShare(content_id=lid,revision_id=revision.id,created_by=adult.id,recipient_id=recipient.id,can_copy=body.can_copy,can_redistribute=body.can_redistribute);db.add(row);db.flush();return dto(row)
    return command(db,adult,key,'share-lesson:'+lid,body.model_dump(),action)

@router.get('/lessons/{lid}/shares')
def outgoing(lid:str,offset:int=Query(0,ge=0),limit:int=Query(20,ge=1,le=50),adult=Depends(identity),db:Session=Depends(session,scope='function')):
    teacher(adult);row=db.get(m.Content,lid)
    if not row or row.author_id!=adult.id:
        if not db.scalar(select(m.ContentShare.id).where(m.ContentShare.content_id==lid,m.ContentShare.created_by==adult.id).limit(1)):raise HTTPException(404)
    query=select(m.ContentShare).where(m.ContentShare.content_id==lid,m.ContentShare.created_by==adult.id)
    total=db.scalar(select(func.count()).select_from(query.subquery()))
    rows=db.scalars(query.order_by(m.ContentShare.created_at,m.ContentShare.id).offset(offset).limit(limit))
    items=[]
    for share in rows:
        recipient=db.get(m.Adult,share.recipient_id)
        items.append({**dto(share),'recipient_name':recipient.display_name if recipient else 'Conta indisponível'})
    return {'items':items,'total':total,'next_offset':offset+limit if offset+limit<total else None}

@router.post('/lesson-shares/{share_id}/accept')
def accept(share_id:str,adult=Depends(identity),db:Session=Depends(session,scope='function'),key:str=Header('',alias='Idempotency-Key')):
    teacher(adult);row=db.get(m.ContentShare,share_id)
    if not row or row.recipient_id!=adult.id:raise HTTPException(404)
    def action():
        if row.status=='revoked':raise HTTPException(409,'Compartilhamento revogado.')
        row.status='accepted';db.flush();return dto(row)
    return command(db,adult,key,'accept-lesson-share:'+share_id,{},action)

@router.post('/lesson-shares/{share_id}/revoke')
def revoke(share_id:str,adult=Depends(identity),db:Session=Depends(session,scope='function'),key:str=Header('',alias='Idempotency-Key')):
    row=db.get(m.ContentShare,share_id)
    if not row or row.created_by!=adult.id:raise HTTPException(404)
    def action():row.status='revoked';db.flush();return {'id':row.id,'status':row.status}
    return command(db,adult,key,'revoke-lesson-share:'+share_id,{},action)

@router.post('/lessons/{lid}/assign')
def distribute(lid:str,body:BulkAssign,adult=Depends(identity),db:Session=Depends(session,scope='function'),key:str=Header('',alias='Idempotency-Key')):
    teacher(adult);row=db.get(m.Content,lid);revision=db.get(m.ContentRevision,body.revision_id)
    if not revision or revision.content_id!=lid:raise HTTPException(404)
    lesson_access(db,adult,row,revision)
    def action():
        from app.features.classrooms.recipients import recipients
        ids=recipients(db,adult,body.student_ids,body.classroom_ids,body.school_ids)
        batch=m.LessonAssignmentBatch(adult_id=adult.id,revision_id=revision.id);db.add(batch);db.flush()
        tasks=[assign_revision(db,adult,sid,revision,batch.id) for sid in sorted(ids)]
        return {'batch_id':batch.id,'assigned':len(tasks),'tasks':[{'id':t.id,'student_id':t.student_id,'title':t.snapshot['title'],'locked':False,'completed_at':None,'runner':'screens'} for t in tasks]}
    return command(db,adult,key,'assign-lesson:'+lid,body.model_dump(),action)
