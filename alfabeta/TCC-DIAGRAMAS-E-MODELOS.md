# Elevva — Pacote de Diagramas e Texto para TCC

Este arquivo reúne tudo em um só lugar para importação/cópia:
- Diagrama de Classes
- Diagrama de Sequência
- Diagrama Entidade-Relacionamento (DER)
- Modelo Entidade-Relacionamento (texto ABNT)

## Como usar
1. Se o software suportar **Mermaid**, copie os blocos `mermaid`.
2. Se o software suportar **PlantUML**, copie os blocos `plantuml`.
3. Para o TCC, use as seções de texto ABNT (3.2 a 3.5).

---

## 1) Diagrama de Classes — Mermaid

```mermaid
classDiagram
direction LR

class User {
  +string id
  +string name
  +string email
  +UserRole role
}

class Student {
  +string id
  +string anonId
  +string name
  +string birthDate
  +string avatarColor
  +LiteracyLevel literacyLevel
  +number progress
  +boolean assessmentCompleted
}

class School {
  +string id
  +string name
}

class Turma {
  +string id
  +string name
  +string year
}

class SpecialNeeds {
  +boolean autism
  +boolean dyslexia
  +boolean adhd
  +boolean dyscalculia
  +boolean visualImpairment
  +boolean hearingImpairment
  +string other
}

class ChildActivity {
  +string id
  +string title
  +ActivityType type
  +boolean completed
  +LiteracyLevel level
  +string phrase
  +string createdAt
}

class ProgressEntry {
  +string date
  +LiteracyLevel level
  +number score
  +string activityId
  +string notes
}

class BimestreReport {
  +number year
  +number bimestre
  +LiteracyLevel initialLevel
  +LiteracyLevel finalLevel
  +number sessionsCompleted
  +number averageScore
  +number evolution
  +string notes
}

class Recommendation {
  +string id
  +string title
  +string description
  +Urgency urgency
  +string category
}

class IndividualGuidance {
  +string id
  +string title
  +string content
  +GuidanceCategory category
  +string createdAt
}

class StudentTrail {
  +string id
  +TrailArea area
  +string title
  +string description
  +TrailStatus status
  +LiteracyLevel recommendedForLevel
  +number currentStep
  +number totalSteps
}

class TrailTask {
  +string id
  +string title
  +string description
  +number estimatedMinutes
  +boolean completed
  +TrailActivityType activityType
}

User "1" --> "0..*" Student : acompanha
School "1" --> "0..*" Turma : possui
Turma "1" --> "0..*" Student : aloca
Student "1" *-- "1" SpecialNeeds
Student "1" *-- "0..*" ChildActivity
Student "1" *-- "0..*" ProgressEntry
Student "1" *-- "0..*" BimestreReport
Student "1" *-- "0..*" Recommendation
Student "1" *-- "0..*" IndividualGuidance
Student "1" *-- "0..*" StudentTrail
StudentTrail "1" *-- "1..*" TrailTask
```

## 1.1) Diagrama de Classes — PlantUML

```plantuml
@startuml
skinparam classAttributeIconSize 0

class User {
  +id: String
  +name: String
  +email: String
  +role: String
}

class Student {
  +id: String
  +anonId: String
  +name: String
  +birthDate: Date
  +literacyLevel: String
  +progress: int
  +assessmentCompleted: boolean
  +avatarColor: String
}

class School {
  +id: String
  +name: String
}

class Turma {
  +id: String
  +name: String
  +year: String
}

class SpecialNeeds {
  +autism: boolean
  +dyslexia: boolean
  +adhd: boolean
  +dyscalculia: boolean
  +visualImpairment: boolean
  +hearingImpairment: boolean
  +other: String
}

class ChildActivity {
  +id: String
  +title: String
  +type: String
  +completed: boolean
  +level: String
  +phrase: String
  +createdAt: DateTime
}

class ProgressEntry {
  +id: String
  +date: Date
  +level: String
  +score: int
  +notes: String
}

class BimestreReport {
  +id: String
  +year: int
  +bimestre: int
  +initialLevel: String
  +finalLevel: String
  +sessionsCompleted: int
  +averageScore: int
  +evolution: int
  +notes: String
}

class Recommendation {
  +id: String
  +title: String
  +description: String
  +urgency: String
  +category: String
}

class IndividualGuidance {
  +id: String
  +title: String
  +content: String
  +category: String
  +createdAt: DateTime
}

class StudentTrail {
  +id: String
  +area: String
  +title: String
  +description: String
  +status: String
  +recommendedForLevel: String
  +currentStep: int
  +totalSteps: int
}

class TrailTask {
  +id: String
  +title: String
  +description: String
  +estimatedMinutes: int
  +completed: boolean
  +activityType: String
}

User "1" --> "0..*" Student : acompanha
School "1" --> "0..*" Turma : possui
Turma "1" --> "0..*" Student : aloca

Student "1" *-- "1" SpecialNeeds
Student "1" *-- "0..*" ChildActivity
Student "1" *-- "0..*" ProgressEntry
Student "1" *-- "0..*" BimestreReport
Student "1" *-- "0..*" Recommendation
Student "1" *-- "0..*" IndividualGuidance
Student "1" *-- "0..*" StudentTrail
StudentTrail "1" *-- "1..*" TrailTask
@enduml
```

