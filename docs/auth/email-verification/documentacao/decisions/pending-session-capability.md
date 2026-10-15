---
area: auth
feature: email-verification
type: documentation-decision
status: current
decision-id: DEC-001
decision-status: accepted
related:
  - ../flow/confirm-and-resend.md
  - ../components/verification-panels.md
  - ../../../../specs/auth/email-verification/specs/decisions.md
---

# Sessão pendente com capacidade limitada

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
