"""Generate private PDFs from the same persisted report events; never load StudentCare."""
import base64
from datetime import date, datetime
from io import BytesIO
from typing import Literal
from xml.sax.saxutils import escape
from zoneinfo import ZoneInfo
from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy import select, func
from sqlalchemy.orm import Session
from reportlab.lib import colors
from reportlab.lib.enums import TA_LEFT
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.pagesizes import A4
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, KeepTogether
from app.core.auth import identity
from app.core.database import session
from app.core.config import settings
from app.features import models as m
from app.features.learning import grant, report
from app.features.levels import LABELS
from .router import period
from .cohort import aggregates
from .overview import evidence_rows

router=APIRouter()
BLUE=colors.HexColor('#185DCE');INK=colors.HexColor('#142239');SOFT=colors.HexColor('#EAF1FF')
BODY=ParagraphStyle('body',fontName='Helvetica',fontSize=10,leading=15,textColor=INK,spaceAfter=6,alignment=TA_LEFT,splitLongWords=True)
TITLE=ParagraphStyle('title',parent=BODY,fontName='Helvetica-Bold',fontSize=23,leading=29,spaceAfter=14)
HEADING=ParagraphStyle('heading',parent=BODY,fontName='Helvetica-Bold',fontSize=13,leading=18,spaceBefore=14,spaceAfter=9)
CAPTION=ParagraphStyle('caption',parent=BODY,fontSize=9,leading=13,textColor=colors.HexColor('#536278'))

def p(text,style=BODY):return Paragraph(escape(str(text)).replace('\n','<br/>'),style)
def table(rows,widths=None):
    values=[[p(cell) for cell in row] for row in rows]
    result=Table(values,colWidths=widths,repeatRows=1,hAlign='LEFT')
    result.setStyle(TableStyle([('BACKGROUND',(0,0),(-1,0),SOFT),('VALIGN',(0,0),(-1,-1),'TOP'),
        ('LINEBELOW',(0,0),(-1,0),1,BLUE),('LINEBELOW',(0,1),(-1,-1),.4,colors.HexColor('#E2E8F1')),
        ('LEFTPADDING',(0,0),(-1,-1),9),('RIGHTPADDING',(0,0),(-1,-1),9),('TOPPADDING',(0,0),(-1,-1),9),('BOTTOMPADDING',(0,0),(-1,-1),9)]))
    return result

def pdf(title,subtitle,story,start,end):
    output=BytesIO();generated=datetime.now(ZoneInfo('America/Sao_Paulo')).strftime('%d/%m/%Y às %H:%M')
    doc=SimpleDocTemplate(output,pagesize=A4,rightMargin=42,leftMargin=42,topMargin=45,bottomMargin=52,title=title,author='Elevva')
    intro=[p('ELEVVA · ACOMPANHAMENTO PEDAGÓGICO',CAPTION),p(title,TITLE),p(subtitle),
           p(f"Período: {start or 'início do histórico'} até {end or 'data de emissão'} · America/Sao_Paulo",CAPTION),
           p('DEMONSTRAÇÃO · DADOS FICTÍCIOS' if settings().eleva_env in ('test','development') else 'Documento de acesso restrito',CAPTION),Spacer(1,12)]
    def footer(canvas,document):
        canvas.saveState();canvas.setStrokeColor(BLUE);canvas.line(42,38,A4[0]-42,38)
        canvas.setFont('Helvetica',8);canvas.setFillColor(INK);canvas.drawString(42,25,'Elevva · Gerado em '+generated)
        canvas.drawRightString(A4[0]-42,25,'Página '+str(document.page));canvas.restoreState()
    doc.build(intro+story+[Spacer(1,16),p('Contagens de evidências registradas. Não representam percentual de alfabetização. Nível confirmado pelo docente, sem diagnóstico automático. Informações clínicas e notas restritas não integram este documento.',CAPTION)],onFirstPage=footer,onLaterPages=footer)
    return output.getvalue()

def payload(binary,kind,response):
    response.headers['Cache-Control']='private, no-store'
    response.headers['Pragma']='no-cache'
    return {'filename':'elevva-relatorio-'+kind+'.pdf','mime_type':'application/pdf','base64':base64.b64encode(binary).decode()}

