# Rastreabilidade — estado da implementação

**Corte vigente — 19/11/2026:** matriz completa dos10RF/8RNF/14UC e complementos em [18, seção5](18-atualizacao-tcc.md#5-rastreabilidade-acadêmica-preservada). Supera os status históricos onde divergir: cinco mecânicas/revisões já existem; PDF é gerado/testado no backend; equipe/gestão e atribuição de trilha em lote foram implementadas; IA de autoria tem percurso técnico e testes com provedor substituído. **RF005/RF006 seguem parciais**, sem chave/live/rubrica. Libras contextual permanece sem tradução concluída/nativo validado. Verificações:67 testes backend,25 frontend/15 suítes, type-check/lint e exportações web/Android aprovados; não são APK, prova pedagógica ou conformidade. [Diagnóstico](ELEVVA-DIAGNOSTICO.md) · [recibo](evidencias/evolucao-v5-verificacao.json).

**Adendo vigente — aulas por telas:** [registro 17](17-construtor-aulas-e-compartilhamento.md). RF004 ganhou cinco mecânicas, rascunho/posição e revisão escrita; RF009 ganhou construtor, versões referenciadas e compartilhamento. A matriz adicional abaixo distingue novos pedidos de produto dos RF originais. Prioridades acadêmicas não mudaram. Descrições de etapas anteriores permanecem históricas e não significam que só há escolha única.

| Pedido atual / relação acadêmica | Estado e evidência | Aceite demonstrado / limite |
|---|---|---|
| AULAS-01 · sequência flexível / RF004 O, F04/F05 | Implementado local: contratos, revisões e executor `features/lessons`; referências nas trilhas | Conteúdo → cinco mecânicas → conclusão; cursor/rascunho recuperados após sair/recarregar; conteúdo pedagógico ainda D03 |
| AULAS-02 · editor visual / RF009 O, F07 | Implementado local: rascunho parcial validado, telas, editor por mecânica, duplicação/ordem/prévia/disponibilização | Cópia editada e nova revisão salva pela interface; publicar de verdade exige revisor; demo não é aprovação |
| AULAS-03 · compartilhar/reutilizar / F07/F09 | Implementado local: `ContentShare`, aceite/cópia/permissões e lotes; `content_revision_id` nas atribuições | P → Q aceito; Q atribuiu a Caio/Bia na própria turma; conteúdo não concede acesso a estudantes de P |
| AULAS-04 · progresso e revisão / RF004 O, RF007 O, F04/F08 | Implementado/testado: respostas, interações, apoios por item, revisão humana e relatórios na mesma base | Variante escrita fica pendente; revisão registrada atualiza resultado; sem zero inventado, nível automático ou média entre versões |
| UX-EST-01 · cadastro/lista / F02/F09, RNF001 O | Implementado local: lista compacta/virtualizada, busca/paginação, ação de adicionar no cabeçalho e menu contextual | Cadastro sintético com apoios persistiu; turma opcional e grant/matrícula validados na mesma transação |
| PRIV-EST-01 · categorias restritas / RNF002 O, RNF003 O | Implementado/testado: categorias separadas em `StudentCare`; concessão explícita, fora de listagens e IA | Vínculo sem concessão não lê sensíveis; revogação remove acesso; liberação de dados reais ainda D13/D15 |
| UX-AC-01 · temas/teclado/fonte / RNF008 O | Web conferida em 320 px, fonte adicional de 150%, escuro/alto contraste, foco e retomada | Sem overflow horizontal no percurso verificado. Não é auditoria WCAG integral ou teste nativo |
| MIDIA-01 · vídeo / F04/F10 | Estrutura implementada: iframe/WebView 13.13.5, carregamento explícito e alternativa textual | Reprodução/legendas reais por plataforma e direitos/termos ainda pendentes; release mantém embed desabilitado até configuração revisada |

Verificações atuais: **47 testes backend, 22 frontend**, TypeScript e lint. Cadeia completa de migrations passou em SQLite novo; compilação/SQL offline PostgreSQL sem execução remota. Better Auth local real e isolamento testados; Groq continua sem chamada live. Exportações e imagens da revisão ficam no registro 17. Cobertura de código e especificação não equivalem a aceite pedagógico, nativo ou integral dos RF.

**Atualização de 29/10/2026:** [revisão de jornadas 15](15-revisao-ux-jornadas.md) acrescenta navegação por perfil, escolas/turmas, etapas persistidas, marcos operacionais, gráficos individuais/coletivos, instruções em sheet, arquivamento/restauração e acesso contextual à IA. RF004/RF007/RF009 e RNF001/RNF005/RNF008 ganharam implementação e provas locais; RF005/RF006, Libras revisada, ambiente remoto e APK continuam parciais. IDs e prioridades abaixo são preservados. Nova evidência: `evidencias/ux-jornadas-verificacao.json` e galeria. “Local real” não significa Neon/Groq/VM homologados.

22/10/2026. Complementa [03](03-rastreabilidade.md), preservando suas páginas e prioridades originais. **Local** significa código integrado à API/identidade/banco de desenvolvimento, não demonstração em PostgreSQL/VM/Android. **Parcial** não satisfaz sozinho o aceite integral. Fontes e critérios Fxx/Ax continuam nos documentos originais; evidências de execução no [checkpoint11](11-implementacao-e-checkpoint.md).

## Requisitos funcionais

| ID | Prioridade original | Estado atual / evidência / próximo aceite |
|---|---|---|
| RF001 | O | Local real: Better Auth cadastra contas diferentes, smoke A/B/P/Q e interface. E-mail/verificação em produção dependem de SMTP; repetir no ambiente remoto |
| RF002 | O | Local real: identidade é consultada no servidor; sessões/grants distintos; logout impede reutilizar a sessão. APK ainda não comprova o mesmo percurso |
| RF003 | O | Local real: criar/editar criança, grant gestor, convites N:M com destinatário, revogação. Reabertura e isolamento exercitados. PostgreSQL e política de dados reais pendentes |
| RF004 | O | Local real no executor de escolhas e em observações adultas separadas; tentativas/versionamento/conclusão persistem. Sem reconhecimento de áudio ou manuscrito; outros executores e mídia privada ainda pendentes |
| RF005 | O | **Parcial:** evidência e confirmação humana persistidas; instrumentos/rubricas versionados têm revisão técnica preparada. Não houve classificação real validada por IA ou rubrica pedagógica aprovada |
| RF006 | O | **Parcial:** adaptador Groq, schema/IDs/cache/revisão e testes negativos; personalização técnica contrastante usa transporte substituído apenas na suíte. F06/A1/A2 live e avaliação pedagógica continuam abertos |
| RF007 | O | Local real para contagens e relatórios individual/intervalo/coletivo, derivados dos eventos; período usa conclusão/fuso brasileiro. Aceite completo inclui PostgreSQL, apresentação e revisão da interpretação pedagógica |
| RF008 | D | Local parcial: nome/contexto editáveis e persistidos. Alteração verificada de e-mail e avatar ainda não migrados. Prioridade Desejável mantida |
| RF009 | O | Local parcial: biblioteca com busca/tipos; autoria de até20 itens; edição de rascunho com snapshots/parecer por versão; publicação e orientação individual gravada por vínculo. Nova versão exige novo parecer. Catálogo pedagógico real aprovado ainda depende de D03; favoritos e edição de conteúdo publicado pendentes |
| RF010 | D | Local: feedback, status do autor e interesse futuro separado/revogável. Isolamento/retry testados. Política e gestão externa de pesquisa não concluídas; sem envio de mensagens. Continua Desejável |

## Requisitos não funcionais

| ID | Prioridade original | Estado / limite |
|---|---|---|
| RNF001 | O | Parcial: hierarquia por fluxo, menos destinos para responsável, executor separado, estados textuais; ainda precisa de teste observado de usabilidade |
| RNF002 | O | Parcial: identidade real local, autorização server-side, isolamento/revogação/rollback/retry testados. Não é pentest; assinatura/permissões Android e segurança do ambiente remoto ainda precisam de validação |
| RNF003 | O | Parcial: snapshot IA minimizado, sem nomes/contatos/diagnósticos/notas livres; consentimento futuro separado e fontes versionadas. Política/termos infantis D13/D15 pendentes |
| RNF004 | D | Timeout/limites e estados implementados; p95 e latência da IA na conta real não medidos. Não declarar meta de desempenho atingida |
| RNF005 | O | Local: reabertura, integridade, versão, idempotência e rollback exercitados. Falha de commit não responde sucesso. Repetir em PostgreSQL, inclusive concorrência |
| RNF006 | O | Web atual executada/exportada; exportação Android/Hermes passou. APK falhou antes da montagem por Java ausente; SDK/adb não disponíveis. iOS não testado |
| RNF007 | D | Testes antigos recuperados sem exclusão, contratos e features separados; type/lint/testes passaram. Dependências antigas ainda têm alertas a triar; sem atualização geral da stack |
| RNF008 | O | Parcial: semântica, teclado/foco, temas, fonte, contraste e adaptadores. Avaliação WCAG2.2AA completa, NVDA/TalkBack, áudio real e Libras revisada pendentes |

## Casos de uso

Prioridade própria dos14 UC continua **NI**, sem promoção automática a Obrigatório.

| UC | Estado atual | FRD / ligação de evidência |
|---|---|---|
| UC001 | Cadastro local real | F01 / Better Auth e smoke; SMTP não simulado como envio |
| UC002 | Login local real | F01 / identidade por sessão no backend, adultos distintos |
| UC003 | Cadastro local real de criança | F02 / transação criança+grant, reabertura e validações |
| UC004 | Observação adulta local real | F04 / autoria, contexto, texto e data de registro próprios; não conclui execução |
| UC005 | Execução local real de escolhas | F04/F05 / duas etapas, respostas e conclusão, sem gabarito no payload do executor |
| UC006 | Parcial | F03/F06 / sugestão live/rubrica real pendentes; confirmação humana é evento separado |
| UC007 | Parcial | F06 / precisa de Groq real e validação de resultados contrastantes |
| UC008 | Histórico local real | F08 / fontes persistidas e tipos separados, sem timeline fixture |
| UC009 | Parcial | F07 / estrutura de orientação geral/individual real, corpus aprovado pendente |
| UC010 | Perfil local parcial | F01 / nome/contexto persistidos; avatar/e-mail pendentes |
| UC011 | Vínculos locais reais | F02 / destinatário, aceite único, grants, revogação e bloqueio de IDs |
| UC012 | Relatórios locais reais no escopo de contagens | F08 / individual, período e coletivo das mesmas evidências; PostgreSQL e revisão pendentes |
| UC013 | Preparado, não concluído | F01 / solicitação/reset/deep link implementados; SMTP e recuperação de ponta a ponta ainda não testados |
| UC014 | Logout local real | F01 / invalidação Better Auth e descarte do estado de conta; validar Android |

## Capacidades adicionais e decisões de escopo

Escola/turma/matrícula estão integradas localmente; matrícula não concede acesso. Instrumento de avaliação pode ser criado e revisado sem fórmula inventada pelo código. Autoria permite até20 itens, 2–6 alternativas e proposta explícita de leitura por item, começando desabilitada. Edição de rascunho preserva corpo e parecer anteriores; conteúdo publicado não é editado neste comando. Pontos de atenção são exclusivamente manuais, justificados e encerráveis, em contexto adulto. Adaptações não exigem diagnóstico e são gratuitas no aplicativo.

O executor infantil oferece uma tarefa principal e oculta destinos adultos. Apoio oral permanece por observação do adulto; STT automático não foi implementado nem declarado obrigatório. Captura/guarda de áudio privado, exportação PDF, calendário automático, avatar/e-mail, favoritos e edição de conteúdo publicado continuam no backlog de implementação, com seu escopo original conservado.

Planos/cobrança, fórum, push e suporte comercial continuam fora do caminho crítico por autorização atual do usuário; isso não altera a prioridade acadêmica dos RF/RNF. Vídeos Libras e chamada real Groq não contam como concluídos por existir player/adaptador. Aprovação pedagógica, termos de público infantil e conformidade assistiva não são inferidos de testes de código.