---

## 2) Diagrama de Sequência — Mermaid

```mermaid
sequenceDiagram
autonumber
actor U as Usuario
participant UI as App (AssessmentScreen)
participant CS as ChildStore
participant TR as TrailsRules
participant SVC as ChildService
participant API as API/Mock

U->>UI: Preenche avaliacao inicial
UI->>CS: updateChild(assessment, score, level)
CS->>TR: buildLearningTrails(level)
TR-->>CS: trilhas iniciais (sequenciais)
CS->>SVC: update(child + assessmentCompleted + trails)
SVC->>API: PUT /children/{id}
API-->>SVC: 200 OK
SVC-->>CS: child atualizado
CS-->>UI: estado atualizado
UI-->>U: Exibe trilhas liberadas

U->>UI: Conclui tarefa da trilha
UI->>CS: completeTrailTask(trailId, taskId)
CS->>TR: normalizeTrails()
TR-->>CS: proxima trilha desbloqueada
CS->>SVC: update(child.learningTrails)
SVC->>API: PUT /children/{id}
API-->>SVC: 200 OK
SVC-->>CS: sucesso
CS-->>UI: progresso atualizado
UI-->>U: Feedback de evolucao
```

## 2.1) Diagrama de Sequência — PlantUML

```plantuml
@startuml
actor Usuario
participant "AssessmentScreen/UI" as UI
participant "ChildStore" as Store
participant "TrailsRules" as Rules
participant "ChildService" as Service
participant "API/Mock" as API

Usuario -> UI : Preenche avaliação inicial
UI -> Store : updateChild(level,score,assessmentCompleted)
Store -> Rules : buildLearningTrails(level)
Rules --> Store : trilhas iniciais
Store -> Service : update(child)
Service -> API : PUT /children/{id}
API --> Service : 200 OK
Service --> Store : child atualizado
Store --> UI : estado atualizado
UI --> Usuario : trilhas liberadas

Usuario -> UI : Concluir tarefa
UI -> Store : completeTrailTask(trailId,taskId)
Store -> Rules : normalizeTrails()
Rules --> Store : próxima trilha desbloqueada
Store -> Service : update(learningTrails)
Service -> API : PUT /children/{id}
API --> Service : 200 OK
Service --> Store : sucesso
Store --> UI : progresso atualizado
UI --> Usuario : feedback de evolução
@enduml
```

---

## 3) Diagrama Entidade-Relacionamento (DER) — Mermaid

