# 9 PROPOSTA DE DESENVOLVIMENTO

Após a elicitação e especificação de requisitos, definição das regras de negócio e modelagem inicial do sistema, foi estruturada a presente proposta de desenvolvimento para o aplicativo **Elevva**, com foco em viabilidade técnica, custo zero no MVP, qualidade de software e possibilidade de evolução incremental.

A proposta considera a realidade do projeto acadêmico e o fato de que já existe uma versão funcional inicial em código, permitindo transformar o avanço técnico em artefatos formais de planejamento, arquitetura e qualidade para fins de TCC.

## 9.1 TECNOLOGIAS QUE SERÃO UTILIZADAS

As tecnologias foram selecionadas com base em:
- viabilidade técnica no contexto mobile;
- disponibilidade em planos gratuitos;
- curva de aprendizagem da equipe;
- documentação e comunidade;
- aderência ao domínio educacional e à LGPD.

Com base nesses critérios, as tecnologias escolhidas são apresentadas no **Quadro 25**.

**Quadro 25 – Tecnologias propostas para o desenvolvimento do software Elevva**

| Nome | Fornecedor | Descrição | Versão (referência) | Utilização | Custo no MVP |
|---|---|---|---|---|---|
| React Native | Meta | Framework para desenvolvimento mobile multiplataforma | 0.79.x | Camada de interface mobile | Gratuito |
| Expo | Expo | Framework e toolchain para desenvolvimento, build e execução do app React Native | SDK 53 | Execução local, bibliotecas nativas e fluxo de desenvolvimento | Gratuito |
| TypeScript | Microsoft | Tipagem estática para JavaScript | 5.8.x | Padronização e segurança de tipos no frontend | Gratuito |
| FastAPI | Comunidade Python | Framework backend para APIs REST de alta produtividade | Estável atual | API principal do sistema | Gratuito |
| Python | Python Software Foundation | Linguagem do backend | 3.11+ | Serviços de negócio e integração com IA | Gratuito |
| Uvicorn | Encode | Servidor ASGI para FastAPI | Estável atual | Execução da API em ambiente de desenvolvimento e produção | Gratuito |
| SQLAlchemy / SQLModel | Comunidade Python | Mapeamento objeto-relacional (ORM) | Estável atual | Persistência de dados relacionais | Gratuito |
| Alembic | SQLAlchemy | Ferramenta de versionamento de banco (migrations) | Estável atual | Controle evolutivo de esquema do banco | Gratuito |
| Neon (PostgreSQL) | Neon | Banco de dados relacional serverless | Plano Free | Persistência principal de dados pedagógicos | Gratuito (limites de uso) |
| Clerk | Clerk | Serviço de autenticação e gestão de sessão | Plano Free | Autenticação e identidade de usuários | Gratuito (limites de uso) |
| Axios | Axios | Cliente HTTP | 1.x | Consumo de API no app | Gratuito |
| Zustand | Comunidade | Gerenciamento de estado global | 5.x | Estado do app (auth, estudante, sessão) | Gratuito |
| Jest + React Native Testing Library | Meta/Callstack | Testes unitários e de componentes | Estável atual | Testes de frontend | Gratuito |
| Pytest | Comunidade Python | Testes automatizados para backend | Estável atual | Testes de API e regras de negócio | Gratuito |
| ESLint + Prettier | OpenJS Foundation | Qualidade e padronização de código | Estável atual | Qualidade estática e formatação | Gratuito |

**Fonte:** Elaborado pelos autores (2026).

### Decisão sobre banco não relacional

Para o núcleo de dados do Elevva, será adotado **banco relacional (PostgreSQL/Neon)** como tecnologia principal, devido ao forte relacionamento entre entidades pedagógicas (usuário, estudante, atividade, trilha, tarefa, avaliação, progresso e relatório).

Entretanto, o projeto prevê uma estratégia híbrida opcional para evolução:
- uso de base não relacional **somente** para dados de alta volumetria e baixa criticidade transacional (ex.: eventos de telemetria, logs de interação, cache de respostas de IA);
- não utilização de base não relacional como repositório primário do domínio pedagógico no MVP.

