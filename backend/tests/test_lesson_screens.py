from tests.test_flows import client, headers
from app.features.lessons.grading import grade


def lesson():
    options=[{'id':'a','text':'CA'},{'id':'b','text':'SA'}]
    questions=[
      {'id':'single','kind':'single','answer':'a'},
      {'id':'multiple','kind':'multiple','answer':['a','b']},
      {'id':'order','kind':'order','answer':['a','b']},
      {'id':'matching','kind':'matching','answer':{'a':'x','b':'y'},'targets':[{'id':'x','text':'CA'},{'id':'y','text':'SA'}]},
      {'id':'text','kind':'text','answer':['casa'],'normalization':{'ignore_case':True,'ignore_accents':False,'unmatched':'human_review'}}]
    return {'title':'Aula técnica de demonstração','description':'Dados sintéticos, não aprovados pedagogicamente.','objective':'Verificar mecanismos e persistência.',
      'screens':[{'id':'intro','type':'text','title':'Começar','text':'Vamos explorar uma palavra.'}]+[
      {'id':'screen-'+q['id'],'type':'activity','title':'Descoberta','question':{'prompt':'Teste técnico','options':options,**q}} for q in questions]+[{'id':'end','type':'completion','title':'Até a próxima!'}]}


def create(client):
    r=client.post('/lessons',json=lesson(),headers=headers('P','create'));assert r.status_code==200,r.text
    row=r.json()
    assert client.post('/lessons/'+row['id']+'/publish',json={'version':1},headers=headers('P','bad-publish')).status_code==409
    r=client.post('/lessons/'+row['id']+'/publish?synthetic=true',json={'version':1},headers=headers('P','release'));assert r.status_code==200,r.text
    return r.json()


def assign(client,row,label='P',sid='synthetic-lia',key='assign'):
    r=client.post('/lessons/'+row['id']+'/assign',json={'revision_id':row['revision_id'],'student_ids':[sid]},headers=headers(label,key));assert r.status_code==200,r.text
    return r.json()['tasks'][0]


def test_mechanics_resume_review_and_reports(client):
    row=create(client);task=assign(client,row)
    p='/students/synthetic-lia'
    state=client.post(p+'/assignments/'+task['id']+'/start',headers=headers('A','start')).json()
    assert len(state['screens'])==7 and all('answer' not in i for i in state['items'])
    assert not any('question' in s for s in state['screens'])
    path=p+'/attempts/'+state['id']
    assert client.get(path,headers=headers('B')).status_code==404
    r=client.post(path+'/draft',json={'version':state['version'],'item_id':'order','value':['a']},headers=headers('A','draft'))
    assert r.status_code==200,r.text
    state=client.get(path,headers=headers()).json();assert state['drafts']['order']==['a']
    for i,value in [('single','b'),('single','a'),('multiple',['a','b']),('order',['a','b']),('matching',{'a':'x','b':'y'}),('text','casinha')]:
        r=client.post(path+'/responses',json={'version':state['version'],'item_id':i,'value':value,'supports_used':['large_text'] if i=='single' and value=='b' else []},headers=headers('A','answer-'+i+str(state['version'])))
        assert r.status_code==200,r.text;state=r.json()
    assert client.post(path+'/finish',json={'version':state['version']},headers=headers('A','too-early')).status_code==422
    r=client.post(path+'/progress',json={'version':state['version'],'cursor':6,'acknowledge_screen':'intro'},headers=headers('A','cursor'));assert r.status_code==200,r.text
    state=r.json();assert client.get(path,headers=headers()).json()['cursor']==6
    r=client.post(path+'/finish',json={'version':state['version']},headers=headers('A','finish'));assert r.status_code==200,r.text
    state=r.json();assert state['result']['pending_review']==1 and state['result']['correct']==4
    investigation=client.get(p+'/investigation',headers=headers()).json()
    new=[e for e in investigation['evidence'] if e['content_id']==row['id']]
    assert len(new)==5 and next(e for e in new if e['item_id']=='single')['correct'] is False
    assert next(e for e in new if e['item_id']=='single')['supports_used']==['large_text']
    assert next(e for e in new if e['item_id']=='order')['supports_used']==[]
    assert next(e for e in new if e['item_id']=='text')['correct'] is None
    assert client.post(path+'/review-answer',json={'version':state['version'],'item_id':'text','correct':True,'note':'Variante aceita neste teste.'},headers=headers('A','bad-review')).status_code==403
    r=client.post(path+'/review-answer',json={'version':state['version'],'item_id':'text','correct':True,'note':'Variante aceita neste teste.'},headers=headers('P','review'));assert r.status_code==200,r.text
    assert r.json()['result']['correct']==5 and r.json()['result']['pending_review']==0
    assert client.get(p+'/report',headers=headers()).status_code==200


