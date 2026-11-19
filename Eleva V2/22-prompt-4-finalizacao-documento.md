# Prompt 4 — produzir o documento final consolidado

**Envie este arquivo na mesma conversa do Claude após os prompts anteriores.** Complemento final de redação e decisões, referência19/11/2026. Não é um novo pedido de planejamento ou de implementação.

---

Agora finalize o documento acadêmico do Elevva a partir da versão que você já produziu nos passos 1,2 e3. Preciso de **texto completo, coeso e pronto para conferência e formatação final pelos autores**, sem comentários editoriais espalhados, perguntas rotineiras, “TODO”, “definir depois” ou capítulos apenas esboçados.

As decisões funcionais e técnicas estão tomadas neste prompt e no prompt3. Não reabra discussão de stack, modelo de IA, perfis, vínculos, arquitetura, plataforma ou existência de relatórios/trilhas. A equipe trabalhará na conclusão técnica até meados de dezembro, com15/12/2026 como referência de planejamento; não é data de banca confirmada.

**Feche a redação e as decisões agora.** Para resultados, use o que foi efetivamente comprovado no corte disponível. Uma funcionalidade assumida para dezembro ainda não vira resultado experimental hoje. Escreva as limitações em prosa acadêmica completa, sem lacuna de redação; entregue ações operacionais em arquivo separado para os autores. Não invente aprovação, entrevista, participante, chamada de IA, APK ou resultado para preencher o documento.

## 1. Documento-base e orientações obrigatórias

Use a versão já revisada na conversa e preserve suas melhorias. A última base enviada pela equipe é `ModeloEntregaFinal-1.pdf`, de 62 páginas; o original histórico `Eleva-TCC-original.pdf`/`Eleva-TCC.md` tem63 páginas e não deve sobrescrever correções da base mais recente. Recalcule referências de página, títulos, figuras e quadros.

As orientações do professor são definitivas:

1. Aplicar as correções da banca1 que constarem da lista/ata/arquivo comentado recebido. Se essa lista não estiver disponível, a declaração “todas as correções foram aplicadas” não tem fundamento e deve ser omitida; registrar a conferência documental no arquivo de providências da equipe, sem paralisar os capítulos.
2. Atualizar diagramas e suas explicações conforme o modelo implementado e os limites da evidência.
3. Retirar o capítulo de Prototipagem das telas. Imagens atuais da aplicação vão para **Resultado e discussão**, acompanhadas de análise de comportamento, requisito, contribuição e limite.
4. Renomear Proposta de desenvolvimento para **Desenvolvimento**.
5. Incluir **Resultado e discussão**, **Conclusão** e, por decisão da equipe, **Trabalhos Futuros**. Conclusão e Trabalhos Futuros podem ter cerca de uma página cada, sem superficialidade.
6. Alinhar tempos verbais ao conteúdo: atividade realizada no passado; funcionamento implementado no presente; requisitos como especificação; expansão em Trabalhos Futuros. Não converter promessa em realização por alteração do verbo.
7. Atualizar Resumo e Abstract de forma equivalente, sumário, listas, remissões e referências no padrão da instituição.

Não altere dados/percentuais da pesquisa original para combinar com o produto. Pesquisa de interesse não é teste de eficácia do aplicativo final.

## 2. Decisões finais de escopo — adotá-las na redação