Essa decisão mantém consistência transacional no que é crítico para avaliação educacional e reduz complexidade inicial.

## 9.2 METODOLOGIA DE PADRÕES DE SOFTWARE

Para organizar a implementação e garantir uniformidade técnica, serão utilizados padrões arquiteturais e práticas de engenharia apresentados no **Quadro 26**.

**Quadro 26 – Metodologias e padrões utilizados para o desenvolvimento do software**

| Nome | Descrição | Utilização |
|---|---|---|
| REST | Padrão arquitetural para APIs baseadas em HTTP | API FastAPI |
| SOLID | Princípios para modularidade e manutenibilidade | Backend e frontend |
| DRY | Evitar duplicação de lógica | Serviços, hooks e utilitários |
| Clean Architecture (adaptação leve) | Separação por camadas (apresentação, aplicação, domínio, infraestrutura) | Estrutura do backend |
| DDD tático (adaptado) | Modelagem orientada ao domínio e linguagem ubíqua | Entidades pedagógicas |
| API-first (pragmático) | Contrato de API definido antes da integração plena | Integração app/API |

**Fonte:** Elaborado pelos autores (2026).

### Observações de aplicação dos padrões

1. O padrão REST será utilizado na API, com adaptações pragmáticas para o contexto móvel (paginação simplificada, payloads enxutos e respostas orientadas ao uso em app).
2. O DDD será aplicado de forma tática e incremental, priorizando o domínio educacional sem sobrecarga documental incompatível com o escopo do MVP.
3. A arquitetura limpa será usada como referência estrutural, sem compromisso com rigidez excessiva, mantendo foco em entrega acadêmica e funcional.

## 9.3 METODOLOGIA PARA TESTES DE SOFTWARE

A metodologia de testes será baseada em validação contínua dos fluxos críticos da aplicação e verificação automatizada das regras de negócio centrais.

### Estratégia proposta

- **Backend (FastAPI):**
  - testes unitários de serviços e regras de domínio com `pytest`;
  - testes de integração de endpoints principais (autenticação, estudantes, trilhas, avaliações);
  - validação de contratos de entrada/saída com schemas tipados.

- **Frontend (React Native/Expo):**
  - testes unitários e de componentes críticos com `Jest` e `React Native Testing Library`;
  - validação manual guiada por roteiro para fluxos completos do usuário.

- **Fluxos críticos para validação funcional manual:**
  1. cadastro/autenticação;
  2. cadastro de estudante;
  3. avaliação inicial;
  4. liberação e execução de trilhas;
  5. visualização de progresso e relatório.

- **Inspeção técnica contínua:**
  - revisão de código;
  - análise estática com lint;
  - conferência de consistência de tipos e contratos.

## 9.4 MÉTRICAS DE QUALIDADE

A qualidade do software será monitorada por fatores priorizados para o contexto do Elevva, conforme o **Quadro 27**.

**Quadro 27 – Priorização de métricas de qualidade**

| Fator de Qualidade | Motivação | Possíveis medidas |
|---|---|---|
| Manutenibilidade | Evolução frequente de regras pedagógicas e telas | número de módulos alterados por versão; complexidade ciclomática; cobertura de testes por módulo |
| Usabilidade | Público com perfis não técnicos (famílias e educadores) | tempo médio para concluir tarefa; taxa de erro em fluxo; taxa de abandono por tela |
| Segurança e Privacidade | Dados de crianças exigem proteção reforçada | percentual de endpoints protegidos; incidentes de acesso indevido; conformidade com políticas de anonimização |
| Desempenho | Uso mobile requer respostas rápidas e estabilidade | tempo de resposta médio da API; tempo de carregamento de tela; taxa de falhas por sessão |
| Confiabilidade pedagógica | Recomendações e níveis devem ser consistentes | divergência entre avaliação e trilha sugerida; taxa de correção manual de classificação |

