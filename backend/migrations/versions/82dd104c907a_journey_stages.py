"""Persisted learning stages and reversible content archival (local and PostgreSQL)."""
from alembic import op
import sqlalchemy as sa

revision = '82dd104c907a'
down_revision = '7c923f1b4a20'
branch_labels = None
depends_on = None


def upgrade():
    op.add_column('content', sa.Column('archived_at', sa.String(40), nullable=True))
    op.create_table('learning_stages',
        sa.Column('id', sa.String(36), primary_key=True),
        sa.Column('student_id', sa.String(36), sa.ForeignKey('students.id'), nullable=False),
        sa.Column('title', sa.String(120), nullable=False),
        sa.Column('description', sa.String(500), nullable=False),
        sa.Column('created_by', sa.String(128), sa.ForeignKey('adults.id'), nullable=False),
        sa.Column('created_at', sa.String(40), nullable=False))
    if op.get_context().dialect.name == 'sqlite':
        op.execute('ALTER TABLE assignments ADD COLUMN stage_id VARCHAR(36) REFERENCES learning_stages(id)')
    else:
        op.add_column('assignments', sa.Column('stage_id', sa.String(36), nullable=True))
        op.create_foreign_key('fk_assignment_stage', 'assignments', 'learning_stages', ['stage_id'], ['id'])
    op.create_index('ix_assignments_stage_id', 'assignments', ['stage_id'])


def downgrade():
    op.drop_index('ix_assignments_stage_id', 'assignments')
    if op.get_context().dialect.name != 'sqlite':
        op.drop_constraint('fk_assignment_stage', 'assignments', type_='foreignkey')
    op.drop_column('assignments', 'stage_id')
    op.drop_table('learning_stages')
    op.drop_column('content', 'archived_at')
