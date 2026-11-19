import httpx
from app.core import auth
from types import SimpleNamespace
from app.core.config import settings
from app.features.models import Adult

def test_shared_transport_never_shares_cookies_or_caches_revoked_sessions(monkeypatch):
    seen=[]
    def handle(request):
        seen.append((request.headers.get('authorization'),request.headers.get('cookie')))
        if request.headers.get('authorization')=='Bearer revoked':return httpx.Response(200,content=b'null',headers={'content-type':'application/json'})
        return httpx.Response(200,json={'session':{'id':'isolated'}},headers={'set-cookie':'other-private-cookie=do-not-reuse; Path=/'})
    transport=httpx.MockTransport(handle)
    monkeypatch.setattr(auth,'_identity_transport',transport)
    assert auth.introspect('http://identity.invalid/api/auth/get-session',{'Authorization':'Bearer account-A'}).json()['session']
    assert auth.introspect('http://identity.invalid/api/auth/get-session',{'Authorization':'Bearer account-B'}).json()['session']
    assert auth.introspect('http://identity.invalid/api/auth/get-session',{'Authorization':'Bearer revoked'}).json() is None
    assert seen==[('Bearer account-A',None),('Bearer account-B',None),('Bearer revoked',None)]


def test_explicit_bearer_author_is_never_replaced_by_a_browser_cookie(monkeypatch):
    monkeypatch.setattr(settings(), 'auth_base_url', 'http://identity.invalid')
    seen = []
    def introspect(url, headers):
        seen.append(headers)
        return httpx.Response(200, json={'session': {'id': 'session-A'}, 'user': {'id': 'adult-A'}})
    monkeypatch.setattr(auth, 'introspect', introspect)
    adult = Adult(id='adult-A', display_name='Adulto fictício A')
    db = SimpleNamespace(get=lambda model, identifier: adult)
    request = SimpleNamespace(headers={'authorization': 'Bearer adult-A', 'cookie': 'session=adult-B'})
    assert auth.identity(request, db).id == 'adult-A'
    assert seen == [{'authorization': 'Bearer adult-A'}]
