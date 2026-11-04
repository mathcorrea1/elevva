# F09 — Escolas, turmas e acompanhamento docente

## Adendo vigente — aulas e gestão de estudantes, 29/10/2026

Atribuição de aulas a estudantes/turmas/escolas próprias é transacional, idempotente e deduplica destinatários. Matrícula/profissão não substituem grant ativo. Cadastro em turma pode criar vínculo e matrícula autorizada na mesma transação. Compartilhar conteúdo mantém isolamento dos estudantes. Contexto e relatórios possuem detalhes paginados e agregação global autorizada. [Fluxos, contratos, evidências e limites](../17-construtor-aulas-e-compartilhamento.md). Este adendo atende pedidos atuais; não altera prioridades acadêmicas originais.

---

## Objetivo, fontes e situação

Organizar acompanhamento docente sem criar ERP escolar. **PDF** público-alvo §1.2 pp.13–16, stakeholders pp.34–35, School/Turma §§7.1/7.2 pp.48–51, cap.8 p.54 e relatórios coletivos §3.2 pp.27–28; NI. **CÓD** E19: tipos e agrupamento por nome, botões Turmas/Ver turma vão para lista geral; CRUD/contexto persistido ausente. **PROP** gestão mínima por professor e grants explícitos.

## Atores/permissões e pré/pós

Professor gerencia seus contextos docentes, cria turma mínima e acompanha estudantes com vínculo. Responsável vê escola/turma da criança quando compartilhada, sem acesso a colegas. Não existe superadministrador com acesso geral no escopo inicial. Pré: conta docente e concessões; pós: escola/turma/matrícula salvas, listagem/report autorizado consistente. Criar contexto não concede acesso a criança alheia.

## Campos, validações e regras

Escola: nome2–120, ID; turma: nome2–60, schoolId, ano letivo válido, período ativo; vínculo docente com datas; matrícula com studentId, início/fim e escopo. IDs diferenciam nomes iguais; escola pode ser contexto informado pelo adulto sem afirmar parceria/validação institucional. Não exigir CNPJ/contrato/licença de assinatura no TCC. Contexto “sem escola/turma” permitido para família.

Associar estudante exige autorização prévia ou convite F02; não buscar toda a base por nome para preencher turma. Professor só atribui para estudantes autorizados e não pode incorporar silenciosamente criança de outro responsável. Registro escolar provisório depende de D04; não duplica automaticamente um estudante já cadastrado. Mudança de turma conserva histórico e período de matrícula. Relatório coletivo nunca mistura escolas por string do nome.

## Fluxo e alternativas

1. T22 lista contextos do professor; escolhe escola/turma ou cria dados mínimos.
2. Adiciona estudante já autorizado ou solicita vínculo com responsável.
3. Abre perfil, registra avaliação F03, atribui template F07 ou abre relatório F08.
4. Atualiza contexto/matrícula com versão; histórico continua na criança e recorte temporal correto na turma.

Alternativas: sem turma→criar; turma sem estudantes→orientar vínculos; sem concessão→sem dados pessoais; nome duplicado→distinguir escola/ano; vínculo expirado/revogado→remover acesso; conflito/rede→formulário não salvo. Não prometer painel completo de gestão institucional ou importação de planilha.

## Dados/persistência e integrações

schools/classrooms/classroom_teachers/student_enrollments e student_adult_links no PG. API filtra pela identidade/grants; F08 agrega somente subconjunto autorizado. Seed de demonstração inclui turmas com mesmo nome em escolas diferentes para verificar isolamento. Sem banco em memória compartilhado por todos os docentes.

## UI, acessibilidade e temas

T22 e destino T18: lista simples escola→turma→estudantes, ação clara; dados coletivos sob demanda. Sem badges clínicos/percentuais por idade nos cards. Loading, vazio, sem vínculo, erro, salvando/conflito e contexto encerrado. Labels/combobox acessível na web, alternativas nativas, foco/teclado, grandes alvos e textos ampliados. Todos os temas A01–A07/A10/A11; leitura/Libras de ajuda conforme F10.

## Critérios de aceite

- **A1:** criar escola/turma, matricular estudante autorizado e reabrir conserva relações; mesmo nome em outra escola não mistura lista.
- **A2:** professor sem vínculo não vê aluno/relatório/IA, mesmo com matrícula manipulada no request; responsável não consulta colegas.
- **A3:** encerrar/mudar matrícula preserva histórico e recortes; atribuição coletiva valida cada destinatário, sem publicação parcial invisível.

## Dependências/pendências

F01/F02/F07/F08; D04 confirma criação provisória e governança de vínculo; D03 calendário escolar. Gestão institucional ampliada/licenciamento permanecem escopo comercial posterior D11.
# Adendo de implementação · 29/10/2026

Painel docente é distinto do familiar. Escolas é destino principal e percorre escola → turma → estudantes. `GET /teaching/context` revalida escola/turma do adulto, nega combinação alheia e consulta matrículas unidas a grants ativos. Revogação remove estudante inclusive do resumo. Busca textual não altera denominadores do contexto. Filtro de período afeta registros/conclusões; avaliação inicial pendente, tarefas abertas e acompanhamentos manuais abertos são estados atuais do histórico, sem regra clínica/idade ou ranking. Contexto salvo por adulto/dispositivo é preferência de interface, não autorização. Aplicar/cancelar/limpar filtros são distintos; trocar escola limpa turma/criança. Não escolher automaticamente a primeira criança/turma. [Código/testes/limites](../15-revisao-ux-jornadas.md).
