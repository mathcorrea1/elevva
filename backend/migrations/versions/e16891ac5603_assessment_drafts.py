"""Private, versioned adult assessment drafts; no new pedagogical scores."""
from alembic import op
import sqlalchemy as sa

revision = 'e16891ac5603'
down_revision = 'd09128ba3402'
branch_labels = None
depends_on = None

def upgrade():
    op.create_table('assessment_drafts',
        sa.Column('id', sa.String(36), primary_key=True),
        sa.Column('student_id', sa.String(36), sa.ForeignKey('students.id'), nullable=False),
        sa.Column('adult_id', sa.String(128), sa.ForeignKey('adults.id'), nullable=False),
        sa.Column('body', sa.JSON, nullable=False),
        sa.Column('version', sa.Integer, nullable=False),
        sa.Column('updated_at', sa.String(40), nullable=False),
        sa.UniqueConstraint('student_id', 'adult_id'))
    op.create_index('ix_assessment_drafts_student_id', 'assessment_drafts', ['student_id'])

def downgrade():
    op.drop_table('assessment_drafts')
