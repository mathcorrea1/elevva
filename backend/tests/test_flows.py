import os
os.environ['ELEVA_ENV'] = 'test'
os.environ['DATABASE_URL'] = 'sqlite://'
os.environ['ENABLE_TEST_IDENTITIES'] = 'true'
os.environ['TEST_IDENTITY_SECRET'] = 'isolated-tests-only-not-a-production-secret-123456'
os.environ['AI_ALLOW_SYNTHETIC'] = 'true'

import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
from sqlalchemy import create_engine
from app.core.database import Base, session, make_engine
from app.core.auth import test_token as make_token
from app.main import app
from app.features import ai
from app.core.config import settings
from scripts.seed import seed


@pytest.fixture
def client():
    engine = make_engine('sqlite://', poolclass=StaticPool)
    Base.metadata.create_all(engine)
    factory = sessionmaker(engine, expire_on_commit=False)
    with factory.begin() as db:
        seed(db)
    def override():
        with factory() as db:
            try:
                yield db
                db.commit()
            except Exception:
                db.rollback()
                raise
    app.dependency_overrides[session] = override
    yield TestClient(app)
    app.dependency_overrides.clear()
    engine.dispose()


def headers(label='A', key='operation-1'):
    return {'Authorization': 'Bearer ' + make_token('test-' + label), 'Idempotency-Key': key}


def test_isolation_every_child_resource(client):
    assert len(client.get('/students', headers=headers('A')).json()) == 1
    assert client.get('/students/synthetic-lia', headers=headers('Q')).status_code == 404
    for path in ('history', 'report', 'grants', 'assignments', 'analyses', 'guidance', 'audit', 'attention'):
        assert client.get('/students/synthetic-lia/' + path, headers=headers('B')).status_code == 404
    assert client.post('/students/synthetic-lia/observations', headers=headers('B'), json={'context': 'x', 'text': 'x'}).status_code == 404
    assert client.post('/students/synthetic-lia/analyses', headers=headers('B'), json={}).status_code == 404


def test_idempotency_and_persistence(client):
    body = {'name': 'Novo fictício', 'supports': []}
    a = client.post('/students', json=body, headers=headers())
    b = client.post('/students', json=body, headers=headers())
    assert a.status_code == b.status_code == 201
    assert a.json()['id'] == b.json()['id']
    assert len(client.get('/students', headers=headers()).json()) == 2
    assert client.post('/students', json={'name': 'Outro'}, headers=headers()).status_code == 409
    assert client.get('/students/' + a.json()['id'], headers=headers('B')).status_code == 404


def test_grant_revoke_and_collective(client):
    invite = client.post('/students/synthetic-lia/invitations', json={'role': 'teacher', 'recipient_id': 'test-Q'}, headers=headers()).json()
    assert 'token' in invite
    assert client.post('/invitations/accept', json={'token': invite['token']}, headers=headers('Q')).status_code == 200
    assert client.get('/students/synthetic-lia/report', headers=headers('Q')).status_code == 200
    grants = client.get('/students/synthetic-lia/grants', headers=headers()).json()
    gid = next(g['id'] for g in grants if g['adult_id'] == 'test-Q')
    assert client.delete('/students/synthetic-lia/grants/' + gid, headers=headers()).status_code == 200
    assert client.get('/students/synthetic-lia/report', headers=headers('Q')).status_code == 404
    assert client.get('/classrooms/synthetic-classroom/report', headers=headers('Q')).status_code == 404


def test_executor_unlock_and_report_source(client):
    prefix = '/students/synthetic-lia'
    assign = lambda key: client.post(prefix + '/assignments', json={'content_id': 'synthetic-activity-1'}, headers=headers(key=key)).json()
    first, second = assign('assign-1'), assign('assign-2')
    assert client.post(prefix + '/assignments/' + second['id'] + '/start', headers=headers(key='blocked')).status_code == 409
    attempt = client.post(prefix + '/assignments/' + first['id'] + '/start', headers=headers(key='start')).json()
    assert all('answer' not in i for i in attempt['items'])
    path = prefix + '/attempts/' + attempt['id']
    assert client.post(path + '/finish', json={'version': 1}, headers=headers(key='early')).status_code == 422
    for index, item in enumerate(attempt['items']):
        body = {'version': index + 1, 'item_id': item['id'], 'choice': index}
        response = client.post(path + '/responses', json=body, headers=headers(key='answer-' + str(index)))
        assert response.status_code == 200, response.text
    assert client.post(path + '/responses', json={'version': 1, 'item_id': 'letra-a', 'choice': 2}, headers=headers(key='stale')).status_code == 409
    end = client.post(path + '/finish', json={'version': 3}, headers=headers(key='finish'))
    assert end.status_code == 200, end.text
    assert client.post(path + '/finish', json={'version': 3}, headers=headers(key='finish')).json() == end.json()
    report = client.get(prefix + '/report', headers=headers()).json()
    assert report['completed_tasks'] == 1
    assert report['comparable_results'][0]['correct'] == 2
    assert report['comparable_results'][0]['responses'] == 2
    assert report['confirmed_level'] is None
    assert client.get(prefix + '/assignments', headers=headers()).json()[1]['locked'] is False


def test_ai_failure_does_not_block_learning(client, monkeypatch):
    monkeypatch.setattr(settings(), 'groq_api_key', '')
    assert client.post('/students/synthetic-lia/analyses', json={}, headers=headers()).status_code == 503
    assert client.post('/students/synthetic-lia/observations', json={'context': 'Leitura oral', 'text': 'Registro adulto'}, headers=headers()).status_code == 200


def test_ai_two_snapshots_validation_and_review(client, monkeypatch):
    monkeypatch.setattr(settings(), 'groq_api_key', 'test-only-not-real')
    monkeypatch.setattr(settings(), 'ai_min_start_interval_seconds', 0)
    calls = []
    def fake(snapshot, prompt):
        calls.append(snapshot)
        a = snapshot['evidence'][0]
        assessment = next(e for e in snapshot['evidence'] if e['type'] == 'assessment')
        response = assessment['items'][0]['response']
        return 'completed', {'state': 'suggestion', 'suggested_level': 'silabico-sem-valor' if response == 'A' else 'pre-silabico',
            'summary': 'Teste sintético com resposta ' + response, 'evidence_ids': [a['id']],
            'limitations': ['Sem validade pedagógica'], 'recommendations': []}, {'total_tokens': 5}, 'fake-id'
    monkeypatch.setattr(ai, 'provider', fake)
    results = []
    for label, sid in [('A', 'synthetic-lia'), ('B', 'synthetic-caio')]:
        value = client.post(f'/students/{sid}/analyses', json={'synthetic_instrument': True}, headers=headers(label)).json()
        assert value['status'] == 'completed', value
        results.append(value)
    assert results[0]['result']['suggested_level'] != results[1]['result']['suggested_level']
    assert 'name' not in str(calls) and 'diagnosis' not in str(calls)
    assert client.post('/students/synthetic-lia/analyses/' + results[0]['id'] + '/review', json={'decision': 'accepted'}, headers=headers()).status_code == 200
    assert client.get('/students/synthetic-lia', headers=headers()).json()['confirmed_level'] is None
    with pytest.raises(ValueError):
        ai.validate_result({**results[0]['result'], 'evidence_ids': ['another-child']}, calls[0])
