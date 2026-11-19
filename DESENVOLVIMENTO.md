# Abrir e testar o Eleva

**Atalhos fixos atualizados:** Libras e IA estão no canto inferior direito da área autenticada; IA abre a área existente. No executor infantil permanece só Libras. [Capturas atuais](Eleva%20V2/evidencias/atalhos-galeria.html) · [prova e limites do VLibras web](Eleva%20V2/25-atalhos-flutuantes.md). Login continua sem esses atalhos.

**Experiência integrada — 19/11/2026:** [mudanças e percursos executados](Eleva%20V2/24-implementacao-ux-integrada.md), [telas reais](Eleva%20V2/evidencias/ux-final-galeria.html) e [verificações atuais](Eleva%20V2/evidencias/ux-final-verificacao.json). Início docente prioriza criação manual; IA é módulo opcional da escola. Há rascunho de avaliação persistido por adulto, navegação uniforme e relatório coletivo corrigido. Serviços remotos, Groq live, revisão pedagógica/Libras e APK instalado continuam pendentes.

## Aulas, compartilhamento e estudantes — entrega atual

Execute **`.\iniciar-eleva.ps1`** no PowerShell, na raiz do projeto. Abra **http://localhost:8081** e use os [acessos locais de revisão](identity/ACESSOS-TESTE.local.md). A = responsável Ana; P = professora Marina; B/Q são o outro grupo. Os percursos abaixo funcionam no ambiente local de desenvolvimento.

Professor: **Início → Minhas aulas → Nova aula**. Preencha Sobre; em Telas adicione conteúdo/atividade, escolha o formato e configure o editor específico. Salve pelo cabeçalho, confira Prévia e disponibilize demonstração sintética. Publicação real continua exigindo revisão designada. Biblioteca permite usar, copiar, compartilhar e atribuir a estudantes/turmas/escolas autorizadas; destinatário docente aceita em Convites. No ateliê de trilhas, escolha “Aula com telas da biblioteca” para reutilizar uma revisão.

Responsável: **Estudantes → nome do estudante → Aulas para explorar**. Há escolha única/múltipla, ordenação, associação e escrita curta, com pausa/posição/rascunho persistidos. Theo conserva uma aula pausada; Lia tem entrega e revisão escrita fictícias feitas nos testes. Para começar novamente, o professor faz nova atribuição, preservando o histórico anterior.

Adicionar estudante fica no cabeçalho; três pontos reúne ações secundárias. Necessidades são opcionais e separadas por categoria restrita. Cadastro em contexto de turma pode criar a matrícula autorizada junto. Configurações continuam em Perfil → Configurações, incluindo aparência e tamanho do texto.

O seed v3 acrescenta três aulas reutilizáveis, trilhas por telas, convites de conteúdo e atribuições, sem apagar os cinco estudantes-base ou edições posteriores. Cadastros/versões criados pela revisão manual são preservados. São dados **fictícios persistidos**, não catálogo aprovado. [Capturas atuais](Eleva%20V2/evidencias/aulas-v4-galeria.html) · [implementação, contratos, testes e pendências](Eleva%20V2/17-construtor-aulas-e-compartilhamento.md).

Vídeo usa iframe web/WebView Android com alternativa textual, sem autoplay. Em release, `EXPO_PUBLIC_YOUTUBE_EMBEDS_ENABLED=false` mantém reprodução externa desabilitada até revisar direitos/legendas e obrigações do serviço infantil (D15). Preview técnico em desenvolvimento é operado por adulto. Não há vídeo Libras revisado ou chamada live Groq declarados como concluídos.

Estado da implementação: [checkpoint](Eleva%20V2/11-implementacao-e-checkpoint.md). O produto continua em `alfabeta/`. Os comandos abaixo são de **desenvolvimento local com dados fictícios**, não hospedagem final no computador da empresa.

## Rodar agora com a carga de revisão — 29/10/2026

Na raiz `Elevva`, execute no PowerShell:

```powershell
.\iniciar-eleva.ps1
```

