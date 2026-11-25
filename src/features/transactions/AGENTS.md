# Módulo `transactions` — Instruções Locais

Este módulo é o núcleo operacional financeiro do frontend da Danfy, gerenciando lançamentos (`INCOME`, `EXPENSE`, `TRANSFER`, `ADJUSTMENT`), filtros sincronizados na URL, KPIs, confirmação de pendências, exclusão e anexos/comprovantes.

## Documentação Obrigatória

Antes de planejar, editar ou revisar código neste módulo, leia:
- `docs/transactions/README.md` — Índice geral, cobertura e mapa de leitura do módulo.
- `docs/transactions/concepts/transaction-model-and-types.md` — Tipos, status (`PENDING`/`EFFECTIVE`/`OVERDUE`), `amountCents > 0` e `DateOnly`.
- `docs/transactions/concepts/transaction-attachments-model.md` — Regras, limites, presigned URLs e staging de comprovantes.
- `docs/transactions/flows/list-filter-and-kpis.md` — Tela `/transactions`, estado em URL, KPIs e agrupamento por dia.
- `docs/transactions/flows/create-edit-and-transfer.md` — Criação, edição diff-only e regras de transferência.
- `docs/transactions/flows/balance-adjustment.md` — Reajuste de saldo por saldo alvo (`POST /transactions/balance-adjustments`) e ajuste manual (`ADJUSTMENT`).
- `docs/transactions/flows/manage-attachments.md` — Galeria, upload (criação/edição/detalhes), reordenação dual e lightbox.
- `docs/transactions/reference/api-and-contracts.md` — Endpoints, query keys, códigos de erro e gaps conhecidos.
- `docs/architecture/module-boundaries.md` — Fronteiras com `accounts`, `categories` e `auth`.

## Regras de Fronteira e Invariantes

- **Precisão monetária (`amountCents` e `targetBalanceCents`):** em transações comuns e ajustes manuais, `amountCents` é sempre inteiro seguro estritamente positivo (`> 0`, `<= Number.MAX_SAFE_INTEGER`) editado via `CurrencyInput` cent-first; direção financeira vem de `type` (e `direction` para `ADJUSTMENT`). Em `POST /transactions/balance-adjustments`, `targetBalanceCents` aceita inteiros seguros negativos, zero (`0`) ou positivos via `CurrencyInput allowNegative`, com cálculo de delta em `BigInt` (`balanceAdjustment.utils.ts`). Sempre exiba valores monetários com `.numeric`.
- **Datas civis (`DateOnly`):** `date`, `dateFrom` e `dateTo` são sempre strings `YYYY-MM-DD` validadas com `src/shared/utils/dateOnly.ts` — nunca use `new Date(...).toISOString()` para datas de transação ou filtros. Instants (`createdAt`, `updatedAt`, `effectiveAt`) são UTC convertidos apenas na exibição.
- **`TRANSFER` e `ADJUSTMENT`:**
  - `TRANSFER` exige `destinationAccountId !== accountId`, omite `categoryId` e requer ao menos 2 contas ativas; oculte e bloqueie exclusão (`TRANSACTION_CANNOT_DELETE_TRANSFER`).
  - `ADJUSTMENT` usa categoria técnica do backend, exige `direction` (`INCREASE`/`DECREASE`) e `description` obrigatória (até 500 caracteres) no modo manual e na edição, e omite `categoryId` na listagem/filtros.
  - Anexos são permitidos apenas para `INCOME` e `EXPENSE`.
- **API pública (`src/features/transactions/index.ts`):** mantenha `BalanceAdjustmentSheet`, `BalanceAdjustmentSheetState` e `BalanceAdjustmentMode` expostos exclusivamente por esse barrel para consumo em `accounts`.
- **Separação entre edição e confirmação:** `PATCH /transactions/:id` envia apenas campos alterados (diff-only) e **nunca** altera `status`; somente `PATCH /transactions/:id/confirm` efetiva lançamentos `PENDING`.
- **Filtros em URL e deep links:** estado de tela (`period`, `view`, `page`, `limit`, `q`, `accountId`, `categoryId`, `status`, `dateFrom`, `dateTo`) é gerenciado via `transactionUrl.utils.ts`. Consultas de pendências do Dashboard (`usePendingTransactionRange`) não devem restringir `dateFrom`/`dateTo` para incluir pendências passadas e futuras.
- **Anexos e cache de presigned URLs:** respeite os limites (`3` arquivos, `5 MB`, PNG/JPEG/WebP), `staleTime: 240_000` (menor que o TTL de 300s do R2), reordenação dual (drag-and-drop + menu acessível `Mover para esquerda/direita`) com rollback otimista, e em criação faça upload pós-criação fechando o formulário se o upload falhar para evitar duplicar o lançamento.
- **Invalidação de cache:** toda mutação de transação (`create`, `update`, `confirm`, `delete`) invalida `['transactions']` **e** `ACCOUNT_QUERY_KEYS.accounts` (`['accounts']`).
- **Sincronização documental:** toda mudança em fluxos, filtros de URL, endpoints, anexos ou invariantes exige atualização de `docs/transactions/` e deste `AGENTS.md` na mesma entrega.
