---
area: fiscal-notes
type: reference
status: current
last_reviewed: 2026-11-27
related:
  - ../README.md
  - ../flows/import-link-and-unlink.md
  - ../components/surfaces-and-api.md
  - ../../architecture/api-error-handling.md
  - ../../architecture/module-boundaries.md
---

# Referência de API, Query Keys, Schemas e Erros — `fiscal-notes`

Fonte de verdade dos endpoints consumidos, chaves de cache, schemas de validação local, constantes de domínio e códigos de erro mapeados para `src/features/fiscal-notes/`.

Referência de contrato backend: `personal-finance-backend:docs/fiscal-notes/reference/http-and-error-contracts.md` e `personal-finance-backend:docs/integrations/frontend-error-handling.md`.

## Endpoints Consumidos (`FISCAL_NOTES_API_ENDPOINTS`)

| Método | Endpoint | Função / Hook | Cache / Invalidação |
| --- | --- | --- | --- |
| `POST` | `/fiscal-notes/preview` | `previewFiscalNote` / `usePreviewFiscalNote` | Mutation (`retry: false`); sem invalidação (somente leitura) |
| `POST` | `/fiscal-notes/import` | `importFiscalNote` / `useImportFiscalNote` | `setQueryData(byTransaction(res.transaction.id), res.fiscalNote)`; invalida `['transactions']`, `['accounts']`, `['dashboard']` (`exact: false`) |
| `POST` | `/transactions/:id/fiscal-note` | `linkFiscalNote` / `useLinkFiscalNote` | `setQueryData(byTransaction(id), data)`; invalida `['transactions']` (`exact: false`) e `['transactions', 'detail', id]` |
| `GET` | `/transactions/:id/fiscal-note` | `getTransactionFiscalNote` / `useTransactionFiscalNote` | Query key `FISCAL_NOTES_QUERY_KEYS.byTransaction(id)` (`staleTime: 5 min`, sem retry em `404` / `FISCAL_NOTE_NOT_FOUND`, até 2 retries nos demais erros) |
| `DELETE` | `/transactions/:id/fiscal-note` | `unlinkTransactionFiscalNote` / `useUnlinkFiscalNote` | `removeQueries(byTransaction(id))`; invalida `['transactions']` (`exact: false`) e `['transactions', 'detail', id]` |

## Query Keys e Constantes (`src/features/fiscal-notes/constants/fiscal-notes.constants.ts`)

| Constante | Valor / Estrutura | Uso |
| --- | --- | --- |
| `FISCAL_NOTES_QUERY_KEYS.all` | `['fiscal-notes']` | Raiz de queries de notas fiscais |
| `FISCAL_NOTES_QUERY_KEYS.byTransaction(id)` | `['fiscal-notes', 'transaction', id]` | Cache da nota vinculada a uma transação |
| `FISCAL_NOTES_EXTERNAL_QUERY_KEY_PREFIXES` | `transactions`, `transactionDetail(id)`, `accounts`, `dashboard` | Prefixos literais para invalidação cross-module sem acoplamento de imports |
| `FISCAL_NOTE_DETAIL_STALE_TIME_MS` | `300_000` (`5 min`) | Retenção em cache da nota persistida (imutável na V1) |
| `FISCAL_NOTE_PREVIEW_ITEMS_LIMIT` | `3` | Quantidade de itens exibidos na prévia de `FiscalNoteSummaryCard` |
| `FISCAL_NOTE_ALLOWED_IMAGE_TYPES` | `['image/png', 'image/jpeg', 'image/webp']` | Tipos MIME aceitos para leitura de QR Code por foto |
| `FISCAL_NOTE_MAX_IMAGE_SIZE_BYTES` | `10 * 1024 * 1024` (`10 MB`) | Limite máximo de arquivo de imagem no upload de QR Code |
| `FISCAL_NOTE_CE_UF_CODE` / `MODEL_CODE` / `ACCESS_KEY_LENGTH` | `'23'` / `'65'` / `44` | Regras estruturais da chave de NFC-e da SEFAZ-CE |
| `FISCAL_NOTE_INPUT_MAX_LENGTH` / `DESCRIPTION_MAX_LENGTH` | `1024` / `500` | Limites de entrada de QR/chave e descrição da despesa importada |
| `FISCAL_NOTE_QR_SCANNER_THROTTLE_MS` | `250` | Intervalo mínimo (ms) entre detecções no loop `requestAnimationFrame` |

## Schemas de Validação Local (`src/features/fiscal-notes/schemas/`)

