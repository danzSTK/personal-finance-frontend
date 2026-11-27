---
area: fiscal-notes
type: component
status: current
last_reviewed: 2026-11-27
related:
  - ../README.md
  - ../flows/import-link-and-unlink.md
  - ../flows/list-filter-and-inspect.md
  - ../decisions/adr-qr-scanner-and-module-boundaries.md
  - ../../transactions/components/transaction-screen-components.md
---

# Superfícies, Atomic Design e API Pública — `fiscal-notes`

Este documento descreve a árvore Atomic Design do módulo `src/features/fiscal-notes/`, os contratos expostos em seu barrel público (`index.ts`), os donos de estado e os pontos de extensão usados pela rota dedicada `/fiscal-notes` e por `/transactions`.

## API Pública (`src/features/fiscal-notes/index.ts`)

Consumidores externos devem importar exclusivamente de `@/features/fiscal-notes`:

| Categoria | Símbolos exportados | Consumidor principal atual |
| --- | --- | --- |
| **Página e Componentes** | `FiscalNotesPage`, `FiscalNoteBadge`, `FiscalNoteSummaryCard`, `FiscalNoteItemsList`, `FiscalNoteReaderSheet`, `FiscalNoteDetailsSheet`, `FiscalNoteUnlinkDialog` | `FiscalNotesRoutePage`, `TransactionsTable`, `TransactionDetailsSheet`, `TransactionsPage` |
| **API HTTP & Hooks** | `listFiscalNotes`, `getFiscalNoteById`, `useFiscalNotesList`, `useFiscalNoteById`, `useTransactionFiscalNote`, `useUnlinkFiscalNote` | `FiscalNotesPage`, `TransactionDetailsSheet`, `FiscalNoteUnlinkDialog`, `mutations.ts` (`transactions`) |
| **Utilitários de URL & CNPJ** | `parseFiscalNoteListUrlState`, `buildFiscalNoteListSearchParams`, `toFiscalNoteListQueryParams`, `countActiveFiscalNoteFilters`, `formatCnpjMask`, `normalizeCnpjDigits` | `FiscalNotesPage`, testes e eventuais construtores de deep-link |
| **Constantes** | `FISCAL_NOTES_QUERY_KEYS`, `FISCAL_NOTE_LIST_DEFAULT_PAGE`, `FISCAL_NOTE_LIST_DEFAULT_LIMIT`, `FISCAL_NOTE_LIST_DEFAULT_SORT`, `FISCAL_NOTE_LIST_MAX_LIMIT`, `FISCAL_NOTE_LIST_PAGE_SIZE_OPTIONS`, `FISCAL_NOTE_LIST_SEARCH_MAX_LENGTH`, `FISCAL_NOTE_LIST_SORTS`, `FISCAL_NOTE_LIST_SORT_OPTIONS`, `FISCAL_NOTE_SUPPORTED_UF_OPTIONS` | `FiscalNotesPage`, `TransactionsPage`, `useDeleteTransaction` (`transactions`) |
| **Tipos de Domínio / API** | `FiscalNote`, `FiscalNoteDetail`, `FiscalNoteSummaryItem`, `FiscalNoteListMeta`, `FiscalNoteListSummaryTotals`, `FiscalNoteListResponse`, `FiscalNoteListQueryParams`, `FiscalNoteListSort`, `FiscalNoteItem`, `FiscalNotePayment`, `FiscalNotePreviewDetail`, `FiscalNotePreviewItem`, `FiscalNotePreviewPayment`, `FiscalNotePreviewResponse`, `FiscalNoteImportRequest`, `FiscalNoteImportResponse` | `FiscalNotesPage`, `FiscalNotesRoutePage`, `TransactionsPage`, `TransactionDetailsSheet` |
| **Tipos de UI & URL** | `FiscalNotesPageProps`, `FiscalNoteListUrlState`, `FiscalNoteListUrlPatch`, `FiscalNoteReaderSheetProps`, `FiscalNoteReaderImportProps`, `FiscalNoteReaderLinkProps`, `FiscalNoteReaderMode`, `FiscalNoteReaderSheetState`, `FiscalNoteLinkTarget`, `FiscalNoteAccountOption`, `FiscalNoteCategoryOption`, `FiscalNoteSelectFieldRenderProps`, `FiscalNoteSelectFieldRenderer`, `FiscalNoteAttachmentsFieldRenderProps`, `FiscalNoteAttachmentsFieldRenderer`, e props dos demais organismos/átomos | `FiscalNotesRoutePage`, `TransactionsPage`, `TransactionDetailsSheet` |

