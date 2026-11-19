# Prompt pronto para atualizar o TCC do Elevva

**Uso:** copiar o bloco abaixo para uma nova conversa e anexar o TCC original e o arquivo `18-atualizacao-tcc.md`. Se houver acesso ao repositório, informar sua pasta. O original deve ser preservado. Prints serão atualizados depois, pelo colega, conforme o texto e os fluxos reais.

---

Você vai **revisar e produzir a versão atualizada do meu TCC do Elevva**, uma aplicação educacional de apoio à alfabetização infantil. Não quero apenas sugestões ou um plano: entregue a redação revisada das seções, tabelas e modelos necessários, pronta para transferir ao documento acadêmico. Não implemente o app nesta tarefa.

## Orientações obrigatórias do professor para o documento final

Estas orientações, recebidas em19/11/2026, prevalecem sobre instruções anteriores deste pacote que falem em manter capítulo de prototipagem ou deixar resultados/conclusão opcionais:

1. Aplicar todas as correções da banca de TCC1. Conferir a lista/ata/comentários fornecidos; se não estiverem disponíveis, criar uma pendência identificada e não afirmar que todas foram aplicadas.
2. Atualizar diagramas quando necessário, incluindo a redação que os explica e suas referências.
3. **Retirar o capítulo “Prototipagem das telas”.** Usar capturas da aplicação implementada no capítulo “Resultado e discussão”, acompanhadas de análise dos fluxos e das evidências; não apenas renomear a galeria antiga.
4. Renomear “Proposta de desenvolvimento” para **“Desenvolvimento”**, relatando tecnologias, decisões, implementação e verificações efetivamente realizadas. Recalcular numeração dos capítulos seguintes.
5. Alinhar os tempos verbais: relatar o que foi executado no passado e descrever comportamento implementado no presente. **Não converter promessa não cumprida em realização por troca de verbo.** Classificar a limitação e levá-la à discussão/trabalhos futuros quando cabível, preservando o requisito original e a rastreabilidade.
6. Incluir capítulo **“Resultado e discussão”**: promessas atendidas/parciais, imagens, medidas de qualidade, métodos, resultados e limitações; discutir contribuição para responsáveis/docentes e estudantes. Separar impacto esperado de impacto observado: não inventar clientes, piloto, ganhos de aprendizagem ou satisfação dos usuários.
7. Incluir **“Conclusão”**, cerca de uma página: resposta ao objetivo, contribuição concreta para a dor, pontos fortes sustentados por evidência e limites. Não introduzir resultados novos ou generalizar o experimento sintético.
8. Opcional: **“Trabalhos Futuros”**, cerca de uma página, com pendências e expansão priorizadas. Registrar obrigações originais ainda parciais como limitações atuais, não apagá-las ao mover conteúdo para o futuro.

Usar o último PDF atualizado enviado pela equipe como base editorial e os documentos/código como fontes de atualização técnica. Informar qual arquivo foi efetivamente recebido/lido e preservar a pesquisa e as correções já presentes. O repositório recebeu `alfabeta/Eleva-para-Codex/ModeloEntregaFinal-1.pdf`, de62 páginas, distinto do original `Eleva-TCC-original.pdf`, de63 páginas. O mapa18 usa paginação antiga: conferir as remissões no arquivo novo, sem sobrescrevê-lo. Se a equipe tiver fornecido outra versão ainda mais recente, dar-lhe precedência editorial explícita.

## Fontes e estado de referência

Use o TCC original anexado (`Eleva-TCC.md`/PDF de63 páginas) e o documento de passagem `18-atualizacao-tcc.md`, corte de **19/11/2026**. Se tiver o repositório, as fontes estão em:

