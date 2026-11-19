# Decisões, conflitos e pendências

**Decisões aplicadas posteriormente — 19/11/2026:** IA apresentada como módulo opcional para a escola no pitch, sem implementar cobrança nem bloquear acessibilidade. Autoria manual é principal. Navegação adulta uniforme em cinco destinos; escolas/turmas por atalhos docentes; aparência/fonte em Perfil → Configurações. Snapshot IA v2 e instrução0.2 harmonizam cinco níveis, preservando leitura de análises v1. Não há treinamento próprio, troca de modelo, chamada live comprovada ou aprovação pedagógica implícita. [Implementação e evidências](24-implementacao-ux-integrada.md). Este adendo encerra a inconsistência técnica do schema citada no adendo histórico abaixo, sem encerrar D03/D15.

**Adendo vigente — 19/11/2026:** Better Auth substitui Clerk; caminho2/N:M/features/backend modular receberam autorização técnica posterior. Banca prioriza produto/demonstração sem exigir nuvem complexa para avançar. IA de autoria complementa RF005/RF006; modelo Groq `openai/gpt-oss-120b` permanece. [18](18-atualizacao-tcc.md) consolida mudanças no TCC e [diagnóstico](ELEVVA-DIAGNOSTICO.md) separa código/teste/integração/pendências. Schema legado da análise precisa harmonizar cinco níveis. D03/D05/D13/D15, live e APK não foram encerrados. Libras web é parcial, Android opt-in experimental e vídeos revisados ausentes. Autoria usa limite6.000 tokens, análise1.500. As tabelas históricas abaixo não reautorizam Clerk, treino próprio ou obrigação de nuvem.

**Confirmado** significa pedido ou informação expressa do usuário. **Proposto** é recomendação desta análise; não é aprovação presumida. **Bloqueante** refere-se à entrega indicada, não a todo o planejamento.

Revisão0.2: usuário prioriza API pronta e custo zero; não quer treinamento do zero nem servidor no computador da empresa. [Justificativa consolidada](10-revisao-api-e-acompanhamento.md). Esta revisão substitui D06/D12 anteriores; sem provisionamento ou chamada de IA realizada.

## Registro de decisões

