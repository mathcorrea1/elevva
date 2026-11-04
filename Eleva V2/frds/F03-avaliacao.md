# F03 — Avaliação inicial, reavaliação e nível

## Objetivo, fontes e situação

Coletar evidências e identificar nível com autoria e revisão rastreáveis. **PDF** RF005 O pp.37–38; UC006 NI pp.42–43; §7.3 pp.51–52 e §9.3 p.59. **CÓD** E05/E06: adulto escolhe nível/pontos, checklist e trilhas locais; não é avaliação automática validada. **USU** pede não inventar rubrica. **PROP** instrumento versionado + análise assistida + confirmação humana.

## Atores/permissões e pré/pós

Adulto autorizado registra evidências; professor/pedagogo confirma conforme política D03. Responsável pode relatar observações; confirmação pelo responsável precisa de regra pedagógica aprovada. Criança responde itens apropriados em sessão supervisionada. Pré: vínculo, instrumento publicado e adaptações disponíveis; pós: rascunho ou avaliação persistida, sugestão e confirmação separadas, evento histórico, trilha liberada somente por condição aprovada.

## Campos, validações e regras

assessmentId, templateId/version, studentId, respostas por item, origem (criança/adulto), apoio utilizado, data de aplicação, observações até1.000, evidências referenciadas, nível sugerido nullable, nível confirmado nullable e justificativa de ajuste até1.000. Enum atual de cinco níveis é vocabulário candidato, não rubrica validada. Pontuação só existe se instrumento definir escala/cálculo e revisor aprovar.

Não portar como verdade: checklist dividido pelo total, score default50, progress=score e limiares por idade do código. Critérios observados precisam ser efetivamente persistidos, não só o score. Não escolher nível padrão para criança sem avaliação. Definir suficiência, elegibilidade de instrumento/adaptação, revisão e critérios de trilha em D03; sem isso, resultado identificado como exploratório e não confirmado. Leitura de estímulo/gabarito não deve alterar a habilidade avaliada sem registrar adaptação.

## Fluxo e alternativas

1. T09 identifica criança e instrumento; apresenta instrução/apoios.
2. Coleta um item por etapa, grava rascunho confirmado por item; permite pausar/retomar.
3. Adulto revisa respostas/evidências; submete avaliação. Backend aplica somente regras aprovadas e pode solicitar F06.
4. T10 mostra hipótese da IA e evidências; profissional autorizado confirma/corrige ou pede novas evidências.
5. API registra confirmação+histórico e instancia trilha inicial aprovada em transação; mostra próximo passo.

Alternativas: faltam itens → insuficiente; indisponibilidade IA → manter dados e último nível; não existe avaliação anterior → “Ainda não avaliada”; erro/rede → não salvo; conflito → revisão; reavaliação → novo evento, sem apagar anterior ou reiniciar trilhas automaticamente.

## Dados e integração

Templates, itens, respostas, avaliações e confirmações separados no PG; evidencia origem e revisão. API assessments/confirmations; F06 recebe IDs e retorna sugestão. Versão do instrumento fica congelada na avaliação; mudar template não reinterpreta silenciosamente histórico. Backend bloqueia confirmação baseada em evidência de outra criança.

## UI, acessibilidade e temas

T09/T10: progresso de etapas em texto (“Etapa2 de4”), voltar sem perder resposta confirmada, rótulos, resumo focável de erro, criança com uma tarefa por vez. Apoio de leitura e Libras para instrução essencial, sem expor gabarito; opção de parar e repetir. Todos os temas e alto contraste, fonte ampliada, alternativa a gestos, A01–A12 conforme modalidade. Resultado fala “sugerido” ou “confirmado”, não só cor.

## Critérios de aceite

- **A1:** salvar parte, fechar e retomar último item confirmado; duas submissões com mesma operação não duplicam avaliação.
- **A2:** evidências→sugestão real F06→revisão humana registrada; nível confirmado difere da hipótese sem apagar origem; confirmações usam instrumento aprovado.
- **A3:** ausência/insuficiência/falha IA não atribui nível padrão nem sobrescreve anterior; resultado explica que dado falta conforme instrumento.
- **A4:** reavaliação mantém histórico e tarefas já concluídas; instrumento/apoios/revisor recuperáveis; não confundir contagem de tarefas com nível.

## Dependências e pendências

F01/F02/F06/F05, corpus e **D03 bloqueante**: instrumento, exemplos, suficiência, papéis confirmadores e critérios de classificação/trilhas. D09 distingue nova aplicação de editor livre. Até aprovação, não declarar identificação pedagógica validada só porque o fluxo técnico funciona.
