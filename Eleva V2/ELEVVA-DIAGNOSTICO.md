# Elevva — diagnóstico e checkpoint

**Corte:19/11/2026.** O desenvolvimento continua. Prioridade imediata: revisão acadêmica com [mapa de atualização do TCC](18-atualizacao-tcc.md) e [prompt encaminhável](19-prompt-atualizacao-tcc.md). Não confundir especificação, código, teste e integração real.

## Base e preservação

Mantido o caminho2: reconstrução gradual da apresentação na raiz existente `alfabeta/`, aproveitando React Native0.79.6/Expo53/React19/TypeScript5.8. Backend FastAPI/Pydantic/SQLAlchemy/Alembic em `backend/`; identidade Better Auth1.7.12/Node22.13+ em `identity/`. Não houve reescrita integral ou outro app dentro da documentação.

Núcleo ativo persiste dados sintéticos em SQLite local; PostgreSQL/Neon é destino planejado. Sem nuvem provisionada, contratação ou deploy. `AGENTS.md` não foi localizado na busca no workspace. Git mantém alterações do incremento sobre a base `583a438`; `iniciar-eleva.ps1` já estava alterado e foi preservado. TCC original não foi sobrescrito. O prompt anexado de evolução termina truncado em “Se encontrar um imped”; não foi inventada a continuação.

## Situação funcional

“Implementada” significa **funcional no recorte local indicado**, sem homologação de produção. A existência de botão/interface não basta para concluir um fluxo.

| Área | Classificação | Evidência / limite |
|---|---|---|
| Cadastro/login/logout | Implementada localmente | Better Auth real local, sessão consultada no servidor, isolamento e descarte de estado por conta |
| Recuperação de senha | Parcial | Fluxo/adaptadores preparados; SMTP e percurso completo pendentes |
| Perfil adulto | Parcial | Nome/contexto persistidos; avatar/e-mail verificado pendentes |
| Estudantes e vínculos N:M | Implementada localmente | Busca/paginação, cadastro, convites, aceite e revogação; sem criança padrão silenciosa |
| Apoios e dados restritos | Implementada localmente | `StudentCare`, categorias distintas e permissão própria; adaptações não exigem diagnóstico |
| Avaliação e confirmação de nível | Parcial | Evidências e confirmação justificadas; cinco níveis na confirmação, rubrica e validade ainda D03 |
| Executor e observação adulta | Implementada localmente | Cinco mecânicas, escrita em revisão, retomada e observação separada; sem STT/manuscrito |
| Trilhas/aulas | Implementada localmente | Catálogo/mapa, revisões, etapas, respostas/cursor/rascunho e lotes sem duplicação |
| Construtor/biblioteca | Implementada localmente | Rascunho, editores específicos, prévia, ordem/cópia e versões; catálogo real aprovado pendente |
| Compartilhamento docente | Implementada localmente | Aceite/permissões/cópia/revogação; não compartilha dados dos alunos do autor |
| Escolas/turmas/equipe/gestor | Implementada no recorte técnico local | Permissões explícitas e testes; metadados institucionais não concedem acesso individual. Ensaio completo da UX de equipe pendente |
| IA de autoria | Parcial | Tela/API/adaptador/schema/proposta/rascunho; provedor substituído nos testes. Falta chave e chamada real |
| IA de análise/recomendação | Parcial; necessita revisão | Snapshot/cache/revisão preparados; falta live/rubrica. Schema legado tem quatro categorias e precisa harmonização com cinco níveis |
| Orientações | Parcial | Fluxo persistido; corpus e revisor pedagógico pendentes |
| Histórico/relatórios | Implementada localmente | Mesmos eventos, agregações/séries/filtros e revisão; interpretação pedagógica/PostgreSQL pendentes |
| PDF | Parcial com servidor testado | Binário real autorizado, sem dados restritos; adaptadores web/share; percurso final por plataforma e PDF/UA pendentes |
| UX/UI | Parcial; revisão contínua | Novo início docente, apoios compactos, filtros/menus e configurações; não houve aprovação final de todas as telas |
| Temas/fonte/teclado/leitura | Parcial | Provider/tokens e verificações web; aparelho/voz/TalkBack/WCAG integral pendentes |
| Libras | Parcial | Entrada contextual/frame isolado; carregamento observado, tradução concluída não comprovada; Android e vídeos revisados pendentes |
| YouTube | Parcial | Iframe/WebView compatível e alternativa textual; reprodução nativa/direitos/legendas/termos pendentes |
| Feedback futuro | Implementada localmente | Opcional/revogável; desejável, sem alegar pesquisa longitudinal realizada |
| APK/iOS/ambiente remoto | Não concluída | Bundles não são APK; Java/adb ausentes do PATH; sem PostgreSQL/Neon/VM homologados |
| Cobrança/fórum/push/STT | Não implementada, fora do caminho crítico | Evolução comercial/modalidades futuras, sem botões decorativos |

