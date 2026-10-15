---
area: accounts
feature: balance-period-filter
type: spec-decisions
status: historical
reconstructed-from: legacy:account-category-balance-fixes/accounts-balances-period-filter-spec.md
related: [./requirements.md, ./design.md, ./tasks.md]
---

# Decisões históricas

## DEC-H01 — período como data civil

Status: historical

Decision: derivar início/fim do mês como `YYYY-MM-DD`, sem converter DateOnly
para instante.

Impact: evita deslocamento de mês por timezone.

## DEC-H02 — seletor mensal compartilhado

Status: historical

Decision: reutilizar o `MonthYearPicker` compartilhado.

Impact: mantém navegação temporal consistente na plataforma.