## Árvore por Atomic Design

```text
Pages (orquestração de URL, queries e sheets do domínio — sem imports cross-feature)
└── FiscalNotesPage (/fiscal-notes — busca, ordenação, filtros URL, KPIs, listagem, detalhe e desvínculo)
    ├── [callback onImportFiscalNote] -> delegado ao compositor FiscalNotesRoutePage (src/app/pages/)
    ├── [callback onOpenTransaction] -> navega para /transactions?openTransaction=<id>
    ├── FiscalNotesActiveFiltersBar (molecule — chips removíveis + limpar filtros)
    ├── FiscalNotesSkeleton (molecule — 4 KPIs + 5 linhas placeholder)
    ├── ApiErrorAlert (shared — contexto 'fiscal-notes.list' + retry)
    ├── FiscalNotesKpiGrid (molecule — 4 cards do recorte: Total pago, Notas fiscais, Descontos, Tributos aprox.)
    ├── FiscalNotesEmptyState (molecule — diferenciado entre conta sem notas e busca/filtros sem resultado)
    ├── FiscalNotesTable (organism — tabela desktop md+ e cards mobile <md com itemsCount e menu ...)
    ├── FiscalNotesPagination (molecule — resumo de página/total, seletor 10/20/50, Anterior/Próxima)
    ├── FiscalNotesFiltersSheet (organism — presets de data, DateOnlyPicker, faixa de valor CurrencyInput, CNPJ mascarado, UF)
    ├── FiscalNoteDetailsSheet (organism — lazy via detailQuery: loading/skeleton, erro/retry, itens, totais, pagamentos, metadados, Ver despesa e Desvincular)
    └── FiscalNoteUnlinkDialog (organism — AlertDialog de confirmação de desvínculo isolado)

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
│   ├── [slots renderAccountField / renderCategoryField] (opcionais; fallback para <Select> padrão)
│   └── [slot renderAttachmentsField] (injetado por TransactionsPage e FiscalNotesRoutePage para staging)
├── FiscalNoteSummaryCard (resumo para TransactionDetailsSheet com prévia de 3 itens)
│   ├── FiscalNoteBadge (atom)
│   └── FiscalNoteItemRow (atom)
├── FiscalNoteDetailsSheet (sheet completo da nota fiscal / lista de compras read-only)
│   ├── [estado loading] (Skeleton quando isLoading && !fiscalNote)
│   ├── [estado error] (ApiErrorAlert 'fiscal-notes.get' + onRetry quando !isLoading && !fiscalNote && error)
│   ├── FiscalNoteBadge (atom)
│   ├── FiscalNoteItemsList (organism)
│   ├── FiscalNoteTotalsCard (molecule)
│   ├── FiscalNotePaymentsList (molecule)
│   ├── FiscalNoteMetadataBlock (molecule — emitente, CNPJ, endereço, protocolo, chave copiável)
│   └── [rodapé opcional] (onRequestUnlink + onViewTransaction + Fechar)
├── FiscalNotesTable (listagem responsiva desktop/mobile com menu contextual Ver lista / Ver despesa vinculada / Desvincular)
├── FiscalNotesFiltersSheet (drawer responsivo de filtros avançados com validação local)
└── FiscalNoteUnlinkDialog (AlertDialog de confirmação de desvínculo isolado)

Molecules (sem TanStack Query ou imports externos)
├── FiscalNotesKpiGrid (4 cards com .numeric e tokens semânticos)
├── FiscalNotesActiveFiltersBar (chips removíveis para período, faixa de valor, CNPJ e UF)
├── FiscalNotesPagination (barra de paginação com seletor 10/20/50)
├── FiscalNotesEmptyState (estado vazio com/sem filtros)
├── FiscalNotesSkeleton (skeleton estável da listagem)
├── FiscalNoteAccessKeyField (input URL/payload/chave 44d)
├── FiscalNoteImageUploadPane (upload/dropzone + decodeQrCodeFromImageFile)
├── FiscalNoteDuplicateBanner (banner de duplicata + CTA Ver despesa existente)
├── FiscalNoteDivergenceAlert (comparativo de valor/data no vínculo)
├── FiscalNoteTotalsCard (bruto, desconto, a pagar, tributos, troco)
├── FiscalNotePaymentsList (meios de pagamento)
└── FiscalNoteMetadataBlock (emitente, CNPJ, endereço, protocolo, chave copiável)

Atoms
├── FiscalNoteBadge (variantes 'default' | 'compact', ícone ReceiptText + label)
└── FiscalNoteItemRow (linha read-only com posição opcional, quantidade × unitário, storeCode e total .numeric)
```

