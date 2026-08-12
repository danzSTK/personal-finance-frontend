---
area: auth
feature: authentication
subfeature: sign-in
type: documentation-decision
status: current
decision-id: DEC-001
decision-status: accepted
related:
  - ../flow/email-and-password.md
  - ../components/sign-in-form.md
  - ../../../../../specs/auth/core/specs/decisions.md
---

# Sessão por cookies HttpOnly

## Problema

A spec histórica descrevia access token em Bearer/storage, o que expõe segredo
ao JavaScript e contradiz o contrato atual do backend.

## Decisão

O sign-in usa `POST /auth/sign-in` com `withCredentials`; cookies HttpOnly são a
credencial. O frontend não lê, persiste ou monta tokens. Depois da operação,
`GET /users/me` sincroniza o perfil que alimenta store, cache e redirect.

## Consequência

O Axios central precisa manter `withCredentials: true`. Falhas 401 em requests
protegidos seguem refresh centralizado, sem lógica de token nos formulários.
Documentos que citam Bearer ou `/auth/me` permanecem históricos.
