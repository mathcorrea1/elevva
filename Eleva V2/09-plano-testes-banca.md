# Plano incremental, testes e demonstração

## Premissas de prazo e prioridade

Usuário confirmou APK Android no próprio celular e web neste computador, banca **provavelmente em cerca de um mês**, sem data definida. Planejar quatro semanas relativas a22/10/2026; não fixar dia de apresentação. Sem VM, sem revisor pedagógico e sem profissional de Libras disponíveis. Essas dependências externas precisam começar na primeira semana.

Revisão0.2: o computador pertence à empresa e não é servidor. Planejar VM Oracle elegível para API, Neon e API Groq Free com modelo pronto, sem treinamento ou inferência local. Confirmar capacidade/conta/cotas e termos antes de depender da hospedagem. A prova técnica de IA é adulta com dados sintéticos; uso infantil real depende D15.

O esforço de toda a especificação é maior que uma troca visual: como estimativa inicial,20–35 dias efetivos de desenvolvimento/testes, mais revisão pedagógica e produção de vídeo, dependendo de experiência/disponibilidade. Não é compromisso de que uma pessoa em tempo parcial conclua tudo em quatro semanas. Há risco de prazo; preservar primeiro o percurso integrado obrigatório e registrar qualquer escopo restante com orientador, sem declarar cobertura integral.

## Incrementos com saída verificável

| Janela proposta | Trabalho | Condição de saída / evidência |
|---|---|---|
| Semana1: fundação e prova vertical | Confirmar VM gratuita e conta Groq Free; prova pequena de API/PT-BR/schema; corrigir Jest/sessão; tokens/componentes; API/PG/migrations; Clerk compatível; F01/F02 real | A/B e isolamento; reinício conserva; build Android/web; prova real de modelo/quotas ou bloqueio registrado cedo; sem deixar dependência de IA só para semana3 |
| Semana2: percurso pedagógico | F03/F04/F05 com instrumento/conteúdo versionados; executor limitado real e observação adulta; histórico e comandos transacionais | Avaliar→tarefa→tentativa/observação→salvar→reabrir; retry/concorrência sem duplicação; pendências pedagógicas explícitas se revisão ainda não chegar |
| Semana3: diferenciais e docente | F06 via API sobre snapshots de métricas/evidências; F07 autoria simples; F08 relatórios de eventos; F09 contexto mínimo; vídeos revisados quando entregues | Chamada real rastreável/revisada dentro da cota; relatório coerente; vínculos/coletivo sem vazamento; leitura/contraste/TalkBack funcionando |
| Semana4: estabilização e banca | Fechar F10, revisar cada tela/plataforma, falhas/timeout, segurança, seed/dump, APK final e web reproduzível; F11/favoritos se houver capacidade | Roteiro completo ensaiado, relatório de testes com falhas residuais; nenhum mock no caminho apresentado como integrado; arquivos de demonstração congelados |

Acessibilidade técnica é critério em todas as semanas; semana4 não é seu início. Produção/revisão Libras pode exceder prazo, mesmo com integração pronta. Falta de revisor impede chamar classificação/conteúdo de validados, não impede terminar contratos e testes técnicos com dados sintéticos.

## Priorização em caso de risco

Manter RF obrigatórios, contas/vínculos/isolamento/persistência, execução real de ao menos templates demonstráveis, IA real e adaptações técnicas. Não retirar relatórios/coletivo/autoria por existirem só em capítulos: entregar versão simples ou marcar incompleta para negociar com orientador. Desejáveis originais RF008/RF010/RNF004/RNF007 continuam identificados; perfil simples e manutenção mínima são úteis ao núcleo. Cobrança/fórum/push, exportação PDF, foto, editor livre de avaliações e STT automático não entram no caminho crítico proposto (D08/D09/D11). iOS é planejamento preservado e teste pendente, não suporte comprovado pelo APK.

## Roteiro de testes futuros

