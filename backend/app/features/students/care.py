from typing import Literal
from fastapi import APIRouter,Depends,Header,HTTPException
from pydantic import Field
from sqlalchemy import update
from sqlalchemy.orm import Session
from app.core.auth import identity
from app.core.database import session
from app.features import models as m
from app.features.contracts import Input
from app.features.learning import grant,command,dto
router=APIRouter()
class Presentation(Input):
    instruction_mode:Literal['standard','concise','audio']='standard'
    prefer_linear:bool=False
    font_scale:Literal[1,1.25,1.5]=1
class Characteristics(Input):
    reported_conditions:list[Literal['tea','tdah','dislexia','other']]=Field(default_factory=list,max_length=4)
    disabilities:list[Literal['intellectual','visual','hearing','motor','other']]=Field(default_factory=list,max_length=5)
    communication:list[Literal['limited_oral','nonverbal','alternative','other']]=Field(default_factory=list,max_length=4)
    pedagogical_supports:list[Literal['short_instructions','visual_support','extra_time','alternative_input','guided_reading','other']]=Field(default_factory=list,max_length=6)
    additional:str=Field(default='',max_length=1000)
    source:str=Field(default='',max_length=200)
class CareCommand(Input):
    version:int=Field(ge=0)
    communication:str=Field(default='',max_length=1000)
    sensitive_notes:str=Field(default='',max_length=1500)
    presentation:Presentation=Field(default_factory=Presentation)
    characteristics:Characteristics=Field(default_factory=Characteristics)
class CarePermission(Input):
    allowed:bool

@router.get('/students/{sid}/care')
def get_care(sid:str,adult=Depends(identity),db:Session=Depends(session,scope='function')):
    g=grant(db,adult,sid);row=db.get(m.StudentCare,sid)
    permitted=g.role=='owner' or g.can_view_care
    public={'presentation':row.presentation if row else Presentation().model_dump(),'version':row.version if row else 0,'can_view_sensitive':permitted,'can_edit':g.role=='owner'}
    if permitted and row:return {**public,**dto(row)}
    return public

@router.post('/students/{sid}/care')
def save_care(sid:str,body:CareCommand,adult=Depends(identity),db:Session=Depends(session,scope='function'),key:str=Header('',alias='Idempotency-Key')):
    grant(db,adult,sid,manage=True)
    def action():
        row=db.get(m.StudentCare,sid)
        if row:
            changed=db.execute(update(m.StudentCare).where(m.StudentCare.student_id==sid,m.StudentCare.version==body.version).values(version=body.version+1))
            if changed.rowcount!=1:raise HTTPException(409,'Informações alteradas. Recarregue antes de salvar.')
            db.refresh(row)
        else:
            if body.version!=0:raise HTTPException(409)
            row=m.StudentCare(student_id=sid,author_id=adult.id);db.add(row)
        row.communication,row.sensitive_notes,row.presentation=body.communication,body.sensitive_notes,body.presentation.model_dump()
        row.characteristics=body.characteristics.model_dump()
        row.author_id,row.updated_at=adult.id,m.now();db.flush()
        # Sensitive text is not copied into broad audit logs or AI snapshots.
        db.add(m.AuditEvent(student_id=sid,adult_id=adult.id,action='care.updated',resource_id=sid))
        return {'student_id':sid,'version':row.version,'updated_at':row.updated_at}
    return command(db,adult,key,'care:'+sid,body.model_dump(),action)

@router.post('/students/{sid}/grants/{gid}/care-permission')
def permission(sid:str,gid:str,body:CarePermission,adult=Depends(identity),db:Session=Depends(session,scope='function'),key:str=Header('',alias='Idempotency-Key')):
    grant(db,adult,sid,manage=True);row=db.get(m.Grant,gid)
    if not row or row.student_id!=sid or not row.active or row.role=='owner':raise HTTPException(404)
    def action():
        row.can_view_care=body.allowed;db.flush()
        db.add(m.AuditEvent(student_id=sid,adult_id=adult.id,action='care.permission.changed',resource_id=gid))
        return {'grant_id':gid,'can_view_care':row.can_view_care}
    return command(db,adult,key,'care-permission:'+gid,body.model_dump(),action)
