# Registro de leitura e verificações

Referência22/10/2026. Revisão documental/técnica local; nenhum serviço provisionado.

## Fontes locais

- `alfabeta/Eleva-para-Codex/Eleva-TCC.md`: lido integralmente em blocos, páginas físicas01–63, incluindo elementos iniciais, contexto, Canvas, pesquisa, precificação, gestão, requisitos/modelagem, protótipos, proposta e referências.
- `Eleva-TCC-original.pdf`: aberto via PyMuPDF existente no ambiente,63 páginas. Renderizadas27/28/37/38/39 em `evidencias/`; páginas28 e38 abertas visualmente para conferir continuação do plano Institucional e prioridades/tabelasRF/RNF. Não se alega leitura visual de todas as páginas do PDF.
- `ModeloEntregaFinal (1)(2).pdf`: não localizado com esse nome; pacote afirma cópia idêntica, mas não há segundo arquivo para conferência de hash.
- Figuras21–29: abertas individualmente a partir de `pdf-40`, `49`, `51`, `52`, `53`, `54` (duas) e `55` (duas), versões originais. Demais20 imagens examinadas em duas pranchas `figuras-contexto-1/2.jpg`; úteis para personas, negócio, pesquisa, cronograma e SWOT.
- LEIA-ME/prompt do pacote, README, PROPOSTA-DESENVOLVIMENTO-TCC e partes pertinentes de TCC-DIAGRAMAS-E-MODELOS consultados. Documento convertido não foi tratado como nova FRD.
- `AGENTS.md`: busca por arquivos no workspace e nos ancestrais da raiz não localizou instruções aplicáveis. Nenhuma instrução de delegação encontrada; trabalho sem subagentes.

Fig.21 associa atores de modo diferente dos UC; classes/DER mostram relação de um adulto para muitos estudantes; sequência explicita API/Mock. Protótipos mostram criação docente, avaliação, necessidades e bimestres; texto do capítulo8 também sustenta essas capacidades. Não se usou botão isolado para impor editor de rubrica, cobrança ou plataforma escolar completa.

Há divergências editoriais na associação de legendas/gráficos da pesquisa: versões originais em pp.23–24 aparecem em ordem diferente de algumas referências no texto, além de remissões equivocadas (ex.: Figura8 em parágrafo sobre ferramentas). Os dados de pesquisa contextualizam prioridade de produto; não foram convertidos em limiares pedagógicos ou novos RF. Matriz mantém os32 IDs normativos originais.

## Git e integridade

HEAD lido: `3d9c7f3` — “adicionando aplicativo mockado prototipo”. Estado inicial tinha7 arquivos modificados:

```text
alfabeta/App.tsx
alfabeta/src/navigation/RootNavigator.tsx
alfabeta/src/screens/Dashboard/DashboardScreen.tsx
alfabeta/src/screens/Profile/ProfileScreen.tsx
alfabeta/src/store/app.store.ts
alfabeta/src/theme/colors.ts
alfabeta/src/utils/constants.ts
```

Também existiam `Eleva-para-Codex/` e `PROPOSTA-DESENVOLVIMENTO-TCC.md` não rastreados. Não houve checkout/reset, commit, edição de código ou exclusão. Manifesto de hashes cobre arquivos fonte/config/docs do projeto, excluindo dependências e diretórios gerados, e registra estado inicial no momento da captura. Comparação final fica em `verificacao-final.json`. Arquivos de ferramenta de navegador podem estar em `.playwright-mcp`; não são alterações do produto.

## Comandos executados e resultado