### Responsabilidades por Nível

- **`atoms` (`FiscalNoteBadge`, `FiscalNoteItemRow`):** componentes puros de apresentação com tokens semânticos (`bg-app-elevated`, `border-app-border`, `text-brand`, `.numeric`). Zero chamadas de API e zero imports de moléculas/organismos.
- **`molecules`:** encapsulam UX específica de captura, exibição de nota ou peças visuais da listagem sem depender de TanStack Query ou módulos externos. (`FiscalNoteImageUploadPane` aciona apenas `decodeQrCodeFromImageFile` localmente em memória.)
- **`organisms`:**
  - `FiscalNoteReaderSheet`: gerencia o estado multi-etapas (`capture` → `preview`), foco/reset ao abrir/fechar, formulário RHF+Zod do modo `import` (`fiscalNoteImportSchema`), countdown de retry (`useRetryCountdown`), banners de duplicata (`parseFiscalNoteAlreadyImportedDetails`) e mutations (`usePreviewFiscalNote`, `useImportFiscalNote`, `useLinkFiscalNote`).
  - `FiscalNoteQrScannerPane`: integra `useQrCodeScanner` e oferece viewfinder Danfy Dark, troca de câmera, controle de lanterna (`torch`) e fallbacks imediatos para Foto/Manual.
  - `FiscalNoteItemsList`: ordena itens por `position`, executa busca em tempo real acento-insensível por `rawDescription` ou `storeCode` e exibe estado vazio diferenciado para nota sem itens vs. busca sem resultados.
  - `FiscalNoteSummaryCard`: recorta os 3 primeiros itens (`FISCAL_NOTE_PREVIEW_ITEMS_LIMIT`), exibe total/desconto e expõe `onViewFullList` e `onUnlink`.
  - `FiscalNoteDetailsSheet`: suporta tanto objeto `fiscalNote` já carregado quanto estado assíncrono (`isLoading`, `error`, `onRetry`) para consulta lazy via `useFiscalNoteById`, além das ações opcionais `onViewTransaction` (*"Ver despesa"*) e `onRequestUnlink` (*"Desvincular NFC-e"*).
  - `FiscalNotesFiltersSheet`: gerencia rascunho local de filtros, presets de data em `DateOnly` civil, máscara de CNPJ e validação local (`issuedFrom <= issuedTo`, `minAmountCents <= maxAmountCents`, CNPJ com 14 dígitos quando informado) antes de chamar `onApply`.
  - `FiscalNotesTable`: alterna tabela desktop (`md+`) e cards mobile (`< md`), exibe `itemsCount`, desconto e total pago, e expõe ações *Ver lista de compras*, *Ver despesa vinculada* e *Desvincular NFC-e*.
  - `FiscalNoteUnlinkDialog`: executa `useUnlinkFiscalNote` com `ApiErrorAlert` inline (`fiscal-notes.unlink`) e callback `onUnlinked`.
