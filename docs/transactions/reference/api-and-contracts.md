---
area: transactions
type: reference
status: current
last_reviewed: 2026-11-25
related:
  - ../README.md
  - ../concepts/transaction-model-and-types.md
  - ../concepts/transaction-attachments-model.md
  - ../flows/list-filter-and-kpis.md
  - ../flows/create-edit-and-transfer.md
  - ../flows/balance-adjustment.md
  - ../flows/confirm-and-delete-transaction.md
  - ../flows/manage-attachments.md
  - ../../architecture/api-error-handling.md
  - ../../architecture/module-boundaries.md
---

# Referência de API, Contratos, Erros e Gaps — `transactions`

Fonte de verdade dos endpoints consumidos, chaves de cache, parâmetros de URL, códigos de erro e divergências conhecidas em `src/features/transactions/`.

## Rotas Frontend

| Rota | Página | Query Params Suportados (`transactionUrl.utils.ts`) |
| --- | --- | --- |
| `/transactions` | `TransactionsPage` | `view` (`ALL` \| `INCOME` \| `EXPENSE` \| `TRANSFER` \| `ADJUSTMENT`), `status` (`PENDING` \| `EFFECTIVE`), `accountId`, `categoryId`, `search`, `dateFrom` (`YYYY-MM-DD`), `dateTo` (`YYYY-MM-DD`), `sort`, `page`, `limit`, `create` (`INCOME` \| `EXPENSE` \| `TRANSFER` \| `ADJUSTMENT`) |

## Endpoints Próprios Consumidos (`src/features/transactions/api/`)

Referência do contrato backend: `personal-finance-backend:docs/transactions/reference/` e `personal-finance-backend:docs/integrations/frontend-error-handling.md`.

| Método | Endpoint | Função / Hook | Cache / Invalidação |
| --- | --- | --- | --- |
| `GET` | `/transactions` | `getTransactions` / `useTransactions`, `usePendingTransactionRange` | Query key `TRANSACTION_QUERY_KEYS.list(params)` (`['transactions', 'list', params]`) |
| `GET` | `/transactions/:id` | `getTransaction` / `useTransaction` *(sem consumidor atual na UI)* | Query key `TRANSACTION_QUERY_KEYS.detail(id)` (`['transactions', 'detail', id]`) |
| `POST` | `/transactions` | `createTransaction` / `useCreateTransaction` | Invalida `TRANSACTION_QUERY_KEYS.transactions` e `ACCOUNT_QUERY_KEYS.accounts` |
| `POST` | `/transactions/balance-adjustments` | `useCreateBalanceAdjustment` | Invalida `TRANSACTION_QUERY_KEYS.transactions` e `ACCOUNT_QUERY_KEYS.accounts` |
| `PATCH` | `/transactions/:id` | `updateTransaction` / `useUpdateTransaction` | Invalida `TRANSACTION_QUERY_KEYS.transactions` e `ACCOUNT_QUERY_KEYS.accounts` |
| `PATCH` | `/transactions/:id/confirm` | `confirmTransaction` / `useConfirmTransaction` | Invalida `TRANSACTION_QUERY_KEYS.all` e `ACCOUNT_QUERY_KEYS.all` |
| `DELETE` | `/transactions/:id` | `deleteTransaction` / `useDeleteTransaction` | Invalida `TRANSACTION_QUERY_KEYS.all` e `ACCOUNT_QUERY_KEYS.all` |
| `GET` | `/transactions/:id/attachments` | `getTransactionAttachments` / `useTransactionAttachments` | Query key `TRANSACTION_QUERY_KEYS.attachments(id)` (`['transactions', 'attachments', id]`), `staleTime: 240_000` (4 min) |
| `POST` | `/transactions/:id/attachments` | `uploadTransactionAttachment` / `useUploadTransactionAttachment` | `multipart/form-data`; invalida `attachments(id)` e `TRANSACTION_QUERY_KEYS.all` |
| `PATCH` | `/transactions/:id/attachments/positions` | `reorderTransactionAttachments` / `useReorderTransactionAttachments` | Update otimista + rollback em `onError`; invalida `attachments(id)` em `onSettled` |
| `DELETE` | `/transactions/:id/attachments/:attachmentId` | `deleteTransactionAttachment` / `useDeleteTransactionAttachment` | Invalida `attachments(id)` e `TRANSACTION_QUERY_KEYS.all` |

## Endpoints Cross-Feature Consumidos por `TransactionsPage`

- `GET /accounts` (`useAccounts` de `accounts`) — seleção de conta origem/destino e filtros.
- `GET /accounts/summary` (`useAccountSummary` de `accounts`) — resumo patrimonial auxiliar no contexto da tela.
- `GET /categories` (`useCategories` de `categories`, 2 consultas para `INCOME` e `EXPENSE`) — seleção e filtro de categorias.

## Schemas de Validação Local (`src/features/transactions/schemas/`)

