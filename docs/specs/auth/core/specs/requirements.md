---
area: auth
feature: core
type: spec-requirements
status: historical
reconstructed-from: legacy:auth-feature/design.md
related:
  - ./design.md
  - ./tasks.md
  - ./decisions.md
---

# Requisitos históricos — auth core

Reconstrução não normativa da spec legada. O objetivo original era oferecer
sign-up, sign-in, OAuth Google, refresh, logout, sessões e vínculo de providers
em um módulo React feature-first, com formulários acessíveis, estados explícitos
e sincronização entre abas.

## Escopo preservado

- autenticação por email/senha e Google;
- gerenciamento de sessão e refresh;
- consulta/revogação de sessões;
- vínculo de providers;
- Zustand para estado de autenticação e TanStack Query para servidor;
- validação Zod, responsividade e acessibilidade.

## Divergência histórica

O documento original descrevia Bearer token, persistência de access token e
`GET /auth/me`. Isso não é atual: a aplicação usa cookies HttpOnly e
`GET /users/me`. Nenhum requisito deste arquivo deve sobrescrever o código e a
documentação viva atuais.
