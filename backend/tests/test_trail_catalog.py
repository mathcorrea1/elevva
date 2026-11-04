import base64,io
from PIL import Image
from sqlalchemy import select
from tests.test_flows import client,headers
from app.main import app
from app.core.database import session
from app.features import models as m

def course(percent=None,availability='sequential'):
    return {'title':'Jardim de teste','description':'Conteúdo técnico sintético, sem validação pedagógica.','cover':{'builtin':'garden','alt':''},'status':'synthetic','availability':availability,
      'lessons':[{'key':'aula1','title':'Primeiro encontro','objective':'Testar entrega, edição e retomada.','instructions':'Escolha e confirme.','image':{'builtin':'sprout','alt':''},'advance_percent':percent,
        'items':[{'id':'i1','prompt':'Escolha A.','choices':['A','B'],'answer':0,'required':True,'skill':'Símbolo · teste'},
                 {'id':'i2','prompt':'Escolha B.','choices':['A','B'],'answer':1,'required':True,'skill':'Símbolo · teste'},
                 {'id':'i3','prompt':'Opcional.','choices':['A','B'],'answer':0,'required':False}]},
        {'key':'aula2','title':'Outra descoberta','objective':'Testar bloqueio independente.','instructions':'Escolha uma opção.','image':{'builtin':'boat','alt':''},'content_ids':['synthetic-activity-1']}]}

def assign(client,body,key='one',sid='synthetic-lia'):
    created=client.post('/trails',json=body,headers=headers('P','create-'+key));assert created.status_code==200,created.text
    enrollment=client.post('/students/'+sid+'/trails',json={'trail_id':created.json()['id'],'version':1},headers=headers('A','enroll-'+key));assert enrollment.status_code==200,enrollment.text
    return created.json(),enrollment.json()

def test_trail_permissions_versions_and_independent_maps(client):
    body=course()
    assert client.post('/trails',json=body,headers=headers()).status_code==403
    created,e=assign(client,body)
    assert client.post('/students/synthetic-lia/trails',json={'trail_id':created['id'],'version':1},headers=headers('B','foreign')).status_code==404
    endpoint='/students/synthetic-lia/trails/'+e['id']
    original=client.get(endpoint,headers=headers()).json();assert len(original['journey']['stages'])==2
    assert original['journey']['stages'][1]['state']=='locked'
    again=client.post('/students/synthetic-lia/trails',json={'trail_id':created['id'],'version':1},headers=headers('A','enroll-one'));assert again.json()==e
    edited={**body,'version':1,'title':'Outra capa e ordem','lessons':list(reversed(body['lessons']))}
    assert client.post('/trails/'+created['id']+'/revisions',json=edited,headers=headers('Q','foreign-edit')).status_code==404
    revision=client.post('/trails/'+created['id']+'/revisions',json=edited,headers=headers('P','edit'));assert revision.status_code==200,revision.text
    saved=client.get(endpoint,headers=headers()).json()
    assert saved['title']=='Jardim de teste' and saved['lessons'][0]['key']=='aula1'
    assert client.get(endpoint,headers=headers('B')).status_code==404
    other,other_e=assign(client,course(availability='free'),'independent')
    independent=client.get('/students/synthetic-lia/trails/'+other_e['id'],headers=headers()).json()
    assert all(s['state']=='available' for s in independent['journey']['stages'])
    assert client.post('/trails/'+created['id']+'/archive',json={'version':2},headers=headers('P','archive')).status_code==200
    assert client.get(endpoint,headers=headers()).status_code==200

