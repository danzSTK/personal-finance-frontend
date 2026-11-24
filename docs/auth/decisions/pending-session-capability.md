---
area: auth
type: decision
status: current
last_reviewed: 2026-11-24
decision-id: DEC-AUTH-005
decision-status: accepted
related:
  - ../README.md
  - ../flows/email-verification.md
  - ../components/verification-panels.md
  - ../../specs/auth/email-verification/specs/decisions.md
---

# DEC-AUTH-005: Sessão pendente com capacidade limitada

## Problema

Encerrar a sessão antes da verificação impediria reenvio autenticado, mas liberar
recursos financeiros antes de confirmar o email viola o contrato backend.

## Decisão

`PENDING_EMAIL_VERIFICATION` permanece autenticado e pode acessar perfil,
confirmação e reenvio. Guards direcionam recursos protegidos à página pendente.
Erros `EMAIL_VERIFICATION_REQUIRED` disparam sincronização do usuário e redirect.

## Consequência

Autenticação e autorização por status são estados distintos. O shell não deve
interpretar sessão pendente como sessão ausente; a página pendente oferece
reenvio e logout.