Se a política do PowerShell impedir executar o arquivo, use esta alternativa restrita ao processo, sem mudar a política global:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\iniciar-eleva.ps1
```

Abra **http://localhost:8081**. O iniciador sobe Better Auth, FastAPI e Expo web, guarda logs em `.eleva-local`, faz backup dos bancos locais antes das migrations e prepara os seeds. As dependências deste workspace já estão instaladas. Em outra máquina, faça a preparação manual abaixo primeiro.

**Use os novos [acessos de revisão](identity/ACESSOS-TESTE.local.md)**. Ana/Marina acompanham Lia, Theo e Nina; Bruno/Paula acompanham Caio e Bia. Se estiver conectado a uma conta antiga, saia em **Perfil** e entre com o novo e-mail da tabela. As contas antigas e seus registros foram preservados.

**Jornadas atuais:** todos os contextos adultos têm Início, Estudantes, Trilhas, Relatórios e Perfil. Professores e gestores abrem Escolas e turmas pelo Início/Perfil. Em P selecione Escola Horizonte → Turma Descobertas para ver os dados populados; Escola das Nuvens demonstra uma turma vazia. Perfil → Configurações contém aparência, leitura e acessibilidade. G é o gestor sintético com concessões explícitas. A carga-base inclui 3 escolas e 4 turmas; cadastros adicionais de revisão são preservados. [Entrega atual](Eleva%20V2/24-implementacao-ux-integrada.md).

Repetir o iniciador não duplica a carga nem desfaz edições. Para iniciar sem executar o seed outra vez, use `.\iniciar-eleva.ps1 -SemSeed`. Para parar somente os processos registrados do Eleva:

```powershell
.\parar-eleva.ps1
```

Os seeds incluem 7 atividades legadas, 3 aulas reutilizáveis, orientações, rascunhos, 5 estudantes-base, 3 escolas e 4 turmas, avaliações, percursos, observações, histórico, relatórios e convites. IA tem exemplos **pré-gerados identificados**, sem chamada ao Groq. Não há rubrica/conteúdo aprovado inventado nem vídeo Libras falso. Detalhes atuais: [registro 17](Eleva%20V2/17-construtor-aulas-e-compartilhamento.md).

## Abrir agora

Web local: `http://localhost:8081`. Pode cadastrar um adulto fictício pela interface. Os cinco acessos atuais (A/B/P/Q/G) ficam em `identity/review-accounts.local.json` e na tabela legível `identity/ACESSOS-TESTE.local.md`. O arquivo `identity/demo-accounts.local.json` conserva as contas do teste anterior. Todos são arquivos locais ignorados pelo git, fora do APK; não publique seu conteúdo.

Para testar sem navegar pelo JSON: [acessos de responsáveis e professores](identity/ACESSOS-TESTE.local.md), com e-mails e senhas. A versão atual abre o onboarding no primeiro acesso; depois ele pode ser revisto em Configurações. Aparência e tamanho de texto ficam na aba Configurações. [Galeria da revisão visual anterior](Eleva%20V2/evidencias/premium-galeria.html); a prévia na8092 é opcional e não é iniciada pelo comando principal.

Se os processos tiverem encerrado, inicie os três terminais descritos abaixo. Better Auth é software hospedado pelo projeto: não exige criar uma conta SaaS como no Clerk. Neon/Groq/VM ainda não foram configurados.

## Preparação local reproduzível

Ambiente verificado: Windows, Node22 e Python3.12. Backend usa Python3.11+; identidade usa Node22.13+. Dependências JavaScript estão nos respectivos package-lock; Python está em `backend/requirements-lock.txt`.

Na pasta `identity`:

```powershell
npm ci
```

Crie `identity/.env` a partir de `.env.example`, sem sobrescrever arquivo existente. Defina `BETTER_AUTH_SECRET` aleatório com pelo menos32 caracteres **nesse arquivo local**, nunca no frontend. Use `NODE_ENV=development`, `BETTER_AUTH_URL=http://localhost:3001`, `TRUSTED_ORIGINS=http://localhost:8081,alfabeta://` e `DATABASE_URL` vazia para o banco SQLite local. O segredo local já foi gerado nesta execução; não precisa gerar outro para continuar.

```powershell
npm run migrate:local
npm run dev
```

`migrate:local` recusa banco remoto. Identidade local usa SQLite nativo do Node, que emite aviso de recurso experimental; a topologia final usa PostgreSQL. Não há senhas de exemplo embutidas no APK. Cadastro/validação de senha são do Better Auth.

Em outro terminal, na pasta `backend`:

```powershell
python -m venv .venv
.venv\Scripts\python -m pip install -r requirements-lock.txt
```

Crie `backend/.env` a partir de `.env.example`, preservando qualquer configuração existente. Para este desenvolvimento, confirme `ELEVA_ENV=development`, `DATABASE_URL=sqlite:///./eleva-development.db`, `AUTH_BASE_URL=http://127.0.0.1:3001` e `ENABLE_TEST_IDENTITIES=false`. **Os próximos comandos devem apontar ao arquivo local, não a um Neon compartilhado.**

