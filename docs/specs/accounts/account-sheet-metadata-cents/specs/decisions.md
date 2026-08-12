---
area: accounts
feature: account-sheet-metadata-cents
type: spec-decisions
status: historical
reconstructed-from: legacy:account-category-balance-fixes/account-sheet-metadata-cents-spec.md
related: [./requirements.md, ./design.md, ./tasks.md]
---

# Decisões históricas

## DEC-H01 — moeda controlada em centavos

Status: historical

Decision: manter saldo do formulário e payload em inteiros de centavos.

Impact: elimina conversões ambíguas e alinha o frontend ao backend.

## DEC-H02 — reutilizar metadata de categorias

Status: historical

Decision: reutilizar a fonte de cores/ícones existente em vez de criar catálogo
paralelo.

Impact: reduz drift visual, mantendo a decisão restrita ao contrato histórico.
