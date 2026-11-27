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
  - ./decisions/adr-qr-scanner-and-module-boundaries.md
  - ./components/surfaces-and-api.md
  - ./reference/api-and-error-codes.md
---

# Módulo `fiscal-notes`

O módulo `fiscal-notes` implementa a leitura de **Nota Fiscal de Consumidor Eletrônica (NFC-e)** da **SEFAZ-CE (`UF = 23`, modelo `65`, produção)** por câmera ao vivo, foto/print da galeria ou entrada manual (URL do QR Code, payload `p` ou chave de 44 dígitos), além da exibição da **lista de compras** detalhada e do fluxo de importação, vínculo e desvínculo em despesas (`EXPENSE`).

Todo o código proprietário reside em `src/features/fiscal-notes/`, com instruções operacionais locais em `src/features/fiscal-notes/AGENTS.md`. O módulo mantém fronteira acíclica estrita: **não** importa de `transactions`, `accounts`, `categories` ou `auth`, expondo sua API pública exclusivamente via `src/features/fiscal-notes/index.ts`.

## Mapa da Documentação

### Conceitos (`concepts/`)
- [NFC-e SEFAZ-CE e Lista de Compras](./concepts/nfce-ce-and-shopping-list.md) — Anatomia da chave 44d, QR v2/v3, relação 1:1 com `EXPENSE`, lista de compras (Modelo A e preparo para Modelo B), precisão decimal/monetária e `DateOnly` vs. `Instant`.

### Fluxos (`flows/`)
- [Importação, Vínculo, Consulta e Desvínculo de NFC-e](./flows/import-link-and-unlink.md) — Captura em 3 modos, validação local fail-fast, preview, tratamento de duplicata, importação atômica com anexos em staging, vínculo com alerta de divergência e desvínculo isolado.

### Decisões (`decisions/`)
- [DEC-FN-001 — Scanner WASM self-hosted, fronteira acíclica e superfícies em Sheet](./decisions/adr-qr-scanner-and-module-boundaries.md) — Escolha de `barcode-detector/ponyfill` self-hosted, desacoplamento via slots/callbacks e separação entre resumo e sheet dedicado da lista de compras.

### Componentes (`components/`)
- [Superfícies, Atomic Design e API Pública](./components/surfaces-and-api.md) — Contratos exportados por `src/features/fiscal-notes/index.ts`, composição Atomic Design, ownership de estado e pontos de extensão.

### Referência (`reference/`)
- [Endpoints, Query Keys, Schemas e Códigos de Erro](./reference/api-and-error-codes.md) — Os 5 endpoints consumidos, `FISCAL_NOTES_QUERY_KEYS`, prefixos de invalidação cross-module, schemas Zod, os 15 códigos de erro e escopo/limites atuais.

## Fronteiras e Dependências

- **Código proprietário:** `src/features/fiscal-notes/`
- **API pública (`src/features/fiscal-notes/index.ts`):** `FiscalNoteBadge`, `FiscalNoteDetailsSheet`, `FiscalNoteItemsList`, `FiscalNoteReaderSheet`, `FiscalNoteSummaryCard`, `FiscalNoteUnlinkDialog`, `FISCAL_NOTES_QUERY_KEYS`, `useTransactionFiscalNote`, `useUnlinkFiscalNote` e tipos públicos (`FiscalNote*`).
- **Dependências de entrada:** apenas `src/shared/` (`api`, componentes `ui/*`, `ApiErrorAlert`, `CurrencyInput`, `DateOnlyPicker`, `src/shared/errors`, `src/shared/utils/*`) e o pacote `barcode-detector` (com `zxing-wasm` empacotado localmente). **Zero** imports de outras features.
- **Consumidores cross-feature:** `src/features/transactions/` consome a API pública via `@/features/fiscal-notes` (`TransactionsPage`, `TransactionDetailsSheet`, `TransactionsTable`, `mutations.ts`). `src/features/auth/` navega apenas por deep link constante (`AUTH_QUICK_ACTION_ROUTES.fiscalNote = '/transactions?view=EXPENSE&create=FISCAL_NOTE'`).

## Estado Atual de Implementação

### Implementado e Documentado
- [x] Captura de NFC-e em 3 abas (`Câmera`, `Foto`, `Manual`) com seleção inicial responsiva (`Câmera` em mobile/touch; `Manual` em desktop).
- [x] Decodificação local de QR Code via `barcode-detector/ponyfill` com `zxing_reader.wasm` self-hosted no bundle Vite (câmera ao vivo com troca de câmera/lanterna/fallback + upload de imagem até 10 MB).
- [x] Validação local fail-fast (tamanho `<= 1024`, URL/payload `p`/chave 44d, QR v2 normal/contingência e v3, modelo `65`, dígito verificador mod-11, produção `'1'`, UF `'23'`).
- [x] Preview (`POST /fiscal-notes/preview`), detecção proativa e concorrente de duplicata (`alreadyImported` / `409 FISCAL_NOTE_ALREADY_IMPORTED`) com navegação direta via `onOpenExistingTransaction`.
- [x] Importação atômica (`POST /fiscal-notes/import`) com pré-preenchimento editável de `suggestedTransaction`, slot de comprovantes em staging e pós-upload resiliente.
- [x] Vínculo em `EXPENSE` existente (`POST /transactions/:id/fiscal-note`) com `FiscalNoteDivergenceAlert` comparativo sem mutar a transação.
- [x] Consulta lazy (`GET /transactions/:id/fiscal-note`), card resumo (`FiscalNoteSummaryCard`), lista completa com busca em tempo real (`FiscalNoteDetailsSheet` + `FiscalNoteItemsList`) e desvínculo isolado (`FiscalNoteUnlinkDialog` + `DELETE /transactions/:id/fiscal-note`).
- [x] Cobertura dos 15 códigos de erro e 5 contextos `fiscal-notes.*` em `src/shared/errors/`, incluindo countdown para `429`/`503` (`retryAfterSeconds`).

### Gaps Conhecidos / Fora de Escopo (V1)
- [ ] Não há rota global `/fiscal-notes` nem listagem consolidada de notas/listas de compras independentes (`GET /fiscal-notes` ainda não existe no backend); componentes como `FiscalNoteItemsList`, `FiscalNoteSummaryCard` e `FiscalNoteDetailsSheet` já foram isolados para essa futura evolução.
- [ ] Apenas NFC-e modelo `65` emitidas no Ceará (`UF = 23`) em ambiente de produção são aceitas nesta versão.
- [ ] Itens, cabeçalho e pagamentos da nota são estritamente somente leitura na V1.
