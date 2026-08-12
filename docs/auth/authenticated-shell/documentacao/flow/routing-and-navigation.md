---
area: auth
feature: authenticated-shell
type: documentation-flow
status: current
related:
  - ../decisions/bootstrap-and-status-guards.md
  - ../components/shell-and-settings.md
---

# Bootstrap, guards e navegação

1. Ao montar, a aplicação tenta `GET /users/me` com cookies.
2. Sucesso preenche store/cache; falha limpa autenticação.
3. Rotas públicas mantêm sign-in, sign-up, callbacks e confirmação.
4. Guards enviam sessão ausente a `/sign-in` e usuário pendente a
   `/email-verification-pending`.
5. Rotas privadas compõem `AuthAppShell`; settings compõe `SettingsLayout` e
   páginas account/security/notifications/preferences.

Desktop usa sidebar colapsável; mobile usa navegação inferior e quick actions.
Logout permanece acessível no menu de perfil. Loading de perfil não inventa
nome/provider e usa fallback seguro.

## Backend consumido

| Operação | Autenticação | Contrato relevante | Efeito/cache | Erros e recuperação | Fonte |
| --- | --- | --- | --- | --- | --- |
| `GET /users/me` | cookie | perfil, status, providers | bootstrap e identidade do shell | 401: sign-in; pending: verificação | `backend/docs/integrations/auth/get-me.md` |
| `POST /auth/logout` | cookies | encerra sessão atual | limpa store/cache e abas | limpeza local mesmo em falha | `backend/docs/integrations/auth/logout.md` |
