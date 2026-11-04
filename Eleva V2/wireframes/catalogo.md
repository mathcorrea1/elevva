# Wireframes textuais — Eleva V2

## Extensão implementada — referência atual de aulas

Os T01–T24 abaixo preservam o estudo de hierarquia original. A implementação posterior acrescenta os destinos seguintes, sem transformá-los em novos RF acadêmicos:

| ID adicional | Destino / hierarquia atual | Estado |
|---|---|---|
| T25 | Biblioteca: título/criar, busca, Minhas/Compartilhadas/Recebidas/Públicas, lista paginada, ações da versão | Implementado local; vazio, carregamento e erro |
| T26 | Ateliê: cabeçalho salvar/prévia, Sobre/Telas/Publicar, miniaturas, editor específico, organizar e disponibilizar | Implementado local; rascunho parcial, validação e revisão exigida |
| T27 | Aula sequencial: posição/salvamento, uma tela, conteúdo ou atividade, confirmar/avançar no rodapé, pausa e conclusão | Implementado local; retomada, erro, conflito entre acessos e perda de vínculo |
| T28 | Disponibilizar: revisão fixa, destinatários por estudante/turma/escola, seleção, atribuir no rodapé | Implementado local; grant obrigatório e lote sem duplicação |

Gestão de estudantes mantém a identidade dos fluxos originais com lista compacta, menu contextual e adicionar no cabeçalho; cadastro e filtros têm ação principal no rodapé do diálogo. [Capturas reais](../evidencias/aulas-v4-galeria.html) · [contratos, testes e limites](../17-construtor-aulas-e-compartilhamento.md).

---

Documentação de baixa fidelidade. Não é aplicativo funcional. A ordem dos blocos representa leitura/foco; ações são propostas. Fonte: catálogo T01–T24 e FRDs.

## Fluxos para revisão

- Responsável: T01 → T06/T08 → T09 → T10/T15 → T11 → T12/T13 → T16/T17.
- Professor: T01 → T22 → estudante → T09/T21/T18; vínculos T07/T08.
- Criança supervisionada: T11 → T12 → T13; apoio e pausa sempre visíveis.
- Preferências: T23 acessível antes do login e pela Conta; não exige diagnóstico.

## T01 — Entrar (adulto)

```text
[Voltar]  Entrar
----------------------------------------
Eleva · acesso adulto
E-mail [________________]
Senha [________________] [Mostrar]
Mensagem de erro junto ao campo
----------------------------------------
[AÇÃO PRINCIPAL: Entrar]
· Criar conta
· Recuperar senha
· Acessibilidade
```

## T02 — Criar conta (adulto)

```text
[Voltar]  Criar conta
----------------------------------------
Nome [________________]
E-mail [________________]
Senha e confirmação [________________]
Perfil: ( ) Responsável ( ) Professor
[ ] Li os termos e política · abrir texto
Participação futura não vem marcada
----------------------------------------
[AÇÃO PRINCIPAL: Criar conta]
· Já tenho conta
· Acessibilidade
```

## T03 — Conta e perfil (adulto)

```text
[Voltar]  Conta e perfil
----------------------------------------
Nome [Maria de demonstração____]
E-mail verificado · alterar pelo fluxo de verificação
Contexto: Responsável / Professor
Preferências e acessibilidade →
Ajuda · limites e privacidade →
Feedback e participação →
----------------------------------------
[AÇÃO PRINCIPAL: Salvar alteração]
· Cancelar edição
· Sair da conta
```

## T04 — Recuperar acesso (adulto)

```text
[Voltar]  Recuperar acesso
----------------------------------------
1. E-mail [________________]
Se houver conta, enviaremos instruções.
2. Código/link · estado de validade
3. Nova senha [________________]
Confirmar senha [________________]
----------------------------------------
[AÇÃO PRINCIPAL: Enviar / confirmar etapa]
· Reenviar instruções
· Voltar para entrar
```

## T05 — Confirmar saída (adulto)