- **`transactionFormSchema` (`transaction.schema.ts`):** valida `type`, `description` (até 500 caracteres; obrigatória quando `ADJUSTMENT`), `amountCents` (`> 0`), `date` (`DateOnly` `YYYY-MM-DD`), `status`, `accountId`, `destinationAccountId` (obrigatório e diferente de `accountId` quando `TRANSFER`), `categoryId` (obrigatório quando `INCOME` ou `EXPENSE`), `direction` (obrigatória quando `ADJUSTMENT`).
- **`transactionConfirmSchema` (`transaction.schema.ts`):** valida `amountCents`, `date` (`DateOnly` `YYYY-MM-DD`), `accountId` e `destinationAccountId` na efetivação de lançamentos `PENDING`.
- **`targetBalanceAdjustmentSchema` (`balanceAdjustment.schema.ts`):** valida `accountId`, `targetBalanceCents` (inteiro seguro negativo, `0` ou positivo) e `description` opcional até 500 caracteres (`date` é preenchido automaticamente no submit via `getTodayDateOnly()`).
- **`manualBalanceAdjustmentSchema` (`balanceAdjustment.schema.ts`):** valida `accountId`, `direction` (`INCREASE` \| `DECREASE`), `amountCents` (`> 0`), `status` (`PENDING` \| `EFFECTIVE`), `date` (`DateOnly`) e `description` obrigatória (1 a 500 caracteres).

## Códigos de Erro do Domínio (`src/shared/errors/apiErrorCodes.ts`)

### Transações e Reajuste de Saldo (10 códigos)
| Código | Significado / Tratamento Esperado |
| --- | --- |
| `BALANCE_ADJUSTMENT_NO_DIFFERENCE` | `409` no contexto `transactions.balance-adjustment`: informa que o saldo atual já corresponde ao informado e invalida `ACCOUNT_QUERY_KEYS.accounts` para sincronizar a UI. |
| `INVALID_TRANSACTION` | Dados inválidos no lançamento; exibido inline no formulário ou via `ApiErrorAlert`. |
| `TRANSACTION_ACCOUNT_UNAVAILABLE` | Conta arquivada, inexistente ou inacessível para o lançamento. |
| `TRANSACTION_ALREADY_EFFECTIVE` | Tentativa de confirmar transação que já está `EFFECTIVE`. |
| `TRANSACTION_CANNOT_DELETE_TRANSFER` | Tentativa de excluir lançamento do tipo `TRANSFER` (também prevenido na UI por [`DEC-TRX-005`](../decisions/transfer-cannot-be-deleted.md)). |
| `TRANSACTION_CATEGORY_INCOMPATIBLE` | Categoria cujo tipo (`INCOME`/`EXPENSE`) não corresponde ao tipo da transação. |
| `TRANSACTION_CATEGORY_UNAVAILABLE` | Categoria arquivada/inexistente; no contexto `transactions.balance-adjustment`, exibe copy específica sobre configuração técnica de ajuste indisponível. |
| `TRANSACTION_INVALID_STATE_TRANSITION` | Transição de status inválida para a operação solicitada. |
| `TRANSACTION_NOT_FOUND` | Transação não encontrada ou já removida. |
| `TRANSACTION_UPDATE_EMPTY` | Payload `PATCH` enviado sem campos alterados (prevenido na UI por envio diff-only). |

### Anexos (7 códigos)
| Código | Significado / Tratamento Esperado |
| --- | --- |
| `TRANSACTION_TYPE_DOES_NOT_SUPPORT_ATTACHMENTS` | Tipo de transação (`TRANSFER` ou `ADJUSTMENT`) não suporta anexos. |
| `TRANSACTION_ATTACHMENT_LIMIT_EXCEEDED` | Limite máximo de 3 anexos por transação atingido. |
| `ATTACHMENT_FILE_TOO_LARGE` | Arquivo excede o limite de `5 MiB`. |
| `UNSUPPORTED_ATTACHMENT_FILE` | MIME/formato fora de `image/jpeg`, `image/png` ou `image/webp`. |
| `ATTACHMENT_DIMENSIONS_EXCEEDED` | Dimensões da imagem acima do limite aceito pelo backend. |
| `INVALID_ATTACHMENT_POSITION` | Vetor de posições inválido em `PATCH /transactions/:id/attachments/positions`. |
| `TRANSACTION_ATTACHMENT_NOT_FOUND` | Anexo não encontrado para reordenação ou remoção. |

## Gaps e Divergências Observados no Código Atual

Registrados explicitamente para evitar documentar comportamento inexistente e guiar correções futuras:

1. **Busca de anexos sem curto-circuito por `attachmentsCount`:** `TransactionAttachmentsGallery` habilita `useTransactionAttachments` com `enabled: isEligible`, disparando `GET /transactions/:id/attachments` mesmo quando `attachmentsCount === 0` em modo detalhes.
2. **Erro silencioso na listagem de anexos:** `TransactionAttachmentsGallery` ainda não renderiza `ApiErrorAlert` inline caso `useTransactionAttachments` falhe.
3. **Exclusão de anexo sem confirmação:** a ação **Excluir** no menu `...` de `TransactionAttachmentThumbnail` dispara `DELETE` imediatamente, sem modal de confirmação.
4. **Dupla superfície de erro na exclusão de transação:** `useDeleteTransaction` dispara `showApiErrorToast` em `onError` enquanto `TransactionDeleteDialog` também renderiza `ApiErrorAlert` (pode duplicar feedback visual no erro).
5. **Símbolo/prop ociosos:** `useTransaction(id)` está implementado em `api/queries.ts` sem uso ativo na UI; `TransactionsPage` repassa `isMutating = false` fixo para `TransactionsTable`.
6. **Cobertura parcial do barrel `index.ts`:** `src/features/transactions/index.ts` já expõe `BalanceAdjustmentSheet`, `BalanceAdjustmentSheetState` e `BalanceAdjustmentMode`, mas consumidores legados ainda importam `queries` e `transactionUrl.utils` por caminhos internos (`DT-03` em [module-boundaries.md](../../architecture/module-boundaries.md)).
