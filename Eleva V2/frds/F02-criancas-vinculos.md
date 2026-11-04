# F02 — Crianças, necessidades e vínculos

## Adendo vigente — aulas e gestão de estudantes, 29/10/2026

A interface ativa usa **Estudantes**. Cadastro/lista/menu foram integrados com busca, paginação e vínculo gestor; turma opcional exige autorização. `StudentCare.characteristics` separa condições informadas, deficiências, comunicação e apoios, com preenchimento opcional, origem e nota restrita. Concessão específica governa o acesso; campos ficam fora de listagens e IA. Não são diagnósticos produzidos pelo aplicativo. [Fluxos, contratos, evidências e limites](../17-construtor-aulas-e-compartilhamento.md). Este adendo atende pedidos atuais; não altera prioridades acadêmicas originais.

---

## Objetivo, fontes e situação

Cadastrar criança e permitir colaboração controlada de vários adultos. **PDF** RF003 O p.37, UC003 NI p.41, UC011 NI p.45, §§7.1/7.2 pp.48–51; **USU** exige múltiplos adultos e adaptações sem diagnóstico. **CÓD** AddChild/childService/types, E02/E13/E19: cadastro em memória, necessidades capturadas; vínculo real ausente. **PROP** N:M com convites e permissões.

## Atores e permissões

Responsável gestor cria/edita/convida/revoga. Segundo responsável recebe escopo explícito. Professor só vê criança autorizada; pode criar registro escolar provisório restrito se D04 aprovado. Dados sensíveis exigem concessão específica; criança só vê nome/apelido e tarefa. Conhecer ID, escola ou nome não concede vínculo.

## Pré/pós-condições

Sessão válida; operação vinculada à criança autorizada, exceto criação. Convite exige gestor e destinatário adulto. Sucesso cria criança+primeiro vínculo atomicamente ou novo vínculo aceito; perfil não recebe nível pré-silábico automático antes da avaliação. Revogação mantém histórico/autoria e remove acesso futuro imediatamente.

## Campos, validações e regras

Nome2–60; nascimento DD/MM/AAAA na UI e DATE ISO na API, data real não futura; idade não define nível/atenção automática. Escola/turma IDs opcionais; não exigir instituição para uso familiar. Observação geral até1.000 caracteres; notas300. Adaptações funcionais independentes de condições médicas. Necessidades específicas do original são opcionais, com explicação de finalidade, “prefiro não informar” e sem inferência diagnóstica; não exibir badges clínicos nos cards gerais.

Convite: e-mail adulto verificado, papel e permissões; token aleatório/hash, validade proposta48h, uso único e destinatário conferido. Mesmo vínculo ativo é tratado idempotentemente; não duplicar criança para associar outro adulto. Não deduplicar automaticamente crianças só por nome/data de nascimento. Último gestor não pode ser removido sem transferência. Professor não se autoautoriza por cadastro de papel.

## Fluxos e alternativas

1. T06 identifica criança, dados opcionais e adaptações; revisa resumo e salva.
2. API cria registro+vínculo e retorna perfil; T07 mostra quem acompanha e escopos.
3. Gestor convida; destinatário entra em sua própria conta e abre T08, vê solicitação/escopo e aceita/recusa.
4. API valida e cria vínculo; ambos passam a consultar somente a criança concedida.
5. Gestor revoga e sistema bloqueia acesso inclusive por URL/ID/caches.

Alternativas: sem vínculos → convite/cadastro conforme ator; data inválida; falha no save mantém formulário; convite expirado/revogado/duplicado; e-mail de outra conta; conflito de edição; estudante arquivado. Recusa não concede acesso. Não mostrar informações da criança antes da validação do convite além do mínimo autorizado.

## Persistência e integrações

`students`, `student_adult_links`, `link_invitations`, suporte e notas sensíveis separados; audit_events de concessão/revogação. Repositório de estudantes e API de links; envio de convite por canal adulto configurado ou link copiado explicitamente para uso de demonstração, sem afirmar entrega de e-mail se não existir. IDs e permissões definidos pelo servidor. Sem PUT do agregado completo.

## Interface, acessibilidade e temas

T06–T08: etapas curtas, campos opcionais recolhíveis, resumo antes de conceder acesso, erro por campo, data com texto e entrada alternativa ao calendário. Checkboxes/switches com estado falado, grandes alvos, fluxo de foco/teclado. Estado “convite pendente” difere de vínculo ativo; salvamento pendente não aparece como criança cadastrada. Tokens para todos os temas; A01–A07/A11/A12 nos conteúdos essenciais.

## Critérios de aceite

- **A1:** criar criança e reabrir app/API recupera cadastro e vínculo; rollback não deixa criança órfã se criação de vínculo falhar.
- **A2:** segundo responsável e professor autorizados acessam a mesma criança por suas contas; convite usado/expirado e vínculo duplicado são tratados sem duplicação.
- **A3:** adulto/professor sem vínculo recebe bloqueio em perfil, histórico, relatório, mídia e IA; revogação efetiva também em sessão já aberta.
- **A4:** adaptações funcionam com necessidades em branco; nota sensível não aparece no resumo de turma nem no prompt da IA.

## Dependências e pendências

F01, modelo/grants no backend, transporte de convite. D04 para criação escolar provisória/gestão; D13 para tratamento de dados reais; D03 para uso pedagógico de adaptações. Cardinalidade do PDF precisa ser atualizada na documentação final.
