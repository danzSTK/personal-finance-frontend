---
area: fiscal-notes
feature: nfce-ce-reader
type: spec-tasks
status: approved
last_reviewed: 2026-11-27
related:
  - ./requirements.md
  - ./design.md
  - ./decisions.md
---

# Tasks — Leitor de NFC-e (SEFAZ-CE) e Lista de Compras

As tarefas estão ordenadas em blocos autocontidos para delegação sequencial/paralela segura aos workers (`--agent antigravity --model gemini-4-hydrogen-high`), respeitando as dependências de tipos e contratos.

## Bloco 1 — Fundação, Contratos, Erros e Validação Local

- [x] **1. Instalar `barcode-detector` e configurar resolução self-hosted do `.wasm` no Vite**
  - Adicionar `barcode-detector` ao `package.json`.
  - Criar `src/features/fiscal-notes/utils/qrBarcodeDetector.utils.ts` com `prepareZXingModule` apontando para o `.wasm` empacotado localmente e helper `decodeQrCodeFromImageFile(file)`.
  - Validar que `npm run build` empacota o `.wasm` em `dist/assets/` sem erro de TypeScript ou Vite.

- [x] **2. Registrar códigos e contextos de erro de `fiscal-notes` em `src/shared/errors/`**
  - Adicionar os 15 códigos em `src/shared/errors/apiErrorCodes.ts`.
  - Adicionar os 5 contextos `fiscal-notes.*` em `src/shared/errors/apiError.types.ts`.
  - Mapear títulos, descrições acionáveis pt-BR e `recovery` em `src/shared/errors/resolveApiError.ts` (incluindo `retryAfterSeconds` e conflitos `409`).
  - Cobrir os novos códigos em `src/shared/errors/resolveApiError.test.ts`.

- [x] **3. Criar tipos, constantes, utilitários de parsing/formatação e schemas Zod de `fiscal-notes`**
  - Criar `src/features/fiscal-notes/constants/fiscal-notes.constants.ts`.
  - Criar `src/features/fiscal-notes/types/fiscal-note.types.ts` e `fiscal-note-ui.types.ts`.
  - Criar `src/features/fiscal-notes/utils/fiscalNoteInput.utils.ts` (parse URL QR v2/v3, payload `p`, chave 44d, mod-11, modelo `65`, UF `23`, produção, formatação em blocos de 4, máscara CNPJ), `fiscalNoteFormat.utils.ts` e `fiscalNoteError.utils.ts`.
  - Criar `src/features/fiscal-notes/schemas/fiscalNoteInput.schema.ts` e `fiscalNoteImport.schema.ts`.
  - Escrever testes unitários completos (`fiscalNoteInput.utils.test.ts`, `fiscalNoteFormat.utils.test.ts`, `fiscalNoteImport.schema.test.ts`).

## Bloco 2 — Camada de API (TanStack Query) e Hooks de Scanner/Countdown

- [x] **4. Implementar cliente HTTP, queries e mutations em `src/features/fiscal-notes/api/`**
  - Criar `fiscal-notes.api.ts` (`previewFiscalNote`, `importFiscalNote`, `linkFiscalNote`, `getTransactionFiscalNote`, `unlinkTransactionFiscalNote`).
  - Criar `queries.ts` (`useTransactionFiscalNote`) e `mutations.ts` (`usePreviewFiscalNote`, `useImportFiscalNote`, `useLinkFiscalNote`, `useUnlinkFiscalNote`) com gerenciamento de cache e invalidações.

- [x] **5. Implementar hooks `useQrCodeScanner` e `useRetryCountdown` com testes unitários**
  - Criar `src/features/fiscal-notes/hooks/useQrCodeScanner.ts` (câmera traseira preferencial, loop throttled 250ms, trava single-shot, cleanup seguro em Strict Mode, troca de câmera, torch, mapeamento de erros de permissão/hardware/HTTPS).
  - Criar `src/features/fiscal-notes/hooks/useRetryCountdown.ts`.
  - Escrever testes em `useQrCodeScanner.test.ts` e `qrBarcodeDetector.utils.test.ts`.

## Bloco 3 — Componentes do Módulo `src/features/fiscal-notes/` (Atomic Design)

- [x] **6. Implementar atoms e molecules de visualização e captura da NFC-e**
  - Atoms: `FiscalNoteBadge.tsx`, `FiscalNoteItemRow.tsx`.
  - Molecules: `FiscalNoteAccessKeyField.tsx`, `FiscalNoteImageUploadPane.tsx`, `FiscalNoteDuplicateBanner.tsx`, `FiscalNoteDivergenceAlert.tsx`, `FiscalNoteTotalsCard.tsx`, `FiscalNotePaymentsList.tsx`, `FiscalNoteMetadataBlock.tsx`.

