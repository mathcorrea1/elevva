# Depois da revisão pelo Claude — fechamento humano do TCC

**19/11/2026.** A revisão assistida entrega um rascunho acadêmico atualizado. O fechamento ainda exige conferência da equipe e do orientador. Estas instruções incorporam a mensagem do professor recebida depois do primeiro pacote.

## Complemento para enviar na conversa já aberta

> As orientações do professor prevalecem sobre o pacote anterior: retire o capítulo Prototipagem das telas, renomeie Proposta de desenvolvimento para Desenvolvimento e inclua obrigatoriamente Resultado e discussão e Conclusão. Coloque os prints atuais em Resultado e discussão e analise o que demonstram, em vez de apenas exibi-los. Trabalhos Futuros é opcional. Alinhe os tempos verbais relatando o que foi feito, sem converter funcionalidades pendentes em resultados: IA live, validação pedagógica, Libras concluída e APK ainda não estão comprovados. Use o PDF atualizado que anexei como base editorial e o repositório/documentos como evidência técnica. Se a lista de correções da banca1 não estiver anexada, registre essa falta e não afirme aplicação integral. Entregue também uma tabela das alegações que precisam de evidência e das decisões para validação do orientador.

## O que seu colega precisa fazer depois

1. **Confrontar as correções da banca1.** Obter ata, arquivo comentado ou lista de solicitações e montar checklist: correção → seção nova → evidência → conferido pela equipe. A lista ainda não foi disponibilizada nesta conversa; não há como atestar todas aplicadas só com o prompt.
2. **Revisar o texto gerado com os autores.** Conferir objetivo, regras, atores, RF/RNF/UC e o que de fato funciona. Preservar os10RF/8RNF/14UC originais, prioridades e origem dos complementos. Alinhar a revisão humana de nível/UC006 com o orientador. Dados de pesquisa e percentuais não devem mudar para combinar com o produto.
3. **Atualizar e conferir diagramas.** Casos de uso, classes, DER e sequência precisam refletir vínculos N:M, permissões, versões/atribuições/tentativas e API como autoridade. Conferir Mermaid/PlantUML renderizado: nomes, cardinalidades, chaves e legibilidade. Um desenho bonito não valida o modelo.
4. **Fazer os prints atuais.** Rodar o app, usar contas/dados sintéticos, capturar fluxos realmente demonstráveis e registrar plataforma/versão. Levar imagens a Resultado e discussão com legenda, requisito atendido e análise. Não apresentar web estreita como APK, pré-gerado como IA live, avatar como Libras concluída ou falha como sucesso.
5. **Escrever a discussão com evidências.** Para cada promessa relevante: recurso → teste/método → resultado → limite → contribuição para a dor. Usar67 testes backend e25 frontend/15 suítes, type-check/lint/exportações com o corte de19/11 e o recibo; não inventar cobertura percentual, teste de usabilidade ou resultado pedagógico. Medidas planejadas sem execução precisam permanecer identificadas.
6. **Conferir impacto no cliente.** Há proposta de valor para família/docente/instituição, mas não há validação de impacto educacional ou piloto com clientes demonstrados por este pacote. Se houver observação/entrevista real documentada pela equipe, informar método/amostra/data/limites. Caso contrário, discutir potencial e limitações, sem depoimentos ou ganhos inventados.
7. **Conferir referências e integridade acadêmica.** Abrir fontes citadas, verificar autoria/edição/ano/URL e padrão institucional. Validar toda referência acrescentada pelo modelo; garantir que o texto reflita decisões e interpretação dos autores. Seguir a regra da instituição sobre declaração de apoio por IA.
8. **Fechar a estrutura e a formatação.** Retirar prototipagem; Desenvolvimento; Resultado e discussão; Conclusão de cerca de uma página; Trabalhos Futuros opcional. Revisar Resumo/Abstract, títulos, sumário automático, listas de figuras/quadros/siglas, numeração, remissões, referências e layout do PDF final. Conferir figuras legíveis na projeção e na impressão.
9. **Submeter ao orientador.** Validar mudança de objetivo/UC006, escopo e tratamento das pendências, além da discussão/conclusão. Os autores respondem pelo texto; a revisão do Claude não substitui esse aceite.

## Evidências técnicas que ainda dependem do desenvolvimento

| Pendência | O que falta obter para poder afirmar no TCC |
|---|---|
| IA real | Configurar segredo no backend, executar chamadas sintéticas contrastantes e registrar resultado/modelo/origem; teste com provedor substituído não basta |
| Nível e conteúdo pedagógico | Revisor/instrumento/rubrica/corpus, critérios e exemplos aprovados; harmonizar schema legado de quatro categorias com cinco níveis |
| Libras | Tradução completa demonstrável e avaliação; arquivos revisados/licenciados para a cobertura por vídeos; teste nativo separado |
| Android | Montar/instalar APK e testar sessão, autorização, retomada, fonte, TalkBack e mídia; bundle exportado não basta |
| Persistência e ambiente final | Exercitar PostgreSQL/Neon no ambiente autorizado e acesso pelo aparelho se a apresentação exigir esse ambiente; local SQLite já é persistência, não prova de Neon |
| Conta/e-mail e conformidade | SMTP/recuperação completa e adequação de privacidade/termos antes de menores/dados reais |

Seu colega pode revisar e fechar as seções independentes hoje. Os pontos acima não serão resolvidos por edição de texto; entram como limites enquanto não houver nova evidência. Antes da entrega definitiva, atualizar o corte técnico com o que for comprovado até lá.

## Repositório e acesso

Remoto configurado: `https://github.com/mathcorrea1/elevva`. A pasta `Eleva V2/` reúne o mapa, prompt, diagnóstico e checklist. Um commit local só ficará visível para seu colega depois de enviado ao remoto. Se o repositório exigir autenticação, a equipe precisa conceder acesso ou fornecer o pacote documental; link por si só não concede permissão.

O PDF mais recente citado pelo usuário foi enviado separadamente ao colega. No workspace inspecionado permanece disponível apenas `Eleva-TCC-original.pdf`; não foi alegada leitura da versão externa atualizada.
