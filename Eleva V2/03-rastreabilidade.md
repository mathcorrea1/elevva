# Matriz de rastreabilidade

**Estado da implementação:** os quadros abaixo preservam a auditoria anterior às mudanças. O [adendo de implementação](12-rastreabilidade-implementacao.md) atualiza os mesmos IDs/prioridades. Código novo, teste local e integração com serviço real são estados distintos; nenhum deles presume aprovação pedagógica.

Fonte primária: [texto do TCC](../alfabeta/Eleva-para-Codex/Eleva-TCC.md). Páginas **físicas**. O = Obrigatório; D = Desejável; NI = prioridade não informada no original. Não foram criadas prioridades originais para UC ou imagens. Fxx/Ax identifica critério na FRD; Txx identifica tela no catálogo UX. Evidências E01–E19 estão detalhadas na [auditoria](02-auditoria.md).

Status descreve a capacidade de ponta a ponta hoje: **existente** = código efetivo para a parte indicada, não pressupõe backend; **parcial** = parte do percurso; **simulado** = resultado fictício/memória; **ausente** = não localizado; **divergente** = comportamento conflita com fonte/decisão. Nenhum RF está comprovado como concluído com persistência e autorização reais.

## RF — Quadro 6, §6.2.1

| ID e exigência original | Fonte/prioridade | Situação atual e evidência | FRD / telas | Critério de aceite futuro |
|---|---|---|---|---|
| RF001 Realizar cadastro | p.37 / O | Simulado: E01, formulário existe; register não grava | F01 / T02 | F01/A1: criar conta distinta e voltar a autenticar |
| RF002 Realizar login por e-mail/senha | p.37 / O | Simulado: E01/E18, todos recebem Maria | F01 / T01 | F01/A2: credencial inválida falha, contas A/B isoladas |
| RF003 Cadastrar criança | p.37 / O | Parcial/simulado: E02, AddChildScreen; sem vínculo real | F02 / T06 | F02/A1: reiniciar e recuperar criança e vínculo do criador |
| RF004 Registrar atividades | p.37 / O | Parcial/simulado: E04/E07/E09/E12; falta observação estruturada | F04 / T12,T14 | F04/A1–A3: tentativa e observação persistem com autoria, sem duplicação |
| RF005 Identificar nível da criança | pp.37–38 / O | Divergente/parcial: E05 manual; E08/E09 IA direta, não validada | F03,F06 / T09,T10,T15 | F03/A2,F06/A1: evidências → sugestão real estruturada → confirmação humana |
| RF006 Gerar recomendações personalizadas | p.38 / O | Simulado/parcial: E08, recomendações dos fixtures e método externo sem chamada comprovada | F06 / T15 | F06/A2: duas evidências distintas produzem recomendações pertinentes e rastreáveis |
| RF007 Visualizar progresso por relatórios | p.38 / O | Simulado/parcial: E10/E11; gráfico fixo e bimestre pré-carregado | F08 / T16,T17,T18 | F08/A1–A3: relatório corresponde aos registros e permissões |
| RF008 Gerenciar perfil | p.38 / D | Parcial: E13; visualização, foto temporária; falta edição real | F01 / T03 | F01/A5: nome editado conserva após reabrir; e-mail exige verificação |
| RF009 Acessar orientações pedagógicas | p.38 / O | Simulado/parcial: E12/E13; artigos consultáveis; individuais em memória | F07 / T19,T20,T21 | F07/A1–A2: geral sem nível; individual só para vínculo autorizado |
| RF010 Participar de testes/acompanhamento futuro | p.38 / D | Ausente: não há fluxo de adesão/feedback | F11 / T24 | F11/A1: adesão opcional separada de termos, revogável |

## RNF — Quadro 7, §6.2.2

| ID / exigência | Fonte/prioridade | Situação atual e evidência | FRD / telas | Critério verificável futuro |
|---|---|---|---|---|
| RNF001 Usabilidade: simples, acessível, intuitiva | p.38 / O | Parcial/divergente: E19; seis abas e muitos indicadores | F10 + todas / T01–T24 | F10/A1: próximo passo visível; adulto conclui percurso guiado sem assistência em teste observado |
| RNF002 Segurança dos usuários/crianças | p.38 / O | Parcial: E01/E08/E17/E18; armazenamento nativo existe; servidor ausente | F01,F02,F06 / todas protegidas | F02/A3 e teste S01: negar ID alheio em cada recurso; nenhum segredo no bundle |
| RNF003 Privacidade/confidencialidade | p.38 / O | Parcial/divergente: E08/E13, nome em prompt e diagnósticos expostos em cards | F02,F06,F10 / T07,T15,T23 | Minimização e escopos; IA sem nome/contato/diagnóstico; logs sem conteúdo infantil |
| RNF004 Respostas rápidas | p.38 / D | Parcial/não aferido: Axios timeout10s; IA sem timeout E08 | F06,F10 / todas | Meta técnica proposta: API comum p95 ≤2s após aquecimento, feedback visual imediato; IA meta p95 ≤45s, medir hardware/rede |
| RNF005 Progresso corretamente armazenado | p.39 / O | Simulado/divergente: E02/E04/E09/E10 | F04,F05,F08 / T12–T18 | Reinício de app e API mantém dados; retry idempotente não duplica nem desbloqueia indevidamente |
| RNF006 Portabilidade mobile/web | p.39 / O | Parcial: deps web/native; dist antigo falha; nativo não testado | F01–F10 / todas | Mesmos contratos em web e APK Android; validar iOS separadamente, sem declarar suporte testado |
| RNF007 Manutenibilidade | p.39 / D | Parcial: separações úteis; E02/E12/E19 e Jest falha | Todas / transversal | Nova feature isolada; nenhuma regra pedagógica dentro de tela; type/lint/Jest corretos |
| RNF008 Acessibilidade para diferentes familiaridades | p.39 / O | Parcial: E16, sem alto contraste/leitura/Libras | F10 / T23 e todas | Teclado/NVDA web; TalkBack Android; ampliação e alternativas; avaliação WCAG pendente |

