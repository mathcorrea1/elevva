"""Small normalized core. Feature services own changes; JSON holds versioned item evidence, not totals."""
import uuid
from datetime import datetime, timezone
from sqlalchemy import String, ForeignKey, UniqueConstraint, JSON, Text, Date, LargeBinary, Index
from datetime import date
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base


def uid():
    return str(uuid.uuid4())


def now():
    return datetime.now(timezone.utc).isoformat()


class Adult(Base):
    __tablename__ = 'adults'
    id: Mapped[str] = mapped_column(String(128), primary_key=True)
    display_name: Mapped[str] = mapped_column(String(100), default='Adulto')
    profession: Mapped[str] = mapped_column(String(20), default='guardian')
    preferences: Mapped[dict] = mapped_column(JSON, default=dict)


class Student(Base):
    __tablename__ = 'students'
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=uid)
    name: Mapped[str] = mapped_column(String(100))
    birth_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    supports: Mapped[list] = mapped_column(JSON, default=list)
    confirmed_level: Mapped[str | None] = mapped_column(String(40), nullable=True)
    version: Mapped[int] = mapped_column(default=1)
    created_at: Mapped[str] = mapped_column(String(40), default=now)


class Grant(Base):
    __tablename__ = 'grants'
    __table_args__ = (UniqueConstraint('student_id', 'adult_id'),)
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=uid)
    student_id: Mapped[str] = mapped_column(ForeignKey('students.id'))
    adult_id: Mapped[str] = mapped_column(ForeignKey('adults.id'))
    role: Mapped[str] = mapped_column(String(20))
    active: Mapped[bool] = mapped_column(default=True)
    can_view_care: Mapped[bool] = mapped_column(default=False)


class Invitation(Base):
    __tablename__ = 'invitations'
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=uid)
    student_id: Mapped[str] = mapped_column(ForeignKey('students.id'))
    token_hash: Mapped[str] = mapped_column(String(64), unique=True)
    role: Mapped[str] = mapped_column(String(20))
    recipient_id: Mapped[str] = mapped_column(String(128))
    created_by: Mapped[str] = mapped_column(ForeignKey('adults.id'))
    expires_at: Mapped[str] = mapped_column(String(40))
    accepted_by: Mapped[str | None] = mapped_column(ForeignKey('adults.id'), nullable=True)


class Content(Base):
    __tablename__ = 'content'
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=uid)
    author_id: Mapped[str] = mapped_column(ForeignKey('adults.id'))
    kind: Mapped[str] = mapped_column(String(20))
    title: Mapped[str] = mapped_column(String(120))
    body: Mapped[dict] = mapped_column(JSON)
    status: Mapped[str] = mapped_column(String(20), default='draft')
    version: Mapped[int] = mapped_column(default=1)
    archived_at: Mapped[str | None] = mapped_column(String(40), nullable=True)
    origin_content_id: Mapped[str | None] = mapped_column(ForeignKey('content.id'),nullable=True)
    origin_version: Mapped[int | None] = mapped_column(nullable=True)


class ContentRevision(Base):
    __tablename__ = 'content_revisions'
    __table_args__ = (UniqueConstraint('content_id', 'version'),)
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=uid)
    content_id: Mapped[str] = mapped_column(ForeignKey('content.id'))
    version: Mapped[int] = mapped_column()
    snapshot: Mapped[dict] = mapped_column(JSON)
    captured_by: Mapped[str] = mapped_column(ForeignKey('adults.id'))
    captured_at: Mapped[str] = mapped_column(String(40), default=now)
    publication_status: Mapped[str] = mapped_column(String(20),default='draft')


class Assessment(Base):
    __tablename__ = 'assessments'
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=uid)
    student_id: Mapped[str] = mapped_column(ForeignKey('students.id'))
    adult_id: Mapped[str] = mapped_column(ForeignKey('adults.id'))
    instrument: Mapped[str] = mapped_column(String(80))
    instrument_snapshot: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    evidence: Mapped[list] = mapped_column(JSON)
    notes: Mapped[str] = mapped_column(Text, default='')
    synthetic: Mapped[bool] = mapped_column(default=False)
    created_at: Mapped[str] = mapped_column(String(40), default=now)


class LearningStage(Base):
    __tablename__ = 'learning_stages'
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=uid)
    student_id: Mapped[str] = mapped_column(ForeignKey('students.id'))
    title: Mapped[str] = mapped_column(String(120))
    description: Mapped[str] = mapped_column(String(500), default='')
    created_by: Mapped[str] = mapped_column(ForeignKey('adults.id'))
    created_at: Mapped[str] = mapped_column(String(40), default=now)
    enrollment_id: Mapped[str | None] = mapped_column(ForeignKey('trail_enrollments.id'), nullable=True, index=True)
    lesson_snapshot: Mapped[dict] = mapped_column(JSON, default=dict)
    lesson_revision_id: Mapped[str | None] = mapped_column(ForeignKey('content_revisions.id'),nullable=True,index=True)