- `alfabeta/Eleva-para-Codex/Eleva-TCC.md` e `Eleva-TCC-original.pdf`;
- `Eleva V2/01–10`, `frds/F01–F11`, `12-rastreabilidade-implementacao.md` e registros15–17;
- `Eleva V2/18-atualizacao-tcc.md`, `ELEVVA-DIAGNOSTICO.md`, `ELEVVA-ACESSIBILIDADE-LIBRAS.md` e recibo `evidencias/evolucao-v5-verificacao.json`;
- código em `alfabeta/`, `backend/`, `identity/`, seus manifests, contratos, modelos, migrations e testes.

**Não diga que leu arquivos que não recebeu.** Se algum faltar, liste o nome e avance com as fontes disponíveis, sinalizando os trechos que exigem conferência. Não substitua o conteúdo histórico do TCC por uma FRD ou por propaganda do produto. Preserve autoria, pesquisa, percentuais, propósito e evidências originais.

As referências de página fornecidas são **físicas do PDF antigo**; da física13 em diante, impressa=física−6. Recalcule paginação e referências cruzadas na versão final.

## Direção do produto que deve constar no texto

O Elevva integra **trilhas, aulas por telas, atividades interativas, estudantes, adultos autorizados, escolas/turmas e relatórios**. Professor cria conteúdo manualmente ou com assistência de IA, revisa, disponibiliza uma versão e atribui a estudantes autorizados. Aluno executa uma tarefa por etapa, recebe feedback e pode continuar de onde parou. Responsável e docente acompanham os mesmos registros persistidos.

Preservamos React Native/Expo/TypeScript e evoluímos gradualmente a apresentação; não criamos outro aplicativo. Identidade adulta é Better Auth, substituindo Clerk. Backend é FastAPI/Python, SQLAlchemy e Alembic, em monólito modular. SQLite é usado no desenvolvimento local com dados fictícios persistidos; PostgreSQL/Neon é destino planejado, sem banco remoto ou hospedagem comprovados. Não descrever mock ou array em memória como persistência real; não chamar SQLite de Neon.

O escopo-alvo inclui:

1. Cadastro/login/perfil/saída e recuperação de conta adulta; responsáveis e docentes com contas diferentes. Recuperação real por e-mail ainda depende de SMTP e validação completa.
2. Estudantes com dados básicos, apoios opcionais e dados restritos; vários adultos por estudante com convite, aceite e revogação. Profissão, escola ou matrícula não concedem acesso individual automaticamente.
3. Contexto de escolas, turmas, matrículas, docentes e gestor explicitamente autorizado. Gestor é papel contextual, sem acesso irrestrito aos alunos. A conta do estudante independente não existe: execução é supervisionada a partir do adulto autorizado.
4. Avaliação inicial/reavaliação, evidências, observação adulta separada da execução, sugestão de nível e confirmação docente justificadas. Instrumento/rubrica e revisão pedagógica ainda pendentes.
5. Biblioteca e construtor visual de aulas: título, objetivo, habilidades, dificuldade/nível pretendido, adaptações e telas flexíveis de texto, imagem, YouTube, combinações, atividade e conclusão; editar, duplicar, ordenar, visualizar, salvar rascunho e publicar mediante validação/revisão.
6. Cinco mecânicas reais: escolha única, múltipla seleção, ordenação, associação e escrita curta. Não declarar outros reconhecedores ou jogos como implementados. Letras/sílabas/frases reutilizam essas mecânicas. Há controles acessíveis em lugar de arrastar obrigatório.
7. Trilhas versionadas, mapa/etapas, desbloqueio validado pelo servidor, atribuição em lote, progresso e retomada. Conteúdo, revisão, atribuição e tentativa são conceitos distintos; alteração do autor não muda execução histórica.
8. Compartilhar versões entre professores com aceite e permissões de copiar/redistribuir; biblioteca identifica origem. Compartilhar aula não compartilha os alunos do autor. Distribuição para turma/escola exige vínculos individuais e validação de todos os destinatários.
9. Orientações gerais e individuais, revisão de escrita, histórico e relatórios individuais/por período/coletivos; gráficos sobre evidências e PDF gerado no backend, sem dados clínicos/restritos no documento. PDF/UA não foi validado.
10. UX mobile/web azul e branca, onboarding e mascote Lumi como apoio visual. Trilhas é referência interna. Ações principais acessíveis, listas compactas com busca/paginação, formulários focados; aparência e tamanho do texto em Perfil→Configurações. Não afirmar que todas as telas passaram por aprovação final de usabilidade.
11. Claro/escuro/sistema, contraste independente, fonte ampliável/sistema, foco/teclado, semântica, movimento reduzido e leitura PT-BR com Ouvir/Parar/Repetir conforme plataforma. Texto permanece disponível; leitura de questão respeita a habilidade avaliada.
12. Libras como apoio complementar, com entrada contextual e trecho público permitido em ambiente isolado na web; player/manifesto para vídeos essenciais revisados e alternativa nativa ainda em validação. Widget carregado/avatar não comprova tradução concluída. Não prometer tradução universal no React Native nem intérprete substituído.
13. Feedback e interesse opcional/revogável em acompanhamento futuro, preservando prioridade desejável original.