```mermaid
erDiagram
  USERS ||--o{ STUDENTS : acompanha
  SCHOOLS ||--o{ TURMAS : possui
  TURMAS ||--o{ STUDENTS : aloca
  STUDENTS ||--o{ ACTIVITIES : realiza
  STUDENTS ||--o{ PROGRESS_ENTRIES : possui
  STUDENTS ||--o{ BIMESTRE_REPORTS : consolida
  STUDENTS ||--o{ RECOMMENDATIONS : recebe
  STUDENTS ||--o{ INDIVIDUAL_GUIDANCES : recebe
  STUDENTS ||--o{ STUDENT_TRAILS : segue
  STUDENT_TRAILS ||--o{ TRAIL_TASKS : contem
  STUDENTS ||--|| SPECIAL_NEEDS : mapeia

  USERS {
    string id PK
    string name
    string email UK
    string role
    datetime created_at
  }

  SCHOOLS {
    string id PK
    string name
  }

  TURMAS {
    string id PK
    string school_id FK
    string name
    string year
  }

  STUDENTS {
    string id PK
    string user_id FK
    string school_id FK
    string turma_id FK
    string anon_id UK
    string name
    date birth_date
    string literacy_level
    int progress
    boolean assessment_completed
    string avatar_color
    text notes
    text observations
  }

  SPECIAL_NEEDS {
    string student_id PK,FK
    boolean autism
    boolean dyslexia
    boolean adhd
    boolean dyscalculia
    boolean visual_impairment
    boolean hearing_impairment
    string other
  }

  ACTIVITIES {
    string id PK
    string student_id FK
    string title
    string type
    string level
    boolean completed
    string phrase
    datetime created_at
  }

  PROGRESS_ENTRIES {
    string id PK
    string student_id FK
    string activity_id FK
    date date_ref
    string level
    int score
    text notes
  }

  BIMESTRE_REPORTS {
    string id PK
    string student_id FK
    int year
    int bimestre
    string initial_level
    string final_level
    int sessions_completed
    int average_score
    int evolution
    text notes
  }

  RECOMMENDATIONS {
    string id PK
    string student_id FK
    string title
    text description
    string urgency
    string category
    datetime created_at
  }

  INDIVIDUAL_GUIDANCES {
    string id PK
    string student_id FK
    string title
    text content
    string category
    datetime created_at
  }

  STUDENT_TRAILS {
    string id PK
    string student_id FK
    string area
    string title
    text description
    string status
    string recommended_level
    int current_step
    int total_steps
  }

  TRAIL_TASKS {
    string id PK
    string trail_id FK
    string title
    text description
    int estimated_minutes
    boolean completed
    string activity_type
  }
```

## 3.1) Diagrama Entidade-Relacionamento (DER) — PlantUML

```plantuml
@startuml
hide circle
skinparam linetype ortho

entity "USERS" as users {
  *id : varchar <<PK>>
  --
  name : varchar
  email : varchar <<UK>>
  role : varchar
  created_at : datetime
}

entity "SCHOOLS" as schools {
  *id : varchar <<PK>>
  --
  name : varchar
}

entity "TURMAS" as turmas {
  *id : varchar <<PK>>
  --
  school_id : varchar <<FK>>
  name : varchar
  year : varchar
}

entity "STUDENTS" as students {
  *id : varchar <<PK>>
  --
  user_id : varchar <<FK>>
  school_id : varchar <<FK>>
  turma_id : varchar <<FK>>
  anon_id : varchar <<UK>>
  name : varchar
  birth_date : date
  literacy_level : varchar
  progress : int
  assessment_completed : boolean
  avatar_color : varchar
  notes : text
  observations : text
}

entity "SPECIAL_NEEDS" as needs {
  *student_id : varchar <<PK,FK>>
  --
  autism : boolean
  dyslexia : boolean
  adhd : boolean
  dyscalculia : boolean
  visual_impairment : boolean
  hearing_impairment : boolean
  other : varchar
}

entity "ACTIVITIES" as activities {
  *id : varchar <<PK>>
  --
  student_id : varchar <<FK>>
  title : varchar
  type : varchar
  level : varchar
  completed : boolean
  phrase : varchar
  created_at : datetime
}

entity "PROGRESS_ENTRIES" as progress {
  *id : varchar <<PK>>
  --
  student_id : varchar <<FK>>
  activity_id : varchar <<FK>>
  date_ref : date
  level : varchar
  score : int
  notes : text
}

entity "BIMESTRE_REPORTS" as reports {
  *id : varchar <<PK>>
  --
  student_id : varchar <<FK>>
  year : int
  bimestre : int
  initial_level : varchar
  final_level : varchar
  sessions_completed : int
  average_score : int
  evolution : int
  notes : text
}

entity "RECOMMENDATIONS" as recs {
  *id : varchar <<PK>>
  --
  student_id : varchar <<FK>>
  title : varchar
  description : text
  urgency : varchar
  category : varchar
  created_at : datetime
}

entity "INDIVIDUAL_GUIDANCES" as guides {
  *id : varchar <<PK>>
  --
  student_id : varchar <<FK>>
  title : varchar
  content : text
  category : varchar
  created_at : datetime
}

entity "STUDENT_TRAILS" as trails {
  *id : varchar <<PK>>
  --
  student_id : varchar <<FK>>
  area : varchar
  title : varchar
  description : text
  status : varchar
  recommended_level : varchar
  current_step : int
  total_steps : int
}

entity "TRAIL_TASKS" as tasks {
  *id : varchar <<PK>>
  --
  trail_id : varchar <<FK>>
  title : varchar
  description : text
  estimated_minutes : int
  completed : boolean
  activity_type : varchar
}

users ||--o{ students
schools ||--o{ turmas
turmas ||--o{ students
students ||--|| needs
students ||--o{ activities
students ||--o{ progress
students ||--o{ reports
students ||--o{ recs
students ||--o{ guides
students ||--o{ trails
trails ||--o{ tasks
@enduml
```