class Assignment(Base):
    __tablename__ = 'assignments'
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=uid)
    student_id: Mapped[str] = mapped_column(ForeignKey('students.id'))
    content_id: Mapped[str] = mapped_column(ForeignKey('content.id'))
    stage_id: Mapped[str | None] = mapped_column(ForeignKey('learning_stages.id'), nullable=True, index=True)
    content_version: Mapped[int] = mapped_column()
    snapshot_data: Mapped[dict] = mapped_column('snapshot',JSON)
    content_revision_id: Mapped[str | None] = mapped_column(ForeignKey('content_revisions.id'),nullable=True,index=True)
    revision: Mapped[ContentRevision | None] = relationship(foreign_keys=[content_revision_id])
    position: Mapped[int] = mapped_column()
    created_by: Mapped[str] = mapped_column(ForeignKey('adults.id'))
    completed_at: Mapped[str | None] = mapped_column(String(40), nullable=True)

    @property
    def snapshot(self):
        if self.content_revision_id and self.revision:
            return {'title':self.revision.snapshot['title'],**self.revision.snapshot['body']}
        return self.snapshot_data

    @snapshot.setter
    def snapshot(self,value):self.snapshot_data=value


class Attempt(Base):
    __tablename__ = 'attempts'
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=uid)
    assignment_id: Mapped[str] = mapped_column(ForeignKey('assignments.id'))
    student_id: Mapped[str] = mapped_column(ForeignKey('students.id'))
    adult_id: Mapped[str] = mapped_column(ForeignKey('adults.id'))
    responses: Mapped[dict] = mapped_column(JSON, default=dict)
    status: Mapped[str] = mapped_column(String(20), default='in_progress')
    version: Mapped[int] = mapped_column(default=1)
    created_at: Mapped[str] = mapped_column(String(40), default=now)
    finished_at: Mapped[str | None] = mapped_column(String(40), nullable=True)
    supports_used: Mapped[list] = mapped_column(JSON, default=list)
    cursor: Mapped[int] = mapped_column(default=0)
    visited: Mapped[list] = mapped_column(JSON,default=list)
    drafts: Mapped[dict] = mapped_column(JSON,default=dict)
    interactions: Mapped[list] = mapped_column(JSON,default=list)


class ContentShare(Base):
    __tablename__='content_shares'
    __table_args__=(UniqueConstraint('revision_id','recipient_id'),)
    id: Mapped[str] = mapped_column(String(36),primary_key=True,default=uid)
    content_id: Mapped[str] = mapped_column(ForeignKey('content.id'))
    revision_id: Mapped[str] = mapped_column(ForeignKey('content_revisions.id'))
    created_by: Mapped[str] = mapped_column(ForeignKey('adults.id'))
    recipient_id: Mapped[str] = mapped_column(ForeignKey('adults.id'))
    can_copy: Mapped[bool] = mapped_column(default=False)
    can_redistribute: Mapped[bool] = mapped_column(default=False)
    status: Mapped[str] = mapped_column(String(20),default='pending')
    created_at: Mapped[str] = mapped_column(String(40),default=now)


class LessonAssignmentBatch(Base):
    __tablename__='lesson_assignment_batches'
    id: Mapped[str] = mapped_column(String(36),primary_key=True,default=uid)
    adult_id: Mapped[str] = mapped_column(ForeignKey('adults.id'))
    revision_id: Mapped[str] = mapped_column(ForeignKey('content_revisions.id'))
    created_at: Mapped[str] = mapped_column(String(40),default=now)


class Observation(Base):
    __tablename__ = 'observations'
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=uid)
    student_id: Mapped[str] = mapped_column(ForeignKey('students.id'))
    adult_id: Mapped[str] = mapped_column(ForeignKey('adults.id'))
    context: Mapped[str] = mapped_column(String(120))
    text: Mapped[str] = mapped_column(Text)
    created_at: Mapped[str] = mapped_column(String(40), default=now)
    details: Mapped[dict] = mapped_column(JSON, default=dict)


class TrailDefinition(Base):
    __tablename__ = 'trail_definitions'
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=uid)
    author_id: Mapped[str] = mapped_column(ForeignKey('adults.id'))
    title: Mapped[str] = mapped_column(String(120))
    description: Mapped[str] = mapped_column(String(600), default='')
    body: Mapped[dict] = mapped_column(JSON)
    status: Mapped[str] = mapped_column(String(20), default='draft')
    version: Mapped[int] = mapped_column(default=1)
    archived_at: Mapped[str | None] = mapped_column(String(40), nullable=True)
    created_at: Mapped[str] = mapped_column(String(40), default=now)


