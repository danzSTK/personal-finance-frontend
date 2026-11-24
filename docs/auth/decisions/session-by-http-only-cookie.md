---
area: auth
type: decision
status: current
last_reviewed: 2026-11-24
decision-id: DEC-AUTH-002
decision-status: accepted
related:
  - ../README.md
  - ../flows/sign-in.md
  - ../components/sign-in-form.md
  - ../../specs/auth/core/specs/decisions.md
---

# DEC-AUTH-002: Sessão por cookies HttpOnly

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
