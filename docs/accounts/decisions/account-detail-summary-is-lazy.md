---
area: accounts
type: decision
status: current
decision-id: DEC-003
decision-status: accepted
related:
  - ../README.md
  - ../concepts/balance-and-period-summary.md
  - ../flows/account-detail-and-summary.md
  - ../components/account-components.md
  - ../../specs/accounts/account-detail-period-summary/specs/decisions.md
---

# Resumo financeiro no detalhe da conta é lazy

## Problema

Exibir receitas e despesas efetivadas do mês para cada conta diretamente na grade de `/accounts` dispararia N consultas `GET /transactions` simultâneas ao carregar a página, mesmo quando o usuário só deseja conferir saldos.

## Decisão

Carregar o resumo de receitas e despesas do período de forma **lazy** dentro de `AccountCard` (`enabled: isDetailsOpen`), utilizando uma única consulta `GET /transactions` com `accountId`, `status=EFFECTIVE`, `dateFrom`/`dateTo` do mês selecionado, `limit=1` e sem `type` para obter `summary.object === 'transaction_summary.overview'`.

As células `Receitas` e `Despesas` abrem `/transactions` via serializador de URL do módulo `transactions`, preservando conta, visão, período e status efetivado; `Ver transações` no menu passa somente `accountId`.

## Consequência

- Zero consultas extras ao listar `/accounts`; apenas a conta inspecionada busca resumo.
- Uma única resposta alimenta tanto receitas quanto despesas efetivadas do período.
- Falha nessa consulta permanece isolada no detalhe (com `ApiErrorAlert` + retry) sem esconder nome, saldo ou ações da conta.
