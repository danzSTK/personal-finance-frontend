---
area: transactions
type: flow
status: current
related:
  - ../README.md
  - ../concepts/transaction-model-and-types.md
  - ../decisions/transfer-cannot-be-deleted.md
  - ../components/transaction-screen-components.md
  - ../reference/api-and-contracts.md
---

# Confirmar Pendência e Excluir Transação

Descreve os fluxos separados de efetivação de lançamentos pendentes (`TransactionConfirmSheet`) e exclusão de lançamentos comuns (`TransactionDeleteDialog`).

## Fluxo 1 — Confirmar Transação Pendente (`TransactionConfirmSheet`)

- **Pré-condição:** disponível apenas quando `transaction.status === 'PENDING'` (acionado pelo menu da linha ou por `TransactionDetailsSheet`).
- **Copy adaptativa por tipo:** `Confirmar recebimento` (`INCOME`), `Pagar despesa` (`EXPENSE`), `Confirmar transferência` (`TRANSFER`) ou `Confirmar ajuste` (`ADJUSTMENT`).
- **Campos ajustáveis antes de efetivar:** `amountCents`, `date` (`DateOnly`), `accountId` e (quando `TRANSFER`) `destinationAccountId` distinta da origem (exigindo ao menos 2 contas ativas).
- **Validação e envio:** validado por `transactionConfirmSchema` → `PATCH /transactions/:id/confirm` (`useConfirmTransaction`).
- **Sucesso:** invalida `['transactions']` e `['accounts']` (`exact: false`), exibe toast de sucesso e fecha o sheet.
- **Erro (`TRANSACTION_ALREADY_EFFECTIVE`, `TRANSACTION_INVALID_STATE_TRANSITION`, `TRANSACTION_ACCOUNT_UNAVAILABLE`, `VALIDATION_ERROR`, etc.):** aplica `applyApiFieldErrors` e exibe `ApiErrorAlert` inline (`transactions.confirm`) preservando os valores.

## Fluxo 2 — Excluir Transação (`TransactionDeleteDialog`)

- **Pré-condição:** disponível para lançamentos não-`TRANSFER`. Para `TRANSFER`, a ação é ocultada no menu e em `TransactionDetailsSheet` (exibindo orientação: *"Para corrigir, faça uma nova transferência no sentido contrário."*) e bloqueada defensivamente em `TransactionDeleteDialog`.
- **Confirmação:** `AlertDialog` exibe descrição, valor formatado e aviso de irreversibilidade antes de disparar `DELETE /transactions/:id` (`useDeleteTransaction`).
- **Sucesso:** invalida `['transactions']` e `['accounts']` (`exact: false`), exibe toast de sucesso e fecha o dialog.
- **Erro (`TRANSACTION_CANNOT_DELETE_TRANSFER`, `TRANSACTION_NOT_FOUND`, etc.):** mantém o dialog aberto exibindo `ApiErrorAlert` inline (`transactions.delete`) — nota: o hook `useDeleteTransaction` atualmente também chama `showApiErrorToast` em `onError`.

## Consumo de Backend

| Operação | Autenticação | Contrato relevante | Efeito / Cache | Erros e recuperação | Fonte |
| --- | --- | --- | --- | --- | --- |
| `PATCH /transactions/:id/confirm` | Cookie HttpOnly | `ConfirmTransactionDto` (`amountCents`, `date`, `accountId`, `destinationAccountId?`) | Invalida `['transactions']` e `['accounts']` + toast | Field errors + `ApiErrorAlert` (`transactions.confirm`) | `personal-finance-backend:docs/integrations/transactions/confirm-transaction.md` |
| `DELETE /transactions/:id` | Cookie HttpOnly | Path `:id` (soft delete no backend; proibido para `TRANSFER`) | Invalida `['transactions']` e `['accounts']` + toast | `ApiErrorAlert` no dialog + `showApiErrorToast` (`transactions.delete`) | `personal-finance-backend:docs/integrations/transactions/delete-transaction.md` |
