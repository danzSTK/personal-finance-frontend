# Módulo `fiscal-notes` — Instruções Locais

Este módulo gerencia o leitor de NFC-e (SEFAZ-CE) e a visualização da lista de compras vinculada a despesas (`EXPENSE`), com componentes e contratos desacoplados para futura tela dedicada de notas fiscais/lista de compras.

## Documentação Obrigatória

Antes de planejar, editar ou revisar código neste módulo, leia:
- `docs/fiscal-notes/README.md` — Índice geral, cobertura e mapa de leitura do módulo.
- `docs/fiscal-notes/concepts/nfce-ce-and-shopping-list.md` — Domínio NFC-e SEFAZ-CE, chave de 44 dígitos, QR v2/v3, lista de compras e relação 1:1 com `EXPENSE`.
- `docs/fiscal-notes/flows/import-link-and-unlink.md` — Captura (câmera/foto/manual), preview, duplicata, importação com staging, vínculo com divergência e desvínculo.
- `docs/fiscal-notes/decisions/adr-qr-scanner-and-module-boundaries.md` — Decisões vigentes (`barcode-detector` WASM self-hosted, fronteira acíclica e superfícies).
- `docs/fiscal-notes/components/surfaces-and-api.md` — API pública (`index.ts`), Atomic Design, donos de estado e slots de extensão.
- `docs/fiscal-notes/reference/api-and-error-codes.md` — 5 endpoints, query keys, schemas e 15 códigos de erro mapeados.
- `docs/architecture/module-boundaries.md` — Limites entre módulos e regra acíclica.

## Regras de Fronteira e Invariantes

- **Fronteira acíclica estrita (`transactions -> fiscal-notes`, nunca o inverso):** `src/features/fiscal-notes/` **não** pode importar de `transactions`, `accounts`, `categories` ou `auth`. Consumidores externos devem importar exclusivamente via `@/features/fiscal-notes` (`src/features/fiscal-notes/index.ts`).
- **Extensibilidade sem acoplamento:**
  - Contas (`FiscalNoteAccountOption[]`) e categorias (`FiscalNoteCategoryOption[]`) chegam via props no modo `import`, que também aceita os slots opcionais `renderAccountField` e `renderCategoryField` (`FiscalNoteSelectFieldRenderer`) para seletores customizados com identidade visual injetados pelo consumidor (mantendo `<Select>` fallback para uso isolado).
  - Comprovantes/anexos em staging no fluxo de importação usam o slot `renderAttachmentsField` e o callback `onAfterImport` injetados por `TransactionsPage`.
  - Navegação para despesa duplicada usa o callback `onOpenExistingTransaction(transactionId)`.
  - Invalidação cross-module em `api/mutations.ts` usa exclusivamente prefixos literais definidos em `FISCAL_NOTES_EXTERNAL_QUERY_KEY_PREFIXES` (`['transactions']`, `['transactions', 'detail', transactionId]`, `['accounts']`, `['dashboard']`).
- **WASM self-hosted e ciclo de vida de câmera:** decodificação QR usa `barcode-detector/ponyfill` com `zxing-wasm/reader/zxing_reader.wasm?url` em `utils/qrBarcodeDetector.utils.ts` (zero dependência de CDN externa). `useQrCodeScanner` prioriza câmera traseira, aplica throttle de `250 ms` via `requestAnimationFrame`, trava após a 1ª leitura (`single-shot lock`) e encerra todas as `MediaStreamTrack`s na desmontagem (seguro para React 19 Strict Mode). Upload de foto aceita PNG/JPEG/WebP até `10 MB`.
- **Validação local fail-fast:** `parseFiscalNoteInput` / `fiscalNoteInputSchema` validam antes de qualquer request HTTP: comprimento `<= 1024`, chave de 44 dígitos, modelo `65` (rejeita `55`), dígito verificador módulo 11, ambiente de produção `'1'` (rejeita homologação `'2'`) e UF `'23'` (Ceará).
- **Invariantes de domínio e precisão:**
  - Relação ativa **1:1 exclusiva para `EXPENSE`**; cabeçalho, itens e pagamentos são sempre **somente leitura**.
  - `POST /fiscal-notes/import` e `POST /transactions/:id/fiscal-note` enviam apenas `{ input }` (nunca itens ou totais calculados no cliente).
  - Valores monetários em centavos inteiros seguros e quantidades/preços unitários (`quantity` e `unitPrice` com até 4 casas decimais pt-BR) devem usar `.numeric`; `changeAmountCents === null` deve ser omitido.
  - No `import`, `amountCents` efetivo deve ser inteiro positivo (`>= 1`, exigindo ajuste manual se a nota retornar `payableAmountCents === 0`).
  - `issuedDate` e `suggestedTransaction.date` são `DateOnly` (`YYYY-MM-DD`) via `src/shared/utils/dateOnly.ts`; `issuedAt`, `createdAt` e `updatedAt` são `Instant` UTC convertidos apenas na exibição.
- **Desvínculo, erros e retry:** `DELETE /transactions/:id/fiscal-note` preserva a despesa e os saldos e libera a chave de acesso. Todos os 15 códigos de erro e 5 contextos `fiscal-notes.*` residem em `src/shared/errors/`; `useRetryCountdown` controla cooldown de `429`/`503` via `retryAfterSeconds`, e `parseFiscalNoteAlreadyImportedDetails` alimenta `FiscalNoteDuplicateBanner`.
- **Sincronização documental:** qualquer mudança em endpoints, regras de captura, contratos de erro ou API pública exige atualização conjunta de `docs/fiscal-notes/` e deste `AGENTS.md`.
