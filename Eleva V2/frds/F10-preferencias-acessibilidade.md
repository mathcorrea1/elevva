# F10 — Preferências, acessibilidade e aparência

## Adendo vigente — aulas e gestão de estudantes, 29/10/2026

Executor/construtor usam tokens reativos, fonte, contraste, foco e diálogos comuns. Botões substituem arrastar; ações essenciais ficam no cabeçalho/rodapé. Leitura de questão depende do autor; uso efetivo é registrado. Conferência web em 320 px/fonte adicional 150%/escuro/alto contraste não é auditoria integral ou teste Android. Vídeo externo tem alternativa textual e habilitação de release após revisão. Libras continua sem vídeos revisados, sem alegação de entrega completa. [Fluxos, contratos, evidências e limites](../17-construtor-aulas-e-compartilhamento.md). Este adendo atende pedidos atuais; não altera prioridades acadêmicas originais.

---

## Objetivo, fontes e situação

Permitir uso confortável e assistivo por adultos/crianças em web e native. **PDF** RNF001/008 O pp.38–39, RNF006 O e necessidades pp.49–51; **USU** amplia para WCAG2.2 AA web, testes nativos, temas/contraste/fonte/leitura/Libras. **CÓD** E14–E16: preferência local de tema e labels parciais; demais recursos ausentes/não validados. **PROP** catálogo A01–A12 completo em [UX](../06-ux-acessibilidade.md).

## Atores/permissões; pré/pós

Qualquer usuário acessa ajustes visuais antes do login; adulto altera suas preferências e adaptações de criança autorizada. Não exigir diagnóstico, plano pago ou perfil clínico. Pré: nenhuma para tema/leitura de ajuda; vínculo para alterar suporte persistido da criança. Pós: preferência aplicada no momento, persistida no escopo correto ou sync pendente visível; conteúdo mantém estado/valores ao alternar.

## Campos, validações e regras

themePreference=system/light/dark; contrast=standard/high; textScale=1/1.2/1.5 (extra ao sistema, sem cap global); reduceMotion=system/reduce; instructionAudio=off/on-request; preferredLanguage=pt-BR nesta versão; librasSupport=off/on-request. App não desliga leitor de tela/sistema nem diminui fonte/contraste do SO. Resetar restaura preferências do app, não muda opções do aparelho.

Escopo visual pré-login por dispositivo; adulto logado por userId no servidor e cache; criança por studentId para adaptações funcionais, sem impor estilo a todos os adultos vinculados. Preferências não alteram score/nível. Alto contraste é dimensão separada e não simples inversão. Tokens reativos substituem cores fixas em telas, modais, navigator e gráficos. Redução de movimento preserva feedback em texto. Não disponibilizar botão decorativo sem ação.

## Fluxo e alternativas

1. Link Acessibilidade abre T23 a partir de T01/Conta/atividade sem exigir navegação difícil.
2. Usuário escolhe tema/contraste/texto; prévia e tela se atualizam; API/cache salvam.
3. Ouvir/Parar/Repetir lê instrução específica; vídeo “Ver em Libras” abre conteúdo correspondente coberto e revisado.
4. Web oferece VLibras opcional em conteúdo público permitido; indicar natureza automática e dependência de rede.

Alternativas: rede falha→preferência local aplicada e sync pendente; voz indisponível→texto preservado e mensagem; vídeo ausente/não revisado→informar cobertura pendente, sem fingir tradução; widget bloqueado→retry e vídeo essencial quando disponível. Libras revisada não pode ser declarada concluída com player vazio.

## Persistência/integrações

user_preferences e student_support_preferences via API; cache não sensível local separado por conta; manifest de conteúdo Libras com versão/revisor/licença/asset. expo-speech e player compatíveis SDK53 a validar; web script VLibras apenas no DOM, sem presumir RN. Guia mobile oficial não confirma SDK nativo plugável. Dependências/limites e oito vídeos mínimos propostos constam em06-ux.

## Estados, acessibilidade e temas

T23 é acessível em si: grupo de rádio para tema, switch contrast, controles com nome/valor/estado, preview legível e foco não perdido. Salvo/não sincronizado/erro de voz/vídeo/modelo de preferência compreensíveis. Todos os controles funcionam por teclado, TalkBack e toque; a opção não fica escondida em FAB de ícone. Alto contraste e fonte grande valem para diálogos de salvar e sair.

## Critérios de aceite

- **A1:** todos os temas e contraste alternam com formulário/diálogo abertos sem perder dados, fonte/estados legíveis após reinício e troca de usuário.
- **A2:** zoom200/400%web e maior fonte Android não cortam ações/texto;48 de alvo confortável; atividade sem arraste obrigatório e resultados sem cor/som exclusivo.
- **A3:** concluir percurso web com teclado/NVDA e Android com TalkBack; modais devolvem foco; movimentos reduzidos mantêm informação. iOS é teste separado pendente.
- **A4:** Ouvir/Parar/Repetir funcionam PT-BR nas plataformas testadas; texto equivalente permanece e silêncio não bloqueia tarefa.
- **A5:** vídeo essencial em Libras com revisão/versionamento reproduz no APK e web, com texto/controles e fallback claro; widget traduz conteúdo estático permitido na web, sem envio de dados privados ou declaração de cobertura universal.
- **A6:** recursos disponíveis sem diagnóstico/cobrança; scopes por adulto/dispositivo/criança não vazam entre contas.

## Dependências/decisões

Tokens/provider/components base; A01–A12 em cada feature; D05 bloqueia Libras revisada, D07 limita evidência nativa a Android inicialmente; avaliação WCAG manual/assistiva ainda não executada. Critérios são metas, não certificado.
# Adendo de implementação · 29/10/2026

Configurações fica dentro de Perfil; prelogin e executor conservam apoios rápidos. Claro/escuro/sistema, contraste independente, fonte adicional/sistema, movimento, leitura, Libras e feedback permanecem agrupados. Sheets têm alternativa ao gesto, fechar, Escape, foco contido/retornado e fundo inerte na web; desktop usa diálogo central e mobile painel inferior rolável. Skeletons são estáticos, sem animação indispensável. Texto grande adapta abas e trilha para lista.

Verificados na web: 320 px/fonte 150%/escuro/alto contraste sem overflow horizontal, foco de sheet, cancelamento, paletas e ação destrutiva por teste de contraste. Isso **não é conformidade WCAG completa nem validação TalkBack**. Player/manifesto Libras permanece sem vídeos revisados; geração de ilustrações não resolve D05. Sem validação nativa/voz/vídeos nesta revisão. [Cobertura e pendências](../15-revisao-ux-jornadas.md).
