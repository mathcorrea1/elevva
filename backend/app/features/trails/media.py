import base64, binascii, io, warnings, json
from PIL import Image, ImageOps, UnidentifiedImageError
from fastapi import APIRouter, Depends, Header, HTTPException
from sqlalchemy import select, func,cast,Text
from sqlalchemy.orm import Session
from app.core.auth import identity
from app.core.database import session
from app.core.config import settings
from app.features import models as m
from app.features.learning import command
from .contracts import Upload
router=APIRouter()

def normalize(encoded):
    try:
        raw=base64.b64decode(encoded,validate=True)
        if len(raw)>2*1024*1024:raise ValueError()
        with warnings.catch_warnings():
            warnings.simplefilter('error',Image.DecompressionBombWarning)
            with Image.open(io.BytesIO(raw)) as probe:
                if probe.format not in ('PNG','JPEG','WEBP') or probe.width*probe.height>12000000 or getattr(probe,'n_frames',1)>1:raise ValueError()
                probe.verify()
            with Image.open(io.BytesIO(raw)) as source:
                image=ImageOps.exif_transpose(source).convert('RGBA')
                image.thumbnail((1024,1024))
                target=io.BytesIO();image.save(target,format='PNG',optimize=True)
                return target.getvalue(),image.width,image.height
    except (ValueError,OSError,binascii.Error,UnidentifiedImageError,Image.DecompressionBombWarning,Image.DecompressionBombError):
        raise HTTPException(422,'Use PNG, JPEG ou WebP estático até 2 MB e 12 megapixels. O arquivo precisa ser uma imagem válida.')

@router.post('/media')
def upload(body:Upload,adult=Depends(identity),db:Session=Depends(session,scope='function'),key:str=Header('',alias='Idempotency-Key')):
    if adult.profession!='teacher':raise HTTPException(403,'Envio de ilustrações exige autoria docente.')
    def action():
        if db.scalar(select(func.count()).select_from(m.MediaAsset).where(m.MediaAsset.owner_id==adult.id))>=100:raise HTTPException(429,'Limite de 100 imagens por autor neste protótipo.')
        data,w,h=normalize(body.base64)
        row=m.MediaAsset(owner_id=adult.id,data=data,width=w,height=h,alt=body.alt);db.add(row);db.flush()
        return {'id':row.id,'width':w,'height':h,'alt':row.alt}
    return command(db,adult,key,'upload-media',body.model_dump(),action)

def references(body,asset_id):
    # Parsed JSON references only; do not authorize by an arbitrary substring in a title.
    if isinstance(body,dict):return body.get('asset_id')==asset_id or any(references(v,asset_id) for v in body.values())
    if isinstance(body,list):return any(references(v,asset_id) for v in body)
    return False

@router.get('/media/{mid}')
def read(mid:str,adult=Depends(identity),db:Session=Depends(session,scope='function')):
    row=db.get(m.MediaAsset,mid)
    if not row:raise HTTPException(404)
    allowed=row.owner_id==adult.id
    if not allowed:
        from app.features.trails.service import catalog_query
        allowed=any(references(t.body,mid) for t in db.scalars(catalog_query(db,adult).where(m.TrailDefinition.archived_at.is_(None),cast(m.TrailDefinition.body,Text).contains(mid))))
    if not allowed:
        snapshots=db.scalars(select(m.TrailEnrollment.snapshot).join(m.Grant,m.Grant.student_id==m.TrailEnrollment.student_id).where(m.Grant.adult_id==adult.id,m.Grant.active==True,cast(m.TrailEnrollment.snapshot,Text).contains(mid)))
        allowed=any(references(s,mid) for s in snapshots)
    if not allowed:
        from app.features.lessons.service import lesson_access
        for revision in db.scalars(select(m.ContentRevision).join(m.Content,m.Content.id==m.ContentRevision.content_id).where(m.Content.kind=='lesson',cast(m.ContentRevision.snapshot,Text).contains(mid))):
            if not references(revision.snapshot,mid):continue
            try:
                lesson_access(db,adult,db.get(m.Content,revision.content_id),revision);allowed=True;break
            except HTTPException as error:
                if error.status_code!=404:raise
    if not allowed:
        revisions=db.scalars(select(m.ContentRevision).join(m.Assignment,m.Assignment.content_revision_id==m.ContentRevision.id).join(m.Grant,m.Grant.student_id==m.Assignment.student_id).where(m.Grant.adult_id==adult.id,m.Grant.active==True,cast(m.ContentRevision.snapshot,Text).contains(mid)))
        allowed=any(references(r.snapshot,mid) for r in revisions)
    if not allowed:raise HTTPException(404)
    return {'id':row.id,'alt':row.alt,'width':row.width,'height':row.height,'uri':'data:image/png;base64,'+base64.b64encode(row.data).decode()}
