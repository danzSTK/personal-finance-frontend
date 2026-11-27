---
area: fiscal-notes
type: decision
status: current
last_reviewed: 2026-11-27
decision-id: DEC-FN-001
decision-status: accepted
related:
  - ../README.md
  - ../flows/import-link-and-unlink.md
  - ../flows/list-filter-and-inspect.md
  - ../components/surfaces-and-api.md
  - ../../architecture/module-boundaries.md
---

# DEC-FN-001 — Scanner WASM self-hosted, fronteira acíclica, compositor fino e superfícies em Sheet

Este registro consolida as decisões estruturais permanentes adotadas na implementação e expansão do módulo `fiscal-notes` (correspondentes às decisões `DEC-001` a `DEC-011` da especificação `nfce-ce-reader`).

## Problema

1. **Leitura de QR Code no browser:** wrappers React prontos de câmera/QR apresentam manutenção irregular, atrito com teardown duplo do React 19 Strict Mode, pouca flexibilidade para seguir o design system Danfy Dark e dificuldade para decodificar também fotos/prints da galeria via a mesma engine. Além disso, depender de CDN externa para baixar o binário `.wasm` em runtime viola previsibilidade em produção.
2. **Acoplamento entre domínios e leitor inline em `/fiscal-notes`:** embora a leitura tenha começado em `/transactions`, a listagem dedicada `/fiscal-notes` também exige acionar **Ler NFC-e** diretamente (o que precisa de `AuthAppShell`, contas, categorias, staging de anexos e abertura da despesa vinculada/duplicada em `/transactions`). Permitir imports `fiscal-notes -> transactions/accounts/categories/auth` criaria ciclos entre módulos.
3. **Separação de semântica vs. `/transactions` e período padrão:** encaixar a listagem de notas fiscais como aba em `/transactions` misturaria fluxos de caixa com consulta histórica de compras, e filtrar apenas o mês corrente esconderia notas antigas frequentemente buscadas por item ou loja.
4. **Ergonomia para cupons extensos:** notas de supermercado podem conter dezenas de itens, tornando inviável exibi-los integralmente inline no `TransactionDetailsSheet` ou na tabela resumida de `/fiscal-notes`.

## Decisão

1. **Motor QR com `barcode-detector/ponyfill` + WASM self-hosted e hook próprio (`useQrCodeScanner`):**
   - Utilizar `barcode-detector/ponyfill` com `zxing-wasm/reader/zxing_reader.wasm?url` configurado via `prepareZXingModule` (`locateFile`) em `src/features/fiscal-notes/utils/qrBarcodeDetector.utils.ts`, empacotando o `.wasm` localmente no build do Vite sem requisições a CDNs.
   - Isolar o ciclo de vida WebRTC em `useQrCodeScanner` (câmera traseira preferencial, `requestAnimationFrame` com intervalo de `250 ms`, trava `single-shot` na 1ª detecção e cleanup por `sessionIdRef` para parar `MediaStreamTrack`s com segurança em React 19 Strict Mode), usando `decodeQrCodeFromImageFile` para fotos da galeria com a mesma API `BarcodeDetector`.
2. **Módulo dedicado `src/features/fiscal-notes/` com fronteira acíclica e compositor fino `src/app/pages/FiscalNotesRoutePage.tsx`:**
   - `fiscal-notes` mantém **zero** imports de `transactions`, `accounts`, `categories` ou `auth`.
   - Em `/transactions`, `TransactionsPage` injeta `renderAttachmentsField`, `onAfterImport` e `onOpenExistingTransaction`.
   - Em `/fiscal-notes`, `FiscalNotesPage` vive dentro de `src/features/fiscal-notes/` recebendo apenas callbacks opcionais (`onImportFiscalNote`, `onOpenTransaction`), enquanto o compositor fino `src/app/pages/FiscalNotesRoutePage.tsx` (na camada `src/app/`) conecta `AuthAppShell`, `FiscalNotesPage`, `FiscalNoteReaderSheet` (com `useAccounts`, `useCategories`, `TransactionAccountSelect`, `TransactionCategorySelect`, `TransactionStagedAttachmentsField` e `uploadTransactionAttachments` via barrels públicos) e navega para `/transactions?openTransaction=<id>`.
   - Invalidações de cache cross-module nas mutations de `fiscal-notes` usam prefixos literais dedicados em `FISCAL_NOTES_EXTERNAL_QUERY_KEY_PREFIXES` (`['transactions']`, `['transactions', 'detail', id]`, `['accounts']`, `['dashboard']`), evitando importação de constantes internas de outros módulos.
   - A navegação no `AuthAppShell` (`auth`) usa apenas `AUTH_ROUTES.fiscalNotes` (`'/fiscal-notes'`) na sidebar desktop e no topo do sheet `Mais` mobile, e `AUTH_QUICK_ACTION_ROUTES.fiscalNote` (`'/transactions?view=EXPENSE&create=FISCAL_NOTE'`) no `MobileQuickActions`, sem acoplar `auth` a `fiscal-notes`.
3. **Rota dedicada `/fiscal-notes` com histórico completo por padrão e deep-link `?openTransaction=<id>`:**
   - `/fiscal-notes` inicia com `issuedFrom` e `issuedTo` vazios (todo o histórico por padrão), com presets rápidos no drawer de filtros.
   - O salto de uma nota fiscal (ou duplicata detectada em `/fiscal-notes`) para a despesa correspondente navega para `/transactions?openTransaction=<transactionId>`, onde `TransactionsPage` busca `GET /transactions/:id`, sincroniza o período para o mês do lançamento, abre `TransactionDetailsSheet` e limpa `openTransaction` com `{ replace: true }`.
4. **Fluxo em `Sheet` responsivo + `FiscalNoteDetailsSheet` dedicado (eager ou lazy):**
   - Captura em 3 abas (padrão `Câmera` em mobile/touch e `Manual` em desktop), preview e confirmação ocorrem no `FiscalNoteReaderSheet`.
   - `TransactionDetailsSheet` exibe `FiscalNoteSummaryCard` (prévia dos 3 primeiros itens) e delega a lista completa para `FiscalNoteDetailsSheet`, que também suporta estado assíncrono (`isLoading`/`error`/`onRetry`) e ação `onViewTransaction` quando aberto a partir da listagem `/fiscal-notes` via `GET /fiscal-notes/:id`.

## Consequência

- **Positivas:** controle completo de UI/acessibilidade em Danfy Dark, zero requisições externas para `.wasm`, prevenção de chamadas duplicadas à SEFAZ-CE pelo lock `single-shot`, zero ciclos na matriz de fronteiras (mesmo com `/fiscal-notes` suportando leitura inline e navegação para despesas) e reuso integral de `FiscalNoteDetailsSheet`, `FiscalNoteItemsList` e `FiscalNoteUnlinkDialog`.
- **Trade-offs / restrições:**
  - `FISCAL_NOTES_EXTERNAL_QUERY_KEY_PREFIXES` duplica os prefixos literais `['transactions']`, `['accounts']` e `['dashboard']` para preservar a aciclicidade — qualquer renomeação de root query key nesses módulos deve manter esses prefixos sincronizados.
  - O arquivo `.wasm` acrescenta peso estático aos assets gerados em `dist/assets/`, carregado sob demanda apenas ao acionar decodificação de câmera/imagem.
  - O compositor `FiscalNotesRoutePage` depende do barrel público `@/features/transactions` (que exporta os seletores e staging de anexos necessários), mantendo `fiscal-notes` 100% isolado.