@router.get('/students/{sid}/report-pdf')
def individual(sid:str,response:Response,start:date|None=None,end:date|None=None,detail:Literal['summary','detailed']='summary',adult=Depends(identity),db:Session=Depends(session,scope='function')):
    grant(db,adult,sid);start,end=period(start,end);student=db.get(m.Student,sid);data=report(db,sid,start,end)
    story=[table([['Tarefas concluídas','Entregas registradas','Avaliações','Observações'],[data['completed_tasks'],data['finished_attempts'],data['assessments'],data['observations']]], [128]*4),
           p('Ponto de acompanhamento',HEADING),p('Nível confirmado: '+LABELS.get(data['confirmed_level'],'Ainda não confirmado')),
           p('Resultados de itens comparáveis',HEADING)]
    if data['comparable_results']:
        story.append(table([['Aula / atividade','Versão','Acertos / corrigidos','Aguardando revisão']]+[[r['title'],r['version'],f"{r['correct']} / {r['responses']}",r.get('pending_review',0)] for r in data['comparable_results']], [236,48,110,118]))
    else:story.append(p('Ainda não há itens corrigíveis e comparáveis neste período. Ausência de dados não é resultado zero.'))
    story.append(p('Critério: primeira confirmação de cada item na primeira entrega. Repetições e revisões permanecem no histórico.',CAPTION))
    if detail=='detailed':
        rows=evidence_rows(db,sid,start,end,data);story.append(p('Evidências por habilidade',HEADING))
        for row in rows[:100]:
            status='Aguardando revisão' if row['needs_review'] else 'Acerto' if row['correct'] else 'Rever com o estudante'
            story.append(KeepTogether([p(row['title']+' · '+row['skill'],HEADING),p(row['prompt']),p('Resposta: '+str(row['response'])),p(status,CAPTION)]))
        if len(rows)>100:story.append(p(f'Exibindo as primeiras 100 de {len(rows)} evidências. Consulte o histórico para o conjunto completo.',CAPTION))
    if data['series']:
        story.append(p('Registros ao longo do tempo',HEADING));story.append(table([['Data','Entregas','Avaliações','Observações']]+[[r['day'],r['activities'],r['assessments'],r['observations']] for r in data['series']], [176,112,112,112]))
    return payload(pdf('Jornada individual',student.name,story,start,end),'individual',response)

@router.get('/classrooms/{cid}/report-pdf')
def collective(cid:str,response:Response,start:date|None=None,end:date|None=None,detail:Literal['summary','detailed']='summary',adult=Depends(identity),db:Session=Depends(session,scope='function')):
    from app.features.classrooms.access import room_access
    room=room_access(db,adult,cid)
    start,end=period(start,end)
    query=select(m.Student).join(m.Enrollment,m.Enrollment.student_id==m.Student.id).join(m.Grant,m.Grant.student_id==m.Student.id).where(m.Enrollment.classroom_id==cid,m.Grant.adult_id==adult.id,m.Grant.active==True)
    totals,levels,series=aggregates(db,query,start,end)
    story=[table([['Estudantes autorizados','Tarefas concluídas','Avaliações','Observações'],[totals['students'],totals['completed_tasks'],totals['assessments'],totals['observations']]], [128]*4),p('Níveis confirmados e pendências',HEADING)]
    names={**LABELS,'unassessed':'Sem avaliação','unconfirmed':'Sem confirmação de nível'}
    story.append(table([['Situação','Estudantes']]+[[names.get(r['level'],r['level']),r['count']] for r in levels], [380,132]))
    if detail=='detailed':
        students=list(db.scalars(query.order_by(m.Student.name,m.Student.id).limit(200)))
        story.append(p('Resumo por estudante autorizado',HEADING));rows=[['Estudante','Nível confirmado','Tarefas concluídas']]
        for student in students:
            r=report(db,student.id,start,end);rows.append([student.name,LABELS.get(student.confirmed_level,'Não confirmado'),r['completed_tasks']])
        story.append(table(rows,[215,215,82]))
        if totals['students']>200:story.append(p(f"Resumo limitado a 200 de {totals['students']} estudantes. Indicadores globais contemplam todos os autorizados.",CAPTION))
    return payload(pdf('Panorama da turma',room.name,story,start,end),'turma',response)
