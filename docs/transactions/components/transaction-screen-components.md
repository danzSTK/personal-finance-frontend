---
area: transactions
type: component
status: current
last_reviewed: 2026-11-27
related:
  - ../README.md
  - ../flows/list-filter-and-kpis.md
  - ../flows/dashboard-pending-navigation.md
  - ../flows/create-edit-and-transfer.md
  - ../flows/confirm-and-delete-transaction.md
  - ../decisions/pending-range-includes-future.md
  - ./attachment-gallery-and-viewer.md
  - ../reference/api-and-contracts.md
  - ../../fiscal-notes/components/surfaces-and-api.md
---

# Componentes da Tela e Formulários de Transações

Este documento detalha a composição dos componentes de `/transactions`, o ownership de estado (URL, TanStack Query e React Hook Form) e a integração com a Dashboard.

## Árvore de Componentes (Atomic Design)

```text
DashboardPage (src/features/auth/components/pages/DashboardPage.tsx)
└── PendingAlertsGrid
    └── PendingAlertCard
        └── Link -> /transactions (montado por buildPendingDashboardTransactionsUrl)

TransactionsPage (pages/TransactionsPage.tsx)
├── AuthAppShell (cross-feature: auth)
├── Header & Toolbar
│   ├── View tabs / filtro rápido de visão (ALL | INCOME | EXPENSE | TRANSFER | ADJUSTMENT)
│   ├── Busca textual (com debounce local) + filtro de período/status/conta/categoria
│   ├── Botão "Ler NFC-e" (desktop nas visões ALL/EXPENSE e item no menu mobile "...")
│   └── TransactionCreateButton (molecules/)
├── TransactionsKpiGrid (organisms/)
│   └── KpiScrollTrack
│       └── TransactionKpiCard (molecules/) × 3 ou 4
├── Conteúdo Principal
│   ├── TransactionsSkeleton (organisms/)         [loading]
│   ├── TransactionsErrorState (organisms/)       [erro de query -> ApiErrorAlert + retry]
│   ├── TransactionsEmptyState (organisms/)       [vazio -> limpar filtros ou criar]
│   └── TransactionsTable (organisms/)            [dados]
│       ├── TransactionDayDivider                 [agrupamento por DateOnly dd/MM/yyyy]
│       ├── TransactionRow (desktop)
│       │   ├── TransactionCategory
│       │   ├── TransactionStatusPill (molecules/)
│       │   ├── TransactionAttachmentBadge (atoms/)
│       │   ├── FiscalNoteBadge (cross-feature: fiscal-notes)
│       │   └── TransactionActionsMenu            [inclui "Vincular NFC-e" se EXPENSE sem nota]
│       └── TransactionMobileItem (mobile)
│           ├── TransactionStatusPill (molecules/)
│           ├── TransactionAttachmentBadge (atoms/)
│           ├── FiscalNoteBadge (cross-feature: fiscal-notes)
│           └── TransactionActionsMenu
├── Sheets & Dialogs
│   ├── TransactionFiltersSheet (organisms/)
│   ├── TransactionDetailsSheet (organisms/)
│   │   ├── TransactionAttachmentsGallery (organisms/)
│   │   └── Seção Nota fiscal [EXPENSE]: FiscalNoteSummaryCard (fiscal-notes) ou CTA "Vincular NFC-e"
│   ├── TransactionFormSheet (organisms/)
│   │   ├── Banner "Importar via NFC-e" [create + EXPENSE]
│   │   ├── TransactionTypeSelect (molecules/)
│   │   ├── TransactionStagedAttachmentsField (organisms/)   [modo create]
│   │   └── TransactionAttachmentsGallery (organisms/)       [modo edit]
│   ├── BalanceAdjustmentSheet (organisms/)
│   ├── TransactionConfirmSheet (organisms/)
│   ├── TransactionDeleteDialog (organisms/)
│   ├── FiscalNoteReaderSheet (cross-feature: fiscal-notes)  [slot renderAttachmentsField + onAfterImport + onOpenExistingTransaction]
│   ├── FiscalNoteDetailsSheet (cross-feature: fiscal-notes)
│   └── FiscalNoteUnlinkDialog (cross-feature: fiscal-notes)
```

## Responsabilidades Principais

### Páginas e Containers
- **`TransactionsPage` (`pages/TransactionsPage.tsx`):** dona da leitura/escrita da query string via `transactionUrl.utils.ts` (incluindo `?create=FISCAL_NOTE`), do estado local dos modais/sheets abertos (`selectedTransaction`, modo `create`/`edit`, sheet de confirmação, diálogo de exclusão, sheet de filtros, `FiscalNoteReaderSheet`, `FiscalNoteDetailsSheet`, `FiscalNoteUnlinkDialog` e `stagedFiscalNoteAttachments`) e da orquestração das queries `useTransactions`, `useAccounts`, `useAccountSummary` e `useCategories` (receitas e despesas), além da busca imperativa `getTransactionById` ao abrir despesa duplicada de NFC-e.
- **`DashboardPage` (`src/features/auth/components/pages/DashboardPage.tsx`):** consome `usePendingTransactionRange` para receitas e despesas e constrói os deep links de pendências via `buildPendingDashboardTransactionsUrl`.

