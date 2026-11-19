from typing import Literal
from fastapi import APIRouter, Depends, Header, HTTPException, Query
from pydantic import Field
from sqlalchemy import select, func
from sqlalchemy.orm import Session
from app.core.auth import identity
from app.core.database import session
from app.features import models as m
from app.features.contracts import Input
from app.features.learning import command
from .access import school_access, rooms_query

router=APIRouter()
class Staff(Input):
    adult_id:str=Field(min_length=1,max_length=128)
    role:Literal['teacher','manager']='teacher'
    active:bool=True
class ClassroomMember(Input):
    adult_id:str=Field(min_length=1,max_length=128)
    active:bool=True

@router.get('/schools/{sid}/staff')
def staff(sid:str,offset:int=Query(0,ge=0),adult=Depends(identity),db:Session=Depends(session,scope='function')):
    school=school_access(db,adult,sid,True)
    query=select(m.SchoolAccess).where(m.SchoolAccess.school_id==sid)
    total=db.scalar(select(func.count()).select_from(query.subquery()))
    rows=db.scalars(query.order_by(m.SchoolAccess.id).offset(offset).limit(20))
    owner=db.get(m.Adult,school.owner_id)
    def entry(row):
        person=db.get(m.Adult,row.adult_id)
        classes=list(db.scalars(select(m.ClassroomStaff.classroom_id).where(m.ClassroomStaff.adult_id==row.adult_id,m.ClassroomStaff.active==True,m.ClassroomStaff.classroom_id.in_(select(m.Classroom.id).where(m.Classroom.school_id==sid)))))
        return {'adult_id':row.adult_id,'display_name':person.display_name,'role':row.role,'active':row.active,'classroom_ids':classes}
    return {'owner':{'adult_id':school.owner_id,'display_name':owner.display_name},'can_promote_manager':school.owner_id==adult.id,'items':[entry(r) for r in rows],'total':total,'next_offset':offset+20 if offset+20<total else None}

@router.post('/schools/{sid}/staff')
def change_staff(sid:str,body:Staff,adult=Depends(identity),db:Session=Depends(session,scope='function'),key:str=Header('',alias='Idempotency-Key')):
    school=school_access(db,adult,sid,True);person=db.get(m.Adult,body.adult_id)
    if not person or person.profession!='teacher' or person.id==school.owner_id:raise HTTPException(422,'Informe outra conta docente. A gestão principal da escola é preservada.')
    row=db.scalar(select(m.SchoolAccess).where(m.SchoolAccess.school_id==sid,m.SchoolAccess.adult_id==body.adult_id))
    if school.owner_id!=adult.id and (body.role=='manager' or row and row.role=='manager'):raise HTTPException(403,'Somente a gestão principal pode alterar outro gestor.')
    def action():
        current=db.scalar(select(m.SchoolAccess).where(m.SchoolAccess.school_id==sid,m.SchoolAccess.adult_id==body.adult_id).with_for_update())
        if not current:current=m.SchoolAccess(school_id=sid,adult_id=body.adult_id);db.add(current)
        current.role,current.active=body.role,body.active
        if not body.active:
            for member in db.scalars(select(m.ClassroomStaff).where(m.ClassroomStaff.adult_id==body.adult_id,m.ClassroomStaff.classroom_id.in_(select(m.Classroom.id).where(m.Classroom.school_id==sid)))):member.active=False
        db.flush();return {'adult_id':current.adult_id,'role':current.role,'active':current.active}
    return command(db,adult,key,'school-staff:'+sid,body.model_dump(),action)

@router.post('/classrooms/{cid}/staff')
def change_classroom_staff(cid:str,body:ClassroomMember,adult=Depends(identity),db:Session=Depends(session,scope='function'),key:str=Header('',alias='Idempotency-Key')):
    room=db.get(m.Classroom,cid)
    if not room:raise HTTPException(404)
    school_access(db,adult,room.school_id,True)
    membership=db.scalar(select(m.SchoolAccess).where(m.SchoolAccess.school_id==room.school_id,m.SchoolAccess.adult_id==body.adult_id,m.SchoolAccess.active==True))
    if not membership:raise HTTPException(422,'Primeiro associe a conta à equipe da escola.')
    def action():
        row=db.scalar(select(m.ClassroomStaff).where(m.ClassroomStaff.classroom_id==cid,m.ClassroomStaff.adult_id==body.adult_id))
        if not row:row=m.ClassroomStaff(classroom_id=cid,adult_id=body.adult_id);db.add(row)
        row.active=body.active;db.flush();return {'classroom_id':cid,'adult_id':body.adult_id,'active':row.active}
    return command(db,adult,key,'classroom-staff:'+cid,body.model_dump(),action)