## UC — Quadros 8–21, §6.2.4

Todos têm **NI** de prioridade própria. A coluna de relação RF não lhes atribui retroativamente uma prioridade.

| ID / nome original | Fonte / prioridade | Situação/evidência | FRD / telas | Aceite específico / relação RF |
|---|---|---|---|---|
| UC001 Realizar cadastro | pp.40–41 / NI | Simulado E01 | F01 / T02 | A1: validar obrigatórios e duplicação; RF001 O |
| UC002 Realizar login | p.41 / NI | Simulado E01 | F01 / T01 | A2: erro não autentica; RF002 O |
| UC003 Cadastrar criança | p.41 / NI | Parcial/simulado E02 | F02 / T06 | A1: criança vinculada ao responsável; RF003 O |
| UC004 Registrar atividade realizada | p.42 / NI | Parcial E05/E12; não há fluxo completo de observação | F04 / T14 | A2: adulto descreve desempenho e data; RF004 O |
| UC005 Realizar atividade educativa | p.42 / NI | Parcial/divergente E04/E07/E09 | F04 / T12,T13 | A1/A3: criança interage e tentativa registra resultado; RF004 relacionado |
| UC006 Identificar nível da criança | pp.42–43 / NI | Parcial/divergente E05/E08/E09 | F03,F06 / T09,T10,T15 | F06/A1,A3: dados insuficientes não alteram último nível; RF005 O |
| UC007 Gerar recomendações personalizadas | p.43 / NI | Simulado/parcial E08 | F06 / T15 | A2/A3: nível/evidências sustentam sugestão, falha permite retry; RF006 O |
| UC008 Visualizar progresso da criança | pp.43–44 / NI | Simulado E10 | F08 / T16 | A1: histórico organizado; vazio verdadeiro; RF007 O |
| UC009 Acessar orientações pedagógicas | p.44 / NI | Simulado/parcial E12/E13 | F07 / T19,T20 | A1: recorrer a conteúdo geral sem nível; RF009 O |
| UC010 Gerenciar perfil do usuário | pp.44–45 / NI | Parcial E13 | F01 / T03 | A5: editar, validar, cancelar sem mutação; RF008 D |
| UC011 Vincular professor ou responsável à criança | p.45 / NI | Ausente E02/E19 | F02 / T07,T08 | A2/A3: convite aceito, duplicação tratada, acesso revogado imediatamente; sem RF exclusivo |
| UC012 Visualizar relatório de desempenho | pp.45–46 / NI | Simulado/parcial E10 | F08 / T17 | A2: buscar registros autorizados e informar insuficiência; RF007 O |
| UC013 Recuperar senha | p.46 / NI | Simulado E01/E17; tela só pede e-mail | F01 / T04 | A3: enviar código/instrução, redefinir e autenticar; sem RF exclusivo |
| UC014 Sair do sistema | pp.46–47 / NI | Parcial E18; confirma e limpa tokens locais | F01 / T05 | A4: cancelar mantém sessão; confirmar revoga e limpa dados da conta; sem RF exclusivo |

## Capacidades fora da lista RF/UC

