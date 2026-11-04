"""Fresh local migration chain verification, never opens DATABASE_URL from the operator's .env."""
import os
import uuid
from pathlib import Path

directory = Path(__file__).resolve().parents[1] / '.runtime'
directory.mkdir(exist_ok=True)
target = (directory / ('migration-check-' + str(uuid.uuid4()) + '.db')).resolve()
assert target.parent == directory.resolve()
os.environ['ELEVA_ENV'] = 'test'
os.environ['DATABASE_URL'] = 'sqlite:///' + target.as_posix()
os.environ['ENABLE_TEST_IDENTITIES'] = 'false'
from alembic.config import Config
from alembic import command

command.upgrade(Config('alembic.ini'), 'head')
command.check(Config('alembic.ini'))
print('Full migration chain passed on a fresh local development database. PostgreSQL execution still requires an authorized test branch.')
