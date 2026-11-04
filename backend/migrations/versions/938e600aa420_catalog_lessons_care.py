"""Trail authorship, per-child lesson instances, private validated media and care."""
from alembic import op
import sqlalchemy as sa
revision='938e600aa420'
down_revision='82dd104c907a'
branch_labels=None
depends_on=None

def upgrade():
    op.create_table('trail_definitions',sa.Column('id',sa.String(36),primary_key=True),sa.Column('author_id',sa.String(128),sa.ForeignKey('adults.id'),nullable=False),sa.Column('title',sa.String(120),nullable=False),sa.Column('description',sa.String(600),nullable=False),sa.Column('body',sa.JSON(),nullable=False),sa.Column('status',sa.String(20),nullable=False),sa.Column('version',sa.Integer(),nullable=False),sa.Column('archived_at',sa.String(40)),sa.Column('created_at',sa.String(40),nullable=False))
    op.create_table('trail_revisions',sa.Column('id',sa.String(36),primary_key=True),sa.Column('trail_id',sa.String(36),sa.ForeignKey('trail_definitions.id'),nullable=False),sa.Column('version',sa.Integer(),nullable=False),sa.Column('snapshot',sa.JSON(),nullable=False),sa.Column('created_at',sa.String(40),nullable=False),sa.UniqueConstraint('trail_id','version'))
    op.create_table('trail_enrollments',sa.Column('id',sa.String(36),primary_key=True),sa.Column('student_id',sa.String(36),sa.ForeignKey('students.id'),nullable=False),sa.Column('trail_id',sa.String(36),sa.ForeignKey('trail_definitions.id'),nullable=False),sa.Column('trail_version',sa.Integer(),nullable=False),sa.Column('snapshot',sa.JSON(),nullable=False),sa.Column('created_by',sa.String(128),sa.ForeignKey('adults.id'),nullable=False),sa.Column('created_at',sa.String(40),nullable=False),sa.UniqueConstraint('student_id','trail_id','trail_version'))
    op.create_table('media_assets',sa.Column('id',sa.String(36),primary_key=True),sa.Column('owner_id',sa.String(128),sa.ForeignKey('adults.id'),nullable=False),sa.Column('data',sa.LargeBinary(),nullable=False),sa.Column('alt',sa.String(300),nullable=False),sa.Column('width',sa.Integer(),nullable=False),sa.Column('height',sa.Integer(),nullable=False),sa.Column('created_at',sa.String(40),nullable=False))
    op.create_table('student_care',sa.Column('student_id',sa.String(36),sa.ForeignKey('students.id'),primary_key=True),sa.Column('communication',sa.String(1000),nullable=False),sa.Column('sensitive_notes',sa.Text(),nullable=False),sa.Column('presentation',sa.JSON(),nullable=False),sa.Column('author_id',sa.String(128),sa.ForeignKey('adults.id'),nullable=False),sa.Column('version',sa.Integer(),nullable=False),sa.Column('updated_at',sa.String(40),nullable=False))
    if op.get_context().dialect.name=='sqlite':
        op.execute('ALTER TABLE learning_stages ADD COLUMN enrollment_id VARCHAR(36) REFERENCES trail_enrollments(id)')
    else:
        op.add_column('learning_stages',sa.Column('enrollment_id',sa.String(36),nullable=True))
        op.create_foreign_key('fk_stage_enrollment','learning_stages','trail_enrollments',['enrollment_id'],['id'])
    op.create_index('ix_learning_stages_enrollment_id','learning_stages',['enrollment_id'])
    op.add_column('learning_stages',sa.Column('lesson_snapshot',sa.JSON(),nullable=False,server_default='{}'))
    op.add_column('attempts',sa.Column('supports_used',sa.JSON(),nullable=False,server_default='[]'))
    op.add_column('observations',sa.Column('details',sa.JSON(),nullable=False,server_default='{}'))
    op.add_column('grants',sa.Column('can_view_care',sa.Boolean(),nullable=False,server_default=sa.false()))

def downgrade():
    op.drop_column('grants','can_view_care');op.drop_column('observations','details');op.drop_column('attempts','supports_used');op.drop_column('learning_stages','lesson_snapshot')
    op.drop_index('ix_learning_stages_enrollment_id','learning_stages')
    if op.get_context().dialect.name!='sqlite':op.drop_constraint('fk_stage_enrollment','learning_stages',type_='foreignkey')
    op.drop_column('learning_stages','enrollment_id')
    for table in ['student_care','media_assets','trail_enrollments','trail_revisions','trail_definitions']:op.drop_table(table)
