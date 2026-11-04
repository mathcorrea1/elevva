# Visão e escopo consolidado

## Resultado pretendido

**PDF**, §§1.1–1.3, pp.13–16: apoiar a alfabetização infantil, integrar responsáveis e educadores e oferecer orientações personalizadas com IA. **USU**: protótipo funcional para poucos usuários, contas separadas, dados coerentes, mobile e web, acessibilidade demonstrável e interface menos carregada. **PROP**: versão acadêmica com um percurso verificável entre avaliação, atividade, registro, acompanhamento e recomendação revisada.

A criança usa um contexto supervisionado de atividade, aberto por um adulto autorizado. Não precisa de e-mail ou conta própria nesta versão. Responsável acompanha seus vínculos; professor acompanha somente estudantes autorizados, agrupados em turmas. Uma mesma base de dados e componentes atende os três contextos; a navegação e as permissões diferem.

**Revisão0.2 confirmada:** modelo pronto por API, sem treinamento próprio ou servidor no computador da empresa; custo zero prioritário. Métricas/evidências no banco e regras no backend permanecem centrais; API interpreta o recorte para análise/recomendação individual exigida pelo TCC. Questões/perguntas adultas são apoios opcionais. Topologia proposta: FastAPI em VM elegível + Neon + Groq Free. Público infantil real continua pendente de adequação contratual/pedagógica; [decisão atual](07-ia.md).

## Escopo por origem

| Grupo | Origem e prioridade | Tratamento proposto |
|---|---|---|
| Contas, crianças, registros, nível, IA, progresso e orientações | RF001–007 e RF009, obrigatórios | Núcleo da versão final, com persistência e autorização reais |
| Perfil e feedback futuro | RF008/RF010, desejáveis | Perfil simples no núcleo por utilidade; feedback em incremento posterior, sem apagar a prioridade original |
| Recuperar senha, sair e vincular adultos | UC011/013/014, pp.45–47; sem prioridade própria | Incluir no núcleo; requisitos detalhados além da lista RF |
| Avaliação inicial, trilhas e tarefas | §§7.1–7.3 e 9.3; pp.48–52 e 59 | Incluir, com revisão das regras pedagógicas e transação no servidor |
| Necessidades, escolas, turmas e relatórios bimestrais | §§7–8, pp.48–55 | Incluir versão simples, sem administração escolar empresarial |
| Criação docente de atividades/orientações e novas avaliações | Texto do cap.8, pp.53–55; fig.25–29 | Incluir formulários com modelos limitados; “nova avaliação” é registro de avaliação, não editor irrestrito de rubricas |
| Temas, alto contraste, fonte, leitura, Libras e adaptações | USU; RNF001/008 ampliados pelo pedido atual | Parte central, sem diagnóstico obrigatório ou cobrança |
| Interface web e Android/iOS | Restrição §6.1, p.36; RNF006, p.39; canais, p.18 | Preservar as três plataformas; evidência de teste separada para cada uma |

## Modelo comercial e extensões

**PDF**, cap.2 pp.18–19 e §3.2 pp.27–28, descreve freemium, Premium a R$19,90/mês e institucional, suporte online, notificações, fóruns, conteúdos adicionais, parcerias e treinamento de modelos. São **projeções de negócio**, não prioridades RF. O valor não é orçamento aprovado nem cobrança real.

| Capacidade | Escopo recomendado do TCC | Justificativa/aceite de escopo |
|---|---|---|
| Planos e cobrança | Documentados como evolução; sem checkout/assinatura | Nenhum percurso acadêmico exige pagamento; acessibilidade e IA demonstrável disponíveis |
| Licenciamento institucional | Fora da implementação inicial | Escola/turma permanecem no núcleo; faturamento e contrato institucional não são necessários |
| Notificações | Mensagens transacionais na tela; push/e-mail de acompanhamento adiados | Recuperação/verificação de conta continuam necessárias; não confundir com campanhas |
| Suporte | Ajuda estática acessível e explicação dos limites | Sem chat de atendimento, SLA ou fila de suporte |
| Fóruns/comunidades | Evolução posterior | Exigiriam moderação e dados adicionais; não há UC detalhado |
| Conteúdos pagos, marketing, webinars e parcerias | Contexto de negócio | Não inventar parceiro ou empresa oficial a partir de personas |
| Treinar modelo próprio | Fora da implementação conforme orientação atual do usuário | Inferência com modelo pré-treinado por API; cap.2 p.19 menciona treinamento genericamente, a ajustar com orientador em D16 |
| Exportar PDF, favoritos, foto de perfil | Conveniências existentes parciais | Favoritos simples podem persistir em F07; PDF acessível é desejável posterior; foto opcional, sem bloquear perfil |
| Reconhecimento de fala/visão/manuscrito | Fora do núcleo obrigatório proposto | Fluxo de áudio atual é integração parcial não validada; atividade oral acompanhada pode ser registrada por adulto. Qualquer corte de modalidade deve ser confirmado em D08 |

Esses recortes são **PROP**, sujeitos à revisão do usuário e orientador. A matriz mantém os itens e fontes; não transforma o capítulo comercial inteiro em requisitos obrigatórios nem o exclui silenciosamente.

## Limites pedagógicos

O PDF exige critério educacional adequado (§6.1, p.37) e reconhece dependência de evidência (§6.1 p.36; UC006/007 pp.42–43), mas não fornece rubrica validada, limites de classificação, calendário bimestral ou fórmula global de progresso. O código contém regras próprias, registradas na auditoria; sua existência não valida a pedagogia.

**PROP**: apresentar separadamente nível sugerido pela IA, nível confirmado pelo adulto, quantidade de atividades, conclusão de trilha e evidências por habilidade. Não usar porcentagem de tarefas como “percentual de alfabetização”. Não produzir diagnóstico, ranking público de crianças ou alerta por idade sem validação. Dados insuficientes são um resultado legítimo.

## Condição de encerramento

A especificação pode orientar implementação independente das decisões ainda abertas. A versão final só estará pronta após os critérios das FRDs, isolamento multiusuário, persistência após reinício, pelo menos uma análise personalizada real e testes por plataforma. D03 (pedagogia), D05 (Libras), D06 (ambiente) e D07 (prazo/dispositivos) limitam a declaração de prontidão, conforme [decisões](04-decisoes.md).
