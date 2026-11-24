---
area: transactions
type: concept
status: current
related:
  - ../README.md
  - ../flows/list-filter-and-kpis.md
  - ../flows/create-edit-and-transfer.md
  - ../flows/confirm-and-delete-transaction.md
  - ../decisions/transfer-cannot-be-deleted.md
---

# Modelo de Transação, Tipos, Status, Centavos e `DateOnly`

Uma transação representa um lançamento financeiro vinculado a uma conta (`accountId`) — e a uma conta de destino (`destinationAccountId`) no caso de `TRANSFER` — cujo impacto no saldo depende do tipo e do status efetivado.

## Tipos (`TransactionType`) e Visões (`TransactionView`)

| `TransactionType` | Rótulo | Exposto em `TransactionView` / Formulário? | Regras de vínculo |
| --- | --- | --- | --- |
| `EXPENSE` | `Despesa` | Sim (view `EXPENSE` e formulário) | Exige `categoryId` ativa do tipo `EXPENSE` |
| `INCOME` | `Receita` | Sim (view `INCOME` e formulário) | Exige `categoryId` ativa do tipo `INCOME` |
| `TRANSFER` | `Transferência` | Sim (view `TRANSFER` e formulário) | Omite `categoryId`; exige `destinationAccountId !== accountId` e ao menos 2 contas ativas; não deletável; não aceita anexos |
| `ADJUSTMENT` | `Ajuste` | Modelado em tipos/schemas (`direction: 'INCREASE' \| 'DECREASE'`), fora do seletor de formulário e abas de visão | — |

- Na visão `ALL`, o frontend omite `type` em `GET /transactions` e recebe `summary.object === 'transaction_summary.overview'` (receitas e despesas).
- Nas visões específicas (`EXPENSE`, `INCOME`, `TRANSFER`), envia `type` e recebe `summary.object === 'transaction_summary.type'`.

## Status Persistido vs. Derivado

| Status | Origem | Significado no produto |
| --- | --- | --- |
| `EFFECTIVE` | Persistido (`status === 'EFFECTIVE'`) | Lançamento efetivado (`Efetuada`); impacta saldo atual |
| `PENDING` | Persistido (`status === 'PENDING'`) | Lançamento futuro ou do dia ainda não efetivado (`Pendente`) |
| `OVERDUE` | Derivado em `getTransactionDerivedStatus(transaction, today)` | `status !== 'EFFECTIVE' && effectiveAt === null && isPastDateOnly(date, today)` (`Atrasada`) |

- `PATCH /transactions/:id` **nunca** altera `status`; somente `PATCH /transactions/:id/confirm` promove `PENDING` → `EFFECTIVE`.

## Valor Monetário (`amountCents`)

- Sempre inteiro seguro estritamente positivo (`> 0`, `<= Number.MAX_SAFE_INTEGER`), validado por `positiveAmountCentsSchema` e digitado via `CurrencyInput` cent-first (`123` → `R$ 1,23`).
- A direção financeira é dada pelo `type` (e `direction` em `ADJUSTMENT`), nunca por valor negativo no payload.
- Exibição: `.numeric` obrigatório; `INCOME` usa `text-state-income` com prefixo `+`, `EXPENSE` usa `text-state-expense` (sem sinal `-` em `getTransactionAmountSign`), e `TRANSFER`/`ADJUSTMENT` usam `text-foreground`.

## Contrato Temporal (`DateOnly` vs. `Instant`)

- **Datas civis (`DateOnly`, `YYYY-MM-DD`):** `transaction.date`, `dateFrom` e `dateTo`. Validadas por `isValidDateOnly` (respeitando dias do mês e ano bissexto) e exibidas via `formatDateOnlyForDisplay` (`dd/MM/yyyy`), sem jamais passar por `new Date(...).toISOString()`.
- **Instantes UTC (`Instant`):** `createdAt`, `updatedAt` e `effectiveAt`, formatados para exibição local por `formatTransactionTimestamp` (`formatDateTime`).
- **Descrição:** opcional, máximo de 120 caracteres, normalizada para `null` quando vazia (`normalizeOptionalText`), com fallback visual `Sem descrição`.
