# Módulo `fiscal-notes` — Instruções Locais

Este módulo gerencia o leitor de NFC-e (SEFAZ-CE), a página dedicada `/fiscal-notes` (listagem paginada, busca por loja/item, filtros em URL, ordenação e KPIs) e a visualização da lista de compras vinculada a despesas (`EXPENSE`).

## Documentação Obrigatória

Antes de planejar, editar ou revisar código neste módulo, leia:
- `docs/fiscal-notes/README.md` — Índice geral, cobertura e mapa de leitura do módulo.
- `docs/fiscal-notes/concepts/nfce-ce-and-shopping-list.md` — Domínio NFC-e SEFAZ-CE, chave de 44 dígitos, QR v2/v3, modelo leve (`fiscal_note.summary`) vs. detalhe (`fiscal_note.item`) e relação 1:1 com `EXPENSE`.
- `docs/fiscal-notes/flows/import-link-and-unlink.md` — Captura (câmera/foto/manual), preview, duplicata, importação com staging, vínculo com divergência e desvínculo.
- `docs/fiscal-notes/flows/list-filter-and-inspect.md` — Rota `/fiscal-notes`, busca/filtros em URL, presets de data, detalhe lazy (`GET /fiscal-notes/:id`), leitor inline e deep-link `?openTransaction=<id>`.
- `docs/fiscal-notes/decisions/adr-qr-scanner-and-module-boundaries.md` — Decisões vigentes (`barcode-detector` WASM self-hosted, fronteira acíclica, compositor fino `FiscalNotesRoutePage` e superfícies).
- `docs/fiscal-notes/components/surfaces-and-api.md` — API pública (`index.ts`), Atomic Design (`FiscalNotesPage` e componentes de listagem/leitor), donos de estado e slots de extensão.
- `docs/fiscal-notes/reference/api-and-error-codes.md` — 7 endpoints, rota `/fiscal-notes`, query keys (`lists`, `list`, `details`, `detail`, `byTransaction`), schemas e 15 códigos de erro em 6 contextos `fiscal-notes.*`.
- `docs/architecture/module-boundaries.md` — Limites entre módulos, compositor em `src/app/` e regra acíclica.

## Regras de Fronteira e Invariantes

- **Fronteira acíclica estrita (`app -> fiscal-notes` e `transactions -> fiscal-notes`, nunca o inverso):** `src/features/fiscal-notes/` **não** pode importar de `transactions`, `accounts`, `categories` ou `auth`. Consumidores externos devem importar exclusivamente via `@/features/fiscal-notes` (`src/features/fiscal-notes/index.ts`).
- **Compositor fino de rota (`src/app/pages/FiscalNotesRoutePage.tsx`):** `FiscalNotesPage` reside em `src/features/fiscal-notes/components/pages/FiscalNotesPage.tsx` sem imports cross-feature e recebe apenas callbacks opcionais (`onImportFiscalNote`, `onOpenTransaction`). A conexão com `AuthAppShell`, `FiscalNoteReaderSheet`, contas, categorias, staging de anexos e navegação para `/transactions?openTransaction=<id>` pertence exclusivamente a `FiscalNotesRoutePage`.
- **Extensibilidade sem acoplamento:**
  - Contas (`FiscalNoteAccountOption[]`) e categorias (`FiscalNoteCategoryOption[]`) chegam via props no modo `import`, que também aceita os slots opcionais `renderAccountField` e `renderCategoryField` (`FiscalNoteSelectFieldRenderer`) para seletores customizados com identidade visual injetados pelo consumidor (mantendo `<Select>` fallback para uso isolado).
  - Comprovantes/anexos em staging no fluxo de importação usam o slot `renderAttachmentsField` e o callback `onAfterImport` injetados por `TransactionsPage` ou `FiscalNotesRoutePage`.
  - Navegação para despesa existente/vinculada usa callbacks (`onOpenExistingTransaction` / `onOpenTransaction` / `onViewTransaction`).
  - Invalidação cross-module em `api/mutations.ts` usa exclusivamente prefixos literais definidos em `FISCAL_NOTES_EXTERNAL_QUERY_KEY_PREFIXES` (`['transactions']`, `['transactions', 'detail', transactionId]`, `['accounts']`, `['dashboard']`), mantendo também `FISCAL_NOTES_QUERY_KEYS.lists()`, `details()` e `detail(id)` sincronizados.
