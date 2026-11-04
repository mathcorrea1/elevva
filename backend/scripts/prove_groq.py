"""Opt-in real hosted AI proof using only local synthetic demo accounts/evidence."""
import json
import uuid
from pathlib import Path
import httpx


def prove(label, accounts, root):
    account = accounts[label]
    signed = httpx.post('http://127.0.0.1:3001/api/auth/sign-in/email', json={'email': account['email'], 'password': account['password']}, timeout=15)
    signed.raise_for_status()
    headers = {'Authorization': 'Bearer ' + signed.json()['token'], 'Idempotency-Key': str(uuid.uuid4())}
    students = httpx.get('http://127.0.0.1:8100/students', headers=headers).json()
    if len(students) != 1:
        raise SystemExit('Use the isolated full-stack synthetic seed: exactly one student per demo owner.')
    response = httpx.post(f"http://127.0.0.1:8100/students/{students[0]['id']}/analyses", json={'synthetic_instrument': True}, headers=headers, timeout=55)
    if response.status_code == 503:
        raise SystemExit('Configure GROQ_API_KEY and AI_ALLOW_SYNTHETIC=true in backend/.env and restart the development API. Never paste secrets in chat.')
    response.raise_for_status()
    analysis = response.json()
    output = root / 'Eleva V2/evidencias' / f'groq-live-{label}.json'
    output.write_text(json.dumps(analysis, ensure_ascii=False, indent=2), encoding='utf-8')
    print(json.dumps({'profile': label, 'status': analysis['status'], 'origin': analysis['origin'], 'model': analysis['model'], 'request_id': analysis['request_id'], 'technical_synthetic_only': True}))
    if analysis['status'] != 'completed': raise SystemExit(1)


if __name__ == '__main__':
    import argparse
    parser = argparse.ArgumentParser()
    parser.add_argument('--profile', choices=['A', 'B'], default='A')
    args = parser.parse_args()
    root = Path(__file__).resolve().parents[2]
    accounts = json.loads((root / 'identity/demo-accounts.local.json').read_text(encoding='utf-8'))
    prove(args.profile, accounts, root)
