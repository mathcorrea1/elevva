from tests.test_flows import client,headers
from tests.test_lesson_screens import create,lesson,assign
from sqlalchemy import select,func
from app.features import models as m
from app.main import app
from app.core.database import session


def test_partial_draft_cas_and_reference_without_per_student_content_copy(client):
    body={'title':'Uma ideia ainda incompleta','screens':[{'id':'s','type':'activity','question':{'id':'q','kind':'matching','answer':{'a':[]}}}]}
    r=client.post('/lesson-drafts',json=body,headers=headers('P','partial'));assert r.status_code==200,r.text
    draft=r.json()
    saved=client.get('/lessons/'+draft['id'],headers=headers('P')).json()['body']['screens'][0]
    assert saved['id']=='s' and saved['question']['answer']==body['screens'][0]['question']['answer']
    r=client.post('/lessons/'+draft['id']+'/publish?synthetic=true',json={'version':1},headers=headers('P','incomplete-publish'));assert r.status_code==422,r.text
    complete={**lesson(),'version':1}
    r=client.post('/lesson-drafts/'+draft['id']+'/revisions',json=complete,headers=headers('P','complete'));assert r.status_code==200,r.text
    assert client.post('/lesson-drafts/'+draft['id']+'/revisions',json=complete,headers=headers('P','stale')).status_code==409
    row=client.post('/lessons/'+draft['id']+'/publish?synthetic=true',json={'version':2},headers=headers('P','publish')).json()
    task=assign(client,row)
    generator=app.dependency_overrides[session]();db=next(generator)
    try:
        stored=db.get(m.Assignment,task['id']);assert stored.snapshot_data=={} and stored.content_revision_id==row['revision_id']
        assert db.scalar(select(func.count()).select_from(m.Content).where(m.Content.kind=='lesson'))==1
    finally:generator.close()


def test_many_students_page_isolation_and_global_report_denominator(client):
    for i in range(25):
        r=client.post('/students/register',json={'name':'Estudante técnico '+str(i).zfill(2),'characteristics':{'reported_conditions':['tea'],'communication':['alternative'],'pedagogical_supports':['visual_support']}},headers=headers('A','student-'+str(i)))
        assert r.status_code==201,r.text
    page=client.get('/students-page?limit=10',headers=headers()).json()
    assert page['total']==26 and len(page['items'])==10 and page['next_offset']==10
    second=client.get('/students-page?limit=10&offset=10',headers=headers()).json()
    assert not {s['id'] for s in page['items']} & {s['id'] for s in second['items']}
    assert client.get('/students-page?limit=10',headers=headers('B')).json()['total']==1
    p=client.get('/reports/overview?limit=5',headers=headers()).json()
    assert len(p['students'])==5 and p['totals']['students']==26 and p['pagination']['total']==26
    assert p['totals']['pending_assessments']==25 and sum(d['count'] for d in p['level_distribution'])==26
    assert client.get('/reports/overview?search=Estudante%20t%C3%A9cnico%2001',headers=headers()).json()['totals']['students']==1
    student=page['items'][0]
    care=client.get('/students/'+student['id']+'/care',headers=headers()).json()
    assert care['characteristics']['reported_conditions']==['tea']
    assert 'characteristics' not in student # sensitive categories never broadened into list rows
    assert client.get('/students/'+student['id']+'/care',headers=headers('P')).status_code==404


def test_bulk_class_school_deduplicates_and_does_not_grant_access(client):
    row=create(client)
    rooms=client.get('/classrooms',headers=headers('P')).json();room=rooms[0]
    body={'revision_id':row['revision_id'],'student_ids':['synthetic-lia'],'classroom_ids':[room['id']],'school_ids':[room['school_id']]}
    result=client.post('/lessons/'+row['id']+'/assign',json=body,headers=headers('P','bulk'))
    assert result.status_code==200,result.text
    assert result.json()['assigned']==1
    assert client.post('/lessons/'+row['id']+'/assign',json=body,headers=headers('P','bulk')).json()==result.json()
    assert client.post('/lessons/'+row['id']+'/assign',json=body,headers=headers('Q','foreign-context')).status_code==404
    assert client.get('/students/synthetic-lia/lesson-assignments',headers=headers('Q')).status_code==404


def test_invalid_pairs_are_validation_errors_not_server_errors(client):
    body=lesson();body['screens'][4]['question']['answer']={'a':[],'b':'y'}
    response=client.post('/lessons',json=body,headers=headers('P','bad-pairs'))
    assert response.status_code==422


def test_image_only_choice_requires_an_accessible_label_and_errors_are_readable(client):
    body=lesson();question=body['screens'][1]['question'];question['options'][0]={'id':'a','image':{'builtin':'sprout','alt':''}}
    response=client.post('/lessons',json=body,headers=headers('P','unlabelled-image'))
    assert response.status_code==422 and 'descrição alternativa' in response.json()['detail']
    assert 'screens.' not in response.json()['detail'] and 'Value error' not in response.json()['detail']
    question['options'][0]['image']['alt']='Uma planta'
    response=client.post('/lessons',json=body,headers=headers('P','labelled-image'))
    assert response.status_code==200,response.text


