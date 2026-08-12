---
area: auth
feature: authentication
subfeature: oauth-google
type: documentation-decision
status: current
decision-id: DEC-001
decision-status: accepted
related:
  - ../flow/google-login.md
  - ../components/oauth-callback.md
  - ../../../../../specs/auth/core/specs/decisions.md
---

# Callback sem token na query

## Problema

Tokens em query podem vazar por histórico, logs e referrers; a spec histórica
continha helpers de token que não correspondem ao backend atual.

## Decisão

O backend conclui OAuth, define cookies HttpOnly e redireciona para
`/auth/callback` sem token. O frontend finaliza apenas consultando
`GET /users/me` com credenciais.

## Consequência

`AuthCallbackPage` nunca decodifica ou persiste token. Query params são usados
somente para erro OAuth seguro; falha de sincronização retorna ao sign-in.
