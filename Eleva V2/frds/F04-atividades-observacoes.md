# F04 — Execução de atividades e observação adulta

## Adendo vigente — aulas e gestão de estudantes, 29/10/2026

Executor por telas integrado a cinco mecânicas: escolha única/múltipla, ordenação, associação e escrita curta. Posição/rascunhos persistem; confirmação registra resposta, operador, data e apoios do item. Variante escrita desconhecida aguarda revisão por padrão, sem zero automático. Entregas são preservadas e julgamento posterior tem autoria/justificativa. Observação adulta/oral permanece separada; STT/manuscrito não foram acrescentados por inferência. [Fluxos, contratos, evidências e limites](../17-construtor-aulas-e-compartilhamento.md). Este adendo atende pedidos atuais; não altera prioridades acadêmicas originais.

---

## Objetivo, fontes e situação

Separar atividade realizada pela criança no app de registro feito pelo adulto sobre atividade externa. **PDF** RF004 O p.37, UC004/005 NI p.42; **CÓD** E04/E07/E09/E12: listas, gravação e formulários parciais; detalhe não executa, conclusão local e avanço por toque não provam realização. **USU** pede ambos os percursos. **PROP** executor de templates suportados e observação com autoria.

## Atores e permissões; pré/pós

Adulto autorizado seleciona criança/atribuição e inicia contexto infantil. Criança responde; adulto observa atividade externa. Professor cria/atribui conforme F07. Pré: vínculo e atividade disponível, conteúdo publicado e acessível. Pós: tentativa rascunho/concluída ou observação salva, evento no histórico; conclusão de tarefa só se critério do template for cumprido. Nenhum botão escolhe child-1/primeira criança silenciosamente.

## Campos e regras

Tentativa: assignmentId, templateVersion, respostas por item, apoio, tempo, estado started/paused/submitted/completed, idempotency/version. Observação: studentId, data real não futura, atividade selecionada ou título3–120, desempenho observado obrigatório até1.000, contexto/apoio até500; nível percebido opcional e explicitamente não confirmado. Autor/data de gravação no servidor.

Modalidades iniciais propostas: seleção/associação por botões, leitura com escolha de resposta, escrita digitada quando pedagogicamente adequada e tarefa oral/traçado acompanhada com observação adulta. Título “jogo” ou “escrita” não cria um motor genérico; autoria só permite template executável disponível ou tarefa externa identificada. Não alegar visão, reconhecimento de manuscrito ou STT por usar modelo textual. Correção objetiva só para itens com gabarito aprovado; resposta aberta exige adulto. Acessibilidade de estímulos/adaptações deve preservar a finalidade ou registrar alternativa aprovada.

Não somar6 ao nível/progresso por gravação nem concluir por abrir card. Repetição cria nova tentativa identificada, sem apagar anterior ou contar novamente uma task_completion. Não penalizar tempo, ajuda ou pausa sem fundamento do instrumento.

## Fluxo e alternativas

1. Selecionar criança e atribuição, T12 mostra instrução simples, leitura/Libras quando coberta.
2. Criança responde item; API confirma resposta; próximo item mantém foco previsível.
3. Finalizar envia comando idempotente; backend valida itens e registra resultado/evento; T13 confirma salvamento e próximo passo.
4. Alternativamente, adulto abre T14, informa atividade/desempenho/apoio e salva observação; histórico distingue origem.

Pausar conserva rascunho confirmado; erro mantém resposta visível com “não salvo”; microfone não é obrigatório no núcleo e permissão negada permite tarefa oral observada; conteúdo não carregado permite retry; sem vínculo impede execução. Resultado externo nunca é apresentado como acerto automático. Session expirada requer reautenticação antes de retomar dados.

## Persistência e integrações

Assignments/attempts/item_responses/observations/learning_events em PG; operações de F05 podem ocorrer na mesma transação de conclusão. Repositório de atividades, áudio/leitura por adaptador de plataforma; STT só se D08 virar escopo e houver implementação separada validada. Não guardar áudio de criança por padrão; se necessário futuramente, consentimento/finalidade/retenção específicos antes do uso real.

## Estados, acessibilidade e temas

T12–T14: carregando item, respondendo, salvando, não salvo, salvo, pausado, interrompido, vazio/sem atribuição, erro e sem vínculo. Estado legível sem som/cor, opção de repetir instrução, alternativa a arraste, ações48, texto do sistema e foco por item. Todos os temas/alto contraste, sem animação obrigatória ou contador de competição. A01–A12, dependência de Libras revisada D05.

## Critérios de aceite

- **A1:** executar atividade real suportada, concluir, reabrir e encontrar respostas, autoria e resultado; nunca navegar só para trás como implementação de iniciar.
- **A2:** registrar observação externa e recuperar data/desempenho/autor sem convertê-la em execução ou score automático.
- **A3:** interrupção retoma rascunho confirmado; retry/duplo toque não duplica evento/conclusão; erro de commit não mostra sucesso.
- **A4:** trocar criança mantém tentativas corretas e nega IDs alheios; opção sem áudio e alternativa a gesto permitem percurso equivalente aprovado.

## Dependências/pendências

F01/F02/F07/F05 e catálogo; D03 valida conteúdo/gabaritos/adaptações, D08 define ausência de STT do caminho crítico. Não considerar todos os tipos de atividade implementados apenas por existir union type.
# Adendo de implementação · 29/10/2026

Instruções da biblioteca e detalhes da etapa têm sheet dedicado, leitura e aviso explícito de ausência de vídeo Libras revisado. Executor mantém uma pergunta por vez, com apoios rápidos e sem controles docentes. Respostas e conclusão são comandos versionados; ao concluir, feedback do servidor distingue atividade/etapa e novos marcos. Observação oral/adulta continua evento próprio e não conclui tarefa. Retomada, respostas, conclusão e recuperação após recarregar foram exercitadas na interface com dados fictícios. Outros executores/modalidades e validação pedagógica não são declarados concluídos. [Revisão 15](../15-revisao-ux-jornadas.md).
