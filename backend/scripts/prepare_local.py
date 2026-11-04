"""Prepare and back up only this workspace's known development databases."""
import sqlite3
from datetime import datetime, timezone
from pathlib import Path
from sqlalchemy.engine import make_url
from alembic import command
from alembic.config import Config
from app.core.config import settings

ROOT = Path(__file__).resolve().parents[2]


def require_local_database():
    cfg = settings()
    url = make_url(cfg.database_url)
    expected = (ROOT / 'backend' / 'eleva-development.db').resolve()
    if cfg.eleva_env != 'development' or url.get_backend_name() != 'sqlite' or not url.database:
        raise RuntimeError('Esta preparação aceita somente desenvolvimento SQLite local; não altera Neon ou produção.')
    if Path(url.database).resolve() != expected:
        raise RuntimeError('Banco inesperado. Use backend/eleva-development.db para esta carga de revisão.')
    return expected


def main():
    target = require_local_database()
    from dotenv import dotenv_values
    identity = dotenv_values(ROOT / 'identity' / '.env')
    if identity.get('NODE_ENV') != 'development' or identity.get('DATABASE_URL'):
        raise RuntimeError('Identidade deve usar o SQLite local de desenvolvimento antes de preparar seeds.')
    backup = ROOT / '.eleva-local' / 'backups' / datetime.now(timezone.utc).strftime('%Y%m%dT%H%M%S%fZ')
    backup.mkdir(parents=True, exist_ok=False)
    for source in (target, ROOT / 'identity' / 'identity-development.db'):
        if source.exists():
            with sqlite3.connect(source) as old, sqlite3.connect(backup / source.name) as new:
                old.backup(new)
    command.upgrade(Config('alembic.ini'), 'head')
    print('Bancos locais preservados em backup; migrations locais prontas.')


if __name__ == '__main__':
    main()
