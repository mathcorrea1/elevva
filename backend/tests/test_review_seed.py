import pytest
from sqlalchemy import select, func
from app.main import app
from app.core.database import session
from app.features import models as m
from app.features.learning import report
from scripts.review_data import seed_review_data
from scripts.prepare_local import require_local_database
from app.core.config import settings
from tests.test_flows import client, headers


@pytest.fixture
def review_db(client):
    generator = app.dependency_overrides[session]()
    db = next(generator)
    actors = {label: 'test-' + label for label in ('A', 'B', 'P', 'Q')}
    try:
        yield db, actors
        next(generator, None)
    finally:
        generator.close()


def test_review_seed_is_repeatable_and_preserves_changes(client, review_db):
    db, actors = review_db
    first = seed_review_data(db, actors)
    counts = {t.name: db.scalar(select(func.count()).select_from(t)) for t in m.Student.metadata.sorted_tables}
    student = db.get(m.Student, first['students']['nina'])
    student.name = 'Nome alterado pelo operador'
    db.flush()
    second = seed_review_data(db, actors)
    assert second['created'] == {}
    assert db.get(m.Student, student.id).name == 'Nome alterado pelo operador'
    assert counts == {t.name: db.scalar(select(func.count()).select_from(t)) for t in m.Student.metadata.sorted_tables}
    assert len(first['activities']) == 6
    assert len(first['students']) == 5
    assert report(db, first['students']['lia'])['completed_tasks'] == 3
    assert report(db, first['students']['lia'])['finished_attempts'] == 3
    assert report(db, first['students']['nina'])['events'] == []
    assert all(db.get(m.Student, sid).confirmed_level is None for sid in first['students'].values())
    # Seed examples never forge approval, provider calls, usage or a suggested pedagogical level.
    samples = list(db.scalars(select(m.Analysis).where(m.Analysis.origin == 'pregenerated')))
    assert len(samples) == 2
    assert all(row.model == 'demo/pregenerated-v1' and row.usage is None and row.request_id is None for row in samples)
    assert next(row for row in samples if row.result).result['suggested_level'] is None
    assert db.scalar(select(func.count()).select_from(m.ContentReview)) == 0


def test_review_seed_grants_blocking_and_reports_use_real_events(client, review_db):
    db, actors = review_db
    data = seed_review_data(db, actors)
    db.commit()
    lia = data['students']['lia']
    assert client.get('/students/' + lia, headers=headers('B')).status_code == 404
    assert client.get('/students/' + data['students']['theo'], headers=headers('Q')).status_code == 404
    tasks = client.get('/students/' + lia + '/assignments', headers=headers('A')).json()
    assert [bool(row['completed_at']) for row in tasks] == [True, True, False, False, False, False, False, False, True, False]
    assert [row['locked'] for row in tasks] == [False, False, False, True, True, True, True, True, False, False]
    assert client.post('/students/' + lia + '/assignments/' + tasks[3]['id'] + '/start', headers=headers('A', 'blocked-review')).status_code == 409
    own_report = client.get('/students/' + lia + '/report', headers=headers('A')).json()
    group = client.get('/classrooms/' + data['classrooms'][0] + '/report', headers=headers('P')).json()
    assert next(row for row in group['students'] if row['student_id'] == lia)['completed_tasks'] == own_report['completed_tasks']
    assert client.get('/classrooms/' + data['classrooms'][0] + '/report', headers=headers('Q')).status_code == 404


def test_local_seed_guard_rejects_remote_and_unexpected_files(monkeypatch, tmp_path):
    monkeypatch.setattr(settings(), 'eleva_env', 'development')
    monkeypatch.setattr(settings(), 'database_url', 'postgresql://unused:unused@example.invalid/unused')
    with pytest.raises(RuntimeError, match='SQLite local'):
        require_local_database()
    monkeypatch.setattr(settings(), 'database_url', 'sqlite:///' + (tmp_path / 'other.db').as_posix())
    with pytest.raises(RuntimeError, match='Banco inesperado'):
        require_local_database()
