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

- [ ] **1. Instalar `barcode-detector` e configurar resolução self-hosted do `.wasm` no Vite**
  - Adicionar `barcode-detector` ao `package.json`.
  - Criar `src/features/fiscal-notes/utils/qrBarcodeDetector.utils.ts` com `prepareZXingModule` apontando para o `.wasm` empacotado localmente e helper `decodeQrCodeFromImageFile(file)`.
  - Validar que `npm run build` empacota o `.wasm` em `dist/assets/` sem erro de TypeScript ou Vite.

- [ ] **2. Registrar códigos e contextos de erro de `fiscal-notes` em `src/shared/errors/`**
  - Adicionar os 15 códigos em `src/shared/errors/apiErrorCodes.ts`.
  - Adicionar os 5 contextos `fiscal-notes.*` em `src/shared/errors/apiError.types.ts`.
  - Mapear títulos, descrições acionáveis pt-BR e `recovery` em `src/shared/errors/resolveApiError.ts` (incluindo `retryAfterSeconds` e conflitos `409`).
  - Cobrir os novos códigos em `src/shared/errors/resolveApiError.test.ts`.

- [ ] **3. Criar tipos, constantes, utilitários de parsing/formatação e schemas Zod de `fiscal-notes`**
  - Criar `src/features/fiscal-notes/constants/fiscal-notes.constants.ts`.
  - Criar `src/features/fiscal-notes/types/fiscal-note.types.ts` e `fiscal-note-ui.types.ts`.
  - Criar `src/features/fiscal-notes/utils/fiscalNoteInput.utils.ts` (parse URL QR v2/v3, payload `p`, chave 44d, mod-11, modelo `65`, UF `23`, produção, formatação em blocos de 4, máscara CNPJ), `fiscalNoteFormat.utils.ts` e `fiscalNoteError.utils.ts`.
  - Criar `src/features/fiscal-notes/schemas/fiscalNoteInput.schema.ts` e `fiscalNoteImport.schema.ts`.
  - Escrever testes unitários completos (`fiscalNoteInput.utils.test.ts`, `fiscalNoteFormat.utils.test.ts`, `fiscalNoteImport.schema.test.ts`).

## Bloco 2 — Camada de API (TanStack Query) e Hooks de Scanner/Countdown

- [ ] **4. Implementar cliente HTTP, queries e mutations em `src/features/fiscal-notes/api/`**
  - Criar `fiscal-notes.api.ts` (`previewFiscalNote`, `importFiscalNote`, `linkFiscalNote`, `getTransactionFiscalNote`, `unlinkTransactionFiscalNote`).
  - Criar `queries.ts` (`useTransactionFiscalNote`) e `mutations.ts` (`usePreviewFiscalNote`, `useImportFiscalNote`, `useLinkFiscalNote`, `useUnlinkFiscalNote`) com gerenciamento de cache e invalidações.

- [ ] **5. Implementar hooks `useQrCodeScanner` e `useRetryCountdown` com testes unitários**
  - Criar `src/features/fiscal-notes/hooks/useQrCodeScanner.ts` (câmera traseira preferencial, loop throttled 250ms, trava single-shot, cleanup seguro em Strict Mode, troca de câmera, torch, mapeamento de erros de permissão/hardware/HTTPS).
  - Criar `src/features/fiscal-notes/hooks/useRetryCountdown.ts`.
  - Escrever testes em `useQrCodeScanner.test.ts` e `qrBarcodeDetector.utils.test.ts`.

## Bloco 3 — Componentes do Módulo `src/features/fiscal-notes/` (Atomic Design)

- [ ] **6. Implementar atoms e molecules de visualização e captura da NFC-e**
  - Atoms: `FiscalNoteBadge.tsx`, `FiscalNoteItemRow.tsx`.
  - Molecules: `FiscalNoteAccessKeyField.tsx`, `FiscalNoteImageUploadPane.tsx`, `FiscalNoteDuplicateBanner.tsx`, `FiscalNoteDivergenceAlert.tsx`, `FiscalNoteTotalsCard.tsx`, `FiscalNotePaymentsList.tsx`, `FiscalNoteMetadataBlock.tsx`.

- [ ] **7. Implementar organisms de visualização ("Lista de Compras") e desvínculo**
  - `FiscalNoteItemsList.tsx` (reutilizável, busca/filtro por descrição e código na loja, estado vazio de busca).
  - `FiscalNoteSummaryCard.tsx` (card resumo + prévia dos 3 primeiros itens + CTA *"Ver lista completa"* + *"Desvincular"*).
  - `FiscalNoteDetailsSheet.tsx` (sheet completo da nota fiscal / lista de compras + cópia de chave + desvínculo).
  - `FiscalNoteUnlinkDialog.tsx` (`AlertDialog` de confirmação explicando preservação da transação e liberação da chave).
  - Testes em `FiscalNoteDetailsSheet.test.tsx`.

