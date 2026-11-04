# F07 — Biblioteca, orientações e autoria docente

## Adendo vigente — aulas e gestão de estudantes, 29/10/2026

Biblioteca/construtor implementados: metadados, telas, editor por mecânica, prévia, rascunho incompleto estruturalmente válido e disponibilização validada. Revisões preservam publicações/tentativas. Minhas/Compartilhadas/Recebidas/Públicas têm busca/paginação. Convite, aceite, cópia com origem, redistribuição e revogação são operações próprias, sem acesso a estudantes. Publicação real exige revisor designado da versão; demonstração só em desenvolvimento/teste. [Fluxos, contratos, evidências e limites](../17-construtor-aulas-e-compartilhamento.md). Este adendo atende pedidos atuais; não altera prioridades acadêmicas originais.

---

## Objetivo, fontes e situação

Oferecer orientações gerais e individuais e permitir conteúdo docente documentado. **PDF** RF009 O/UC009 NI p.38/44, cap.8 pp.53–55 descreve criação de orientações e atividades; figuras25–29 mostram novas avaliações. Prioridade dessas capacidades: NI. **CÓD** E12/E13: artigos mock, orientação/atividade criadas em arrays de Child e favoritos em useState. Situação parcial/simulada; listas de autoria e catálogo divergem. **PROP** conteúdo versionado e autoria por templates limitados.

## Atores, permissões; pré/pós

Adultos autenticados leem conteúdo geral; individual exige vínculo. Professor autorizado cria/publica para estudantes/turma no seu escopo; responsável não ganha autoria docente por botão de UI. Pré: sessão, conteúdo/template disponível; pós: draft/publicação persistida com autoria/versão e atribuições válidas, favorito do usuário conservado. “Criar avaliação” abre aplicação do instrumento F03, não editor livre de rubricas (D09).

## Campos, validações e regras

Orientação: título3–120, conteúdo1–5.000, categoria do enum revisado, escopo general/student/classroom, IDs autorizados, fonte/revisão e status draft/published. Atividade: templateVersion, título3–120, instrução1–2.000, modalidade realmente suportada, nível-alvo quando validado, respostas/gabarito apenas para templates que o exigem, mídias descritas/transcritas quando aplicáveis. Destino obrigatório na atribuição, opcional no rascunho. Validar todos os destinatários no servidor antes de publicar.

Sem nível identificado, sugerir orientações gerais (UC009). Conteúdo individual não é copiado para biblioteca pública. Campos livres não geram jogo executável; template externo fica “atividade acompanhada pelo adulto”. Conteúdo criado com apoio de IA é draft e exige revisão/publicação humana F06; rótulo de origem e revisão. Favorito referencia conteúdo visível; revogação de acesso retira leitura, não concede acesso pelo favorito. PDF e código não comprovam validade dos conselhos clínicos dos mocks; revisar antes de publicar.

## Fluxos e alternativas

1. T19 alterna Atividades/Orientações, busca título/tema e abre T20 com autor/versão e apoio de leitura.
2. Usuário vinculado pode acessar orientação específica da criança; sem evidências, sistema apresenta geral identificado.
3. Professor abre T21, escolhe tipo/template, escreve, pré-visualiza e salva rascunho ou publica.
4. Backend cria versão e atribuições; o mesmo serviço alimenta lista, perfil e tarefa. Usuário pode favoritar item visível.

Alternativas: busca vazia difere de erro de consulta; orientação individual ausente não é falha; conteúdo retirado→informar indisponibilidade; destino revogado→não publicar; erro mantém draft; conflito preserva rascunho; mídia não revisada impede publicação com declaração de Libras acessível.

## Dados/persistência e integrações

guidance/versions/favorites e activity_templates/assignments em PG, fontes/licenças/revisão registradas. Repositórios não importam tipos de mocks; F04 executa templates, F03 aplica avaliações e F06 apoia rascunhos. Conteúdo de biblioteca pode ter cache versionado, mas individual deve revalidar permissão. Nenhuma simulação espalhada em componentes.

## UI, acessibilidade e temas

T19–T21: listas legíveis com filtros simples; vazio, erro, loading, salvando, publicado, draft e não salvo. Editor texto simples suficiente, sem exigir rich text inacessível. Labels/contagem de caracteres, prévia, foco e teclado; leitura com Ouvir/Parar/Repetir e Libras apenas no conteúdo coberto com alternativa textual. Todos os temas/alto contraste e A01–A12 pertinentes, identificação do autor textual.

## Critérios de aceite

- **A1:** geral disponível sem nível/criança; orientação individual não vaza para outro adulto; busca vazia e erro distinguíveis.
- **A2:** professor publica orientação individual e outro adulto vinculado a recupera após reinício; versão/autoria/revisão visíveis.
- **A3:** criar atividade produz template suportado e atribuição executável ou observação externa explicitamente indicada; listagens refletem publicação; responsável sem papel docente é bloqueado.
- **A4:** favorito persiste por usuário e não permite leitura de conteúdo após revogação; conteúdo de IA nunca autopublica.

## Dependências/pendências

F01/F02/F04/F09/F10; D03 revisa conteúdo, D05 vídeos, D09 confirma interpretação de autoria de avaliação. Sem editor irrestrito e sem catálogo curricular enorme por inferência do protótipo.

## Revisão0.2 — usos opcionais da API pronta

Após o núcleo F06, professor pode solicitar rascunho de questão dentro de template existente, informando habilidade, conteúdo de referência e nível já confirmado. API retorna enunciado, alternativas/gabarito quando cabíveis e referências; isso vira draft, nunca publicação automática. Aceite futuro: professor consegue revisar/corrigir e só depois atribuir; modelo não cria motor de atividade ou rubrica nova.

Perguntas simples opcionais são de adultos, limitadas a ajuda e conteúdo pedagógico permitido, com resposta ancorada e possibilidade de “não há base para responder”. Não é chat infantil irrestrito nem substituto de UC006/UC007. Ambos os usos dividem a cota global da API; não têm prioridade sobre a análise individual e não são novos RF obrigatórios por esta proposta. Público real e orientações profissionais permanecem D15; sem chamadas/validação realizadas.
# Adendo de implementação · 29/10/2026

Biblioteca/autoria permanece em Perfil e atalhos do professor. “Ver instruções, itens e critérios” abre apresentação dedicada; gabarito pertence ao conteúdo adulto, não ao executor infantil. Autor pode arquivar/restaurar com confirmação, versão e idempotência. Conteúdo arquivado sai das novas atribuições e dos catálogos de outros adultos; snapshots, tentativas e relatórios já existentes são conservados. Não há exclusão física de histórico. Restaurar uma publicação exige parecer da versão atual. Cancelar/arquivar/filtrar/restaurar foram exercitados na UI com rascunho fictício. Edição/publicação continua sujeita às permissões e D03. [Revisão 15](../15-revisao-ux-jornadas.md).
