---
area: fiscal-notes
type: decision
status: current
decision-id: DEC-FN-001
decision-status: accepted
related:
  - ../README.md
  - ../flows/import-link-and-unlink.md
  - ../components/surfaces-and-api.md
  - ../../architecture/module-boundaries.md
---

# DEC-FN-001 — Scanner WASM self-hosted, fronteira acíclica e superfícies em Sheet

Este registro consolida as decisões estruturais permanentes adotadas na implementação do módulo `fiscal-notes` (correspondentes às decisões `DEC-001` a `DEC-007` da especificação `nfce-ce-reader`).

## Problema

1. **Leitura de QR Code no browser:** wrappers React prontos de câmera/QR apresentam manutenção irregular, atrito com teardown duplo do React 19 Strict Mode, pouca flexibilidade para seguir o design system Danfy Dark e dificuldade para decodificar também fotos/prints da galeria via a mesma engine. Além disso, depender de CDN externa para baixar o binário `.wasm` em runtime viola previsibilidade em produção.
2. **Acoplamento entre domínios:** embora a V1 atue sobre despesas em `/transactions`, o domínio de notas fiscais e lista de compras evoluirá para telas próprias (visão global de notas e compras). Embutir tudo em `src/features/transactions/` ou criar imports `fiscal-notes -> transactions` (por exemplo, para anexos em staging no `import` e invalidação de cache) geraria ciclo entre módulos.
3. **Ergonomia para cupons extensos:** notas de supermercado podem conter dezenas de itens, tornando inviável exibi-los integralmente inline no `TransactionDetailsSheet` ou criar navegação para outra página durante o registro de uma despesa.

## Decisão

1. **Motor QR com `barcode-detector/ponyfill` + WASM self-hosted e hook próprio (`useQrCodeScanner`):**
   - Utilizar `barcode-detector/ponyfill` com `zxing-wasm/reader/zxing_reader.wasm?url` configurado via `prepareZXingModule` (`locateFile`) em `src/features/fiscal-notes/utils/qrBarcodeDetector.utils.ts`, empacotando o `.wasm` localmente no build do Vite sem requisições a CDNs.
   - Isolar o ciclo de vida WebRTC em `useQrCodeScanner` (câmera traseira preferencial, `requestAnimationFrame` com intervalo de `250 ms`, trava `single-shot` na 1ª detecção e cleanup por `sessionIdRef` para parar `MediaStreamTrack`s com segurança em React 19 Strict Mode), usando `decodeQrCodeFromImageFile` para fotos da galeria com a mesma API `BarcodeDetector`.
2. **Módulo dedicado `src/features/fiscal-notes/` com fronteira acíclica (`transactions -> fiscal-notes`):**
   - `fiscal-notes` não importa nenhum arquivo de `transactions`, `accounts`, `categories` ou `auth`.
   - Integrações específicas de `transactions` no fluxo de importação e recuperação de duplicata são injetadas por `TransactionsPage` via render slot (`renderAttachmentsField`) e callbacks (`onAfterImport`, `onOpenExistingTransaction`).
   - Invalidações de cache cross-module nas mutations de `fiscal-notes` usam prefixos literais dedicados em `FISCAL_NOTES_EXTERNAL_QUERY_KEY_PREFIXES` (`['transactions']`, `['transactions', 'detail', id]`, `['accounts']`, `['dashboard']`), evitando importação de constantes internas de outros módulos.
   - O atalho mobile no `MobileQuickActions` (`auth`) usa apenas o deep link constante `AUTH_QUICK_ACTION_ROUTES.fiscalNote` (`/transactions?view=EXPENSE&create=FISCAL_NOTE`), sem acoplar `auth` a `fiscal-notes`.
3. **Fluxo em `Sheet` responsivo + `FiscalNoteDetailsSheet` dedicado:**
   - Captura em 3 abas (padrão `Câmera` em mobile/touch e `Manual` em desktop), preview e confirmação ocorrem no `FiscalNoteReaderSheet`.
   - `TransactionDetailsSheet` exibe o compacto `FiscalNoteSummaryCard` (prévia dos 3 primeiros itens) e delega a lista completa com busca em tempo real, totais, pagamentos e metadados para o `FiscalNoteDetailsSheet`.

## Consequência

- **Positivas:** controle completo de UI/acessibilidade em Danfy Dark, zero requisições externas para `.wasm`, prevenção de chamadas duplicadas à SEFAZ-CE pelo lock `single-shot`, zero ciclos na matriz de fronteiras e componentes (`FiscalNoteItemsList`, `FiscalNoteSummaryCard`, `FiscalNoteDetailsSheet`) prontos para reuso em futura rota global de lista de compras.
- **Trade-offs / restrições:**
  - `FISCAL_NOTES_EXTERNAL_QUERY_KEY_PREFIXES` duplica os prefixos literais `['transactions']`, `['accounts']` e `['dashboard']` para preservar a aciclicidade — qualquer renomeação de root query key nesses módulos deve manter esses prefixos sincronizados.
  - O arquivo `.wasm` acrescenta peso estático aos assets gerados em `dist/assets/`, carregado sob demanda apenas ao acionar decodificação de câmera/imagem.
