# Prompt 3 — consolidação do escopo e fechamento do TCC

**Para enviar na mesma conversa do Claude, depois dos prompts 1 e2.** Pode anexar este arquivo inteiro. Referência:19/11/2026. Meta de planejamento: meados de dezembro, usando **15/12/2026** como referência de trabalho, não como data de banca confirmada.

Este prompt decide o escopo editorial e o que será perseguido no desenvolvimento. Não comprova implementação futura. Não é uma ordem para o Claude programar o app ou inventar resultados para preencher lacunas.

---

Continue a partir do texto e dos ajustes que você produziu nos dois prompts anteriores. Agora vamos **fechar as decisões de escopo**, incorporar as orientações do professor e eliminar perguntas de produto/arquitetura que já podem ser respondidas. Entregue a revisão efetiva do texto, das tabelas e dos modelos; não encerre com outra lista de dúvidas genéricas.

## 1. Base de trabalho e precedência

1. Use o documento revisado que você já está produzindo como base de trabalho; preserve as melhorias feitas nos passos 1 e2.
2. A base acadêmica mais recente enviada pela equipe é **`ModeloEntregaFinal-1.pdf`, com62 páginas**, disponível também em `alfabeta/Eleva-para-Codex/`. Ele é diferente de `Eleva-TCC-original.pdf` e `Eleva-TCC.md`, que preservam a versão anterior de 63 páginas. As páginas dos documentos de passagem referem-se ao original; confira as remissões na base atualizada.
3. As orientações do professor transcritas abaixo são obrigatórias. Este prompt complementa os anteriores nas decisões aqui fechadas. Para resultados, **prevalece a evidência técnica real**, não uma previsão deste prompt.
4. Se houver outra versão ainda mais recente anexada pelos autores, identifique-a explicitamente e preserve suas correções. Exemplo: o sumário do PDF de 62 páginas já usa4.3 para a análise SWOT; não restaurar o salto4.2→4.4 da versão histórica.
5. Consulte o repositório `https://github.com/mathcorrea1/elevva` se conseguir acessá-lo. Os documentos principais estão em `Eleva V2/`; app em `alfabeta/`, API em `backend/`, identidade em `identity/`. Se não tiver acesso ao conteúdo ou aos commits mais recentes, use os anexos recebidos e informe o limite; link não comprova leitura. Não peça o projeto inteiro para resolver decisões já contidas aqui.

## 2. Orientações definitivas do professor

- Aplicar as correções da banca de TCC1 conforme a lista, ata ou documento comentado efetivamente recebido. Se a relação completa não foi fornecida, não afirmar aplicação integral nem recriar sugestões imaginárias da banca. Avançar em todo o restante.
- Atualizar diagramas e a redação que os explica.
- **Retirar o capítulo de Prototipagem das telas.** Capturas atuais da aplicação entram em **Resultado e discussão**, acompanhadas de análise; não apenas transferir uma galeria de protótipos antigos.
- Renomear **Proposta de desenvolvimento** para **Desenvolvimento**, descrevendo decisões, tecnologias, implementação e verificações efetivamente realizadas.
- Alinhar tempos verbais. Passado para execução realizada; presente para comportamento implementado. Pendência deve aparecer como limitação e meta ainda não comprovada. Trocar verbo não autoriza escrever que algo foi concluído.
- Incluir obrigatoriamente **Resultado e discussão**: promessas atendidas/parciais, métodos e medidas de qualidade, evidências e limites, contribuição para a dor dos usuários e impacto observado ou esperado claramente distinguido.
- Incluir **Conclusão**, cerca de uma página, respondendo ao objetivo e discutindo contribuição concreta, pontos fortes e limites, sem superficialidade ou resultado novo.
- Trabalhos Futuros é opcional pelo professor. **A equipe decide incluí-lo**, de forma enxuta, porque há expansão e validações externas que precisam ser situadas. Não usar esse capítulo para apagar requisitos originais ainda parciais.

Uma estrutura possível, adaptável ao modelo institucional, é: capítulos1–7 revisados;8 Desenvolvimento;9 Resultado e discussão;10 Conclusão;11 Trabalhos Futuros; Referências. Recalcular sumário, figuras, quadros e remissões; não impor essa numeração se o modelo atualizado exigir outra.

## 3. Decisão central de escopo