- **`pages` (`FiscalNotesPage`):** orquestra o estado da URL (`fiscalNoteListUrl.utils.ts`), debounce de busca (`350 ms`), queries `useFiscalNotesList` e `useFiscalNoteById`, abertura de `FiscalNoteDetailsSheet` / `FiscalNotesFiltersSheet` / `FiscalNoteUnlinkDialog` e delegação de importação/navegação por callbacks opcionais (`onImportFiscalNote`, `onOpenTransaction`), sem imports cross-feature.

## Donos de Estado e Dependências

- **URL (`useSearchParams` + `fiscalNoteListUrl.utils.ts`):** fonte de verdade para `q`, `issuedFrom`, `issuedTo`, `issuerCnpj`, `sourceUf`, `minAmountCents`, `maxAmountCents`, `sort`, `page` e `limit` em `/fiscal-notes`.
- **Server state (TanStack Query):**
  - `useFiscalNotesList(params, { enabled })` busca `GET /fiscal-notes` (`staleTime: 30 s`, `placeholderData: keepPreviousData`, `retry < 2`).
  - `useFiscalNoteById(fiscalNoteId, { enabled })` busca `GET /fiscal-notes/:id` sob demanda (`staleTime: 5 min`, sem retry em `404`).
  - `useTransactionFiscalNote(transactionId, { enabled })` busca `GET /transactions/:id/fiscal-note` sob demanda (`staleTime: 5 min`, sem retry em `404`).
  - Mutations (`usePreviewFiscalNote`, `useImportFiscalNote`, `useLinkFiscalNote`, `useUnlinkFiscalNote`) sincronizam `byTransaction(id)` e `detail(id)`, invalidam `lists()`/`details()` e invalidam prefixos literais externos (`FISCAL_NOTES_EXTERNAL_QUERY_KEY_PREFIXES`).
- **Formulário (React Hook Form + Zod):** `FiscalNoteReaderSheet` (modo `import`) usa `fiscalNoteImportSchema`; a Etapa 1 valida entrada manual com `parseFiscalNoteInput` / `fiscalNoteInputSchema`.
- **Estado local efêmero:** `searchDraft`, `filtersSheetOpen`, `selectedNoteSummary`, `unlinkTarget` (em `FiscalNotesPage`); `step`, `activeTab`, `manualInput`, `previewData`, `concurrentDuplicate` e `searchQuery` (em `FiscalNoteReaderSheet` / `FiscalNoteItemsList`).
- **Shared (`src/shared/`):** `ApiErrorAlert`, `CurrencyInput`, `DateOnlyPicker`, `ui/*` (`Sheet`, `AlertDialog`, `Tabs`, `Collapsible`, `Select`, `Input`, `Textarea`, `Button`, `Table`, `DropdownMenu`, `Badge`, `Skeleton`), `src/shared/errors`, `useIsMobile`, `toast`, `dateOnly` e `formatters`.
- **Cross-feature:** **nenhuma** dependência de saída para `transactions`, `accounts`, `categories` ou `auth`.

## Composição de Rota (`src/app/pages/FiscalNotesRoutePage.tsx`)

- `FiscalNotesRoutePage` atua como compositor fino na camada `src/app/` para a rota privada `/fiscal-notes`:
  - envolve `FiscalNotesPage` em `AuthAppShell` (`activeSection="fiscal-notes"`);
  - injeta `FiscalNoteReaderSheet` (`mode="import"`) alimentado com contas ativas (`useAccounts`), categorias de despesa (`useCategories`), seletores (`TransactionAccountSelect`, `TransactionCategorySelect`) e anexos em staging (`TransactionStagedAttachmentsField` + `uploadTransactionAttachments` via `onAfterImport`);
  - traduz `onOpenTransaction` e `onOpenExistingTransaction` em navegação para `/transactions?openTransaction=<id>`.
