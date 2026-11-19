"""Provider responses are isolated doubles; these tests never claim a live AI call."""
import base64
import copy
import re
import zlib
import httpx
import pytest
from app.core.config import settings
from app.features.lessons import generation as g
from test_flows import client, headers

def request():
    return {'objective':'Praticar a formação de palavras sobre animais.','literacy_level':'silabico-com-valor',
            'mechanics':['single'],'activity_count':1,'privacy_confirmed':True}

def proposal(title='Animais e palavras'):
    return {'refusal':False,'title':title,'description':'Proposta sintética para teste de integração.','objective':'Explorar palavras familiares.',
            'skills':['Reconhecimento de palavras'],'audience':'Grupo de aprendizagem','adaptations':'Instruções curtas.',
            'warnings':['Revisão pedagógica necessária.'], 'screens':[
                {'type':'text','title':'Vamos explorar','text':'Observe as palavras com atenção.','question':None},
                {'type':'activity','title':'Uma descoberta','text':'','question':{
                    'kind':'single','prompt':'Qual palavra nomeia um animal?','skill':'Reconhecimento de palavras','instruction':'Escolha uma opção.',
                    'options':['GATO','MESA'],'targets':[],'answer_indices':[0],'accepted_answers':[],
                    'feedback_correct':'Você encontrou!','feedback_incorrect':'Observe outra vez.','hint':'Pense em um animal do cotidiano.',
                    'reading_allowed':False,'ignore_accents':False}},
                {'type':'completion','title':'Até a próxima','text':'Você concluiu esta aula.','question':None}]}

@pytest.fixture
def configured(monkeypatch):
    monkeypatch.setattr(settings(),'groq_api_key','isolated-test-only')
    monkeypatch.setattr(settings(),'ai_min_start_interval_seconds',0)
    monkeypatch.setattr(settings(),'ai_user_daily_limit',20)
    calls=[]
    def fake(payload,instruction):
        calls.append(payload)
        assert not any(k in payload for k in ('student_id','name','email','diagnosis','evidence'))
        return 'completed',proposal(),{'total_tokens':42},'technical-request-id'
    monkeypatch.setattr(g,'provider',fake)
    return calls

def test_generation_review_draft_reuse_and_isolation(client,configured):
    body=request();res=client.post('/ai/lesson-generations',json=body,headers=headers('P','gen'))
    assert res.status_code==200,res.text
    value=res.json();assert value['status']=='completed' and value['origin']=='live'
    lid=value['id'];assert value['result']['lesson']['screens'][1]['question']['answer']=='o0'
    assert client.get('/ai/lesson-generations/'+lid,headers=headers('Q')).status_code==404
    assert client.post('/ai/lesson-generations/'+lid+'/draft',headers=headers('Q','steal')).status_code==404
    assert client.post('/ai/lesson-generations',json=body,headers=headers('A','guardian')).status_code==403
    replay=client.post('/ai/lesson-generations',json=body,headers=headers('P','gen')).json()
    assert replay['id']==lid and len(configured)==1
    body['objective']='Outro objetivo de aprendizagem com letras.'
    assert client.post('/ai/lesson-generations',json=body,headers=headers('P','gen')).status_code==409
    draft=client.post('/ai/lesson-generations/'+lid+'/draft',headers=headers('P','draft')).json()
    again=client.post('/ai/lesson-generations/'+lid+'/draft',headers=headers('P','different-key')).json()
    assert draft['id']==again['id'] and draft['status']=='draft'
    assert draft['body']['literacy_level']=='silabico-com-valor'
    assert client.post('/lessons/'+draft['id']+'/publish',json={'version':1},headers=headers('P','publish')).status_code==409
    assert client.get('/lessons?scope=mine',headers=headers('P')).json()['total']==1
    assert client.get('/ai/lesson-generations',headers=headers('Q')).json()['items']==[]

def test_generation_cache_is_personal_and_different_objectives_request_again(client,configured):
    first=client.post('/ai/lesson-generations',json=request(),headers=headers('P','first')).json()
    cache=client.post('/ai/lesson-generations',json=request(),headers=headers('P','cache')).json()
    assert cache['origin']=='cached' and cache['usage']['cached_from']==first['id'] and len(configured)==1
    body=request();body['objective']='Criar uma aula sobre as sílabas do jardim.'
    second=client.post('/ai/lesson-generations',json=body,headers=headers('P','second')).json()
    assert second['origin']=='live' and len(configured)==2
    assert configured[0]['objective']!=configured[1]['objective']
    assert client.post('/ai/lesson-generations',json=request(),headers=headers('Q','other-account')).json()['origin']=='live'

@pytest.mark.parametrize('status',['quota','refused','truncated','provider_error'])
def test_provider_failures_preserve_manual_authoring(client,configured,monkeypatch,status):
    monkeypatch.setattr(g,'provider',lambda *_:(status,None,None,None))
    result=client.post('/ai/lesson-generations',json=request(),headers=headers('P','failed')).json()
    assert result['status']==status and result['result'] is None
    assert client.post('/ai/lesson-generations/'+result['id']+'/draft',headers=headers('P','no-draft')).status_code==409
    assert client.get('/students/synthetic-lia/report',headers=headers('A')).status_code==200
    assert client.get('/lessons',headers=headers('P')).json()['total']==0

