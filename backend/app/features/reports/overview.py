from collections import Counter,defaultdict
from datetime import date,datetime
from fastapi import APIRouter,Depends,HTTPException,Query
from sqlalchemy import select,func
from sqlalchemy.orm import Session
from app.core.auth import identity
from app.core.database import session
from app.features import models as m
from app.features.learning import grant,report
from app.features.activities.journey import journey,attempt_result
from app.features.classrooms.router import period
from .cohort import visible_query,filtered_query,aggregates,filter_options
router=APIRouter()

def evidence_rows(db,sid,start=None,end=None,selected=None):
    selected=selected if selected is not None else report(db,sid,start,end)
    attempts=[e for e in selected['events'] if e['kind']=='attempt' and e['status']=='finished']
    # First submitted attempt PER assignment, chosen over full history before applying period.
    first={}
    for a in db.scalars(select(m.Attempt).where(m.Attempt.student_id==sid,m.Attempt.status=='finished').order_by(m.Attempt.finished_at,m.Attempt.id)):
        first.setdefault(a.assignment_id,a.id)
    rows=[]
    for attempt in attempts:
        if first[attempt['assignment_id']]!=attempt['id']:continue
        assignment=db.get(m.Assignment,attempt['assignment_id'])
        for item in assignment.snapshot.get('items',[]):
            if item['id'] not in attempt['responses']:continue
            from app.features.lessons.grading import comparison_result,response_label
            choice,outcome=comparison_result(item,attempt)
            first_event=next((e for e in attempt.get('interactions',[]) if e.get('kind')=='answer' and e.get('item_id')==item['id']),None)
            rows.append({'evidence_id':attempt['id'],'assignment_id':assignment.id,'content_id':assignment.content_id,'content_version':assignment.content_version,
                'title':assignment.snapshot['title'],'item_id':item['id'],'prompt':item['prompt'],'skill':item.get('skill') or 'Não categorizada',
                'response':response_label(item,choice),'correct':outcome['correct'],'needs_review':outcome['needs_review'],'review':outcome.get('review'),'response_event_id':first_event['id'] if first_event else None,'reading_allowed':item.get('reading_allowed',False),
                'confirmations':sum(e.get('kind')=='answer' and e.get('item_id')==item['id'] for e in attempt.get('interactions',[])) if item.get('kind') else None,
                'latest_response':response_label(item,attempt['responses'][item['id']]),
                'supports_used':first_event.get('supports_used',attempt.get('supports_used',[])) if first_event else attempt.get('supports_used',[]),'date':attempt['finished_at'],'student_id':sid})
    return rows

def groups_for(rows):
    groups={}
    for e in rows:
        key=(e['content_id'],e['content_version'],e['item_id'],tuple(sorted(e['supports_used'])))
        group=groups.setdefault(key,{'content_id':e['content_id'],'content_version':e['content_version'],'item_id':e['item_id'],'title':e['title'],
            'prompt':e['prompt'],'skill':e['skill'],'supports_used':e['supports_used'],'responses':0,'correct':0,'pending_review':0,'students':set(),'errors':Counter(),'evidence_ids':[]})
        group['students'].add(e['student_id']);group['evidence_ids'].append(e['evidence_id'])
        if e.get('needs_review'):group['pending_review']+=1
        else:
            group['responses']+=1;group['correct']+=int(e['correct'])
            if not e['correct']:group['errors'][e['response']]+=1
    return [{**g,'students':len(g['students']),'errors':[{'response':k,'count':v} for k,v in g['errors'].items()]} for g in groups.values()]