class TrailRevision(Base):
    __tablename__ = 'trail_revisions'
    __table_args__ = (UniqueConstraint('trail_id', 'version'),)
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=uid)
    trail_id: Mapped[str] = mapped_column(ForeignKey('trail_definitions.id'))
    version: Mapped[int] = mapped_column()
    snapshot: Mapped[dict] = mapped_column(JSON)
    created_at: Mapped[str] = mapped_column(String(40), default=now)


class TrailEnrollment(Base):
    __tablename__ = 'trail_enrollments'
    __table_args__ = (UniqueConstraint('student_id', 'trail_id', 'trail_version'),)
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=uid)
    student_id: Mapped[str] = mapped_column(ForeignKey('students.id'))
    trail_id: Mapped[str] = mapped_column(ForeignKey('trail_definitions.id'))
    trail_version: Mapped[int] = mapped_column()
    snapshot: Mapped[dict] = mapped_column(JSON)
    created_by: Mapped[str] = mapped_column(ForeignKey('adults.id'))
    created_at: Mapped[str] = mapped_column(String(40), default=now)


class MediaAsset(Base):
    __tablename__ = 'media_assets'
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=uid)
    owner_id: Mapped[str] = mapped_column(ForeignKey('adults.id'))
    data: Mapped[bytes] = mapped_column(LargeBinary)
    alt: Mapped[str] = mapped_column(String(300), default='')
    width: Mapped[int] = mapped_column()
    height: Mapped[int] = mapped_column()
    created_at: Mapped[str] = mapped_column(String(40), default=now)


class StudentCare(Base):
    __tablename__ = 'student_care'
    student_id: Mapped[str] = mapped_column(ForeignKey('students.id'), primary_key=True)
    communication: Mapped[str] = mapped_column(String(1000), default='')
    sensitive_notes: Mapped[str] = mapped_column(Text, default='')
    presentation: Mapped[dict] = mapped_column(JSON, default=dict)
    author_id: Mapped[str] = mapped_column(ForeignKey('adults.id'))
    version: Mapped[int] = mapped_column(default=1)
    updated_at: Mapped[str] = mapped_column(String(40), default=now)
    characteristics: Mapped[dict] = mapped_column(JSON,default=dict)


class School(Base):
    __tablename__ = 'schools'
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=uid)
    owner_id: Mapped[str] = mapped_column(ForeignKey('adults.id'))
    name: Mapped[str] = mapped_column(String(120))


class Classroom(Base):
    __tablename__ = 'classrooms'
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=uid)
    school_id: Mapped[str] = mapped_column(ForeignKey('schools.id'))
    teacher_id: Mapped[str] = mapped_column(ForeignKey('adults.id'))
    name: Mapped[str] = mapped_column(String(100))


class Enrollment(Base):
    __tablename__ = 'enrollments'
    __table_args__ = (UniqueConstraint('classroom_id', 'student_id'),)
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=uid)
    classroom_id: Mapped[str] = mapped_column(ForeignKey('classrooms.id'))
    student_id: Mapped[str] = mapped_column(ForeignKey('students.id'))


class Analysis(Base):
    __tablename__ = 'analyses'
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=uid)
    student_id: Mapped[str] = mapped_column(ForeignKey('students.id'))
    adult_id: Mapped[str] = mapped_column(ForeignKey('adults.id'))
    status: Mapped[str] = mapped_column(String(30), default='pending')
    snapshot: Mapped[dict] = mapped_column(JSON)
    snapshot_hash: Mapped[str] = mapped_column(String(64))
    prompt_version: Mapped[str] = mapped_column(String(64))
    model: Mapped[str] = mapped_column(String(100))
    origin: Mapped[str] = mapped_column(String(20), default='live')
    result: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    usage: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    request_id: Mapped[str | None] = mapped_column(String(150), nullable=True)
    command_key: Mapped[str | None] = mapped_column(String(64), unique=True, index=True, nullable=True)
    reviewed_by: Mapped[str | None] = mapped_column(ForeignKey('adults.id'), nullable=True)
    review: Mapped[str | None] = mapped_column(String(20), nullable=True)
    reviewed_at: Mapped[str | None] = mapped_column(String(40), nullable=True)
    revised_result: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    review_note: Mapped[str | None] = mapped_column(String(1000), nullable=True)
    created_at: Mapped[str] = mapped_column(String(40), default=now)