- [x] **7. Implementar organisms de visualização ("Lista de Compras") e desvínculo**
  - `FiscalNoteItemsList.tsx` (reutilizável, busca/filtro por descrição e código na loja, estado vazio de busca).
  - `FiscalNoteSummaryCard.tsx` (card resumo + prévia dos 3 primeiros itens + CTA *"Ver lista completa"* + *"Desvincular"*).
  - `FiscalNoteDetailsSheet.tsx` (sheet completo da nota fiscal / lista de compras + cópia de chave + desvínculo).
  - `FiscalNoteUnlinkDialog.tsx` (`AlertDialog` de confirmação explicando preservação da transação e liberação da chave).
  - Testes em `FiscalNoteDetailsSheet.test.tsx`.

- [x] **8. Implementar `FiscalNoteQrScannerPane`, `FiscalNoteReaderSheet` e barrel `index.ts`**
  - `FiscalNoteQrScannerPane.tsx` (viewfinder Danfy Dark, controles de câmera/lanterna e fallback imediato para foto/manual).
  - `FiscalNoteReaderSheet.tsx` (Etapa 1: abas Câmera / Foto / Manual com default mobile=Câmera e desktop=Manual → Preview → Etapa 2: modo `import` com formulário completo + slot `renderAttachmentsField`, ou modo `link` com `FiscalNoteDivergenceAlert`; banner proativo de duplicata + countdown de retry).
  - Criar `src/features/fiscal-notes/index.ts` expondo apenas a API pública.
  - Testes em `FiscalNoteReaderSheet.test.tsx`.

## Bloco 4 — Integração com `transactions` e `auth` (Quick Actions)

- [x] **9. Atualizar tipos, URLs e Quick Actions (`transactions` + `auth`)**
  - Adicionar `hasFiscalNote?: boolean` em `src/features/transactions/types/transaction.types.ts`.
  - Suportar `create=FISCAL_NOTE` em `src/features/transactions/utils/transactionUrl.utils.ts` (e atualizar testes de URL).
  - Adicionar `AUTH_QUICK_ACTION_ROUTES.fiscalNote` em `src/features/auth/constants/auth.constants.ts` e botão **"Ler NFC-e"** em `MobileQuickActions.tsx` + `AuthAppShell.tsx`.

- [x] **10. Integrar NFC-e na listagem, detalhes, formulários e exclusão de `transactions`**
  - `TransactionsTable.tsx`: renderizar `FiscalNoteBadge` e ação *"Vincular NFC-e"* no menu `...` (apenas `EXPENSE` com `!hasFiscalNote`).
  - `TransactionDetailsSheet.tsx`: seção **Nota fiscal** (`EXPENSE`) com busca lazy (`useTransactionFiscalNote`), `FiscalNoteSummaryCard`, ação *"Vincular NFC-e"*, abertura de `FiscalNoteDetailsSheet` e `FiscalNoteUnlinkDialog`.
  - `TransactionFormSheet.tsx`: atalho *"Importar via NFC-e"* na criação de `EXPENSE`; bloqueio de troca de `type` quando `mode === 'edit'` e `hasFiscalNote === true`.
  - `TransactionConfirmSheet.tsx`: garantir proteção de `type` quando `hasFiscalNote === true`.
  - `TransactionDeleteDialog.tsx`: exibir aviso de remoção sincronizada da nota e liberação da chave quando `hasFiscalNote === true`.
  - `TransactionsPage.tsx`: botão *"Ler NFC-e"* no header/menu mobile, consumo de `?create=FISCAL_NOTE`, orquestração de `FiscalNoteReaderSheet` (incluindo staging de anexos no `import` via slot e abertura de `existingTransactionId` via `GET /transactions/:id`), `FiscalNoteDetailsSheet` e `FiscalNoteUnlinkDialog`.
  - Atualizar/expandir testes em `TransactionsTable.test.tsx`, `TransactionDetailsSheet.test.tsx` e `TransactionFormSheet.test.tsx`.

## Bloco 5 — Qualidade, Documentação Viva e Validação Real no Ambiente

- [x] **11. Sincronizar documentação modular viva e `AGENTS.md`**
  - Criar `src/features/fiscal-notes/AGENTS.md` e `docs/fiscal-notes/{README.md, concepts/, flows/, decisions/, components/, reference/}`.
  - Atualizar `docs/transactions/` e `src/features/transactions/AGENTS.md`.
  - Atualizar `docs/architecture/module-boundaries.md` e `docs/README.md`.

- [x] **12. Verificação técnica automatizada (`lint`, `test`, `build`)**
  - Executar `npm run lint`, `npm test` e `npm run build` com 0 erros e 0 warnings.

- [x] **13. Validação real ponta a ponta no ambiente (Supervisor / QA)**
  - Subir/conectar frontend + backend local (com PR `#146` rodando) e testar como cliente real no browser embarcado do Orca: captura manual (chave 44d / QR), foto com QR, preview, importação com anexo em staging, duplicata (`Ver despesa existente`), lista de compras com busca, bloqueio de troca de tipo, desvínculo e vínculo em despesa existente com divergência.
  - Delegar eventuais correções aos workers e finalizar revisão da PR.

