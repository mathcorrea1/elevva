from tests.test_flows import client,headers
from tests.test_review_seed import review_db
from scripts.review_data import seed_review_data

def test_overview_scope_comparison_and_filters(client,review_db):
    db,actors=review_db;data=seed_review_data(db,actors);db.commit()
    room=data['classrooms'][0]
    rooms=client.get('/classrooms',headers=headers('P')).json();school=next(r['school_id'] for r in rooms if r['id']==room)
    query='/reports/overview?school_id='+school+'&classroom_id='+room
    value=client.get(query,headers=headers('P'));assert value.status_code==200,value.text
    body=value.json();assert body['totals']['students']==2
    assert body['assessment_freshness']['outdated'] is None
    assert {s['name'].split(' ')[0] for s in body['students']}=={'Lia','Theo'}
    assert body['level_distribution']==[{'level':'unconfirmed','count':2}]
    groups=[g for g in body['comparable_groups'] if g['skill']=='Localizar palavra apresentada · demo']
    assert len(groups)==3 and all(g['responses']==2 and g['students']==2 for g in groups)
    assert client.get(query,headers=headers('Q')).status_code==404
    assert client.get(query,headers=headers('A')).status_code==403
    family=client.get('/reports/overview',headers=headers()).json()
    assert all(s['name'].split(' ')[0] not in ('Caio','Bia') for s in family['students'])
    filtered=client.get(query+'&student_id='+data['students']['lia']+'&skill=Localizar%20palavra%20apresentada%20%C2%B7%20demo',headers=headers('P')).json()
    assert filtered['totals']['students']==1 and all(g['students']==1 for g in filtered['comparable_groups'])
    empty=client.get(query+'&start=2000-01-01&end=2000-01-02',headers=headers('P')).json()
    assert empty['comparable_groups']==[] and empty['series']==[]
    inv=client.get('/students/'+data['students']['lia']+'/investigation?classroom_id='+room,headers=headers('P')).json()
    assert inv['cohort_students']==2
    assert client.get('/students/'+data['students']['lia']+'/investigation?classroom_id='+room,headers=headers()).status_code==404
    grants=client.get('/students/'+data['students']['lia']+'/grants',headers=headers()).json();gid=next(g['id'] for g in grants if g['adult_id']=='test-P')
    client.delete('/students/'+data['students']['lia']+'/grants/'+gid,headers=headers())
    after=client.get(query,headers=headers('P')).json();assert after['totals']['students']==1
    assert all(s['id']!=data['students']['lia'] for s in after['students'])

def test_care_is_explicit_scoped_versioned_and_not_in_ai(client):
    sid='synthetic-lia';prefix='/students/'+sid
    payload={'version':0,'communication':'Comunicação informada fictícia','sensitive_notes':'CONTEUDO-PRIVADO-NAO-ENVIAR','presentation':{'instruction_mode':'concise','font_scale':1.5,'prefer_linear':True}}
    assert client.post(prefix+'/care',json=payload,headers=headers('P','no-owner')).status_code==404
    saved=client.post(prefix+'/care',json=payload,headers=headers(key='care')).json();assert saved['version']==1
    assert client.post(prefix+'/care',json=payload,headers=headers(key='care')).json()==saved
    public=client.get(prefix+'/care',headers=headers('P')).json();assert 'sensitive_notes' not in public and public['presentation']['font_scale']==1.5
    assert client.get(prefix+'/care',headers=headers('B')).status_code==404
    gid=next(g['id'] for g in client.get(prefix+'/grants',headers=headers()).json() if g['adult_id']=='test-P')
    assert client.post(prefix+'/grants/'+gid+'/care-permission',json={'allowed':True},headers=headers(key='share-care')).status_code==200
    assert client.get(prefix+'/care',headers=headers('P')).json()['sensitive_notes']=='CONTEUDO-PRIVADO-NAO-ENVIAR'
    assert client.post(prefix+'/care',json=payload,headers=headers(key='stale')).status_code==409
    generator=app_db(client)
    try:
        from app.features.ai import snapshot_for
        import json
        assert 'CONTEUDO-PRIVADO' not in json.dumps(snapshot_for(next(generator),sid,False))
    finally:generator.close()
    client.delete(prefix+'/grants/'+gid,headers=headers())
    assert client.get(prefix+'/care',headers=headers('P')).status_code==404

def app_db(client):
    from app.main import app
    from app.core.database import session
    yield from app.dependency_overrides[session]()