| Verificação | Resultado real |
|---|---|
| `npm run type-check` | Exit0; `tsc --noEmit` |
| `npm run lint` | Exit0; ESLint sem correções automáticas |
| `npm test -- --runInBand --watch=false --no-cache` | Exit1;3 suítes:1 aprovada (Input),2 falhas (Button duplicado);1 teste executado/aprovado |
| Jest diagnóstico | Colisão `expo-template-bare-minimum` em tmpcheck/package e tmpcheck2/package; import ES module de expo-linear-gradient não processado pelo preset/config; não corrigido nesta tarefa |
| `python -m http.server 8765 --bind 127.0.0.1 --directory alfabeta/dist` | Serviu artefato preexistente de04/05/2026, sem recompilar; encerrado após inspeção |
| Navegador nesse dist | Splash persistente; `TypeError: n.default.getValueWithKeyAsync is not a function` em SecureStore;404favicon e warning expo-av. Screenshot `prototipo-dist-splash.png` |
| Inventário local | i5-12450HX, RAM16.890.322.944bytes; `nvidia-smi`: RTX3050 Laptop6GB,6144MiB |
| Ollama | Não encontrado no PATH; sem listener11434 no levantamento; não instalado/baixado/ensaiado |

O dist antigo não corresponde necessariamente à árvore atual; storageService atual tem ramo web. Não se contornou o erro alterando o produto e não se concluiu teste das telas internas atuais por navegador. Auditoria de fluxo é estática e cotejada com as figuras do TCC. Não executados: builds atuais Android/iOS, banco/API/auth reais, chamada Gemini/Qwen/STT, testes assistivos nativos/web completos, desempenho de modelo ou conformidade WCAG.

## Verificação dos documentos produzidos

Os24 wireframes foram carregados no navegador, com nove opções de estado e filtro infantil limitado a T11/T12/T13/T23. Composição mobile390px e web1280px não apresentaram overflow horizontal no levantamento; exemplos foram capturados em PNG nesta pasta. Foi verificada a troca das nove opções e a renderização dos cartões; não se testou aplicativo funcional por esses controles, que são documentação. Os wireframes podem ser abertos diretamente por `wireframes/index.html`, sem servidor ou dependências externas.

Foram calculados36 pares de contraste sRGB das quatro paletas propostas: todos superaram a meta do par no cálculo registrado em `contraste-tokens.md`. Não foram avaliadas combinações implementadas, todos os estados ou conformidade WCAG. Links locais, quantidade de IDs originais e preservação de hashes do projeto constam na verificação final. Navegador e servidores temporários de inspeção encerrados ao finalizar.

## Fontes oficiais externas

Consultadas por navegação nesta tarefa, referência22/10/2026, fatos vinculados nos documentos específicos: [Qwen](https://huggingface.co/Qwen/Qwen3-4B), [Ollama4B](https://ollama.com/library/qwen3:4b), [Ollama8B](https://ollama.com/library/qwen3:8b), [schema](https://docs.ollama.com/capabilities/structured-outputs), [chat](https://docs.ollama.com/api/chat), [Gemini termos](https://ai.google.dev/gemini-api/terms), [preços](https://ai.google.dev/gemini-api/docs/pricing), [cotas](https://ai.google.dev/gemini-api/docs/rate-limits), [Neon](https://neon.com/pricing), [Oracle](https://docs.oracle.com/en-us/iaas/Content/FreeTier/freetier_topic-Always_Free_Resources.htm), [Clerk Expo](https://clerk.com/docs/expo/getting-started/quickstart), [Clerk preços](https://clerk.com/pricing), [VLibras web](https://vlibras.gov.br/doc/widget/installation/webpageintegration.html), [mobile](https://vlibras.gov.br/files/Dev_VLibras_CrossPlatform_App.pdf), [Governo](https://www.gov.br/governodigital/pt-br/acessibilidade-e-usuario/vlibras), [WCAG2.2](https://www.w3.org/TR/WCAG22/), [RN0.79](https://reactnative.dev/docs/0.79/accessibility), [Expo Speech53](https://github.com/expo/expo/blob/sdk-53/docs/pages/versions/v53.0.0/sdk/speech.mdx), [Expo Video53](https://github.com/expo/expo/blob/sdk-53/docs/pages/versions/v53.0.0/sdk/video.mdx), [LGPD](https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709.htm).

URLs antigas de preços Gemini sem `/docs` falharam; a versão com `/docs` foi acessada. URLs Expo da versão53 redirecionaram para latest; usou-se o branch oficial53 para referência histórica. Versões de biblioteca/runtime ainda serão fixadas na implementação; consulta de documentação não é teste de integração.
