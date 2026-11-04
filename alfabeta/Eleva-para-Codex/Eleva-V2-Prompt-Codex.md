Você vai analisar e planejar a evolução do Eleva, meu TCC de aplicativo educacional para alfabetização infantil. Quero que você produza as FRDs que vão orientar a versão final, com foco em melhorar a UX/UI, implementar acessibilidade de verdade, integrar IA e preparar persistência real.

## 1. Objetivo e contexto

O TCC 1 foi aprovado com nota 9. Existe um protótipo desenvolvido em código com o Codex. Ele já tem funcionalidades e uma estrutura que talvez seja boa, mas as telas ficaram confusas, com excesso de informações. Tentativas anteriores de mudar cores e temas quebraram partes da interface.

Minha preferência inicial é aproveitar o projeto atual, se isso for tecnicamente adequado. Não estou determinando uma reescrita. Avalie se compensa evoluir o projeto, reconstruir apenas a apresentação ou reconstruir tudo. Recomende com evidências do código e esforço relativo.

Os dados atuais são fictícios; não há banco integrado. Isso precisa ser distinguido de funcionalidade realmente persistida. O objetivo é um protótipo de TCC funcional na apresentação, com poucos usuários, contas separadas e dados coerentes. Não precisamos de uma arquitetura empresarial complexa.

O PDF do TCC está anexado ou disponível neste workspace. Procure o documento do Eleva, incluindo o arquivo ModeloEntregaFinal (1)(2).pdf ou Eleva-TCC-original.pdf, e leia-o integralmente. Inspecione também o aplicativo e seu código. Se algum arquivo não estiver acessível, informe exatamente qual; não alegue ter lido.

O pacote inclui Eleva-TCC.md, que é a conversão textual do PDF por página, e a pasta figuras/ com diagramas, gráficos e telas. Use o Markdown para ler o documento e localizar os trechos; abra também as figuras, especialmente os casos de uso, classes, DER, sequência e protótipos (figuras 21–29). Consulte o PDF quando a conversão ou uma tabela estiver ambígua. O Markdown preserva o texto original: não é uma nova FRD e não incorpora automaticamente meus pedidos atuais. Leia as instruções desta tarefa separadamente.

## 2. Como conciliar PDF, protótipo e novas decisões

O PDF define a proposta geral e as funcionalidades que precisamos cumprir. Porém, foi escrito por três pessoas e pode ter inconsistências, omissões ou partes desconexas. Não trate cada divergência como uma regra definitiva a implementar sem análise.

Use o PDF e o protótipo juntos: preserve a identidade e o propósito do Eleva, compreenda os fluxos existentes e proponha uma experiência melhor. O objetivo é melhorar o app e completar as funcionalidades documentadas, mantendo o que faz sentido.

Separe explicitamente:
- Exigência do PDF, com página/seção e prioridade original.
- Funcionalidade já existente, com evidência no projeto.
- Pedido atual meu.
- Proposta técnica ou de produto sua.
- Divergência ou decisão ainda necessária.

Quando houver conflito, registre as fontes, impacto e solução recomendada. Não use o código para retirar exigências do trabalho nem invente funcionalidades obrigatórias a partir de uma imagem isolada. Funcionalidade existente sem base no PDF deve ser avaliada quanto a utilidade e coerência, não automaticamente descartada.

As FRDs consolidadas serão a referência de implementação. Não as apresente como totalmente fechadas enquanto houver decisões bloqueantes; identifique claramente decisões propostas e confirmadas.

## 3. Inspeção e decisão arquitetural

Leia AGENTS.md e instruções do projeto; confira o git e preserve alterações existentes.

Inspecione pastas por feature, componentes compartilhados, navegação, tipos, regras pedagógicas, estado, autenticação, serviços, mocks, estilos, temas, testes e integração prevista com backend.

Se o padrão atual for organizado e adequado, preserve-o e documente como segui-lo. Se houver problemas, proponha correções pontuais ou uma estrutura melhor, explicando o motivo. Prefiro organização por funcionalidade, limites claros entre apresentação, domínio/regras e acesso a dados, e componentes reutilizáveis. Evite pastas genéricas gigantes, duplicação e abstrações sem necessidade.

