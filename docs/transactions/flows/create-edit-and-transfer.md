---
area: transactions
type: flow
status: current
related:
  - ../README.md
  - ../concepts/transaction-model-and-types.md
  - ../concepts/transaction-attachments-model.md
  - ./manage-attachments.md
  - ../decisions/transfer-cannot-be-deleted.md
  - ../components/transaction-screen-components.md
  - ../reference/api-and-contracts.md
---

# Criar, Editar e Transferir Lançamentos

Descreve o fluxo do `TransactionFormSheet` (`side={isMobile ? 'bottom' : 'right'}`) para criação e edição de receitas (`INCOME`), despesas (`EXPENSE`) e transferências (`TRANSFER`).

## Atores, Pré-condições e Pontos de Entrada

- **Ator:** usuário autenticado em `/transactions`.
- **Pré-condições:** apenas contas e categorias ativas (`!isArchived`) são selecionáveis; `TRANSFER` exige `activeAccounts.length >= 2`.
- **Pontos de entrada:** `TransactionCreateButton`, empty state, intenção `?create=INCOME|EXPENSE|TRANSFER` (criação), menu de ações da linha ou `TransactionDetailsSheet` (edição).

## Fluxo de Criação (`mode: 'create'`)

1. O formulário apresenta `CurrencyInput` (cent-first), switch de status (`EFFECTIVE` padrão vs. `PENDING`), presets de data (`Hoje`, `Ontem`, `Outro` → `DateOnlyPicker`), descrição (até 120 caracteres), conta de origem e:
   - para `INCOME` / `EXPENSE`: seletor de categoria do mesmo tipo + `TransactionStagedAttachmentsField`;
   - para `TRANSFER`: seletor de conta de destino (impede `destinationAccountId === accountId`; mudar origem limpa destino se igual), sem categoria e sem anexos.
2. Ao submeter, `transactionFormSchema` valida e envia `POST /transactions` (`useCreateTransaction`).
3. Se houver arquivos em staging (`stagedAttachments.length > 0`), envia imediatamente `POST /transactions/:id/attachments` (`uploadTransactionAttachments`):
   - em sucesso: invalida anexos e fecha o sheet;
   - em falha no upload pós-criação: exibe `showApiErrorToast(..., 'transactions.attachments.add')`, limpa o staging e **fecha o sheet** para evitar que o usuário reenvie e duplique a transação já criada.

## Fluxo de Edição (`mode: 'edit'`)

1. Expõe seletor de tipo (`EXPENSE`, `INCOME`, `TRANSFER`), oculta o switch de status (status não é editável por `PATCH`) e incorpora a galeria viva `TransactionAttachmentsGallery` quando o tipo for `INCOME` ou `EXPENSE`.
2. Constrói payload **diff-only** (`UpdateTransactionDto`) contendo apenas campos alterados; se não houver diferença, fecha o sheet sem chamada HTTP.
3. Envia `PATCH /transactions/:id` (`useUpdateTransaction`), invalidando `['transactions']` e `['accounts']` (`exact: false`) em sucesso.

## Estados de Interface e Recuperação

| Cenário | Comportamento observado | Recuperação |
| --- | --- | --- |
| Pending / upload staged | Botão submit desabilitado preservando valores | Aguarda conclusão |
| `VALIDATION_ERROR` | `applyApiFieldErrors` mapeia `amountCents`/`amount`, `date`, `accountId`, `destinationAccountId`, `categoryId`, `description`, `type`, `status`, `direction` e foca o primeiro inválido | Corrigir campo e reenviar |
| Conflito / indisponibilidade (`TRANSACTION_ACCOUNT_UNAVAILABLE`, `TRANSACTION_CATEGORY_INCOMPATIBLE`, `TRANSACTION_CATEGORY_UNAVAILABLE`, `TRANSACTION_UPDATE_EMPTY`, etc.) | `ApiErrorAlert` inline preservando todos os dados digitados | Ajustar seleção ou tentar novamente |

## Consumo de Backend

| Operação | Autenticação | Contrato relevante | Efeito / Cache | Erros e recuperação | Fonte |
| --- | --- | --- | --- | --- | --- |
| `POST /transactions` | Cookie HttpOnly | `CreateTransactionDto` (`amountCents > 0`, `date` `DateOnly`, `destinationAccountId` para `TRANSFER`) | Invalida `['transactions']` e `['accounts']` + toast | Field errors + `ApiErrorAlert` (`transactions.create`) | `personal-finance-backend:docs/integrations/transactions/create-transaction.md` |
| `PATCH /transactions/:id` | Cookie HttpOnly | `UpdateTransactionDto` diff-only (nunca envia `status`) | Invalida `['transactions']` e `['accounts']` + toast | Field errors + `ApiErrorAlert` (`transactions.update`) | `personal-finance-backend:docs/integrations/transactions/update-transaction.md` |
| `POST /transactions/:id/attachments` | Cookie HttpOnly | `multipart/form-data` (`files`) após `POST /transactions` | Invalida `['transaction-attachments', id]` e `['transactions']` | Toast destrutivo + fecha sheet para não duplicar lançamento | `personal-finance-backend:docs/integrations/transactions/add-transaction-attachments.md` |
