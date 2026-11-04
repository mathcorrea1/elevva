import json
from fastapi import APIRouter, Depends, Header, HTTPException
from pydantic import Field, model_validator, ValidationError
from sqlalchemy.orm import Session
from app.core.auth import identity
from app.core.database import session
from app.features import models as m
from app.features.learning import command, check_version
from app.features.catalog.router import capture_revision
from .contracts import LessonCommand,Screen,Question,Option
from .service import body_for, dto_lesson, validate_media
from .router import teacher

router=APIRouter()
class DraftOption(Option):
    @model_validator(mode='after')
    def labelled(self):return self
class DraftQuestion(Question):
    prompt:str=Field(default='',max_length=500)
    answer:object=None
    options:list[DraftOption]=Field(default_factory=list,max_length=12)
    targets:list[DraftOption]=Field(default_factory=list,max_length=12)
    @model_validator(mode='after')
    def configured(self):return self
class DraftScreen(Screen):
    question:DraftQuestion|None=None
    video_id:str|None=Field(default=None,max_length=200)
    @model_validator(mode='after')
    def content(self):return self
class Draft(LessonCommand):
    description:str=Field(default='',max_length=600)
    objective:str=Field(default='',max_length=1000)
    screens:list[DraftScreen]=Field(default_factory=list,max_length=40)
    # Override the complete-lesson validator: publication validates LessonCommand separately.
    @model_validator(mode='after')
    def ordered(self):
        if len(json.dumps(self.model_dump(),ensure_ascii=False))>200000:raise ValueError('Rascunho excede 200 mil caracteres.')
        ids=[]
        for s in self.screens:
            ids.append(s.id)
        if len(set(ids))!=len(ids):raise ValueError('IDs de telas devem ser distintos.')
        return self
class DraftEdit(Draft):
    version:int=Field(ge=1)

def draft_body(body):
    data=body.model_dump(exclude={'version'})
    try:return body_for(LessonCommand.model_validate(data))
    except ValidationError:
        data.pop('title');data['items']=[s['question'] for s in data['screens'] if isinstance(s.get('question'),dict)]
        data['instructions']=data.get('objective','');data['activity_kinds']=sorted({q.get('kind','single') for q in data['items']})
        data['schema_version']='lesson-screens-v1';return data

@router.post('/lesson-drafts')
def create(body:Draft,adult=Depends(identity),db:Session=Depends(session,scope='function'),key:str=Header('',alias='Idempotency-Key')):
    teacher(adult)
    def action():
        value=draft_body(body);validate_media(db,value,adult)
        row=m.Content(author_id=adult.id,kind='lesson',title=body.title,body=value,status='draft');db.add(row);db.flush();capture_revision(db,row,adult)
        return dto_lesson(db,row,adult)
    return command(db,adult,key,'lesson-draft-create',body.model_dump(),action)

@router.post('/lesson-drafts/{lid}/revisions')
def revise(lid:str,body:DraftEdit,adult=Depends(identity),db:Session=Depends(session,scope='function'),key:str=Header('',alias='Idempotency-Key')):
    teacher(adult);row=db.get(m.Content,lid)
    if not row or row.author_id!=adult.id or row.kind!='lesson':raise HTTPException(404)
    def action():
        if row.archived_at:raise HTTPException(409,'Aula arquivada.')
        value=draft_body(body);validate_media(db,value,adult,row if row.origin_content_id else None)
        if row.origin_content_id:value['origin_license']=row.body.get('origin_license',{'redistribute':False})
        check_version(db,m.Content,lid,body.version);db.refresh(row)
        row.title,row.body,row.status=body.title,value,'draft';db.flush();capture_revision(db,row,adult)
        return dto_lesson(db,row,adult)
    return command(db,adult,key,'lesson-draft-revise:'+lid,body.model_dump(),action)