Compare três caminhos:
1. Evoluir o projeto atual.
2. Reconstruir telas/temas/navegação aproveitando domínio e infraestrutura.
3. Reconstruir integralmente.

Considere regressões anteriores ao trocar cores, acoplamento, qualidade real do código, funcionalidades aproveitáveis, tempo até a apresentação e facilidade de testes. Minha preferência por reaproveitar deve orientar a avaliação, mas não mascarar problemas comprovados.

Não troque stack ou versões automaticamente. Compare a stack real com a proposta no PDF: React Native/Expo/TypeScript, FastAPI/Python, PostgreSQL, autenticação e demais ferramentas. Justifique divergências necessárias. Planeje mobile e web conforme o documento; não transforme o produto em somente um site por conveniência.

## 4. Cobertura funcional e FRDs

Monte matriz de rastreabilidade com os 10 RF, 8 RNF e 14 UC originais, mantendo IDs e prioridades. Inclua também capacidades descritas em modelagem, sequência, protótipos e demais capítulos.

Confira especialmente:
- Cadastro, login, recuperação de senha, sessão, saída e perfil.
- Crianças/estudantes, necessidades específicas e vínculos com responsáveis e professores.
- Avaliação inicial e identificação do nível.
- Atividades realizadas no app e registros de observação feitos pelo adulto.
- Trilhas, tarefas, conclusão, desbloqueio e evolução.
- Recomendações de IA e orientações gerais/individualizadas.
- Criação de atividades, avaliações e orientações pelo professor onde documentado.
- Progresso, histórico e relatórios individuais, bimestrais e coletivos.
- Turmas, escolas e contexto docente.
- Feedback/acompanhamento futuro e demais itens desejáveis.
- Portabilidade, segurança, privacidade, persistência e demais RNFs.

Planos, cobrança, notificações, suporte ou fóruns citados no modelo de negócio precisam de classificação explícita quanto ao escopo do TCC. Não excluir silenciosamente nem construir um produto comercial completo por inferência.

Para cada requisito, informe: fonte, prioridade, situação atual (existente/parcial/simulado/ausente/divergente), evidência, FRD, telas e critério de aceite.

Cada FRD deve conter objetivo, atores e permissões, pré/pós-condições, regras, fluxo principal, alternativas, campos e validações, dados e persistência, estados de interface, acessibilidade, temas, integrações, critérios de aceite, dependências e decisões pendentes.

Não invente rubrica pedagógica, limiares de classificação, fórmula de progresso ou critérios de atenção. Busque no PDF e código, explicite o que encontrou e proponha o que faltar com identificação clara e necessidade de validação pedagógica.

## 5. UX/UI e acessibilidade como diferenciais

Redesenhe as telas para reduzir carga de informação e deixar evidente o próximo passo. Diferencie o contexto de responsável, professor e criança, sem fragmentar o sistema desnecessariamente. Reaproveite conceitos bons do protótipo.

A direção visual é educacional, azul e branco. Não use roxo como identidade principal. Verifique se há identidade visual oficial no projeto; não invente empresa parceira nem tons oficiais.

Especifique:
- Tema claro, tema escuro e opção de acompanhar o sistema.
- Modo de alto contraste, distinto de simplesmente inverter preto e branco.
- Tokens semânticos de cores, tipografia, espaçamento e estados; não espalhar cores fixas pelas telas.
- Fonte ampliável, suporte ao tamanho do sistema, zoom e layouts sem cortes.
- Leitores de tela, rótulos e estados acessíveis, ordem de leitura e foco.
- Navegação por teclado na web, foco visível e diálogos acessíveis.
- Áreas de toque confortáveis; alternativas a arrastar e gestos complexos.
- Instruções curtas, linguagem simples e interface infantil com uma tarefa principal por etapa.
- Apoio de áudio/leitura de instruções com controles claros, repetição e opção de silenciar.
- Alternativas textuais a conteúdos de áudio e cuidado com legendas quando houver vídeo.
- Redução de movimento e ausência de efeitos indispensáveis para entender o resultado.
- Estados compreensíveis sem depender só de cor, som ou ícones.
- Preferências persistidas, com escopo definido por usuário/dispositivo/criança.
- Acesso às adaptações sem exigir diagnóstico e sem bloqueio comercial.