| ID local / capacidade | Fonte e prioridade original | Atual/evidência | Destino / telas | Aceite e decisão |
|---|---|---|---|---|
| C01 Necessidades específicas | §§7.1–7.2, pp.49–51, fig.22/23; NI | Parcial/simulado, tipos SpecialNeeds/AddChild | F02,F10 / T06,T23 | F02/A4: informação opcional separada das adaptações; D03/D04 |
| C02 Escola e turma | §§7.1–7.2 pp.48–51; NI | Parcial: agrupamento por string E19; sem CRUD próprio | F09 / T22 | A1: mesmo nome em escolas distintas não mistura alunos |
| C03 Avaliação inicial e trilhas | §7.3 pp.51–52; §9.3 p.59; NI | Existente em código/parcial E05/E06 | F03,F05 / T09–T11 | Avaliação salva libera percurso validado no servidor |
| C04 Tarefas/desbloqueio sequencial | Fig.24, pp.51–52; NI | Parcial E06/E07; marcações sem execução | F05 / T11,T12 | A1/A2: tentativa válida e transação liberam próxima etapa; D03 |
| C05 Progresso histórico | §§7.1–7.2 pp.48–51; NI | Simulado E10 | F08 / T16 | A1: autoria, data e tipo de evidência distinguíveis |
| C06 BimestreReport | §§7.1–7.2 pp.48–51, fig.26 p.54; NI | Simulado E10 | F08 / T17 | A2: intervalo e ano corretos, sem média inventada; D03 |
| C07 Relatório coletivo | §3.2 pp.27–28; cap.8 pp.53–55; NI | Parcial/simulado E11 | F08,F09 / T18,T22 | A3: somente turma autorizada; sem ranking público |
| C08 Orientação individual criada pelo professor | Cap.8 pp.53–55, figs.25/26/28; NI | Parcial E12 | F07 / T21 | A2/A3: autoria e versão, conteúdo reaparece para adulto vinculado |
| C09 Criar atividades personalizadas | Cap.8 p.54 fig.27; NI | Parcial E12 | F07 / T21 | A3: template executável ou tarefa observável; não fingir jogo a partir de título |
| C10 Nova avaliação pelo professor | Fig.25 p.53 e sequência pp.51–52; NI | Parcial E05 | F03 / T09 | A1/A2: registrar reavaliação com critérios versionados; editor de rubrica pendente D09 |
| C11 Atenção pedagógica | Texto cap.8 pp.53–55; NI | Divergente E11 | F08,F09 / T18,T22 | A4: sinalização manual justificada; sem limiar automático até validação D03 |
| C12 Modelagem user→students 1:N | Fig.22/23 pp.49/51 vs UC011 p.45; NI | Ausente no backend | F02 / T07 | N:M explícito, concessão individual e trilha de auditoria; D04 |
| C13 Segurança, avaliação humana e qualidade | §6.1 pp.36–37; §§9.3–9.4 pp.59–60; NI | Parcial | F01–F10 / todas | Testes negativos e revisão de classificação, sem equivaler texto gerado a avaliação |
| C14 Persistência relacional e ambiente | §§9.1/9.5/9.8 pp.56–61; NI | Ausente | Arquitetura/dados / transversal | Migration+seed reproduzíveis e recuperação após reinício |
| C15 Plano individual | §3.2 p.27; NI, contexto Premium | Parcial: trilhas/guidance | F05,F07 / T11,T20 | Usar plano simples de tarefas e orientações; sem novo produto comercial |
| C16 Planos/cobrança/licenciamento | Cap.2/§3.2 pp.18–19/27–28; NI | Ausente | Escopo/decisões | Documentado como evolução; sem bloqueio comercial na banca |
| C17 Notificações, suporte e fórum | Cap.2 p.18; NI | Ausente/parcial decorativo E13 | F10 ajuda/escopo | Ajuda real; push/fórum/atendimento posterior |
| C18 Favoritos e exportar PDF | Fig.28 p.55 e CÓD E10/E13; NI | Parcial/handler vazio | F07; F08 opcional | Favorito por usuário; PDF só oferecido se implementado e acessível |
| C19 Leitura, Libras, temas e adaptações | USU; sem prioridade original | Ausente/parcial E14/E16 | F10 / T23,T12,T20 | Matriz A01–A12 de acessibilidade; sem alegar garantia por avatar |
| C20 Diagnóstico, visão, fala/manuscrito | CÓD E08/E09, sem obrigação multimodal explícita no PDF | Parcial/não validado | IA/decisão D08 | API textual recebe registros/métricas estruturados; nenhum diagnóstico ou percepção multimodal alegada |

## Pedidos atuais e propostas

| Origem | Pedido / proposta | Cobertura |
|---|---|---|
| USU | Auditoria, três caminhos e preservação | 02-auditoria; evidências de git/hashes |
| USU | Organização por funcionalidade, mock/API separados | 05-arquitetura; 08-dados; F01–F09 |
| USU | IA concreta, backend, chamada real futura | 07-ia; F06; teste IA01; pendência D03 |
| USU | Acessibilidade e Libras por plataforma | 06-ux; F10; testes AX01–AX06 |
| USU | Contas e múltiplos adultos por criança | F01/F02; contratos e S01–S04 |
| USU confirmado em resposta | APK Android + web neste computador, banca em cerca de um mês; sem VM/revisor | D06/D07, plano de quatro semanas proposto |
| USU revisão0.2 | API pronta, custo zero prioritário, sem treinamento do zero e sem servidor no computador da empresa | 07-ia; 10-revisao; D06/D12/D15/D16 |
| PROP revisão0.2 | FastAPI em VM Oracle elegível, Neon, Groq Free `openai/gpt-oss-120b`; Clerk apenas adultos | D02/D06/D12; prova adulta sintética e liberação infantil pendente D15 |
| PROP | Conclusão operacional separada do nível; atenção manual | D03, F03/F05/F08 |

Rastreabilidade documental está preenchida. Cobertura de implementação, eficácia pedagógica e conformidade assistiva permanecem incompletas.
