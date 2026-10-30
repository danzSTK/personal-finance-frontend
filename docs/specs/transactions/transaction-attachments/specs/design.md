# Design Técnico: Galeria de Anexos de Transações

## 1. Arquitetura de Estado e Queries (TanStack Query)
- **Key da Query**: `['transaction-attachments', transactionId]`
- **Fetch sob Demanda**: `enabled: Boolean(transactionId && (transaction.attachmentsCount ?? 0) > 0)`
- **staleTime**: `240 * 1000` (4 minutos, alinhado com `cacheMaxAgeSeconds` do backend).
- **Invalidações coordenadas**:
  - `addAttachments`: Invalida `['transaction-attachments', transactionId]` e `['transactions']`.
  - `deleteAttachment`: Invalida `['transaction-attachments', transactionId]` e `['transactions']`.
  - `reorderAttachments`: Atualiza cache otimista e invalida `['transaction-attachments', transactionId]`.

## 2. Componentes (Atomic Design)
- **Atoms**:
  - `TransactionAttachmentBadge`: Pill compacto com ícone de clipe e texto `X anexo(s)` para tabela desktop e linha mobile.
- **Molecules**:
  - `TransactionAttachmentThumbnail`: Card retangular (proporção 4:3 ou 16:9), imagem com object-cover, botão de menu de opções (`...`), indicador de posição e listeners de drag-and-drop / pointer.
  - `TransactionAttachmentUploadCard`: Card pontilhado com estado de upload, drag-and-drop de arquivo e input file oculto.
- **Organisms**:
  - `TransactionAttachmentsGallery`: Faixa horizontal com Embla Carousel ou scroll nativo snap-x. No desktop, oculta scrollbar e renderiza botões flutuantes `<` e `>` com degradês de fade nas laterais.
  - `TransactionAttachmentImageViewer`: Radix Dialog em tela cheia com overlay escuro, suporte a zoom (transform scale), pan (drag translate), navegação por teclado (`Escape`, `ArrowLeft`, `ArrowRight`) e contador ("1 de 3").

## 3. Contratos de API e DTOs
```typescript
export interface TransactionAttachment {
  id: string
  assetId: string
  position: number
  contentType: string
  sizeBytes: number
  url: string
  expiresAt: string
  cacheMaxAgeSeconds: number
}

export interface ReorderAttachmentItemDto {
  id: string
  position: number
}

export interface ReorderAttachmentsDto {
  positions: ReorderAttachmentItemDto[]
}
```

## 4. Mapeamento de Erros de API
Utilizar helper tipado mapeando `error.code` para mensagens claras em PT-BR:
- `TRANSACTION_TYPE_DOES_NOT_SUPPORT_ATTACHMENTS`
- `TRANSACTION_ATTACHMENT_LIMIT_EXCEEDED`
- `ATTACHMENT_FILE_TOO_LARGE`
- `UNSUPPORTED_ATTACHMENT_FILE`
- `ATTACHMENT_DIMENSIONS_EXCEEDED`
- `INVALID_ATTACHMENT_POSITION`
- `TRANSACTION_ATTACHMENT_NOT_FOUND`
- Fallback padrão: "Não foi possível concluir a operação de anexos."