```powershell
.venv\Scripts\python -m alembic upgrade head
.venv\Scripts\python -m scripts.seed --local-development
.venv\Scripts\python -m uvicorn app.main:app --host 127.0.0.1 --port 8100 --reload --reload-dir app
```

O seed cria conteúdo/identidades técnicas sintéticas, sem senha ou login integrado fictício. Para preparar **contas Better Auth de verdade no ambiente local** e crianças/turmas pelo mesmo caminho da API, mantenha os dois processos abertos e rode, em outro terminal `backend`:

```powershell
.venv\Scripts\python -m scripts.full_stack_smoke
```

Esse roteiro de regressão é restrito a endpoints de loopback e cria outro grupo A/B/P/Q, preservado no arquivo histórico `demo-accounts.local.json`. Não é necessário executá-lo para a carga visual atual; o iniciador usa `scripts.seed_review --local-development`, repetível, com contas separadas em `review-accounts.local.json`. Nenhum deles instala servidor permanente ou altera banco remoto.

Em outro terminal, na pasta `alfabeta`:

```powershell
npm ci
npm run web -- --port 8081
```

Use `.env.local` com `EXPO_PUBLIC_API_URL=http://localhost:8100` e `EXPO_PUBLIC_AUTH_URL=http://localhost:3001`. São endereços públicos de desenvolvimento, sem segredos. A porta8100 evita um serviço já presente em localhost IPv6 na porta8000; não encerre processos de outros projetos. Para testar o build exportado, encerre o Metro dessa porta, rode `npm run build:web` e depois:

```powershell
python -m http.server 8081 --bind 127.0.0.1 --directory dist
```

O CORS e as origens de identidade locais usam a porta8081. O site estático continua precisando dos processos API e identidade.

## Testar

Em `alfabeta`:

```powershell
npm run type-check
npm run lint
npm test -- --runInBand --watch=false
npm run build:web
npm run build:android:export
```

Em `backend`:

```powershell
.venv\Scripts\python -m pytest -q
.venv\Scripts\python -m scripts.check_migrations
```

`check_migrations` ignora a URL do operador e cria somente um arquivo novo em `.runtime`, testando a cadeia inteira local. `migrations/postgresql-initial.sql` é SQL gerado offline, não uma prova de execução em PostgreSQL.

Roteiro de interface: entrar como A, criar criança ou abrir a fictícia → registrar avaliação/evidências → escolher e executar atividade item a item → concluir → reabrir e conferir histórico/relatório. Entrar como B não revela crianças de A. P só vê a criança concedida; Q não herda acesso por ser professor ou ter turma. Revogar o grant retira acesso por ID e do relatório coletivo. Na área adulta, experimentar claro/escuro/sistema, contraste, fonte e teclado. Executor não mostra biblioteca, relatórios ou métricas adultas.

Não apresentar os exemplos sintéticos como instrumento pedagógico aprovado. Contagens de tarefas e respostas corretas de um mesmo conteúdo/versão não são um percentual de alfabetização.

Para testar autoria, entre como P ou Q, abra Biblioteca e crie uma atividade. Adicione itens (até20), alternativas distintas (2–6) e gabarito por item; leitura começa desabilitada. Salve, edite o rascunho e confira o histórico de versões. Nova versão exige novo parecer; nenhuma conta está designada como revisora pedagógica real. Sem revisão, publicar permanece bloqueado. Conteúdo publicado não pode ser editado pelo comando de rascunho.

## Configurar Neon depois

1. Criar conta/projeto próprio e uma **branch exclusivamente de teste**, conferindo plano/cotas no painel, sem contratar upgrade.
2. Obter a string PostgreSQL com TLS em “Connect”. Guardá-la em `backend/.env` e `identity/.env`, **nunca** em `EXPO_PUBLIC_*`. Backend normaliza `postgresql://` para o driver psycopg; Better Auth usa `pg`.
3. Antes de aplicar migrations, identificar projeto/branch/host/database/usuário de forma inequívoca e confirmar que não contém dados de terceiros. Os scripts de migração local foram intencionalmente impedidos de operar remotamente.
4. Aplicar migrations de domínio e preparar schema Better Auth somente nesse ambiente autorizado; depois repetir a suíte integrada em PostgreSQL, incluindo concorrência e reinício. Alembic não cria as tabelas internas da identidade.

