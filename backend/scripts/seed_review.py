"""Create/reuse real local Better Auth accounts and add repeatable review fixtures."""
import argparse
import json
import secrets
import uuid
from datetime import datetime, timezone
from pathlib import Path
import httpx
from dotenv import dotenv_values
from sqlalchemy import select
from app.core.database import SessionLocal
from app.features import models as m
from app.features.learning import report
from scripts.prepare_local import ROOT, main as prepare_local
from scripts.review_data import seed_review_data

ACTORS = {'A': ('Ana', 'guardian', 'ana'), 'B': ('Bruno', 'guardian', 'bruno'),
          'P': ('Marina', 'teacher', 'marina'), 'Q': ('Paula', 'teacher', 'paula'),
          'G': ('Gustavo', 'teacher', 'gustavo')}
API = 'http://127.0.0.1:8100'
AUTH = 'http://127.0.0.1:3001'


def expect(response, statuses=(200,)):
    if response.status_code not in statuses:
        raise RuntimeError(f'Preparação local não concluída: HTTP{response.status_code}. Dados anteriores foram preservados; não há fallback de autenticação.')
    return response.json()


def prepare_accounts(path):
    accounts = json.loads(path.read_text(encoding='utf-8')) if path.exists() else {}
    for label, (name, profession, slug) in ACTORS.items():
        if label not in accounts:
            accounts[label] = {'email': slug + '.revisao@eleva.example.invalid', 'password': secrets.token_urlsafe(18)}
        account = accounts[label]
        if not account['email'].endswith('@eleva.example.invalid'):
            raise RuntimeError('Arquivo de revisão contém conta fora do domínio sintético esperado; operação interrompida.')
        # Save before account creation, so interruption never loses its generated password.
        path.write_text(json.dumps(accounts, ensure_ascii=False, indent=2), encoding='utf-8')
        payload = {'email': account['email'], 'password': account['password']}
        response = httpx.post(AUTH + '/api/auth/sign-in/email', json=payload,
                              headers={'Origin': 'http://localhost:8081'}, timeout=15)
        if response.status_code == 401:
            response = httpx.post(AUTH + '/api/auth/sign-up/email', json={**payload, 'name': name + ' · demonstração'},
                                  headers={'Origin': 'http://localhost:8081'}, timeout=15)
        value = expect(response)
        account['id'] = value['user']['id']
        headers = {'Authorization': 'Bearer ' + value['token']}
        me = expect(httpx.get(API + '/me', headers=headers, timeout=15))
        if not account.get('initialized'):
            expect(httpx.patch(API + '/me', headers=headers, json={'display_name': name + ' · demonstração', 'profession': profession}, timeout=15))
            account['initialized'] = True
        elif me['profession'] != profession:
            print('Contexto alterado pelo usuário na conta ' + label + '; preservado.')
        # Never store the session token in the operator sheet or application.
        path.write_text(json.dumps(accounts, ensure_ascii=False, indent=2), encoding='utf-8')
        expect(httpx.post(AUTH + '/api/auth/sign-out', json={}, headers=headers, timeout=15))
    return accounts


def write_access_sheet(accounts, private_invites, output):
    if output.exists():
        backup = ROOT / '.eleva-local' / 'backups' / ('acessos-' + datetime.now(timezone.utc).strftime('%Y%m%dT%H%M%S%fZ') + '.md')
        backup.parent.mkdir(parents=True, exist_ok=True)
        backup.write_bytes(output.read_bytes())
    lines = ['# Acessos para revisar o Eleva', '', 'Abra http://localhost:8081. Todos os dados abaixo são fictícios e locais.', '',
             '| Pessoa | Perfil | E-mail | Senha |', '|---|---|---|---|']
    for label, (name, profession, _) in ACTORS.items():
        a = accounts[label]
        role = 'Gestor escolar' if label == 'G' else 'Professor' if profession == 'teacher' else 'Responsável'
        lines.append(f"| {name} | {role} | {a['email']} | {a['password']} |")
    lines += ['', '## O que testar', '',
        '- Ana: Lia tem histórico e tarefas concluídas, em andamento e bloqueadas; Theo tem uma atividade em andamento; Nina aguarda avaliação inicial.',
        '- Marina: acompanha Lia, Theo e Nina por vínculo explícito; tem duas turmas e rascunhos na Biblioteca.',
        '- Bruno: acompanha Caio e Bia. Não vê as crianças de Ana.',
        '- Paula: acompanha Caio e Bia; o vínculo antigo com Theo está revogado até aceitar novo convite explícito.',
        '- Gustavo: gestor da Escola Horizonte, com vínculos individuais explicitamente concedidos por Ana para Lia, Theo e Nina. Não vê os estudantes de Bruno.',
        '- Os registros da área IA são exemplos pré-gerados identificados. Nenhuma chamada ao Groq é criada pelo seed.',
        '- Instrumentos continuam em rascunho, sem parecer pedagógico inventado. Níveis permanecem sem confirmação.',
        '- Para trocar de conta: Perfil → Sair da conta → Confirmar saída.',
        '- Para rever o onboarding: Configurações → Rever apresentação do Eleva.', '',
        '## Convites de teste para Paula', '',
        'Em Ana, o identificador da destinatária é `' + accounts['Q']['id'] + '`. Os códigos abaixo são apenas de teste local; uso/expiração são conferidos pela API.']
    for key, title in [('pending', 'Convite inicialmente válido, com duração de24h'), ('expired', 'Convite preparado já expirado')]:
        lines.append('- ' + title + ': `' + private_invites.get(key, 'Código local não disponível; gere um convite na interface.') + '`')
    lines += ['', 'O seed não apaga dados, não redefine suas senhas nem substitui alterações feitas nestes cenários. Repetir o comando não duplica a carga. Contas antigas do smoke continuam preservadas em demo-accounts.local.json.',
              '', 'Este arquivo contém senhas temporárias de teste, é ignorado pelo git e não deve ser publicado ou incluído no APK.']
    output.write_text('\n'.join(lines) + '\n', encoding='utf-8')


