# Elevva

Aplicativo educacional mobile para acompanhamento da alfabetizacao infantil com apoio de IA (Speech-to-Text + Gemini), focado em responsaveis e educadores.

## Objetivo

O MVP do Elevva permite:
- onboarding + autenticacao
- cadastro e acompanhamento de criancas
- atividades pedagogicas por nivel de alfabetizacao
- atividade central de audio com transcricao e analise do nivel
- recomendacoes e orientacoes pedagogicas personalizadas

## Stack

- React Native com Expo + TypeScript
- React Navigation (stack + bottom tabs)
- Zustand para estado global
- React Hook Form + Zod para formularios
- Axios com interceptors e refresh token
- AsyncStorage + SecureStore
- Reanimated + Moti + Lottie
- i18next + react-i18next
- Jest + Testing Library

## Pre-requisitos

- Node 20+
- npm 10+
- Expo CLI (`npx expo`)
- Android Studio (Android) ou Xcode (iOS)

## Instalacao

1. Entre na pasta do projeto:

```bash
cd alfabeta
```

2. Instale dependencias:

```bash
npm install
```

3. Crie o arquivo `.env` a partir de `.env.example`.

4. Inicie o app:

```bash
npm run start
```

5. Execute em dispositivo:

```bash
npm run android
npm run ios
```

## Variaveis de ambiente

Use o arquivo `.env` com base em `.env.example`:

- `EXPO_PUBLIC_GOOGLE_API_KEY`
- `EXPO_PUBLIC_GEMINI_API_KEY`
- `EXPO_PUBLIC_API_BASE_URL`
- `EXPO_PUBLIC_USE_MOCK`
- `EXPO_PUBLIC_APP_ENV`
- `EXPO_PUBLIC_SENTRY_DSN`

## Scripts

- `npm run start` inicia Expo
- `npm run android` executa no Android
- `npm run ios` executa no iOS
- `npm run test` executa testes
- `npm run lint` executa ESLint
- `npm run format` formata com Prettier
- `npm run type-check` valida TypeScript

## Estrutura de pastas

A estrutura segue o padrao solicitado para:
- componentes reutilizaveis (`src/components`)
- telas (`src/screens`)
- navegacao (`src/navigation`)
- hooks (`src/hooks`)
- services (`src/services`)
- estado (`src/store`)
- tema (`src/theme`)
- utilitarios (`src/utils`)
- mocks (`src/mocks`)

## ADR (decisoes arquiteturais)

1. Zustand para estado global
- Menos boilerplate que Context+Reducer e boa ergonomia para async actions.

2. Camada de servico com chave `EXPO_PUBLIC_USE_MOCK`
- Permite alternar mock/real sem alterar as telas.

3. SecureStore para tokens
- Access/refresh token em armazenamento criptografado.

4. Axios interceptor com refresh token
- Reautenticacao automatica e logout em expiracao real.

5. Fluxo de audio centralizado
- `useAudio` controla gravacao; `useAI` orquestra STT + Gemini.

## Seguranca

- Tokens em `SecureStore`
- Dados sensiveis mascarados em logs
- Timeout de rede e headers de seguranca
- Validacao de entradas com Zod
- Sanitizacao basica de strings antes de APIs externas

## Como adicionar novo componente

1. Crie pasta em `src/components/ui/NomeComponente/`
2. Implemente `index.tsx` com props tipadas
3. Extraia regras visuais para `theme`
4. Adicione teste em `__tests__` ou junto do componente

## Como adicionar nova tela

1. Crie arquivo em `src/screens/<Modulo>/NovaTela.tsx`
2. Registre a rota no navigator correspondente
3. Conecte hooks/services necessários
4. Garanta loading, erro e empty state

## Conventional Commits

Padrao sugerido:
- `feat: adiciona tela de progresso`
- `fix: corrige refresh token no interceptor`
- `chore: ajusta eslint`
- `test: adiciona teste do button`

## LGPD e consentimento

- Dados infantis mockados com prefixo anonimo (`KID-`)
- Fluxo de cadastro inclui aceite de termos e politica
- Recomendado: incluir pagina web de politica e endpoint real de consentimento na versao de producao

## Observacoes para build APK

- Para build local/dev client: `npx expo run:android`
- Para EAS Build, configure `eas.json` (nao incluido neste MVP)