Investigue outras melhorias úteis, mas priorize as demonstráveis e viáveis no prazo. Não crie uma lista enorme de promessas sem especificar como funcionarão.

Quero apoio em Libras. Avalie VLibras na web e uma solução tecnicamente válida para o mobile; não presuma que o script web funciona diretamente em telas React Native. Consulte documentação oficial. Se a integração nativa não for adequada, proponha alternativa concreta para conteúdo essencial, como vídeos em Libras devidamente produzidos/revisados, explicando esforço e cobertura. Não apresente avatar, botão decorativo ou tradução automática como garantia de acessibilidade completa.

Referência inicial do VLibras:
https://vlibras.gov.br/doc/widget/installation/webpageintegration.html

Para cada recurso, indique onde fica, como ativar, como afeta a experiência, cobertura por plataforma, dependências, critério de aceite e como demonstrar na apresentação. Se algo depender de rede, vídeo, serviço ou validação especializada, deixe isso claro.

Use WCAG 2.2 AA como referência para web e valide separadamente o comportamento nativo. Não declare conformidade sem avaliação.

Produza catálogo de telas e wireframes de baixa fidelidade que permitam revisar hierarquia, ações e estados. Inclua carregamento, erro, vazio, sem vínculo, dados insuficientes, salvamento pendente e indisponibilidade da IA. Não basta descrever genericamente “uma tela moderna e acessível”.

## 6. Escolha concreta e uso real de IA

IA é um diferencial central, junto com acessibilidade. A FRD precisa registrar uma escolha concreta de modelo e execução, não apenas “integrar uma IA depois”.

Mapeie cada necessidade do PDF para o que a IA realmente fará: análise assistida do nível, identificação de dificuldades pedagógicas a partir de evidências, recomendações, orientações e apoio a atividades quando fizer sentido. Separe o que é cálculo/regra determinística do que é inferência do modelo. Não use IA para diagnosticar transtornos nem substitua avaliação pedagógica por texto gerado sem critério.

Avalie no máximo três alternativas adequadas ao caso e selecione uma principal, justificando:
- Modelo exato, versão/tag e fornecedor ou runtime.
- API hospedada versus execução local em computador/VM.
- Compatibilidade dos termos com o público infantil e tratamento dos dados.
- Qualidade em português, instruções e respostas estruturadas.
- Custo, cotas e disponibilidade reais.
- Hardware necessário, latência e uso por poucos usuários.
- Capacidade de operar de modo confiável na apresentação.

Como candidato inicial para comparar, avalie Qwen3-4B executado via Ollama no servidor/computador, tag qwen3:4b. É uma hipótese de execução própria, não uma decisão já validada para nosso hardware ou para qualidade pedagógica:
https://huggingface.co/Qwen/Qwen3-4B
https://ollama.com/library/qwen3:4b

Pode recomendar outra opção melhor com fontes oficiais e justificativa. Não confunda Ollama, que executa/serve o modelo, com o modelo em si. Não presuma que pesos sem custo tornam hospedagem gratuita.

Não selecione Gemini automaticamente. Os termos da Gemini API consultados em 22/10/2026 restringiam clientes voltados ou provavelmente acessados por menores de 18 anos. Confira a versão atual e o produto/API específico. Backend e anonimização não resolvem automaticamente restrições de público.

A decisão principal deve ficar registrada. Se hardware, acesso ou credencial impedirem validação, escolha a arquitetura recomendada sob premissas explícitas, registre o bloqueio exato e peça somente o dado que realmente falta. Não invente teste bem-sucedido, desempenho ou compatibilidade.

Detalhe entrada minimizada, saída estruturada validada, referências a conteúdos pedagógicos permitidos, origem/data da análise, revisão humana, timeout, cotas, cache e falhas. IA deve ser acessada pelo backend; não exponha segredos no app.

Na implementação futura, precisamos demonstrar pelo menos uma chamada real que analise dados e gere resultado personalizado. Conteúdo pré-gerado identificado pode apoiar contingência, mas mock não conta como integração real concluída.

