# Revisão com dados sintéticos — 29/10/2026

Objetivo desta carga: permitir ao usuário percorrer as telas e pedir ajustes com dados coerentes. Implementação continua em `alfabeta/`; identidade Better Auth e API FastAPI usam SQLite local de desenvolvimento. Não há serviço contratado, banco remoto modificado, deploy ou commit.

## Rodar e acessar

Na raiz, `.\iniciar-eleva.ps1`. Web: http://localhost:8081. Para parar: `.\parar-eleva.ps1`. [E-mails e senhas dos quatro perfis](../identity/ACESSOS-TESTE.local.md). Os processos rodam sem abrir janelas e os logs ficam em `.eleva-local`.

O iniciador verifica os marcadores dos serviços antes de reutilizar portas; não encerra processos de outros projetos. Antes de migrar/seedar, exige o arquivo local `backend/eleva-development.db` e identidade local SQLite. Faz backups em `.eleva-local/backups`. Rejeita PostgreSQL, produção e outro arquivo SQLite. O seed não envia e-mails nem chama a IA.

## Percursos prontos

| Conta | Perfil | Dados disponíveis |
|---|---|---|
| Ana | Responsável A | Lia com histórico e trilha; Theo com tentativa em andamento; Nina sem avaliação inicial |
| Marina | Professora P | Vínculos explícitos com Lia, Theo e Nina;2 turmas; autoria com3 rascunhos e snapshots de versões |
| Bruno | Responsável B | Caio com registros e tarefa concluída; Bia sem registros; não acessa crianças de Ana |
| Paula | Professora Q | Caio/Bia em outra turma; vínculo com Theo revogado; convite de teste permite exercitar concessão explícita |

Carga nova:4 contas reais no Better Auth local,5 crianças,6 atividades executáveis,3 orientações gerais,3 rascunhos,2 escolas,3 turmas,5 avaliações sintéticas,6 observações,6 orientações individuais,9 tarefas e6 tentativas. Há ainda pontos manuais de atenção, feedback, interesse futuro desativado, convite válido/expirado e exemplos de IA.

Lia começa com2 tarefas concluídas,1 tentativa em andamento e1 tarefa posterior bloqueada. Theo tem1 concluída,1 em andamento e1 posterior bloqueada. Nina/Bia mostram ausência de avaliação/registros. Relatórios individuais/coletivos usam essas tentativas, observações e avaliações; não há tabela paralela de estatísticas.

Use especialmente: entrar → abrir Lia → histórico/relatório → trilha → retomar; abrir Nina → avaliação inicial; entrar como Marina → Turmas/Biblioteca/autoria. Os convites e identificadores para teste estão somente no arquivo local de acessos. Usar um convite altera o vínculo real do cenário de teste.

## Repetição e conservação

`backend/scripts/review_data.py` usa IDs determinísticos por conjunto de contas e só acrescenta registros ausentes. Não altera campos já existentes, não reabre tarefas concluídas e não reativa vínculos revogados pelo usuário. Repetir a carga real criou0 registros. O teste automatizado também altera o nome de uma criança e comprova sua conservação na segunda execução.

Contas/dados anteriores foram preservados; as novas contas ficam em `identity/review-accounts.local.json`. O arquivo legível de acessos foi atualizado, com cópia anterior em backup. Nenhuma senha/token foi incluída no frontend, no APK, nos recibos ou em arquivos versionáveis. Todos os testes usam dados fictícios.

Datas dos eventos sintéticos têm referência29/10/2026, com histórico em outubro. Não são registros de observações reais. Os novos conteúdos estão marcados como sintéticos ou rascunhos; não foi inventado parecer profissional ou fonte aprovada.

## O que o seed não conclui

- IA: um exemplo de insuficiência e um de timeout, ambos `origin=pregenerated`, `model=demo/pregenerated-v1`. A interface informa “sem chamada de IA”. Não comprovam personalização ou integração Groq. O botão de gerar continua no adaptador real; sem chave, comunica indisponibilidade.
- Pedagogia: níveis permanecem nulos; nenhum conteúdo/instrumento foi publicado como aprovado. D03 permanece aberta. Exemplos servem para revisão de interface e fluxo.
- Libras: player/manifesto continuam sem vídeos revisados. Não foi inventado arquivo, intérprete ou revisão. VLibras permanece limitado à ajuda pública web.
- Serviços reais: Groq, PostgreSQL/Neon, VM e SMTP ainda precisam ser configurados e validados. Uso infantil/dados reais continuam sujeitos às decisões contratuais e de privacidade já documentadas.
- Produto: revisão individual das telas auxiliares, logo oficial, favoritos, avatar/alteração de e-mail, mídia privada e exportação de relatórios continuam no backlog. O APK/nativo, TalkBack e iOS precisam de validação própria; web não comprova essas plataformas.

## Verificações executadas

26 testes backend e15 testes frontend passaram; type-check e lint passaram. Novos testes cobrem repetição/preservação de edições, grants, bloqueio, relatórios e recusa de bancos remotos/arquivos inesperados. Starlette mantém o aviso de depreciação TestClient/httpx já registrado.

Integração local: os4 acessos autenticaram, cada grupo viu apenas as crianças autorizadas, relatórios alheios retornaram404 e o relatório de Lia correspondeu a2 tentativas concluídas. Parar/iniciar pelo helper conservou os dados. Na web atual foi conferido o início com3 crianças de Ana e o rótulo explícito do exemplo pré-gerado de IA. Recibo: [evidência](evidencias/seed-revisao-2026-10-29.json).

O Metro de desenvolvimento ainda emite avisos de dependências e um aviso React sobre a propriedade SVG `accessible`; isso não impediu o percurso, mas deve entrar na limpeza técnica antes da entrega. Não foi declarada avaliação integral de UX, acessibilidade ou cobertura das FRDs.
