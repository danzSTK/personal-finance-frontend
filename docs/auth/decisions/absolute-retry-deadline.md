---
area: auth
type: decision
status: current
last_reviewed: 2026-11-24
decision-id: DEC-AUTH-010
decision-status: accepted
related:
  - ../README.md
  - ./operational-status-gate.md
  - ../flows/change-password.md
  - ../components/change-password-dialog.md
  - ../../specs/auth/change-password/specs/decisions.md
---

# DEC-AUTH-010: Deadline absoluto para bloqueios temporários

## Problema

Os códigos 429 têm causas diferentes; auto-retry ou timers relativos reiniciados
ao reabrir o dialog poderiam repetir uma operação sensível antes do prazo.

## Decisão

A interface decide pelo `code` e aceita retry somente como inteiro positivo.
`Retry-After` válido prevalece sobre `details.retryAfterSeconds`. O dialog
converte segundos em deadline absoluto, bloqueia submit e nunca auto-retry.
No `GET` de status, o header é a única fonte do prazo; o deadline agenda uma
nova consulta, mas não libera o trigger por conta própria.

## Consequência

Fechar/reabrir durante a mesma montagem não remove o prazo conhecido. Valor
ausente/malformado não inventa countdown; permanece retry manual com copy segura.
