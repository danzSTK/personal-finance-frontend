---
area: auth
type: decision
status: current
last_reviewed: 2026-11-24
decision-id: DEC-AUTH-007
decision-status: accepted
related:
  - ../README.md
  - ../flows/session-lifecycle.md
  - ../components/session-controls.md
  - ./session-by-http-only-cookie.md
---

# DEC-AUTH-007: Ciclo de sessão centralizado

## Problema

Formulários e páginas não devem duplicar refresh, limpeza de cookies ou
sincronização de logout entre abas.

## Decisão

Axios intercepta 401 uma vez, serializa refresh concorrente e repete requests
após `POST /auth/refresh`. Logout HTTP limpa a sessão atual e sempre limpa
Zustand/QueryClient. O store emite `auth_logout` para outras abas.

## Consequência

Fluxos consumidores usam o client compartilhado e não leem tokens. Falha de
refresh é terminal. Change-password não chama logout HTTP porque seu sucesso já
revoga todas as sessões, mas reutiliza a limpeza local.