Cobrança, fórum, push, atendimento comercial, chat infantil irrestrito, STT automático, reconhecimento de manuscrito/visão e treinamento de modelo próprio ficam fora do compromisso desta versão. Projeções comerciais podem permanecer como trabalhos futuros/hipóteses de negócio. Acessibilidade não exige diagnóstico ou pagamento.

## IA: escrever exatamente a decisão vigente e seus limites

Usamos **modelo pronto `openai/gpt-oss-120b` pela GroqCloud**, chamado somente pelo backend. Não usamos treinamento próprio, Gemini, Qwen/Ollama ou servidor de LLM/GPU local. O prefixo do modelo não significa uso da API da OpenAI.

Existem dois propósitos distintos:

- **Autoria assistida:** docente informa objetivo genérico, nível pretendido, quantidade e mecânicas. API solicita proposta JSON, valida estrutura/conteúdo e permite transformar em rascunho editável; não publica automaticamente. Não envia aluno, nome, e-mail, diagnóstico, escola, nascimento ou áudio.
- **Acompanhamento original:** evidências estruturadas minimizadas sustentam sugestão de nível e recomendações com referências/IDs permitidos; revisão humana e confirmação de nível são eventos separados. Sem evidências/rubrica, declarar insuficiência. **Gerar uma aula não cumpre, sozinho, RF005/RF006.**

Instruções Markdown versionadas orientam o modelo; não são treinamento nem garantia de assertividade. Há timeout, cotas locais configuráveis, cache, origem/data/modelo/requestID/uso quando fornecidos, falhas e revisão registrados. Observações/objetivos são dados não confiáveis, não comandos privilegiados. Core continua funcionando sem IA.

**Hoje não existe chamada real comprovada: falta `GROQ_API_KEY`.** Testes usam provedor substituído. Não escrever “integração validada com sucesso”, resultados personalizados live, custo zero garantido, qualidade pedagógica ou público infantil autorizado. A prova técnica sintética e a validação pedagógica/contratual são atividades diferentes ainda pendentes. Não solicitar ou reproduzir segredos no documento.

## Métricas e validade pedagógica

Os cinco níveis oferecidos no cadastro/autoria/confirmação são: pré-silábico, silábico sem valor sonoro, silábico com valor sonoro, silábico-alfabético e alfabético. Registro antigo “silábico” sem detalhamento continua preservado. O schema legado da análise de IA ainda precisa ser harmonizado: não afirmar cinco categorias em todo o fluxo atual.

Contagem de tarefas, número de tentativas, acerto de itens comparáveis, sugestão de IA e nível confirmado são medidas distintas. Não inventar percentual de alfabetização, fórmula global, pontos por áudio, limiar por idade ou diagnóstico de transtorno. Resultados comparáveis preservam primeira confirmação por item na primeira entrega da mesma atribuição/versão. Escrita pode exigir revisão humana; variante não cadastrada não deve virar automaticamente erro.

