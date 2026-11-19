"""Explicit institutional roles; existing owners and student grants are preserved."""
from alembic import op
import sqlalchemy as sa
revision='d09128ba3402'
down_revision='c81007ab1201'
branch_labels=None
depends_on=None
def upgrade():
    op.create_table('school_access',sa.Column('id',sa.String(36),primary_key=True),sa.Column('school_id',sa.String(36),sa.ForeignKey('schools.id'),nullable=False),sa.Column('adult_id',sa.String(128),sa.ForeignKey('adults.id'),nullable=False),sa.Column('role',sa.String(20),nullable=False),sa.Column('active',sa.Boolean,nullable=False),sa.UniqueConstraint('school_id','adult_id'))
    op.create_index('ix_school_access_school_id','school_access',['school_id'])
    op.create_table('classroom_staff',sa.Column('id',sa.String(36),primary_key=True),sa.Column('classroom_id',sa.String(36),sa.ForeignKey('classrooms.id'),nullable=False),sa.Column('adult_id',sa.String(128),sa.ForeignKey('adults.id'),nullable=False),sa.Column('active',sa.Boolean,nullable=False),sa.UniqueConstraint('classroom_id','adult_id'))
    op.create_index('ix_classroom_staff_classroom_id','classroom_staff',['classroom_id'])
def downgrade():
    op.drop_table('classroom_staff');op.drop_table('school_access')
