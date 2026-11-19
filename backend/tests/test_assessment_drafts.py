from test_flows import client, headers
from app.features.ai import validate_result, Result
import pytest

def test_draft_persists_is_private_versioned_and_cleared_transactionally(client):
    path = '/students/synthetic-lia/assessment-draft'
    body = {'version': 0, 'item': 'Proposta sintética', 'response': 'Resposta parcial', 'notes': 'Rascunho privado'}
    first = client.put(path, json=body, headers=headers('A', 'draft'))
    assert first.status_code == 200, first.text
    assert first.json()['version'] == 1
    assert client.put(path, json=body, headers=headers('A', 'draft')).json() == first.json()
    assert client.get(path, headers=headers('A')).json()['body']['notes'] == 'Rascunho privado'
    assert client.get(path, headers=headers('P')).json()['body'] is None
    assert client.get(path, headers=headers('B')).status_code == 404
    assert client.put(path, json=body, headers=headers('A', 'stale')).status_code == 409
    body['version'] = 1
    assert client.put(path, json=body, headers=headers('A', 'next')).json()['version'] == 2
    failed = client.post('/students/synthetic-lia/assessments', json={'instrument': 'descritivo', 'evidence': []}, headers=headers('A', 'invalid'))
    assert failed.status_code == 422
    assert client.get(path, headers=headers('A')).json()['version'] == 2
    done = client.post('/students/synthetic-lia/assessments', json={'instrument': 'descritivo', 'evidence': [{'item': 'Proposta', 'response': 'Resposta'}]}, headers=headers('A', 'finish-draft'))
    assert done.status_code == 200, done.text
    assert client.get(path, headers=headers('A')).json()['body'] is None
    assert client.put(path, json=body, headers=headers('A', 'late-draft')).status_code == 409

def test_new_analysis_supports_five_levels_without_reclassifying_legacy():
    schema = Result.model_json_schema()['properties']['suggested_level']['anyOf'][0]
    assert len(schema['enum']) == 5 and 'silabico' not in schema['enum']
    snapshot = {'schema_version': '2', 'rubric': {'approved': False}, 'technical_test': True, 'evidence': [{'id': 'synthetic'}], 'allowed_activities': [], 'sources': []}
    value = {'state': 'suggestion', 'suggested_level': 'silabico-sem-valor', 'summary': 'Teste técnico, sem rubrica pedagógica.', 'evidence_ids': ['synthetic'], 'limitations': ['Demonstração sintética'], 'recommendations': []}
    for level in ('pre-silabico', 'silabico-sem-valor', 'silabico-com-valor', 'silabico-alfabetico', 'alfabetico'):
        assert validate_result({**value, 'suggested_level': level}, snapshot)['suggested_level'] == level
    with pytest.raises(ValueError):
        validate_result({**value, 'suggested_level': 'silabico'}, snapshot)
    assert validate_result({**value, 'suggested_level': 'silabico'}, {**snapshot, 'schema_version': '1'})['suggested_level'] == 'silabico'