Orientações oficiais: [conectar aplicação ao Neon](https://neon.com/docs/connect/connect-from-any-app), [Better Auth PostgreSQL e migrações](https://better-auth.com/docs/adapters/postgresql). Não foi criada conta nem verificada disponibilidade/cota da conta do usuário.

## Configurar Groq e provar uma chamada real

Criar conta/projeto no [console Groq](https://console.groq.com/docs/quickstart), verificar o plano Free e a disponibilidade de `openai/gpt-oss-120b`, sem ativar cobrança. Guardar a chave como **`GROQ_API_KEY` em `backend/.env`**. Não colar a chave no chat nem no aplicativo. Reiniciar apenas a API; não é necessário instalar modelo, Ollama ou GPU.

Para a prova técnica, usar somente os adultos/perfis inteiramente fictícios do smoke local e habilitar `AI_ALLOW_SYNTHETIC=true` no backend de desenvolvimento. Ainda em `backend`:

```powershell
.venv\Scripts\python -m scripts.prove_groq --profile A
```

Depois de respeitar pelo menos o intervalo configurado de60 segundos:

```powershell
.venv\Scripts\python -m scripts.prove_groq --profile B
```

O script autentica o adulto local, usa evidências persistidas diferentes e guarda recibo em `Eleva V2/evidencias/groq-live-A.json`/B. Só `status=completed`, `origin=live` e resposta validada contam como prova; cache ou transporte substituído em teste não contam. Comparar justificativas/referências e pedir revisão pedagógica: duas saídas técnicas diferentes não comprovam qualidade educacional. Não existe recibo live nesta entrega porque a chave não foi fornecida.

Parâmetros efetivos e limites estão em [11](Eleva%20V2/11-implementacao-e-checkpoint.md). A aplicação não migra para plano pago ou outro fornecedor automaticamente. Verificação contratual infantil D15 continua necessária; backend/anonimização/conta adulta não a substituem.

## Conteúdo e revisão pedagógica

Professor cria rascunho na Biblioteca. Instrumento contém itens, alternativas e critérios textuais explícitos. Um adulto só consegue revisar catálogo se seu identificador tiver sido colocado pelo operador em `PEDAGOGICAL_REVIEWER_SUBJECTS`, após designação de um revisor real. A lista começa vazia; escolher “Professor” no perfil não habilita aprovação. Parecer, referência/trecho permitido e data ficam persistidos; publicação pelo autor é outra operação. A avaliação guarda snapshot da versão revisada.

Ainda precisamos de instrumento/rubrica/corpus/conteúdo e profissional reais. Não preencha uma aprovação apenas para retirar o estado de insuficiência. Confirmação humana do nível, revisão de uma análise de IA e revisão/publicação de catálogo são três operações diferentes.

## Áudio e Libras

Para ouvir, o navegador/Android precisa ter voz **PT-BR** disponível; não há instalação automática. Sem voz, a interface informa a indisponibilidade e mantém texto. Não há pausa/retomada simulada nem STT.

Ajuda pública: `/ajuda-libras.html`. VLibras fica isolado de dados privados, depende de rede e permanece com verificação assistiva/tradução incompleta. Vídeos essenciais entram pelo manifesto em `src/features/accessibility/libras-manifest.ts`, com arquivos reais, texto, licença, revisor e data. Manifesto vazio significa que Libras por vídeo ainda não foi entregue.

## Android e hospedagem final

Exportar JavaScript Android não gera APK. A montagem foi tentada e parou porque Java/JAVA_HOME não estão disponíveis; SDK/adb também não foram encontrados. Para montar localmente, preparar JDK17 e Android SDK compatíveis com esta versão, conforme [React Native0.79](https://reactnative.dev/docs/0.79/set-up-your-environment). Não foram instalados Android Studio/JDK/SDK neste computador durante a tarefa.

Antes do APK da banca, configurar `.env.local` com URLs **HTTPS acessíveis ao celular**, fora deste computador. Rodar `npm run check:release-env`: o teste rejeita os atuais localhost de desenvolvimento. Ele não testa disponibilidade remota. Quando ambiente e configuração estiverem prontos:

```powershell
npm run check:release-env
.\android\gradlew.bat -p android assembleRelease
```

A configuração de assinatura herdada ainda precisa ser revisada para o artefato de distribuição; não publicar o aplicativo com chave de desenvolvimento. Instalar o APK resultante no Android e validar navegação, restauração de sessão, autorização, TalkBack, fonte do sistema, rotação, TTS, rede e falhas. iOS exige validação própria em ambiente adequado.

Topologia final continua simples: web/APK → FastAPI + processo Better Auth na mesma VM elegível → PostgreSQL Neon; FastAPI → Groq. Recomenda-se mesmo domínio HTTPS para web e rotas de API/identidade, com proxy e processos de loopback. Oracle/VM, DNS/HTTPS, SMTP e plano/cotas não foram provisionados. O computador atual é apenas ambiente temporário de desenvolvimento.
