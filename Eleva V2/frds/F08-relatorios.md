# F08 — Progresso, histórico e relatórios

## Adendo vigente — aulas e gestão de estudantes, 29/10/2026

Panorama/contexto agregam todo o filtro no banco; detalhes são paginados e identificam o recorte. Comparação exige mesma versão/item/apoios. Com feedback imediato, usa-se primeira confirmação do item na primeira entrega; legado conserva primeira entrega. Escrita pendente fica fora do denominador corrigível; revisão possui data/justificativa e não confirma nível. Investigação de turma tem grupos de colegas com foco incluído. Recorte não é apresentado como toda a turma ou percentual de alfabetização. [Fluxos, contratos, evidências e limites](../17-construtor-aulas-e-compartilhamento.md). Este adendo atende pedidos atuais; não altera prioridades acadêmicas originais.

---

## Objetivo, fontes e situação

Exibir evidências de evolução sem indicadores fictícios. **PDF** RF007 O p.38, UC008/012 NI pp.43–46, BimestreReport §§7.1–7.2 pp.48–51 e acompanhamento coletivo cap.8 pp.53–55. **CÓD** E10/E11: timeline fixa, relatórios de2025, agregações de progress sem significado uniforme e top3 menores. Situação simulada/parcial/divergente. **PROP** histórico de eventos e relatórios reproduzíveis.

## Atores/permissões e pré/pós

Adulto lê criança vinculada; professor consulta coletivo apenas das turmas/estudantes autorizados; criança não vê rankings/dados de terceiros. Pré: sessão, grants e filtro temporal válido. Pós: relatório consultado/gerado com origem real, intervalo, recorte e versão de regras, ou insuficiência explícita. Ler não modifica score/progresso.

## Campos, métricas e validações

Filtros: studentId/classroomId, ano, reportPeriodId ou intervalo inicial/final válido. Calendário escolar define bimestres; não presumir divisão civil automática. Relatório: nível inicial/final **confirmados**, datas/revisores, sessões/tentativas concluídas, observações, tarefas concluídas/atribuídas, evidências e recomendações revisadas. Média de score/evolution do modelo original só é exibida se escala, comparabilidade e cálculo forem aprovados; caso contrário mostrar “métrica não disponível” com razão, sem preencher fictícios.

Histórico distingue tentativa, observação adulta, avaliação e sugestão de IA. Preservar eventos corrigidos/revisões sem expor nota sensível a quem não tem escopo. Não usar diferença de níveis como número nem soma6 como evolução. Comparar períodos de forma descritiva até D03 aprovar métrica. Se mostrar percentual de tarefas, rótulo operacional e denominador explícitos conforme D14. Contagens de tentativas não equivalem a número de crianças; tentativas repetidas não duplicam conclusão de tarefa.

Coletivo: filtros e denominador visíveis, distribuição por níveis confirmados inclui “sem avaliação”; não publicar nomes/diagnósticos em tela genérica. Atenção proposta é sinalização manual com motivo/data/revisor; nenhuma criança vira “atenção prioritária” só porque entrou no top3. Dados insuficientes não são desempenho zero.

## Fluxo principal e alternativas

1. T16 mostra nível atual confirmado e histórico; adulto abre T17 e seleciona período.
2. Backend consulta eventos autorizados e compõe relatório, opcionalmente salva snapshot versionado.
3. Usuário expande evidências/tabela, acessa atividade/análise revisada; professor abre T18 por turma e estudante autorizado.
4. Novo registro aparece após atualização; snapshot publicado anterior conserva data de corte e opção de nova versão.

Alternativas: sem registros→vazio; alguns registros→relatório parcial com limites; sem calendário→selecionar intervalo, sem chamar de bimestre oficial; sem dado comparável→sem média/evolução numérica; erro/rede→anterior datado ou retry; acesso revogado→bloqueio. Exportar PDF do protótipo tem handler vazio: versão inicial usa relatório acessível na tela; exportação é desejável e só aparece quando realmente entregue/testada.

## Dados/persistência e integrações

Fonte: assessments/confirmations, attempts, observations, task_completions e learning_events. `report_periods` e snapshots guardam intervalo/versão/corte, sem substituir eventos. Repositório/API gera com autorização aplicada antes da agregação; não somar toda a base e filtrar nomes apenas no cliente. Narrativa IA opcional separada em F06, contagens determinísticas no servidor.

## UI, acessibilidade e temas

T16–T18: hierarquia nível→evidências→próximo passo; gráfico opcional com texto/tabela equivalente, foco e leitura de filtros/legenda, resumo de insuficiência. Reflow sem largura capturada uma única vez; scroll horizontal só quando indispensável e com alternativa. Todos os temas/alto contraste e padrões sem cor exclusiva. TTS de resumo opcional; vídeo em Libras explica como ler relatório, não traduz dinamicamente cada relatório. Loading/erro/vazio/parcial/snapshot antigo/salvo claramente distintos.

## Critérios de aceite

- **A1:** novo evento real muda histórico/contagem após reabrir; excluir mocks da fonte integrada; distinguir origens e datas.
- **A2:** relatório individual/bimestral corresponde ao período autorizado e eventos; sem métrica aprovada, não inventa score/média; dados insuficientes não viram zero.
- **A3:** coletivo considera só alunos autorizados do filtro, indica denominador/sem avaliação; responsável não consulta turma inteira.
- **A4:** atenção sem limiar validado só por decisão humana documentada; sem ranking automático/diagnóstico; tabela substitui visualização gráfica para leitor.

## Dependências/pendências

F02–F05/F09; **D03/D14** para métricas e calendário. PDF exportado acessível é incremento opcional, não entregue pela presença do botão atual. Teste de relatório deve usar o mesmo seed/eventos da avaliação e atividade, não fixture independente.
# Adendo de implementação · 29/10/2026

Relatórios é destino principal. Individual oferece período em sheet, resumo, etapas, série diária e ligações para histórico/avaliações, orientações e análise. Professor tem coletivo da turma autorizada e detalhamento individual. Gráfico empilhado usa contagens diárias de conclusão/avaliação/observação com legenda e alternativa textual expansível; vazio orienta o próximo registro. Fuso: America/Sao_Paulo. Avaliações/observações contam por data de registro; execução por `finished_at`. Conclusões de etapa contam quando sua última atividade foi concluída no período; total de etapas/atribuições é histórico total, explicitado. Denominador coletivo: estudantes da turma com grant ativo. Não há percentual de alfabetização. Os mesmos eventos persistidos alimentam números e gráficos; validação da interpretação pedagógica permanece D03/D14. [Provas locais](../15-revisao-ux-jornadas.md).