| ID | Estado / decisão | Fundamento e impacto | Próximo responsável / desbloqueio |
|---|---|---|---|
| D01 | Proposto: caminho 2, reconstruir apresentação por etapas | E02/E14/E15/E19; base útil, telas/regras acopladas | Usuário revisa direção; implementação futura faz primeiro fluxo vertical |
| D02 | Proposto: manter stack RN/Expo/TS; FastAPI+PostgreSQL; Clerk para identidade adulta | PDF cap.9; backend/Clerk ainda ausentes. Não copiar SDK atual sem provar compatibilidade SDK53 | Desenvolvimento faz prova Android/web de cadastro, login, recuperação e validação JWT; fixar versões compatíveis |
| D03 | **Bloqueante para validade pedagógica**: rubrica, suficiência, nível, trilhas e métricas | PDF não define critérios operacionais validados; código tem fórmulas não justificadas | Usuário busca pedagogo/orientador; entregar itens, exemplos e rubrica assinada/versionada. Desenvolvimento pode avançar sem automatizar conclusões |
| D04 | Proposto: relação N:M entre adultos/crianças; responsável gestor concede/revoga | UC011 e pedido atual conflitam com DER user_id único | Usuário/orientador confirma modelo e política de escola; implementar concessão explícita, não acesso geral por profissão |
| D05 | **Bloqueante para Libras revisada**: vídeos de conteúdo essencial; VLibras complementar na web | Widget documenta HTML; guia mobile não é prova de SDK RN. Sem profissional disponível, conforme usuário | Usuário busca tradutor/intérprete e revisor surdo; orçamento/licença e lote inicial. Não apresentar vídeo automático como conteúdo revisado |
| D06 | Confirmado: sem VM; computador da empresa não será servidor. Proposto: API FastAPI em VM Oracle elegível, Neon para banco e IA por API hospedada | VM serve API/regras, sem LLM/GPU; custo zero dentro de cotas, capacidade gratuita ainda não confirmada | Usuário obtém conta/VM elegível; desenvolvimento valida TLS/reinício/rede. Sem upgrade pago automático e sem retorno ao PC da empresa por padrão |
| D07 | Confirmado: APK Android no celular + web no PC; prazo aproximado de um mês, sem data certa | Resposta do usuário nesta tarefa | Usuário informa data e modelo/Android quando souber; iOS segue planejado, sem prova de execução até aparelho disponível |
| D08 | Proposto: núcleo de IA textual; atividade oral com observação humana; STT fora do caminho crítico | PDF não exige provedor/modalidade; código menciona STT mas não prova funcionamento | Usuário/orientador confirma que STT não é exigência adicional da banca. Se for, replanejar solução e termos separadamente |
| D09 | Proposto: “criar avaliação” = aplicar instrumento aprovado e registrar nova avaliação | Fig.25 mostra formulário; texto não especifica editor de testes/rubricas | Orientador confirma interpretação. Editor irrestrito não entra por inferência de imagem |
| D10 | Proposto: temas claro/escuro/sistema + contraste independente, sem diagnóstico/paywall | Pedido atual confirmado; tokens e scopes desta análise são propostas | Desenvolvimento implementa e mede; usuário revisa aparência, sem tons oficiais inventados |
| D11 | Proposto: excluir cobrança/push/fórum da implementação acadêmica; ajuda estática real | Projeções comerciais sem UC detalhado; escopo curto | Usuário/orientador confirma corte; documentar TCC final sem afirmar implementação comercial |
| D12 | **Bloqueante para teste IA**: GroqCloud Free com `openai/gpt-oss-120b`, modelo pronto por API | Sem treinamento ou pesos locais; cotas e schema documentados; acesso/qualidade PT-BR ainda não testados | Usuário disponibiliza segredo no backend na implementação; confirmar plano/modelo/cota/ZDR e executar prova real. Não enviar chave no chat nem aumentar plano para contornar limite |
| D13 | Proposto: dados inteiramente fictícios na banca | Pedido atual; sem revisão jurídica/termos operacionais de dados reais | Usuário prepara e-mails adultos de teste, sem dados identificáveis de crianças reais |
| D14 | Proposto: conclusão de tarefas não equivale a score pedagógico | Fórmulas atuais divergentes; preservar histórico e distinguir métricas | Revisão pedagógica aprova métricas; até lá usar contagens e evidência bruta, sem inventar score |
| D15 | **Bloqueante para liberação infantil/dados reais:** adequação contratual e privacidade da API hospedada | Groq tem cláusula18; não há aprovação geral de integração infantil comprovada. Backend/anonimização não resolvem termos | Confirmar uso com fornecedor e orientador; inicialmente prova adulta com dados inteiramente fictícios, sem chat infantil; não alegar aprovação de piloto |
| D16 | Confirmado: sem treinamento do zero. Proposto: ajustar menção genérica de treinamento no cap.2 p.19 | RF/UC exigem análise/recomendação, sem método/dataset que imponha treino próprio | Usuário/orientador revisa redação para integração/avaliação de modelos pré-treinados; preservar exigências RF005/006 e UC006/007 |

## Conflitos e solução recomendada

### Atualizações durante a implementação