Vamos trabalhar no produto até meados de dezembro. A prioridade é um **protótipo funcional e apresentável**, com dados sintéticos coerentes, contas distintas e fluxos integrados. Não é uma implantação produtiva para estudantes reais nem uma validação científica de aprendizagem.

Integração principal: **Trilhas → aulas → atividades → estudantes → adultos autorizados → turmas/escolas → histórico e relatórios**. A IA apoia a autoria **e** o acompanhamento prometido originalmente; um uso não substitui o outro. Acessibilidade faz parte dos fluxos e configurações, sem exigir diagnóstico ou pagamento.

“Tecnicamente viável” significa que vamos priorizar implementação e prova no período, partindo da base existente. Não significa garantia sobre fornecedores, credenciais, revisão profissional, compatibilidade de aparelhos ou prazo oficial da banca. Escreva um compromisso de implementação separado do resultado já obtido.

## 4. O que fica decidido para a versão-alvo

| Área | Decisão de produto e implementação | Como verificar antes de descrever como resultado |
|---|---|---|
| Plataforma | Web e APK Android funcional; React Native/Expo/TypeScript mantidos; iOS conserva portabilidade, sem homologação nesta entrega | Abrir web atual; gerar/instalar APK e executar percurso real. Bundle Android/Hermes não é APK |
| Arquitetura | Evoluir a raiz `alfabeta/`, por features; FastAPI/Python modular, Pydantic, SQLAlchemy e Alembic; sem reescrita total | Código e contratos ativos, testes e migrations; nenhum microserviço/banco extra por escala hipotética |
| Autenticação | Better Auth para adultos; cadastro/login/logout/recuperação e isolamento; sem Clerk ou autenticação simulada paralela | Contas distintas, credencial inválida, logout/revogação, reabertura; recuperação completa com e-mail de teste configurado |
| Perfil | Nome/contexto já persistem; completar edição necessária e avaliar avatar/alteração verificada de e-mail após núcleo | Persistência, validação e autorização. RF008 permanece Desejável; foto/e-mail verificado não se tornam resultado por previsão |
| Estudantes | Cadastro/edição/lista compacta, busca/paginação, apoios opcionais e informação restrita; usar “Estudantes/Alunos” na interface | Criar/editar/reabrir e testar permissões. Condições clínicas, deficiências, comunicação e apoios são categorias diferentes |
| Vínculos | N:M adulto-estudante, concessão explícita, convite direcionado, aceite e revogação; sem estudante padrão silencioso | Conta sem vínculo é negada em histórico, mídia, relatório, convites e IA; matrícula/profissão não concede acesso |
| Escolas/turmas | Gestão contextual, matrículas, docentes por turma e gestor institucional explicitamente concedido | Separar metadados institucionais de registros individuais; gestor não recebe acesso geral aos alunos |
| Avaliação | Coletar evidências iniciais/reavaliações, instrumento versionado, sugestão separada de confirmação docente justificada | Preservar instrumento/origem/data; reavaliação não reescreve histórico; validade do instrumento continua dependente de revisão |
| Autoria manual | Construtor visual, telas flexíveis, prévia, rascunho, duplicação/ordem, revisão e disponibilização de versão | Criar/editar/publicar conforme autorização; aula real executável, não apenas título de atividade |
| Atividades | Cinco mecânicas prioritárias: escolha única, múltipla seleção, ordenação, associação e escrita curta | Respostas, feedbacks, tentativas e revisão persistidos; alternativas acessíveis ao arrastar; execução no Android/web |
| Trilhas | Catálogo/mapa/etapas, progressão no servidor, atribuição individual/em lote, salvar e continuar | Tarefa bloqueada não pode ser pulada por API; reabertura recupera posição/respostas; retry não duplica |
| Reutilização | Conteúdo, revisão, atribuição e execução separados; compartilhar uma versão com outro professor, com aceite e permissões de cópia/redistribuição | Editar não muda versão já atribuída; compartilhamento de conteúdo não abre dados de estudantes do autor |
| Orientações | Conteúdo geral e individual criado/selecionado por adulto autorizado; IA pode sugerir, sem autopublicação | Autoria/versão/origem e leitura só por vínculo; orientação geral pode existir sem nível confirmado |
| Relatórios | Individual, por intervalo/bimestre e coletivo autorizado; histórico, gráficos, detalhe de itens/habilidades e revisão; PDF | Números derivados dos mesmos eventos e filtros; download web e compartilhamento no Android conferidos |
| Aparência/acesso | Azul/branco, Lumi como orientação visual, onboarding, uma tarefa por tela, configurações próprias; claro/escuro/sistema e contraste independente | Trocar tema/fonte preserva formulário/seleção; testar web com teclado/foco/reflow e Android com TalkBack/voz |
| Leitura | PT-BR com Ouvir/Parar/Repetir conforme plataforma, texto sempre disponível, sem autoplay ou gabarito revelado | Conferir voz no aparelho e regra do autor; não exibir pausa/retomada sem suporte |
| Feedback | Fluxo opcional e interesse em acompanhamento futuro, com revogação | Registro real e isolado; RF010 continua Desejável, sem alegar estudo longitudinal realizado |

