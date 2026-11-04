# Trilhas e investigação pedagógica · checkpoint de implementação · 29/10/2026

## Etapa anterior concluída tecnicamente

O pedido de catálogo → trilha → mapa de aulas → questões → resultado foi integrado ao aplicativo existente. Não equivale a homologação pedagógica, conformidade completa ou implantação remota. A ampliação seguinte, com construtor por telas, cinco mecânicas e compartilhamento, foi implementada e validada localmente no [checkpoint 17](17-construtor-aulas-e-compartilhamento.md), que registra também as pendências externas.

- Autoria de trilhas com capa, cenário independente, imagem por aula, ordem por controles acessíveis, objetivo/instrução normal/curta, questões objetivas ou conteúdos da biblioteca e regras explícitas de disponibilidade/conclusão.
- Upload real: PNG/JPEG/WebP estático até 2 MB/12 megapixels; Pillow 13.0.0 verifica/decodifica, aplica orientação, reduz até 1024 px, regrava PNG sem metadados. Imagem no banco com leitura autenticada; conteúdo curricular compartilhado e imagens de versões atribuídas têm regras próprias de acesso. Não é armazenamento público de fotos de estudantes.
- Modelos e revisões de trilhas, percursos por estudante e aulas sobre `learning_stages`; tentativas e respostas antigas mantidas. Alterações do autor não modificam o percurso já atribuído. Nova versão pode criar novo percurso mediante ação explícita.
- Mapa vetorial contínuo com curvas, imagens distintas como protagonistas dos nós, cenário decorativo, próxima aula localizável, quatro estados e lista alternativa. Não é mapa raster com botões presos na imagem.
- Executor: uma questão, confirmar/salvar, rever/editar antes da entrega, pausar com opção de salvar seleção, retomar e entregar. Questões opcionais não respondidas não recebem zero. Resultado = acertos/itens respondidos corrigíveis; sem nota geral de alfabetização. Regra de avanço padrão = obrigatórias entregues; percentual extra somente explícito. Nova tentativa após falha de critério preserva entrega anterior; concluída exige nova atribuição para prática posterior.
- Comparações usam primeira entrega por atribuição, mesmo conteúdo/versão/item e apoios registrados. Demais tentativas continuam no histórico; não se infla a comparação usando melhor resultado. Sem dados equivalentes, comparação indisponível, sem zero fictício.
- Relatórios abrem panorama do contexto/família antes de selecionar estudante; escola/turma/período e estudante/nível/habilidade/apoio são filtros combináveis. Níveis confirmados, sem avaliação e sem confirmação são estados distintos. Prazo de reavaliação não aprovado fica nulo, com datas expostas.
- Investigação individual conecta respostas, erros registrados, habilidades informadas pelo autor, apoios, avaliações, observações, turma comparável e ações de próximo passo. Alertas são pendência factual ou marcação humana, sem ranking/diagnóstico/limiar inventado.
- Comunicação/informações sensíveis da criança estão em recurso próprio; gestor pode conceder/revogar compartilhamento por vínculo. Preferências de apresentação são independentes do adulto e não afetam nota. Dados restritos não entram no snapshot da IA.

## Evidência executada

35 testes de backend passaram (incluem mídia, versões, atribuição idempotente, edição/reentrega, comparação, filtros e privacidade). 17 testes frontend em 10 suítes passaram, incluindo pausa/retomada/edição/entrega. TypeScript e lint passaram. Exportações web/Android são verificadas novamente a cada etapa pertinente; não são APK instalado.

Pela interface com Better Auth local real, professora P criou `Jornada de autoria · teste de interface`: capa enviada ao servidor, aulas `Um novo encontro` e `Palavras num barquinho`, imagens borboleta/barquinho e questões executáveis. A aula foi atribuída a Lia; seleção foi salva ao pausar, recuperada após recarregar e entregue. Panorama → filtro de habilidade → investigação de Lia com turma autorizada funcionou. Dados são inteiramente fictícios, persistidos no SQLite de desenvolvimento. Nenhum serviço remoto/conta foi provisionado.

Capturas: `evidencias/trilhas-v3-catalogo.png`, `trilhas-v3-mapa.png`, `trilhas-v3-aula.png`, `trilhas-v3-panorama.png`, `trilhas-v3-individual.png`. Não são capturas de APK.

## Fontes e decisões

PDF/TCC: RF004/RF007 e UC de execução, progresso e relatório continuam referências; não se atribui a eles retroativamente o catálogo ilustrado, percentual configurável, marcos operacionais ou formato específico de aula. Estes são detalhamentos de produto pedidos nesta conversa. F02–F10 recebem adendos para manter essa distinção.

Base técnica do upload: [Pillow Image](https://pillow.readthedocs.io/en/stable/reference/Image.html) e [Expo ImagePicker](https://docs.expo.dev/versions/v53.0.0/sdk/imagepicker/). A web usa seletor de arquivo próprio por adaptador; Android conserva o seletor Expo. Validações no servidor permanecem obrigatórias.

## Pendências externas preservadas

D03/D14: currículo, instrumentos, rubricas, habilidades e critérios pedagógicos. D05: vídeos em Libras produzidos/revisados e direitos. D13/D15: privacidade/termos para dados reais e público infantil. Groq continua sem chave/prova live; Neon/VM/HTTPS/SMTP não configurados. APK, TalkBack, voz real e iOS continuam com validação separada. Estas pendências não impedem desenvolvimento e testes sintéticos.

## Ampliação seguinte autorizada, ainda em execução

Construtor visual de telas de aula, mecânicas além de escolha única, reutilização/compartilhamento entre professores, atribuição em lote, nomenclatura Estudantes, cadastro estruturado de informações e listas paginadas. Preservar implementações acima e normalizar referências a versões compartilhadas, em vez de copiar novamente aulas em cada atribuição. Não confundir esta lista com funcionalidades já concluídas.