| Tema | Decisão fechada |
|---|---|
| Produto | Aplicação educacional de apoio à alfabetização, integrando autoria, aulas/trilhas, execução, acompanhamento e relatórios; tecnologia auxilia o adulto, sem substituir responsabilidade pedagógica |
| Plataformas | Web e APK Android como entrega-alvo; iOS mantém portabilidade arquitetural, sem homologação assumida nesta entrega |
| Evolução técnica | Manter a raiz `alfabeta/`, React Native/Expo/TypeScript e reconstrução gradual da apresentação; organização por funcionalidade e componentes/tokens reutilizáveis |
| API e dados | FastAPI/Python/Pydantic, SQLAlchemy e Alembic em monólito modular; SQLite local já utilizado, PostgreSQL/Neon como destino de validação final; sem NoSQL, Redis, banco vetorial ou microserviços necessários |
| Identidade | Better Auth adulto, substituindo Clerk; cadastro/login/saída e recuperação por adaptador; autenticação não é mock integrado |
| Atores e acesso | Responsável e docente adultos; gestor institucional contextual; execução do estudante supervisionada. Vínculo N:M explícito, convite/aceite/revogação; profissão/matrícula/equipe escolar não concede dados individuais |
| Estudantes | Cadastro/lista compacta com busca/paginação, cadastro acessível e apoios opcionais; condições clínicas, deficiências, comunicação e apoios em categorias diferentes; dados restritos exigem permissão própria |
| Aulas e compartilhamento | Construtor visual, sequência flexível de telas, conteúdo/mídia/atividade/conclusão, rascunho/prévia, revisão e versões; compartir com aceite e permissões; atribuir individualmente ou em lote a destinatários autorizados |
| Mecânicas | Escolha única, múltipla seleção, ordenação, associação e escrita curta. Configurações permitem letras/sílabas/palavras/frases sem criar um executor para cada exemplo; alternativas acessíveis ao arrastar |
| Progresso | API valida entregas/desbloqueios; posição/rascunho/respostas/tentativas persistem; observação adulta é evidência separada. Não há conclusão em massa por toque nem score fictício |
| Nível | Cinco categorias: pré-silábico; silábico sem valor sonoro; silábico com valor sonoro; silábico-alfabético; alfabético. Sugestão da IA e confirmação docente são distintas; registro silábico histórico sem detalhamento é preservado |
| Métricas | Contagens de tarefas, tentativas, resultados objetivos comparáveis e nível confirmado são medidas diferentes. Sem percentual global de alfabetização, limiar por idade, diagnóstico ou ranking arbitrário |
| Relatórios | Histórico, individual/período/bimestre e coletivo autorizado, detalhe por item/habilidade e revisão; dados derivados dos mesmos eventos; PDF gerado pelo backend. Calendário institucional e homologação do arquivo dependem de validação específica |
| IA | GroqCloud com `openai/gpt-oss-120b`, apenas pelo backend; instruções Markdown versionadas, sem treinamento próprio. Autoria de aulas e análise/recomendações são usos distintos, ambos no escopo |
| Autoria por IA | Objetivo/nível pretendido/formatos → saída validada → proposta editável → rascunho → revisão/publicação humana. Não consultar aluno nem enviar nome, escola, diagnóstico, contato ou áudio |
| Acompanhamento por IA | Evidências persistidas minimizadas e referências permitidas → sugestão/recomendações → revisão → confirmação docente. RF005/RF006 não são substituídos por geração de aulas. Insuficiência/falha preserva último confirmado e funcionamento do núcleo |
| Pedagogia | Instrumento/conteúdo versionado; autoria docente e aplicação são permitidas conforme autorização. Aprovação do catálogo é função de revisor designado, não consequência automática do perfil professor. Rubrica e eficácia não são inventadas pelo código |
| UX/acessibilidade | Azul/branco, Lumi como apoio visual, onboarding, uma tarefa principal por etapa e configurações em Perfil; claro/escuro/sistema, contraste independente, fonte/sistema, movimento reduzido, teclado/foco, semântica, leitura PT-BR e alternativas textuais |
| Libras | Apoio web por VLibras para trecho público/elegível explicitamente selecionado e consentido, em origem isolada; vídeos essenciais revisados/licenciados para cobertura delimitada Android/web. Sem intérprete próprio, tradução universal ou alegação nativa sem teste |
| Demonstração | Operadores adultos e dados integralmente sintéticos, contas distintas e seed reproduzível; não é liberação produtiva para menores nem estudo educacional com alunos reais |
| Fora deste ciclo | Cobrança/fórum/push, chat infantil irrestrito, STT automático, manuscrito/visão, modelo treinado do zero, avatar intérprete próprio, offline integral, publicação em lojas, certificação de segurança/acessibilidade ou escala empresarial |