def test_answer_edit_threshold_retry_and_immutable_delivery(client):
    _,e=assign(client,course(100))
    prefix='/students/synthetic-lia'
    path=client.get(prefix+'/trails/'+e['id'],headers=headers()).json()
    task=path['journey']['stages'][0]['tasks'][0]
    attempt=client.post(prefix+'/assignments/'+task['id']+'/start',headers=headers(key='start-new')).json()
    assert all('answer' not in i for i in attempt['items'])
    response_path=prefix+'/attempts/'+attempt['id']
    a=client.post(response_path+'/responses',json={'version':1,'item_id':'i1','choice':1,'supports_used':['large_text']},headers=headers(key='wrong')).json()
    a=client.post(response_path+'/responses',json={'version':a['version'],'item_id':'i1','choice':0},headers=headers(key='edited')).json()
    a=client.post(response_path+'/responses',json={'version':a['version'],'item_id':'i2','choice':0},headers=headers(key='second')).json()
    delivered=client.post(response_path+'/finish',json={'version':a['version']},headers=headers(key='deliver'))
    assert delivered.status_code==200,delivered.text
    assert delivered.json()['result']['correct']==1 and delivered.json()['result']['valid_items']==2
    assert delivered.json()['result']['total_items']==3 and not delivered.json()['result']['passed']
    assert client.post(response_path+'/responses',json={'version':delivered.json()['version'],'item_id':'i2','choice':1},headers=headers(key='after-delivery')).status_code==409
    assert client.post(prefix+'/assignments/'+task['id']+'/start',headers=headers(key='implicit-retry')).status_code==409
    new=client.post(prefix+'/assignments/'+task['id']+'/retry',headers=headers(key='retry')).json();assert new['id']!=attempt['id']
    for index,choice in enumerate([0,1]):
        r=client.post(prefix+'/attempts/'+new['id']+'/responses',json={'version':index+1,'item_id':'i'+str(index+1),'choice':choice},headers=headers(key='retry-answer-'+str(index))).json()
    passed=client.post(prefix+'/attempts/'+new['id']+'/finish',json={'version':r['version']},headers=headers(key='retry-deliver'))
    assert passed.status_code==200 and passed.json()['result']['passed']
    assert client.post(prefix+'/attempts/'+new['id']+'/finish',json={'version':r['version']},headers=headers(key='retry-deliver')).json()==passed.json()
    path=client.get(prefix+'/trails/'+e['id'],headers=headers()).json()
    assert path['journey']['stages'][1]['state']=='available'
    report=client.get(prefix+'/report',headers=headers()).json()
    assert report['completed_tasks']==1 and report['finished_attempts']==2
    investigation=client.get(prefix+'/investigation',headers=headers()).json()
    assert len(investigation['evidence'])==2
    assert sum(e['correct'] for e in investigation['evidence'])==1 # first delivery, not inflated by retry
    assert client.post(prefix+'/assignments/'+task['id']+'/retry',headers=headers(key='completed-retry')).status_code==409

def test_media_validation_privacy_and_image_snapshot(client):
    image=Image.new('RGB',(1400,700),'blue');buffer=io.BytesIO();image.save(buffer,format='PNG')
    encoded=base64.b64encode(buffer.getvalue()).decode()
    assert client.post('/media',json={'base64':encoded},headers=headers()).status_code==403
    assert client.post('/media',json={'base64':base64.b64encode(b'not an image').decode()},headers=headers('P','invalid')).status_code==422
    uploaded=client.post('/media',json={'base64':encoded,'alt':'Ilustração de teste'},headers=headers('P','media')).json()
    assert uploaded['width']==1024 and uploaded['height']==512
    assert client.get('/media/'+uploaded['id'],headers=headers('Q')).status_code==404
    body=course();body['cover']={'asset_id':uploaded['id'],'alt':'Capa do autor'}
    trail,e=assign(client,body,'media-trail')
    assert client.get('/media/'+uploaded['id'],headers=headers()).status_code==200 # shared curricular media, no anonymous endpoint
    assert client.post('/trails/'+trail['id']+'/archive',json={'version':1},headers=headers('P','archive-with-media')).status_code==200
    assert client.get('/media/'+uploaded['id'],headers=headers('Q')).status_code==404
    assert client.get('/media/'+uploaded['id'],headers=headers()).status_code==200 # authorized historical enrollment
    grants=client.get('/students/synthetic-lia/grants',headers=headers()).json();gid=next(g['id'] for g in grants if g['adult_id']=='test-P')
    client.delete('/students/synthetic-lia/grants/'+gid,headers=headers())
    assert client.get('/students/synthetic-lia/trails/'+e['id'],headers=headers('P')).status_code==404

def test_draft_and_failed_publication_are_atomic(client):
    body=course();body['status']='draft'
    created=client.post('/trails',json=body,headers=headers('P','draft')).json()
    assert client.post('/students/synthetic-lia/trails',json={'trail_id':created['id'],'version':1},headers=headers(key='draft-enroll')).status_code==409
    assert all(t['id']!=created['id'] for t in client.get('/trails',headers=headers('Q')).json())
    published=course();published['status']='published'
    assert client.post('/trails',json=published,headers=headers('P','invalid-publish')).status_code==409
    assert len(client.get('/trails',headers=headers('P')).json())==1
