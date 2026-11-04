"""Real Better Auth + API, loopback only, synthetic identities, no cloud or paid services."""
import json
import secrets
import time
import uuid
from pathlib import Path
import httpx

api, auth = 'http://127.0.0.1:8100', 'http://127.0.0.1:3001/api/auth'
receipts = []
accounts = {}


def request(label, method, path, body=None):
    headers = {'Authorization': 'Bearer ' + accounts[label]['token'], 'Idempotency-Key': str(uuid.uuid4())}
    response = httpx.request(method, api + path, headers=headers, json=body, timeout=15)
    return response


def main():
    stamp = str(int(time.time()))
    for label in ('A', 'B', 'P', 'Q'):
        email = f'eleva-{label.lower()}-{stamp}@example.invalid'
        password = secrets.token_urlsafe(24)
        response = httpx.post(auth + '/sign-up/email', json={'name': 'Adulto fictício ' + label, 'email': email, 'password': password}, headers={'Origin': 'http://localhost:8081'})
        assert response.status_code == 200, (response.status_code, response.text)
        account = response.json()
        accounts[label] = {'email': email, 'password': password, 'token': account['token'], 'id': account['user']['id']}
        assert request(label, 'GET', '/me').status_code == 200
        response = request(label, 'PATCH', '/me', {'display_name': 'Adulto fictício ' + label, 'profession': 'teacher' if label in ('P', 'Q') else 'guardian'})
        assert response.status_code == 200
    receipts.append('Real local Better Auth sign-up and server session introspection: A/B/P/Q')
    student_ids = []
    for owner, teacher, name, answer in [('A', 'P', 'Lia', 'A'), ('B', 'Q', 'Caio', 'B')]:
        response = request(owner, 'POST', '/students', {'name': name + ' — fictício', 'supports': []})
        assert response.status_code == 201, response.text
        sid = response.json()['id']
        student_ids.append(sid)
        inv = request(owner, 'POST', f'/students/{sid}/invitations', {'role': 'teacher', 'recipient_id': accounts[teacher]['id']}).json()
        assert request(teacher, 'POST', '/invitations/accept', {'token': inv['token']}).status_code == 200
        school = request(teacher, 'POST', '/schools', {'name': 'Escola fictícia ' + teacher}).json()
        classroom = request(teacher, 'POST', '/classrooms', {'name': 'Turma fictícia ' + teacher, 'school_id': school['id']}).json()
        assert request(teacher, 'POST', '/classrooms/' + classroom['id'] + '/enrollments', {'student_id': sid}).status_code == 200
        assert request(teacher, 'POST', f'/students/{sid}/guidance', {'title': 'Orientação fictícia para revisão', 'text': 'Texto de demonstração ainda sem validação pedagógica.'}).status_code == 200
        assert request(teacher, 'POST', f'/students/{sid}/assessments', {'instrument': 'synthetic-integration-v1', 'evidence': [{'item': 'som-inicial', 'response': answer, 'support': 'Teste fictício'}], 'synthetic': True}).status_code == 200
        assert request(owner, 'POST', f'/students/{sid}/observations', {'context': 'Leitura oral acompanhada', 'text': 'Registro fictício de observação adulta, separado da execução.'}).status_code == 200
        assignment = request(owner, 'POST', f'/students/{sid}/assignments', {'content_id': 'synthetic-activity-1'}).json()
        attempt = request(owner, 'POST', f"/students/{sid}/assignments/{assignment['id']}/start", {}).json()
        for index, item in enumerate(attempt['items']):
            response = request(owner, 'POST', f"/students/{sid}/attempts/{attempt['id']}/responses", {'version': index + 1, 'item_id': item['id'], 'choice': index if owner == 'A' else 0})
            assert response.status_code == 200, response.text
        assert request(owner, 'POST', f"/students/{sid}/attempts/{attempt['id']}/finish", {'version': 3}).status_code == 200
        report = request(owner, 'GET', f'/students/{sid}/report').json()
        assert report['completed_tasks'] == 1 and report['observations'] == 1
        assert report['comparable_results'][0]['correct'] == (2 if owner == 'A' else 1)
        collective = request(teacher, 'GET', '/classrooms/' + classroom['id'] + '/report').json()
        assert collective['students'][0]['completed_tasks'] == report['completed_tasks']
        assert request('B' if owner == 'A' else 'A', 'GET', f'/students/{sid}/report').status_code == 404
    receipts.append('Independent children, explicit teacher grants, assessments, observations, attempts, individual/collective reports and school/classroom contexts persisted')
    sid = student_ids[0]
    assert request('A', 'POST', f'/students/{sid}/analyses', {}).status_code == 503
    assert request('A', 'GET', f'/students/{sid}/history').status_code == 200
    receipts.append('Groq absent: explicit 503; core learning/history still available')
    # Logout invalidates the session at Better Auth and immediately at FastAPI introspection.
    response = httpx.post(auth + '/sign-out', json={}, headers={'Authorization': 'Bearer ' + accounts['Q']['token'], 'Origin': 'http://localhost:8081'})
    assert response.status_code == 200
    assert request('Q', 'GET', '/students').status_code == 401
    receipts.append('Real Better Auth logout rejects prior session in FastAPI')
    out = Path(__file__).resolve().parents[2] / 'identity' / 'demo-accounts.local.json'
    # Local operator file only, ignored by git; no tokens/passwords printed or put in the application.
    out.write_text(json.dumps({label: {k: v for k, v in value.items() if k != 'token'} for label, value in accounts.items()}, indent=2), encoding='utf-8')
    evidence = Path(__file__).resolve().parents[2] / 'Eleva V2' / 'evidencias' / 'full-stack-smoke.json'
    evidence.write_text(json.dumps({'environment': 'local-development-sqlite', 'checks': receipts, 'groq_live': False}, ensure_ascii=False, indent=2), encoding='utf-8')
    print(json.dumps({'checks_passed': len(receipts), 'credentials_file': str(out), 'groq_live': False}))


if __name__ == '__main__':
    main()
