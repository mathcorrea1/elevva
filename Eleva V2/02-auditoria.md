# Auditoria do protótipo e recomendação

## Recomendação fundamentada

Escolher o **caminho 2: reconstrução gradual da apresentação**, com correções específicas em domínio, estado e integração. A base é pequena o suficiente para evoluir e tem separações aproveitáveis; a maior fragilidade está na mistura entre telas densas, regras pedagógicas locais e entidades inteiras mutáveis.

| Caminho | Esforço relativo de reorganização* | Regressão e teste | Avaliação |
|---|---|---|---|
| 1. Evoluir telas atuais pontualmente | 0,8–1,1 | Menor alteração inicial, mas mantém navegação densa e cores fixas; repetição de correções | Adequado para correções emergenciais; insuficiente para a revisão UX solicitada |
| 2. Reconstruir apresentação, preservar base útil | 1,0 (referência) | Permite migrar um fluxo por vez e testar tokens/componentes antes das telas | **Recomendado**; adapta repositórios e regras sem descartar infraestrutura útil |
| 3. Reconstruir integralmente | 1,6–2,2 | Recria navegação, formulários, gravação e contratos; perde referência executável | Sem evidência que justifique o custo no TCC |

\* Estimativa de planejamento, não medição ou prazo fechado. Backend, validação pedagógica e produção de Libras são esforços comuns aos três. A data da banca e disponibilidade da equipe não foram informadas.

## Estrutura e stack reais

`src/screens` agrupa telas por módulo; `components/ui`, `components/domain`, `hooks`, `services/api`, `services/ai`, `store`, `utils`, `theme` e `mocks` já delimitam responsabilidades parcialmente. **Não é uma organização integral por feature.** Os tipos de domínio estão em `src/@types/navigation.d.ts` junto às rotas, e regras importantes ainda vivem nas telas.

| Base real (package.json/arquivos) | PDF cap.9 pp.56–61 | Decisão |
|---|---|---|
| RN 0.79.6, Expo ^53, React 19, TS ~5.8.3 | RN 0.79.x, SDK53, TS5.8.x | Preservar inicialmente; não atualizar automaticamente |
| React Navigation 6, Zustand5, Axios1, RHF7, Zod3 | Estado/HTTP/testes previstos | Reaproveitar com contratos corrigidos |
| AsyncStorage e SecureStore | Sessão/persistência previstas | Sessão local não é persistência do domínio; web exige solução própria de sessão |
| expo-av15, FileSystem18, ImagePicker16 | Bibliotecas nativas não detalhadas | Áudio parcialmente implementado; qualquer migração de mídia deve ser isolada |
| Poppins, gradientes, Reanimated3 e MotiShim próprio | Interface acessível | Preservar fontes/ativos úteis; revisar legibilidade e redução de movimento |
| Jest29, RNTL13, ESLint8, Prettier3 | Jest/Pytest | Corrigir configuração Jest antes da migração de telas |
| Sem API Python, migrations, PostgreSQL ou SDK Clerk no código principal | FastAPI/Python, ORM, Alembic, Neon e Clerk | **Ausentes**, não infraestrutura pronta |

README menciona Gemini/STT, Moti/Lottie, pinning, segurança e backend. Isso não comprova instalação ou funcionamento. MotiShim é implementação local com Reanimated; Lottie não consta nas dependências diretas. Nenhum manual de identidade oficial foi localizado: Eleva/Elevva/alfabeta são grafias existentes, não marcas parceiras. **USU** define azul e branco; tons finais são proposta.

## Evidências técnicas

Referências são relativas a `alfabeta/`; funções citadas são localizáveis por busca mesmo se linhas mudarem.

