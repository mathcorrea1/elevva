"""Technical fixtures exercise revisions, not pedagogical validity."""
from app.core.config import settings
from tests.test_flows import client, headers


def draft():
    return {'kind': 'activity', 'title': 'Atividade de contrato sem validade pedagógica',
            'instructions': 'Exemplo fictício para o teste de edição.',
            'items': [{'id': 'item-1', 'prompt': 'Primeiro exemplo?', 'choices': ['A', 'B'], 'answer': 0},
                      {'id': 'item-2', 'prompt': 'Segundo exemplo?', 'choices': ['C', 'D', 'E'], 'answer': 2}]}


def test_draft_revisions_preserve_bodies_reviews_and_retry(client, monkeypatch):
    created = client.post('/content', json=draft(), headers=headers('P', 'create')).json()
    path = '/content/' + created['id']
    review = {'version': 1, 'approved': True, 'note': 'Parecer apenas sintético no teste técnico.',
              'references': [{'title': 'Fonte fictícia', 'citation': 'Fixture de teste',
                              'excerpt': 'Trecho fictício usado somente para testar os contratos.'}]}
    monkeypatch.setattr(settings(), 'pedagogical_reviewer_subjects', 'test-Q')
    assert client.post(path + '/reviews', json=review, headers=headers('Q')).status_code == 200
    revised = {**draft(), 'version': 1, 'title': 'Título ajustado pelo autor'}
    revised['items'][1]['answer'] = 1
    assert client.post(path + '/revisions', json=revised, headers=headers('Q')).status_code == 404
    assert client.post(path + '/revisions', json=revised, headers=headers('A')).status_code == 404
    result = client.post(path + '/revisions', json=revised, headers=headers('P', 'edit'))
    assert result.status_code == 200, result.text
    assert result.json()['version'] == 2 and result.json()['review'] is None
    assert client.post(path + '/revisions', json=revised, headers=headers('P', 'edit')).json() == result.json()
    assert client.post(path + '/revisions', json=revised, headers=headers('P', 'stale')).status_code == 409
    publish = {'version': 2, 'review_note': 'Publicação técnica de teste.'}
    assert client.post(path + '/publish', json=publish, headers=headers('P')).status_code == 409
    versions = client.get(path + '/revisions', headers=headers('P')).json()
    assert [v['version'] for v in versions] == [2, 1]
    assert versions[0]['review'] is None
    assert versions[1]['review']['approved'] is True
    assert versions[1]['snapshot']['body']['items'][1]['answer'] == 2
    assert versions[0]['snapshot']['body']['items'][1]['answer'] == 1
    assert client.get(path + '/revisions', headers=headers('B')).status_code == 404
    assert client.get(path + '/revisions', headers=headers('Q')).status_code == 200
    assert client.post(path + '/reviews', json={**review, 'version': 2}, headers=headers('Q')).status_code == 200
    assert client.post(path + '/publish', json=publish, headers=headers('P')).status_code == 200
    assert client.post(path + '/revisions', json={**revised, 'version': 2}, headers=headers('P', 'published')).status_code == 409
    # A published activity assigned to a child keeps the exact approved version/items.
    assigned = client.post('/students/synthetic-lia/assignments', json={'content_id': created['id']},
                           headers=headers('P', 'assign')).json()
    assert assigned['content_version'] == 2
    prefix = '/students/synthetic-lia'
    attempt = client.post(prefix + '/assignments/' + assigned['id'] + '/start', headers=headers('P', 'start')).json()
    assert all('answer' not in item for item in attempt['items'])
    path = prefix + '/attempts/' + attempt['id']
    for index, choice in enumerate([0, 1]):
        response = client.post(path + '/responses', headers=headers('P', 'response-' + str(index)),
                               json={'version': index + 1, 'item_id': 'item-' + str(index + 1), 'choice': choice})
        assert response.status_code == 200
    assert client.post(path + '/finish', headers=headers('P', 'finish'), json={'version': 3}).status_code == 200
    report = client.get(prefix + '/report', headers=headers('P')).json()
    assert report['comparable_results'][0]['correct'] == 2
    assert report['comparable_results'][0]['version'] == 2


def test_invalid_item_sets_are_not_saved(client):
    body = draft()
    body['items'][1]['id'] = 'item-1'
    assert client.post('/content', json=body, headers=headers('P', 'duplicate')).status_code == 422
    body = draft()
    body['items'][0]['answer'] = 4
    assert client.post('/content', json=body, headers=headers('P', 'answer')).status_code == 422
    body = draft()
    body['items'][0]['choices'] = ['A', 'A']
    assert client.post('/content', json=body, headers=headers('P', 'choices')).status_code == 422
    assert client.post('/content', json={**draft(), 'items': []}, headers=headers('P', 'empty')).status_code == 422
    assert client.post('/content', json=draft(), headers=headers('A', 'guardian')).status_code == 403
