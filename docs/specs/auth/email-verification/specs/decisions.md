---
area: auth
feature: email-verification
type: spec-decisions
status: historical
reconstructed-from: legacy:email-verification/design.md
related:
  - ./requirements.md
  - ./design.md
  - ./tasks.md
---

# Decisões históricas — verificação de email

## DEC-H01 — confirmação pública e reenvio autenticado

Status: historical

Decision: separar a confirmação por token do reenvio associado à sessão.

Impact: as duas operações têm rotas, capacidade e recuperação distintas.

## DEC-H02 — sessão pendente sem acesso financeiro

Status: historical

Decision: manter a sessão válida enquanto o status pendente bloqueia recursos
protegidos e orienta a verificação.

Impact: redirects dependem do status retornado por `GET /users/me`.
