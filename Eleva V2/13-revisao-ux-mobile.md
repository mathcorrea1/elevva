# Revisão visual mobile — 22/10/2026

O usuário rejeitou a apresentação genérica anterior e forneceu telas do Muzan como referência de acabamento, além de citar onboarding e orientação por mascote no Duolingo. A revisão mantém a identidade educacional azul/branco; não copia conteúdo de festas, a paleta roxa, personagens ou métricas dos exemplos.

Foi lido o pacote local `ux-ui-expert.skill`, incluindo SKILL.md e as referências de design systems, acessibilidade e movimento. Também foi aplicada a skill de geração de imagens para criar o conceito original de Lumi. Nome, personagem e composição permanecem propostas revisáveis. A logo oficial ainda não foi fornecida.

## O que mudou no aplicativo

- Base visual: Poppins local já disponível no projeto, hierarquia tipográfica, tokens adicionais para superfícies/hero/acento, cards e formulários, botões, estados e navegação inferior compacta. Temas continuam reativos; alto contraste usa tokens próprios. Não houve substituição global de cores ou troca de stack.
- Onboarding: três etapas, pular, entrada direta para conta existente, conclusão persistida por dispositivo e opção de rever em Configurações. Reabrir a apresentação mantém o aplicativo montado e não troca conta/criança.
- Entrada: versão mobile com mascote, login/cadastro/recuperação e aba Configurações. Aparência e fonte não aparecem dentro do formulário. Alternar abas mantém campos digitados.
- Início: contexto de responsável ou professor, saudação, acesso explícito à criança, cadastro e convite. Nenhuma criança é selecionada silenciosamente.
- Acompanhamento: próximo passo, contagens vindas do relatório da API e destinos por objetivo: atividade, avaliação, observação, histórico, relatório, IA, orientações e adultos autorizados. Perfil/adaptações ficam sob demanda.
- Trilha/executor: etapas com estados textuais, catálogo sob demanda, escolhas grandes, uma pergunta por etapa e confirmação com mascote somente depois do salvamento. Conclusão operacional não equivale a domínio pedagógico.
- Biblioteca: busca e filtros compactos; autoria, versões e revisão preservadas. Turmas: formulários de criação sob demanda e turmas existentes primeiro no fluxo de consulta.
- Relatórios: contagens em cards e filtros de período sob demanda; histórico, avaliação e IA receberam hierarquia/contexto próprios. Não foram introduzidos percentuais, rankings ou classificações novas.
- Configurações: aparência, fonte e contraste; leitura, Libras, conta e participação futura agrupadas; opção de rever onboarding.

Os formulários auxiliares de perfil, convites, autoria, observação e orientações herdam os novos componentes. Isso não significa que todos passaram por avaliação individual de usabilidade ou que os aceites funcionais de todas as FRDs estão concluídos.

## Acessos e execução

Web: http://localhost:8081. [Acessos de responsável e professor](../identity/ACESSOS-TESTE.local.md), arquivo local ignorado pelo git, sem segredos no APK ou na galeria. São contas Better Auth reais no ambiente de desenvolvimento, com dados fictícios. Ana é responsável; Marina é professora; ambas veem Lia por concessão explícita. A concessão docente não abre acesso às outras crianças.

Foi identificado outro serviço em localhost IPv6 na porta8000. As chamadas pelo hostname podiam alcançar esse serviço, produzindo CORS e falha de carregamento. Somente a API do Eleva foi movida para8100; o processo de outro projeto foi preservado. Configuração, fallback de desenvolvimento, scripts e guia foram atualizados. Identidade permanece na3001, web na8081. Nenhuma dessas URLs é hospedagem final nem URL válida de release Android.

Não é necessário criar Neon/Groq para testar os fluxos locais de conta, criança, atividade e relatório. Eles continuam pendentes para persistência remota e inferência real. Ver [guia](../DESENVOLVIMENTO.md).

## Capturas e limites

[Galeria de capturas](evidencias/premium-galeria.html). São telas reais da web em largura de celular; não são mockups gerados, screenshots de APK ou comprovação de iOS. O mascote foi gerado como imagem e incorporado como asset local; isso não constitui integração Groq F06.

UI exercitada com os dois acessos. No perfil responsável: adicionada atividade à trilha, respondidos dois itens, conclusão confirmada e relatório atualizado para duas tarefas/execuções. Contagens são derivadas do mesmo banco local; nível permanece nulo. O perfil professor abriu Turmas e autoria. Temas/alto contraste/fonte150% em320px foram inspecionados sem controles fora da largura disponível. Não é avaliação completa WCAG/TalkBack.

Verificações: type-check, lint,15 testes frontend em8 suítes e exportações web/Android. Backend mantém23 testes; esta revisão não altera regras pedagógicas nem tabelas de domínio. O APK ainda depende de JDK/SDK e endpoints apropriados; Libras revisada, qualidade pedagógica e chamada real Groq seguem pendentes.

Próximas revisões: incorporar a logo fornecida; avaliar se Lumi deve seguir para um estilo mais gráfico/novas poses; revisar com o usuário cada fluxo em uso; concluir testes nativos, validação pedagógica e integrações remotas. Não usar esta revisão como declaração de entrega integral.
