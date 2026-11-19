# Eleva — experiência integrada e verificação local

Atualização de 19/11/2026, posterior ao checkpoint 23. Código evoluído sobre `c6f25f6`, preservando o projeto em `alfabeta/`, os bancos e as alterações anteriores. Este registro distingue implementação, execução local e dependências externas; não constitui homologação de produção ou validação pedagógica.

## O que mudou no produto

- **Entrada:** onboarding preservado; login mais compacto, senha visível/oculta e composição própria para celular e desktop. Configurações de acessibilidade saíram da entrada por solicitação do usuário. Rótulos, fonte do sistema e operação assistiva continuam disponíveis.
- **Navegação:** os contextos adultos compartilham Início, Estudantes, Trilhas, Relatórios e Perfil. Escolas/turmas ficam nos atalhos docentes. Tocar numa aba abre seu destino principal, sem ressuscitar uma tela interna antiga. Alterar profissão limpa o contexto escolar anterior; preferências visuais não desmontam formulários.
- **Início:** responsável escolhe explicitamente o estudante; professor tem criação manual de aula como ação principal; gestor organiza a escola. IA fica apresentada como módulo opcional da escola, conforme direção atual do pitch. Não foi criada cobrança, assinatura ou restrição comercial às adaptações.
- **Estudante:** Aprender, Acompanhar e Perfil separam ações da aula, evidências e cadastro/vínculos. Lista compacta, busca, paginação e Adicionar no cabeçalho foram mantidos. Edição dos apoios volta a salvar uma lista, sem juntar valores em um único item.
- **Escolas:** escolha de escola → turmas → estudantes/matrícula/relatório; criação em painéis menores. Matrícula continua exigindo vínculo e não abre acesso a outros adultos.
- **Autoria:** biblioteca com busca e filtros sob demanda, opções de uso/edição/cópia/compartilhamento e confirmação explícita da atribuição. Convites mostram o nome do autor; compartilhamentos enviados mostram o destinatário. Editor aguarda o carregamento da versão antes de permitir digitação, evitando sobrescrita tardia.
- **Trilhas:** capa/título abrem o percurso; opções secundárias ficam nos três pontos; filtro por nível sob demanda. Se ainda não há estudante selecionado, o app lembra a trilha clicada e continua nela após a escolha explícita.
- **Relatórios:** panorama em Resumo/Estudantes/Evidências; individual em Resumo/Respostas/Histórico; coletivo em Resumo/Estudantes. PDF permanece acessível pelo cabeçalho. Corrigido o contrato que descartava totais, série, perfis e paginação do coletivo e causava falha de renderização.
- **Perfil e configurações:** nome/contexto, convites, identificação compartilhável, ajuda e saída. Aparência/Leitura/Libras têm áreas próprias; feedback e informações técnicas ficam sob demanda. Ouvir/Parar/Repetir aparecem conforme o estado real, sem pausa fictícia.

Componentes comuns novos: `ScreenTitle`, `ShortcutGrid`, `Metrics` e campo de senha. Cores/estados continuam nos tokens reativos existentes. Painéis web têm um único diálogo nomeado, contenção de foco e retorno ao controle de abertura.

## Persistência e contratos acrescentados

`AssessmentDraft`, migration `e16891ac5603` após `d09128ba3402`: um rascunho por estudante **e adulto**, com corpo validado, versão e data. GET/PUT `/students/{id}/assessment-draft` verificam vínculo. Retry usa a mesma chave; versão antiga recebe conflito. A conclusão da avaliação elimina somente o rascunho do autor, na mesma transação. Rascunho não conta como avaliação finalizada nem confirma nível.

No aplicativo, o rascunho é recuperado do servidor. Ao sair com alterações, é possível salvar e sair, continuar ou descartar o que não foi salvo. Campos aguardam a hidratação para que a resposta inicial da API não apague a primeira digitação. Salvamento de rascunho é explícito; não foi anunciado como salvamento contínuo de avaliação.

Análise IA: snapshot v2 e instrução 0.2 usam cinco categorias explícitas (`pre-silabico`, `silabico-sem-valor`, `silabico-com-valor`, `silabico-alfabetico`, `alfabetico`). `silabico` genérico só é aceito na leitura de análises legadas v1. Nenhum registro histórico foi reclassificado. Isso harmoniza o contrato técnico, sem aprovar rubrica ou comprovar inferência do Groq.

Identidade: quando existe bearer explícito, o backend não mistura seu transporte com outro cookie de sessão. A identidade continua sendo consultada no Better Auth; não foi criada autenticação simulada paralela.

## Percursos executados no navegador

Dados inteiramente fictícios, Better Auth e SQLite reais de desenvolvimento, API atual em 8100 e app atual em 8081:

