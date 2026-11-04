"""Idempotent synthetic development data. Never runs against a remote database implicitly."""
import argparse
from sqlalchemy import select
from app.core.config import settings
from app.core.database import SessionLocal
from app.features import models as m


def seed(db):
    if not db.get(m.AIGate, 1):
        db.add(m.AIGate(id=1, busy=False))
    for label in ('A', 'B', 'P', 'Q'):
        if not db.get(m.Adult, 'test-' + label):
            db.add(m.Adult(id='test-' + label, display_name='Adulto fictício ' + label,
                           profession='teacher' if label in ('P', 'Q') else 'guardian'))
    db.flush()
    for label, owner, teacher, response in [('Lia', 'A', 'P', 'A'), ('Caio', 'B', 'Q', 'B')]:
        sid = 'synthetic-' + label.lower()
        if not db.get(m.Student, sid):
            student = m.Student(id=sid, name=label + ' (fictício)', supports=[])
            db.add(student)
            db.flush()
            for adult, role in [(owner, 'owner'), (teacher, 'teacher')]:
                db.add(m.Grant(student_id=sid, adult_id='test-' + adult, role=role))
            db.add(m.Assessment(student_id=sid, adult_id='test-' + teacher, instrument='synthetic-integration-v1',
                evidence=[{'item': 'som-inicial', 'response': response, 'support': 'Exemplo técnico fictício'}],
                synthetic=True, notes='Teste de contrato sem validade pedagógica'))
            db.add(m.Observation(student_id=sid, adult_id='test-' + owner, context='Leitura oral acompanhada (sintética)',
                                 text='Registro fictício realizado pelo adulto; não é uma execução no app.'))
    if not db.get(m.Content, 'synthetic-activity-1'):
        db.add(m.Content(id='synthetic-activity-1', author_id='test-P', kind='activity', title='Escolhas de letras — exemplo técnico',
            status='synthetic', body={'instructions': 'Exemplo fictício para testar respostas e salvamento. Não é instrumento pedagógico aprovado.',
            'items': [{'id': 'letra-a', 'prompt': 'Toque na letra A.', 'choices': ['A', 'B', 'C'], 'answer': 0, 'reading_allowed': True},
                      {'id': 'letra-b', 'prompt': 'Toque na letra B.', 'choices': ['A', 'B', 'C'], 'answer': 1, 'reading_allowed': True}]}))
    if not db.get(m.School, 'synthetic-school'):
        db.add(m.School(id='synthetic-school', owner_id='test-P', name='Escola fictícia'))
        db.flush()
        db.add(m.Classroom(id='synthetic-classroom', school_id='synthetic-school', teacher_id='test-P', name='Turma fictícia P'))
        db.flush()
        db.add(m.Enrollment(classroom_id='synthetic-classroom', student_id='synthetic-lia'))
    db.flush()


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--local-development', action='store_true', required=True)
    parser.parse_args()
    if settings().eleva_env not in ('development', 'test') or not settings().database_url.startswith('sqlite:///'):
        raise SystemExit('Seed CLI only permits the local development SQLite database. Remote data is never changed here.')
    with SessionLocal.begin() as db:
        seed(db)
    print('Synthetic seed A/B/P/Q ready. No passwords or production identities were created.')