def test_sharing_versions_and_transactional_bulk_isolation(client):
    row=create(client)
    r=client.post('/lessons/'+row['id']+'/shares',json={'revision_id':row['revision_id'],'recipient_id':'test-Q','can_copy':True},headers=headers('P','share'));assert r.status_code==200,r.text
    share=r.json()
    incoming=client.get('/lessons?scope=received',headers=headers('Q')).json()['items']
    assert len(incoming)==1 and incoming[0]['author_name']==row['author_name']
    outgoing=client.get('/lessons/'+row['id']+'/shares',headers=headers('P')).json()['items']
    assert outgoing[0]['recipient_name'] and outgoing[0]['recipient_id']=='test-Q'
    assert client.post('/lesson-shares/'+share['id']+'/accept',headers=headers('Q','accept')).status_code==200
    # Sharing content does not share personal student records.
    assert client.get('/students/synthetic-lia/report',headers=headers('Q')).status_code==404
    assert client.post('/lessons/'+row['id']+'/assign',json={'revision_id':row['revision_id'],'student_ids':['synthetic-caio','synthetic-lia']},headers=headers('Q','bad-bulk')).status_code==404
    assert client.get('/students/synthetic-caio/lesson-assignments',headers=headers('B')).json()['total']==0
    body={**lesson(),'version':1,'title':'Versão nova em rascunho'}
    r=client.post('/lessons/'+row['id']+'/revisions',json=body,headers=headers('P','revise'));assert r.status_code==200,r.text
    shared=client.get('/lessons?scope=shared',headers=headers('Q')).json()['items'][0]
    assert shared['version']==1 and shared['status']=='synthetic'
    task=assign(client,row,'Q','synthetic-caio')
    again=client.post('/lessons/'+row['id']+'/assign',json={'revision_id':row['revision_id'],'student_ids':['synthetic-caio']},headers=headers('Q','assign')).json()
    assert again['assigned']==1 and again['tasks'][0]['id']==task['id']
    assert client.get('/students/synthetic-caio/lesson-assignments',headers=headers('B')).json()['total']==1
    copy=client.post('/lessons/'+row['id']+'/copy',json={'version':1},headers=headers('Q','copy'));assert copy.status_code==200,copy.text
    assert copy.json()['origin_content_id']==row['id'] and copy.json()['status']=='draft'
    assert client.post('/lessons/'+row['id']+'/shares',json={'revision_id':row['revision_id'],'recipient_id':'test-P'},headers=headers('Q','forbidden-redistribute')).status_code==403
    assert client.post('/lesson-shares/'+share['id']+'/revoke',headers=headers('P','revoke')).status_code==200
    assert client.get('/lessons/'+row['id']+'?revision_id='+row['revision_id'],headers=headers('Q')).status_code==404
    # Previous assignment remains accessible to its authorized adult after content-share revocation.
    assert client.post('/students/synthetic-caio/assignments/'+task['id']+'/start',headers=headers('B','historical-start')).status_code==200


def test_written_normalization_and_configuration():
    q={'id':'t','kind':'text','answer':['PÃO'],'normalization':{'ignore_case':True,'ignore_accents':False}}
    assert grade(q,' pão ')['correct'] is True
    assert grade(q,'pao')['needs_review'] is True
    q['normalization']['ignore_accents']=True
    assert grade(q,'pao')['correct'] is True
