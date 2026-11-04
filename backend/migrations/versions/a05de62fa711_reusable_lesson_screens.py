"""Reusable immutable lesson revisions, scoped sharing and durable screen progress."""
from alembic import op
import sqlalchemy as sa
revision='a05de62fa711'
down_revision='938e600aa420'
branch_labels=None
depends_on=None
def reference(table,name,target):
    if op.get_context().dialect.name=='sqlite':op.execute(f'ALTER TABLE {table} ADD COLUMN {name} VARCHAR(36) REFERENCES {target}(id)')
    else:
        op.add_column(table,sa.Column(name,sa.String(36),nullable=True));op.create_foreign_key('fk_'+table+'_'+name,table,target,[name],['id'])
def upgrade():
    reference('content','origin_content_id','content');op.add_column('content',sa.Column('origin_version',sa.Integer(),nullable=True))
    reference('learning_stages','lesson_revision_id','content_revisions');op.create_index('ix_learning_stages_lesson_revision_id','learning_stages',['lesson_revision_id'])
    reference('assignments','content_revision_id','content_revisions');op.create_index('ix_assignments_content_revision_id','assignments',['content_revision_id'])
    op.add_column('attempts',sa.Column('cursor',sa.Integer(),nullable=False,server_default='0'))
    for name,default in [('visited','[]'),('drafts','{}'),('interactions','[]')]:op.add_column('attempts',sa.Column(name,sa.JSON(),nullable=False,server_default=default))
    op.add_column('student_care',sa.Column('characteristics',sa.JSON(),nullable=False,server_default='{}'))
    op.create_table('content_shares',sa.Column('id',sa.String(36),primary_key=True),sa.Column('content_id',sa.String(36),sa.ForeignKey('content.id'),nullable=False),sa.Column('revision_id',sa.String(36),sa.ForeignKey('content_revisions.id'),nullable=False),sa.Column('created_by',sa.String(128),sa.ForeignKey('adults.id'),nullable=False),sa.Column('recipient_id',sa.String(128),sa.ForeignKey('adults.id'),nullable=False),sa.Column('can_copy',sa.Boolean(),nullable=False),sa.Column('can_redistribute',sa.Boolean(),nullable=False),sa.Column('status',sa.String(20),nullable=False),sa.Column('created_at',sa.String(40),nullable=False),sa.UniqueConstraint('revision_id','recipient_id'))
    op.create_table('lesson_assignment_batches',sa.Column('id',sa.String(36),primary_key=True),sa.Column('adult_id',sa.String(128),sa.ForeignKey('adults.id'),nullable=False),sa.Column('revision_id',sa.String(36),sa.ForeignKey('content_revisions.id'),nullable=False),sa.Column('created_at',sa.String(40),nullable=False))
def downgrade():
    op.drop_table('lesson_assignment_batches');op.drop_table('content_shares');op.drop_column('student_care','characteristics')
    for name in ['cursor','visited','drafts','interactions']:op.drop_column('attempts',name)
    for table,column in [('assignments','content_revision_id'),('learning_stages','lesson_revision_id')]:
        op.drop_index('ix_'+table+'_'+column,table_name=table)
        if op.get_context().dialect.name!='sqlite':op.drop_constraint('fk_'+table+'_'+column,table,type_='foreignkey')
        op.drop_column(table,column)
    op.drop_column('content','origin_version')
    if op.get_context().dialect.name!='sqlite':op.drop_constraint('fk_content_origin_content_id','content',type_='foreignkey')
    op.drop_column('content','origin_content_id')
