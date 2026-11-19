from fastapi import APIRouter,Depends,Header,HTTPException,Query
from sqlalchemy import select,func
from sqlalchemy.orm import Session
from app.core.auth import identity
from app.core.database import session
from app.core.config import settings
from app.features import models as m
from app.features.learning import command,check_version,dto,grant
from app.features.contracts import Version
from app.features.activities.journey import journey
from .contracts import TrailCommand,TrailEdit,Enroll,BulkTrail
from .service import visible,build,snapshot,enroll,catalog_query
from app.features.levels import LiteracyLevel
router=APIRouter()

@router.post('/trails/{tid}/assign')
def assign_trail(tid:str,body:BulkTrail,adult=Depends(identity),db:Session=Depends(session,scope='function'),key:str=Header('',alias='Idempotency-Key')):
    if adult.profession!='teacher':raise HTTPException(403)
    row=db.scalar(catalog_query(db,adult).where(m.TrailDefinition.id==tid))
    if not row or row.archived_at or row.version!=body.version:raise HTTPException(404)
    if row.status!='published' and not(row.status=='synthetic' and settings().eleva_env in ('test','development')):raise HTTPException(409,'Trilha ainda não disponível para atribuição.')
    def action():
        from app.features.classrooms.recipients import recipients
        ids=recipients(db,adult,body.student_ids,body.classroom_ids,body.school_ids)
        paths=[enroll(db,sid,row,adult) for sid in ids]
        return {'assigned':len(paths),'enrollment_ids':[p.id for p in paths],'trail_id':row.id,'version':row.version}
    return command(db,adult,key,'assign-trail:'+tid,body.model_dump(),action)

@router.get('/trails')
def catalog(adult=Depends(identity),db:Session=Depends(session,scope='function')):
    return [{**snapshot(t),'author_id':t.author_id,'archived_at':t.archived_at} for t in db.scalars(catalog_query(db,adult).order_by(m.TrailDefinition.created_at))]

@router.get('/trails-page')
def catalog_page(q:str=Query('',max_length=120),offset:int=Query(0,ge=0),limit:int=Query(12,ge=1,le=50),level:LiteracyLevel|None=None,adult=Depends(identity),db:Session=Depends(session,scope='function')):
    query=catalog_query(db,adult).where(m.TrailDefinition.archived_at.is_(None))
    if q:query=query.where(m.TrailDefinition.title.ilike('%'+q.strip()+'%'))
    if level:query=query.where(m.TrailDefinition.body['literacy_level'].as_string()==level)
    total=db.scalar(select(func.count()).select_from(query.subquery()))
    rows=db.scalars(query.order_by(m.TrailDefinition.created_at,m.TrailDefinition.id).offset(offset).limit(limit))
    return {'items':[{'id':t.id,'title':t.title,'description':t.description,'version':t.version,'status':t.status,'author_id':t.author_id,'cover':t.body.get('cover'),'scenario':t.body.get('scenario','garden'),'lesson_count':len(t.body['lessons'])} for t in rows],
            'total':total,'offset':offset,'next_offset':offset+limit if offset+limit<total else None}

@router.post('/trails')
def create(body:TrailCommand,adult=Depends(identity),db:Session=Depends(session,scope='function'),key:str=Header('',alias='Idempotency-Key')):
    if adult.profession!='teacher':raise HTTPException(403)
    def action():
        row=m.TrailDefinition(author_id=adult.id,title=body.title,description=body.description,status=body.status,body=build(db,body,adult))
        db.add(row);db.flush();db.add(m.TrailRevision(trail_id=row.id,version=row.version,snapshot=snapshot(row)));db.flush();return snapshot(row)
    return command(db,adult,key,'create-trail',body.model_dump(),action)

@router.get('/trails/{tid}')
def detail(tid:str,adult=Depends(identity),db:Session=Depends(session,scope='function')):
    row=db.scalar(catalog_query(db,adult).where(m.TrailDefinition.id==tid))
    if not row:raise HTTPException(404)
    return {**snapshot(row),'author_id':row.author_id,'archived_at':row.archived_at}

@router.post('/trails/{tid}/revisions')
def revise(tid:str,body:TrailEdit,adult=Depends(identity),db:Session=Depends(session,scope='function'),key:str=Header('',alias='Idempotency-Key')):
    row=db.get(m.TrailDefinition,tid)
    if not row or row.author_id!=adult.id:raise HTTPException(404)
    def action():
        if row.archived_at:raise HTTPException(409,'Restaure antes de editar.')
        value=build(db,body,adult);check_version(db,m.TrailDefinition,tid,body.version);db.refresh(row)
        row.title,row.description,row.body,row.status=body.title,body.description,value,body.status
        db.flush();db.add(m.TrailRevision(trail_id=tid,version=row.version,snapshot=snapshot(row)));db.flush();return snapshot(row)
    return command(db,adult,key,'revise-trail:'+tid,body.model_dump(),action)

@router.post('/trails/{tid}/archive')
def archive(tid:str,body:Version,adult=Depends(identity),db:Session=Depends(session,scope='function'),key:str=Header('',alias='Idempotency-Key')):
    row=db.get(m.TrailDefinition,tid)
    if not row or row.author_id!=adult.id:raise HTTPException(404)
    def action():
        check_version(db,m.TrailDefinition,tid,body.version);db.refresh(row);row.archived_at=m.now();db.flush();return {'id':tid,'archived_at':row.archived_at,'version':row.version}
    return command(db,adult,key,'archive-trail:'+tid,body.model_dump(),action)

@router.get('/students/{sid}/trails')
def student_trails(sid:str,adult=Depends(identity),db:Session=Depends(session,scope='function')):
    grant(db,adult,sid)
    result=[]
    for row in db.scalars(select(m.TrailEnrollment).where(m.TrailEnrollment.student_id==sid).order_by(m.TrailEnrollment.created_at)):
        path=journey(db,sid,row.id)
        result.append({'id':row.id,'trail_id':row.trail_id,'version':row.trail_version,'title':row.snapshot['title'],'description':row.snapshot['description'],'cover':row.snapshot.get('cover'),'status':row.snapshot['status'],
            'completed_lessons':sum(s['state']=='completed' for s in path['stages']),'total_lessons':len(path['stages']),'completed_tasks':path['completed_tasks'],'total_tasks':path['total_tasks']})
    return result

@router.post('/students/{sid}/trails')
def add(sid:str,body:Enroll,adult=Depends(identity),db:Session=Depends(session,scope='function'),key:str=Header('',alias='Idempotency-Key')):
    grant(db,adult,sid)
    def action():
        row=db.scalar(catalog_query(db,adult).where(m.TrailDefinition.id==body.trail_id))
        if not row or row.archived_at or row.version!=body.version:raise HTTPException(409,'Versão da trilha indisponível.')
        if row.status!='published' and not(row.status=='synthetic' and settings().eleva_env in ('test','development')):raise HTTPException(409,'Trilha aguarda revisão e publicação.')
        value=enroll(db,sid,row,adult);return {'id':value.id,'student_id':sid,'trail_id':row.id}
    return command(db,adult,key,'enroll-trail:'+sid,body.model_dump(),action)

@router.get('/students/{sid}/trails/{eid}')
def map_detail(sid:str,eid:str,adult=Depends(identity),db:Session=Depends(session,scope='function')):
    grant(db,adult,sid);row=db.get(m.TrailEnrollment,eid)
    if not row or row.student_id!=sid:raise HTTPException(404)
    return {**row.snapshot,'enrollment_id':row.id,'journey':journey(db,sid,eid)}