```text
[Voltar]  Confirmar saída
----------------------------------------
Diálogo · foco contido, fundo inerte
Deseja sair desta conta?
Se houver registro pendente: ainda não foi salvo.
Aguarde o salvamento ou confirme descarte.
----------------------------------------
[AÇÃO PRINCIPAL: Sair]
· Cancelar
· Tentar salvar pendência
```

## T06 — Cadastrar criança (adulto)

```text
[Voltar]  Cadastrar criança
----------------------------------------
Etapa 1 de 2 · identificação
Nome [________________]
Nascimento [DD/MM/AAAA]
Escola e turma · opcionais [Selecionar]
Etapa 2 · adaptações desejadas
[ ] Leitura da instrução [ ] Apoio em Libras
Informações sensíveis · opcionais, abrir detalhes
----------------------------------------
[AÇÃO PRINCIPAL: Salvar criança]
· Voltar etapa
· Cancelar
```

## T07 — Quem acompanha (responsavel)

```text
[Voltar]  Quem acompanha
----------------------------------------
Criança selecionada: nome fictício
Responsável gestor · ativo
Segundo adulto · papel / escopo / status
Professor convidado · pendente
Cada vínculo mostra opção de revisar/revogar
----------------------------------------
[AÇÃO PRINCIPAL: Convidar adulto]
· Revisar escopo
· Revogar com confirmação
```

## T08 — Aceitar convite (adulto)

```text
[Voltar]  Aceitar convite
----------------------------------------
Solicitação recebida · remetente adulto
Criança · informação mínima autorizada
Permissões solicitadas · leitura, observação...
Conta destinatária verificada
Validade e estado do convite
----------------------------------------
[AÇÃO PRINCIPAL: Aceitar convite]
· Recusar
· Entrar na conta destinatária
```

## T09 — Avaliação por etapas (adulto)

```text
[Voltar]  Avaliação por etapas
----------------------------------------
Criança · instrumento e versão
Etapa 2 de 4 · exemplo de estrutura
Uma instrução curta e um item
[Estímulo do instrumento aprovado]
[Resposta ou observação __________________]
Apoio utilizado [Selecionar]
Último rascunho confirmado: data/hora
----------------------------------------
[AÇÃO PRINCIPAL: Próximo item]
· Ouvir / parar / repetir
· Ver em Libras · se coberto
· Pausar avaliação
```

## T10 — Revisar avaliação (adulto)

```text
[Voltar]  Revisar avaliação
----------------------------------------
Evidências coletadas · abrir lista
Hipótese da IA · ainda não confirmada
Nível sugerido [ou dados insuficientes]
Justificativa e IDs de evidência
Nível a confirmar [Selecionar]
Motivo de ajuste [________________]
----------------------------------------
[AÇÃO PRINCIPAL: Confirmar avaliação]
· Pedir mais evidências
· Salvar para revisão
```

## T11 — Próximo passo da trilha (adulto)

```text
[Voltar]  Próximo passo da trilha
----------------------------------------
Criança · plano e versão
2 de 3 tarefas concluídas · exemplo operacional
PRÓXIMA TAREFA: título e instrução breve
[Disponível] · modalidade e apoio
Concluídas (abrir) · evidências
Etapa seguinte: Bloqueada · conclua a atual
----------------------------------------
[AÇÃO PRINCIPAL: Continuar tarefa]
· Ver tarefas concluídas
· Voltar ao perfil
```

## T12 — Uma tarefa de cada vez (crianca)

```text
[Voltar]  Uma tarefa de cada vez
----------------------------------------
Olá! Vamos fazer esta atividade.
Etapa 1 de 3 · sem cronômetro obrigatório
Instrução curta aprovada
[ESTÍMULO / IMAGEM COM ALTERNATIVA]
( ) Opção A    ( ) Opção B
[Resposta selecionada · texto e marca]
----------------------------------------
[AÇÃO PRINCIPAL: Confirmar resposta]
· Ouvir / parar / repetir
· Ver em Libras
· Pausar / voltar ao adulto
```

## T13 — Resultado ou pausa (crianca)

