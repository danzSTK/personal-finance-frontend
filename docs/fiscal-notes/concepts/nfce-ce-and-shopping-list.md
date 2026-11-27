---
area: fiscal-notes
type: concept
status: current
related:
  - ../README.md
  - ../flows/import-link-and-unlink.md
  - ../decisions/adr-qr-scanner-and-module-boundaries.md
  - ../../transactions/concepts/transaction-model-and-types.md
---

# NFC-e SEFAZ-CE e Lista de Compras

Uma **NFC-e** (`FiscalNoteDetail` / `FiscalNotePreviewDetail`) representa o documento fiscal de consumidor eletrônico autorizado pela **SEFAZ-CE** (`sourceUf === '23'`, modelo `65`, ambiente de produção) consultado pelo backend e persistido junto a uma lista ordenada de itens comprados (`FiscalNoteItem[]`) e meios de pagamento (`FiscalNotePayment[]`).

Na V1 do produto, a nota fiscal opera no **Modelo A** (associada em relação **1:1 ativa** a uma transação do tipo `EXPENSE`), enquanto os componentes visuais de leitura da lista de compras já nascem desacoplados para futura evolução ao **Modelo B** (visão global de notas e listas de compras independentes).

## Identidade, Ownership e Fonte de Verdade

- **Identidade da nota persistida:** UUID `id` retornado pelo backend (`object: 'fiscal_note.item'`), ligado a `transactionId` e à chave de acesso fiscal `accessKey` (44 dígitos numéricos).
- **Unicidade por usuário:** o escopo é sempre o usuário autenticado (cookie HttpOnly, sem envio de `userId` pelo cliente). A mesma `accessKey` não pode estar ativa em duas despesas simultâneas do usuário; após desvínculo (`DELETE`) ou exclusão da transação vinculada, a chave volta a ficar disponível para reimportação.
- **Fonte de verdade:**
  - O **backend** é a única fonte de verdade do parsing XML/XSLT da SEFAZ-CE. No `import` e no `link`, o frontend envia apenas `{ input }` (nunca envia itens, totais ou emitente calculados no cliente).
  - Cache remoto em TanStack Query (`FISCAL_NOTES_QUERY_KEYS.byTransaction(transactionId)`, `staleTime: 5 min` porque a nota persistida é imutável na V1).
  - Na listagem `/transactions`, a existência de vínculo vem apenas no booleano leve `transaction.hasFiscalNote` — sem disparar consultas por linha.

## Formatos de Entrada e Anatomia da Chave (44 Dígitos)

`parseFiscalNoteInput` (`src/features/fiscal-notes/utils/fiscalNoteInput.utils.ts`) aceita três origens (`sourceType`), com limite máximo de `1024` caracteres (`FISCAL_NOTE_INPUT_MAX_LENGTH`):

| Origem (`sourceType`) | Formato aceito | Validações locais aplicadas |
| --- | --- | --- |
| `url` | URL HTTP/HTTPS do QR Code com query param `p` | Extrai `p` (decodificando `%7C` se necessário) e valida payload separado por `\|` |
| `payload` | Payload `p=` ou string separada por `\|` | QR v2 normal (5 partes: chave, versão `2`, ambiente, CSC ID, hash), QR v2 contingência (8 partes não vazias) ou QR v3 (`>= 3` partes) |
| `access-key` | Chave numérica de 44 dígitos (aceita espaços/pontos/hífens na digitação) | Normaliza removendo não-dígitos; formata visualmente em 11 blocos de 4 dígitos |

Regras estruturais verificadas na chave de 44 dígitos antes de chamar a API:
1. **UF (`[0..1]`):** deve ser `'23'` (`FISCAL_NOTE_CE_UF_CODE` — Ceará).
2. **Modelo (`[20..21]`):** deve ser `'65'` (`FISCAL_NOTE_MODEL_CODE` — NFC-e); modelo `'55'` (NF-e) é rejeitado explicitamente.
3. **Dígito Verificador (`[43]`):** validado pelo algoritmo **Módulo 11** (`hasValidMod11CheckDigit`, pesos cíclicos de `2` a `9` da direita para a esquerda sobre os 43 primeiros dígitos).
4. **Ambiente (no payload do QR):** somente `'1'` (produção); `'2'` (homologação) é bloqueado localmente.

## Modelo de Compra (Modelo A Atual vs. Preparo para Modelo B)

| Modelo | Escopo | Estado na V1 |
| --- | --- | --- |
| **Modelo A (V1)** | Lista de compras ancorada 1:1 a uma `Transaction` do tipo `EXPENSE` (`FiscalNoteSummaryCard` dentro de `TransactionDetailsSheet` + `FiscalNoteDetailsSheet`) | Implementado |
| **Modelo B (Futuro)** | Tela/rota global de notas fiscais e listas de compras desvinculadas (`GET /fiscal-notes`) | Fora de escopo na V1; `FiscalNoteItemsList`, `FiscalNoteSummaryCard`, `FiscalNoteDetailsSheet` e tipos públicos já desacoplados |

## Precisão Monetária, Quantidades, Datas e Zero-PII

- **Valores monetários em centavos inteiros seguros (`.numeric` obrigatório):** `grossAmountCents`, `discountAmountCents`, `payableAmountCents`, `taxAmountCents`, `changeAmountCents` e `totalPriceCents` (e `amountCents` em `suggestedTransaction`).
  - `changeAmountCents === null` indica ausência de troco (inclusive quando a SEFAZ retorna `NaN`) e deve ser omitido na UI.
  - Se `payableAmountCents === 0` no preview, o fluxo de `import` alerta o usuário e exige que `amountCents` informado seja inteiro `>= 1` antes do envio.
- **Quantidades e preços unitários decimais:** `quantity` e `unitPrice` nos itens preservam até **4 casas decimais** em formato pt-BR (`formatItemQuantity` e `formatFiscalNoteUnitPrice` em `utils/fiscalNoteFormat.utils.ts`) com classe `.numeric`, sem arredondamento destrutivo.
- **Contrato temporal (`DateOnly` vs. `Instant`):**
  - `suggestedTransaction.date` e `fiscalNote.issuedDate` são `DateOnly` (`YYYY-MM-DD`), manipulados via `src/shared/utils/dateOnly.ts` — nunca via `toISOString()`.
  - `fiscalNote.issuedAt`, `createdAt` e `updatedAt` são `Instant` UTC convertidos para exibição local (`formatDateTime`).
- **Imutabilidade e independência:** nota fiscal, itens e pagamentos são sempre **somente leitura**. Vincular uma NFC-e a uma despesa existente **nunca** sobrescreve valor, data ou descrição da transação; importar uma NFC-e sugere os campos em `suggestedTransaction`, mas permite edição total antes de confirmar.
- **Zero-PII:** nenhuma informação pessoal do consumidor trafega nos contratos, e URLs cruas com `cscId`/`qrHash` ou mensagens técnicas do backend nunca são expostas em toasts ou alertas de erro.

## Relação com Outros Módulos

- **`transactions`:** somente transações `EXPENSE` podem exibir ou receber NFC-e (`hasFiscalNote?: boolean`). Enquanto `hasFiscalNote === true`, a edição/confirmação da transação bloqueia alteração de `type` para fora de `EXPENSE`, e a exclusão da transação remove também a nota no backend.
- **`shared`:** erros mapeados em `src/shared/errors/`, formatação temporal em `src/shared/utils/dateOnly.ts` e monetária em `src/shared/utils/formatters.ts`.
