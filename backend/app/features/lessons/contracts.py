from typing import Literal,Any
from pydantic import Field,model_validator
from app.features.contracts import Input
from app.features.trails.contracts import ImageRef
from app.features.levels import LiteracyLevel
Key=str
class Option(Input):
    id:str=Field(pattern=r'^[a-zA-Z0-9-]{1,40}$')
    text:str=Field(default='',max_length=120)
    image:ImageRef|None=None
    @model_validator(mode='after')
    def labelled(self):
        if not self.text and not self.image:raise ValueError('Elemento precisa de texto ou imagem.')
        if self.image and not self.text and not self.image.alt.strip():raise ValueError('Imagem sem rótulo escrito precisa de descrição alternativa.')
        return self
class Normalization(Input):
    ignore_case:bool=True
    ignore_accents:bool=False
    collapse_spaces:bool=True
    unmatched:Literal['incorrect','human_review']='human_review'
class Question(Input):
    id:str=Field(pattern=r'^[a-zA-Z0-9-]{1,40}$')
    kind:Literal['single','multiple','order','matching','text']='single'
    prompt:str=Field(min_length=1,max_length=500)
    skill:str=Field(default='',max_length=100)
    instruction:str=Field(default='',max_length=1000)
    image:ImageRef|None=None
    options:list[Option]=Field(default_factory=list,max_length=12)
    targets:list[Option]=Field(default_factory=list,max_length=12)
    answer:Any
    required:bool=True
    reading_allowed:bool=False
    normalization:Normalization=Field(default_factory=Normalization)
    feedback_correct:str=Field(default='Resposta registrada. Vamos continuar!',max_length=500)
    feedback_incorrect:str=Field(default='Vamos observar outra possibilidade? Você pode usar uma dica.',max_length=500)
    hint:str=Field(default='',max_length=500)
    allow_retry:bool=True
    max_attempts:int|None=Field(default=None,ge=1,le=30)
    @model_validator(mode='after')
    def configured(self):
        if self.image and not self.image.alt.strip():raise ValueError('Informe a descrição alternativa da imagem de apoio da questão.')
        ids={o.id for o in self.options};target_ids={o.id for o in self.targets}
        if len(ids)!=len(self.options) or len(target_ids)!=len(self.targets):raise ValueError('IDs de elementos devem ser distintos.')
        if self.kind=='single' and (len(ids)<2 or not isinstance(self.answer,str) or self.answer not in ids):raise ValueError('Seleção única precisa de duas opções e gabarito válido.')
        if self.kind in ('multiple','order'):
            if len(ids)<2 or not isinstance(self.answer,list) or not self.answer or any(not isinstance(a,str) for a in self.answer) or len(set(self.answer))!=len(self.answer) or not set(self.answer)<=ids:raise ValueError('Configure elementos e respostas válidos.')
            if self.kind=='order' and set(self.answer)!=ids:raise ValueError('A sequência correta deve usar todos os elementos.')
        if self.kind=='matching' and (len(ids)<2 or ids!=set(self.answer if isinstance(self.answer,dict) else {}) or len(target_ids)!=len(ids) or not all(isinstance(v,str) for v in self.answer.values()) or set(self.answer.values())!=target_ids):raise ValueError('Pares precisam de origens/destinos distintos e associação completa.')
        if self.kind=='text' and (not isinstance(self.answer,list) or not 1<=len(self.answer)<=10 or any(not isinstance(a,str) or not a.strip() or len(a)>200 for a in self.answer)):raise ValueError('Informe até dez respostas escritas aceitas.')
        return self
class Screen(Input):
    id:str=Field(pattern=r'^[a-zA-Z0-9-]{1,40}$')
    type:Literal['text','image','video','text_image','text_video','activity','completion']
    title:str=Field(default='',max_length=160)
    text:str=Field(default='',max_length=5000)
    instruction:str=Field(default='',max_length=1000)
    image:ImageRef|None=None
    video_id:str|None=Field(default=None,pattern=r'^[a-zA-Z0-9_-]{11}$')
    transcript:str=Field(default='',max_length=5000)
    media_reviewed:bool=False
    question:Question|None=None
    @model_validator(mode='after')
    def content(self):
        if self.type=='activity' and not self.question:raise ValueError('Tela de atividade precisa de questão executável.')
        if self.type!='activity' and self.question:raise ValueError('Questões pertencem a telas de atividade.')
        if self.type in ('image','text_image') and not self.image:raise ValueError('Selecione uma imagem.')
        if self.type=='image' and self.image and not self.image.alt.strip() and not self.text.strip():raise ValueError('Tela de imagem precisa de descrição alternativa ou texto equivalente.')
        if self.type in ('video','text_video') and (not self.video_id or not self.transcript):raise ValueError('Vídeo precisa de ID YouTube válido e alternativa textual.')
        if self.type in ('text','text_image','text_video') and not self.text:raise ValueError('Escreva o conteúdo da tela.')
        return self
class LessonCommand(Input):
    title:str=Field(min_length=2,max_length=120)
    description:str=Field(min_length=2,max_length=600)
    objective:str=Field(min_length=2,max_length=1000)
    difficulty:Literal['not_defined','initial','practice','extension']='not_defined'
    literacy_level:LiteracyLevel|None=None
    skills:list[str]=Field(default_factory=list,max_length=20)
    audience:str=Field(default='',max_length=500)
    adaptations:str=Field(default='',max_length=1000)
    cover:ImageRef|None=None
    screens:list[Screen]=Field(min_length=1,max_length=40)
    visibility:Literal['private','public']='private'
    require_review_for_advance:bool=False
    @model_validator(mode='after')
    def ordered(self):
        if len({s.id for s in self.screens})!=len(self.screens):raise ValueError('Telas precisam de identificadores distintos.')
        q=[s.question.id for s in self.screens if s.question]
        if len(set(q))!=len(q):raise ValueError('Questões precisam de identificadores distintos.')
        if any(len(s)>100 or not s.strip() for s in self.skills):raise ValueError('Rótulos de habilidade devem ser curtos e preenchidos.')
        return self
class LessonEdit(LessonCommand):
    version:int=Field(ge=1)
class Share(Input):
    recipient_id:str=Field(min_length=1,max_length=128)
    revision_id:str
    can_copy:bool=False
    can_redistribute:bool=False
class BulkAssign(Input):
    revision_id:str
    student_ids:list[str]=Field(default_factory=list,max_length=100)
    classroom_ids:list[str]=Field(default_factory=list,max_length=20)
    school_ids:list[str]=Field(default_factory=list,max_length=5)
class Progress(Input):
    version:int=Field(ge=1)
    cursor:int=Field(ge=0,le=39)
    acknowledge_screen:str|None=None
class AnswerDraft(Input):
    version:int=Field(ge=1)
    item_id:str
    value:Any
class HumanJudgement(Input):
    version:int=Field(ge=1)
    item_id:str
    correct:bool
    note:str=Field(min_length=5,max_length=1000)
    response_event_id:str|None=None
