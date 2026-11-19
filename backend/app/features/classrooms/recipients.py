from fastapi import HTTPException
from sqlalchemy import select
from app.features import models as m
from app.features.learning import grant
from .access import school_access, room_access, rooms_query

def recipients(db,adult,student_ids,classroom_ids,school_ids):
    """Group selection never manufactures student grants; fail all before writing any."""
    ids=set(student_ids);rooms=set(classroom_ids)
    for sid in school_ids:
        school_access(db,adult,sid)
        rooms.update(db.scalars(rooms_query(adult).with_only_columns(m.Classroom.id).where(m.Classroom.school_id==sid)))
    for cid in rooms:
        room_access(db,adult,cid)
        ids.update(db.scalars(select(m.Enrollment.student_id).join(m.Grant,m.Grant.student_id==m.Enrollment.student_id).where(m.Enrollment.classroom_id==cid,m.Grant.adult_id==adult.id,m.Grant.active==True)))
    if not ids or len(ids)>100:raise HTTPException(422,'Selecione de 1 a 100 estudantes com vínculo ativo por envio.')
    for sid in sorted(ids):grant(db,adult,sid)
    return sorted(ids)
