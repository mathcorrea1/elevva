# Revisão de jornadas implementada · 29/10/2026

Esta revisão atende ao pedido posterior anexado de uma experiência completa mantendo a direção azul/branco/Poppins/Lumi. Substitui as decisões antigas sobre destinos principais dos documentos 06/13. Não muda prioridades acadêmicas nem aprova pedagogia, traduções, termos infantis ou infraestrutura.

## Resultado no código atual

| Jornada | Implementado e integrado localmente | Evidência principal |
|---|---|---|
| Navegação | Responsável: Início, Crianças, Trilhas, Relatórios, Perfil. Professor: Início, Escolas, Trilhas, Relatórios, Perfil. Cada destino mantém sua pilha; biblioteca/autoria e configurações são rotas secundárias. Lateral na web a partir de 1000 px; fonte grande retorna à navegação inferior adaptada. Executor oculta gestão e navegação adulta. | `alfabeta/src/app/ElevaRoot.tsx`, `TabNavigation.tsx`, `routes.ts` |
| Responsável | Painel com crianças explicitamente identificadas, avaliação inicial pendente ou continuar jornada, contagens persistidas, acompanhamento e relatório. Sem primeira criança selecionada silenciosamente. | `features/workspace/Dashboards.tsx` |
| Professor | Escola → turma → estudantes com vínculo ativo. Busca dentro da turma, resumo de avaliações iniciais pendentes, tarefas abertas, acompanhamentos marcados por adultos, conclusões por período e acesso coletivo/individual/autoria. | `GET /teaching/context`, `SchoolsScreen`, `ContextPicker` |
| Contexto e filtros | Escola/turma/período em sheet; seleção provisória só altera a consulta ao aplicar. Limpar altera o rascunho; cancelar descarta. Trocar escola limpa turma/criança. Contexto de interface salvo por conta/dispositivo; servidor revalida todos os IDs e grants. | `Workspace.tsx`, `shared/data/hooks.ts`, `features/classrooms/router.py` |
| Perfil | Iniciais, nome/contexto adulto, edição persistida, identificador para convites, ajuda, biblioteca, configurações e confirmação de saída com ação vermelha. Upload de foto não está suportado e não há seletor fictício. | `features/auth/ProfileScreen.tsx`, `ProfileCard.tsx` |
| Trilhas | Etapas persistidas, cada uma com 1–6 atividades; nós interativos, caminho adaptável, quatro estados, detalhes/instruções em sheet, contagem real e lista alternativa. Novas atribuições rejeitam conteúdo arquivado. Legados sem etapa são apresentados individualmente, sem inventar agrupamento. | `LearningStage`, `Assignment.stage_id`, `activities/journey.py`, `TrailScreen.tsx` |
| Execução | Pergunta por vez, resposta versionada, retomar tentativa, conclusão apenas com todos os itens salvos. Feedback transacional identifica etapa concluída e novos marcos. Apoios rápidos não alteram respostas. | `activities/router.py`, `activities/screens.tsx`, `QuickAccessibility.tsx` |
| Participação | Primeira atividade salva, primeira etapa completa e cinco atividades salvas são marcos de produto derivados dos mesmos registros. Não alteram nível confirmado, evidências ou acertos. Não há bônus por áudio, streak fictício ou concluir tudo por toque. | `journey()` e resposta canônica de `finish` |
| Relatórios | Individual e coletivo com período, contagens, etapas, série diária, legenda e números textuais. Mesmos eventos de avaliação/observação/conclusão, fuso de Brasília; denominador explícito. Atribuições totais e conclusões no período são conceitos distintos. | `learning.report`, `TimelineChart`, `PeriodFilter`, `CollectiveScreen` |
| IA | Acesso flutuante numa área reservada, sem cobrir conteúdo/abas; hub adulto com seleção explícita da criança e contexto docente. Reutiliza análise/revisão existentes; não é chat genérico. Saúde do núcleo independente do modelo; indisponibilidade mantém último resultado. | `AIFloat`, `AIHub`, `AnalysisScreen` |
| Conteúdo | Instruções em apresentação dedicada, leitura e limites de Libras explícitos. Arquivar/restaurar é operação do autor, versionada e idempotente; snapshots e respostas de conteúdo já utilizado são preservados. Restaurar conteúdo antes publicado exige revisão da nova versão. | `catalog/router.py`, `LibraryScreen`, `ContentDetails` |
| Interações | Sheets com gesto opcional no puxador, fechar, Escape, contenção/retorno de foco e fundo inerte na web. Skeletons estáticos; estados de envio/erro/sucesso; temas reativos, redução de movimento e fonte do sistema/adicional. | `Sheet.tsx`, `Skeleton.tsx`, `ResourceState.tsx` |

O layout móvel foi exercitado **na web em viewport móvel**, não em aparelho Android. Os componentes permanecem React Native/Expo. Não chamar estas capturas de screenshots de APK.

## Dados e migrations

Migração `82dd104c907a` adiciona `learning_stages`, FK opcional em atribuições e arquivamento em conteúdo. Aplicada somente ao SQLite de desenvolvimento conhecido, após backup consistente por `scripts.prepare_local`. `alembic check` sem diferenças. PostgreSQL remoto não foi alterado; concorrência e DDL devem ser repetidos no ambiente Neon autorizado.

