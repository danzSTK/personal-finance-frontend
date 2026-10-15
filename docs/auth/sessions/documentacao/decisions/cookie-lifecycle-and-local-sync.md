---
area: auth
feature: sessions
type: documentation-decision
status: current
decision-id: DEC-001
decision-status: accepted
related:
  - ../flow/session-lifecycle.md
  - ../components/session-controls.md
  - ../../../authentication/sign-in/documentacao/decisions/session-by-http-only-cookie.md
---

# Ciclo de sessão centralizado

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
