---
area: auth
type: decision
status: current
last_reviewed: 2026-11-24
decision-id: DEC-AUTH-004
decision-status: accepted
related:
  - ../README.md
  - ../flows/oauth-google.md
  - ../components/oauth-callback.md
  - ../../specs/auth/core/specs/decisions.md
---

# DEC-AUTH-004: Callback sem token na query

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