Perfil completo, favoritos por usuário, calendário bimestral configurável e melhorias adicionais de animação são **refinamentos após o percurso integrado**, não bloqueios para revisar os capítulos nem novos requisitos obrigatórios. A edição de versões, a revisão de escrita e a exportação PDF permanecem no núcleo já assumido; não removê-las por serem trabalhosas.

Vídeo YouTube é conteúdo opcional, com acionamento explícito, alternativa textual e verificação de licença/legendas/termos. Não substitui uma atividade interativa nem deve bloquear a aula se falhar. Não há upload ou captura de áudio do estudante no núcleo desta versão; atividade oral acompanhada permanece como observação do adulto.

## 5. IA: decisões fechadas e aceites necessários

### 5.1 Modelo e execução

Manter **GroqCloud com `openai/gpt-oss-120b`**, por API exclusivamente no backend. Sem treinamento próprio, GPU, Ollama/Qwen ou troca automática de fornecedor. A disponibilidade/cota da conta será conferida na prova real; não escrever gratuidade ilimitada ou operação futura sem custos.

As instruções são Markdown versionado, não treinamento do modelo. No projeto: `backend/ia/instrucoes-criacao.md` e `backend/ia/instrucoes-analise.md`. Entrada livre é dado não confiável. Backend minimiza dados, valida schema e conteúdo, registra modelo/origem/data/versões/uso/requestID quando fornecidos, trata falhas e mantém revisão humana.

### 5.2 Autoria assistida

Objetivo genérico + nível pretendido + quantidade/formatos → proposta de aula → prévia → edição/revisão → rascunho → revisão/publicação → atribuição. Não enviar aluno, nome, escola, diagnóstico, e-mail, nascimento ou áudio. A saída deve usar as cinco mecânicas implementadas. Não publicar automaticamente ou fabricar fonte pedagógica.

**Compromisso técnico:** executar duas chamadas reais com objetivos/estruturas diferentes e salvar recibos. Repetir nome ou retornar exemplos estáticos não comprova geração real. A proposta gerada precisa virar aula executável, sem copiar JSON manualmente para simular integração.

### 5.3 Análise e recomendações originais — RF005/RF006

**Continuam no escopo.** Evidências estruturadas persistidas + instrumento/corpus versionado → análise minimizada → sugestão de nível/dificuldades pedagógicas e atividades permitidas → revisão humana → confirmação docente distinta. Não substituir essa obrigação por gerador genérico de aulas ou chatbot.

**Compromisso técnico:** harmonizar o schema legado para os cinco níveis e demonstrar pelo menos duas análises reais com evidências contrastantes e recomendações ligadas a IDs existentes. Sem instrumento aprovado, usar um percurso técnico com instrumento/corpus **sintéticos identificados**, separado do catálogo publicado e sem alegar qualidade pedagógica validada. Implementar também dados insuficientes; não usar uma resposta fixa de insuficiência como única demonstração e declarar o RF cumprido.

### 5.4 Operação e limites

Manter estados de cota, timeout, recusa, truncamento, saída inválida, interrupção e retomada. Falha não altera nível confirmado nem impede cadastro, salvamento, histórico ou relatório. Cache com origem/data e segregação adequada; pré-gerado identificado só serve à contingência.

Parâmetros atuais de código:45s totais,20 pedidos/dia/projeto,5/adulto, intervalo60s, cache24h; saída até6.000 tokens na autoria e1.500 na análise. São limites locais configuráveis, não a cota contratada do fornecedor nem latência garantida. Ajustes técnicos poderão seguir a prova real, com registro, sem upgrade pago automático.

