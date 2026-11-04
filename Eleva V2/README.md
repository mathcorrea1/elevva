# Eleva V2 — documentação e implementação

**Entrega atual de aulas:** [construtor, cinco mecânicas, compartilhamento, estudantes e verificações](17-construtor-aulas-e-compartilhamento.md). [Galeria atual da interface real](evidencias/aulas-v4-galeria.html). O fluxo anterior de catálogo/mapa/relatórios está no [registro 16](16-trilhas-aulas-investigacao.md). Esses adendos descrevem a implementação incremental; não encerram D03/D15 ou comprovam APK/IA live.

**Revisão de jornadas de 29/10:** [implementação, provas e limites atuais](15-revisao-ux-jornadas.md), [capturas dos dois painéis/trilha/relatórios/perfil](evidencias/ux-jornadas-galeria.html). Esta revisão substitui a navegação antiga dos documentos 06/13; mantém prioridades acadêmicas e pendências pedagógicas/contratuais.

**Estado em29/10/2026:** [carga completa de revisão e pendências](14-revisao-com-seeds.md). Para rodar, execute `iniciar-eleva.ps1` na raiz e abra http://localhost:8081. Os [acessos atuais](../identity/ACESSOS-TESTE.local.md) usam contas sintéticas novas; contas anteriores foram preservadas.

**Implementação iniciada na raiz existente `alfabeta/`.** Consulte o [checkpoint do código](11-implementacao-e-checkpoint.md), a [rastreabilidade atual](12-rastreabilidade-implementacao.md) e o [guia para abrir/testar](../DESENVOLVIMENTO.md). A direção de identidade agora é Better Auth por pedido posterior do usuário; Clerk da revisão0.2 foi superado. Documentos de especificação abaixo não são declaração de implementação integral.

**Revisão visual mobile:** [mudanças e limites](13-revisao-ux-mobile.md), [capturas da aplicação](evidencias/premium-galeria.html) e [dois acessos locais](../identity/ACESSOS-TESTE.local.md). O arquivo de acessos contém apenas contas sintéticas locais e é ignorado pelo git.

Referência: **22/10/2026**, America/Sao_Paulo. Revisão documental **0.2**. **Especificação elaborada; decisões pedagógicas, contratuais e operacionais ainda abertas. Não é uma declaração de implementação ou conformidade.**

**Mudança de direção confirmada:** API pronta, sem treinar modelo e sem servidor no computador da empresa. Proposta atual: VM Oracle elegível para FastAPI, Neon para dados e Groq Free `openai/gpt-oss-120b` para prova adulta com perfis fictícios. Liberação infantil/qualidade/contas ainda pendentes. Leia [revisão0.2](10-revisao-api-e-acompanhamento.md), [decisão de IA](07-ia.md) e [rascunho de instruções Markdown](ia/instrucoes-analise.md). A proposta anterior Qwen/Ollama foi substituída e preservada no ZIP histórico.

Recomendação: reconstruir gradualmente **telas, tema e navegação**, aproveitando React Native/Expo/TypeScript, componentes úteis, fachadas de serviços e conceitos de domínio. Corrigir regras e contratos antes de reutilizá-los. Não há justificativa comprovada para reescrever tudo.

## Ordem de leitura

1. [Visão e escopo](01-visao-escopo.md).
2. [Auditoria e comparação de caminhos](02-auditoria.md).
3. [Rastreabilidade: 10 RF, 8 RNF, 14 UC e capacidades adicionais](03-rastreabilidade.md).
4. [Decisões, conflitos e pendências](04-decisoes.md).
5. [Arquitetura e organização por features](05-arquitetura.md).
6. [UX, catálogo, estados, temas e acessibilidade](06-ux-acessibilidade.md).
7. [IA: decisão, contratos e validação](07-ia.md).
8. [Dados, API, segurança e ambiente](08-dados-api-ambiente.md).
9. [Plano, testes e roteiro da banca](09-plano-testes-banca.md).
10. [FRDs e regras comuns](frds/00-regras-comuns.md); [wireframes navegáveis locais](wireframes/index.html) e [versão textual](wireframes/catalogo.md).
11. [Revisão: API pronta e acompanhamento por evidências](10-revisao-api-e-acompanhamento.md).

