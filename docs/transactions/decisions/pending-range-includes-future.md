---
area: transactions
type: decision
status: current
last_reviewed: 2026-11-24
decision-id: DEC-TRX-002
decision-status: accepted
supersedes: ./pending-deep-link-date-range.md
related:
  - ../README.md
  - ../flows/dashboard-pending-navigation.md
  - ./pending-deep-link-date-range.md
  - ../components/transaction-screen-components.md
  - ../../specs/transactions/screen/specs/design.md
---

# DEC-TRX-002: Intervalo completo das pendências da dashboard inclui futuro

## Problema

Limitar os cartões e links de pendências à data civil atual (como em [`DEC-TRX-001`](./pending-deep-link-date-range.md)) excluía transações planejadas para datas futuras. Como essas transações continuam com `status=PENDING` no domínio, o painel deixava de representar o conjunto pendente completo do usuário.

## Decisão

Para cada tipo (`INCOME` e `EXPENSE`), a Dashboard executa duas consultas leves sem `dateFrom` nem `dateTo` por meio do hook composto `usePendingTransactionRange`:

- `sort=date:asc&limit=1` identifica a transação pendente mais antiga e fornece o `summary` e `meta.total` do conjunto completo;
- `sort=date:desc&limit=1` identifica a transação pendente com data mais distante, inclusive no futuro.

O deep link montado por `buildPendingDashboardTransactionsUrl` preserva filtros existentes e adiciona `view`, `status=PENDING`, `page=1`, `dateFrom` (extremo mais antigo) e `dateTo` (extremo mais distante). As datas permanecem strings `DateOnly` (`YYYY-MM-DD`).

## Consequência

- Contador, soma monetária e listagem de destino em `/transactions` abrangem todas as pendências do tipo, incluindo lançamentos futuros.
- A Dashboard realiza uma consulta adicional de 1 item por tipo para descobrir o limite superior (`sort=date:desc&limit=1`).
- As duas consultas compartilham o tratamento inline de erro e são refeitas juntas na ação de retry.