```text
[Voltar]  Resultado ou pausa
----------------------------------------
Resposta registrada · texto, não só cor/som
Retorno breve aprovado para esta atividade
[Sem ranking ou percentual de alfabetização]
Se pausado: último item salvo e como retomar
----------------------------------------
[AÇÃO PRINCIPAL: Continuar / retomar]
· Repetir instrução
· Voltar ao adulto
```

## T14 — Atividade observada (adulto)

```text
[Voltar]  Atividade observada
----------------------------------------
Criança selecionada e autor adulto
Data [DD/MM/AAAA]
Atividade [Selecionar ou descrever]
Desempenho observado [________________]
Apoio utilizado [________________]
Este registro é observação adulta, não correção automática.
----------------------------------------
[AÇÃO PRINCIPAL: Salvar registro]
· Cancelar
· Ouvir ajuda
```

## T15 — Análise e recomendações (adulto)

```text
[Voltar]  Análise e recomendações
----------------------------------------
Criança · dados até data/hora
Origem: ao vivo / cache / pré-gerado · indicar
Modelo, versão e data · detalhes disponíveis
Sugestão da IA · revisar antes de publicar
Evidências e fontes (abrir)
Até 3 recomendações com razão concreta
Aceitar / editar / rejeitar + justificativa
----------------------------------------
[AÇÃO PRINCIPAL: Revisar e publicar]
· Gerar nova análise
· Ver última análise revisada
· Orientações gerais
```

## T16 — Histórico e progresso (adulto)

```text
[Voltar]  Histórico e progresso
----------------------------------------
Nível confirmado · autor e data / ainda não avaliada
Conclusão de tarefas: contagem separada
[Filtrar período / tipo de registro]
Data · avaliação · autoria
Data · atividade no app · resultado
Data · observação adulta · apoio
Gráfico opcional acompanhado de tabela
----------------------------------------
[AÇÃO PRINCIPAL: Ver relatório]
· Abrir evidência
· Nova observação
```

## T17 — Relatório individual (adulto)

```text
[Voltar]  Relatório individual
----------------------------------------
Criança · ano / período letivo [Selecionar]
Intervalo e data de corte explícitos
Nível inicial e final confirmados
Sessões, tarefas e observações · contagens
Métrica sem rubrica: não disponível
Resumo e evidências com autoria
Tabela equivalente ao gráfico
----------------------------------------
[AÇÃO PRINCIPAL: Ver registros do período]
· Alterar período
· Análise revisada
· Exportação apenas se implementada
```

## T18 — Relatório da turma (professor)

```text
[Voltar]  Relatório da turma
----------------------------------------
Escola / turma / ano [Selecionar]
Período e conjunto autorizado
Distribuição por nível + sem avaliação
Contagem de atividades / estudantes
Tabela textual dos mesmos dados
Acompanhamento sinalizado por adulto · motivo
Lista de estudantes visíveis, sem ranking clínico
----------------------------------------
[AÇÃO PRINCIPAL: Abrir estudante]
· Alterar período
· Ver critérios de acompanhamento
```

## T19 — Biblioteca (adulto)

```text
[Voltar]  Biblioteca
----------------------------------------
[Atividades] [Orientações]
Buscar por título ou tema [________________]
Geral / específica da criança autorizada
Título · resumo curto · modalidade suportada
Título · autor / revisão
Professor pode criar conteúdo; responsável usa catálogo.
----------------------------------------
[AÇÃO PRINCIPAL: Abrir conteúdo]
· Limpar filtros
· Criar · apenas professor
```

## T20 — Orientação pedagógica (adulto)

```text
[Voltar]  Orientação pedagógica
----------------------------------------
Título do conteúdo
Autor · versão · geral ou individual
Texto com parágrafos curtos
Como aplicar: uma ação por etapa
Fontes e revisão disponíveis
Cobertura em Libras indicada por conteúdo
----------------------------------------
[AÇÃO PRINCIPAL: Ouvir / parar / repetir]
· Ver em Libras · se disponível
· Favoritar
· Voltar à biblioteca
```

## T21 — Autoria docente (professor)

