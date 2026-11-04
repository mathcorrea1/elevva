# Revisão 0.2 — API pronta, acompanhamento por evidências e custo zero

Referência: 22/10/2026. Esta revisão incorpora a nova orientação do usuário e **substitui a recomendação de usar o computador da empresa como servidor e executar Qwen/Ollama**. A versão anterior dos documentos afetados foi preservada em `historico/v0.1-antes-da-revisao-api.zip`. Produto original intacto.

## Decisões confirmadas e recomendadas

**USU confirmado:** não treinar um modelo do zero; preferência por API pronta, custo zero como prioridade, hospedagem fora do computador da empresa. Interesse em registrar ações/evolução no banco e orientar a API por Markdown. VM é uma possibilidade, ainda não um recurso existente.

**PROP:** acompanhamento híbrido: banco registra evidências, backend calcula métricas/regras aprovadas, API de IA interpreta o recorte e sugere nível/recomendações revisáveis. Nenhum treinamento ou fine-tuning. Perguntas simples de adultos e rascunhos de questões podem aproveitar a mesma API, mas não substituem as análises individualizadas prometidas.

**Seleção principal para prova técnica gratuita com adultos e dados fictícios:** GroqCloud Free, modelo `openai/gpt-oss-120b`, através do backend. É um modelo pronto, criado pela OpenAI e servido pela Groq; não é contratação da API OpenAI, nem instalação de pesos na VM. A documentação lista cota gratuita e saída JSON estruturada, mas acesso da conta, qualidade em português e inferência ainda precisam de teste. Detalhes e restrição de público em [decisão de IA](07-ia.md).

**Hospedagem recomendada:** FastAPI em VM Oracle Always Free, Neon Free para PostgreSQL, Clerk para identidade adulta e API Groq para inferência. A VM serve o aplicativo; não executa LLM nem precisa de GPU. VM/contas não provisionadas; disponibilidade gratuita da Oracle continua uma dependência concreta, não garantia. Não migrar para plano pago automaticamente.

## O que o TCC de fato diz

| Assunto | Evidência no documento original | Consequência |
|---|---|---|
| IA analisar desempenho e indicar nível | RF005 obrigatório, pp.37–38; UC006 pp.42–43: coleta registros, IA analisa padrões e indica nível | Preservar análise individual assistida por API; apenas usar regras e acrescentar chat genérico não cobre essa promessa |
| IA sugerir atividades/orientações | RF006 obrigatório p.38; UC007 p.43; RF009/UC009 pp.38/44 | Selecionar sugestões dentre conteúdos permitidos e justificar pelas evidências |
| Dados insuficientes/falha | UC006/UC007 p.43 | Pode informar insuficiência e manter último nível; não é obrigatório inventar conclusão em todo caso |
| Atividades de áudio | Protótipos pp.53–55, em especial figura27; implementação atual também tem gravador/STT | Áudio é modalidade; não há requisito textual explícito de transcrever voz ou reconhecer nível pela gravação |
| Treinamento de modelos | Cap.2, p.19, descrição genérica das atividades do negócio | Registrar divergência: não existe instrumento, dataset, método ou RF detalhado impondo treinamento próprio. Recomendar ajustar redação com orientador para “integração e avaliação de modelos pré-treinados” |
| Critérios pedagógicos | Restrição p.37 e confiabilidade pp.59–60, sem rubrica operacional | Validação pedagógica continua necessária com qualquer fornecedor; instruções Markdown não a substituem |

Não retirar áudio do produto por confundir com reconhecimento automático: atividade oral acompanhada e observação adulta preservam uma modalidade concreta. STT automático permanece fora do núcleo proposto; se o orientador exigir uma interpretação diferente, registrar e replanejar, sem chamar gravação de reconhecimento.

## Como funcionará

Exemplo ilustrativo, sem limiares inventados: o estudante responde itens ligados a uma habilidade. O banco conserva respostas, gabarito/versionamento quando houver, apoio usado e observações do adulto. Backend resume quantos itens foram respondidos, corretos/incorretos/sem correção, e separa evidências comparáveis de outras.

Quando o adulto pedir análise, o backend envia somente esse recorte, rubrica e conteúdos permitidos à API, junto às instruções do Markdown. O modelo pode explicar um padrão, sugerir um nível quando houver base no instrumento aprovado e recomendar próxima atividade do catálogo. A resposta cita IDs de evidência e chega para revisão do adulto. O sistema continua salvando e mostrando atividades quando a IA estiver indisponível.

Não enviar histórico a cada toque. Um clique de navegação não é prova de dificuldade. Tempo, abandono, uso de apoio e acessibilidade não devem virar penalidade ou diagnóstico. A métrica determinística precisa ser correta; a interpretação pedagógica precisa de instrumento e revisão.

## Markdown de instruções

Foi preparado [um rascunho documental de instruções](ia/instrucoes-analise.md). Ele precisa ser lido pelo backend e enviado na chamada como orientação do modelo; existir no repositório não modifica uma API sozinho. A cada análise, os dados recentes vêm do banco. O modelo não acompanha contas nem guarda memória confiável por conta própria.

O arquivo define finalidade, limites, uso das fontes, insuficiência e formato conceitual. A rubrica aprovada é um artefato separado/versionado. Trocar instruções é ajuste de prompt, não treinamento dos pesos. Aplicação valida schema, IDs e permissões mesmo que o texto peça comportamento correto.

## Custo e bloqueios

Meta de **R$0 em serviços dentro das cotas**: plano Free da API, VM elegível, banco e identidade em planos gratuitos; sem método de pagamento/upgrade da IA para viabilizar a prova. Não prometer disponibilidade permanente ou cobrança zero irrestrita. A Oracle pode exigir cartão para verificação e ter indisponibilidade de capacidade; não autorizar cobrança/upgrade para resolver isso automaticamente.

Pendências concretas para o usuário acompanhar:

1. Obter conta/VM Oracle elegível e confirmar capacidade; nenhuma VM existe hoje. Se não houver capacidade, reavaliar hospedagem gratuita antes da banca, sem recorrer ao PC da empresa por padrão.
2. Disponibilizar conta Groq Free e chave **somente como segredo no backend** na etapa de implementação; confirmar modelo/quota na conta e habilitar ZDR. Não enviar chave no chat.
3. Confirmar com o fornecedor a adequação da integração para público infantil antes de liberar uso direto por crianças ou dados infantis reais. O acordo Groq tem cláusula de idade18; não tratá-la como resolvida pela passagem pelo backend. Prova inicial limitada a adultos e perfis inteiramente fictícios.
4. Buscar revisão pedagógica para rubrica e exemplos; orientar revisão da menção a “treinamento” do cap.2. Sem isso, análise tecnicamente funcional não equivale a nível pedagogicamente validado.
5. Executar prova real de API e qualidade em português antes de construir chat ou geração ampla de questões. Se falhar, registrar; não substituir por texto pré-gerado apresentado como IA ao vivo.

Não foram feitas chamadas de API, criadas contas, provisionadas VMs ou alterado código nesta revisão. Seleção documental e contratos atualizados; execução e adequação final ainda pendentes.
