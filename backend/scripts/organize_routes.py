"""One-time split of the new API by feature, leaving the public route composition stable."""
import ast
from pathlib import Path

source = Path('app/features/router.py')
text = source.read_text(encoding='utf-8')
if 'def create_student' not in text:
    raise SystemExit(0)
lines = text.splitlines(keepends=True)
tree = ast.parse(text)
functions = {n.name: ''.join(lines[min([n.lineno] + [d.lineno for d in n.decorator_list]) - 1:n.end_lineno])
             for n in tree.body if isinstance(n, ast.FunctionDef)}
header = text[:text.index('router = APIRouter()')].replace('from . import contracts as c', 'from app.features import contracts as c').replace('from . import models as m', 'from app.features import models as m').replace('from .learning import ', 'from app.features.learning import ')
plan = {
    'identity': ['dev_session', 'me', 'profile', 'preferences'],
    'students': ['students', 'create_student', 'student_detail', 'grants', 'update_student', 'invite', 'accept_invite', 'revoke'],
    'assessments': ['assessment', 'observation', 'confirm_level'],
    'catalog': ['content', 'create_content', 'publish'],
    'activities': ['assignments', 'assign', 'start', 'response', 'finish'],
    'reports': ['student_history', 'student_report'],
    'classrooms': ['schools', 'create_school', 'classrooms', 'create_classroom', 'enroll', 'collective'],
    'feedback': ['feedback'],
}
for group, names in plan.items():
    target = Path('app/features') / group
    target.mkdir(exist_ok=True)
    (target / '__init__.py').touch()
    extra = '\n\n' + functions['period'] if group in ('reports', 'classrooms') else ''
    (target / 'router.py').write_text(header + '\nrouter = APIRouter()\n' + extra + '\n\n' + '\n\n'.join(functions[n] for n in names) + '\n', encoding='utf-8')
source.write_text('from fastapi import APIRouter\n' + '\n'.join(f'from .{g}.router import router as {g}_router' for g in plan)
                  + '\n\nrouter = APIRouter()\n' + '\n'.join(f'router.include_router({g}_router)' for g in plan) + '\n', encoding='utf-8')