- [ ] **8. Implementar `FiscalNoteQrScannerPane`, `FiscalNoteReaderSheet` e barrel `index.ts`**
  - `FiscalNoteQrScannerPane.tsx` (viewfinder Danfy Dark, controles de câmera/lanterna e fallback imediato para foto/manual).
  - `FiscalNoteReaderSheet.tsx` (Etapa 1: abas Câmera / Foto / Manual com default mobile=Câmera e desktop=Manual → Preview → Etapa 2: modo `import` com formulário completo + slot `renderAttachmentsField`, ou modo `link` com `FiscalNoteDivergenceAlert`; banner proativo de duplicata + countdown de retry).
  - Criar `src/features/fiscal-notes/index.ts` expondo apenas a API pública.
  - Testes em `FiscalNoteReaderSheet.test.tsx`.

## Bloco 4 — Integração com `transactions` e `auth` (Quick Actions)

- [ ] **9. Atualizar tipos, URLs e Quick Actions (`transactions` + `auth`)**
  - Adicionar `hasFiscalNote?: boolean` em `src/features/transactions/types/transaction.types.ts`.
  - Suportar `create=FISCAL_NOTE` em `src/features/transactions/utils/transactionUrl.utils.ts` (e atualizar testes de URL).
  - Adicionar `AUTH_QUICK_ACTION_ROUTES.fiscalNote` em `src/features/auth/constants/auth.constants.ts` e botão **"Ler NFC-e"** em `MobileQuickActions.tsx` + `AuthAppShell.tsx`.

- [ ] **10. Integrar NFC-e na listagem, detalhes, formulários e exclusão de `transactions`**
  - `TransactionsTable.tsx`: renderizar `FiscalNoteBadge` e ação *"Vincular NFC-e"* no menu `...` (apenas `EXPENSE` com `!hasFiscalNote`).
  - `TransactionDetailsSheet.tsx`: seção **Nota fiscal** (`EXPENSE`) com busca lazy (`useTransactionFiscalNote`), `FiscalNoteSummaryCard`, ação *"Vincular NFC-e"*, abertura de `FiscalNoteDetailsSheet` e `FiscalNoteUnlinkDialog`.
  - `TransactionFormSheet.tsx`: atalho *"Importar via NFC-e"* na criação de `EXPENSE`; bloqueio de troca de `type` quando `mode === 'edit'` e `hasFiscalNote === true`.
  - `TransactionConfirmSheet.tsx`: garantir proteção de `type` quando `hasFiscalNote === true`.
  - `TransactionDeleteDialog.tsx`: exibir aviso de remoção sincronizada da nota e liberação da chave quando `hasFiscalNote === true`.
  - `TransactionsPage.tsx`: botão *"Ler NFC-e"* no header/menu mobile, consumo de `?create=FISCAL_NOTE`, orquestração de `FiscalNoteReaderSheet` (incluindo staging de anexos no `import` via slot e abertura de `existingTransactionId` via `GET /transactions/:id`), `FiscalNoteDetailsSheet` e `FiscalNoteUnlinkDialog`.
  - Atualizar/expandir testes em `TransactionsTable.test.tsx`, `TransactionDetailsSheet.test.tsx` e `TransactionFormSheet.test.tsx`.

## Bloco 5 — Qualidade, Documentação Viva e Validação Real no Ambiente

- [ ] **11. Sincronizar documentação modular viva e `AGENTS.md`**
  - Criar `src/features/fiscal-notes/AGENTS.md` e `docs/fiscal-notes/{README.md, concepts/, flows/, decisions/, components/, reference/}`.
  - Atualizar `docs/transactions/` e `src/features/transactions/AGENTS.md`.
  - Atualizar `docs/architecture/module-boundaries.md` e `docs/README.md`.

- [ ] **12. Verificação técnica automatizada (`lint`, `test`, `build`)**
  - Executar `npm run lint`, `npm test` e `npm run build` com 0 erros e 0 warnings.

- [ ] **13. Validação real ponta a ponta no ambiente (Supervisor / QA)**
  - Subir/conectar frontend + backend local (com PR `#146` rodando) e testar como cliente real no browser embarcado do Orca: captura manual (chave 44d / QR), foto com QR, preview, importação com anexo em staging, duplicata (`Ver despesa existente`), lista de compras com busca, bloqueio de troca de tipo, desvínculo e vínculo em despesa existente com divergência.
  - Delegar eventuais correções aos workers e finalizar revisão da PR.
