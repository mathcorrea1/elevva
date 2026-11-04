# F05 — Trilhas, tarefas e desbloqueio

## Adendo vigente — aulas e gestão de estudantes, 29/10/2026

Modelos/revisões e percursos preservam versões. O ateliê pode referenciar uma aula por telas da biblioteca; atribuições usam `content_revision_id` sem copiar as telas. Mapa/lista e bloqueios consultam o mesmo estado. Avaliação registrada é pré-condição técnica enquanto D03 está aberto, sem classificação inventada. Entrega obrigatória conclui; revisão escrita pode ser exigida explicitamente. Marcos são contagens operacionais, sem seleção automática por nível não validada. [Fluxos, contratos, evidências e limites](../17-construtor-aulas-e-compartilhamento.md). Este adendo atende pedidos atuais; não altera prioridades acadêmicas originais.

---

## Objetivo, fontes e situação

Guiar o próximo passo sem confundir execução com aprendizagem. **PDF** §§7.1–7.3 pp.48–52 e §9.3 p.59, prioridade NI; RF004/005/007 relacionados. **CÓD** utils/trails e TrailList/TrailDetail (E06/E07): geração e normalização existem, conteúdo igual para níveis e atalho de concluir tudo. **PROP** reaproveitar funções/conceitos após revisão e levar autoridade ao servidor.

## Atores/permissões e pré/pós

Adulto/criança autorizados consultam e executam; professor atribui plano aprovado, sem desbloqueio arbitrário pelo cliente. Pré: avaliação/nível confirmado conforme D03 e template publicado; pós: percurso instanciado com versão, tarefa concluída por tentativa/observação apropriada e dependência seguinte liberada atomicamente. Sem avaliação, explicar condição e oferecer T09/conteúdo geral permitido.

## Campos, regras e validações

trailId/templateVersion/studentId, título/área, recomendadoPara (referência revisada), tarefas ordenadas e pré-requisitos, assignmentId/tipo de evidência aceito, status locked/not-started/in-progress/completed, completedAt, proofId. Totais e status calculados no servidor. Tarefa inexistente, não atribuída ou bloqueada não pode ser concluída pelo endpoint direto.

Desbloqueio sequencial é **proposta existente no código e figura24**, a validar pedagogicamente, não uma lei pedagógica. Adotar regra simples aprovada: somente pré-requisitos concluídos liberam a próxima etapa; indicar motivo e não usar cor sozinha. Tarefa observada exige observationId; tentativa do app exige finish válido. Sem “Concluir trilha rapidamente” no fluxo comum. Se tarefa for dispensada por professor, registrar exceção com motivo e política aprovada, sem tratá-la como desempenho obtido.

Indicador operacional proposto: “2 de3 tarefas concluídas”; percentual opcional `concluídas/atribuídas*100` rotulado **conclusão de tarefas**, nunca percentual de alfabetização. Fórmula é proposta de produto, sujeita a D14; não importar progress global atual. Alterar nível não apaga trilha anterior; decidir reatribuição explicitamente com histórico.

## Fluxo e alternativas

1. Após confirmação de avaliação, servidor cria instância de template apropriado, sem duplicar em retry.
2. T11 destaca uma próxima tarefa; concluídas ficam em seção secundária.
3. T12/F04 executa ou T14 registra atividade observada, enviando prova ao backend.
4. Transação confirma tarefa, recalcula estados e retorna próximo passo; T13 mostra resultado confirmado.

Alternativas: sem avaliação; trilha vazia/não aprovada; tarefa bloqueada; prova inválida; duas sessões concorrentes; erro de gravação; reavaliação com novo plano. GET não cria trilha implicitamente. Idempotência mantém mesma task_completion; duas tentativas não somam duas tarefas.

## Persistência e integrações

Templates versionados, student_trails, trail_tasks, task_completions e learning_events no PG; F03 inicializa e F04 fornece prova. Repositório consulta snapshot, não salva Child inteiro. Funções puras atuais podem ajudar testes de invariantes, mas backend deve validar bloqueio/autorização.

## Estados UI, acessibilidade e temas

T11/T12/T13: sem avaliação, aguardando conteúdo, disponível, bloqueada (motivo textual), em curso, pendente de salvar e concluída. Lista linear navegável por teclado/leitor; progresso com valor textual, sem mapa visual obrigatório. Temas tokens A01–A07/A10/A11; apoio de instrução A08/A12 conforme conteúdo, sem movimento essencial.

## Critérios de aceite

- **A1:** avaliação aprovada cria trilha uma vez; tarefa válida concluída libera exatamente o próximo estado previsto no servidor.
- **A2:** requisição direta de tarefa bloqueada/prova alheia é negada; retry e concorrência não duplicam ou liberam demais.
- **A3:** ao reiniciar, instância/tarefas/versão/conclusão permanecem; reavaliação mantém histórico.
- **A4:** mostrar contagem de tarefas separada do nível confirmado; nenhuma conclusão em massa sem prova no contexto infantil.

## Dependências/decisões

F03/F04 e D03 para seleção/conteúdo/pré-requisitos; D14 para indicador; revisão de regras do código antes de reutilização. Não declarar trilhas personalizadas só por trocar recommendedForLevel mantendo mesmas tarefas.
# Adendo vigente de implementação · 29/10/2026

Trilhas é destino principal com seleção explícita da criança. O código atual usa `learning_stages` e `assignments.stage_id`: uma etapa reúne de 1 a 6 atividades distintas e relacionadas, escolhidas pelo adulto autorizado; instruções, itens e versão ficam em snapshots. `POST /students/{id}/stages` é transacional/idempotente. A sequência é validada pelo servidor; a avaliação inicial registrada é pré-condição técnica para executar, **sem exigir classificação inventada** enquanto D03 está aberto. Ainda não há seleção automática de template pedagógico aprovado.

Nós disponíveis/bloqueados/em andamento/concluídos e uma lista alternativa representam o mesmo GET de jornada. Abrir nó mostra atividades, instruções, situação, motivo de bloqueio e iniciar/continuar. Fonte grande força apresentação linear; não oferece botão inoperante para contrariar essa adaptação. Três imagens originais integram cenário, marcos e conclusão, sem estados embutidos em bitmap.

Marcos de produto: primeira atividade salva, primeira etapa concluída e cinco atividades salvas. São contagens derivadas; não mudam nível pedagógico e não são exigências originais do TCC. Não há conclusão em massa ou observação convertida silenciosamente em execução. Agrupamentos do seed são testes sem revisão pedagógica. Template/ordem/recomendação por nível, dispensas e aceites pedagógicos seguem pendentes. [Testes e capturas](../15-revisao-ux-jornadas.md).
