# Dados, API, multiusuário e ambiente

## Topologia recomendada para a banca

**Revisão0.2: FastAPI em VM Oracle Always Free elegível; PostgreSQL no Neon Free; identidade adulta no Clerk; IA por GroqCloud Free (`openai/gpt-oss-120b`).** Web no navegador e APK Android acessam a mesma API HTTPS. O usuário informou que o computador pertence à empresa e não deve ser adotado como servidor. A VM continua ausente/não provisionada; acesso gratuito e capacidade precisam ser confirmados. A prova de IA é inicialmente adulta com dados fictícios; público infantil real pendente D15.

API terá hostname HTTPS acessível ao Android/web; `localhost` não é endereço de backend remoto. Usar certificado confiável e testar CORS, sessão e conexão em rede móvel e Wi-Fi. Banco e provedor de IA só são acessados pelo backend, com segredos em ambiente seguro. VM executa regras/API, sem GPU ou modelo instalado. Não conectar a VM ao computador da empresa como servidor de inferência nem depender desse computador ligado. A hospedagem do bundle web e o certificado precisam de configuração gratuita compatível; não pressupor compra de domínio como pré-requisito.

## PostgreSQL em VM versus Neon

| Opção | Custo e limite real consultado em 22/10/2026 | Operação | Risco na banca / decisão |
|---|---|---|---|
| PostgreSQL autogerido em Oracle | Pode caber em Always Free se houver capacidade e elegibilidade; orçamento deve incluir disco/rede e excedentes. Não existe VM já disponível | Instalar/atualizar SO/PG, TLS/firewall, backup/restore, monitorar e operar | Mais trabalho para quem ainda não tem ambiente; **não priorizar** |
| PostgreSQL Neon Free | US$0, página consultada indica 100 CU-h/mês por projeto, 1 GB e suspensão após 5 min de inatividade | Serviço cuida da instância; equipe mantém schema, consultas, credenciais e cópias de segurança próprias | Acordar antes da sessão; medir latência e limite; **recomendado para dados** |
| API em Oracle + PostgreSQL Neon + API Groq | Cotas independentes; meta US$0 dentro dos planos Free e da elegibilidade | API/TLS sob gestão da equipe, banco e inferência gerenciados | **Topologia principal revisada**, condicionada a VM/contas/termos/ensaio; não fazer upgrade pago automático |
| API + banco + LLM no computador da empresa | Exigiria disponibilidade e uso operacional de recurso da empresa | Trabalho/recursos locais | Retirado da recomendação por orientação do usuário; sem fallback automático para esse computador |

