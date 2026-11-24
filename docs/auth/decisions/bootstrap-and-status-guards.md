---
area: auth
type: decision
status: current
last_reviewed: 2026-11-24
decision-id: DEC-AUTH-001
decision-status: accepted
related:
  - ../README.md
  - ../flows/authenticated-shell-routing.md
  - ../components/shell-and-settings.md
  - ../../specs/auth/authenticated-shell-v2/specs/decisions.md
---

# DEC-AUTH-001: Bootstrap antes dos guards de rota

## Problema

Decidir rota privada somente pelo storage pode produzir flicker, aceitar sessão
expirada ou ignorar status pendente.

## Decisão

`AppRoutes` executa bootstrap por `GET /users/me` antes de liberar guards. Rotas
financeiras exigem autenticação e status permitido; settings usa layout aninhado
e navegação própria. Perfil do shell prefere query atual e usa store como
fallback transitório.

## Consequência

Há estado de bootstrapping explícito. 401 leva ao sign-in; status pendente leva
à verificação. Sidebar persistida guarda somente preferência visual, nunca
credencial.
