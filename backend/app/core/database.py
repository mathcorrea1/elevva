from sqlalchemy import create_engine, event
from sqlalchemy.orm import DeclarativeBase, sessionmaker
from .config import settings


class Base(DeclarativeBase):
    pass


def make_engine(url, **options):
    if url.startswith('postgresql://'):
        url = url.replace('postgresql://', 'postgresql+psycopg://', 1)
    engine = create_engine(url, connect_args={'check_same_thread': False} if url.startswith('sqlite') else {}, pool_pre_ping=True, **options)
    if url.startswith('sqlite'):
        @event.listens_for(engine, 'connect')
        def sqlite_integrity(connection, _):
            connection.isolation_level = None
            connection.execute('PRAGMA foreign_keys=ON')
            from datetime import datetime
            from zoneinfo import ZoneInfo
            connection.create_function('eleva_day',1,lambda value:datetime.fromisoformat(value).astimezone(ZoneInfo('America/Sao_Paulo')).date().isoformat() if value else None,deterministic=True)
        @event.listens_for(engine, 'begin')
        def sqlite_begin(connection):
            # Include SAVEPOINTs and DDL in the outer transaction (also on Python 3.11).
            connection.exec_driver_sql('BEGIN')
    return engine


engine = make_engine(settings().database_url)
SessionLocal = sessionmaker(engine, expire_on_commit=False)


def session():
    with SessionLocal() as db:
        try:
            yield db
            db.commit()
        except Exception:
            db.rollback()
            raise