**Situação no corte de 19/11:** sem `GROQ_API_KEY`, nenhuma chamada real comprovada. A equipe fornecerá configuração segura fora do chat; isso é uma ação operacional específica, não uma indefinição de modelo. Até haver recibo, descrever integração preparada/testada com provedor substituído, sem inventar resultados live.

## 6. Nível, métricas e revisão pedagógica: resposta à pendência

Decisão funcional: cinco categorias — pré-silábico; silábico sem valor sonoro; silábico com valor sonoro; silábico-alfabético; alfabético. Registro histórico “silábico” sem detalhamento continua preservado. Nível pretendido de uma aula não classifica automaticamente o estudante.

Decisão de segurança pedagógica: **não inventaremos rubrica, limiar por idade, fórmula de alfabetização, diagnóstico ou aprovação profissional.** Docente confirma/ajusta nível com evidências e justificativa; sugestão de IA fica separada e pode ser rejeitada. Classificar hipóteses de escrita não equivale a diagnóstico clínico.

Conclusão de aula é cumprimento de conteúdo/entregas obrigatórias, não domínio pedagógico. Resultados comparáveis conservam a primeira confirmação por item na primeira entrega da mesma atribuição/versão; tentativas/revisões não apagam a evidência. Escrita pode usar normalização configurável e revisão de variante desconhecida, sem zero automático indevido. Atenção é sinalização manual justificada, sem ranking dos três menores resultados.

Sobre “criar avaliação”: docente pode elaborar/editar instrumento dentro dos formatos suportados, salvar rascunho e submetê-lo à revisão antes de publicação/aplicação real; uma nova aplicação gera outra avaliação. Não há editor irrestrito que transforme qualquer checklist em rubrica válida. Esse é o tratamento decidido para a antiga D09; validade do instrumento continua sendo revisão externa, sem bloquear autoria e testes sintéticos.

**Ação externa concreta:** buscar revisor pedagógico até a primeira etapa de desenvolvimento, com entrega de instrumento, exemplos, critérios de suficiência/classificação, habilidades, variantes e fontes. Parecer precisa identificar pessoa/qualificação, versão, data e escopo. Professor no cadastro não recebe, por isso, permissão de aprovar catálogo.

**Se não houver revisão a tempo:** entregar coleta/análise/revisão/confirmação tecnicamente funcionais em cenário sintético; declarar validade pedagógica não demonstrada. A redação pode estar fechada com essa limitação explícita; não há licença para afirmar diagnóstico, eficácia ou currículo aprovado. RF005/RF006 devem continuar classificados quanto ao aceite técnico e pedagógico separadamente.

## 7. Libras: compromisso viável, cobertura e limite

Não assumir tradução universal do app ou intérprete próprio baseado no Lumi. As duas frentes são:

1. **Web:** concluir prova do VLibras oficial para trechos públicos/instruções elegíveis selecionados e consentidos, em documento de origem isolada; foco, sobreposição, rede/carregamento e tradução concluída precisam ser conferidos. Não permitir varredura de relatório, nome, gabarito ou informação privada. Tradução automática é apoio complementar.
2. **Android/web:** usar player/manifesto para vídeos curtos essenciais produzidos/licenciados e revisados; priorizar navegação, responder, salvar/retomar e configurações. Oito temas são meta de conteúdo, não quantidade obrigatória original. A WebView experimental só pode ser anunciada após teste real no aparelho; não substitui prova de cobertura nativa.

**Dependência concreta:** obter arquivos, direitos e revisão de Libras por profissionais/pessoa surda fluente. Não inventar vídeo, intérprete, revisor, licença ou compreensão validada. Ter botão/player ou carregar canvas não demonstra Libras concluída.

**Se não houver material/revisão até a fase final:** documentar com precisão a integração web que tiver sido comprovada e a limitação nativa; manter base acessível, texto/leitura e manifesto preparados. Não escrever “Libras em todas as telas/plataformas” ou conformidade completa. Material revisado passa a trabalho futuro e limitação explícita, sem apagar o compromisso de integração que está sendo perseguido.

## 8. Persistência, acesso pelo celular e ambiente

