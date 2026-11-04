from fastapi import APIRouter, Depends, Header, Query,HTTPException
from pydantic import Field
from sqlalchemy import select, func
from sqlalchemy.orm import Session
from app.core.auth import identity
from app.core.database import session
from app.features import models as m
from app.features.contracts import CreateStudent
from app.features.learning import command, dto
from .care import Characteristics, Presentation

router=APIRouter()
class Registration(CreateStudent):
    characteristics:Characteristics=Field(default_factory=Characteristics)
    presentation:Presentation=Field(default_factory=Presentation)
    classroom_id:str|None=None

@router.get('/students-page')
def page(q:str=Query('',max_length=120),classroom_id:str|None=None,offset:int=Query(0,ge=0),limit:int=Query(20,ge=1,le=50),adult=Depends(identity),db:Session=Depends(session,scope='function')):
    query=select(m.Student,m.Grant).join(m.Grant,m.Grant.student_id==m.Student.id).where(m.Grant.adult_id==adult.id,m.Grant.active==True)
    if classroom_id:
        room=db.get(m.Classroom,classroom_id)
        if not room or room.teacher_id!=adult.id or adult.profession!='teacher':raise HTTPException(404)
        query=query.where(select(m.Enrollment.id).where(m.Enrollment.student_id==m.Student.id,m.Enrollment.classroom_id==classroom_id).exists())
    if q:query=query.where(m.Student.name.ilike('%'+q.strip()+'%'))
    total=db.scalar(select(func.count()).select_from(query.subquery()))
    rows=db.execute(query.order_by(m.Student.name,m.Student.id).offset(offset).limit(limit)).all()
    return {'items':[{**dto(s),'role':g.role,'next_step':'activity' if db.scalar(select(m.Assessment.id).where(m.Assessment.student_id==s.id).limit(1)) else 'assessment'} for s,g in rows],
            'total':total,'offset':offset,'next_offset':offset+limit if offset+limit<total else None}

@router.post('/students/register',status_code=201)
def register(body:Registration,adult=Depends(identity),db:Session=Depends(session,scope='function'),key:str=Header('',alias='Idempotency-Key')):
    def action():
        if body.classroom_id:
            room=db.get(m.Classroom,body.classroom_id)
            if not room or room.teacher_id!=adult.id or adult.profession!='teacher':raise HTTPException(404,'Turma indisponível para esta conta.')
        row=m.Student(**body.model_dump(exclude={'characteristics','presentation','classroom_id'}));db.add(row);db.flush()
        db.add(m.Grant(student_id=row.id,adult_id=adult.id,role='owner'))
        db.add(m.StudentCare(student_id=row.id,author_id=adult.id,characteristics=body.characteristics.model_dump(),presentation=body.presentation.model_dump()))
        if body.classroom_id:db.add(m.Enrollment(classroom_id=body.classroom_id,student_id=row.id))
        db.add(m.AuditEvent(student_id=row.id,adult_id=adult.id,action='student.created',resource_id=row.id))
        db.flush();return {**dto(row),'role':'owner','next_step':'assessment'}
    return command(db,adult,key,'register-student',body.model_dump(),action)