**Fonte:** Elaborado pelos autores (2026).

## 9.5 MODELO DE DADOS E ESTRATÉGIA DE PERSISTÊNCIA

A persistência de dados seguirá abordagem híbrida orientada por criticidade.

### Camada relacional (obrigatória no MVP)

Banco principal: **PostgreSQL (Neon)**.

Entidades centrais:
- usuários;
- estudantes;
- atividades;
- registros de progresso;
- relatórios bimestrais;
- recomendações;
- trilhas e tarefas de trilha.

Justificativa:
- forte necessidade de integridade referencial;
- histórico temporal auditável;
- consultas agregadas para relatórios pedagógicos.

### Camada não relacional (opcional para evolução)

Uso opcional e complementar, não obrigatório no MVP:
- telemetria de uso;
- cache de respostas de IA;
- dados temporários de baixa criticidade.

Alternativas viáveis gratuitas:
- **Firebase (Firestore):** útil para eventos e sincronização leve;
- **MongoDB Atlas Free:** útil para documentos de log/telemetria.

Decisão de escopo:
- no MVP, manter apenas Neon + cache local simplificado;
- incluir NoSQL somente se surgirem requisitos concretos de escala/tempo real fora do domínio transacional.

## 9.6 PLANO DE IMPLEMENTAÇÃO (MACRO)

A implementação será organizada de forma incremental, em ciclos curtos.

**Quadro 28 – Etapas macro de desenvolvimento**

| Etapa | Objetivo | Entregáveis |
|---|---|---|
| Etapa 1 | Consolidação de arquitetura e contratos | modelo de dados inicial, endpoints-base, estrutura de projeto |
| Etapa 2 | Núcleo funcional de autenticação e estudantes | login/cadastro, CRUD de estudante, estado global integrado |
| Etapa 3 | Núcleo pedagógico | avaliação inicial, trilhas, progressão por tarefas |
| Etapa 4 | Qualidade e documentação acadêmica | testes, métricas, revisão técnica, documentação final do TCC |

**Fonte:** Elaborado pelos autores (2026).

## 9.7 RISCOS E MITIGAÇÕES

**Quadro 29 – Principais riscos técnicos e mitigação**

| Risco | Impacto | Mitigação |
|---|---|---|
| Limites de planos gratuitos | indisponibilidade temporária de serviços | arquitetura desacoplada e fallback com dados mockados |
| Complexidade de integração móvel + backend | atraso em entregas | contratos de API estáveis e testes de integração |
| Evolução de escopo além do MVP | perda de foco acadêmico | priorização por requisitos críticos e congelamento de escopo por ciclo |
| Dependência de serviços externos de IA | instabilidade/custos futuros | abstração por camada de serviço e cache de respostas |

**Fonte:** Elaborado pelos autores (2026).

## 9.8 INFRAESTRUTURA E IMPLANTAÇÃO (DELIMITAÇÃO DE ESCOPO)

Para o presente TCC, a implantação produtiva completa não será tratada como foco principal da proposta, priorizando-se a validação funcional e técnica do MVP.

Ainda assim, ficam mapeadas opções gratuitas para eventual demonstração:
- API FastAPI em Render/Railway (planos gratuitos com limitações);
- banco PostgreSQL no Neon (plano gratuito);
- aplicativo executado em Expo Go e build de testes locais.

Essa delimitação evita dispersão de esforço em atividades operacionais de DevOps e mantém aderência ao objetivo acadêmico do trabalho.

---

## Considerações finais da proposta

A presente proposta adota uma stack gratuita, tecnicamente viável e alinhada ao domínio do projeto, conciliando rapidez de desenvolvimento, qualidade de software e fundamentação acadêmica. A escolha por banco relacional como base do núcleo pedagógico, combinada com possibilidade de extensão não relacional, oferece equilíbrio entre consistência, escalabilidade e simplicidade para o MVP do Elevva.

**Fonte geral da seção:** Elaborado pelos autores (2026).
