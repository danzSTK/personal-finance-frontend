---
area: auth
feature: authenticated-shell-v2
type: spec-decisions
status: historical
reconstructed-from: legacy:auth-shell-v2/design.md
related:
  - ./requirements.md
  - ./design.md
  - ./tasks.md
---

# Decisões históricas — authenticated shell v2

## DEC-H01 — settings fora da navegação financeira primária

Status: historical

Decision: acessar configurações pelo perfil e usar uma navegação secundária
própria.

Impact: evita misturar administração da conta com áreas financeiras.

## DEC-H02 — segurança usa dados reais

Status: historical

Decision: providers e sessões devem vir da API e não de placeholders.

Impact: loading, erro e estado vazio passam a fazer parte do shell.
