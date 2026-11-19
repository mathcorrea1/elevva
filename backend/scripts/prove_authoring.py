"""Run explicitly after configuration: two real authoring calls with synthetic objectives only."""
import argparse
import hashlib
import json
import time
import uuid
from pathlib import Path
import httpx
from app.core.config import settings
from scripts.prepare_local import require_local_database

def main():
    parser=argparse.ArgumentParser();parser.add_argument('--check-config',action='store_true');args=parser.parse_args()
    require_local_database();cfg=settings()
    if not cfg.groq_api_key:
        print('PENDENTE: configure GROQ_API_KEY em backend/.env e reinicie a API. Não envie a chave no chat.')
        if not args.check_config:raise SystemExit(1)
        return
    if args.check_config:
        print('Chave configurada; nenhuma chamada foi executada.');return
    root=Path(__file__).resolve().parents[2]
    accounts=json.loads((root/'identity/review-accounts.local.json').read_text(encoding='utf-8-sig'))
    with httpx.Client(timeout=65) as client:
        account=accounts['P']
        signed=client.post('http://127.0.0.1:3001/api/auth/sign-in/email',json={'email':account['email'],'password':account['password']})
        if signed.status_code!=200:raise SystemExit('Não foi possível entrar na conta docente fictícia local.')
        headers={'Authorization':'Bearer '+signed.json()['token']}
        results=[]
        for index,(objective,kinds) in enumerate([
            ('Teste técnico adulto, sem aluno real: elaborar três atividades sobre palavras de animais conhecidos.',['single','text']),
            ('Teste técnico adulto, sem aluno real: elaborar três atividades para ordenar sílabas e reconhecer palavras sobre um jardim.',['single','order'])]):
            if index:
                print('Aguardando intervalo configurado antes da segunda chamada…',flush=True)
                for _ in range(max(0,cfg.ai_min_start_interval_seconds)+1):time.sleep(1)
            response=client.post('http://127.0.0.1:8100/ai/lesson-generations',headers={**headers,'Idempotency-Key':str(uuid.uuid4())},json={'objective':objective,'literacy_level':'silabico-com-valor','mechanics':kinds,'activity_count':3,'privacy_confirmed':True})
            if response.status_code!=200:raise SystemExit(f'Prova não concluída: HTTP {response.status_code}. Consulte a configuração/limites, sem repetir em ciclo.')
            value=response.json();result=value.get('result')
            results.append({k:value.get(k) for k in ('id','status','origin','model','request_id','prompt_version','created_at','usage')})
            if result:
                results[-1]['title']=result['lesson']['title'];results[-1]['result_sha256']=hashlib.sha256(json.dumps(result,sort_keys=True).encode()).hexdigest()
            print(f"Chamada {index+1}: {value['status']} · origem {value['origin']}",flush=True)
            if value['status']!='completed':break
        receipt={'scope':'technical synthetic adult-operated authoring, not pedagogical validation','calls':results,'distinct_outputs':len(results)==2 and results[0].get('result_sha256')!=results[1].get('result_sha256')}
        target=root/'Eleva V2/evidencias/ia-criacao-live.json';target.write_text(json.dumps(receipt,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
        print('Recibo sem credenciais: Eleva V2/evidencias/ia-criacao-live.json. Nenhuma aula foi publicada automaticamente.')
        client.post('http://127.0.0.1:3001/api/auth/sign-out',headers=headers,json={})

if __name__=='__main__':main()