---

## 4) Texto ABNT (para TCC)

### 3.2 Diagrama de Classes
O diagrama de classes do sistema Elevva apresenta a estrutura lógica da aplicação, evidenciando as principais classes de domínio e seus relacionamentos. A classe central é `Student`, responsável por consolidar dados cadastrais e pedagógicos do estudante, incluindo nível de alfabetização, progresso, histórico avaliativo e trilhas de aprendizagem.

A classe `User` representa os perfis de uso (responsável e professor), com relacionamento de acompanhamento para múltiplos estudantes. Classes complementares como `ChildActivity`, `ProgressEntry`, `BimestreReport`, `Recommendation` e `IndividualGuidance` suportam o monitoramento contínuo e a tomada de decisão pedagógica.

O módulo de trilhas é composto por `StudentTrail` e `TrailTask`, permitindo modelar progressão por etapas com desbloqueio sequencial após avaliação inicial.

**Figura X – Diagrama de Classes do Elevva**
**Fonte:** Elaborado pelos autores (2026).

### 3.3 Diagrama de Sequência
O diagrama de sequência representa o comportamento dinâmico do sistema nos fluxos críticos de avaliação e progressão por trilhas. Inicialmente, o usuário registra a avaliação do estudante na interface; em seguida, a camada de estado processa os dados e aciona as regras de trilhas para criação das etapas iniciais. Após persistência no serviço de dados, a interface é atualizada com as trilhas liberadas.

No fluxo de evolução, cada conclusão de tarefa aciona a normalização do estado das trilhas, podendo desbloquear automaticamente a próxima trilha. Esse encadeamento garante rastreabilidade temporal das ações e consistência entre interface, regras de negócio e persistência.

**Figura Y – Diagrama de Sequência do fluxo Avaliação → Trilhas**
**Fonte:** Elaborado pelos autores (2026).

### 3.4 Diagrama Entidade-Relacionamento
O DER do Elevva descreve a organização das entidades persistidas, com foco em integridade e histórico pedagógico. A entidade `STUDENTS` é o núcleo do modelo e se relaciona com atividades, progresso, relatórios bimestrais, recomendações, orientações e trilhas.

O relacionamento com `USERS` define quem acompanha cada estudante, enquanto `SCHOOLS` e `TURMAS` estruturam o vínculo institucional. As entidades `STUDENT_TRAILS` e `TRAIL_TASKS` modelam a lógica de aprendizagem por etapas. Já `SPECIAL_NEEDS` registra características educacionais específicas em relação 1:1 com o estudante, possibilitando personalização de intervenções.

**Figura Z – Diagrama Entidade-Relacionamento do Elevva**
**Fonte:** Elaborado pelos autores (2026).

### 3.5 Modelo Entidade-Relacionamento do Sistema
O modelo entidade-relacionamento foi concebido para sustentar três objetivos principais: cadastro estruturado, acompanhamento evolutivo e personalização pedagógica. O cadastro contempla dados de usuários, estudantes, escola/turma e necessidades específicas. O acompanhamento evolutivo é realizado por atividades, entradas de progresso e relatórios bimestrais. A personalização ocorre por recomendações, orientações individuais e trilhas de aprendizagem.

Como regra de negócio central, a avaliação inicial (`assessment_completed`) condiciona a liberação das trilhas. Assim, o modelo favorece consistência semântica, histórico auditável e escalabilidade para futuras extensões, como novos domínios de habilidade e novos indicadores de desempenho.

---

## Sugestão de nomenclatura de figuras (ABNT)
- Figura X – Diagrama de Classes do Elevva
- Figura Y – Diagrama de Sequência do fluxo Avaliação → Trilhas
- Figura Z – Diagrama Entidade-Relacionamento do Elevva

