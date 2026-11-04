from tests.test_flows import client, headers


def test_stage_transaction_idempotence_unlock_and_report(client):
    prefix = '/students/synthetic-lia'
    stage = {'title': 'Descobertas', 'description': 'Cenário técnico', 'content_ids': ['synthetic-activity-1']}
    a = client.post(prefix + '/stages', json=stage, headers=headers(key='stage-one'))
    assert a.status_code == 200, a.text
    assert client.post(prefix + '/stages', json=stage, headers=headers(key='stage-one')).json() == a.json()
    client.post(prefix + '/stages', json=stage, headers=headers(key='stage-two'))
    path = client.get(prefix + '/journey', headers=headers()).json()
    assert [s['state'] for s in path['stages']] == ['available', 'locked']
    assert path['total_tasks'] == 2 and not path['achievements']
    assert client.get(prefix + '/journey', headers=headers('B')).status_code == 404
    assert client.post(prefix + '/stages', json=stage, headers=headers('B')).status_code == 404
    task = path['stages'][0]['tasks'][0]
    attempt = client.post(prefix + '/assignments/' + task['id'] + '/start', headers=headers(key='start-stage')).json()
    for i, item in enumerate(attempt['items']):
        response = client.post(prefix + '/attempts/' + attempt['id'] + '/responses',
            json={'version': i + 1, 'item_id': item['id'], 'choice': i}, headers=headers(key='response-stage-' + str(i)))
        assert response.status_code == 200
        attempt['version'] = response.json()['version']
    result = client.post(prefix + '/attempts/' + attempt['id'] + '/finish', json={'version': attempt['version']}, headers=headers(key='finish-stage'))
    assert result.status_code == 200
    assert client.post(prefix + '/attempts/' + attempt['id'] + '/finish', json={'version': attempt['version']}, headers=headers(key='finish-stage')).json() == result.json()
    path = client.get(prefix + '/journey', headers=headers()).json()
    assert [s['state'] for s in path['stages']] == ['completed', 'available']
    assert {m['id'] for m in path['achievements']} == {'first-task', 'first-stage'}
    report = client.get(prefix + '/report', headers=headers()).json()
    assert report['completed_tasks'] == report['completed_stages'] == 1
    assert sum(p['activities'] for p in report['series']) == report['finished_attempts'] == 1
    assert report['confirmed_level'] is None
    empty = client.get(prefix + '/report?start=2000-01-01&end=2000-01-02', headers=headers()).json()
    assert empty['completed_stages'] == empty['completed_tasks'] == 0 and empty['series'] == []


def test_stage_validation_is_atomic_and_archive_preserves_assignment(client):
    prefix = '/students/synthetic-lia'
    invalid = {'title': 'Etapa', 'content_ids': ['synthetic-activity-1', 'missing']}
    assert client.post(prefix + '/stages', json=invalid, headers=headers(key='bad-stage')).status_code == 422
    assert client.get(prefix + '/journey', headers=headers()).json()['stages'] == []
    assert client.post(prefix + '/stages', json={'title':'  ', 'content_ids':['synthetic-activity-1']}, headers=headers(key='blank')).status_code == 422
    task = client.post(prefix + '/assignments', json={'content_id':'synthetic-activity-1'}, headers=headers(key='before-archive')).json()
    assert client.post('/content/synthetic-activity-1/archive',json={'version':1},headers=headers('Q','not-author')).status_code == 404
    archived = client.post('/content/synthetic-activity-1/archive',json={'version':1},headers=headers('P','archive')).json()
    assert archived['archived_at'] and archived['version']==2
    assert client.post('/content/synthetic-activity-1/archive',json={'version':1},headers=headers('P','archive')).json()==archived
    assert client.post(prefix + '/assignments',json={'content_id':'synthetic-activity-1'},headers=headers(key='after-archive')).status_code==422
    assert client.post(prefix + '/assignments/'+task['id']+'/start',headers=headers(key='preserved')).status_code==200
    assert all(c['id']!='synthetic-activity-1' for c in client.get('/content',headers=headers()).json())
    assert client.post('/content/synthetic-activity-1/restore',json={'version':2},headers=headers('P','restore')).status_code==200


def test_teacher_context_is_scoped_and_grant_revocation_applies(client):
    assert client.get('/teaching/context',headers=headers()).status_code==403
    assert client.get('/teaching/context?school_id=synthetic-school',headers=headers('Q')).status_code==404
    assert client.get('/teaching/context?classroom_id=synthetic-classroom',headers=headers('Q')).status_code==404
    query='/teaching/context?school_id=synthetic-school&classroom_id=synthetic-classroom'
    context=client.get(query,headers=headers('P')).json()
    assert [s['id'] for s in context['students']]==['synthetic-lia']
    assert client.get(query+'&search=missing',headers=headers('P')).json()['students']==[]
    grant=next(g for g in client.get('/students/synthetic-lia/grants',headers=headers()).json() if g['adult_id']=='test-P')
    assert client.delete('/students/synthetic-lia/grants/'+grant['id'],headers=headers()).status_code==200
    assert client.get(query,headers=headers('P')).json()['students']==[]
    assert client.get('/students/synthetic-lia/journey',headers=headers('P')).status_code==404
