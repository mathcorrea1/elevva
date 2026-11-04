"""Preserve immutable draft bodies and their review version."""
from alembic import op
import sqlalchemy as sa

revision = '7c923f1b4a20'
down_revision = '00441fc6d86f'
branch_labels = None
depends_on = None


def upgrade():
    op.create_table('content_revisions',
        sa.Column('id', sa.String(36), nullable=False),
        sa.Column('content_id', sa.String(36), nullable=False),
        sa.Column('version', sa.Integer(), nullable=False),
        sa.Column('snapshot', sa.JSON(), nullable=False),
        sa.Column('captured_by', sa.String(128), nullable=False),
        sa.Column('captured_at', sa.String(40), nullable=False),
        sa.ForeignKeyConstraint(['content_id'], ['content.id']),
        sa.ForeignKeyConstraint(['captured_by'], ['adults.id']),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('content_id', 'version'))


def downgrade():
    op.drop_table('content_revisions')
