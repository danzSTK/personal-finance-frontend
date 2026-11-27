---
area: fiscal-notes
type: component
status: current
last_reviewed: 2026-11-27
related:
  - ../README.md
  - ../flows/import-link-and-unlink.md
  - ../decisions/adr-qr-scanner-and-module-boundaries.md
  - ../../transactions/components/transaction-screen-components.md
---

# Superfícies, Atomic Design e API Pública — `fiscal-notes`

Este documento descreve a árvore Atomic Design do módulo `src/features/fiscal-notes/`, os contratos expostos em seu barrel público (`index.ts`), os donos de estado e os pontos de extensão seguros para futuras telas dedicadas.

## API Pública (`src/features/fiscal-notes/index.ts`)

Consumidores externos devem importar exclusivamente de `@/features/fiscal-notes`:

| Categoria | Símbolos exportados | Consumidor principal atual |
| --- | --- | --- |
| **Componentes** | `FiscalNoteBadge`, `FiscalNoteSummaryCard`, `FiscalNoteItemsList`, `FiscalNoteReaderSheet`, `FiscalNoteDetailsSheet`, `FiscalNoteUnlinkDialog` | `TransactionsTable`, `TransactionDetailsSheet`, `TransactionsPage` |
| **Hooks** | `useTransactionFiscalNote`, `useUnlinkFiscalNote` | `TransactionDetailsSheet`, `FiscalNoteUnlinkDialog` / `mutations.ts` |
| **Constantes** | `FISCAL_NOTES_QUERY_KEYS` | `TransactionsPage`, `useDeleteTransaction` (`transactions`) |
| **Tipos de Domínio / API** | `FiscalNote`, `FiscalNoteDetail`, `FiscalNoteItem`, `FiscalNotePayment`, `FiscalNotePreviewDetail`, `FiscalNotePreviewItem`, `FiscalNotePreviewPayment`, `FiscalNotePreviewResponse`, `FiscalNoteImportRequest`, `FiscalNoteImportResponse` | `TransactionsPage`, `TransactionDetailsSheet` |
| **Tipos de UI** | `FiscalNoteReaderSheetProps`, `FiscalNoteReaderImportProps`, `FiscalNoteReaderLinkProps`, `FiscalNoteReaderMode`, `FiscalNoteReaderSheetState`, `FiscalNoteLinkTarget`, `FiscalNoteAccountOption`, `FiscalNoteCategoryOption`, `FiscalNoteAttachmentsFieldRenderProps`, `FiscalNoteAttachmentsFieldRenderer`, e props dos demais organismos/átomos | `TransactionsPage`, `TransactionDetailsSheet` |

## Árvore por Atomic Design

```text
Organisms (orquestração local, hooks e RHF)
├── FiscalNoteReaderSheet (Etapa 1: Câmera / Foto / Manual -> Etapa 2: Preview + Import ou Link)
│   ├── FiscalNoteQrScannerPane (organism — viewfinder WebRTC via useQrCodeScanner)
│   ├── FiscalNoteImageUploadPane (molecule — upload/dropzone + decodeQrCodeFromImageFile)
│   ├── FiscalNoteAccessKeyField (molecule — input URL/payload/chave 44d em blocos de 4)
│   ├── FiscalNoteDuplicateBanner (molecule — alerta 409/alreadyImported + Ver despesa existente)
│   ├── FiscalNoteItemsList (organism — busca acento-insensível + empty states + FiscalNoteItemRow)
│   ├── FiscalNoteTotalsCard (molecule — bruto, desconto, a pagar, tributos, troco)
│   ├── FiscalNotePaymentsList (molecule — meios de pagamento informativos)
│   ├── FiscalNoteDivergenceAlert (molecule — comparativo valor/data no modo link)
│   └── [slot renderAttachmentsField] (injetado por TransactionsPage para staging)
├── FiscalNoteSummaryCard (resumo para TransactionDetailsSheet com prévia de 3 itens)
│   ├── FiscalNoteBadge (atom)
│   └── FiscalNoteItemRow (atom)
├── FiscalNoteDetailsSheet (sheet completo da nota fiscal / lista de compras read-only)
│   ├── FiscalNoteBadge (atom)
│   ├── FiscalNoteItemsList (organism)
│   ├── FiscalNoteTotalsCard (molecule)
│   ├── FiscalNotePaymentsList (molecule)
│   └── FiscalNoteMetadataBlock (molecule — emitente, CNPJ, endereço, protocolo, chave copiável)
└── FiscalNoteUnlinkDialog (AlertDialog de confirmação de desvínculo isolado)

Atoms
├── FiscalNoteBadge (variantes 'default' | 'compact', ícone ReceiptText + label)
└── FiscalNoteItemRow (linha read-only com posição opcional, quantidade × unitário, storeCode e total .numeric)
```