- **`fiscalNoteInputSchema` (`fiscalNoteInput.schema.ts`):** valida string não vazia até `1024` caracteres usando `parseFiscalNoteInput` (URL com parâmetro `p`, payload `p` ou chave 44d, QR v2 normal/contingência ou v3, ambiente `'1'`, modelo `'65'`, DV Módulo 11 válido e UF `'23'`).
- **`fiscalNoteImportSchema` (`fiscalNoteImport.schema.ts`):** valida `accountId` (UUID), `categoryId` (UUID), `amountCents` (inteiro positivo `>= 1`, `<= Number.MAX_SAFE_INTEGER`), `date` (`isValidDateOnly`), `description` (1 a 500 caracteres) e `status` (`'EFFECTIVE' | 'PENDING'`).

## Contextos e Códigos de Erro (`src/shared/errors/`)

### Contextos (`ApiErrorContext` em `apiError.types.ts`)
- `'fiscal-notes.preview'`
- `'fiscal-notes.import'`
- `'fiscal-notes.link'`
- `'fiscal-notes.get'`
- `'fiscal-notes.unlink'`

### Matriz dos 15 Códigos (`API_ERROR_CODES` e `resolveApiError.ts`)

| Código Backend | HTTP | Superfície / Tratamento UX | Recuperação |
| --- | --- | --- | --- |
| `FISCAL_NOTE_INVALID_INPUT` | `400` | `ApiErrorAlert` (*"Código da NFC-e inválido"*) | `'correct-fields'` |
| `INVALID_FISCAL_NOTE` | `400` | `ApiErrorAlert` (*"Não foi possível validar esta nota fiscal"*) | `'none'` |
| `FISCAL_NOTE_NOT_FOUND` | `404` | `ApiErrorAlert` / sem retry na query (*"Nota fiscal não encontrada"*) | `'none'` |
| `FISCAL_NOTE_SEFAZ_NOT_FOUND` | `404` | `ApiErrorAlert` (*"Nota fiscal não encontrada na SEFAZ-CE"*) | `'correct-fields'` |
| `FISCAL_NOTE_ALREADY_IMPORTED` | `409` | `FiscalNoteDuplicateBanner` via `parseFiscalNoteAlreadyImportedDetails` + CTA *"Ver despesa existente"* | `'none'` |
| `TRANSACTION_ALREADY_HAS_FISCAL_NOTE` | `409` | `ApiErrorAlert` (*"Esta despesa já possui uma nota fiscal"*) | `'none'` |
| `TRANSACTION_TYPE_DOES_NOT_SUPPORT_FISCAL_NOTE` | `409` | No vínculo: *"Apenas despesas aceitam NFC-e"*; em `transactions.update` / `transactions.confirm`: *"Tipo da transação não pode ser alterado"* | `'none'` |
| `FISCAL_NOTE_UNSUPPORTED_UF` | `422` | `ApiErrorAlert` (*"Estado ainda não suportado"* — apenas CE / UF 23) | `'none'` |
| `FISCAL_NOTE_HOMOLOGATION_NOT_ALLOWED` | `422` | `ApiErrorAlert` (*"Nota de teste não permitida"*) | `'none'` |
| `FISCAL_NOTE_CANCELLED_OR_DENIED` | `422` | `ApiErrorAlert` (*"Nota fiscal cancelada ou denegada"*) | `'none'` |
| `FISCAL_NOTE_RATE_LIMIT_EXCEEDED` | `429` | `ApiErrorAlert` + `useRetryCountdown` usando `retryAfterSeconds` | `'retry'` |
| `FISCAL_NOTE_PARSE_FAILED` | `502` | `ApiErrorAlert` (*"Não conseguimos ler o retorno da SEFAZ-CE"*) | `'retry'` |
| `FISCAL_NOTE_RESPONSE_TOO_LARGE` | `502` | `ApiErrorAlert` (*"Resposta da SEFAZ excedeu o limite suportado"*) | `'retry'` |
| `SEFAZ_TEMPORARILY_UNAVAILABLE` | `503` | `ApiErrorAlert` + `useRetryCountdown` usando `retryAfterSeconds` | `'retry'` |
| `SEFAZ_TIMEOUT` | `504` | `ApiErrorAlert` (*"A SEFAZ-CE demorou para responder"*) | `'retry'` |

## Escopo e Limites Conhecidos

- Não existe rota dedicada para listagem global de notas fiscais na V1; o acesso ocorre via `/transactions` (fluxos de importação, vínculo e detalhes da despesa) e atalho rápido mobile `/transactions?view=EXPENSE&create=FISCAL_NOTE`.
- `parseTransactionAlreadyHasFiscalNoteDetails` está implementado em `utils/fiscalNoteError.utils.ts` como utilitário tipado auxiliar; atualmente o tratamento visual de `TRANSACTION_ALREADY_HAS_FISCAL_NOTE` ocorre via `resolveApiError` + `ApiErrorAlert`.
