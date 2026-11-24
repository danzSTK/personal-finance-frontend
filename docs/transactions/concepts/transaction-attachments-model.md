---
area: transactions
type: concept
status: current
related:
  - ../README.md
  - ../flows/manage-attachments.md
  - ../decisions/lazy-attachment-fetching-and-cache.md
  - ../decisions/dual-reordering-drag-and-accessible-menu.md
  - ../decisions/transfer-cannot-be-deleted.md
---

# Modelo de Anexos e Comprovantes de Transações

Anexos permitem associar comprovantes de imagem a lançamentos de receita ou despesa, com ordenação explícita controlada pelo usuário e visualização ampliada.

## Elegibilidade e Limites Técnicos (`transaction-attachment.types.ts`)

| Regra | Valor / Contrato |
| --- | --- |
| Tipos elegíveis | Apenas `INCOME` e `EXPENSE` (`TRANSFER` e `ADJUSTMENT` bloqueados na UI e no backend via `TRANSACTION_TYPE_DOES_NOT_SUPPORT_ATTACHMENTS`) |
| Quantidade máxima | `ATTACHMENT_MAX_FILES = 3` (posições `0`, `1` e `2`) |
| Tamanho máximo por arquivo | `ATTACHMENT_MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024` (`5 MB`) |
| Formatos aceitos | MIME `image/png`, `image/jpeg`, `image/webp` (extensões `.png`, `.jpg`, `.jpeg`, `.webp`) |
| Dimensões máximas | Validadas no backend (até 60 MP; erro `ATTACHMENT_DIMENSIONS_EXCEEDED`) |

## Presigned URLs e Retenção de Cache

- O backend armazena arquivos em bucket privado (Cloudflare R2) e retorna URLs pré-assinadas com validade de `300s` (5 minutos) e `cacheMaxAgeSeconds: 240`.
- A listagem de transações (`GET /transactions`) retorna apenas `attachmentsCount` (sem gerar URLs pré-assinadas).
- A query `useTransactionAttachments` (`['transaction-attachments', transactionId]`) usa `staleTime: 240_000` (4 minutos) para equilibrar reuso de cache e renovação antes da expiração da assinatura.

## Dois Modos de Operação: Galeria Viva vs. Staging Local

1. **Galeria viva (`TransactionAttachmentsGallery`):** usada em `TransactionDetailsSheet` e em `TransactionFormSheet` (`mode: 'edit'`). Opera diretamente sobre os endpoints `/transactions/:id/attachments*`.
2. **Staging local (`TransactionStagedAttachmentsField`):** usada em `TransactionFormSheet` (`mode: 'create'`). Mantém `StagedTransactionAttachment[]` em memória com `URL.createObjectURL` (revogados em remoção, reset e unmount), permitindo pré-visualização, lightbox e reordenação antes do `POST /transactions`. Após a criação do lançamento, os arquivos em staging são enviados sequencialmente via `POST /transactions/:id/attachments`.