Decisões fechadas: banco relacional único para domínio; SQLAlchemy/Alembic; PostgreSQL, preferencialmente Neon, para validação final multiusuário; Better Auth adulto. Não precisamos de MongoDB/Firebase, Redis, banco vetorial, Kubernetes ou múltiplos ORMs de domínio.

SQLite local já é persistência real de desenvolvimento. **Compromisso técnico:** executar migrations e testes de integridade/retry/concorrência no PostgreSQL autorizado, com backup/ambiente inequivocamente de teste e dados sintéticos. Confirmar persistência após reinício de app/API e separação entre contas. Não inferir equivalência entre SQLite e PostgreSQL nem gravar banco remoto só por existir variável configurada.

Backend/identidade precisam ser alcançáveis pelo Android: `localhost` do APK não aponta ao computador/VM. A equipe preparará um ambiente de teste autorizado e endpoints adequados; HTTPS é a direção para distribuição. VM Oracle é candidata, **não pré-condição nem resultado já obtido**. A hospedagem final será escolhida conforme acesso/limites reais, preservando a arquitetura, sem contratação/provisionamento automático ou promessa de plano gratuito permanente.

Demonstração temporária em máquina autorizada/rede de desenvolvimento pode validar o APK, com rótulo correto; não significa transformar computador empresarial em servidor permanente. Se apenas esse ambiente for comprovado, relatar exatamente isso. Publicação em lojas, SLA empresarial e operação produtiva ficam fora desta entrega.

Recuperação de conta será testada com e-mail/SMTP de teste configurado com segurança. Caixa de captura de desenvolvimento pode testar tecnicamente o fluxo, mas não comprova entrega externa de e-mail; registrar a diferença. Não afirmar SMTP, Neon ou nuvem ativos por existir adaptador.

## 9. Privacidade e público — delimitação fechada da demonstração

Nesta entrega, demonstração e provas técnicas usarão **operadores adultos e perfis inteiramente fictícios**, sem crianças reais ou informações pessoais de alunos reais. Contas distintas e permissões serão demonstradas com os cenários sintéticos A/B/P/Q e seus estudantes/turmas.

Isso não declara aprovados termos de fornecedor, conformidade LGPD, uso infantil da API ou piloto escolar. A liberação para menores/dados reais é etapa externa posterior que exige avaliação adequada; anonimização/backend/conta adulta não constituem autorização automática. Se ocorrer revisão formal antes do encerramento, atualizar somente o escopo efetivamente aprovado, com evidência.

Adaptações não exigem diagnóstico; informação restrita tem finalidade/permissão próprias e não vai para snapshots de IA. Não manter senha/chave em APK, relatório, print, PDF ou pacote do TCC.

## 10. O que não assumimos nesta entrega

Alguns itens são tecnicamente possíveis, mas não cabem como compromissos adicionais neste ciclo porque ampliam modalidade, validação ou operação sem fechar o núcleo:

- Treinar modelo próprio, hospedar LLM/GPU ou criar avatar intérprete de Libras.
- Diagnóstico clínico; eficácia educacional/comparação longitudinal comprovada; classificação automática sem revisão validada.
- STT, avaliação automática de pronúncia, visão/manuscrito e gravação de áudio infantil. Atividade oral acompanhada continua incluída.
- Implementar indiscriminadamente todas as mecânicas sugeridas: arrastar obrigatório, regiões de imagem, reconhecimento multimodal, ranking competitivo ou cronômetros punitivos. As cinco mecânicas serão bem integradas; futuras mecânicas usam arquitetura extensível.
- Conta infantil independente, chat infantil irrestrito e tradução universal nativa.
- APK/iOS homologados por suposição; suporte iOS segue intenção de portabilidade, sem prova nesta entrega.
- Cobrança/assinatura operacional, fórum, push, atendimento comercial e infraestrutura empresarial.
- Funcionamento offline completo com sincronização/conflitos em todos os fluxos; retomada pressupõe salvamento confirmado pela API. Falha de rede mostra pendência, não falso sucesso.
- Certificações/pentest, WCAG integral/PDF-UA ou garantia de escala/latência/custo sem avaliação.

Não classificar esses itens genericamente como “impossíveis”. Explicar que são expansão, validação externa ou modalidade não assumida. Não usar esta lista para retirar RF/RNF/UC originais ou a análise/recomendação personalizada.

## 11. Qualidade, resultados e impacto: o que pode ser escrito agora