---

## Extensão — Listagem Global (`/fiscal-notes`) e Detalhe Direto (`GET /fiscal-notes/:id`)

### Bloco A — Spec SDD + Fundação de Listagem e Detalhe Direto
- [x] **A1. Atualizar a Spec SDD (`requirements.md`, `design.md`, `decisions.md`, `tasks.md`)**
  - Incorporar requisitos, contratos HTTP (`GET /fiscal-notes` e `GET /fiscal-notes/:id`), query keys, invalidações, erro `'fiscal-notes.list'`, compositor fino em `src/app/` e deep-link `?openTransaction=<id>`.
- [x] **A2. Registrar contexto `'fiscal-notes.list'` em `src/shared/errors/`**
  - Adicionar `'fiscal-notes.list'` em `apiError.types.ts`, mapear fallback `loadFailure('as notas fiscais')` e override de `FISCAL_NOTE_INVALID_INPUT` para filtros inválidos em `resolveApiError.ts`, com testes em `resolveApiError.test.ts`.
- [x] **A3. Adicionar constantes, tipos e utilitários de URL/filtros de listagem**
  - Atualizar `fiscal-notes.constants.ts` e `fiscal-note.types.ts` com contrato de listagem/sumário/ordenação/detalhe direto.
  - Criar `fiscalNoteListUrl.utils.ts` (parse, build, query params, contador de filtros ativos e máscara/normalização de CNPJ) e `fiscalNoteListUrl.utils.test.ts`.
- [x] **A4. Implementar camada HTTP, queries, invalidações e barrel público**
  - Adicionar `listFiscalNotes` e `getFiscalNoteById` em `fiscal-notes.api.ts`.
  - Adicionar `useFiscalNotesList` (`keepPreviousData`) e `useFiscalNoteById` (sem retry em `404`) em `queries.ts`.
  - Atualizar `useImportFiscalNote`, `useLinkFiscalNote`, `useUnlinkFiscalNote` e `useDeleteTransaction` (em `transactions/api/mutations.ts`) para manter `lists()` e `details()` consistentes, exportar no `index.ts` e cobrir com testes.

### Bloco B — Componentes de UI e Página `/fiscal-notes`
- [ ] **B1. Adaptar `FiscalNoteDetailsSheet` para detalhe direto lazy (`GET /fiscal-notes/:id`) e deep-link**
  - Suportar carregamento por `fiscalNoteId` (loading/skeleton, `ApiErrorAlert` com retry) além do objeto já carregado, e ação **Ver despesa vinculada** + **Desvincular**.
- [ ] **B2. Criar componentes Atomic Design da listagem de notas fiscais**
  - KPIs do recorte (`summary`), barra de busca (`120` chars, debounce ~350 ms) + ordenação (6 opções), drawer de filtros (`issuedFrom`/`issuedTo` + presets, faixa de valor, `issuerCnpj` mascarado, `sourceUf`, validação local), chips removíveis, tabela desktop + cards mobile com `itemsCount`, paginação (`10/20/50`) e estados (skeleton, empty sem filtros, empty com filtros, erro com retry).
- [ ] **B3. Criar `FiscalNotesPage` em `src/features/fiscal-notes/` (sem imports cross-feature)**
  - Orquestrar URL state, listagem, abertura do `FiscalNoteDetailsSheet`, `FiscalNoteUnlinkDialog` e slot/callback para **Ler NFC-e** inline e **Ver despesa vinculada**.
  - Cobrir componentes e fluxos críticos com testes Vitest + Testing Library.

### Bloco C — Navegação, Compositor Fino (`src/app/`) e Deep-Link em `TransactionsPage`
- [ ] **C1. Atualizar navegação em `AuthAppShell` e `AUTH_ROUTES`**
  - Adicionar item `Notas fiscais` (`NFC-e e compras`) abaixo de *Transações* na sidebar desktop e no topo do sheet *Mais* no mobile (mantendo 5 slots na barra inferior).
- [ ] **C2. Criar compositor fino em `src/app/` e registrar rota `/fiscal-notes`**
  - Conectar `FiscalNotesPage` ao `FiscalNoteReaderSheet` inline com contas, categorias, staging de anexos e abertura da despesa existente sem criar ciclos entre features.
- [ ] **C3. Suportar `?openTransaction=<id>` em `TransactionsPage`**
  - Ler `openTransaction` da URL, buscar via `GET /transactions/:id`, abrir `TransactionDetailsSheet` e limpar o query param via `{ replace: true }`.

### Bloco D — Documentação Viva e QA Final
- [ ] **D1. Sincronizar `docs/fiscal-notes/`, `docs/transactions/`, `docs/architecture/module-boundaries.md`, `docs/README.md` e `AGENTS.md` locais**
- [ ] **D2. Verificação final automatizada (`lint`, `test`, `build`) e validação ponta a ponta no ambiente**