As cotas Neon são um retrato da consulta, não garantia futura; não confundir o tamanho do banco com memória disponível para modelo. [Preços e limites oficiais](https://neon.com/pricing).

Oracle documenta capacidade gratuita limitada e possível retomada de instâncias ociosas. A página consultada de A1 menciona 1.500 OCPU-h/9.000 GB-h mensais (equivalente a 2 OCPUs/12 GB) e possibilidade de falta de capacidade; confirmar no console da conta, sem repetir a antiga cota de 4 OCPUs/24 GB. A VM hospeda API leve, não LLM. [Always Free](https://docs.oracle.com/en-us/iaas/Content/FreeTier/freetier_topic-Always_Free_Resources.htm). Créditos temporários AWS não foram escolhidos como gratuidade permanente; se Oracle não tiver capacidade, reavaliar hospedagem gratuita explicitamente antes da banca. Não há substituto cloud já validado nem contratação autorizada.

Clerk Hobby consultado anuncia US$0 até 50 mil usuários mensais retidos, com limites e sessão fixa de sete dias. Poucos adultos cabem numericamente, mas compatibilidade SDK53, entrega de e-mail e configuração de conta ainda precisam ser testadas. [Preços Clerk](https://clerk.com/pricing). Não enviar dados pedagógicos ao provedor de identidade.

## Modelo relacional proposto

O DER original (p.51) possui `students.user_id` e composição das tabelas de progresso, relatórios, recomendações e trilhas. Conservar o domínio e corrigir cardinalidades/versões. Não guardar todo Child em um JSON substituível.

| Entidades | Campos/índices relevantes e integridade |
|---|---|
| users | UUID interno, identity_sub único, nome, status, timestamps; perfis guardian/teacher; não guardar senha do Clerk |
| students | UUID, apelido/nome, birth_date, created_by, status, version; nível atual derivado de confirmação, nullable antes de avaliação |
| student_adult_links | student_id,user_id,papel,permissions,status,granted_by,revoked_at; único vínculo ativo por adulto/criança; N:M |
| link_invitations | student_id, destinatário adulto verificado, hash do token, validade, escopo, status; token de uso único; proposta: expira em 48h |
| schools/classrooms | UUID, nome, school_id, ano letivo; nomes não são chaves; contexto mínimo, sem cadastro de CNPJ obrigatório |
| classroom_teachers/student_enrollments | relações com período de validade; matrícula não concede acesso por si só; conjugar com link explícito |
| student_support_preferences | recursos desejados, instrução curta, leitura, Libras; sem exigir diagnóstico |
| student_sensitive_notes | informações opcionais de necessidades, autor e acesso restrito; separadas do resumo de turma |
| assessment_templates/assessments/assessment_items | instrumento e versão, respostas, evidências, autor/data/status, nível sugerido/confirmado, reviewer/reason; não sobrescrever avaliação anterior |
| activity_templates/assignments | conteúdo versionado, modalidade suportada, autor, destino estudante/turma; atribuir cria registro individual |
| attempts/item_responses | attempt_id, assignment_id, actor_id, status, respostas por item, version, tempos; tentativa parcial distinta de concluída |
| adult_observations | estudante, atividade opcional, data, desempenho textual, apoio usado, autor; sem score automático |
| trail_templates/student_trails/trail_tasks/task_completions | template versionado, estudante, tarefas, dependências; conclusão referencia attempt/observation, chave única estudante+tarefa |
| learning_events/level_confirmations | eventos append-only, autoria, data e origem; revisões referenciam evento anterior; enum de nível versionado |
| learning_snapshots | recorte derivado de eventos/tentativas, período, evidence_ids, regras/instrumento versionados e contagens por habilidade; regenerável, não substitui evidências; sem score pedagógico inventado |
| report_snapshots/report_periods | intervalo/ano/calendário, filtros, dados até data X, versão de regras; relatório congelado reproduzível quando publicado |
| ai_runs/ai_reviews | input_hash, evidence_ids/snapshot_id, provider/model_id/request_id, prompt/schema/instrumentVersion, origem/data, uso de tokens, status, saída validada, latência, revisão; versão do modelo se exposta pelo provedor, sem digest fictício |
| guidance/guidance_versions/favorites | geral/individual, autoria, estado draft/published, revisão e versão; favorito por usuário |
| user_preferences/consents/feedback/audit_events | escopos e versões, revogação, eventos sem copiar conteúdo sensível para logs |

UUID do servidor, FK e timestamps UTC; data civil de atividade mantida como DATE e fuso de origem. API aceita ISO8601; UI usa pt-BR/America/Sao_Paulo. Exclusão/arquivamento não apaga cascata de histórico educacional por conveniência. Para apagar dados pessoais reais, definir fluxo específico e política de retenção; banca usa só fictícios.

## Permissões efetivas

| Recurso | Responsável gestor | Outro responsável autorizado | Professor autorizado | Criança em sessão supervisionada |
|---|---|---|---|---|
| Perfil da criança | Ler/editar, convidar/revogar | Ler; editar conforme concessão | Ler contexto pedagógico; edição escolar conforme concessão | Só identificação mínima da atividade |
| Necessidades sensíveis | Ler/editar | Só com concessão específica | Só com concessão específica e finalidade | Não exibir |
| Avaliar/observar | Registrar observação; confirmar conforme D03 | Conforme concessão | Avaliar/confirmar se autorizado | Responder ao instrumento apropriado |
| Atividades/trilhas | Atribuir catálogo e acompanhar | Executar/observar conforme concessão | Criar/publicar/atribuir no próprio contexto | Responder tarefa atribuída |
| Relatórios | Apenas crianças vinculadas | Apenas crianças vinculadas | Apenas estudantes explicitamente autorizados da turma | Não exibir relatório adulto |
| IA e revisão | Solicitar/ler rascunho; confirmação conforme D03 | Conforme concessão | Solicitar/revisar no escopo | Sem chat/solicitação livre ao modelo |

PROPOSTA: perfil teacher não concede leitura global; papel escolar não promove responsável a professor. Usuário que é professor e responsável alterna contexto sem mudar os grants. Revogar vínculo invalida consultas e cache imediatamente; histórico conserva autoria. Não permitir revogar o último responsável gestor sem transferência; registro escolar provisório sem gestor familiar segue restrito ao docente criador, pendente D04.

## API v1 proposta

Resposta paginada `{items,nextCursor}`; erro `{code,message,fieldErrors?,requestId,retryable}`. 401 sessão, 403 permissão, 404 recurso indisponível/sem visibilidade, 409 versão/duplicação, 422 validação, 429 cota e 503 dependência. Não devolver stack trace. Todas as rotas de estudante verificam escopo, inclusive aninhadas, downloads e IA.

| Método / rota | Entrada essencial | Resultado / permissão |
|---|---|---|
| GET /health/live; GET /health/ready | Sem dado pessoal | Liveness; readiness de DB/identidade/IA com detalhes só operacionais |
| GET /v1/me; PATCH /v1/me | Nome e versão | Perfil local; e-mail/senha via Clerk verificados |
| GET/POST /v1/students | Filtro de turma / nome,data,preferências | Apenas vínculos; POST cria criança+vínculo na mesma transação |
| GET/PATCH /v1/students/{id} | Alterações cadastrais + If-Match | Servidor rejeita owner/nível/progress recebido nesse PATCH |
| POST /v1/students/{id}/invitations | Destinatário, papel, escopo | Convite de uso único; apenas gestor autorizado |
| POST /v1/invitations/accept | Token e sessão adulta | Confere destinatário; não aceita link só por conhecer studentId |
| GET/DELETE /v1/students/{id}/links/{linkId} | Identificador | Listar/revogar conforme gestão; auditoria |
| GET /v1/assessment-templates | Versão/estado publicado | Instrumento permitido, sem gabarito infantil indevido |
| POST /v1/students/{id}/assessments | templateVersion,respostas/evidências | Avaliação rascunho/completa; não inventa nível |
| POST /v1/assessments/{id}/confirmations | Nível, evidências, justificativa,version | Confirmação humana, cria trilha se regra aprovada |
| GET/POST /v1/activity-templates | Filtros/conteúdo publicado | Professor autor cria draft; responsável apenas catálogo |
| POST /v1/assignments | TemplateVersion,destinatários autorizados | Atribuições individuais; valida toda lista antes de gravar |
| POST /v1/assignments/{id}/attempts | operationId | Sessão contextual; sem fallback para primeira criança |
| PUT /v1/attempts/{id}/responses/{itemId} | resposta,version | Upsert versionado do item; nunca conclui só por abrir |
| POST /v1/attempts/{id}/finish | operationId,version | Resultado+eventos+conclusão da tarefa em transação |
| POST /v1/students/{id}/observations | Data,atividade,desempenho,apoio | Evidência adulta; sem conversão invisível a acerto |
| GET /v1/students/{id}/trails | Nenhuma mutação | Estados e contagens do servidor; GET não cria trilha |
| POST /v1/trail-tasks/{id}/confirm-observation | observationId,version | Somente tarefa prevista como observada; não permite concluir tudo |
| GET /v1/students/{id}/history; GET /progress | Filtros/período | Eventos reais, nível e conclusão separados |
| GET /v1/students/{id}/reports; POST /reports | Intervalo/reportPeriodId | Consulta/geração de snapshot; sem média se métrica inválida |
| GET /v1/classrooms/{id}/report | Período | Agregado apenas dos estudantes visíveis autorizados |
| GET/POST/PATCH /v1/guidance | Escopo,texto,version,status | Geral ou individual; autoria docente, publicação explícita |
| PUT/DELETE /v1/guidance/{id}/favorite | Sem body | Por usuário; só conteúdo visível |
| GET/POST/PATCH /v1/schools e /classrooms | Nome,ano,version | Contexto docente mínimo; sem administração global |
| POST /v1/students/{id}/ai-analyses; GET /ai-analyses/{id} | Objetivo e IDs de evidência autorizados | 202/job persistido; timeout/falha explícitos; contrato em IA |
| POST /v1/ai-analyses/{id}/reviews | Accept/edit/reject,justificativa,version | Publicação somente após revisão; não altera nível sozinha |
| GET/PATCH /v1/me/preferences | theme,contrast,textScale,reading,motion | Escopo adulto; suporte infantil em endpoint próprio de estudante |
| POST /v1/feedback; PUT/DELETE /v1/me/future-participation | Texto/adesão | Opcional; sem inscrever por aceite geral |

Cadastro/login/reset/logout são operações do adaptador Clerk, **não endpoints locais fictícios em paralelo**. O interceptor atual será adaptado à sessão; não continuar seu refresh artesanal. Sessão nativa usa armazenamento seguro; web usa mecanismo de sessão do provedor com proteção apropriada, sem copiar refresh token duradouro para AsyncStorage. Configurar CORS com origins explícitas, TLS e proteção CSRF quando cookies próprios forem usados.

## Integridade, concorrência e reabertura

POST mutável recebe `Idempotency-Key` UUID mantida no retry; chave única por ator+operação, hash de body. Mesmo body retorna resultado original; body diferente com mesma chave →409. Proposta de retenção de chave: sete dias no ambiente de demonstração. Edição usa version/If-Match, conflito→409 com opção de recarregar/comparar, sem sobrescrever novo registro do outro adulto.

Concluir tentativa bloqueia a linha/tarefa necessária, grava respostas, evento e task_completion e recalcula estado numa transação. Índice único evita repetição. Observação não marca atividade executada no app; tarefa externa pode ser concluída com observationId conforme template. Reavaliação não reinicia trilha nem apaga conclusão sem decisão explícita/versionada. API devolve snapshot canônico; store aplica esse snapshot. Falha no commit nunca mostra sucesso.

Rascunho: respostas confirmadas por item permitem retomar depois. Offline não é requisito original obrigatório: versão inicial mostra ausência de conexão, conserva formulário aberto e indica “não salvo”; reabertura recupera apenas o último rascunho confirmado no servidor. Não prometer sincronização offline universal. Se sair com pendência, oferecer aguardar/tentar novamente ou descartar com confirmação; limpar caches da conta evita vazamento.

## Privacidade e preparação reproduzível

LGPD art.14 exige considerar melhor interesse e condições específicas para dados de crianças; diagnóstico/necessidades podem envolver dados sensíveis. Isto orienta minimização e revisão, **não constitui parecer nem declaração de conformidade**. [Lei oficial](https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709.htm). Consentimento de pesquisa/participação futura é separado de termos de conta e de autorização de vínculo. Informação médica é opcional e não entra no prompt de IA.

Na implementação, preparar `.env.example` sem segredo, migrations fixadas, seed idempotente por UUID, `content_version`, scripts de readiness e dump fictício testado. Seed: responsável A com duas crianças, responsável B com criança distinta, segundo adulto vinculado a uma de A, professor P vinculado a parte da turma, professor Q sem acesso a essas crianças; uma criança sem avaliação, outra com histórico em dois períodos, uma com dados insuficientes. Conta real adulta de teste é diferente de criança fictícia; não usar credenciais compartilhadas embutidas no APK.

Não copiar estatísticas dos mocks como se fossem calculadas: gerar relatórios sobre os eventos do seed. Datas coerentes com calendário aprovado, origem “dados fictícios de demonstração”. Fazer backup antes da banca, ensaiar restauração em base descartável e não executar migrations/criar conteúdo durante a apresentação. Contingência local é configuração explícita separada, preparada antes; nunca importar dados reais para ela sem política apropriada.
# Adendo local de dados/API · 29/10/2026

Migração `82dd104c907a`: `learning_stages`, `assignments.stage_id` e `content.archived_at`. Endpoints novos: `GET /students/{id}/journey`; `POST /students/{id}/stages` (título, descrição, IDs distintos de 1–6 conteúdos); `GET /teaching/context` (escola/turma/busca/período); comandos versionados `POST /content/{id}/archive` e `/restore`. Finalização retorna feedback canônico da etapa/marcos. Relatórios retornam série diária e etapas concluídas no período, derivados dos eventos. Grants ativos continuam obrigatórios; escola/matrícula não ampliam acesso. Aplicação de migration somente no SQLite local conhecido, com backup; zero operação remota. Seed aditivo e configuração de serviços descritos em [15](15-revisao-ux-jornadas.md).
