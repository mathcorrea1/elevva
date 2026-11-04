# Regras comuns das FRDs

Versão0.1, 22/10/2026. **Referência para implementação, ainda com decisões propostas e bloqueios de validação.** Cada Fxx incorpora este contrato e explicita suas particularidades. Critérios Ax são verificações futuras, não testes já executados.

## Regras transversais normativas

1. **Fonte e prioridade:** PDF é identificado por seção/página física. RF/RNF preservam Obrigatório/Desejável; UC/capacidades sem prioridade continuam NI. USU é pedido atual; PROP é recomendação; PEND é decisão do registro Dxx.
2. **Permissão:** toda operação de criança verifica sessão e vínculo ativo no servidor, mesmo com ID correto. Papel teacher não significa acesso geral. Contexto infantil só recebe dados mínimos da atribuição. Ver [matriz de permissões](../08-dados-api-ambiente.md).
3. **Pré/pós:** sucesso depende de resposta confirmada da API; falha mantém estado anterior e dados editados. Nunca exibir sucesso só porque um mock retornou ou a navegação voltou. Persistência é PostgreSQL; estado/caches não a substituem.
4. **Campos:** espaços periféricos tratados em campos apropriados; preservar grafia/acentos, não aplicar “sanitização” destrutiva. Limites explícitos em cada FRD são propostas técnicas; validar no cliente/servidor. IDs/autoria/datas de criação/version gerados no servidor. Datas devem existir no calendário, não ser apenas regex.
5. **Mutações:** Idempotency-Key, version/If-Match e comandos específicos conforme contratos; sem PUT completo de Child. Logar IDs/ação/resultado sem dados sensíveis. Conservar histórico e autoria; edição de evento gera revisão.
6. **Estados UI:** inicial, carregando, atualizando, vazio, erro, sem vínculo, insuficiência, salvando/não salvo, salvo, conflito, sem rede e sessão expirada conforme pertinência. Falha não carrega automaticamente fixtures. [Contrato de estados](../06-ux-acessibilidade.md).
7. **Acessibilidade e temas:** aplicar A01–A12 conforme a tela: tokens reativos claro/escuro/sistema + alto contraste; fontes do sistema sem corte; toque confortável; rótulos/roles/estado; teclado/foco/diálogo web; TalkBack/VoiceOver avaliados por plataforma; movimento reduzido; estados com texto. Não declarar WCAG conforme sem avaliação.
8. **Integração:** telas→hooks/casos de uso→repositório mock ou API injetado na composição; nenhuma chave secreta no cliente; validação de DTOs e erros tipados. Não misturar sessão Clerk e autenticação caseira paralela.
9. **Demonstração:** dados fictícios coerentes identificados; cada requisito só conclui após teste integrado com gravação/reabertura e conta sem permissão. IA mock/pré-gerada não conta como chamada real. Libras depende de conteúdo revisado.

## Ordem de dependências

F10 e correções de componentes iniciam junto a F01; F01→F02; F02+instrumento aprovado→F03; F02+catálogo→F04; F03/F04→F05; evidências reais+corpus→F06; F07 alimenta catálogo/orientações; F04/F03→F08; F02+F09→coletivo F08. F11 é desejável posterior. Não exigir F06 para gravar uma observação ou acessar orientação geral.
# Adendo vigente de UX · 29/10/2026

O pedido posterior do usuário autoriza atualizar navegação/wireframes. Os adendos datados em F01/F04–F10 e a [revisão 15](../15-revisao-ux-jornadas.md) descrevem o código atual e prevalecem sobre a antiga distribuição de destinos. Não convertem marcos, estimativas ou agrupamentos de seed em exigências originais do PDF. Nenhum adendo aprova D03/D05/D13/D15 nem declara implementação integral.