@router.get('/reports/overview')
def overview(school_id:str|None=None,classroom_id:str|None=None,start:date|None=None,end:date|None=None,
             student_id:str|None=None,level:str|None=None,skill:str|None=None,support:str|None=None,
             offset:int=Query(0,ge=0),limit:int=Query(20,ge=1,le=50),search:str=Query('',max_length=120),
             adult=Depends(identity),db:Session=Depends(session,scope='function')):
    start,end=period(start,end)
    base=visible_query(db,adult,school_id,classroom_id)
    if student_id and not db.scalar(base.where(m.Student.id==student_id)):raise HTTPException(404)
    query=filtered_query(db,base,student_id,level,skill,support,start,end,search)
    visible=list(db.scalars(query.order_by(m.Student.name,m.Student.id).offset(offset).limit(limit)))
    skills,supports=filter_options(db,base,start,end)
    options={'students':[{'id':s.id,'name':s.name} for s in visible], 'skills':skills,'supports':supports}
    students=[];all_rows=[];observed=[]
    for s in visible:
        if student_id and s.id!=student_id:continue
        assessments=list(db.scalars(select(m.Assessment).where(m.Assessment.student_id==s.id).order_by(m.Assessment.created_at.desc())))
        category=s.confirmed_level or ('unconfirmed' if assessments else 'unassessed')
        if level and category!=level:continue
        if support and support not in s.supports:continue
        r=report(db,s.id,start,end);rows=evidence_rows(db,s.id,start,end,r)
        rows=[e for e in rows if not skill or e['skill']==skill];all_rows+=rows
        reviews=list(db.scalars(select(m.Analysis).where(m.Analysis.student_id==s.id,m.Analysis.status=='completed',m.Analysis.review.is_(None))))
        flags=list(db.scalars(select(m.AttentionFlag).where(m.AttentionFlag.student_id==s.id,m.AttentionFlag.resolved_at.is_(None))))
        reasons=[]
        if not assessments:reasons.append({'kind':'assessment','reason':'Avaliação inicial ainda não registrada','evidence_ids':[],'action':'Assessment'})
        for f in flags:reasons.append({'kind':'manual','reason':f.reason,'evidence_ids':[f.id],'action':'Student'})
        if reviews:reasons.append({'kind':'review','reason':str(len(reviews))+' análises aguardam revisão adulta','evidence_ids':[a.id for a in reviews],'action':'Analysis'})
        for e in r['events']:
            if e['kind']=='observation' and e.get('details',{}).get('needs_support'):
                observed.append({'student_id':s.id,'evidence_id':e['id'],'skill':e['details'].get('skill') or 'Não categorizada','text':e.get('text'),'support':e['details'].get('support'),'date':e['created_at']})
        g=grant(db,adult,s.id)
        students.append({'id':s.id,'name':s.name,'role':g.role,'supports':s.supports,'confirmed_level':s.confirmed_level,'version':s.version,
            'category':category,'next_step':'assessment' if not assessments else 'activity','last_assessment':assessments[0].created_at if assessments else None,
            'completed_tasks':r['completed_tasks'],'finished_attempts':r['finished_attempts'],'completed_lessons':r['completed_stages'],
            'completed_trails':r['completed_trails'],
            'assessments':r['assessments'],'observations':r['observations'],'pending_reviews':len(reviews),'attention':reasons})
    totals,distribution,timeline=aggregates(db,query,start,end)
    return {'scope':'school' if adult.profession=='teacher' else 'family','period':{'start':start,'end':end,'timezone':'America/Sao_Paulo'},
        'students':students,'totals':totals,'level_distribution':distribution,
        'pagination':{'offset':offset,'limit':limit,'total':totals['students'],'next_offset':offset+limit if offset+limit<totals['students'] else None},
        'detail_scope':'Respostas comparáveis e observações detalhadas correspondem aos estudantes desta página. Contagens e distribuição abrangem todo o filtro.',
        'series':timeline,'comparable_groups':groups_for(all_rows),
        'observed_support':observed,'options':{**options,'skills':sorted(options['skills']),'supports':sorted(options['supports'])},
        'assessment_freshness':{'rule':None,'outdated':None,'note':'Prazo de reavaliação ainda não aprovado; são exibidas as datas, sem classificar avaliações como desatualizadas.'},
        'limitations':['Comparações usam primeira entrega por atribuição, mesma versão/item e mesmos apoios registrados; repetição não apaga tentativas.',
                        'Habilidades são rótulos cadastrados no conteúdo, não currículo automaticamente validado. Sem ranking, diagnóstico ou média de alfabetização.']}

@router.get('/students/{sid}/investigation')
def investigation(sid:str,classroom_id:str|None=None,start:date|None=None,end:date|None=None,cohort_offset:int=Query(0,ge=0),adult=Depends(identity),db:Session=Depends(session,scope='function')):
    grant(db,adult,sid);start,end=period(start,end);peers=[];cohort_total=0
    if classroom_id:
        from app.features.classrooms.access import room_access
        room=room_access(db,adult,classroom_id)
        if adult.profession!='teacher':raise HTTPException(404)
        query=visible_query(db,adult,room.school_id,classroom_id)
        if not db.scalar(query.where(m.Student.id==sid)):raise HTTPException(404)
        cohort_total=db.scalar(select(func.count()).select_from(query.subquery()))
        peers=list(db.scalars(query.order_by(m.Student.name,m.Student.id).offset(cohort_offset).limit(50)))
        if sid not in {p.id for p in peers}:peers.append(db.get(m.Student,sid))
    selected=report(db,sid,start,end)
    rows=evidence_rows(db,sid,start,end,selected)
    keys={(e['content_id'],e['content_version'],e['item_id'],tuple(sorted(e['supports_used']))) for e in rows}
    cohort=[e for p in peers for e in (rows if p.id==sid else evidence_rows(db,p.id,start,end)) if (e['content_id'],e['content_version'],e['item_id'],tuple(sorted(e['supports_used']))) in keys]
    return {'report':selected,'evidence':rows,'cohort_groups':groups_for(cohort),'cohort_students':cohort_total,'cohort_loaded_students':len(peers),
        'cohort_next_offset':cohort_offset+50 if cohort_offset+50<cohort_total else None,
        'journey':journey(db,sid),'note':'Sem grupo equivalente, a comparação fica indisponível; ausência de dados não é desempenho zero.'}
