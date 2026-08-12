---
area: auth
feature: profile
type: documentation-decision
status: current
decision-id: DEC-001
decision-status: accepted
related:
  - ../flow/manage-profile.md
  - ../components/profile-editor.md
---

# Operações de perfil separadas por regra

## Problema

Nome civil, username e avatar têm validação, conflito, mídia e limites distintos;
um update genérico ocultaria essas diferenças e permitiria payload indevido.

## Decisão

`PATCH /users/me` altera nomes; `PUT /users/me/username` altera username com
availability preventiva; avatar usa `PUT/DELETE /users/me/avatar`. Todos obtêm o
usuário pela sessão e nunca recebem `userId`.

## Consequência

Cada mutation possui contexto de erro e cache apropriados. O código reside hoje
em `features/auth` por compartilhar perfil do shell, embora consuma o módulo
backend `users`; uma extração futura deve preservar esses contratos.