O prompt3 detalha regras e aceites. Adote essas escolhas como **escopo especificado**, mantendo a distinção entre implementação existente, implementação assumida e validação. Favoritos, avatar, alteração verificada de e-mail e refinamentos adicionais são incrementos após o núcleo; não transformar recurso desejável em exigência original obrigatória.

## 3. Rastreabilidade definitiva

Preserve RF001–RF010, RNF001–RNF008 e UC001–UC014, com nomes correspondentes e prioridades originais. RF001–RF007 eRF009 são Obrigatórios; RF008/RF010 são Desejáveis. RNF001/002/003/005/006/008 são Obrigatórios; RNF004/007 são Desejáveis. UC não têm prioridade própria informada.

Autoria, colaboração, gestão e acessibilidade ampliada têm origem posterior explicitada. Não renumerar os originais, apagar obrigações ainda parciais ou atribuir ao PDF pedidos desta evolução.

Explique a revisão do UC006: IA sugere, docente confirma com evidências/justificativa. UC013 deve usar resposta neutra sobre e-mail, por segurança. Cadastro docente é ampliação explícita de RF003/UC003. Essas são decisões adotadas para a redação, para conferência dos autores/orientador, sem inventar aprovação já emitida.

Modelagem: N:M/grants; escola/equipe/turma/matrícula; conteúdo/revisão/compartilhamento/atribuição/tentativa; avaliação/observação/confirmação; análise da IA e geração de aula separadas. Usar código/modelos disponíveis; não criar tabela física de telas/questões quando o implementado é JSON versionado, nem transformar relatório derivado em estatística paralela.

## 4. Resultados: use o corte real para fechar o capítulo agora

Dados comprovados no corte de 19/11/2026:

- 67 testes backend aprovados;25 testes frontend em 15 suítes aprovados; TypeScript e lint aprovados.
- Exportações web e Android/Hermes aprovadas. Exportação não demonstra APK instalado ou TalkBack.
- Núcleo local com Better Auth, API e SQLite persistido; fluxos/testes de vínculos, conteúdo versionado, cinco mecânicas, retomada, relatórios e isolamento registrados nos materiais anexados.
- Servidor gera PDF real e testes verificam autorização/exclusão de dados restritos; não houve comprovação final de download/share em todas as plataformas ou PDF/UA.
- IA tem adaptadores, contratos, validação, revisão e testes com provedor substituído. Sem chave disponível no corte, **não há chamada real comprovada**.
- Libras possui entrada/isolamento e carregamento parcial observado; **não há tradução concluída, vídeo revisado ou teste nativo comprovados**.
- Não há rubrica/corpus com aprovação pedagógica demonstrada, piloto com estudantes reais, avaliação de impacto educacional, PostgreSQL remoto ou hospedagem final comprovados nesse corte.

Use recibos e materiais fornecidos. Se houver evidência posterior real na conversa, atualize data e resultado correspondente; caso contrário, mantenha o corte acima. Não apresente essas pendências como inexistência de todo o produto: discuta a contribuição do núcleo funcional e o limite específico de cada inferência.

Produza uma tabela de resultados com **requisito/promessa; método; evidência; resultado obtido; interpretação; limite**. Número de testes não é percentual de cobertura, validação pedagógica ou medição de aprendizagem. Interesse da pesquisa não é satisfação medida após uso. Não inventar p95, participantes, entrevista, teste de usabilidade, revisor ou parecer.

A redação final deve dizer, por exemplo, que foi implementada a infraestrutura de integração de IA e verificados contratos/falhas em ambiente de teste, mas que a execução externa não foi comprovada no recorte. Isso é texto acadêmico completo; não deixar “inserir resultado da IA” no lugar de uma discussão.

## 5. Tratamento final das validações externas

Tome como fechado o seguinte tratamento, sem devolver perguntas genéricas:

- **Revisão pedagógica:** processo definido com instrumento, exemplos, critérios, fontes, versão/data e revisor. Sem parecer recebido, a validação não compõe os resultados; discutir o limite do experimento sintético e manter a verificação técnica separada. Não inventar limiares para encerrar a seção.
- **Libras:** cobertura delimitada e processo de revisão/licença definidos. Sem arquivo/parecer, não alegar mídia revisada ou tradução universal; documentar o que foi integrado e o limite linguístico/plataforma.
- **Estudantes/usuários:** não assumir experimento com menores. Usar demonstração sintética e testes técnicos como método realmente disponível. Se avaliação com adultos vier documentada depois, acrescentar método/amostra/resultado sem extrapolar eficácia educacional.
- **Termos/privacidade:** demonstração técnica restrita e minimização não são homologação de uso infantil/LGPD. A liberação produtiva permanece fora da demonstração descrita; não apresentar parecer jurídico inexistente.
- **Ambiente/APK/serviços:** escolhas de arquitetura e metas estão fechadas. O texto relata o ambiente efetivamente verificado; implantação e provas posteriores atualizam os resultados somente quando executadas.

Não esconda em Trabalhos Futuros um requisito obrigatório descumprido como se fosse apenas uma nova ideia. Indique sua cobertura parcial na matriz e discuta o limite com precisão. Faça isso com prosa objetiva, sem repetir um aviso em toda página ou deixar o documento com aparência de checklist inacabado.

## 6. Imagens, referências e material ausente

Use somente imagens disponíveis e identificadas. Capturas reais devem ter ator, plataforma/contexto, comportamento, requisito e discussão. Não usar protótipo antigo para provar recurso novo, web estreita como APK, pré-gerado como IA live ou botão como Libras concluída.

Se uma imagem indispensável ainda não foi fornecida, organize sua requisição/legenda no **arquivo separado de providências**, sem fabricar figura, deixar remissão quebrada ou espalhar “TODO” no texto. Entregue o capítulo com as figuras existentes e discussão completa. Seja explícito na entrega à equipe sobre o que impede considerar o arquivo definitivo para submissão; não declarar que recebeu um print ausente.

Conferir fontes, datas, autores, edições e referências bibliográficas. Não inventar referência, citação ou dado pessoal para preencher campo. Metadado institucional indisponível deve ser preservado do documento-base ou solicitado no arquivo separado, sem nomes/datas fictícios. Sumário/listas automáticos dependem da atualização no editor e da inspeção do PDF final; não alegar que foram recalculados se o formato entregue não permite isso.

## 7. Entrega final — faça agora

Entregue dois arquivos, ou dois blocos claramente separados se não puder gerar arquivos:

**A. `ELEVVA-TCC-CONSOLIDADO`** — documento integral, não apenas novos capítulos ou recomendações. Preserve conteúdo válido dos passos anteriores; harmonize objetivos, escopo, requisitos, modelos, Desenvolvimento, Resultado e discussão, Conclusão e Trabalhos Futuros. Sem capítulo de prototipagem, comentários de chat, alternativa de stack em aberto ou instruções para o leitor completar parágrafos. Normas institucionais e autoria originais preservadas. Os limites reais são parte da discussão/conclusão.

**B. `ELEVVA-PROVIDENCIAS-DA-EQUIPE`** — somente conferências, arquivos e ações concretas fora da redação: lista da banca1; revisão dos autores/orientador; imagens faltantes; prova live de IA; rubrica/parecer; Libras/mídia; APK/TalkBack; PostgreSQL/serviços; revisão final de referências/formatos. Para cada item: responsável, entrega objetiva, evidência necessária e trechos a atualizar depois. Não reabrir decisões tomadas ou incluir perguntas técnicas rotineiras.

Antes de entregar, faça uma conferência de consistência:10RF/8RNF/14UC preservados; objetivos coerentes com conclusão; nenhum resultado inexistente; termos/atores constantes; figuras/quadros referenciados; nenhuma versão histórica restaurando Clerk ou treinamento próprio; nenhuma alegação de revisão/estudo sem fonte; nenhuma seção vazia.

Finalize com um resumo curto das alterações aplicadas e dos limites de submissão que ainda dependam de material ou conferência humana. **Não termine só com perguntas ou outro plano.** Uma redação completa pode relatar limites reais; não os elimine criando realizações que não ocorreram.
