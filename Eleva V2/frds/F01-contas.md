# F01 — Contas, sessão e perfil

## Objetivo, fontes e situação

Garantir identidade adulta distinta e acesso recuperável. **PDF** RF001/002 O, RF008 D (§6.2.1 pp.37–38), UC001/002/010/013/014 NI (pp.40–47), RNF002/003 O. **CÓD**: authService/authStore, telas de autenticação/Profile; E01/E13/E17/E18. Situação: cadastro/login/reset simulados, sessão local e logout parciais, edição de perfil ausente. **USU**: contas separadas; **PROP**: Clerk com adaptador.

## Atores e permissões

Adulto anônimo cadastra/autentica/recupera; adulto autenticado lê/edita seu perfil e encerra sua sessão. Seleção teacher/guardian organiza contexto, sem conceder estudantes. Criança não gerencia conta. Sem painel administrativo global nesta FRD.

## Pré-condições e pós-condições

Cadastro: conta ainda não criada; login/reset: e-mail adulto e canal de entrega configurados; perfil: sessão válida. Após sucesso, identidade e perfil local vinculados por sub, dados da conta carregados e nenhuma informação de outra sessão em memória. Recuperar termina com senha alterada pelo provedor e login possível; sair invalida sessão e limpa caches. Cancelar mantém estado anterior.

## Campos, validações e regras

Propostas técnicas: nome3–120 caracteres; e-mail válido até254, normalização pelo provedor; senha8–128 ou regra mais forte exigida pelo provedor, confirmação coincidente; permitir colar/gerenciador de senha, exibir critérios antes do envio. Login não impõe regra de criação que rejeite senha antiga válida. Papel guardian/teacher; termos/política com versão e aceite separado de pesquisa futura. Nome obrigatório, foto opcional fora do caminho crítico.

Mudança de e-mail só vale após verificação; não editar `identity_sub`/roles privilegiadas pelo formulário. Reset com resposta neutra mesmo para e-mail inexistente (divergência UC013 registrada D04/conflitos). Código/link de uso único, prazo e tentativas conforme configuração do provedor, apresentados na tela. Não inventar prazo em desacordo com o serviço. Bootstrap revalida sessão e mostra estado de erro/retentar em vez de splash infinito.

## Fluxo principal e alternativas

1. T01 recebe credenciais ou abre T02. Cadastro valida, registra e orienta verificação; autenticação obtém sessão.
2. API associa identidade ao perfil; cliente limpa dados anteriores e consulta recursos autorizados.
3. T03 permite editar nome; salvar aplica DTO canônico, cancelar não grava.
4. T04 solicita recuperação, recebe instruções/código, redefine e retorna ao login.
5. T05 confirma saída; informa salvamentos pendentes; confirma revogação/limpeza e volta a T01.

Alternativas: conta duplicada conforme proteção contra enumeração do provedor; verificação pendente; credencial inválida; link expirado; cota de e-mail; internet indisponível; sessão expirada. Em falha de logout remoto, limpar acesso local e informar que revogação remota precisa ser concluída, sem alegar sessão revogada no servidor. Não manter dados visíveis ao trocar conta.

## Dados, persistência e integrações

Identidade/senha/sessão no Clerk; `users`, termos aceitos e preferências na API/PG. Native usa armazenamento seguro e web usa mecanismo de sessão apropriado ao SDK; não reutilizar refresh token público em AsyncStorage. Não persistir senha. `/me` e sessão por adaptador; contratos legados auth/login não serão endpoints fictícios mantidos em paralelo.

## Interface, acessibilidade e temas

T01–T05: campos com labels permanentes, erro por campo e resumo focável, mostrar/ocultar senha com nome/estado, Tab/Enter e foco previsível, teclado adequado. Loading preserva campos; sucesso de reset tem texto persistente; não depender de toast. T05 com trap/retorno de foco na web e modal acessível nativo. Temas e contraste aplicados inclusive antes do login e no modal, A01–A05/A10/A11.

## Critérios de aceite

- **A1:** criar dois adultos com e-mails distintos, verificar quando necessário, reabrir e recuperar os perfis corretos; cadastro repetido não cria perfil duplicado.
- **A2:** login inválido não autentica; login A/B consulta conjuntos autorizados distintos; token inválido/expirado é recusado no servidor.
- **A3:** completar recuperação real de e-mail até nova senha e login; expiração/uso repetido falham; nenhum envio mock conta.
- **A4:** cancelar T05 mantém sessão; confirmar limpa ChildStore/caches e sessão; outra conta não vê dados anteriores.
- **A5:** editar nome persiste após reinício; cancelar não muda; e-mail só atualiza após verificação; foto não bloqueia conclusão.

## Dependências e decisões pendentes

F10 base, API `/me`, configuração Clerk/e-mail, teste Android/web SDK53 (D02). Política de papel duplo conforme D04; dados reais e termos operacionais D13. Não há credencial ou instância Clerk validada nesta tarefa.
# Adendo de implementação · 29/10/2026

Perfil passa a ser destino principal: iniciais reais do nome salvo, papel, editar, ajuda, identificador de convite e entrada de Configurações. Upload de foto permanece não suportado, com fallback honesto, sem seletor que descarte imagem. Saída usa diálogo com Cancelar e ação vermelha “Sair da conta”; só a confirmação encerra a sessão. Edição e reabertura do nome foram exercitadas com Better Auth/SQLite local. Troca A/B/P não preserva dados do adulto anterior. SMTP, foto e homologação remota continuam pendentes. [Evidências/limites](../15-revisao-ux-jornadas.md).