Rubricas, critérios de suficiência/classificação, corpus, variantes aceitas, revisão do conteúdo e interpretação dos indicadores dependem de validação pedagógica, que **ainda não ocorreu**. Adaptações não dependem de preencher diagnóstico. Dados de teste são fictícios, não alunos reais ou conteúdo aprovado.

## Requisitos e casos de uso: preservar rastreabilidade

Mantenha IDs e prioridades originais:

- RF001 cadastro **O**; RF002 login **O**; RF003 cadastrar criança **O**; RF004 registrar atividades **O**; RF005 identificar nível **O**; RF006 recomendações personalizadas **O**; RF007 progresso **O**; RF008 perfil **D**; RF009 orientações pedagógicas **O**; RF010 testes/acompanhamento futuro **D**.
- RNF001 usabilidade **O**; RNF002 segurança **O**; RNF003 privacidade **O**; RNF004 desempenho **D**; RNF005 confiabilidade **O**; RNF006 portabilidade **O**; RNF007 manutenibilidade **D**; RNF008 acessibilidade **O**.
- UC001 cadastro; UC002 login; UC003 cadastrar criança; UC004 registrar atividade; UC005 realizar atividade; UC006 identificar nível; UC007 recomendações; UC008 progresso; UC009 orientações; UC010 perfil; UC011 vincular adulto; UC012 relatório; UC013 recuperação; UC014 saída. **Prioridade própria dos UC: NI** no original.

Pode usar “estudante/aluno” na redação e interface, preservando correspondência com títulos originais. Acrescente autoria/IA de autoria, compartilhamento, atribuição, gestão, preferências e PDF em uma seção de requisitos/casos complementares com **origem posterior explícita e prioridade a validar**, sem renumerar ou eliminar os originais. Não inferir obrigação acadêmica a partir de uma imagem isolada.

UC006 precisa ser revisado: o original diz que IA define e grava nível; direção atual é sugestão com evidências e confirmação humana. Registre a mudança e sua justificativa para revisão da equipe/orientador. UC013 deve responder de forma neutra sobre e-mail para evitar enumeração de contas, justificando a diferença do original. Cadastro docente também é ampliação explícita do ator original de RF003/UC003.

## Partes do trabalho a atualizar

1. Resumo/Abstract, objetivo, conceito e público/personas: incluir autoria, colaboração e acessibilidade sem abandonar acompanhamento. Distinguir objetivo futuro de resultado experimental.
2. Canvas/modelo de negócio: integração de modelos prontos em vez de treinamento; monetização/canais/planos como hipóteses futuras. Não inventar parceria.
3. Pesquisa de viabilidade: preservar resultados/percentuais, corrigir remissões com as figuras e separar interesse dos respondentes de teste do app final. Não criar novas entrevistas ou questionários.
4. Gestão, cronograma/SWOT e stakeholders: incluir implementação, verificações e dependências reais; não inventar datas e profissionais.
5. Restrições e quadros de RF/RNF: usar os IDs/prioridades acima e matriz de cobertura, sem declarar implementação integral.
6. **Diagramas e suas descrições**, além de prints: casos de uso, classes, DER e sequência. Modelar N:M adulto-estudante/grants; escola/equipe/turma/matrícula; conteúdo/revisão/compartilhamento/atribuição/tentativa; avaliação/observação/confirmação; análise de IA e geração de aula separadas. Preservar histórico. O store não é autoridade de nível/progresso; API autoriza e grava transações. Não desenhar tabelas de telas/questões inexistentes: hoje ficam em JSON versionado. Não inventar tabelas de relatórios/totais paralelos.
7. Tecnologias: Better Auth no lugar de Clerk; SQLAlchemy/Alembic; SQLite local versus PostgreSQL/Neon planejado; Groq/modelo; ReportLab; leitura e WebView. Consultar versões no documento de passagem/manifests, não atualizar stack na redação por suposição.
8. Persistência/arquitetura/infra: organização por feature, contratos, backend modular; sem necessidade de banco não relacional ou microsserviços. Ambiente demonstrativo local temporário não equivale a computador empresarial hospedando produto final. Nenhuma VM/banco remoto/deploy estão comprovados.
9. Testes/métricas/resultados: registrar evidências técnicas com ambiente e data; distinguir web exportada, bundle Android, APK instalado e iOS. WCAG2.2AA é referência, sem conformidade presumida; TTS/Libras dependem de plataforma, rede/mídia e validação.
10. Retirar o capítulo de prototipagem e apresentar interfaces implementadas em “Resultado e discussão”, com finalidade, requisito, ator, resultado e limite por captura. Não legendar tela web estreita como APK; não exibir senha/chave ou aluno real. Usar marcadores claros para prints ainda não entregues, sem inventar imagem.
11. Referências, sumário, listas, numeração e citações cruzadas: conferir fonte/edição/ano, sem inventar referências ou datas de acesso. O original contém referências cruzadas e numeração inconsistentes.
12. “Resultado e discussão” e “Conclusão” são obrigatórios pelas orientações recebidas; “Trabalhos Futuros” é opcional. Explicitar contribuição técnica e limitações, sem ganho educacional, avaliação clínica, homologação jurídica ou teste com estudantes reais inventados.