Avalie cobertura por modalidade: um modelo textual não deve ser apresentado como reconhecimento de fala, correção de escrita manuscrita, visão ou tradução para Libras. Só inclua capacidades adicionais quando necessárias e com solução concreta.

## 7. Dados fictícios, backend e multiusuário

Identifique onde os mocks estão acoplados às telas e como substituí-los por uma fonte real sem reescrever a interface.

Defina contratos e uma camada de acesso a dados com implementações separadas para mocks e API. Reaproveite essa separação se já existir. Não espalhe condições de demonstração pelas regras de domínio.

Compare de forma objetiva PostgreSQL em VM Oracle e serviço gerenciado como Neon, considerando o ambiente existente, custo real, operação e confiabilidade na apresentação. VM é infraestrutura e Neon é serviço de banco: eles podem ser combinados, por exemplo API em Oracle e banco no Neon. Não trate as opções como mutuamente exclusivas.

Recomende uma topologia concreta e simples, com justificativa. Não provisione nada nesta etapa.

Planeje contas distintas, autenticação, autorização no servidor, vínculos responsável-professor-criança e isolamento de dados. Considere múltiplos adultos autorizados por criança; confronte isso com o modelo do PDF. Conta de professor não deve dar acesso geral aos estudantes.

Preveja integridade e histórico, progresso consistente, gravação sem duplicação e conservação dos dados ao sair/reabrir o app. Diferencie “funciona com mock” de “funciona com persistência e autorização reais”.

Para a apresentação, proponha preparação de dados fictícios coerentes e configuração reproduzível, sem depender de migrações ou criação de conteúdo improvisadas durante a banca.

## 8. Entregáveis e limite desta tarefa

Use a pasta Eleva V2 que eu criar; se já existir, preserve o conteúdo. Nesta etapa ela pode guardar documentação, sem significar que precisamos iniciar um novo aplicativo nela. Mantenha o protótipo original intacto.

Organize documentação enxuta por assunto:
- Visão e escopo consolidado.
- Auditoria do projeto e recomendação de reaproveitamento.
- Matriz de rastreabilidade.
- Decisões e pendências.
- FRDs por funcionalidade.
- Arquitetura proposta e estrutura por features.
- UX, fluxos, telas, estados, temas e acessibilidade.
- Decisão de IA com modelo/runtime, contratos e verificação planejada.
- Dados, API, persistência, multiusuário e ambiente.
- Plano incremental, roteiro de testes e demonstração da banca.

Inclua roteiro que mostre: entrar com contas distintas; cadastrar/vincular criança; avaliar; executar atividade; salvar e recuperar progresso; apresentar relatório; gerar análise/recomendação real de IA; alternar temas e alto contraste; ampliar fonte; demonstrar apoio de leitura e a solução de Libras nas plataformas efetivamente suportadas.

Sua tarefa agora é inspecionar, pesquisar o necessário e escrever a especificação. Não implemente nem refatore o produto, exclua arquivos, altere banco, publique, faça commits ou contrate serviços. Você pode criar documentos e wireframes na pasta indicada e registrar evidências de verificações de leitura ou testes existentes que não alterem dados reais. Não baixe modelos grandes nem instale serviços para esta análise sem necessidade definida.

Prossiga nos pontos independentes sem parar por decisões rotineiras. Se surgir uma informação realmente bloqueante, reúna as poucas perguntas essenciais e continue o restante. Não conclua apenas com perguntas ou um plano: entregue os documentos que já puder produzir.

No retorno final, diga de forma simples:
1. Se recomenda aproveitar o projeto, reconstruir a apresentação ou refazer tudo, e por quê.
2. Quais funcionalidades do PDF faltam ou estão simuladas.
3. Qual arquitetura será seguida.
4. Qual modelo de IA e execução foram recomendados e o que foi realmente validado.
5. Quais recursos de acessibilidade serão implementáveis e demonstráveis.
6. Como os mocks serão substituídos por persistência real.
7. Quais decisões dependem de mim ou de validação pedagógica.

Não declare cobertura funcional integral com base apenas na existência das FRDs. Distinga especificação concluída, implementação existente, simulação, teste executado e validação pendente.