| ID | Estado e decisão | Fonte e efeito |
|---|---|---|
| D17 | **Confirmado pelo usuário:** substituir Clerk por Better Auth | Mensagem de implementação: “pretendo trocar o clerk por betterauth”. Direção Clerk dos documentos 0.2 fica superada. Better Auth1.7.12 real local + adaptador HTTP; processo Node de identidade na mesma VM do FastAPI. Sem outro ORM de domínio, sem troca de Expo. Compatibilidade HTTP/web demonstrada; Android ainda não testado |
| D18 | Decisão técnica implementada: convite por identificador da conta destinatária e código,24h | Sem SMTP disponível. Código não pode ser aceito por outra identidade. Substitui provisoriamente a proposta e-mail/48h; não afirma entrega de mensagem. Política de dados reais continua D13 |
| D19 | Desenvolvimento temporário: SQLite local via SQLAlchemy; PostgreSQL Neon continua destino | Não há VM, conta Neon, Docker Linux ativo ou PostgreSQL disponível no ambiente inspecionado. Migrações locais e SQL PostgreSQL offline preparados; nenhuma migração remota executada. Testar PostgreSQL de verdade permanece pendente |
| D20 | Revisão pedagógica tecnicamente separada da profissão | `PEDAGOGICAL_REVIEWER_SUBJECTS` vazio por padrão. Perfil professor não aprova catálogo automaticamente. Revisão, referência e publicação são eventos distintos; nenhum profissional/conteúdo foi aprovado por esta implementação. D03 permanece |
| D21 | Parâmetros de IA consolidados em código e no checkpoint11 | Groq `openai/gpt-oss-120b`;45s totais;20/dia/projeto,5/adulto, intervalo60s, cache24h,6.000 caracteres no snapshot e1.500 tokens de saída com raciocínio low. Valores iniciais configuráveis, não cotas reais comprovadas da conta. Sem chamada live por falta de chave |

Os estados anteriores em 01–10 são a especificação-base; [11](11-implementacao-e-checkpoint.md) e [12](12-rastreabilidade-implementacao.md) registram o que efetivamente foi implementado/testado. D03/D05/D13/D15 não foram encerrados. O caminho2 passou de recomendação a autorização técnica explícita do usuário.

| Fontes em conflito | Impacto | Solução proposta |
|---|---|---|
| RF003/UC003: cadastro por responsável vs protótipos/código: professor cadastra estudantes | Criança pode existir sem responsável vinculado | Responsável cria criança; professor pode criar registro escolar provisório restrito à própria turma e convidar responsável. Concessão explícita antes de compartilhar; confirmar D04 |
| DER/classes: um User por Student vs UC011 e USU: vários adultos | Modelo original não suporta colaboração real | `student_adult_links` N:M com papel/permissão, convite, aceite e revogação |
| UC006 define nível por IA vs sequência/AssessmentScreen: adulto escolhe nível | Confusão sobre autoria e confiança | IA sugere baseada em evidências, adulto confirma/ajusta com justificativa; gravar ambas as origens. Revisar redação final com orientador |
| RNF008 descreve familiaridade tecnológica vs pedido atual de acessibilidade assistiva | Texto original não especifica suporte a deficiência | Manter simplicidade e acrescentar controles/semântica/testes específicos do pedido atual |
| PDF protótipos roxos vs USU azul/branco | Troca cosmética atual gera regressão | Criar tokens reativos e validar componentes antes das telas; roxo não será identidade principal |
| Progresso = score manual, score +6 no áudio, timeline fixa e conclusão de tarefas | Indicadores não comparáveis e relatórios incoerentes | Eventos e tentativas são fontes; nível confirmado separado; não converter métricas incompatíveis por conveniência |
| Dashboard alerta por idade/<25 e relatório sempre escolhe três menores | Pode rotular sem fundamento | Sinalização manual com motivo; critérios automáticos só após D03. Menor progresso não é diagnóstico |
| UC013 pede informar conta inexistente vs segurança RNF002/003 | Facilita descobrir usuários cadastrados | Resposta neutra “Se houver uma conta, enviaremos instruções”; registrar divergência e confirmar na revisão acadêmica |
| Fig.21 liga criança a orientações, UC009 especifica adultos | Confunde produto infantil e pedagógico | Adultos recebem orientações; criança recebe instruções da atividade. Não criar chat infantil por essa imagem |
| RF006/UC007 exigem nível; alternativas admitem informação insuficiente | IA pode inventar personalização | Sem nível confirmado, exibir conteúdo geral ou sugestão diagnóstica identificada; não chamar de plano personalizado validado |
| §9.8 prevê serviços gratuitos e Expo Go | Planos/SDKs mudaram; Go atual pode não aceitar SDK53 | Banca com APK previamente instalado e web validada; não prometer hospedagem/Go gratuitos sem verificar |
| README menciona APIs Gemini/STT no cliente vs restrição de público e segredo | Termos e segurança inviabilizam manter integração como está | Remover chamadas diretas na futura implementação; API pronta pelo backend em VM, com segredo protegido. D15 preserva pendência contratual infantil; sem aprovação presumida por anonimização |
| Cap.2 p.19 cita treinamento vs usuário não quer treinar e RF/UC focam análise | Confunde estratégia comercial com implementação técnica obrigatória | Integração de modelo pré-treinado atende uso real de IA; ajustar redação com orientador, não afirmar treinamento realizado |
| Usuário considera só regras de evolução + IA para perguntas genéricas vs UC006/007 | Chat genérico isolado deixaria análise individual prometida sem implementação | Métricas/regras no backend mais uma análise real de evidências e sugestões pela API; perguntas/questões são opcionais |
| Personas/Liceu e imagens de escola | Podem ser interpretadas como parceria | São elementos do TCC; nenhuma parceria oficial foi comprovada |