O arquivo18 fornece páginas físicas exatas por seção, matrizes dos10RF/8RNF/14UC, recorte de DER e sequência atual para orientar esses ajustes.

## Resultados técnicos que podem ser relatados, com escopo

No corte de19/11/2026: **67 testes backend e25 frontend, em15 suítes frontend, aprovados; TypeScript e lint aprovados**. São testes técnicos locais, com identidades de teste isoladas quando aplicável e provedor de IA substituído. Não representam percentual de cobertura ou validação pedagógica. Use o recibo fornecido para status de builds; exportação Android/Hermes nunca significa APK instalado. Verificações manuais anteriores mantêm sua própria data e não foram todas repetidas neste corte.

Pendentes explícitos: Groq real e prova com dois pedidos contrastantes; rubrica/corpus/revisor; adequação contratual e dados reais de menores; tradução Libras concluída/revisada e validação nativa; SMTP; PostgreSQL real/ambiente remoto; APK/TalkBack/iOS; usabilidade e auditoria assistiva completas. Não transformar essas pendências em resultados concluídos por existir código.

## Entregáveis

1. **Versão revisada do texto acadêmico**, em arquivo separado do original, no formato editável disponível. Se não puder editar o arquivo, entregar as seções completas em Markdown, ordenadas como o TCC; não apenas bullets de recomendações.
2. **Tabela de alterações**: seção/página antiga → mudança → justificativa → fonte/origem → decisão pendente.
3. **Quadros atualizados** dos10RF,8RNF,14UC e complementos separados, com status real versus escopo previsto.
4. **Modelos editáveis** de casos de uso, classes/DER e sequências (Mermaid/PlantUML se não houver editor visual), com legenda conceitual/física e sem afirmar FK inexistente.
5. **Lista de capturas necessárias**, com tela, ator, contexto, requisito e legenda sugerida. O colega fará os prints; não bloquear o restante por isso.
6. **Pendências finais para equipe/orientador**, indicando exatamente o que impede afirmar conclusão de cada item.

Use linguagem acadêmica clara e mantenha a formatação institucional. A apresentação pode destacar valor de produto, mas o texto científico precisa distinguir **previsto, implementado localmente, testado, integração real, simulado e pendente**. Avance nas partes independentes e entregue os textos que puder finalizar; não termine apenas com perguntas.

---

**Conferência humana antes de entregar:** o novo objetivo e a mudança do UC006 precisam ser lidos pela equipe/orientador; os requisitos originais não desaparecem por conveniência. Atualizar o corte de evidências somente com novos recibos verificáveis.