- **Listagem `/fiscal-notes` e estado em URL (`utils/fiscalNoteListUrl.utils.ts`):**
  - Todo o histórico por padrão (`issuedFrom` e `issuedTo` iniciam `null`); presets de data no `FiscalNotesFiltersSheet` calculam `DateOnly` civil sem deriva de fuso/DST.
  - `parseFiscalNoteListUrlState` descarta intervalos invertidos (`issuedFrom > issuedTo` ou `minAmountCents > maxAmountCents`), exige 14 dígitos para `issuerCnpj`, valida `sourceUf` (2 dígitos), aplica allowlist em `sort` (`FISCAL_NOTE_LIST_SORTS`) e normaliza `page`/`limit` (`10/20/50` na UI, teto `100`).
  - `buildFiscalNoteListSearchParams` omite defaults (`page=1`, `limit=20`, `sort='issuedAt:desc'`) e preserva `0` em limites de valor.
- **WASM self-hosted e ciclo de vida de câmera:** decodificação QR usa `barcode-detector/ponyfill` com `zxing-wasm/reader/zxing_reader.wasm?url` em `utils/qrBarcodeDetector.utils.ts` (zero dependência de CDN externa). `useQrCodeScanner` prioriza câmera traseira, aplica throttle de `250 ms` via `requestAnimationFrame`, trava após a 1ª leitura (`single-shot lock`) e encerra todas as `MediaStreamTrack`s na desmontagem (seguro para React 19 Strict Mode). Upload de foto aceita PNG/JPEG/WebP até `10 MB`.
- **Validação local fail-fast:** `parseFiscalNoteInput` / `fiscalNoteInputSchema` validam antes de qualquer request HTTP: comprimento `<= 1024`, chave de 44 dígitos, modelo `65` (rejeita `55`), dígito verificador módulo 11, ambiente de produção `'1'` (rejeita homologação `'2'`) e UF `'23'` (Ceará).
- **Invariantes de domínio e precisão:**
  - Relação ativa **1:1 exclusiva para `EXPENSE`**; cabeçalho, itens e pagamentos são sempre **somente leitura**.
  - `POST /fiscal-notes/import` e `POST /transactions/:id/fiscal-note` enviam apenas `{ input }` (nunca itens ou totais calculados no cliente).
  - Valores monetários em centavos inteiros seguros e quantidades/preços unitários (`quantity` e `unitPrice` com até 4 casas decimais pt-BR) devem usar `.numeric`; `changeAmountCents === null` deve ser omitido.
  - No `import`, `amountCents` efetivo deve ser inteiro positivo (`>= 1`, exigindo ajuste manual se a nota retornar `payableAmountCents === 0`).
  - `issuedDate`, `suggestedTransaction.date`, `issuedFrom` e `issuedTo` são `DateOnly` (`YYYY-MM-DD`) via `src/shared/utils/dateOnly.ts`; `issuedAt`, `createdAt` e `updatedAt` são `Instant` UTC convertidos apenas na exibição.
- **Desvínculo, erros e retry:** `DELETE /transactions/:id/fiscal-note` preserva a despesa e os saldos e libera a chave de acesso. Todos os 15 códigos de erro e 6 contextos `fiscal-notes.*` (incluindo `'fiscal-notes.list'` com override para `FISCAL_NOTE_INVALID_INPUT`) residem em `src/shared/errors/`; `useRetryCountdown` controla cooldown de `429`/`503` via `retryAfterSeconds`, e `parseFiscalNoteAlreadyImportedDetails` alimenta `FiscalNoteDuplicateBanner`. `useFiscalNoteById` e `useTransactionFiscalNote` não fazem retry em `404` / `FISCAL_NOTE_NOT_FOUND`.
- **Sincronização documental:** qualquer mudança em endpoints, regras de captura, filtros de listagem, contratos de erro ou API pública exige atualização conjunta de `docs/fiscal-notes/` e deste `AGENTS.md`.
