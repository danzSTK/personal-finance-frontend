---
area: auth
feature: change-password
type: documentation-decision
status: current
decision-id: DEC-002
decision-status: accepted
related:
  - ../flow/change-password.md
  - ../components/change-password-dialog.md
  - ../../../../specs/auth/change-password/specs/decisions.md
---

# Deadline absoluto para bloqueios temporários

## Problema

Os códigos 429 têm causas diferentes; auto-retry ou timers relativos reiniciados
ao reabrir o dialog poderiam repetir uma operação sensível antes do prazo.

## Decisão

A interface decide pelo `code` e aceita retry somente como inteiro positivo.
`Retry-After` válido prevalece sobre `details.retryAfterSeconds`. O dialog
converte segundos em deadline absoluto, bloqueia submit e nunca auto-retry.

## Consequência

Fechar/reabrir durante a mesma montagem não remove o prazo conhecido. Valor
ausente/malformado não inventa countdown; permanece retry manual com copy segura.