| ID | Tipo / execução | Evidência esperada / relação |
|---|---|---|
| B01 | TypeScript, lint, Jest/RNTL corrigidos; build web atual e APK | Sem falha de import/configuração; boot com erro recuperável, sem splash infinito |
| U01 | Regras de estado de trilha, bloqueio e reavaliação | Concluir tarefa bloqueada falha; retry mantém única conclusão; não apagar histórico; F05 |
| U02 | Instrumento/métrica versionados | Exemplos aprovados pelo revisor, insuficiência e adaptação; nenhum limiar inventado; F03/F08 |
| C01 | Contrato repositórios Mock/API | Mesmos DTOs/erros; tela sem import de fixtures; API não cai em mock ao falhar |
| S01 | API negativa parametrizada em cada endpoint de criança | Responsável B/professor Q não acessam perfil, avaliação, attempt, relatório, guia/mídia, IA ou lista pelo ID |
| S02 | Convite/revogação/transferência | Destinatário correto e token único; expirado/recusado negados; revogação corta sessão/caches |
| S03 | Sessão/reset/logoff/perfil | Login/reset reais, expiração/renovação corretas, logout e troca de conta sem ChildStore anterior; F01 |
| S04 | Segredos/dados privados | Bundle sem chave IA/DB; logs sem payload infantil; CORS/TLS e sessão web corretos |
| P01 | Persistência e recuperação | Criar/avaliar/executar; fechar app e reiniciar API; recuperar mesmos dados; sem dependência do módulo JS |
| P02 | Integridade/concorrência | Duplo POST, rede interrompida após commit, duas sessões; mesma idempotencyKey retorna resultado único; If-Match inválido→409 |
| P03 | Relatório/calendário | Mesmos eventos do seed produzem contagens e recortes esperados; sem fixture paralela; nulos≠zero |
| IA01 | Chamada real personalizada por API | runId/modelId/requestId/promptHash/origem=live, schema e IDs válidos; métricas/evidências contrastantes e revisão F06; sem alegar snapshot/digest não exposto pelo provedor |
| IA02 | Falhas/injeção/qualidade |12 casos sintéticos,20 chamadas técnicas; timeout/cota/schema/insuficiente sem mutação do nível; revisão pedagógica por caso |
| AX01 | Tokens e estados | Medir contraste em temas/contraste incluindo hover/pressed/error/disabled; nenhuma cor fixa essencial |
| AX02 | Web teclado/NVDA | Fluxo completo sem mouse; diálogo com trap/retorno; landmarks/nomes/estado e foco não oculto |
| AX03 | Reflow/texto | Web320CSSpx,200/400%zoom; Android maior fonte e tamanho de exibição; sem cortes de label/ação/diálogo |
| AX04 | Android TalkBack e movimento | Completar tarefa/observar/relatório; ordem e anúncios compreensíveis; sem dependência de movimento/som |
| AX05 | TTS e Libras | Ouvir/Parar/Repetir PT-BR;8 vídeos essenciais revisados/versionados, ao menos atividade completa coberta; widget web público sem dados privados |
| AX06 | iOS separado | VoiceOver/fonte/mídia/contraste e permissões; **pendente aparelho/build**, não deduzido de Android |
| UX01 | Observação com adultos e, se autorizado posteriormente, crianças | Tarefas/erros/tempo e entendimento de próximo passo; não substituir revisão pedagógica por opinião de interface |
| OP01 | Ensaio do ambiente | Readiness, dependências/ramp-up, APK instalado, rede do celular, backup/restore fictício e reset do seed em ambiente descartável |

Não criar testes que apenas espelhem cor fixa de implementação. Priorizar invariantes e percursos que evitam perda/vazamento e demonstram funcionalidade. Para validação com crianças reais, planejar autorização/privacidade e metodologia acadêmica antes; banca pode demonstrar só cenários fictícios.

## Preparação anterior à banca

Até uma semana antes: fixar build/APK/backend/schema/modelId/prompt e versões de conteúdo, vídeos e seed. Confirmar VM/API/TLS, acesso Free do modelo, cotas e configuração ZDR, sem depender de servidor no PC da empresa. E-mails adultos de teste, recovery e vínculos conferidos. Android acessa API HTTPS; navegador com áudio PT-BR, leitor de tela e aumento de fonte ensaiados. Não depender de Expo Go atual para SDK53.

Até o dia anterior: aplicar migrations/seed no ambiente, validar relatórios dos eventos, salvar dump fictício e testar restauração separada. Baixar/embutir vídeos essenciais. Acordar banco/API se necessário, medir chamada de prova e reservar cota para a banca; chamada de ensaio não substitui análise ao vivo. Preparar análise anterior/registro de ensaio identificado como contingência, sem fallback de servidor no computador da empresa ou migração de plano pago.

