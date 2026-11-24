---
area: transactions
type: index
status: current
last_reviewed: 2026-11-24
related:
  - ../README.md
  - ../architecture/module-boundaries.md
  - ./concepts/transaction-model-and-types.md
  - ./concepts/transaction-attachments-model.md
  - ./flows/list-filter-and-kpis.md
  - ./flows/dashboard-pending-navigation.md
  - ./flows/create-edit-and-transfer.md
  - ./flows/confirm-and-delete-transaction.md
  - ./flows/manage-attachments.md
  - ./decisions/pending-range-includes-future.md
  - ./decisions/lazy-attachment-fetching-and-cache.md
  - ./decisions/dual-reordering-drag-and-accessible-menu.md
  - ./decisions/transfer-cannot-be-deleted.md
  - ./components/transaction-screen-components.md
  - ./components/attachment-gallery-and-viewer.md
  - ./reference/api-and-contracts.md
---

# Módulo `transactions`

O módulo `transactions` é o núcleo operacional financeiro do frontend da Danfy em `/transactions`, cobrindo lançamentos (`INCOME`, `EXPENSE`, `TRANSFER`, `ADJUSTMENT`), filtros persistidos na URL, KPIs por visão, agrupamento por dia, confirmação de pendências, exclusão de lançamentos comuns, deep links vindos do Dashboard e gestão completa de anexos/comprovantes (upload, staging, reordenação e lightbox com zoom).

Todo o código proprietário reside em `src/features/transactions/`, com instruções locais em `src/features/transactions/AGENTS.md`.

## Mapa da Documentação

### Conceitos (`concepts/`)
- [Modelo de Transação, Tipos, Status, Centavos e `DateOnly`](./concepts/transaction-model-and-types.md) — `INCOME`/`EXPENSE`/`TRANSFER`/`ADJUSTMENT`, status `PENDING`/`EFFECTIVE`/`OVERDUE`, `amountCents > 0` e contrato temporal civil.
- [Modelo de Anexos e Comprovantes](./concepts/transaction-attachments-model.md) — Elegibilidade por tipo, limites técnicos, presigned URLs (300s / `staleTime: 240s`) e staging na criação.

### Fluxos (`flows/`)
- [Listagem, Filtros em URL, KPIs e Agrupamento por Dia](./flows/list-filter-and-kpis.md) — Tela `/transactions`, `transactionUrl.utils.ts`, KPIs overview vs. tipo e deep link `?create=`.
- [Navegação das Pendências da Dashboard](./flows/dashboard-pending-navigation.md) — Consultas `usePendingTransactionRange` e deep link completo de pendências passadas e futuras.
- [Criar, Editar e Transferir Lançamentos](./flows/create-edit-and-transfer.md) — `TransactionFormSheet`, entrada cent-first, diff-only `PATCH` e regras de `TRANSFER`.
- [Confirmar Pendência e Excluir Transação](./flows/confirm-and-delete-transaction.md) — `TransactionConfirmSheet`, `TransactionDeleteDialog` e bloqueio de exclusão para `TRANSFER`.
- [Gerenciamento de Anexos e Comprovantes](./flows/manage-attachments.md) — Galeria, upload (criação/edição/detalhes), reordenação dual e visualizador fullscreen.

### Decisões (`decisions/`)
- [DEC-TRX-001 (superseded) — Intervalo explícito nos links de pendências até hoje](./decisions/pending-deep-link-date-range.md) — Substituída por `DEC-TRX-002`.
- [DEC-TRX-002 — Intervalo completo das pendências da dashboard inclui futuro](./decisions/pending-range-includes-future.md) — Consultas `sort=date:asc` e `sort=date:desc` sem limite de data.
- [DEC-TRX-003 — Busca sob demanda e retenção de cache de anexos (`240s`)](./decisions/lazy-attachment-fetching-and-cache.md) — `attachmentsCount` na listagem e cache alinhado ao TTL das presigned URLs.
- [DEC-TRX-004 — Reordenação dual de anexos (Drag-and-Drop + Menu Acessível)](./decisions/dual-reordering-drag-and-accessible-menu.md) — Acessibilidade WCAG 2.2 AA com update otimista e rollback.
- [DEC-TRX-005 — Transferências não podem ser excluídas e não aceitam anexos](./decisions/transfer-cannot-be-deleted.md) — Proteção na UI espelhando o domínio do backend.

### Componentes (`components/`)
- [Componentes da Tela e Formulários de Transações](./components/transaction-screen-components.md) — Árvore Atomic Design, estado de URL/Query/RHF e dependências cross-feature.
- [Galeria de Anexos, Staging e Lightbox](./components/attachment-gallery-and-viewer.md) — Composição da galeria viva, staging de criação e visualizador com zoom/pan.

### Referência (`reference/`)
- [API, Rotas, Query Keys, Erros e Gaps](./reference/api-and-contracts.md) — Matriz completa dos 10 endpoints próprios + endpoints cross-feature, códigos de erro e gaps observados no código.

## Fronteiras e Dependências

- **Código proprietário:** `src/features/transactions/`
- **API pública:** sem `index.ts` dedicado atualmente (`DT-03` em [module-boundaries.md](../architecture/module-boundaries.md)).
- **Dependências de entrada:** `api` e `AuthAppShell` de `auth` (`DT-01`, `DT-02`); `useAccounts`, `useAccountSummary`, `ACCOUNT_QUERY_KEYS`, `AccountIdentity` e `Account` de `accounts`; `useCategories`, `Category` e utilitários visuais de `categories`.
- **Consumidores cross-feature:** `DashboardPage` (em `auth`) e `AccountCard` (em `accounts`).

## Estado Atual de Implementação

### Implementado e Documentado
- [x] Listagem paginada com filtros sincronizados na URL, agrupamento por dia (`dd/MM/yyyy`), tabela desktop e cards mobile.
- [x] KPIs adaptativos (`transaction_summary.overview` com 4 cards; `transaction_summary.type` com 3 cards) e trilha com scroll horizontal responsivo.
- [x] Criação e edição (`INCOME`, `EXPENSE`, `TRANSFER`), confirmação de `PENDING` e exclusão de lançamentos elegíveis com invalidação conjunta de `transactions` e `accounts`.
- [x] Galeria de anexos em detalhes e edição, staging em criação, reordenação otimista dual e lightbox com zoom/pan/teclado.

### Gaps Conhecidos / Pendente
- [ ] `TransactionAttachmentsGallery` usa `enabled: isEligible` em vez de condicionar também a `attachmentsCount > 0` em detalhes, e ainda não exibe `ApiErrorAlert` para falhas da query de listagem de anexos.
- [ ] Exclusão de anexo no menu `...` executa imediatamente sem modal de confirmação prévia.
- [ ] `useTransaction(id)` está exportado em `api/queries.ts` sem consumidor ativo na UI; `TransactionsPage` passa `isMutating = false` fixo para `TransactionsTable`.
- [ ] Não há `index.ts` público em `src/features/transactions/` (`DT-03`).