def test_postgresql_query_compilation_and_request_trace(client):
    from types import SimpleNamespace
    from sqlalchemy.dialects import postgresql
    from app.features.reports.cohort import filtered_query
    from app.features.trails.service import catalog_query
    dialect=postgresql.dialect();db=SimpleNamespace(bind=SimpleNamespace(dialect=dialect));adult=SimpleNamespace(id='test-P')
    statement=filtered_query(db,select(m.Student),None,None,'Habilidade de teste','Apoio de teste',None,None)
    compiled=str(statement.compile(dialect=dialect))
    assert 'json_array_elements' in compiled and 'json_array_elements_text' in compiled
    assert 'LATERAL' in str(catalog_query(db,adult).compile(dialect=dialect))
    response=client.get('/students/synthetic-lia/report',headers=headers())
    assert len(response.headers['x-request-id'])==36


def test_required_written_review_blocks_retry_and_review_unlocks_once(client):
    body=lesson();body['screens']=[body['screens'][0],body['screens'][-2],body['screens'][-1]];body['require_review_for_advance']=True
    row=client.post('/lessons',json=body,headers=headers('P','new')).json()
    row=client.post('/lessons/'+row['id']+'/publish?synthetic=true',json={'version':1},headers=headers('P','release')).json()
    task=assign(client,row);p='/students/synthetic-lia'
    a=client.post(p+'/assignments/'+task['id']+'/start',headers=headers('A','start')).json();path=p+'/attempts/'+a['id']
    a=client.post(path+'/responses',json={'version':a['version'],'item_id':'text','value':'CONTEUDO-PRIVADO-DE-TESTE'},headers=headers('A','answer')).json()
    a=client.post(path+'/progress',json={'version':a['version'],'cursor':2,'acknowledge_screen':'intro'},headers=headers('A','progress')).json()
    r=client.post(path+'/finish',json={'version':a['version']},headers=headers('A','finish'));assert r.status_code==200,r.text
    a=r.json();assert not a['result']['passed'] and a['result']['pending_review']==1
    assert client.post(p+'/assignments/'+task['id']+'/retry',headers=headers('A','retry')).status_code==409
    generator=app.dependency_overrides[session]();db=next(generator)
    try:
        import json
        from app.features.ai import snapshot_for
        assert 'CONTEUDO-PRIVADO-DE-TESTE' not in json.dumps(snapshot_for(db,'synthetic-lia',False))
    finally:generator.close()
    r=client.post(path+'/review-answer',json={'version':a['version'],'item_id':'text','correct':True,'note':'Julgamento sintético para testar o percurso.'},headers=headers('P','review'))
    assert r.status_code==200 and r.json()['result']['passed']
    assert client.post(path+'/review-answer',json={'version':a['version'],'item_id':'text','correct':True,'note':'Julgamento sintético para testar o percurso.'},headers=headers('P','review')).json()==r.json()
    report=client.get(p+'/report',headers=headers()).json()
    assert report['completed_tasks']==1 and report['finished_attempts']==1


def test_shared_lesson_media_requires_share_or_historical_student_grant(client):
    import base64,io
    from PIL import Image
    data=io.BytesIO();Image.new('RGB',(2,2),'blue').save(data,format='PNG')
    upload=client.post('/media',json={'base64':base64.b64encode(data.getvalue()).decode()},headers=headers('P','image')).json()
    body=lesson();body['screens'][0]['image']={'asset_id':upload['id'],'alt':'Imagem técnica'};body['screens'][0]['type']='text_image'
    row=client.post('/lessons',json=body,headers=headers('P','media-lesson')).json()
    row=client.post('/lessons/'+row['id']+'/publish?synthetic=true',json={'version':1},headers=headers('P','release')).json()
    assert client.get('/media/'+upload['id'],headers=headers('Q')).status_code==404
    share=client.post('/lessons/'+row['id']+'/shares',json={'revision_id':row['revision_id'],'recipient_id':'test-Q'},headers=headers('P','share')).json()
    client.post('/lesson-shares/'+share['id']+'/accept',headers=headers('Q','accept'))
    assert client.get('/media/'+upload['id'],headers=headers('Q')).status_code==200
    assign(client,row,'Q','synthetic-caio')
    client.post('/lesson-shares/'+share['id']+'/revoke',headers=headers('P','revoke'))
    assert client.get('/media/'+upload['id'],headers=headers('Q')).status_code==200
    grants=client.get('/students/synthetic-caio/grants',headers=headers('B')).json();gid=next(g['id'] for g in grants if g['adult_id']=='test-Q')
    client.delete('/students/synthetic-caio/grants/'+gid,headers=headers('B'))
    assert client.get('/media/'+upload['id'],headers=headers('Q')).status_code==404


def test_student_beyond_first_cohort_page_is_not_denied_and_registration_is_atomic(client):
    room=client.get('/classrooms',headers=headers('P')).json()[0]
    ids=[]
    for i in range(52):
        response=client.post('/students/register',json={'name':'ZZ estudante '+str(i).zfill(2),'classroom_id':room['id']},headers=headers('P','cohort-student-'+str(i)))
        assert response.status_code==201,response.text
        ids.append(response.json()['id'])
    response=client.get('/students/'+ids[-1]+'/investigation?classroom_id='+room['id'],headers=headers('P'))
    assert response.status_code==200,response.text
    data=response.json();assert data['cohort_students']==53 and data['cohort_loaded_students']==51 and data['cohort_next_offset']==50
    second=client.get('/students/'+ids[-1]+'/investigation?classroom_id='+room['id']+'&cohort_offset=50',headers=headers('P')).json()
    assert second['cohort_loaded_students']==3 and second['cohort_next_offset'] is None
    before=client.get('/students-page',headers=headers('B')).json()['total']
    assert client.post('/students/register',json={'name':'Cadastro não autorizado','classroom_id':room['id']},headers=headers('B','foreign-register')).status_code==404
    assert client.get('/students-page',headers=headers('B')).json()['total']==before
