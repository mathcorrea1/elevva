# Elevva — acessibilidade e decisão de Libras

**Verificação posterior — 19/11/2026:** no navegador, widget/player web carregaram e uma tradução foi solicitada; o serviço cancelou por demora/ausência de dados, com entrada do dicionário retornando404. Nenhuma tradução concluída foi comprovada; não há validação nativa ou vídeo revisado. Em amostras da aplicação, foram exercitados contraste independente, fonte150%/320px sem transbordamento horizontal, diálogo único com foco contido/Escape/retorno e Ouvir/Parar/Repetir com vozes PT-BR. Isso não declara conformidade WCAG nem inteligibilidade avaliada por usuário. [Evidências e limites atuais](24-implementacao-ux-integrada.md).

**Corte:19/11/2026.** Apoio complementar em validação. Lumi orienta visualmente; não interpreta Libras. Integração não equivale a tradução concluída ou conformidade.

## Alternativas e decisão

| Alternativa | Avaliação | Decisão |
|---|---|---|
| A. VLibras em documento web isolado | Widget HTML documentado; depende de rede/player/WebGL. React Native não é DOM traduzível automaticamente | Web parcialmente implementada para trecho consentido. WebView Android experimental, condicionada a teste |
| B. Serviço/SDK externo/API | Exige contrato, licença, custo/cotas, privacidade e prova por plataforma. Endpoint de glosa/vídeo não prova SDK React Native | Não contratado/integrado; nenhum preço, SLA, gratuidade ou SDK alternativo comprovado |
| C. Avatar próprio ou vídeos revisados | Avatar exige linguística/expressões/validação complexas; vídeos essenciais oferecem cobertura delimitada com profissionais/direitos | Não construir intérprete próprio agora; player/manifesto de vídeos revisados preparado, sem arquivos entregues |

[Instalação oficial web](https://www.vlibras.gov.br/doc/widget/installation/webpageintegration.html): script inicializa widget automaticamente. O [guia mobile](https://vlibras.gov.br/files/Dev_VLibras_CrossPlatform_App.pdf) apresenta Ionic/Unity, sem provar SDK React Native. [Apresentação do Governo Digital](https://www.gov.br/governodigital/pt-br/acessibilidade-e-usuario/vlibras): tradução automática não substitui atuação humana. Não apresentar Lumi como avatar/intérprete oficial do fornecedor.

## Ativação e cobertura

Botão acessível no cabeçalho abre sheet; entrada pública/onboarding também oferecem ajuda. Tópicos: navegação, aulas, relatórios e configurações. Conteúdo elegível da aula pode registrar texto/instrução, sem gabarito ou dado privado.

Operador confere trecho e consente envio. Não há varredura do DOM privado ou envio automático do relatório/perfil. Limite1.800 caracteres e bloqueios de contatos/documentos/links reduzem exposição, mas **não garantem anonimização**. Texto livre exige conferência; não enviar nome de estudante, escola, diagnóstico ou relatório. A tradução de instrução não pode revelar resposta nem alterar silenciosamente habilidade avaliada.

O documento recebe apenas o fragmento por mensagem; texto permanece disponível na falha. Troca de conta limpa contexto. Salvar atividade/login não dependem do widget. Arquivos: `alfabeta/public/libras-frame.html`/`.js`, `features/accessibility/GlobalLibras.tsx`, `translation.ts` e testes.

## Segurança e plataformas

Web local: app em `http://localhost:8081`; frame em `http://127.0.0.1:8081/libras-frame.html`, origens diferentes no mesmo processo Expo. Sandbox permite scripts e origem própria, separada da aplicação, API e identidade; sem dados na URL.

Release requer `EXPO_PUBLIC_LIBRAS_FRAME_URL` em origem pública HTTPS exclusiva, sem cookies privados; não basta outro caminho na mesma origem. Domínio/cookies e implantação exigem revisão adicional.

Android: wrapper WebView com cookies compartilhados desabilitados/incógnito, condicionado a `EXPO_PUBLIC_LIBRAS_WEBVIEW_ENABLED=true` e URL HTTPS acessível ao aparelho. **Desativado por padrão e não validado em APK.** Script web não é executado diretamente em views RN. iOS exige prova separada.

## O que foi observado

Ensaios desta retomada observaram trecho no frame, bloqueio de leitura do documento pai, ausência de cookies no frame público, botão e carregamento do player/canvas. Carga inicial observada da ordem de20MB; houve mensagens do fornecedor sobre políticas de sensores. Não é benchmark ou tamanho fixo garantido.

**Tradução completa em avatar e compreensão linguística não ficaram comprovadas.** Tentativa inicial com origem opaca prejudicou comunicação e foi substituída por origem pública distinta. Atualizações de tela também prejudicaram a captura: `evolucao-v5-libras-web.png` é provisória e não deve comprovar Libras. Não há teste Android/iOS ou vídeo revisado entregue.

## Vídeos essenciais e critérios de aceite

Oito temas propostos: entrar/voltar/ajuda; escolher estudante autorizado; abrir trilha; navegar aula; responder/tentar novamente; pausar/salvar/continuar; ouvir/parar/operar sem áudio; configurações. É meta de cobertura, não lote produzido ou obrigação original inferida.

Cada arquivo precisa de texto-base, MP4/URL, duração/versão, descrição textual/legenda aplicável, licença/direitos, identificação autorizada de tradução/interpretação e revisão linguística. Buscar profissionais e pessoa surda fluente; não inventar nomes ou aprovação. Não incluir dados privados em vídeo público.

| Recurso | Aceite | Situação |
|---|---|---|
| Entrada web | Teclado abre/fecha e foco retorna; só trecho escolhido chega ao player; sem sobreposição crítica | Validação de URL/texto testada; ensaio de fluxo/foco ainda parcial |
| Tradução web | Player carrega e traduz trecho conhecido; controles operáveis e significado revisado | Não concluído |
| WebView Android | APK real, cookies/rede/navegação/fonte/TalkBack; tradução operável sem bloquear atividade | Não executado; flag desativada |
| Vídeos web/Android | Mídia real/revisada/licenciada, controles, descrição e falha; sem autoplay | Estrutura sem mídia |
| iOS | Validação própria | Não executado |

Na banca mostrar apenas cobertura validada até a data. Ajuda textual/player inicializado demonstram etapa técnica parcial; não Libras finalizada. [WCAG2.2](https://www.w3.org/TR/WCAG22/) orienta web, sem conformidade presumida; avaliação assistiva e linguística são distintas.

Outras adaptações: Perfil→Configurações reúne claro/escuro/sistema, contraste independente, texto ampliado e movimento reduzido; tokens/semântica, teclado e alternativas ao arrastar. Leitura PT-BR usa Ouvir/Parar/Repetir conforme aparelho, mantendo texto; não inventa pausa nativa. Verificações web anteriores em320px/fonte/contraste/teclado não equivalem a TalkBack ou auditoria integral.

Pendências: D03 pedagogia; D05 mídia/revisão Libras; D13/D15 privacidade/termos/dados reais; aparelho/APK, rede e origem pública final. Nenhuma se resolve por exibir avatar ou usar conta adulta.
