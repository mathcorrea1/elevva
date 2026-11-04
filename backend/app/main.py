from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text
from sqlalchemy.exc import SQLAlchemyError, IntegrityError
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from app.core.validation import describe
from app.core.config import settings
from app.core.database import engine, SessionLocal
from app.features.router import router
from app.features.ai import router as ai_router
from app.features import models as m
import json, logging, time, uuid
request_logger=logging.getLogger('eleva.requests')
request_logger.setLevel(logging.INFO)
if not request_logger.handlers:request_logger.addHandler(logging.StreamHandler())
request_logger.propagate=False


@asynccontextmanager
async def lifespan(app):
    # A restart never leaves a provider request shown as running forever.
    with SessionLocal() as db:
        db.query(m.Analysis).filter(m.Analysis.status == 'pending').update({'status': 'interrupted'})
        db.query(m.AIGate).update({'busy': False})
        db.commit()
    yield


app = FastAPI(title='Eleva API', version='0.2.0', lifespan=lifespan)
app.add_middleware(CORSMiddleware, allow_origins=settings().cors_origins.split(','),
                   allow_credentials=True, allow_methods=['GET', 'POST', 'PATCH', 'PUT', 'DELETE'],
                   allow_headers=['Authorization', 'Content-Type', 'Idempotency-Key'])
app.include_router(router)
app.include_router(ai_router)

@app.exception_handler(RequestValidationError)
async def invalid_fields(request,error):
    return JSONResponse(status_code=422,content={'detail':' '.join(describe(e) for e in error.errors()[:4])})

@app.middleware('http')
async def request_trace(request, call_next):
    request_id=str(uuid.uuid4()); started=time.perf_counter()
    response=await call_next(request)
    response.headers['X-Request-ID']=request_id
    route=request.scope.get('route')
    # Route template only: no student identifiers, query, body, cookies or SQL parameters.
    request_logger.info(json.dumps({'event':'http.request','request_id':request_id,
        'method':request.method,'route':getattr(route,'path','unmatched'),'status':response.status_code,
        'duration_ms':round((time.perf_counter()-started)*1000)}))
    return response


@app.exception_handler(SQLAlchemyError)
async def database_error(request, error):
    # Do not expose SQL parameters or child data through error responses/log traces.
    return JSONResponse(status_code=409 if isinstance(error, IntegrityError) else 503,
                        content={'detail': 'Não foi possível confirmar a gravação. Recarregue ou repita a mesma operação.'})


@app.get('/health/ready')
def ready():
    with engine.connect() as db:
        db.execute(text('SELECT 1'))
    return {'service': 'eleva-api', 'core': 'ready', 'environment': settings().eleva_env, 'database': engine.dialect.name,
            'identity': 'configured' if settings().auth_base_url else 'not_configured',
            'ai': 'configured_unverified' if settings().groq_api_key else 'not_configured'}