def test_generation_validation_timeout_and_privacy(client,configured,monkeypatch):
    bad=proposal();bad['screens'][1]['question']['answer_indices']=[55]
    monkeypatch.setattr(g,'provider',lambda *_:('completed',bad,None,None))
    assert client.post('/ai/lesson-generations',json=request(),headers=headers('P','invalid')).json()['status']=='invalid_response'
    def timeout(*_):raise httpx.ReadTimeout('technical timeout')
    monkeypatch.setattr(g,'provider',timeout)
    assert client.post('/ai/lesson-generations',json=request(),headers=headers('P','timeout')).json()['status']=='timeout'
    for objective in ('Enviar para aluno@example.com uma aula.','Usar o documento 123.456.789-10 na aula.'):
        body=request();body['objective']=objective
        assert client.post('/ai/lesson-generations',json=body,headers=headers('P','privacy')).status_code==422
    body=request();body['privacy_confirmed']=False
    assert client.post('/ai/lesson-generations',json=body,headers=headers('P','privacy')).status_code==422

def test_no_credential_no_fake_generation_and_quota_shared(client,monkeypatch):
    monkeypatch.setattr(settings(),'groq_api_key','')
    assert client.post('/ai/lesson-generations',json=request(),headers=headers('P','none')).status_code==503
    assert client.get('/ai/lesson-generations',headers=headers('P')).json()['items']==[]
    monkeypatch.setattr(settings(),'groq_api_key','isolated-test-only')
    monkeypatch.setattr(settings(),'ai_project_daily_limit',0)
    assert client.post('/ai/lesson-generations',json=request(),headers=headers('P','quota')).status_code==429

def test_strict_schema_has_no_optional_object_properties():
    def inspect(value):
        if isinstance(value,dict):
            if value.get('type')=='object':
                assert value['additionalProperties'] is False
                assert set(value['required'])==set(value['properties'])
            for v in value.values():inspect(v)
        elif isinstance(value,list):
            for v in value:inspect(v)
    inspect(g.Proposal.model_json_schema())

@pytest.mark.parametrize('kind,options,targets,indices,answers,expected',[
    ('single',['A','B'],[],[0],[],'o0'),
    ('multiple',['A','B','C'],[],[0,2],[],['o0','o2']),
    ('order',['SA','CA'],[],[1,0],[],['o1','o0']),
    ('matching',['A','B'],['X','Y'],[1,0],[],{'o0':'t1','o1':'t0'}),
    ('text',[],[],[],['casa','CASA'],['casa','CASA']),
])
def test_ai_proposals_compile_to_all_real_executor_mechanics(kind,options,targets,indices,answers,expected):
    output=proposal();question=output['screens'][1]['question']
    question.update(kind=kind,options=options,targets=targets,answer_indices=indices,accepted_answers=answers)
    body=request();body['mechanics']=[kind]
    result=g.validated_proposal(output,g.Generate.model_validate(body))
    assert result['lesson']['screens'][1]['question']['answer']==expected
    assert result['lesson']['visibility']=='private' and result['review_required'] is True

def decoded_streams(binary):
    result=b''
    for stream in re.findall(rb'stream\r?\n(.*?)endstream',binary,re.S):
        try:result+=zlib.decompress(base64.a85decode(stream.strip(),adobe=True))
        except (ValueError,zlib.error):pass
    return result

def test_private_pdf_from_persisted_evidence_permissions_period_and_sensitive_exclusion(client):
    client.post('/students/synthetic-lia/care',json={'version':0,'communication':'PRIVATE_COMMUNICATION','sensitive_notes':'SENSITIVE_CLINICAL_NOTE'},headers=headers('A','care'))
    for label in ('A','P'):
        result=client.get('/students/synthetic-lia/report-pdf?detail=detailed',headers=headers(label))
        assert result.status_code==200,result.text
        assert result.headers['cache-control']=='private, no-store'
        binary=base64.b64decode(result.json()['base64']);assert binary.startswith(b'%PDF-') and b'%%EOF' in binary
        text=decoded_streams(binary);assert b'Jornada individual' in text and b'PRIVATE_COMMUNICATION' not in text and b'SENSITIVE_CLINICAL_NOTE' not in text
        assert b'ELEVVA' in text
    for suffix in ('report-pdf','report-pdf?detail=detailed'):
        assert client.get('/students/synthetic-lia/'+suffix,headers=headers('B')).status_code==404
    assert client.get('/students/synthetic-lia/report-pdf?start=2026-11-20&end=2026-11-01',headers=headers()).status_code==422
    assert client.get('/classrooms/synthetic-class/report-pdf',headers=headers('Q')).status_code==404
    rooms=client.get('/classrooms',headers=headers('P')).json()
    cid=rooms[0]['id']
    assert client.get('/classrooms/'+cid+'/report-pdf?detail=detailed',headers=headers('P')).status_code==200

def test_human_level_keeps_two_syllabic_variants_distinct(client):
    event=client.post('/students/synthetic-lia/observations',json={'context':'Teste sintético','text':'Evidência técnica de observação.'},headers=headers('P','obs')).json()
    for i,level in enumerate(('silabico-sem-valor','silabico-com-valor')):
        student=client.get('/students/synthetic-lia',headers=headers('P')).json()
        result=client.post('/students/synthetic-lia/level-confirmations',json={'version':student['version'],'level':level,'justification':'Registro técnico fictício; revisão pedagógica pendente.','evidence_ids':[event['id']]},headers=headers('P','level-'+str(i)))
        assert result.status_code==200,result.text
        assert client.get('/students/synthetic-lia/report',headers=headers('P')).json()['confirmed_level']==level
