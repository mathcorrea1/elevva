# F06 — Análise assistida, recomendações e revisão

## Adendo vigente — aulas e gestão de estudantes, 29/10/2026

Respostas escritas novas e categorias restritas não são enviadas à IA. Snapshot inclui IDs/versões/resultados corrigíveis ou pendentes; sugestão, revisão e nível confirmado são separados. Groq `openai/gpt-oss-120b` continua no backend, sem Ollama/treinamento. Não houve chamada live sem chave; transporte substituído em teste não encerra RF005/RF006 ou D03/D15. [Fluxos, contratos, evidências e limites](../17-construtor-aulas-e-compartilhamento.md). Este adendo atende pedidos atuais; não altera prioridades acadêmicas originais.

---

## Objetivo, fontes e situação

Gerar orientação individual a partir de evidências e manter controle humano. **PDF** RF005/006/009 O, UC006/007/009 NI (pp.37–44), contexto pp.13–18 e restrição pedagógica p.37. **CÓD** E08/E09: serviços Gemini/STT no cliente, parse/fallback sem validação, recomendações fictícias. Situação: parcial/simulada, **sem chamada real validada** nesta tarefa. **USU** revisado: API pronta, sem treinamento/servidor no computador da empresa e custo zero prioritário. **PROP0.2** GroqCloud Free, `openai/gpt-oss-120b`, backend FastAPI em VM Oracle elegível, conforme [decisão completa](../07-ia.md). Prova inicial adulta com dados fictícios; liberação infantil real pendente D15.

## Atores/permissões; pré/pós

Adulto com vínculo solicita e lê; revisor conforme escopo aceita/edita/rejeita; criança não conversa com modelo. Pré: evidências autorizadas, corpus e instrumento versionados, dependência IA pronta e cota disponível. Pós: execução rastreável com saída validada ou falha explícita; recomendações revisadas publicadas; nível só muda por confirmação F03.

## Campos, validações e regras

Cliente envia purpose e IDs de evidências; backend minimiza e monta prompt, não aceita prompt arbitrário de criança. Saída status/suggestedLevel/evidenceIds/observations/recommendations/guidance/limitations; schema fechado, IDs permitidos, limites e nulabilidade conforme07-ia. Origin live/cached/pregenerated, data/provider/modelId/requestId/prompt/instrumentVersion e revisor são envelope do servidor; versão hospedada só se efetivamente exposta.

Sem diagnóstico ou alegações de visão/STT/Libras. Dados insuficientes→nível null; não fazer parse por substring nem fallback para pré-silábico. Recomendar somente atividade/conteúdo do catálogo autorizado. Revisão humana obrigatória antes de publicar para uso pedagógico; ajustes preservam saída original e justificativa. Nenhum segredo/API key no bundle do app. Markdown orienta a chamada; métricas e memória vêm do banco, sem treinar modelo.

## Fluxo principal e alternativas

1. T15 identifica dados/data e limitações; adulto solicita análise.
2. Backend verifica vínculo, suficiência definida em D03 e cota; calcula snapshot das evidências, carrega instruções Markdown, monta pacote minimizado, cria run202 e chama o adaptador da API hospedada.
3. Schema e regras de referências validam saída; resultado é salvo como rascunho de IA.
4. Adulto vê evidências/fontes e aceita/edita/rejeita; API registra revisão/publicação. Confirmar nível abre F03.
5. Nova evidência produz nova análise/hash; resultados anteriores datados permanecem históricos.

Alternativas: insuficiente→orientar novas evidências sem inferir; timeout/schema inválido/modelo indisponível→falha e último confirmado preservado; cota429→retryAfter; cache→origem/data explícitos; pregerado de contingência→identificado e não conta como integração real. Solicitação de conta revogada é bloqueada em execução e leitura; rechecagem antes da publicação.

## Dados, persistência e integrações

ai_runs/ai_reviews, learning_snapshots e referências autorizadas no PG; resultados não substituem eventos de avaliação. Cache segregado por estudante/hash/versões, proposta24h. Limites propostos:1 inferência simultânea,45s timeout,20/dia/projeto,5/dia/adulto e1 início/min/projeto, ajustáveis após ensaio e limitados à quota real da conta. Contar raciocínio/retries no orçamento; sem upgrade pago automático. Custos, termos, modelo e contratos em07-ia; Gemini Developer API não é fallback elegível pelos termos consultados.

## UI, acessibilidade e temas

T15/T10: geração não bloqueia navegação; status textual consultável ao retornar; “Sugestão da IA — revisar”, fontes, recorte e data. Sem parágrafos enormes na abertura: resumo e ação de abrir evidências. Todos os temas, foco na chegada do resultado só se usuário permanecer e esperar, anúncio não repetitivo, TTS opcional sem autoplay; tradução Libras humana só para explicações estáticas cobertas, não prometer texto dinâmico traduzido.

## Critérios de aceite

- **A1:** uma chamada real da API analisa métricas/evidências persistidas, retorna schema válido com referências existentes e origem/modelId/requestId/promptVersion verificáveis; nível só confirma em F03. Sem download/treinamento de pesos ou dependência de servidor no PC da empresa.
- **A2:** casos sintéticos contrastantes geram justificativas/recomendações pertinentes ao dado segundo revisor; mudar nome não é prova de personalização.
- **A3:** timeout/insuficiência/JSON inválido não altera nível/plano; retry/cache não duplica execução indevidamente; indisponibilidade visível e registros anteriores conservados.
- **A4:** conta sem vínculo não consulta/solicita/revisa análise; pacote sem identificadores/diagnósticos; nenhuma chave no cliente; instrução maliciosa de observação não controla ferramentas.
- **A5:** revisor aceita/edita/rejeita e decisão/data/autoria reaparecem após reabrir. Pré-gerado rotulado nunca satisfaz A1.
- **A6:** quota Free esgotada/falha de rede não gera cobrança por migração automática e não perde progresso; painel e registros distinguem regra determinística, hipótese de IA e confirmação humana.

## Dependências/decisões

F01–F04/F07, corpus/revisão D03, conta/credencial/modelo Free D12, VM D06 e público/dados D15. API não chamada e qualidade PT-BR não testada. Critério pedagógico bloqueado até revisão; prova técnica com adultos e dados sintéticos pode ser ensaiada sem alegar eficácia ou liberação para crianças. Questões e perguntas adultas são apoios opcionais F07, posteriores à análise individual exigida pelo PDF.
# Adendo de UX/implementação · 29/10/2026

Início tem acesso flutuante em área reservada para não cobrir conteúdo/abas. Abre hub adulto com seleção explícita da criança; professor filtra por escola/turma. O hub usa apenas análise e revisão já suportadas, sem chat genérico ou promessa de geração de questões concluída. Ausência de configuração informa indisponibilidade e preserva último resultado/fluxos centrais. Groq `openai/gpt-oss-120b` permanece a decisão vigente, somente pelo backend. Nesta revisão foi exercitada resposta 503 local sem chave, **não chamada live ao Groq**. Exemplos pré-gerados ficam identificados. D03/D15 e prova live contrastante continuam pendentes. [Registro 15](../15-revisao-ux-jornadas.md).