```text
[Voltar]  Autoria docente
----------------------------------------
Tipo: orientação / atividade / aplicar avaliação
Template executável aprovado [Selecionar]
Título [________________]
Instruções / conteúdo [________________]
Destino: criança ou turma autorizada
Prévia de conteúdo e apoios
Draft ou publicado · origem humana/IA revisada
----------------------------------------
[AÇÃO PRINCIPAL: Publicar conteúdo]
· Salvar rascunho
· Pré-visualizar
· Cancelar
```

## T22 — Minhas turmas (professor)

```text
[Voltar]  Minhas turmas
----------------------------------------
Escola / ano [Selecionar]
Turma [Selecionar ou criar contexto]
Estudantes com vínculo ativo
Nome · próximo passo · abrir perfil
Sem autorização não há detalhe pessoal
Relatório da turma em destino próprio
----------------------------------------
[AÇÃO PRINCIPAL: Abrir estudante]
· Criar turma
· Convidar / solicitar vínculo
· Atribuir atividade
· Relatório coletivo
```

## T23 — Acessibilidade e aparência (adulto)

```text
[Voltar]  Acessibilidade e aparência
----------------------------------------
Tema: ( ) Claro ( ) Escuro ( ) Sistema
[ ] Alto contraste · independente do tema
Texto: [Padrão] [120%] [150%] + tamanho do sistema
Movimento: [Sistema] [Reduzir]
Leitura: sob demanda · ouvir / parar / repetir
Libras: vídeos disponíveis / apoio web automático
Prévia de texto, botão, erro e foco
Escopo: dispositivo / minha conta / apoio da criança
----------------------------------------
[AÇÃO PRINCIPAL: Aplicar automaticamente]
· Restaurar opções do app
· Ver cobertura de Libras
```

## T24 — Feedback e participação (adulto)

```text
[Voltar]  Feedback e participação
----------------------------------------
Seu comentário [________________]
Categoria opcional [Selecionar]
Não inclua dados identificáveis de crianças.
Participação em pesquisa futura: [ ] Tenho interesse
Finalidade e política · separadas dos termos
Revogar interesse a qualquer momento
----------------------------------------
[AÇÃO PRINCIPAL: Enviar feedback]
· Salvar / revogar interesse
· Voltar à conta
```

## Variações de estado

Aplicar à operação pertinente. O HTML permite selecionar as variações para discutir hierarquia; não significa que toda tela tenha todos os estados de negócio.

| Estado | Mensagem | Próxima ação |
|---|---|---|
| Conteúdo disponível | Composição principal e próximo passo. | Ação principal da tela |
| Carregando | Carregando conteúdo… título e voltar continuam disponíveis. | Aguardar · sem travar navegação |
| Erro | Não foi possível concluir. Os dados preenchidos foram mantidos. | Tentar novamente |
| Vazio | Ainda não há registros para este contexto. | Criar primeiro registro · se autorizado |
| Sem vínculo | Nenhuma criança vinculada ou acesso indisponível. Nenhum nome alheio é exibido. | Cadastrar / aceitar convite · conforme papel |
| Dados insuficientes | Faltam evidências exigidas pelo instrumento. Não há nível ou score inventado. | Continuar coleta de evidências |
| Salvamento pendente | Não salvo. Sua edição permanece aberta; aguarde ou tente novamente. | Tentar salvar · mesma operação |
| IA indisponível | A análise não foi concluída. Seus registros confirmados estão salvos. | Ver orientações gerais / tentar depois |
| Conflito de edição | Outra pessoa atualizou este registro. Seu rascunho foi preservado. | Recarregar e comparar |

## Notas de revisão

- T05 é diálogo, com foco contido e retorno ao acionador; T12/T13 não exibem menu adulto.
- Interface web usa navegação lateral e espaço para conteúdo; mobile usa quatro destinos e contexto infantil dedicado.
- Tokens/cores finais e avaliações assistivas estão em 06-ux-acessibilidade.md. Wireframe não comprova contraste ou conformidade do aplicativo.
- Os exemplos de etapas/contagens são ilustração de hierarquia, não uma rubrica ou duração pedagógica aprovada.
- Libras, leitura e recomendações aparecem como acessos com cobertura explícita; controles ilustrados não executam esses serviços.
