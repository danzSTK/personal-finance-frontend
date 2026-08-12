---
area: auth
feature: authentication
subfeature: sign-up
type: documentation-decision
status: current
decision-id: DEC-001
decision-status: accepted
related:
  - ../flow/create-account.md
  - ../components/sign-up-form.md
  - ../../../../../specs/auth/change-password/specs/decisions.md
---

# Confirmação de senha somente no formulário

## Problema

Uma confirmação reduz erro de digitação, mas não é dado de domínio e não deve
ampliar o DTO público do backend.

## Decisão

`signUpSchema` usa o `passwordSchema` central de 6–50 caracteres em `password` e
`confirmPassword`, exige igualdade e associa divergência à confirmação.
`buildSignUpDto` envia explicitamente somente `password`.

## Consequência

Política e confirmação são testáveis sem duplicar contrato. Mudanças futuras na
política ocorrem em um ponto; o backend nunca recebe `confirmPassword`.
