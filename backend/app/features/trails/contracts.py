from typing import Literal
from pydantic import Field, model_validator
from app.features.contracts import Input, Item

class ImageRef(Input):
    builtin: Literal['garden','sky','sprout','butterfly','boat','milestone','lumi'] | None = None
    asset_id: str | None = None
    alt: str = Field(default='',max_length=300)
    @model_validator(mode='after')
    def one(self):
        if bool(self.builtin)==bool(self.asset_id):raise ValueError('Escolha uma ilustração ou um arquivo.')
        return self

class Lesson(Input):
    key: str = Field(pattern=r'^[a-zA-Z0-9-]{1,40}$')
    title: str = Field(min_length=2,max_length=120)
    objective: str = Field(min_length=2,max_length=500)
    image: ImageRef | None = None
    instructions: str = Field(min_length=2,max_length=1500)
    concise_instructions: str = Field(default='',max_length=500)
    content_ids: list[str] = Field(default_factory=list,max_length=6)
    lesson_revision_id: str | None = None
    items: list[Item] = Field(default_factory=list,max_length=20)
    advance_percent: int | None = Field(default=None,ge=0,le=100)
    @model_validator(mode='after')
    def executable(self):
        if sum([bool(self.items),bool(self.content_ids),bool(self.lesson_revision_id)])!=1:raise ValueError('Escolha aula da biblioteca, atividades existentes OU novas questões.')
        if self.items and (len({i.id for i in self.items})!=len(self.items) or any(i.answer>=len(i.choices) for i in self.items) or not any(i.required for i in self.items)):
            raise ValueError('Questões precisam de IDs distintos, gabaritos válidos e pelo menos uma obrigatória.')
        return self

class TrailCommand(Input):
    title: str = Field(min_length=2,max_length=120)
    description: str = Field(min_length=2,max_length=600)
    cover: ImageRef | None = None
    scenario: Literal['garden','sky'] = 'garden'
    availability: Literal['sequential','free'] = 'sequential'
    status: Literal['draft','synthetic','published'] = 'draft'
    lessons: list[Lesson] = Field(min_length=1,max_length=12)

class TrailEdit(TrailCommand):
    version: int = Field(ge=1)

class Enroll(Input):
    trail_id: str
    version: int = Field(ge=1)

class Upload(Input):
    base64: str = Field(min_length=8,max_length=2800000)
    alt: str = Field(default='',max_length=300)
