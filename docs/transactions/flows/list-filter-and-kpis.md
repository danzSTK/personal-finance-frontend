---
area: transactions
type: flow
status: current
last_reviewed: 2026-11-27
related:
  - ../README.md
  - ../concepts/transaction-model-and-types.md
  - ./dashboard-pending-navigation.md
  - ../components/transaction-screen-components.md
  - ../reference/api-and-contracts.md
---

# Listagem, Filtros em URL, KPIs e Agrupamento por Dia

Descreve o funcionamento da tela principal `/transactions`, incluindo sincronização de filtros na URL, KPIs por visão, agrupamento diário e consumo das intenções transitórias `?create=` e `?openTransaction=`.

## Atores, Pré-condições e Pontos de Entrada

- **Ator:** usuário autenticado com e-mail verificado.
- **Rota frontend:** `/transactions` (`PrivateRoute`, título `Danfy Finance | Transações`), envolvida em `AuthAppShell`.
- **Pontos de entrada:** menu principal, deep links do `DashboardPage`, deep links de `AccountCard` (`Receitas`, `Despesas`, `Ver transações`), atalhos de `MobileQuickActions` (`/transactions?view=...&create=INCOME|EXPENSE|TRANSFER|FISCAL_NOTE`), deep-link de `/fiscal-notes` (`/transactions?openTransaction=<id>`) e botão **"Ler NFC-e"** na barra de ações de `/transactions` (visões `ALL` e `EXPENSE`).

## Estado Sincronizado na URL (`transactionUrl.utils.ts`)

`parseTransactionUrlState`, `parseTransactionCreateIntent` e `parseTransactionOpenId` / `buildTransactionSearchParams` governam todos os parâmetros compartilháveis:

| Parâmetro | Valores / Padrão | Comportamento |
| --- | --- | --- |
| `period` | `YYYY-MM` (omitido se mês atual) | Define `dateFrom`/`dateTo` padrão do mês |
| `view` | `ALL \| EXPENSE \| INCOME \| TRANSFER \| ADJUSTMENT` (omitido se `ALL`) | Controla `type` enviado à API e formato dos KPIs |
| `page` / `limit` | `page: 1`, `limit: 10 \| 20 \| 50 \| 100` (padrão `20`) | Qualquer alteração de período, visão, filtro, limite ou busca reseta `page` para `1` |
| `q` | Texto livre (debounce `300ms`) | Filtragem de substring por descrição **no cliente** sobre a página atual (não enviado ao backend) |
| `accountId` / `categoryId` | UUID opcional | `categoryId` é limpo automaticamente quando `view === 'TRANSFER'` ou `'ADJUSTMENT'` |
| `status` | `PENDING \| EFFECTIVE` | Filtra lançamentos pendentes ou efetivados |
| `dateFrom` / `dateTo` | `DateOnly` (`YYYY-MM-DD`) | Omitidos na URL quando coincidem com início/fim do mês selecionado; `compareDateOnly(dateFrom, dateTo) === 1` bloqueia aplicação no `TransactionFiltersSheet` |
| `create` *(transitório)* | `INCOME \| EXPENSE \| TRANSFER \| ADJUSTMENT \| FISCAL_NOTE` | Abre `TransactionFormSheet` (`INCOME`/`EXPENSE`/`TRANSFER`), `BalanceAdjustmentSheet` (`ADJUSTMENT`) ou `FiscalNoteReaderSheet` em modo `import` (`FISCAL_NOTE`), removendo `create` da URL com `replace: true` |
| `openTransaction` *(transitório)* | ID seguro (`/^[a-zA-Z0-9_-]{1,128}$/`, `parseTransactionOpenId`) | Remove `openTransaction` da URL via `clearTransactionOpenParam` (`{ replace: true }`), busca `GET /transactions/:id` (`TRANSACTION_QUERY_KEYS.detail(id)`), sincroniza automaticamente `period`, `dateFrom` e `dateTo` (e reseta `page` para `1`) para o mês de `transaction.date` caso difira do período atual, e abre `TransactionDetailsSheet`. Em falha, exibe `showApiErrorToast(error, 'transactions.detail')` |

## KPIs (`TransactionsKpiGrid`) e Agrupamento (`TransactionsTable`)

- **Visão `ALL` (`summary.object === 'transaction_summary.overview'`):** 4 cards — `Saldo atual` (de `useAccountSummary()`), `Receitas` (`summary.income.totalCents`), `Despesas` (`summary.expense.totalCents`) e `Balanço mensal` (`summary.balance.expectedBalanceCents`). Falha em `useAccountSummary()` exibe alerta inline `accounts.summary`.
- **Visões `INCOME` / `EXPENSE` / `TRANSFER` (`summary.object === 'transaction_summary.type'`):** 3 cards — pendentes (`pendingCents`), efetivadas (`effectiveCents`) e total (`totalCents`).
- **Layout responsivo de KPIs:** trilha horizontal com snap (`KpiScrollTrack`) e controles `<`/`>` com fade até o breakpoint de grade desktop (`xl` para 4 colunas, `md` para 3 colunas).
- **Agrupamento por dia:** `groupTransactionsByDate` agrupa por `DateOnly` (`dd/MM/yyyy`) preservando a ordem da API (`date:desc`). Renderiza `<Table>` com `TransactionDayDivider` em `md+` e cards `TransactionMobileItem` em `< md`. Linhas/cards com `hasFiscalNote === true` exibem `FiscalNoteBadge` sem consultas adicionais; linhas `EXPENSE` sem nota oferecem *"Vincular NFC-e"* no menu `...`. Clicar em uma linha/card abre `TransactionDetailsSheet`.

## Estados de Interface e Recuperação

| Estado | Comportamento observado | Recuperação |
| --- | --- | --- |
| Loading | `TransactionsSkeleton` | Aguarda `GET /transactions` |
| Empty | `TransactionsEmptyState` com copy contextual, ação de limpar filtros e/ou `TransactionCreateButton` | Limpar filtros ou criar lançamento |
| Error | `TransactionsErrorState` (`ApiErrorAlert` `transactions.list`) | Botão `Tentar novamente` (`refetch`) |

## Consumo de Backend

| Operação | Autenticação | Contrato relevante | Efeito / Cache | Erros e recuperação | Fonte |
| --- | --- | --- | --- | --- | --- |
| `GET /transactions` | Cookie HttpOnly | `page`, `limit`, `sort`, `dateFrom?`, `dateTo?`, `type?`, `status?`, `accountId?`, `categoryId?` | `['transactions', 'list', params]` (`staleTime: 30s`, `retry < 2`) | `TransactionsErrorState` (`ApiErrorAlert` + retry) | `personal-finance-backend:docs/integrations/transactions/list-transactions.md` |
| `GET /accounts` + `GET /accounts/summary` *(cross-feature)* | Cookie HttpOnly | Contas ativas + saldo atual para KPI `Saldo atual` | `['accounts', ...]` (`staleTime: 30s`) | Alerta inline `accounts.summary` quando `view === 'ALL'` | `personal-finance-backend:docs/integrations/accounts/list-accounts.md` |
| `GET /categories` *(cross-feature)* | Cookie HttpOnly | 2 chamadas (`EXPENSE` e `INCOME`, `limit: 100`, `includeArchived: false`) | `['categories', params]` (`staleTime: 30s`) | Seletores usam lista disponível | `personal-finance-backend:docs/integrations/categories/list-categories.md` |
