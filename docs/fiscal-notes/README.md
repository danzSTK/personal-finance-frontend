---
area: fiscal-notes
type: index
status: current
last_reviewed: 2026-11-27
related:
  - ../README.md
  - ../architecture/module-boundaries.md
  - ../transactions/README.md
  - ./concepts/nfce-ce-and-shopping-list.md
  - ./flows/import-link-and-unlink.md
  - ./flows/list-filter-and-inspect.md
  - ./decisions/adr-qr-scanner-and-module-boundaries.md
  - ./components/surfaces-and-api.md
  - ./reference/api-and-error-codes.md
---

# Módulo `fiscal-notes`

O módulo `fiscal-notes` implementa a leitura de **Nota Fiscal de Consumidor Eletrônica (NFC-e)** da **SEFAZ-CE (`UF = 23`, modelo `65`, produção)** por câmera ao vivo, foto/print da galeria ou entrada manual (URL do QR Code, payload `p` ou chave de 44 dígitos), a página dedicada `/fiscal-notes` (`FiscalNotesPage` — listagem paginada, busca por loja/item, filtros combináveis em URL, ordenação, KPIs do recorte e inspeção lazy via `GET /fiscal-notes/:id`), além da exibição da **lista de compras** detalhada e dos fluxos de importação, vínculo e desvínculo em despesas (`EXPENSE`).

Todo o código proprietário reside em `src/features/fiscal-notes/`, com instruções operacionais locais em `src/features/fiscal-notes/AGENTS.md`. O módulo mantém fronteira acíclica estrita: **não** importa de `transactions`, `accounts`, `categories` ou `auth`, expondo sua API pública exclusivamente via `src/features/fiscal-notes/index.ts`.

## Mapa da Documentação

### Conceitos (`concepts/`)
- [NFC-e SEFAZ-CE e Lista de Compras](./concepts/nfce-ce-and-shopping-list.md) — Anatomia da chave 44d, QR v2/v3, relação 1:1 com `EXPENSE`, modelo leve de listagem (`fiscal_note.summary`) vs. detalhe completo (`fiscal_note.item`), precisão decimal/monetária e `DateOnly` vs. `Instant`.

### Fluxos (`flows/`)
- [Importação, Vínculo, Consulta e Desvínculo de NFC-e](./flows/import-link-and-unlink.md) — Captura em 3 modos, validação local fail-fast, preview, tratamento de duplicata, importação atômica com anexos em staging, vínculo com alerta de divergência e desvínculo isolado.
- [Listagem, Busca, Filtros em URL e Inspeção Direta (`/fiscal-notes`)](./flows/list-filter-and-inspect.md) — Rota dedicada `/fiscal-notes`, busca por loja/item, filtros combináveis e presets de data na URL, ordenação, KPIs, detalhe lazy (`GET /fiscal-notes/:id`), leitor inline e deep-link `?openTransaction=<id>`.

### Decisões (`decisions/`)
- [DEC-FN-001 — Scanner WASM self-hosted, fronteira acíclica, compositor fino e superfícies em Sheet](./decisions/adr-qr-scanner-and-module-boundaries.md) — Escolha de `barcode-detector/ponyfill` self-hosted, desacoplamento via slots/callbacks, compositor fino `src/app/pages/FiscalNotesRoutePage.tsx`, rota dedicada `/fiscal-notes` e separação entre resumo e sheet dedicado da lista de compras.

### Componentes (`components/`)
- [Superfícies, Atomic Design e API Pública](./components/surfaces-and-api.md) — Contratos exportados por `src/features/fiscal-notes/index.ts`, árvore Atomic Design (incluindo `FiscalNotesPage` e componentes da listagem), ownership de estado e pontos de extensão.

### Referência (`reference/`)
- [Endpoints, Query Keys, Schemas e Códigos de Erro](./reference/api-and-error-codes.md) — Os 7 endpoints consumidos (incluindo `GET /fiscal-notes` e `GET /fiscal-notes/:id`), rota `/fiscal-notes`, `FISCAL_NOTES_QUERY_KEYS`, prefixos de invalidação cross-module, schemas Zod, os 15 códigos de erro, 6 contextos `fiscal-notes.*` e escopo/limites atuais.

## Fronteiras e Dependências