Evidência atual, corte 19/11/2026: **67 testes backend,25 frontend/15 suítes frontend, TypeScript e lint aprovados; exportações web e Android/Hermes aprovadas**. São resultados técnicos locais; provedor de IA foi substituído nos testes e o Android não foi instalado por esses comandos. Novos resultados só entram com recibo e data.

Para a fase final, vamos perseguir evidências destes roteiros:

- Sessão e isolamento A/B/P/Q; grant, revogação e ausência de acesso geral por profissão/escola/matrícula.
- Criar/editar/compartilhar/atribuir revisão e provar que mudança do autor não reescreve histórico.
- Avaliar → executar cinco mecânicas/observar → salvar/sair/reabrir → concluir → revisar escrita → consultar relatório/PDF das mesmas evidências.
- Retry sem duplicação, transação de lote, tarefa bloqueada e falha de salvamento sem falso sucesso.
- Chamadas reais contrastantes de IA de autoria **e** análise, mais timeout/cota/saída inválida; núcleo preservado na falha.
- Temas/contraste/fonte, foco/teclado/reflow web, leitura e TalkBack Android; Libras na cobertura realmente comprovada.
- Medidas de tempos/respostas/erros em tarefas e carregamento, com ambiente/volume de dados/rede e limites; nenhuma cobertura percentual, p95 ou meta atingida sem medição.

Uma avaliação curta com adultos voluntários, se viabilizada pela equipe e conforme as regras institucionais, pode observar cadastro/atribuição/retomada/consulta: tempo, sucesso, erros e comentários com método/amostra/data. É meta de avaliação, **não estudo já realizado**. Sem participantes, discutir resultados do ensaio técnico e impacto potencial, sem criar cliente satisfeito, depoimento ou ganho de aprendizagem.

Resultado e discussão deve apresentar uma matriz: **promessa/requisito → recurso → método/evidência → resultado → contribuição → limitação**. Distinguir aprendizagem do estudante de resultado de teste de software. As conclusões precisam ser proporcionais ao experimento.

## 12. Horizonte de execução e dependências da equipe

Usar15/12/2026 como meta de trabalho aproximada; a banca não foi agendada por este prompt. Não datar atividade como concluída antecipadamente.

| Período de planejamento | Prioridade | Dependência/aceite |
|---|---|---|
| 19–25/11 | Configurar/provar IA, escolher ambiente de teste, preparar Android, harmonizar níveis e fechar percurso principal | Contas/chaves fora do chat; aparelho/JDK/SDK; buscar revisão pedagógica/Libras; não esperar todas para implementar o restante |
| 26/11–02/12 | PostgreSQL e permissões, IA sobre evidências, biblioteca/atribuição/relatórios/PDF integrados | Testes nas bases autorizadas; dois tipos de prova real de IA e revisão; publicação de conteúdo real só com parecer |
| 03–09/12 | Revisão UX/acessibilidade por fluxo, Libras/mídia possível, perfil/refinamentos após núcleo, testes em APK | Materiais/revisores se disponíveis; medir e registrar exatamente a cobertura; ensaio com adultos se viabilizado |
| 10–15/12 | Estabilidade, seed reproduzível, ensaio da banca, capturas finais e atualização dos resultados/discussão/conclusão | Congelar expansão, corrigir defeitos, registrar pendências que permanecerem; não trocar evidência por redação otimista |

Responsabilidades externas específicas, sem perguntas genéricas de arquitetura:

1. **Autor/equipe:** criar/configurar contas de teste de Groq, Neon e e-mail e disponibilizar segredos somente em configuração segura; autorizar o ambiente de implantação quando identificado. Não enviar segredos no chat.
2. **Autor/equipe:** disponibilizar celular Android, autorizar ferramentas necessárias na máquina permitida, informar rede/apresentação/data quando definida.
3. **Autor/equipe:** buscar revisor pedagógico e material/revisão Libras; entregar lista/ata da banca1 e validar alterações com o orientador.
4. **Desenvolvimento com Codex:** código, integrações, scripts, testes, tratamento de falhas, builds e recibos no ambiente disponível. Não assumir aprovação profissional por acesso ao código.
5. **Colega/editor com Claude:** redação, consistência dos requisitos/modelos e estrutura acadêmica; autores conferem referências, prints, resultados e conclusão. O modelo não assina validação de pedagogia/Libras/termos.

