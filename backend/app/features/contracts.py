from typing import Literal,Any
from datetime import date
from pydantic import BaseModel, ConfigDict, Field, field_validator,model_validator
from .levels import ConfirmedLevel


class Input(BaseModel):
    model_config = ConfigDict(extra='forbid', str_strip_whitespace=True)


class CreateStudent(Input):
    name: str = Field(min_length=2, max_length=60)
    supports: list[str] = Field(default_factory=list, max_length=10)
    birth_date: date | None = None

    @field_validator('birth_date')
    @classmethod
    def birth_not_future(cls, value):
        if value and value > date.today():
            raise ValueError('Nascimento não pode ser futuro')
        return value

    @field_validator('supports')
    @classmethod
    def support_limits(cls, values):
        if any(not v.strip() or len(v) > 300 for v in values):
            raise ValueError('Adaptações devem ter 1–300 caracteres')
        return values


class UpdateStudent(CreateStudent):
    version: int = Field(ge=1)


class Profile(Input):
    display_name: str = Field(min_length=1, max_length=100)
    profession: Literal['guardian', 'teacher']


class Preferences(Input):
    theme: Literal['system', 'light', 'dark'] = 'system'
    contrast: bool = False
    font_scale: Literal[1, 1.25, 1.5] = 1
    read_enabled: bool = True
    reduce_motion: bool = False


class Invite(Input):
    role: Literal['guardian', 'teacher']
    recipient_id: str = Field(min_length=1, max_length=128)


class AcceptInvite(Input):
    token: str = Field(min_length=20, max_length=100)


class Version(Input):
    version: int = Field(ge=1)


class Evidence(Input):
    item: str = Field(min_length=1, max_length=100)
    response: str = Field(min_length=1, max_length=500)
    support: str = Field(default='', max_length=300)


class AssessmentCommand(Input):
    instrument: str = Field(min_length=1, max_length=80)
    evidence: list[Evidence] = Field(min_length=1, max_length=20)
    notes: str = Field(default='', max_length=1500)
    synthetic: bool = False


class ObservationCommand(Input):
    context: str = Field(min_length=1, max_length=120)
    text: str = Field(min_length=1, max_length=1500)
    skill: str = Field(default='',max_length=100)
    support: str = Field(default='',max_length=200)
    needs_support: bool = False


class Item(Input):
    id: str = Field(pattern=r'^[a-zA-Z0-9-]{1,40}$')
    prompt: str = Field(min_length=1, max_length=400)
    choices: list[str] = Field(min_length=2, max_length=6)
    answer: int = Field(ge=0, le=5)
    reading_allowed: bool = False
    required: bool = True
    skill: str = Field(default='',max_length=100)

    @field_validator('choices')
    @classmethod
    def choices_valid(cls, values):
        if any(not v.strip() or len(v) > 100 for v in values) or len(set(values)) != len(values):
            raise ValueError('Alternativas distintas, com até 100 caracteres')
        return values


class ContentCommand(Input):
    kind: Literal['activity', 'guidance', 'instrument']
    title: str = Field(min_length=1, max_length=120)
    instructions: str = Field(min_length=1, max_length=1500)
    items: list[Item] = Field(default_factory=list, max_length=20)
    rubric_text: str | None = Field(default=None, min_length=20, max_length=3000)


class ReviseContent(ContentCommand):
    version: int = Field(ge=1)


class Publish(Input):
    version: int = Field(ge=1)
    review_note: str = Field(min_length=10, max_length=500)


class Assign(Input):
    content_id: str


class ResponseCommand(Version):
    item_id: str
    choice: int | None = Field(default=None,ge=0, le=5)
    value: Any = None
    supports_used: list[Literal['instruction_audio','large_text','high_contrast']] = Field(default_factory=list,max_length=3)
    @model_validator(mode='after')
    def response_value(self):
        if (self.choice is None)==(self.value is None):raise ValueError('Envie uma única resposta: choice legado ou value.')
        return self


class SchoolCommand(Input):
    name: str = Field(min_length=1, max_length=120)


class ClassroomCommand(SchoolCommand):
    school_id: str


class EnrollmentCommand(Input):
    student_id: str


class LevelCommand(Version):
    level: ConfirmedLevel
    evidence_ids: list[str] = Field(min_length=1, max_length=20)
    justification: str = Field(min_length=10, max_length=1500)


class Analyze(Input):
    synthetic_instrument: bool = False


class Review(Input):
    decision: Literal['accepted', 'edited', 'rejected']
    revised_result: dict | None = None
    note: str = Field(default='', max_length=1000)


class FeedbackCommand(Input):
    text: str = Field(min_length=10, max_length=2000)


class FollowupCommand(Input):
    enabled: bool
    notice_version: Literal['2026-10-22-v1']


class GuidanceCommand(Input):
    title: str = Field(min_length=2, max_length=120)
    text: str = Field(min_length=5, max_length=1500)


class Reference(Input):
    title: str = Field(min_length=2, max_length=150)
    citation: str = Field(min_length=5, max_length=500)
    excerpt: str = Field(min_length=20, max_length=1500)


class ContentReviewCommand(Version):
    approved: bool
    note: str = Field(min_length=10, max_length=1500)
    references: list[Reference] = Field(min_length=1, max_length=3)


class AttentionCommand(Input):
    reason: str = Field(min_length=10, max_length=1000)
