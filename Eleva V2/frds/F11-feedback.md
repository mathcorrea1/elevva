# F11 — Feedback e participação futura

## Objetivo, fontes e situação

Coletar avaliação opcional e interesse em acompanhamento. **PDF** RF010 **Desejável**, p.38; pesquisa de interesse pp.26–27, sem UC detalhado. **CÓD** fluxo não localizado: ausente. **PROP** formulário simples após núcleo, sem fórum ou atendimento comercial.

## Atores/permissões; pré/pós

Adulto autenticado envia próprio feedback e administra adesão; criança não fornece contato. Pré: sessão e explicação da finalidade; pós: feedback/adesão salvos ou revogação registrada, sem afetar uso do app. Não incluir adesão automaticamente no aceite de termos.

## Campos e regras

Comentário10–2.000, categoria opcional (usabilidade/acessibilidade/conteúdo/outro), versão do app e plataforma técnicas. Orientar a não inserir nomes/diagnósticos infantis. Adesão futura checkbox separado, finalidade, versão do texto e data; contato adulto já verificado na conta, sem pedir dado da criança. Revogar não apaga magicamente pesquisas externas; política deve explicar o que é retido e como solicitar remoção.

## Fluxo e alternativas

T24 em Conta: escrever e enviar; API confirma. Separadamente marcar/desmarcar interesse futuro e salvar; adesão editável. Erro mantém texto; retry não duplica; sem rede indica não enviado; limite de envio abusivo retorna429. Recusar/cancelar não bloqueia nenhuma atividade. Não implementar envio de mensagem a terceiros nesta tarefa ou comunicação automática de pesquisa sem autorização apropriada.

## Dados/persistência e integrações

feedback e future_participation/consents em PG com userId/timestamps/versão. Endpoints próprios; apenas o autor acessa seu status no app. Gestão de pesquisa/contato fora da versão acadêmica inicial, sem supor ferramenta de e-mail/CRM. Proposta de retenção de feedback90 dias após banca, a confirmar em política D13 antes de dados reais; não é prazo legal presumido.

## UI, acessibilidade e temas

T24 com explicação curta, label/contagem de caracteres, estado separado de adesão, salvando/enviado/não enviado/erro. Confirmação em texto persistente, foco no erro, teclado e leitor; todos os temas/alto contraste e fonte do sistema. A01–A05/A10/A11; ajuda explicativa pode receber vídeo Libras do lote comum, sem prometer vídeo para cada comentário.

## Critérios de aceite

- **A1:** enviar feedback e recuperar status após reinício; adesão opcional e revogável sem restringir produto.
- **A2:** retry não duplica; outra conta não vê feedback; nenhum registro infantil é anexado automaticamente.
- **A3:** erro mantém conteúdo e leitor anuncia estado; temas/fonte não impedem envio ou revogação.

## Dependências/pendências

F01/F10 e política D13; prioridade permanece desejável. Não condicionar RF obrigatórios a esta entrega; adiamento deve constar da matriz final se faltar prazo.