def prepare_manager(accounts, receipt, path):
    """One-time synthetic setup through actual owner/grant APIs; reruns preserve revocations."""
    if accounts['G'].get('manager_demo_initialized'):
        return
    headers_by_actor = {}
    with httpx.Client(timeout=15) as client:
        try:
            for label in ('A', 'P', 'G'):
                account = accounts[label]
                signed = expect(client.post(AUTH + '/api/auth/sign-in/email', json={'email': account['email'], 'password': account['password']}, headers={'Origin': 'http://localhost:8081'}))
                headers_by_actor[label] = {'Authorization': 'Bearer ' + signed['token']}
                client.cookies.clear()
            def get(label, route):
                return expect(client.get(API + route, headers=headers_by_actor[label]))
            def post(label, route, body):
                return expect(client.post(API + route, headers={**headers_by_actor[label], 'Idempotency-Key': str(uuid.uuid4())}, json=body))
            room = next(r for r in get('P', '/classrooms') if r['id'] == receipt['classrooms'][0])
            staff = get('P', '/schools/' + room['school_id'] + '/staff')
            if not any(row['adult_id'] == accounts['G']['id'] for row in staff['items']):
                post('P', '/schools/' + room['school_id'] + '/staff', {'adult_id': accounts['G']['id'], 'role': 'manager'})
            for key in ('lia', 'theo', 'nina'):
                sid = receipt['students'][key]
                if client.get(API + '/students/' + sid, headers=headers_by_actor['G']).status_code == 200:
                    continue
                invite = post('A', '/students/' + sid + '/invitations', {'recipient_id': accounts['G']['id'], 'role': 'teacher'})
                post('G', '/invitations/accept', {'token': invite['token']})
            accounts['G']['manager_demo_initialized'] = True
            path.write_text(json.dumps(accounts, ensure_ascii=False, indent=2), encoding='utf-8')
        finally:
            for headers in headers_by_actor.values():
                client.post(AUTH + '/api/auth/sign-out', json={}, headers=headers)


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--local-development', action='store_true', required=True)
    parser.parse_args()
    prepare_local()  # Guard, backup and migration before any write or identity creation.
    identity_env = dotenv_values(ROOT / 'identity' / '.env')
    if identity_env.get('SMTP_HOST'):
        raise RuntimeError('O seed não envia e-mails. Use identidade local sem SMTP para criar contas fictícias.')
    identity = expect(httpx.get(AUTH + '/__eleva/health', timeout=8))
    core = expect(httpx.get(API + '/health/ready', timeout=8))
    if identity.get('service') != 'eleva-identity' or identity.get('database') != 'sqlite' or identity.get('environment') != 'development':
        raise RuntimeError('A porta de identidade não corresponde ao Eleva local esperado.')
    if core.get('service') != 'eleva-api' or core.get('database') != 'sqlite' or core.get('environment') != 'development':
        raise RuntimeError('A API não corresponde ao Eleva local esperado.')
    accounts = prepare_accounts(ROOT / 'identity' / 'review-accounts.local.json')
    private_path = ROOT / '.eleva-local' / 'private-invites.json'
    invites = json.loads(private_path.read_text(encoding='utf-8')) if private_path.exists() else {}
    with SessionLocal.begin() as db:
        receipt = seed_review_data(db, {label: a['id'] for label, a in accounts.items()}, private_invites=invites)
        receipt['reports'] = {key: {k: value for k, value in report(db, sid).items()
                                   if k in ('completed_tasks', 'assigned_tasks', 'finished_attempts', 'observations', 'assessments', 'confirmed_level')}
                              for key, sid in receipt['students'].items()}
    private_path.write_text(json.dumps(invites, indent=2), encoding='utf-8')
    prepare_manager(accounts, receipt, ROOT / 'identity' / 'review-accounts.local.json')
    write_access_sheet(accounts, invites, ROOT / 'identity' / 'ACESSOS-TESTE.local.md')
    (ROOT / '.eleva-local' / 'seed-review.json').write_text(json.dumps(receipt, ensure_ascii=False, indent=2), encoding='utf-8')
    print('Carga de revisão pronta: 5 contas reais locais (responsáveis, professores e gestor), 5 estudantes-base, atividades, aulas, escolas, turmas e histórico. IA pré-gerada identificada.')
    print('Novos registros da carga pedagógica: ' + str(sum(receipt['created'].values())))
    print('E-mails e senhas: identity/ACESSOS-TESTE.local.md. Credenciais não foram impressas nem incluídas no aplicativo.')


if __name__ == '__main__':
    main()
