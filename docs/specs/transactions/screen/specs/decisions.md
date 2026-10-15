---
area: transactions
feature: screen
type: spec-decisions
status: historical
reconstructed-from: legacy:transactions-screen-spec.md
related: [./requirements.md, ./design.md, ./tasks.md]
---

# Decisões históricas

## DEC-H01 — tabela desktop e lista mobile

Status: historical

Decision: usar tabela em viewports amplos e itens acionáveis com detalhes em
sheet no mobile.

Impact: prioriza leitura financeira sem scroll horizontal.

## DEC-H02 — confirmar separado de editar

Status: historical

Decision: usar fluxo e endpoint próprios para efetivar uma transação.

Impact: confirmação expõe somente os campos necessários e preserva regras do
domínio.

## DEC-H03 — DateOnly permanece string civil

Status: historical

Decision: manipular datas financeiras em `YYYY-MM-DD`, sem ISO/UTC.

Impact: evita deslocamentos de data por timezone.
