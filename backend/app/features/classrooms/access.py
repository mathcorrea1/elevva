"""Institutional metadata permissions do not grant access to any student's records."""
from fastapi import HTTPException
from sqlalchemy import select, or_
from app.features import models as m

def schools_query(adult):
    member=select(m.SchoolAccess.id).where(m.SchoolAccess.school_id==m.School.id,m.SchoolAccess.adult_id==adult.id,m.SchoolAccess.active==True).exists()
    return select(m.School).where(or_(m.School.owner_id==adult.id,member))

def manager_schools(adult):
    member=select(m.SchoolAccess.id).where(m.SchoolAccess.school_id==m.School.id,m.SchoolAccess.adult_id==adult.id,m.SchoolAccess.active==True,m.SchoolAccess.role=='manager').exists()
    return select(m.School.id).where(or_(m.School.owner_id==adult.id,member))

def rooms_query(adult):
    staff=select(m.ClassroomStaff.id).where(m.ClassroomStaff.classroom_id==m.Classroom.id,m.ClassroomStaff.adult_id==adult.id,m.ClassroomStaff.active==True).exists()
    return select(m.Classroom).where(m.Classroom.school_id.in_(schools_query(adult).with_only_columns(m.School.id)),or_(m.Classroom.teacher_id==adult.id,m.Classroom.school_id.in_(manager_schools(adult)),staff))

def school_access(db,adult,sid,manage=False):
    query=schools_query(adult).where(m.School.id==sid)
    if manage:query=query.where(m.School.id.in_(manager_schools(adult)))
    row=db.scalar(query)
    if not row:raise HTTPException(404,'Escola indisponível para esta conta.')
    return row

def room_access(db,adult,cid):
    row=db.scalar(rooms_query(adult).where(m.Classroom.id==cid))
    if not row:raise HTTPException(404,'Turma indisponível para esta conta.')
    return row