- **Código proprietário:** `src/features/fiscal-notes/`
- **API pública (`src/features/fiscal-notes/index.ts`):** `FiscalNotesPage`, `FiscalNoteBadge`, `FiscalNoteDetailsSheet`, `FiscalNoteItemsList`, `FiscalNoteReaderSheet`, `FiscalNoteSummaryCard`, `FiscalNoteUnlinkDialog`, `listFiscalNotes`, `getFiscalNoteById`, `useFiscalNotesList`, `useFiscalNoteById`, `useTransactionFiscalNote`, `useUnlinkFiscalNote`, utilitários de URL/CNPJ (`fiscalNoteListUrl.utils`), constantes `FISCAL_NOTES_QUERY_KEYS` / `FISCAL_NOTE_LIST_*` / `FISCAL_NOTE_SUPPORTED_UF_OPTIONS` e tipos públicos (`FiscalNote*`).
- **Dependências de entrada:** apenas `src/shared/` (`api`, componentes `ui/*`, `ApiErrorAlert`, `CurrencyInput`, `DateOnlyPicker`, `src/shared/errors`, `src/shared/utils/*`) e o pacote `barcode-detector` (com `zxing-wasm` empacotado localmente). **Zero** imports de outras features.
- **Consumidores cross-feature e de rota:**
  - `src/app/pages/FiscalNotesRoutePage.tsx`: compositor fino da rota `/fiscal-notes` que conecta `FiscalNotesPage` e `FiscalNoteReaderSheet` ao `AuthAppShell` (`auth`), contas (`accounts`), categorias (`categories`), staging/anexos (`transactions`) e deep-link `/transactions?openTransaction=<id>`.
  - `src/features/transactions/`: consome a API pública via `@/features/fiscal-notes` (`TransactionsPage`, `TransactionDetailsSheet`, `TransactionsTable`, `mutations.ts`).
  - `src/features/auth/`: navega para `/fiscal-notes` via `AUTH_ROUTES.fiscalNotes` (sidebar desktop e sheet `Mais` mobile) e para o leitor rápido via `AUTH_QUICK_ACTION_ROUTES.fiscalNote = '/transactions?view=EXPENSE&create=FISCAL_NOTE'`.

## Estado Atual de Implementação

### Implementado e Documentado
- [x] Rota dedicada `/fiscal-notes` (`FiscalNotesPage` + `FiscalNotesRoutePage`) com listagem paginada (`GET /fiscal-notes`), KPIs do recorte (`fiscal_note.summary_totals`), busca por loja ou item com debounce, ordenação em 6 critérios, drawer de filtros (`issuedFrom`/`issuedTo` com presets de data, faixa de valor, CNPJ mascarado, UF) sincronizados na URL, chips removíveis e detalhe sob demanda (`GET /fiscal-notes/:id`).
- [x] Deep-link `/transactions?openTransaction=<id>` a partir da tabela, cards mobile, `FiscalNoteDetailsSheet` e banner de duplicata no leitor inline em `/fiscal-notes`.
- [x] Captura de NFC-e em 3 abas (`Câmera`, `Foto`, `Manual`) com seleção inicial responsiva (`Câmera` em mobile/touch; `Manual` em desktop).
- [x] Decodificação local de QR Code via `barcode-detector/ponyfill` com `zxing_reader.wasm` self-hosted no bundle Vite (câmera ao vivo com troca de câmera/lanterna/fallback + upload de imagem até 10 MB).
- [x] Validação local fail-fast (tamanho `<= 1024`, URL/payload `p`/chave 44d, QR v2 normal/contingência e v3, modelo `65`, dígito verificador mod-11, produção `'1'`, UF `'23'`).
- [x] Preview (`POST /fiscal-notes/preview`), detecção proativa e concorrente de duplicata (`alreadyImported` / `409 FISCAL_NOTE_ALREADY_IMPORTED`) com navegação direta via `onOpenExistingTransaction`.
- [x] Importação atômica (`POST /fiscal-notes/import`) com pré-preenchimento editável de `suggestedTransaction`, slot de comprovantes em staging e pós-upload resiliente.
- [x] Vínculo em `EXPENSE` existente (`POST /transactions/:id/fiscal-note`) com `FiscalNoteDivergenceAlert` comparativo sem mutar a transação.
- [x] Consulta lazy (`GET /transactions/:id/fiscal-note` e `GET /fiscal-notes/:id`), card resumo (`FiscalNoteSummaryCard`), lista completa com busca em tempo real (`FiscalNoteDetailsSheet` + `FiscalNoteItemsList`) e desvínculo isolado (`FiscalNoteUnlinkDialog` + `DELETE /transactions/:id/fiscal-note`).
- [x] Cobertura dos 15 códigos de erro e 6 contextos `fiscal-notes.*` (incluindo `'fiscal-notes.list'`) em `src/shared/errors/`, incluindo countdown para `429`/`503` (`retryAfterSeconds`).

### Gaps Conhecidos / Fora de Escopo (V1)
- [ ] Apenas NFC-e modelo `65` emitidas no Ceará (`UF = 23`) em ambiente de produção são aceitas nesta versão.
- [ ] Itens, cabeçalho e pagamentos da nota são estritamente somente leitura, e notas fiscais permanecem sempre vinculadas 1:1 a uma despesa (`EXPENSE`) ativa (sem listas de compras independentes de transação).
