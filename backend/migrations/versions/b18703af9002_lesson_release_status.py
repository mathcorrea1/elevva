from alembic import op
import sqlalchemy as sa
revision='b18703af9002'
down_revision='a05de62fa711'
branch_labels=None
depends_on=None
def upgrade():op.add_column('content_revisions',sa.Column('publication_status',sa.String(20),nullable=False,server_default='draft'))
def downgrade():op.drop_column('content_revisions','publication_status')
