# Eleva

Aplicativo educacional de alfabetização e acompanhamento. React Native/Expo/TypeScript em `alfabeta/`, API FastAPI em `backend/` e identidade Better Auth em `identity/`.

## Executar no Windows

Com as dependências preparadas conforme [DESENVOLVIMENTO.md](DESENVOLVIMENTO.md), execute na raiz:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\iniciar-eleva.ps1
```

Abra **http://localhost:8081**. O iniciador prepara somente os bancos SQLite conhecidos de desenvolvimento, com backup e seed reproduzível. Não provisiona nuvem nem altera banco remoto. Para parar, execute `./parar-eleva.ps1`.

Os acessos fictícios ficam em `identity/ACESSOS-TESTE.local.md`, gerado localmente e ignorado pelo git: A/B responsáveis, P/Q professores e G gestor escolar com concessões explícitas. Não há senhas ou chaves de acesso embutidas no aplicativo.

## Estado e revisão

Atalhos fixos de IA e Libras: [implementação e prova técnica web](Eleva%20V2/25-atalhos-flutuantes.md), [capturas atuais](Eleva%20V2/evidencias/atalhos-galeria.html). Na web, um trecho público curto teve resposta real e reprodução no VLibras; isso não encerra revisão linguística ou validação Android.

- [Mudanças implementadas e percursos testados](Eleva%20V2/24-implementacao-ux-integrada.md).
- [Galeria de telas reais](Eleva%20V2/evidencias/ux-final-galeria.html).
- [Verificações e limites](Eleva%20V2/evidencias/ux-final-verificacao.json).
- [Documentação, FRDs e rastreabilidade do TCC](Eleva%20V2/README.md).

Há persistência e identidade reais **locais**, com conteúdos inteiramente sintéticos para demonstração. Aulas, retomada, autoria/compartilhamento, vínculos, escolas/turmas e relatórios foram exercitados pelo aplicativo. Serviços remotos, SMTP, Groq ao vivo, APK instalado e revisões pedagógica/Libras continuam dependências explícitas. A exportação Android não é um APK; não se declara conformidade de acessibilidade ou validação com estudantes reais.