## FRDs

| Documento | Responsabilidade |
|---|---|
| [F01](frds/F01-contas.md) | Cadastro, login, recuperação, sessão, saída e perfil |
| [F02](frds/F02-criancas-vinculos.md) | Crianças, necessidades, convite, concessão e revogação de acesso |
| [F03](frds/F03-avaliacao.md) | Avaliação inicial e reavaliação, evidências e nível |
| [F04](frds/F04-atividades-observacoes.md) | Atividade no app e registro pelo adulto |
| [F05](frds/F05-trilhas.md) | Trilhas, tarefas, conclusão e desbloqueio |
| [F06](frds/F06-analise-ia.md) | Análise, recomendações e revisão humana |
| [F07](frds/F07-conteudo-docente.md) | Orientações gerais, individuais e autoria docente |
| [F08](frds/F08-relatorios.md) | Histórico, progresso, relatórios individuais/bimestrais/coletivos |
| [F09](frds/F09-contexto-docente.md) | Escola, turma e acompanhamento docente |
| [F10](frds/F10-preferencias-acessibilidade.md) | Preferências, temas, leitura e Libras |
| [F11](frds/F11-feedback.md) | Feedback e participação futura, desejáveis |

## Registro histórico da análise inicial — não representa a execução atual

Leitura integral do texto das 63 páginas via `Eleva-TCC.md`; abertura das figuras 21–29 individualmente e das demais em pranchas de contexto; conferência visual do PDF original nas tabelas das páginas físicas 28 e 38. As outras páginas de tabelas renderizadas ficam como evidência de apoio, sem alegação de revisão visual integral do PDF. As referências neste pacote usam **página física**, seguidas da impressa quando útil (da física 13 em diante: impressa = física − 6).

`ModeloEntregaFinal (1)(2).pdf` **não foi encontrado com esse nome**. A cópia `alfabeta/Eleva-para-Codex/Eleva-TCC-original.pdf` está acessível e tem 63 páginas; não foi possível comparar os hashes com o arquivo de nome original ausente. Não foi localizado `AGENTS.md` no workspace ou nos diretórios ancestrais pesquisados.

Inspeção estática do código atual; TypeScript e lint aprovados. Jest: uma suíte aprovada e duas falhas antes da execução dos testes de Button. Abertura do **dist preexistente**, datado de 04/05/2026: travou no splash por SecureStore; não equivale a executar o código atual. Não foram feitos build nativo, teste com crianças, avaliação assistiva completa, chamada de IA, conexão a banco ou verificação de uma conta de nuvem.

O aplicativo e as sete alterações prévias foram preservados. Não houve instalação de serviços/modelos, refatoração, commit, publicação ou provisionamento. [Evidências](evidencias/LEITURA-E-VERIFICACOES.md), [contraste dos tokens](evidencias/contraste-tokens.md) e [manifesto de hashes](evidencias/manifesto-leitura.json) permitem conferir a origem desta análise.

O usuário confirmou demonstração em APK Android e web neste computador, em aproximadamente um mês, sem data fechada. Não existe VM nem revisão pedagógica/Libras disponível no momento. O plano registra essas dependências e não exige contratar nuvem para começar.

## Convenção de evidência e conclusão

**PDF** = requisito original; **CÓD** = comportamento observado no código; **USU** = pedido atual; **PROP** = solução recomendada, ainda não aprovada pelo usuário; **PEND** = decisão/validação necessária. Uma FRD descrita não torna um requisito implementado. Status funcionais constam na matriz e só deverão mudar com evidência de implementação e teste integrado.