## Lista de providências para o usuário

1. **Pedagogia (D03/D14):** localizar pedagogo e alinhar com orientador: habilidades e tarefas válidas, exemplos de resposta, cinco níveis e evidências mínimas, quem confirma classificação, pertinência das trilhas, interpretação de evolução e atenção. Definir calendário bimestral por escola. Não basta aprovar só os textos gerados.
2. **Libras (D05):** viabilizar tradução/produção/revisão por profissionais e pessoa surda fluente; direitos de imagem/distribuição; entregar arquivos MP4, texto correspondente, versão e revisão. Sem isso, cobertura revisada é pendente.
3. **Banca (D07):** confirmar data, Android/versão do aparelho, projeção e rede. Planejamento usa aproximadamente quatro semanas a partir de 22/10/2026, sem compromisso com 22/11.
4. **Escopo acadêmico (D04/D08/D09/D11):** revisar com orientador a concessão de vínculos, ausência de STT automático no núcleo, significado de nova avaliação e adiamento comercial. São escolhas documentadas, não cortes invisíveis.
5. **Serviços (D02/D06/D12/D13):** obter VM Oracle elegível e contas Free de teste (Groq/Neon/Clerk) na etapa de implementação; confirmar cotas e ZDR. Nunca mandar senhas/chaves no chat. Desenvolvimento pode começar sem VM, mas apresentação remota funcional depende dela ou de alternativa gratuita reavaliada.
6. **Público da API e texto acadêmico (D15/D16):** confirmar adequação do uso infantil com fornecedor/privacidade antes de piloto; alinhar com orientador substituição da menção a treino próprio por integração de modelo pronto. Banca inicial com adultos e dados sintéticos não comprova aprovação para crianças reais.

Não há pergunta adicional bloqueando a escrita das FRDs. Os itens acima bloqueiam afirmações específicas de qualidade/produção. Desenvolvimento pode implementar fluxo, contratos, armazenamento, acessibilidade técnica e teste IA com cenários sintéticos enquanto as revisões são buscadas.
# D17 · Jornadas e progressão visual · confirmada tecnicamente em 29/10/2026

Pedido posterior autoriza cinco destinos por perfil, painel docente por escola/turma, Perfil com configurações, trilhas com etapas/nós, marcos operacionais, relatórios visuais e acesso contextual à IA. Implementação e verificação local em [15](15-revisao-ux-jornadas.md). Decisão não aprova D03/D05/D13/D15 nem altera prioridades do PDF. Better Auth substitui Clerk na identidade vigente; Groq e Neon continuam sem credenciais e VM não provisionada. Foto ainda não suportada; iniciais são o fallback persistente do nome.