| ID | Evidência | Implicação e correção proposta |
|---|---|---|
| E01 | `services/api/auth.service.ts`, login/register/forgotPassword; `mocks/auth.mock.ts` | Mock aceita credencial não vazia e sempre retorna Maria, teacher; cadastro e recuperação retornam sem gravar/enviar. Não há contas reais |
| E02 | `services/api/child.service.ts`, `let localChildren`; `store/child.store.ts` | Dados duram no módulo em memória; update envia Child completo e ignora resposta canônica; fetch sem finally pode manter loading. Adotar comandos específicos e resposta do servidor |
| E03 | `mocks/children.mock.ts` apaga `activities`; `activity.service.ts` usa catálogo distinto | Histórico simulado e atividades do estudante divergem; estatísticas podem mostrar zero apesar dos exemplos originais |
| E04 | `ActivityListScreen.tsx`, childId fixo `child-1`, conclusão por setState; `ActivityDetailScreen.tsx:73` | Atividade pode usar criança errada; iniciar apenas goBack. Não existe executor completo de leitura/escrita/jogo |
| E05 | `AssessmentScreen.tsx:27,192,194` | Critérios por nível, score sugerido = itens/total; adulto escolhe nível e score; salva progress=score, marca assessmentCompleted. É avaliação manual, não detecção IA validada |
| E06 | `utils/trails.ts`, blueprint/normalizeTrails/completeTrailTask | Funções reaproveitáveis; trilhas têm mesmo conteúdo para todos os níveis, variando rótulo. Função de conclusão não valida bloqueio por si só |
| E07 | `TrailDetailScreen.tsx`, completeTask/completeCurrentTrail | Tocar tarefa a conclui; atalho conclui todas sem execução. Reaproveitar visualização/conceito, exigir tentativa ou observação persistida |
| E08 | `gemini.service.ts`, endpoint gemini-1.5-flash, JSON.parse/parseLevel; `useAI.ts` | Chave pública e chamada direta; sem schema, timeout ou revisão; fallback por substring pode confundir “silabico-alfabetico” com “alfabetico”. Não atesta disponibilidade do modelo |
| E09 | `speechToText.service.ts`, `useAudio.ts`, `AudioActivityScreen.tsx` | STT separado existe no cliente; formato/gravação/permissões não validados por plataforma. Áudio altera nível e soma 6 ao progress; “Salvar sessão” apenas volta. Nenhuma chamada real executada nesta análise |
| E10 | `progress.service.ts`, `ChildProgressScreen.tsx`; `StudentReportScreen.tsx:178` | Linha do tempo fixa para qualquer ID; bimestreReports pré-preenchidos. Não há geração baseada no novo histórico; exportar PDF possui handler vazio |
| E11 | `ReportScreen.tsx:80`; `DashboardScreen.tsx:81,167,218` | Atenção = três menores progressos; dashboard usa nível esperado por idade, <25 e destaque ≥60. Regras divergentes, sem validação pedagógica localizada |
| E12 | `CreateActivityScreen.tsx:56`, `CreateGuidanceScreen.tsx:57` | Criam itens dentro de Child em memória; lista global consulta outro serviço. Fluxos de autoria existem, persistência e sincronização não |
| E13 | `ProfileScreen.tsx`; `GuidanceDetailScreen.tsx` | Avatar só em useState; não há edição cadastral real; “conta verificada” é conteúdo da interface. Favoritos só locais; configurações suporte/notificações/termos sem ações |
| E14 | `theme/colors.ts:155–157`, `RootNavigator.tsx`, `app.store.ts`, `App.tsx` | Preferência light/dark/system persiste por dispositivo, mas palette é calculada no import. Render do navigator não recalcula styles estáticos. Config app.json força light |
| E15 | Splash/Login, `ChildProgressScreen.tsx` e `Modal/index.tsx:62` | Roxo/cores brancas/gradientes fixos fora dos tokens; gráfico com largura no escopo do módulo; modal com altura percentual. Trocar paleta não resolve contraste/reflow |
| E16 | Button e Input possuem rótulos; Modal, MotiShim, charts e Pressables restantes | Há base acessível parcial, sem cobertura demonstrada de foco, estado, teclado, zoom, redução de movimento, alto contraste, leitura ou Libras |
| E17 | `services/api/client.ts` | forgot-password é tratado como protegido; refresh tem ciclo entre client/auth/store e resolve fila antes de enfileirar a requisição inicial; falha não rejeita toda fila. Corrigir ou substituir pelo adaptador de sessão Clerk |
| E18 | `auth.store.ts`, logout/hydrate | Sair limpa tokens/usuário, não limpa ChildStore e caches; hydrate confia na presença de token. Exigir validação de sessão e limpeza entre contas |
| E19 | `navigation/BottomTabNavigator.tsx` | Seis abas para ambos os adultos, stacks sem tipagem efetiva em vários pontos, uso frequente de any. Sem fluxo infantil separado, sem rota dedicada de vínculos/turmas |

Não há importação direta de arrays mock nas telas principais inspecionadas; o acoplamento é também **indireto**: child-1 fixo, entidades com histórico embutido, tipos importados de mocks no guidanceService e listas globais distintas. Apenas desligar IS_MOCK não cria API, autorização ou consistência.

## O que preservar e como corrigir

Preservar RHF/Zod, labels e estrutura de Button/Input, Header, EmptyState, hooks como fachadas, configuração de fontes/locales, operações puras de trilhas e enum dos cinco níveis como vocabulário provisório. Reespecificar regras e remover cores do domínio. Adaptar componentes para tema reativo; rever modais, gráficos e cards antes de reutilizá-los.

Extrair entidades de navigation.d.ts para features; fazer tela consumir casos de uso/hooks, repositório consumir HTTP e backend validar autorização/regras. Não transportar o PUT integral de Child para o novo backend. O desenho de sequência do PDF (pp.51–52) é evidência do fluxo, não obrigação de manter sua atomicidade frágil.

## Verificações realizadas

`npm run type-check`: exit 0. `npm run lint`: exit 0. `npm test -- --runInBand --watch=false --no-cache`: exit 1, 3 suítes, 1 aprovada/2 falhas; 1 teste executado e aprovado. Falhas de import ES module em expo-linear-gradient e colisão entre tmpcheck/package e tmpcheck2/package. Não foram corrigidas por se tratar de especificação.

O `dist` existente, de maio, foi servido localmente em 127.0.0.1:8765: splash, erro `getValueWithKeyAsync is not a function`; screenshot em evidências. O storageService atual já contém ramo web, portanto **não se atribui automaticamente esse erro ao código atual**. Não houve inspeção interativa das telas internas atuais nem execução Android/iOS. As figuras do TCC e o código sustentam a revisão de hierarquia; um build atual e teste assistivo permanecem no primeiro incremento.
