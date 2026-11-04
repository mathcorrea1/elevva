import time
import jwt
import httpx
from fastapi import Depends, HTTPException, Request
from sqlalchemy.orm import Session
from app.core.config import settings
from app.core.database import session
from app.features.models import Adult


def identity(request: Request, db: Session = Depends(session, scope='function')) -> Adult:
    config = settings()
    bearer = request.headers.get('authorization', '')
    # No development identity is accepted unless the server explicitly enables it.
    if config.enable_test_identities and bearer.startswith('Bearer test.'):
        try:
            claims = jwt.decode(bearer[12:], config.test_identity_secret, algorithms=['HS256'],
                                issuer='eleva-isolated-development', audience='eleva-api',
                                options={'require': ['exp', 'sub', 'iat', 'iss', 'aud']})
            adult = db.get(Adult, claims['sub'])
            if adult and adult.id.startswith('test-'):
                return adult
        except jwt.PyJWTError:
            pass
        raise HTTPException(401, 'Sessão de teste expirada')
    if not config.auth_base_url:
        raise HTTPException(503, 'Better Auth não configurado')
    headers = {k: request.headers[k] for k in ('authorization', 'cookie') if k in request.headers}
    if not headers:
        raise HTTPException(401, 'Entre novamente')
    try:
        # Server-side introspection also catches logout/revocation; no JWT cache accepting revoked sessions.
        response = httpx.get(config.auth_base_url.rstrip('/') + '/api/auth/get-session',
                             headers=headers, params={'disableCookieCache': 'true'}, timeout=8)
        if response.status_code != 200:
            raise HTTPException(401, 'Sessão inválida')
        result = response.json()
        if not result or not result.get('session') or not result.get('user', {}).get('id'):
            raise HTTPException(401, 'Entre novamente')
        subject = result['user']['id']
    except (httpx.HTTPError, ValueError):
        raise HTTPException(503, 'Serviço de identidade indisponível')
    adult = db.get(Adult, subject)
    if not adult:
        adult = Adult(id=subject, display_name=result['user'].get('name', 'Adulto')[:100])
        db.add(adult)
        db.flush()
    return adult


def test_token(subject):
    return 'test.' + jwt.encode({'sub': subject, 'iat': int(time.time()), 'exp': int(time.time()) + 3600,
                                 'iss': 'eleva-isolated-development', 'aud': 'eleva-api'},
                                settings().test_identity_secret, algorithm='HS256')