Se alguma dependência não for obtida, aplicar os limites definidos acima e registrar o resultado real no encerramento. Isso fecha o tratamento editorial da pendência; não atesta sua resolução técnica.

## 13. Rastreabilidade que não pode mudar

Preservar IDs/prioridades: RF001–RF007 Obrigatórios; RF008 Desejável; RF009 Obrigatório; RF010 Desejável. RNF001/002/003/005/006/008 Obrigatórios; RNF004/007 Desejáveis. UC001–UC014 sem prioridade própria informada no original. Acrescentar complementos de autoria/compartilhamento/gestão/acessibilidade com origem posterior explícita, sem fingir exigência original ou substituir os requisitos difíceis.

RF005 eRF006 precisam de duas colunas de aceite quando pertinente: **funcionamento técnico** e **validade pedagógica**. Sem revisão, não marcar cobertura acadêmica integral por haver chamada de IA. UC006 evolui de “IA define/grava nível” para “IA sugere e docente confirma”; registrar justificativa para a equipe/orientador. UC013 usa resposta neutra sobre e-mail para segurança; cadastro docente é ampliação explícita de RF003/UC003.

Na modelagem, representar N:M/grants, equipe escolar, conteúdo/revisão/compartilhamento/atribuição/tentativa, evidências, análise e geração de aulas separadas. Não desenhar tabelas de telas/questões ou FK inexistentes como se estivessem implementadas: o corpo da aula usa JSON versionado e a autoridade é o backend. Relatório é derivado dos eventos, sem estatística fictícia paralela.

## 14. Entrega que preciso agora

1. **Atualize efetivamente o texto já produzido**, sem reiniciar do original e perder correções. Preserve a pesquisa e os dados originais. Estrutura final conforme professor.
2. **Feche as decisões de escopo** com as respostas deste prompt; não devolva “escolher modelo”, “decidir autenticação”, “decidir N:M”, “definir stack” ou “decidir se teremos trilhas/relatórios” como perguntas abertas.
3. Entregue **matriz de cobertura atual e compromisso da versão-alvo em colunas diferentes**. Estados: existente/testado; parcial; implementação assumida ainda sem evidência; dependência externa; fora desta versão. Não fundir “planejado até dezembro” com “concluído”.
4. Entregue Desenvolvimento, Resultado e discussão, Conclusão e Trabalhos Futuros em redação acadêmica. Nos resultados use apenas o corte comprovado; apresente limites em frases completas, sem centenas de marcadores vazios. O escopo futuro não deve contaminar o tempo verbal dos resultados atuais.
5. Preserve/atualize os diagramas editáveis e lista de capturas: tela, ator, requisito, finalidade e discussão sugerida. Prints e recibos posteriores substituirão marcadores locais quando entregues.
6. Termine com **uma única lista curta de evidências/ações externas faltantes**, já com responsável, finalidade e tratamento se não vierem. Ela não deve reabrir decisões respondidas neste prompt nem conter questão rotineira de tecnologia.

Não afirmar “todas as modificações da banca aplicadas” sem a lista conferida; não chamar o TCC de validado pelo orientador. Não inventar chamada de IA, revisão, mídia, estatística ou participante para fechar o documento. A meta é uma versão academicamente consistente e praticamente revisável hoje, preparada para receber as provas finais do desenvolvimento até meados de dezembro.

---

## Fontes de conferência técnica

Para o editor, não substituem provas do projeto:

- [Modelos Groq](https://console.groq.com/docs/models), [saídas estruturadas](https://console.groq.com/docs/structured-outputs) e [limites](https://console.groq.com/docs/rate-limits): modelo/runtime e condições técnicas; conferir cota da conta, sem garanti-la no TCC.
- [Planos Neon](https://neon.com/docs/introduction/plans): distinguir plano disponível de banco efetivamente configurado/testado; não afirmar custo operacional permanente zero.
- [Build Android local no Expo](https://docs.expo.dev/guides/local-app-development/): compilação exige ferramentas nativas; exportar JS não instala APK. Conferir compatibilidade com a stack fixada, sem atualizar versões automaticamente.
- `Eleva V2/evidencias/evolucao-v5-verificacao.json`, diagnóstico, documento de Libras e código do projeto: fonte de resultados/limites no corte 19/11, sem inferir execução posterior.
