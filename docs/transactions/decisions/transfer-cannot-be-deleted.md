---
area: transactions
type: decision
status: current
last_reviewed: 2026-11-24
decision-id: DEC-TRX-005
decision-status: accepted
related:
  - ../README.md
  - ../concepts/transaction-model-and-types.md
  - ../concepts/transaction-attachments-model.md
  - ../flows/confirm-and-delete-transaction.md
  - ../flows/create-edit-and-transfer.md
  - ../reference/api-and-contracts.md
---

# DEC-TRX-005: Transferências não podem ser excluídas e não aceitam anexos

## Problema

No domínio da Danfy, uma transação do tipo `TRANSFER` representa uma movimentação pareada entre conta de origem (`accountId`) e conta de destino (`destinationAccountId`). Permitir exclusão direta ou vínculo de comprovantes de despesa/receita sobre transferências violaria as regras do backend (`TRANSACTION_CANNOT_DELETE_TRANSFER` e `TRANSACTION_TYPE_DOES_NOT_SUPPORT_ATTACHMENTS`) e induziria erros evitáveis na interface.

## Decisão

Espelhar preventivamente as invariantes de domínio na UI de `transactions`:

1. **Bloqueio de exclusão:** ocultar ou desabilitar a ação de excluir em `TransactionActionsMenu` e `TransactionDetailsSheet` quando `transaction.type === 'TRANSFER'` (ou `ADJUSTMENT`), mantendo `TransactionDeleteDialog` como rede de segurança caso `TRANSACTION_CANNOT_DELETE_TRANSFER` seja retornado pelo backend.
2. **Inelegibilidade de anexos:** não renderizar `TransactionAttachmentsGallery`, `TransactionStagedAttachmentsField` nem `TransactionAttachmentBadge` para `TRANSFER` (nem para `ADJUSTMENT`), verificando `isEligible = type === 'INCOME' || type === 'EXPENSE'`.
3. **Sem categoria:** o campo `categoryId` é ocultado e removido do payload em formulários de `TRANSFER`.

## Consequência

- O usuário não encontra ações condenadas a falhar no servidor, reduzindo fricção e chamadas inválidas.
- O backend continua sendo a fonte final de verdade: os códigos `TRANSACTION_CANNOT_DELETE_TRANSFER` e `TRANSACTION_TYPE_DOES_NOT_SUPPORT_ATTACHMENTS` permanecem tratados em `src/shared/errors/` caso acionados por concorrência ou uso direto da API.