### Responsabilidades por Nível

- **`atoms` (`FiscalNoteBadge`, `FiscalNoteItemRow`):** componentes puros de apresentação com tokens semânticos (`bg-app-elevated`, `border-app-border`, `text-brand`, `.numeric`). Zero chamadas de API e zero imports de moléculas/organismos.
- **`molecules` (`FiscalNoteAccessKeyField`, `FiscalNoteImageUploadPane`, `FiscalNoteDuplicateBanner`, `FiscalNoteDivergenceAlert`, `FiscalNoteTotalsCard`, `FiscalNotePaymentsList`, `FiscalNoteMetadataBlock`):** encapsulam UX específica de captura ou exibição sem depender de TanStack Query ou módulos externos. (`FiscalNoteImageUploadPane` aciona apenas `decodeQrCodeFromImageFile` localmente em memória.)
- **`organisms`:**
  - `FiscalNoteReaderSheet`: gerencia o estado multi-etapas (`capture` → `preview`), foco/reset ao abrir/fechar, formulário RHF+Zod do modo `import` (`fiscalNoteImportSchema`), countdown de retry (`useRetryCountdown`), banners de duplicata (`parseFiscalNoteAlreadyImportedDetails`) e mutations (`usePreviewFiscalNote`, `useImportFiscalNote`, `useLinkFiscalNote`).
  - `FiscalNoteQrScannerPane`: integra `useQrCodeScanner` e oferece viewfinder Danfy Dark, troca de câmera, controle de lanterna (`torch`) e fallbacks imediatos para Foto/Manual.
  - `FiscalNoteItemsList`: ordena itens por `position`, executa busca em tempo real acento-insensível por `rawDescription` ou `storeCode` e exibe estado vazio diferenciado para nota sem itens vs. busca sem resultados.
  - `FiscalNoteSummaryCard`: recorta os 3 primeiros itens (`FISCAL_NOTE_PREVIEW_ITEMS_LIMIT`), exibe total/desconto e expõe `onViewFullList` e `onUnlink`.
  - `FiscalNoteDetailsSheet`: exibe o detalhe completo da NFC-e com botão opcional `onRequestUnlink`.
  - `FiscalNoteUnlinkDialog`: executa `useUnlinkFiscalNote` com `ApiErrorAlert` inline (`fiscal-notes.unlink`) e callback `onUnlinked`.

## Donos de Estado e Dependências

- **Server state (TanStack Query):**
  - `useTransactionFiscalNote(transactionId, { enabled })` busca `GET /transactions/:id/fiscal-note` sob demanda (`staleTime: 5 min`, sem retry em `404`).
  - Mutations (`usePreviewFiscalNote`, `useImportFiscalNote`, `useLinkFiscalNote`, `useUnlinkFiscalNote`) atualizam/removem `FISCAL_NOTES_QUERY_KEYS.byTransaction(id)` e invalidam prefixos literais externos (`FISCAL_NOTES_EXTERNAL_QUERY_KEY_PREFIXES`).
- **Formulário (React Hook Form + Zod):** `FiscalNoteReaderSheet` (modo `import`) usa `fiscalNoteImportSchema`; a Etapa 1 valida entrada manual com `parseFiscalNoteInput` / `fiscalNoteInputSchema`.
- **Estado local efêmero:** `step`, `activeTab`, `manualInput`, `previewData`, `concurrentDuplicate` e `searchQuery` (em `FiscalNoteItemsList`).
- **Shared (`src/shared/`):** `ApiErrorAlert`, `CurrencyInput`, `DateOnlyPicker`, `ui/*` (`Sheet`, `AlertDialog`, `Tabs`, `Collapsible`, `Select`, `Input`, `Textarea`, `Button`), `src/shared/errors`, `useIsMobile`, `toast`, `dateOnly` e `formatters`.
- **Cross-feature:** **nenhuma** dependência de saída para `transactions`, `accounts`, `categories` ou `auth`.

## Pontos de Extensão (Futura Tela Global de Notas / Lista de Compras)

- `FiscalNoteItemsList`, `FiscalNoteSummaryCard` e `FiscalNoteDetailsSheet` operam apenas sobre objetos `FiscalNoteDetail` / `FiscalNotePreviewItem[]` e callbacks opcionais (`onRequestUnlink` em `FiscalNoteDetailsSheet` é opcional), podendo ser montados diretamente por uma futura `FiscalNotesPage` quando `GET /fiscal-notes` existir no backend.