class Command(Base):
    __tablename__ = 'commands'
    __table_args__ = (UniqueConstraint('adult_id', 'key'),)
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=uid)
    adult_id: Mapped[str] = mapped_column(ForeignKey('adults.id'))
    key: Mapped[str] = mapped_column(String(100))
    fingerprint: Mapped[str] = mapped_column(String(64))
    response: Mapped[dict] = mapped_column(JSON)


class Feedback(Base):
    __tablename__ = 'feedback'
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=uid)
    adult_id: Mapped[str] = mapped_column(ForeignKey('adults.id'))
    text: Mapped[str] = mapped_column(Text)
    created_at: Mapped[str] = mapped_column(String(40), default=now)


class AIGate(Base):
    __tablename__ = 'ai_gate'
    id: Mapped[int] = mapped_column(primary_key=True)
    busy: Mapped[bool] = mapped_column(default=False)
    last_started_at: Mapped[str | None] = mapped_column(String(40), nullable=True)


class LevelConfirmation(Base):
    __tablename__ = 'level_confirmations'
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=uid)
    student_id: Mapped[str] = mapped_column(ForeignKey('students.id'))
    adult_id: Mapped[str] = mapped_column(ForeignKey('adults.id'))
    level: Mapped[str] = mapped_column(String(40))
    justification: Mapped[str] = mapped_column(Text)
    evidence_ids: Mapped[list] = mapped_column(JSON)
    created_at: Mapped[str] = mapped_column(String(40), default=now)


class Guidance(Base):
    __tablename__ = 'student_guidance'
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=uid)
    student_id: Mapped[str] = mapped_column(ForeignKey('students.id'))
    adult_id: Mapped[str] = mapped_column(ForeignKey('adults.id'))
    title: Mapped[str] = mapped_column(String(120))
    text: Mapped[str] = mapped_column(Text)
    status: Mapped[str] = mapped_column(String(30), default='pending_review')
    created_at: Mapped[str] = mapped_column(String(40), default=now)


class AuditEvent(Base):
    __tablename__ = 'audit_events'
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=uid)
    student_id: Mapped[str] = mapped_column(ForeignKey('students.id'))
    adult_id: Mapped[str] = mapped_column(ForeignKey('adults.id'))
    action: Mapped[str] = mapped_column(String(40))
    resource_id: Mapped[str] = mapped_column(String(128))
    created_at: Mapped[str] = mapped_column(String(40), default=now)


class ContentReview(Base):
    __tablename__ = 'content_reviews'
    __table_args__ = (UniqueConstraint('content_id', 'content_version'),)
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=uid)
    content_id: Mapped[str] = mapped_column(ForeignKey('content.id'))
    content_version: Mapped[int] = mapped_column()
    reviewer_id: Mapped[str] = mapped_column(ForeignKey('adults.id'))
    approved: Mapped[bool] = mapped_column(default=False)
    note: Mapped[str] = mapped_column(Text)
    references: Mapped[list] = mapped_column(JSON)
    reviewed_at: Mapped[str] = mapped_column(String(40), default=now)


class FollowupEvent(Base):
    __tablename__ = 'followup_events'
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=uid)
    adult_id: Mapped[str] = mapped_column(ForeignKey('adults.id'))
    enabled: Mapped[bool] = mapped_column()
    notice_version: Mapped[str] = mapped_column(String(40))
    created_at: Mapped[str] = mapped_column(String(40), default=now)


class AttentionFlag(Base):
    __tablename__ = 'attention_flags'
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=uid)
    student_id: Mapped[str] = mapped_column(ForeignKey('students.id'))
    adult_id: Mapped[str] = mapped_column(ForeignKey('adults.id'))
    reason: Mapped[str] = mapped_column(Text)
    created_at: Mapped[str] = mapped_column(String(40), default=now)
    resolved_at: Mapped[str | None] = mapped_column(String(40), nullable=True)
    resolved_by: Mapped[str | None] = mapped_column(ForeignKey('adults.id'), nullable=True)


Index('ix_grants_adult_active_student',Grant.adult_id,Grant.active,Grant.student_id)
Index('ix_students_name_id',Student.name,Student.id)
Index('ix_content_author_kind_title',Content.author_id,Content.kind,Content.title)
Index('ix_assignments_student_position',Assignment.student_id,Assignment.position)
Index('ix_attempts_student_status_finished',Attempt.student_id,Attempt.status,Attempt.finished_at)
Index('ix_attempts_assignment_status',Attempt.assignment_id,Attempt.status)
Index('ix_assessments_student_created',Assessment.student_id,Assessment.created_at)
Index('ix_observations_student_created',Observation.student_id,Observation.created_at)
Index('ix_enrollments_student_classroom',Enrollment.student_id,Enrollment.classroom_id)
Index('ix_content_shares_recipient_status',ContentShare.recipient_id,ContentShare.status,ContentShare.created_at)
