# Atalhos de IA e Libras — implementação e prova web

Corte posterior de 19/11/2026, sobre `4d27907`. Complementa o [registro24](24-implementacao-ux-integrada.md); não declara o aplicativo integralmente homologado. [Capturas atuais](evidencias/atalhos-galeria.html) · [recibo](evidencias/atalhos-verificacao.json).

## Comportamento implementado

- Dois botões fixos de52×52, apenas ícones: mão para Libras e brilhos para IA. Nomes assistivos, foco visível, indicação de foco/estado e cores dos temas continuam disponíveis. Na web, o título do botão também identifica seu propósito.
- Presentes nos cinco destinos autenticados e nas suas telas internas. IA abre o hub existente no contexto da aba ativa; Voltar recupera a tela anterior. Formulário não salvo no construtor foi preservado ao abrir/voltar da IA e ao abrir/fechar Libras.
- Durante execução da aula/atividade, permanece **somente Libras**. IA e recursos adultos continuam fora do executor infantil, conforme o escopo anterior. Não há chamada automática ao modelo nem classificação por tocar no ícone.
- Os atalhos ficam acima da navegação; a cena reserva76px para evitar cobrir formulários, listas ou o rodapé de confirmação da aula. A posição acompanha a altura medida da barra, inclusive quando ela quebra em duas linhas. Desktop usa o canto inferior direito.
- Não aparecem em login/cadastro/recuperação. As boas-vindas conservam seu próprio apoio público em Libras. Ao sair da conta, os atalhos autenticados somem. Metadados do destino ativo são reiniciados na troca de sessão.
- O código oculta os atalhos durante teclado virtual detectado e recupera o espaço da cena. Comportamento nativo ainda exige validação no Android; não foi deduzido do navegador.
- Foram removidos os botões duplicados de Libras dos cabeçalhos internos e do construtor. Configurações de aparência/leitura continuam no Perfil.

## VLibras: o que foi comprovado agora

O acionador flutuante abre o painel existente. Somente o trecho explicitamente escolhido/revisado e consentido segue para um documento público em **outra origem**, sem capturar a tela privada, nomes, relatórios ou respostas do app.

No painel do player, o novo botão **Traduzir trecho** aciona o clique no fragmento público. Isso evita exigir que o usuário clique em uma pequena região do texto encoberto pelo próprio widget em telas estreitas. O launcher usa a referência pública `window.VLibrasWidget.initBtn`, [documentada pelo fornecedor](https://vlibras.gov.br/doc/widget/installation/webpageintegration.html); o texto é acionado pelo [fluxo de seleção descrito no manual](https://vlibras.gov.br/doc/widget/functionalities/text-translation.html). Não foi adicionada API de tradução privada, captura de DOM do app ou intérprete próprio.

**Prova técnica pela interface do Eleva:** abrir o ícone → informar `Bom dia` → consentir → abrir o player → aguardar o avatar → Traduzir trecho. O serviço oficial retornou HTTP200 com glosa **`BOM DIA`**; foram observados reprodução no canvas e quadros diferentes da animação. Houve tradução textual real e reprodução do avatar para esse trecho público curto. Isso supera a ausência de prova positiva do corte24, sem apagar a tentativa anterior que expirou/retornou404 para outra entrada.

Essa evidência **não demonstra precisão linguística**, cobertura do conteúdo pedagógico inteiro, disponibilidade contínua ou acessibilidade completa do widget. Continua necessário revisar a qualidade com pessoa qualificada. Não é reconhecimento de fala nem tradução de imagens. O painel informa dependência de rede e permite tentar novamente; texto permanece disponível.

No Android, o botão/painel estão implementados, porém o widget em WebView continua experimental e desabilitado por padrão. Player/manifesto de vídeos revisados permanecem sem mídia. **Não declarar Libras nativa concluída.** D03/D15 e revisão profissional de Libras não foram encerradas.

## Verificações deste incremento

- Cinco abas principais: ambos os ícones presentes e acima da navegação.
- Libras por Enter abre um único diálogo; Escape fecha e devolve foco ao atalho.
- IA abre o hub; responsável não recebe ação docente de autoria. Login e pós-logout não têm os atalhos autenticados.
- Aula de Theo retomada: Libras abriu/fechou; IA não estava presente; botão de confirmação e atalho não se sobrepuseram. Aula pausada novamente sem entregar respostas adicionais.
- 320px com fonte150% e alto contraste: sem transbordamento horizontal do documento; ícones acima da barra em duas linhas. Desktop1280px também capturado.
- Testes do novo bridge verificam origem/janela do pai, consentimento e recusa de contato; acionamento fica restrito ao fragmento público. Testes dos atalhos verificam destinos separados e contexto infantil sem IA.
- **33 testes frontend/19 suítes**, type-check, lint e sintaxe do script público aprovados; exportações web e Android/Hermes atuais aprovadas. Os70 testes backend do corte24 permanecem a referência; não houve alteração no backend neste incremento.
- Adicionados apenas tipos de desenvolvimento do Node22 (`@types/node`22.10.2) para tipar o teste do documento público executado em VM de teste. Não houve atualização geral da stack ou instalação de serviço.

## Estado de prontidão

Foi usado o aplicativo de verdade em percursos completos e corrigidos erros concretos. Não foi realizada uma auditoria exaustiva de todas as telas, combinações, volumes e plataformas; testes automatizados não equivalem a essa homologação. Permanecem ambiente remoto/SMTP/Groq live, montagem e teste de APK, avaliação assistiva em aparelhos, revisão pedagógica/Libras e autorização para público real. Não resumir a situação como “só conectar e está100% pronto”.