1. Entradas distintas A, B, P, Q e G. A recebeu Lia/Nina/Theo; B recebeu Bia/Caio; P e Q mantiveram seus grupos. G recebeu somente escola e vínculos explicitamente concedidos. Escola/profissão não abriram o relatório de Alex.
2. P cadastrou **Alex · revisão integral**, registrou avaliação descritiva e atribuiu a aula sintética Oficina de palavras. Foi criado um cadastro novo; os cinco estudantes-base foram preservados.
3. Aula de oito telas: escolha única, múltipla, ordenação, associação e escrita. Pausa após selecionar parcialmente a ordenação, recarga e retomada preservaram tela e resposta parcial. Entrega registrou quatro acertos corrigíveis e uma escrita pendente, sem zero automático.
4. P revisou `casa.` como variante aceita, com justificativa explicitamente técnica. Relatório passou a cinco respostas aceitas; nível continuou **não confirmado**. Não se trata de aprovação pedagógica da atividade.
5. Avaliação parcial de Nina foi salva, recarregada e recuperada; permaneceu rascunho, sem fabricar avaliação concluída.
6. G criou aula de três telas no construtor, salvou, visualizou prévia e disponibilizou demonstração sintética. Q aceitou o compartilhamento e atribuiu a versão a Caio. Q continuou sem acesso aos estudantes de G/P.
7. P criou turma fictícia, matriculou Alex e abriu relatório coletivo. PDFs individual e coletivo foram baixados pela interface e abertos como PDFs válidos de uma página.
8. P convidou G para Alex; G aceitou e abriu o relatório. P revogou. Requisições posteriores de relatório, histórico, apoios e análises retornaram 404; ao voltar à listagem, Alex desapareceu para G. Não há promessa de notificação instantânea por push da revogação.
9. Claro/sistema, escuro, contraste independente e texto a 150% foram operados. Em 320 px não houve transbordamento horizontal do documento. Preferências salvas foram recuperadas pela conta. Painel web: um diálogo nomeado, Tab contido, Escape fecha e foco volta ao acionador.
10. Vozes PT-BR estavam disponíveis no navegador: Ouvir iniciou `speechSynthesis`, Parar interrompeu e Repetir iniciou outra leitura. A execução técnica foi observada; não houve avaliação humana da inteligibilidade do áudio.
11. Boot da exportação web atual também foi verificado em servidor estático temporário. A origem temporária não foi liberada na identidade: teste limitado à entrada/onboarding; o percurso autenticado ocorreu na origem 8081 autorizada. Não foi usado o `dist` antigo como prova.

Capturas reais e tamanhos: [galeria](evidencias/ux-final-galeria.html). Recibo: [verificações](evidencias/ux-final-verificacao.json). Os registros adicionais criados manualmente nesta revisão ficam no banco local e não são uma nova aprovação do catálogo nem estatísticas paralelas ao seed.

## Verificações e limites

- Backend: **70 testes**; frontend: **29 testes em 17 suítes**; type-check e lint aprovados. Cobertura inclui isolamento, revogação, idempotência/transação, preservação de versões, respostas, revisão escrita, falhas IA, rascunhos e contraste dos tokens. Não é cobertura exaustiva de todos os controles.
- Migration aplicada no SQLite conhecido com backup; cadeia completa aplicada em outro SQLite descartável. Head `e16891ac5603`. [SQL PostgreSQL gerado offline](evidencias/ux-final-postgresql-offline.sql); **não executado em PostgreSQL**.
- Seed repetido sem alterar contagens das tabelas ou o cadastro de Alex. Cinco contas de revisão, incluindo G gestor; acessos em `identity/ACESSOS-TESTE.local.md`, ignorado pelo git. Reexecução não restaura concessões revogadas por rotina.
- Exportações web e Android/Hermes aprovadas. **Exportação Android não é APK.** Gradle bloqueou antes da compilação: Java/JAVA_HOME ausentes; SDK/adb não disponíveis. Configuração de release também recusa as URLs localhost atuais; assinatura de distribuição ainda precisa ser configurada, pois o projeto herdado usa chave debug.
- Groq live não executado, pois não há chave configurada. O modelo continua `openai/gpt-oss-120b`, exclusivamente no backend. Exemplos pré-gerados continuam identificados. A IA pode ser apresentada como oferta adicional, sem alegar serviço contratado ou qualidade comprovada.
- VLibras: script, launcher e player web carregaram; tentativa real de tradução expirou, com mensagem de ausência de dados e resposta 404 de entrada do dicionário. **Nenhuma tradução concluída foi comprovada.** Textos continuam acessíveis; WebView Android segue experimental desabilitada por padrão e vídeos revisados continuam ausentes.
- Não houve validação NVDA/TalkBack, aparelho Android físico, iOS, WCAG completa, professor/aluno real, pesquisa de impacto ou aprovação de Libras. D03/D15 permanecem abertas.

## O que depende da equipe e do ambiente

1. Hospedagem/HTTPS e PostgreSQL; SMTP para recuperação/verificação de e-mail; configuração segura de Groq para prova real contrastante. Não enviar segredos no chat nem embuti-los no APK. Desenvolvimento local segue utilizável sem esses serviços.
2. Java/SDK, assinatura e aparelho Android para montar/instalar/testar APK; iOS em ambiente próprio. Não houve download de LLM, treinamento, provisionamento, contratação ou deploy.
3. Designação e revisão pedagógica do instrumento, conteúdos, critérios de correção/nível e orientações; revisão dos vídeos essenciais em Libras e direitos de uso. Materiais de demonstração continuam sintéticos até lá.
4. Receber o TCC revisado pelo colega para confrontar a redação final com este estado. O documento revisado ainda não foi entregue a esta execução. Evitar converter as verificações técnicas acima em resultado com público real.

Os RF/RNF/UC originais mantêm seus IDs e prioridades. O novo rascunho e o módulo comercial opcional são evolução técnica/pedido atual, não exigências acadêmicas originais. RF005/RF006 e RNF006/RNF008 não ficam integralmente concluídos pela existência deste código.
