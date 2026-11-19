"""Database-side cohort filters and aggregates; detailed evidence is loaded a page at a time."""
from datetime import datetime, date, time, timedelta, timezone
from zoneinfo import ZoneInfo
from sqlalchemy import select, func, case, true, cast, JSON, DateTime, Date
from sqlalchemy.dialects.postgresql import JSONB
from fastapi import HTTPException
from app.features import models as m
from app.core.json_queries import values,key
from app.features.classrooms.access import school_access, room_access, rooms_query


def visible_query(db,adult,school_id=None,classroom_id=None):
    query=select(m.Student).join(m.Grant,m.Grant.student_id==m.Student.id).where(m.Grant.adult_id==adult.id,m.Grant.active==True)
    if adult.profession=='teacher':
        if not school_id:return query.where(false_condition())
        school_access(db,adult,school_id)
        if classroom_id:
            room=room_access(db,adult,classroom_id)
            if room.school_id!=school_id:raise HTTPException(404)
        rooms=rooms_query(adult).with_only_columns(m.Classroom.id).where(m.Classroom.school_id==school_id)
        if classroom_id:rooms=rooms.where(m.Classroom.id==classroom_id)
        query=query.where(select(m.Enrollment.id).where(m.Enrollment.student_id==m.Student.id,m.Enrollment.classroom_id.in_(rooms)).exists())
    elif school_id or classroom_id:raise HTTPException(403,'Responsável consulta somente seus estudantes vinculados, sem comparação de turma.')
    return query

def false_condition():return m.Student.id.is_(None)

def within(column,start,end):
    def instant(day):return datetime.combine(date.fromisoformat(day),time(),ZoneInfo('America/Sao_Paulo')).astimezone(timezone.utc).isoformat()
    conditions=[]
    if start:conditions.append(column>=instant(start))
    if end:conditions.append(column<instant((date.fromisoformat(end)+timedelta(days=1)).isoformat()))
    return conditions

def item_scope(db,student_ids,start=None,end=None):
    if db.bind.dialect.name=='sqlite':
        items=func.coalesce(func.json_extract(m.ContentRevision.snapshot,'$.body.items'),func.json_extract(m.Assignment.snapshot_data,'$.items'),'[]')
    else:items=func.coalesce(m.ContentRevision.snapshot['body']['items'],m.Assignment.snapshot_data['items'])
    element=values(db,items,'lesson_item')
    query=select(element.c.value).select_from(m.Assignment).join(m.Attempt,m.Attempt.assignment_id==m.Assignment.id).outerjoin(m.ContentRevision,m.ContentRevision.id==m.Assignment.content_revision_id).join(element,true()).where(m.Assignment.student_id.in_(student_ids),m.Attempt.status=='finished',*within(m.Attempt.finished_at,start,end))
    item_id=key(db,element.c.value,'id')
    answered=func.json_type(m.Attempt.responses,'$."'+item_id+'"').is_not(None) if db.bind.dialect.name=='sqlite' else cast(m.Attempt.responses,JSONB).op('?')(item_id)
    return query.where(answered),element

def filtered_query(db,query,student_id,level,skill,support,start,end,search=''):
    if student_id:query=query.where(m.Student.id==student_id)
    if search:query=query.where(m.Student.name.ilike('%'+search.strip()+'%'))
    assessed=select(m.Assessment.id).where(m.Assessment.student_id==m.Student.id).exists()
    if level:
        query=query.where((m.Student.confirmed_level==level) if level not in ('unassessed','unconfirmed') else (m.Student.confirmed_level.is_(None) & (assessed if level=='unconfirmed' else ~assessed)))
    if support:
        array=values(db,m.Student.supports,'student_support',True)
        query=query.where(select(array.c.value).where(array.c.value==support).exists())
    if skill:
        ids=query.with_only_columns(m.Student.id).order_by(None)
        items,element=item_scope(db,ids,start,end)
        matching=items.with_only_columns(m.Assignment.student_id).where(key(db,element.c.value,'skill')==skill)
        query=query.where(m.Student.id.in_(matching))
    return query

def aggregates(db,query,start,end):
    ids=query.with_only_columns(m.Student.id).order_by(None)
    def count(model,*conditions):return db.scalar(select(func.count()).select_from(model).where(model.student_id.in_(ids),*conditions)) or 0
    assessed=select(m.Assessment.id).where(m.Assessment.student_id==m.Student.id).exists()
    total=db.scalar(select(func.count()).select_from(query.subquery()))
    totals={'students':total,'pending_assessments':db.scalar(select(func.count()).select_from(query.where(~assessed).subquery())),
        'assessments':count(m.Assessment,*within(m.Assessment.created_at,start,end)),
        'observations':count(m.Observation,*within(m.Observation.created_at,start,end)),
        'finished_attempts':count(m.Attempt,m.Attempt.status=='finished',*within(m.Attempt.finished_at,start,end)),
        'completed_tasks':count(m.Assignment,m.Assignment.completed_at.is_not(None),*within(m.Assignment.completed_at,start,end)),
        'pending_reviews':count(m.Analysis,m.Analysis.status=='completed',m.Analysis.review.is_(None))}
    for name,group in [('completed_lessons',m.Assignment.stage_id),('completed_trails',m.LearningStage.enrollment_id)]:
        grouped=select(group).select_from(m.Assignment).join(m.LearningStage,m.LearningStage.id==m.Assignment.stage_id).where(m.Assignment.student_id.in_(ids),group.is_not(None)).group_by(group).having(func.count()==func.count(m.Assignment.completed_at),*within(func.max(m.Assignment.completed_at),start,end))
        totals[name]=db.scalar(select(func.count()).select_from(grouped.subquery()))
    category=case((m.Student.confirmed_level.is_not(None),m.Student.confirmed_level),(assessed,'unconfirmed'),else_='unassessed').label('category')
    distribution=db.execute(select(category,func.count()).where(m.Student.id.in_(ids)).group_by(category).order_by(category)).all()
    series={}
    for model,column,field,conditions in [(m.Attempt,m.Attempt.finished_at,'activities',[m.Attempt.status=='finished']),(m.Assessment,m.Assessment.created_at,'assessments',[]),(m.Observation,m.Observation.created_at,'observations',[])]:
        day=func.eleva_day(column) if db.bind.dialect.name=='sqlite' else cast(func.timezone('America/Sao_Paulo',cast(column,DateTime(timezone=True))),Date)
        for timestamp,amount in db.execute(select(day,func.count()).where(model.student_id.in_(ids),*conditions,*within(column,start,end)).group_by(day)):
            day_key=str(timestamp);point=series.setdefault(day_key,{'day':day_key,'activities':0,'assessments':0,'observations':0});point[field]=amount
    return totals,[{'level':key,'count':amount} for key,amount in distribution],sorted(series.values(),key=lambda p:p['day'])

def filter_options(db,query,start,end):
    ids=query.with_only_columns(m.Student.id).order_by(None)
    items,element=item_scope(db,ids,start,end)
    skill=key(db,element.c.value,'skill')
    skills=list(db.scalars(items.with_only_columns(skill).where(skill.is_not(None),skill!='').distinct().order_by(skill).limit(100)))
    array=values(db,m.Student.supports,'available_support',True)
    supports=list(db.scalars(select(array.c.value).select_from(m.Student).join(array,true()).where(m.Student.id.in_(ids)).distinct().order_by(array.c.value).limit(100)))
    return skills,supports
