"""Persist assistive authoring independently of student evidence and immutable lessons."""
from alembic import op
import sqlalchemy as sa

revision = 'c81007ab1201'
down_revision = '80c95fbd1e56'
branch_labels = None
depends_on = None

def upgrade():
    op.create_table('lesson_generations',
        sa.Column('id',sa.String(36),primary_key=True),sa.Column('adult_id',sa.String(128),sa.ForeignKey('adults.id'),nullable=False),
        sa.Column('command_key',sa.String(64),nullable=False,unique=True),sa.Column('input_hash',sa.String(64),nullable=False),
        sa.Column('request_data',sa.JSON,nullable=False),sa.Column('prompt_version',sa.String(64),nullable=False),
        sa.Column('model',sa.String(100),nullable=False),sa.Column('status',sa.String(30),nullable=False),
        sa.Column('origin',sa.String(20),nullable=False),sa.Column('result',sa.JSON),sa.Column('usage',sa.JSON),
        sa.Column('request_id',sa.String(150)),sa.Column('content_id',sa.String(36),sa.ForeignKey('content.id')),
        sa.Column('created_at',sa.String(40),nullable=False))
    op.create_index('ix_lesson_generations_adult_id','lesson_generations',['adult_id'])
    op.create_index('ix_lesson_generations_input_hash','lesson_generations',['input_hash'])

def downgrade():
    op.drop_table('lesson_generations')
