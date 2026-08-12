---
area: auth
feature: authentication
subfeature: oauth-google
type: documentation-flow
status: current
related:
  - ../decisions/callback-without-token-query.md
  - ../components/oauth-callback.md
---

# Login com Google

## Fluxo principal

1. `SocialButton` navega para `GET /auth/google`.
2. Backend/Google executam consentimento e callback do servidor.
3. Backend define cookies HttpOnly e redireciona para `/auth/callback`.
4. `AuthCallbackPage` carrega `/users/me`, preenche auth/cache e navega conforme
   status de verificação.

Erro recebido no callback ou falha ao carregar perfil mostra feedback seguro e
leva a `/sign-in`. O estado visual “Finalizando login” permanece durante a
sincronização.

## Backend consumido

| Operação | Autenticação | Contrato relevante | Efeito/cache | Erros e recuperação | Fonte |
| --- | --- | --- | --- | --- | --- |
| `GET /auth/google` | Público | redirect 302 | inicia OAuth | falha: voltar ao sign-in | `backend/docs/integrations/auth/oauth-google.md` |
| `GET /auth/google/callback` | Público/state | cookies + redirect sem token | cria sessão | erro OAuth seguro no callback | mesma fonte |
| `GET /users/me` | cookies HttpOnly | perfil/status | Zustand + query `user` | falha: sign-in | `backend/docs/integrations/auth/get-me.md` |