Antes de iniciar: confirmar rede/energia, readiness API/DB/identidade/IA, sessões adultas distintas, seed consistente, microfone só se modalidade demonstrada exigir, sem dados reais na projeção. Toda origem fictícia/pré-gerada identificada. Não executar instalação de serviço, download de modelo, migration ou autoria improvisada durante a banca.

## Roteiro de demonstração — aproximadamente12–18 minutos

| Passo | Ação | O que prova / condição |
|---|---|---|
| 1 | Mostrar web e APK instalados, identificar ambiente/dados fictícios | Portabilidade efetivamente demonstrada W+Android; iOS explicitamente não testado |
| 2 | Entrar responsável A na web e B no Android | Identidades distintas e listas diferentes; não o mock que sempre retorna Maria |
| 3 | A cadastra criança ou usa uma preparada; envia convite ao segundo adulto/P | Cadastro+vínculo com ACK. Cadastro ao vivo é curto; conteúdo/infra já preparados |
| 4 | Aceitar convite na conta destinatária; demonstrar que professor Q/B sem convite não vê estudante | UC011 e autorização do servidor; não exibir detalhes técnicos no fluxo de produto |
| 5 | Aplicar avaliação curta aprovada e salvar evidências | Instrumento/apoio e autor; se revisão pedagógica faltar, dizer claramente “instrumento exploratório”, sem declarar validade |
| 6 | Solicitar análise real no backend remoto, mostrar run/data/origem e revisar | Groq `openai/gpt-oss-120b` chamado sobre métricas/evidências, recomendação personalizada e confirmação humana; sem treinamento; aguardar tempo ensaiado |
| 7 | Abrir próxima tarefa no APK; executar seleção/leitura/escrita suportada e salvar | UC005 real; resposta/resultado conservado, sem conclusão por simples toque |
| 8 | Adulto registra observação distinta de tarefa externa | UC004 com data/desempenho/apoio e autoria separados |
| 9 | Fechar/reabrir app e atualizar web; mostrar tarefa concluída/etapa seguinte | Persistência e desbloqueio coerentes; retry não duplicou |
| 10 | Abrir histórico, relatório individual/bimestral e coletivo da turma do professor | Eventos reais, janela/denominador e permissões; sem score inventado |
| 11 | Alternar claro/escuro/sistema e alto contraste; aumentar fonte do Android/zoom web | Aplicação reativa, reflow e preferência conservada |
| 12 | Ouvir/parar/repetir instrução; demonstrar TalkBack/teclado web | Apoio de leitura, sem depender de som; próxima ação acessível |
| 13 | Reproduzir instrução/atividade revisada em Libras no APK e widget em conteúdo público web | Cobertura real por plataforma; sem afirmar tradução nativa universal |
| 14 | Mostrar falha IA controlada, conteúdo geral/último resultado datado e logout | Falha não perde progresso; sem mock disfarçado; conta encerra e limpa acesso |

Se a IA real falhar na banca, mostrar estado de indisponibilidade e análise anterior identificada, referenciar evidência do ensaio, mas **não dizer que houve chamada real naquela sessão**. Vídeos só contam como Libras revisada se profissional/versão estiverem documentados. Gravação de ensaio pode apoiar contingência com origem clara, sem substituir status de implementação/teste.

## Critério final de liberação

Cada FRD tem Ax executado com evidência; nenhuma perda/vazamento crítico; A/B/P/Q isolados; reinício conserva progresso; chamada IA real e revisão comprovadas; APK/web testados; acessibilidade avaliada nos cenários descritos, com limitações registradas. Relatório final separa: especificado, implementado, simulado, testado e pendente. A existência deste pacote não atende esse critério por si só.
# Roteiro atualizado de revisão · 29/10/2026

Usar [15-revisao-ux-jornadas.md](15-revisao-ux-jornadas.md) para o percurso realmente implementado: A responsável → Crianças/Trilhas/Relatórios; P professora → Escola Horizonte → Turma Descobertas → estudante/coletivo/autoria; Perfil → Configurações; IA pelo acesso flutuante. Escola das Nuvens demonstra turma vazia. Conta B isola crianças da A. Arquivar/restaurar rascunho e cancelar filtros/saída complementam os testes. Não demonstrar exemplo pré-gerado como IA live, exportação Hermes como APK nem player sem mídia como Libras concluída. Os demais incrementos e prioridades abaixo permanecem referência.
