# Evidência da revisão documental 0.2

Referência22/10/2026. Usuário informou que o computador é da empresa, prefere API pronta e hospedagem em VM, sem treinamento do zero e com custo zero prioritário. Atualizados visão/índice, matriz, decisões, arquitetura, IA, dados, plano e FRDs afetadas. Acrescentados revisão consolidada e rascunho Markdown de instruções. Snapshot anterior preservado em ZIP; nenhum arquivo do aplicativo editado.

Reconferidos texto do TCC UC006/007 p.43, RF005/006 pp.37–38, menção a treinamento no capítulo2 p.19 e referências de áudio nos protótipos. STT não é requisito textual explícito; uso de IA em análise/recomendação individual permanece necessário. Não se alterou PDF/conversão para harmonizar decisão sem registrar fonte.

Fontes oficiais consultadas nesta revisão:

- [Groq120B](https://console.groq.com/docs/model/openai/gpt-oss-120b) e [20B](https://console.groq.com/docs/model/openai/gpt-oss-20b): modelo/ID/capacidades.
- [Quotas](https://console.groq.com/docs/rate-limits), [Billing](https://console.groq.com/docs/billing-faqs), [schema](https://console.groq.com/docs/structured-outputs) e [reasoning](https://console.groq.com/docs/reasoning): Free separado de pago e execução estruturada. Sem inferência medida localmente.
- [Services Agreement](https://console.groq.com/docs/legal/services-agreement), [AUP](https://console.groq.com/docs/legal/ai-policy) e [dados](https://console.groq.com/docs/your-data): não usados como prova automática de permissão infantil; D15 permanece.
- [Termos Gemini](https://ai.google.dev/gemini-api/terms) e [Oracle Always Free](https://docs.oracle.com/en-us/iaas/Content/FreeTier/freetier_topic-Always_Free_Resources.htm): reconferidos.
- [Modelo OpenAI](https://developers.openai.com/api/docs/models/gpt-oss-120b) e [API menores](https://developers.openai.com/api/docs/guides/safety-checks/under-18-api-guidance): distinção entre criador do modelo, fornecedor da inferência e termos do produto específico. Skill OpenAI Docs utilizada para consulta documental; não houve chamada à API OpenAI.

Não executados nesta revisão: instalação, treinamento, download de modelo, chamada Groq/Gemini/OpenAI, criação de conta, provisionamento Oracle, banco, testes de produto ou builds. Verificação de links e hashes do protótipo registrada separadamente. Testes TypeScript/lint/Jest citados no pacote são os da auditoria anterior, não uma nova execução ou evidência de que a nova arquitetura funciona.
