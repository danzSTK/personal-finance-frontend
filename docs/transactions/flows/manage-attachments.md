---
area: transactions
type: flow
status: current
related:
  - ../README.md
  - ../concepts/transaction-attachments-model.md
  - ./create-edit-and-transfer.md
  - ../decisions/lazy-attachment-fetching-and-cache.md
  - ../decisions/dual-reordering-drag-and-accessible-menu.md
  - ../components/attachment-gallery-and-viewer.md
  - ../reference/api-and-contracts.md
---

# Gerenciamento de Anexos e Comprovantes

Descreve o ciclo de vida completo de comprovantes na galeria de uma transação: visualização, upload (detalhes, edição e staging na criação), reordenação dual, lightbox com zoom e exclusão.

## Atores, Pré-condições e Pontos de Entrada

- **Ator:** usuário autenticado em `/transactions`.
- **Pré-condição:** transação do tipo `INCOME` ou `EXPENSE` (`TRANSFER` e `ADJUSTMENT` não exibem galeria nem staging).
- **Pontos de entrada:** badge de contagem (`TransactionAttachmentBadge`) na listagem, `TransactionDetailsSheet` e `TransactionFormSheet` (modos `create` e `edit`).

## Fluxos Principais

### 1. Visualização na Galeria
1. Na tabela desktop e nos cards mobile, o `TransactionAttachmentBadge` exibe a contagem quando `attachmentsCount > 0`.
2. Ao abrir `TransactionDetailsSheet` ou `TransactionFormSheet` (`edit`) para uma transação elegível, `TransactionAttachmentsGallery` consulta `GET /transactions/:id/attachments` (`staleTime: 240_000`) e renderiza as miniaturas ordenadas por `position` (`0..2`).

### 2. Upload (Detalhes, Edição e Criação)
1. Enquanto houver menos de `3` anexos, `TransactionAttachmentUploadCard` permite clicar ou arrastar arquivos (`PNG`, `JPG`, `JPEG`, `WebP`, até `5 MB`). Violações de quantidade, MIME ou tamanho disparam toast destrutivo ainda no cliente.
2. Em detalhes e edição, `useAddTransactionAttachments` envia imediatamente `POST /transactions/:id/attachments` como `multipart/form-data` (campo `files`) e invalida `['transaction-attachments', id]` e `['transactions']`.
3. Na criação, `TransactionStagedAttachmentsField` mantém prévias locais (`URL.createObjectURL`) que são enviadas após o `POST /transactions`. Se o upload falhar após a criação, um toast orienta o usuário e o sheet fecha para evitar duplicação da transação.

### 3. Reordenação Dual
1. O usuário pode arrastar uma miniatura (HTML5 drag-and-drop) ou acionar o menu `...` → `Mover para esquerda` / `Mover para direita`.
2. Na galeria viva, `useReorderTransactionAttachments` aplica **update otimista** no cache `['transaction-attachments', id]` e envia `PATCH /transactions/:id/attachments/positions` com `{ positions: [{ id, position }] }`.
3. Em falha, o cache é revertido ao snapshot anterior e `showApiErrorToast` (`transactions.attachments.reorder`) notifica o erro.

### 4. Visualizador Ampliado (Lightbox)
1. Clicar na miniatura abre `TransactionAttachmentImageViewer` (`Dialog` fullscreen).
2. Suporta zoom `1x`–`3x` (botões `+`/`-`, duplo clique `1x ↔ 2.2x`, reset), arraste com pointer-capture quando ampliado, navegação anterior/próximo (botões ou `ArrowLeft`/`ArrowRight`), `Escape` para fechar e contador `X de Y`.

### 5. Exclusão de Anexo
1. No menu `...` da miniatura, `Excluir comprovante` remove imediatamente:
   - na galeria viva: `DELETE /transactions/:id/attachments/:attachmentId` (invalida galeria e transações + toast);
   - no staging: remove do array local e revoga o `ObjectURL`.

## Segurança e Privacidade

- Imagens servidas por presigned URLs temporárias (300s) sem credenciais na URL pública permanente; validação de MIME/tamanho no cliente complementada por validação de magic bytes e dimensões (60 MP) no backend.

## Consumo de Backend

| Operação | Autenticação | Contrato relevante | Efeito / Cache | Erros e recuperação | Fonte |
| --- | --- | --- | --- | --- | --- |
| `GET /transactions/:id/attachments` | Cookie HttpOnly | Lista ordenada por `position` com presigned URLs (`300s`) | `['transaction-attachments', id]` (`staleTime: 240s`, `retry < 2`) | Contexto `transactions.attachments.list` *(gap: erro ainda não exibido em `ApiErrorAlert` na galeria)* | `personal-finance-backend:docs/integrations/transactions/list-transaction-attachments.md` |
| `POST /transactions/:id/attachments` | Cookie HttpOnly | `multipart/form-data` (`files`, máx. 3 arquivos / 5 MB) | Invalida `['transaction-attachments', id]` e `['transactions']` | `TRANSACTION_ATTACHMENT_LIMIT_EXCEEDED`, `ATTACHMENT_FILE_TOO_LARGE`, `UNSUPPORTED_ATTACHMENT_FILE`, `ATTACHMENT_DIMENSIONS_EXCEEDED`, `TRANSACTION_TYPE_DOES_NOT_SUPPORT_ATTACHMENTS` → `showApiErrorToast` | `personal-finance-backend:docs/integrations/transactions/add-transaction-attachments.md` |
| `PATCH /transactions/:id/attachments/positions` | Cookie HttpOnly | `{ positions: [{ id, position }] }` | Update otimista + rollback em erro + invalida em `onSettled` | `INVALID_ATTACHMENT_POSITION`, `TRANSACTION_ATTACHMENT_NOT_FOUND` → rollback + `showApiErrorToast` | `personal-finance-backend:docs/integrations/transactions/reorder-transaction-attachments.md` |
| `DELETE /transactions/:id/attachments/:attachmentId` | Cookie HttpOnly | Path `:id`, `:attachmentId` | Invalida `['transaction-attachments', id]` e `['transactions']` + toast | `TRANSACTION_ATTACHMENT_NOT_FOUND` → `showApiErrorToast` | `personal-finance-backend:docs/integrations/transactions/delete-transaction-attachment.md` |
