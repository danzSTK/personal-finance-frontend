---
area: transactions
type: flow
status: current
related:
  - ../README.md
  - ./list-filter-and-kpis.md
  - ../decisions/pending-range-includes-future.md
  - ../decisions/pending-deep-link-date-range.md
  - ../components/transaction-screen-components.md
  - ../../specs/transactions/screen/specs/design.md
---

# Navegação das Pendências da Dashboard

Permite que o usuário autenticado abra, a partir de `/dashboard`, todas as receitas ou despesas pendentes que compõem o contador e o valor exibidos no cartão correspondente, incluindo lançamentos com data futura.

## Atores, Pré-condições e Pontos de Entrada

- **Ator:** usuário autenticado com e-mail verificado em `/dashboard` (`DashboardPage`).
- **Pontos de entrada:** cartões de receitas/despesas pendentes no Dashboard (além dos cartões de `"Entradas do mês"` e `"Saídas do mês"`, que geram deep link para `status=EFFECTIVE` no `period` selecionado).

## Fluxo Principal

1. Para cada tipo (`EXPENSE` e `INCOME`), `usePendingTransactionRange(type)` dispara duas consultas `GET /transactions` com `status=PENDING`, `page=1`, `limit=1` e **sem** `dateFrom`/`dateTo`:
   - `sort=date:asc` retorna a pendência mais antiga (`oldestTransaction`), `meta.total` e `summary.pendingCents` do conjunto completo;
   - `sort=date:desc` retorna a pendência com data mais distante (`furthestTransaction`), inclusive futura.
2. `buildPendingDashboardTransactionsUrl` (`src/features/auth/utils/dashboardTransactions.utils.ts`) preserva filtros recebidos e constrói `/transactions` com `view=<type>`, `status=PENDING`, `page=1`, `dateFrom=oldest ?? furthest ?? today` e `dateTo=furthest ?? oldest ?? today` (estritamente em `DateOnly` `YYYY-MM-DD`).
3. Ao clicar, `TransactionsPage` interpreta a query string e exibe exatamente o conjunto contabilizado no cartão.

## Estados de Interface e Recuperação

| Estado | Comportamento observado | Recuperação |
| --- | --- | --- |
| Loading | Cartões preservam estrutura; se apenas um extremo chegou, ambos os limites usam essa data | Evita intervalo inválido |
| Empty | Contador zero; fallback seguro usa a data civil atual nos dois limites | Link válido sem erro |
| Error | `ApiErrorAlert` inline junto ao painel (`transactions.list`) | Retry refaz ambas as ordenações (`asc` e `desc`) |

## Consumo de Backend

| Operação | Autenticação | Contrato relevante | Efeito / Cache | Erros e recuperação | Fonte |
| --- | --- | --- | --- | --- | --- |
| `GET /transactions` | Cookie HttpOnly | `type`, `status=PENDING`, `sort=date:asc` e `sort=date:desc`, `page=1`, `limit=1`, sem limite de datas (`transaction_summary.type`) | Duas queries cacheadas por conjunto de parâmetros (`staleTime: 30s`) | `ApiErrorAlert` inline com retry conjunto | `personal-finance-backend:docs/integrations/transactions/list-transactions.md` |