## O que foi retomado e acrescentado

O registro17 já entregou aulas por telas, cinco mecânicas, revisões/compartilhamento, lotes de aulas, cadastro compacto e progresso integrado aos relatórios. O incremento atual acrescentou:

1. Cinco níveis explícitos na autoria/filtros/confirmação; silábico histórico sem detalhamento preservado.
2. Autoria por IA: instrução própria versionada, schema estrito, conversão às cinco mecânicas, cache pessoal/histórico/limites/falhas. Criar rascunho é operação idempotente separada; nunca publica.
3. Início docente com autoria em destaque e formulário de IA com ação principal fixa; três editores focados para apresentação, comunicação/apoios e dados restritos.
4. PDF individual/coletivo no backend, adaptadores no app e séries visuais de registros; sem taxa fictícia de alfabetização.
5. Equipe/gestor por escola, docentes por turma e atribuição de trilha em lote com validação dos destinatários.
6. Reuso do transporte HTTP de identidade com cliente/cookies separados por requisição; continua verificando sessão, sem cache de autorização que preserve revogação.
7. Entrada contextual de Libras e isolamento de trecho público consentido; opção WebView experimental e mídia revisada ainda pendentes.

Código central: `features/lessons/GenerateScreen.tsx`, `features/workspace/{TeacherHome,SchoolTeam}.tsx`, `features/students/CareScreen.tsx`, `features/reports/{ExportPDF,TrendChart}.tsx`, `features/accessibility/GlobalLibras.tsx`; backend `features/lessons/generation.py`, `features/classrooms/{access,staff,recipients}.py`, `features/reports/export.py`, `features/levels.py`, `core/auth.py`, `ia/instrucoes-criacao.md`.

Migrations: `c81007ab1201` e `d09128ba3402`, após `80c95fbd1e56`; head `d09128ba3402`. Aplicação somente no SQLite local conhecido; SQL PostgreSQL gerado offline, não executado remotamente. Cadeia nova também foi verificada em SQLite descartável na etapa anterior desta retomada; não comprova concorrência em PostgreSQL.

## Validação e próximo aceite

Em19/11/2026: **67 testes backend e25 frontend/15 suítes**, TypeScript, lint e exportações web/Android aprovados. [Recibo com comandos e hashes](evidencias/evolucao-v5-verificacao.json). Advertência Starlette/httpx sem falha; alertas de dependências existentes requerem triagem, sem atualização forçada da stack.

`scripts.prove_authoring --check-config` confirmou chave ausente. Testes substituem o provedor; nem `origin=live` produzido dentro da suíte constitui chamada externa. Ensaios manuais anteriores mantêm sua data e não foram todos repetidos hoje. A captura provisória `evolucao-v5-libras-web.png` não comprova tradução.

Próximos passos para banca:

1. Configurar `GROQ_API_KEY` em `backend/.env` fora do chat, executar dois objetivos sintéticos contrastantes e revisar resultados. Harmonizar schema de análise aos cinco níveis. Manual continua funcionando.
2. Viabilizar D03: instrumento/rubrica, habilidades, respostas/variantes, suficiência e revisão pedagógica; D13/D15 antes de menores/dados reais.
3. Conferir download PDF e equipe pela interface atual; foco/sobreposição e tradução concluída do Libras, sem inferir êxito por widget carregado.
4. Obter vídeos Libras revisados/licenciados e testar player; Android experimental não conta como concluído.
5. Preparar JDK/SDK/adb/endpoints acessíveis, montar e instalar APK, validar TalkBack, voz, sessão/retomada e mídia. iOS separado.
6. Ensaiar seed/demonstração, contingência de rede/IA com origem explícita e fechamento visual.

Para abrir na raiz: `powershell -NoProfile -ExecutionPolicy Bypass -File .\iniciar-eleva.ps1`; web `http://localhost:8081`. Acessos sintéticos A/B/P/Q em `identity/ACESSOS-TESTE.local.md`, ignorado pelo git; não anexar senhas ao TCC. Configurações em Perfil. Continuar dos arquivos alterados, sem refazer a base. Prioridade acadêmica imediata nos documentos18/19.