Seed aditivo atualizado: quatro identidades Better Auth A/B/P/Q, cinco crianças, seis atividades sintéticas, três escolas, quatro turmas e etapas com estados diferentes. Agrupamento do seed é exemplo técnico sem aprovação pedagógica. Repetir o seed preserva nomes, respostas e conclusões alteradas durante a revisão; não reseta o aplicativo. IDs são determinísticos e não há estatísticas paralelas.

Durante a verificação pela interface, Lia passou de 2 para 3 atividades concluídas, com desbloqueio da tarefa seguinte; sua etapa seguinte continua bloqueada. Nome da conta A foi salvo como “Ana Revisão”. Um rascunho de P foi arquivado/restaurado, conservando sua autoria e avançando a versão. Essas alterações sintéticas foram preservadas ao repetir o seed.

## Verificações executadas

- Backend: 29 testes, incluindo autorização/revogação em jornada e contexto, criação atômica de etapa, conteúdo inexistente, idempotência, desbloqueio, ausência de gabarito no executor, arquivamento e consistência do relatório/série/período. Identidade substituída por tokens isolados apenas nos testes unitários.
- Frontend: 16 testes em 9 suítes; inclui contraste das quatro paletas/ação destrutiva, preservação de formulário, áudio por adaptador, autoria e aplicar/cancelar período. TypeScript e lint. Nenhum teste antigo removido.
- Aplicação atual em `localhost:8081`: contas Better Auth reais locais A/B/P; A tem Lia/Theo/Nina e B tem Caio/Bia sem os dados da A. Saída confirmada e cancelamento da saída. Edição do nome recuperada após recarregar.
- Atividade de Lia retomada, duas respostas confirmadas, conclusão confirmada; após recarregar, 3 de 6 tarefas e estado seguinte recuperados. Relatório individual/coletivo calculado sobre os mesmos registros.
- Sheets: fundo `inert`, foco contido no diálogo, Escape fecha e retorna ao nó de origem. Datas impossíveis e intervalo invertido bloqueiam aplicação. Fonte 150%, escuro e alto contraste em 320 px sem rolagem horizontal; fechar painel continua disponível. Viewports 390 px e 1440 px também exercitados.
- Arquivamento: cancelamento não remove rascunho; confirmação oculta dos ativos; filtro de arquivados e restauração funcionaram na interface.
- IA: solicitação real ao **backend local**, com indisponibilidade esperada por ausência de chave; resultado pré-gerado continuou disponível. **Não houve chamada real ao Groq nem avaliação de personalização/qualidade pedagógica** nesta revisão.
- Exportações web e Android/Hermes atuais executadas. Bundle Android não é APK instalado. `java`/`adb` e variáveis de SDK não disponíveis neste ambiente; TalkBack, hardware, voz real e iOS continuam sem validação.

Capturas: [galeria](evidencias/ux-jornadas-galeria.html). Alertas de desenvolvimento restantes são de propriedades legadas de React Native Web/animação, não foram ocultados como estratégia de teste. A resposta 503 da prova de indisponibilidade de IA é esperada.

## O que ainda depende de conclusão externa

1. **D03/D14:** profissional pedagógico e orientador validarem instrumentos, corpus, seleção/ordem das atividades, critérios de nível e interpretação dos relatórios. Etapas/marcos implementados não comprovam trilha pedagogicamente personalizada.
2. **D05:** arquivos em Libras produzidos/revisados, direitos e manifesto. Integração/player anteriores permanecem preparados; zero vídeos revisados disponíveis. Imagens geradas não são Libras.
3. **Serviços:** contas/configuração segura Groq (`GROQ_API_KEY`) e Neon (`DATABASE_URL`); VM/endereço HTTPS acessível pelo APK para API e Better Auth. Computador continua somente desenvolvimento temporário, sem deploy/provisionamento. SMTP para recuperação real de senha. Não enviar segredos pelo chat.
4. **D13/D15:** privacidade e autorização contratual para crianças/dados reais continuam abertas; conta adulta não resolve isso automaticamente.
5. **Plataformas:** JDK/Android SDK ou ambiente de build autorizado, APK instalado e testes com TalkBack/fonte/som/rede; revisão WCAG completa e leitor de tela na web; validação iOS separada. Foto de perfil/verificação de e-mail continuam não suportadas nesta implementação.

## Como abrir e continuar a revisão

Na raiz: `powershell -ExecutionPolicy Bypass -File .\iniciar-eleva.ps1`; abra http://localhost:8081. Contas de teste em `identity/ACESSOS-TESTE.local.md` (arquivo privado ignorado pelo git). A = responsável, P = professora; B/Q demonstram outros vínculos. Em P, selecione Escola Horizonte → Turma Descobertas para a jornada populada; Escola das Nuvens tem turma vazia. Em A, Trilhas → Lia mostra concluída/em andamento/bloqueada; Nina demonstra avaliação pendente. Perfil → Configurações reúne aparência e apoios.

Não houve commit, push, deploy, contratação, instalação de LLM ou alteração de banco remoto. As sete alterações originais e demais mudanças prévias foram preservadas. Especificação, código, integração local e aceites pendentes continuam sendo estados distintos.