### Organismos de Listagem e Estado
- **`TransactionsKpiGrid` (`organisms/TransactionsKpiGrid.tsx`):** renderiza 4 cards para `overview` e 3 cards para visão filtrada por tipo (`INCOME`, `EXPENSE`, `TRANSFER`, `ADJUSTMENT`), usando `KpiScrollTrack` para rolagem horizontal responsiva.
- **`TransactionsTable` (`organisms/TransactionsTable.tsx`):** agrupa itens por data civil (`TransactionDayDivider`), alterna layout de tabela (`TransactionRow`) e cartões móveis (`TransactionMobileItem`), exibe `FiscalNoteBadge` quando `transaction.hasFiscalNote` é verdadeiro e hospeda o menu contextual (`TransactionActionsMenu`) com proteção contra exclusão de `TRANSFER` e ação *"Vincular NFC-e"* para `EXPENSE` sem nota.
- **`TransactionsEmptyState` (`organisms/TransactionsStatePanels.tsx`):** contêiner limpo sem borda nem fundo tonal decorativo; aplica a cor semântica do tipo apenas no ícone contextual e nas ações (`Limpar filtros` ou `Nova transação`).
- **`TransactionsErrorState` (`organisms/TransactionsStatePanels.tsx`):** separado do estado vazio; exibe `ApiErrorAlert` com botão de retry.
- **`TransactionsSkeleton` (`organisms/TransactionsSkeleton.tsx`):** placeholders alinhados ao layout da tabela e KPIs durante carregamento inicial.

### Organismos de Ação e Formulário
- **`TransactionFiltersSheet` (`organisms/TransactionFiltersSheet.tsx`):** filtros secundários (período, conta, categoria, status, ordenação) sincronizados com a URL ao aplicar.
- **`TransactionFormSheet` (`organisms/TransactionFormSheet.tsx`):** cadastro e edição validados por `transactionFormSchema` (`schemas/transaction.schema.ts`), com entrada monetária cent-first, atalho *"Importar via NFC-e"* na criação de `EXPENSE`, bloqueio de alteração de `type` quando `hasFiscalNote === true`, seleção condicional de conta destino (`TRANSFER`) ou categoria (`INCOME`/`EXPENSE`), payload diff-only em `PATCH` e integração com staging/galeria de anexos.
- **`TransactionDetailsSheet` (`organisms/TransactionDetailsSheet.tsx`):** leitura detalhada do lançamento (valores, contas, categoria, datas civil/efetivação, observações), galeria sob demanda de anexos, seção **Nota fiscal** para `EXPENSE` (`useTransactionFiscalNote` lazy + `FiscalNoteSummaryCard` ou CTA *"Vincular NFC-e"*) e atalhos para confirmar, editar ou excluir (quando elegível).
- **`TransactionConfirmSheet` (`organisms/TransactionConfirmSheet.tsx`):** efetivação de `PENDING` validada por `transactionConfirmSchema`, permitindo ajustar valor, data (`DateOnly`) e conta, e exibindo aviso quando `hasFiscalNote === true`.
- **`TransactionDeleteDialog` (`organisms/TransactionDeleteDialog.tsx`):** confirmação destrutiva para exclusão de lançamentos não-`TRANSFER`, exibindo aviso de remoção sincronizada da NFC-e quando `hasFiscalNote === true` e `ApiErrorAlert` em caso de falha.

### Moléculas
- **`TransactionCreateButton`:** gatilho principal de criação (aceita tipo inicial).
- **`TransactionKpiCard`:** card de indicador com valor formatado em `tabular-nums`, variação/legenda e cor semântica Danfy.
- **`TransactionStatusPill`:** badge semântico para `PENDING`, `EFFECTIVE` e `OVERDUE` (derivado visualmente de `PENDING` vencida).
- **`TransactionTypeSelect`:** seletor de tipo (`INCOME`, `EXPENSE`, `TRANSFER`) bloqueado durante edição.

## Ownership de Estado e Dependências

- **URL (`useSearchParams`):** fonte de verdade para `view`, `status`, `accountId`, `categoryId`, `search`, `dateFrom`, `dateTo`, `sort`, `page`, `limit` e gatilho `?create=`.
- **TanStack Query:** dono de todos os dados remotos (`useTransactions`, `usePendingTransactionRange`, `useTransactionAttachments` e mutações); não existe store Zustand em `transactions`.
- **React Hook Form + Zod:** estado transitório dos formulários `TransactionFormSheet` (`transactionFormSchema`) e `TransactionConfirmSheet` (`transactionConfirmSchema`).
- **Dependências cross-feature:**
  - `accounts`: `useAccounts`, `useAccountSummary`, `ACCOUNT_QUERY_KEYS`, `AccountIdentity`, `Account`.
  - `categories`: `useCategories`, `Category`, `CategoryIcon`, utilitários visuais.
  - `fiscal-notes` (exclusivamente via API pública `@/features/fiscal-notes`): `FiscalNoteBadge`, `FiscalNoteSummaryCard`, `FiscalNoteReaderSheet`, `FiscalNoteDetailsSheet`, `FiscalNoteUnlinkDialog`, `useTransactionFiscalNote`, `FISCAL_NOTES_QUERY_KEYS` e tipos `FiscalNote*`.
  - `auth`: `api` e `AuthAppShell` (`DT-01`, `DT-02`).

## Acessibilidade e Tokens

- Cor nunca comunica status ou estado vazio sozinha: `TransactionStatusPill` e `TransactionsEmptyState` combinam ícone, texto explícito e contraste adequado.
- Valores monetários nos KPIs e linhas da tabela utilizam `tabular-nums` para alinhamento vertical estável.
- Todos os tons derivam exclusivamente dos tokens Danfy Dark (`bg-surface`, `text-income`, `text-expense`, `text-warning`, etc.).
