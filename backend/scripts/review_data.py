"""Add-only, versioned synthetic scenarios. No approved pedagogy, live AI or parallel totals."""
import hashlib
import json
import secrets
import uuid
from datetime import date, datetime, timedelta, timezone
from sqlalchemy import select,func
from app.core.config import settings
from app.features import models as m
from app.features.ai import snapshot_for, validate_result


def seed_review_data(db, actors, reference_day=date(2026, 10, 29), private_invites=None):
    if settings().eleva_env not in ('development', 'test') or db.bind.dialect.name != 'sqlite':
        raise RuntimeError('Carga visual restrita a SQLite local de desenvolvimento/teste.')
    before_counts={table.name:db.scalar(select(func.count()).select_from(table)) for table in m.Student.metadata.sorted_tables}
    private_invites = private_invites if private_invites is not None else {}
    namespace = 'eleva-review-v1:' + actors['A']
    identify = lambda key: str(uuid.uuid5(uuid.NAMESPACE_URL, namespace + ':' + key))
    anchor = datetime.combine(reference_day, datetime.min.time(), tzinfo=timezone.utc).replace(hour=15)
    stamp = lambda days, hours=0: (anchor + timedelta(days=days, hours=hours)).isoformat()
    created = {}

    def put(entity, key, **fields):
        row = db.get(entity, identify(key))
        if row is None:
            row = entity(id=identify(key), **fields)
            db.add(row)
            db.flush()
            created[entity.__tablename__] = created.get(entity.__tablename__, 0) + 1
        return row

    for label, subject in actors.items():
        if not db.get(m.Adult, subject):
            raise ValueError('Cadastre as quatro identidades reais locais antes de carregar os cenários.')
    if not db.get(m.AIGate, 1):
        db.add(m.AIGate(id=1, busy=False))
        db.flush()

    activities = []
    templates = [
        ('letras', 'Descobrindo as letras', [('Encontre a letra A.', ['A', 'B', 'C'], 0), ('Encontre a letra M.', ['N', 'M', 'V'], 1), ('Encontre a letra L.', ['I', 'T', 'L'], 2)]),
        ('silabas', 'Um encontro de sílabas', [('Encontre MA.', ['PA', 'MA', 'LA'], 1), ('Encontre BO.', ['BO', 'BA', 'BE'], 0), ('Encontre LA.', ['LO', 'LI', 'LA'], 2)]),
        ('palavras', 'Palavras do nosso dia', [('Encontre BOLA.', ['CASA', 'BOLA', 'LUA'], 1), ('Encontre CASA.', ['CASA', 'GATO', 'DADO'], 0), ('Encontre LUA.', ['SOL', 'RUA', 'LUA'], 2)]),
        ('iniciais', 'Como a palavra começa?', [('Qual palavra começa com M?', ['BOLA', 'MALA', 'CASA'], 1), ('Qual palavra começa com L?', ['GATO', 'DADO', 'LUA'], 2)]),
        ('vogais', 'As vogais por perto', [('Encontre E.', ['A', 'E', 'I'], 1), ('Encontre O.', ['O', 'U', 'E'], 0)]),
        ('pares', 'Letras e encontros', [('Encontre PA.', ['MA', 'LA', 'PA'], 2), ('Encontre LI.', ['LI', 'LA', 'LO'], 0)]),
    ]
    for key, title, questions in templates:
        body = {'instructions': 'Exemplo sintético para testar escolhas e salvamento. Conteúdo não revisado para uso pedagógico real.',
                'rubric_text': None, 'items': [{'id': key + '-' + str(i + 1), 'prompt': prompt, 'choices': choices,
                    'answer': answer, 'reading_allowed': key != 'iniciais'} for i, (prompt, choices, answer) in enumerate(questions)]}
        row = put(m.Content, 'content:' + key, author_id=actors['P'], kind='activity', title=title + ' · demo', body=body, status='synthetic', version=1)
        activities.append(row)

    for key, title, text in [
        ('observar', 'Um olhar para cada descoberta', 'Modelo de demonstração: registre o contexto, a resposta observada e o apoio oferecido. Este texto serve à revisão da interface e aguarda validação pedagógica.'),
        ('oral', 'Leitura oral acompanhada', 'Modelo de demonstração: uma observação de leitura oral é registrada pelo adulto. Não representa reconhecimento automático de fala nem conclui tarefas do aplicativo.'),
        ('apoios', 'Um jeito confortável de aprender', 'Modelo de demonstração: explore fonte, contraste e leitura nas Configurações. As adaptações não dependem de diagnóstico. Conteúdo de exemplo para revisão visual.'),
    ]:
        put(m.Content, 'guidance:' + key, author_id=actors['P'], kind='guidance', title=title + ' · demo',
            body={'instructions': text, 'items': [], 'rubric_text': None}, status='synthetic', version=1)

    for key, kind, title in [('atividade', 'activity', 'Minha atividade em preparação'), ('instrumento', 'instrument', 'Instrumento inicial em revisão'), ('orientacao', 'guidance', 'Orientação para revisão')]:
        body = {'instructions': 'Rascunho sintético para testar autoria. Não publicado nem aprovado.',
                'items': activities[0].body['items'] if kind != 'guidance' else [],
                'rubric_text': 'Critérios ainda não definidos: este rascunho não permite classificação pedagógica.' if kind == 'instrument' else None}
        row = put(m.Content, 'draft:' + key, author_id=actors['P'], kind=kind, title=title + ' · demo', body=body, status='draft', version=2)
        for version in (1, 2):
            put(m.ContentRevision, 'revision:' + key + ':' + str(version), content_id=row.id, version=version,
                snapshot={'kind': kind, 'title': title + (' · versão inicial' if version == 1 else ' · demo'), 'body': body},
                captured_by=actors['P'], captured_at=stamp(-8 + version))

    students = {}
    people = [('lia', 'Lia', 'A', 'P', ['Instruções curtas e uma etapa por vez']),
              ('theo', 'Theo', 'A', 'P', ['Repetir instruções quando permitido pelo conteúdo']),
              ('nina', 'Nina', 'A', 'P', []), ('caio', 'Caio', 'B', 'Q', []), ('bia', 'Bia', 'B', 'Q', [])]
    for key, name, owner, teacher, supports in people:
        student = put(m.Student, 'student:' + key, name=name + ' · fictício', supports=supports,
                      birth_date=date(2020, 3, 12), confirmed_level=None, version=1, created_at=stamp(-35))
        students[key] = student
        for label, role in [(owner, 'owner'), (teacher, 'teacher')]:
            put(m.Grant, 'grant:' + key + ':' + label, student_id=student.id, adult_id=actors[label], role=role, active=True)
        if key in ('nina', 'bia'):
            continue  # Genuine empty/initial-assessment states, not fake zero achievement.
        for index, day in enumerate([-25, -14, -4] if key == 'lia' else [-22]):
            put(m.Assessment, 'assessment:' + key + ':' + str(index), student_id=student.id, adult_id=actors[teacher],
                instrument='synthetic-integration-v1', instrument_snapshot=None, synthetic=True,
                evidence=[{'item': 'som-inicial', 'response': 'A' if key == 'lia' else 'B', 'support': 'Cenário técnico fictício.'}],
                notes='Exemplo sintético. Não constitui aplicação pedagógica real nem confirmação de nível.', created_at=stamp(day))
        for index, context in enumerate(['Leitura oral acompanhada', 'Observação durante uma brincadeira']):
            put(m.Observation, 'observation:' + key + ':' + str(index), student_id=student.id, adult_id=actors[owner], context=context,
                text='Registro sintético para testar o histórico. Houve apoio do adulto; esta observação é independente da execução no app.', created_at=stamp(-10 + index * 6))
        for index in range(2):
            put(m.Guidance, 'private-guidance:' + key + ':' + str(index), student_id=student.id, adult_id=actors[teacher],
                title=['Próximos registros para acompanhar', 'Apoios que podem ser observados'][index] + ' · demo',
                text='Orientação fictícia para revisão visual. O adulto pode registrar como a criança responde e quais apoios foram oferecidos. Não é orientação pedagógica aprovada.',
                status='pending_review', created_at=stamp(-7 + index * 3))

    plans = {'lia': [(0, 'finished'), (1, 'finished'), (2, 'in_progress'), (3, 'ready'), (4, 'ready'), (5, 'ready')],
             'theo': [(0, 'finished'), (4, 'in_progress'), (5, 'ready')],
             'caio': [(2, 'finished'), (0, 'ready')]}
    for key, plan in plans.items():
        owner = actors['A' if key in ('lia', 'theo') else 'B']
        for index, (catalog_index, status) in enumerate(plan):
            stage_number = index // 2
            stage = put(m.LearningStage, f'stage:{key}:{stage_number}', student_id=students[key].id,
                        title=['Primeiras descobertas', 'Palavras por perto', 'Novos encontros'][stage_number],
                        description='Etapa de demonstração com atividades sintéticas relacionadas para revisão da interface. Agrupamento ainda sem validação pedagógica.',
                        created_by=owner, created_at=stamp(-30))
            content = activities[catalog_index]
            day = -18 + index * 4 if status == 'finished' else -1
            finished = stamp(day, 1) if status == 'finished' else None
            assignment = put(m.Assignment, f'task:{key}:{index}', student_id=students[key].id, content_id=content.id,
                content_version=content.version, snapshot={'title': content.title, **content.body}, position=index + 1,
                created_by=owner, completed_at=finished)
            if assignment.stage_id is None:
                assignment.stage_id = stage.id  # Add grouping only, preserve existing user responses/completions.
            if status == 'ready':
                continue
            items = assignment.snapshot['items']
            responses = {item['id']: (item['answer'] if key == 'lia' or i != 1 else (item['answer'] + 1) % len(item['choices']))
                         for i, item in enumerate(items if status == 'finished' else items[:1])}
            put(m.Attempt, f'attempt:{key}:{index}', assignment_id=assignment.id, student_id=students[key].id,
                adult_id=owner, responses=responses, status=status, version=len(responses) + (2 if status == 'finished' else 1),
                created_at=stamp(day), finished_at=finished)

    for teacher, keys in [('P', ['lia', 'theo']), ('P', ['nina']), ('Q', ['caio', 'bia'])]:
        room_key = teacher + '-' + keys[0]
        school = put(m.School, 'school:' + teacher, owner_id=actors[teacher], name=('Escola Horizonte' if teacher == 'P' else 'Escola Jardim') + ' · fictícia')
        room = put(m.Classroom, 'room:' + room_key, school_id=school.id, teacher_id=actors[teacher],
                   name={'lia': 'Turma Descobertas', 'nina': 'Primeiros Passos', 'caio': 'Turma Exploradores'}[keys[0]] + ' · demo')
        for key in keys:
            put(m.Enrollment, 'enroll:' + room_key + ':' + key, classroom_id=room.id, student_id=students[key].id)

    revoked = put(m.Grant, 'revoked:theo:Q', student_id=students['theo'].id, adult_id=actors['Q'], role='teacher', active=False)
    extra_school = put(m.School, 'school:P-extra', owner_id=actors['P'], name='Escola das Nuvens · fictícia')
    put(m.Classroom, 'room:P-extra', school_id=extra_school.id, teacher_id=actors['P'], name='Turma Novos Voos · demo')
    put(m.AuditEvent, 'audit:revoked:theo', student_id=students['theo'].id, adult_id=actors['A'], action='grant.revoked', resource_id=revoked.id, created_at=stamp(-5))
    for kind, expiration in [('pending', datetime.now(timezone.utc) + timedelta(days=1)), ('expired', datetime.now(timezone.utc) - timedelta(days=1))]:
        key = 'invite:' + kind
        if not db.get(m.Invitation, identify(key)):
            code = secrets.token_urlsafe(32)
            private_invites[kind] = code
            put(m.Invitation, key, student_id=students['theo'].id, token_hash=hashlib.sha256(code.encode()).hexdigest(),
                role='teacher', recipient_id=actors['Q'], created_by=actors['A'], expires_at=expiration.isoformat(), accepted_by=None)

    for key, resolved in [('lia', False), ('theo', True)]:
        put(m.AttentionFlag, 'attention:' + key, student_id=students[key].id, adult_id=actors['P'],
            reason='Exemplo manual de acompanhamento: combinar um novo momento de observação. Não foi calculado por idade, pontuação ou diagnóstico.',
            created_at=stamp(-6), resolved_at=stamp(-2) if resolved else None, resolved_by=actors['P'] if resolved else None)

    for label in ('A', 'P'):
        put(m.Feedback, 'feedback:' + label, adult_id=actors[label], text='Feedback sintético: conferir a organização das telas e a leitura das instruções.', created_at=stamp(-2))
        put(m.FollowupEvent, 'followup:' + label, adult_id=actors[label], enabled=False, notice_version='2026-10-22-v1', created_at=stamp(-2))

    for key, status in [('lia', 'completed'), ('theo', 'timeout')]:
        snapshot = snapshot_for(db, students[key].id, False)
        value = {'state': 'insufficient', 'suggested_level': None,
            'summary': 'EXEMPLO PRÉ-GERADO PARA REVISÃO DA TELA. Há registros para acompanhar, mas não há instrumento pedagógico aprovado. Nenhum modelo de IA foi chamado para produzir este exemplo.',
            'evidence_ids': [e['id'] for e in snapshot['evidence'][:2]],
            'limitations': ['Conteúdo sintético preparado pelo seed, sem chamada ao Groq.', 'Não comprova personalização de IA, classificação ou validade pedagógica.'], 'recommendations': []}
        put(m.Analysis, 'analysis:' + key, student_id=students[key].id, adult_id=actors['P'], snapshot=snapshot,
            snapshot_hash=hashlib.sha256(json.dumps(snapshot, sort_keys=True).encode()).hexdigest(),
            prompt_version=hashlib.sha256(b'eleva-visual-seed-v1').hexdigest(), model='demo/pregenerated-v1', origin='pregenerated',
            status=status, result=validate_result(value, snapshot) if status == 'completed' else None,
            usage=None, request_id=None, command_key=None, created_at=stamp(-1))
    from scripts.seed_trails import seed_trails
    course_ids=seed_trails(db,actors,students,activities,identify,stamp,put)
    from scripts.seed_lessons import seed_lessons
    lesson_ids=seed_lessons(db,actors,students,identify,stamp,put)
    db.flush()
    created={table.name:amount for table in m.Student.metadata.sorted_tables if (amount:=db.scalar(select(func.count()).select_from(table))-before_counts[table.name])>0}
    return {'seed': 'review-v3-lesson-screens', 'trails':course_ids,'lessons':lesson_ids,'reference_day': reference_day.isoformat(), 'created': created,
            'students': {key: row.id for key, row in students.items()}, 'activities': [r.id for r in activities],
            'classrooms': [identify('room:P-lia'), identify('room:P-nina'), identify('room:Q-caio'), identify('room:P-extra')],
            'ai_live': False, 'pedagogically_approved': False}
