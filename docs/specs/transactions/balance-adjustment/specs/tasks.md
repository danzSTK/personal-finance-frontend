---
area: transactions
feature: balance-adjustment
type: spec-tasks
status: approved
last_reviewed: 2026-11-25
related:
  - ./requirements.md
  - ./design.md
  - ./decisions.md
---

# Tasks — Reajuste de Saldo (Frontend)

## Checklist de Implementação

- [x] 1. **Infraestrutura compartilhada (`CurrencyInput` + erros de API)**
  - Estender `src/shared/components/atoms/CurrencyInput.tsx` com prop opcional `allowNegative?: boolean` (default `false`), suportando `-`, `+`, `0`, `Backspace` e paste negativo mantendo compatibilidade integral.
  - Registrar `balanceAdjustmentNoDifference: 'BALANCE_ADJUSTMENT_NO_DIFFERENCE'` em `src/shared/errors/apiErrorCodes.ts`.
  - Adicionar contexto `'transactions.balance-adjustment'` em `src/shared/errors/apiError.types.ts` e mapear `BALANCE_ADJUSTMENT_NO_DIFFERENCE` + copy contextual de `TRANSACTION_CATEGORY_UNAVAILABLE` + fallback em `src/shared/errors/resolveApiError.ts`.
  - Adicionar/atualizar testes em `src/shared/components/atoms/CurrencyInput.test.tsx` e `src/shared/errors/resolveApiError.test.ts`.

- [x] 2. **Contratos, constantes, schemas, utilitários e mutação em `transactions`**
  - Adicionar `balanceAdjustments: '/transactions/balance-adjustments'`, `ADJUSTMENT` em `TRANSACTION_VIEW_OPTIONS` / `TRANSACTION_VIEW_CREATE_LABELS` e ícone `SlidersHorizontal` em `src/features/transactions/constants/transaction.constants.ts`.
  - Adicionar `CreateBalanceAdjustmentDto` em `src/features/transactions/types/transaction.types.ts` e atualizar `TransactionView` e novos tipos `BalanceAdjustmentMode` / `BalanceAdjustmentSheetState` em `src/features/transactions/types/transaction-ui.types.ts`.
  - Implementar `useCreateBalanceAdjustment()` e ajustar toast de `ADJUSTMENT` em `useCreateTransaction()` em `src/features/transactions/api/mutations.ts` (invalidando `transactions` e `accounts`).
  - Criar `src/features/transactions/schemas/balanceAdjustment.schema.ts` e atualizar `src/features/transactions/schemas/transaction.schema.ts` (descrição até 500 chars e obrigatória para `ADJUSTMENT`).
  - Criar `src/features/transactions/utils/balanceAdjustment.utils.ts` com cálculos em `BigInt` e builders de DTO + testes unitários (`balanceAdjustment.utils.test.ts`).
  - Atualizar `src/features/transactions/utils/transaction.utils.ts` (sinal/classe/rótulo de `ADJUSTMENT` por `direction`) e `src/features/transactions/utils/transactionUrl.utils.ts` (suporte a `view=ADJUSTMENT` e `create=ADJUSTMENT`, limpando `categoryId`).

- [x] 3. **Componentes de Reajuste de Saldo e API pública de `transactions`**
  - Criar `src/features/transactions/components/molecules/BalanceAdjustmentPreview.tsx` (prévia em tempo real para modos `target` e `manual`).
  - Criar `src/features/transactions/components/organisms/BalanceAdjustmentSheet.tsx` (sheet responsivo mobile/desktop com alternância `Informar novo saldo` / `Informar valor do ajuste`, controle de sinal `+`/`−`, `CurrencyInput`, `DateOnlyPicker`, `ApiErrorAlert`, `applyApiFieldErrors`, invalidação em `409 BALANCE_ADJUSTMENT_NO_DIFFERENCE`).
  - Criar `src/features/transactions/index.ts` exportando a API pública (`BalanceAdjustmentSheet`, `BalanceAdjustmentSheetState`, `BalanceAdjustmentMode`).
  - Criar testes de integração em `src/features/transactions/components/organisms/BalanceAdjustmentSheet.test.tsx`.

- [x] 4. **Integração na tela de Contas (`/accounts`)**
  - Atualizar `src/features/accounts/components/organisms/AccountCard.tsx` para receber `onAdjustBalance`, habilitar `Reajustar saldo` em `AccountDetailsPanel` (fechando o detalhe antes de abrir o sheet) e `AccountActionsMenu` (removendo badge `"Planejado"`), e bloquear/ocultar para contas arquivadas.
  - Atualizar `src/features/accounts/components/pages/AccountsPage.tsx` para controlar `BalanceAdjustmentSheetState` e renderizar `BalanceAdjustmentSheet` importado de `@/features/transactions`.
  - Atualizar `src/features/accounts/components/organisms/AccountCard.test.tsx` cobrindo contas ativas e arquivadas.

- [x] 5. **Integração na tela de Transações (`/transactions`)**
  - Atualizar `TransactionsPage.tsx` para suportar `view=ADJUSTMENT`, abrir `BalanceAdjustmentSheet` via `TransactionCreateButton` ou `?create=ADJUSTMENT`, e omitir `categoryId` em `listParams`.
  - Atualizar `TransactionsKpiGrid.tsx`, `TransactionFiltersSheet.tsx`, `TransactionsTable.tsx`, `TransactionDetailsSheet.tsx` e `TransactionFormSheet.tsx` (edição de `ADJUSTMENT` com `direction` e `description` obrigatória).
  - Atualizar/adicionar testes em `TransactionsKpiGrid.test.tsx`, `TransactionsTable.test.tsx`, `TransactionDetailsSheet.test.tsx` e `TransactionFormSheet.test.tsx`.

- [x] 6. **Documentação viva modular e verificação de qualidade**
  - [x] Criar `docs/transactions/flows/balance-adjustment.md` e atualizar `docs/transactions/README.md`, `docs/transactions/concepts/transaction-model-and-types.md`, `docs/transactions/reference/api-and-contracts.md`, `src/features/transactions/AGENTS.md`.
  - [x] Atualizar `docs/accounts/README.md`, `docs/accounts/flows/account-detail-and-summary.md`, `docs/accounts/reference/api-and-contracts.md`, `src/features/accounts/AGENTS.md` e `docs/architecture/module-boundaries.md`.
  - [x] Executar `npm run lint`, `npm test` e `npm run build` garantindo zero erros.
  - [x] Revisar em tela contra o backend real na rede Tailscale (fluxos principal e alternativo, valores positivo/zero/negativo, conflito, listagem e detalhes em `/transactions`).
