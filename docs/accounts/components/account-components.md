---
area: accounts
type: component
status: current
related:
  - ../README.md
  - ../flows/list-and-filter-accounts.md
  - ../flows/create-and-update-account.md
  - ../flows/account-detail-and-summary.md
  - ../reference/api-and-contracts.md
---

# Arquitetura de Componentes de Contas

## Árvore por Atomic Design (`src/features/accounts/components/`)

- **Pages:**
  - `AccountsPage`: composição de `/accounts`, seletor de período, toggle de arquivadas, provisionamento inicial, cards de resumo, grade de contas e `AlertDialog` de arquivamento.
- **Organisms:**
  - `AccountCard`: exibe identidade, saldos, `AccountActionsMenu` e o painel de detalhe responsivo (`AccountDetailsPanel` em bottom `Sheet` mobile / `Dialog` desktop) com consulta lazy de resumo do período.
  - `AccountFormSheet`: orquestra etapas `picker` ↔ `form` com transição `200ms`, foco gerenciado, React Hook Form + Zod (`accountFormSchema`) e `useCreateAccount`/`useUpdateAccount`.
  - `AccountTemplatePicker`: consome `useAccountTemplates({ enabled })` e renderiza catálogo rolável + opção fixa `Criar personalizada`.
  - `CustomAccountIdentityFields`: seletores controlados de cor (5 inline + overflow) e ícone (5 inline + overflow), sem chamadas de API.
  - `AccountsEmptyState`, `AccountsErrorState`, `AccountsProvisioningState`, `AccountsSkeleton`: estados dedicados da grade.
- **Molecules:**
  - `AccountIdentity` (**API pública em `index.ts`**): resolve logo/ícone + tom com fallback local `logoFailed` em `onError`.
  - `AccountFormIdentityHeader`, `AccountFormField`, `AccountSummaryCard`, `AccountTemplateOption`, `AddAccountButton`, `CreateAccountCard`.
  - `AccountStatusPill`: presente no repositório, **sem consumidor ativo** atualmente.
- **Atoms / Templates:** sem átomos/templates próprios; consome `AuthAppShell` e primitivos de `src/shared/`.

## Donos de Estado, Dados e Side Effects

- **Server state (TanStack Query):**
  - `AccountsPage`: `useAccounts`, `useAccountSummary`, `useArchiveAccount`, `useUnarchiveAccount`, `useSetDefaultAccount`.
  - `AccountCard`: `useTransactions` (lazy, `enabled: isDetailsOpen`).
  - `AccountTemplatePicker`: `useAccountTemplates` (`enabled: state?.mode === 'create'`).
  - `AccountFormSheet`: `useCreateAccount`, `useUpdateAccount`.
- **Formulário e validação (`src/features/accounts/schemas/account.schema.ts`):** `accountFormSchema` (`mode: 'onChange'`, `superRefine` exigindo `templateId` em criação institucional; `name` 3–255; `initialBalanceCents` inteiro `>= 0`). Os schemas auxiliares `createInstitutionalAccountSchema`, `createCustomAccountSchema` e `updateAccountSchema` existem exportados, mas não são usados por `AccountFormSheet`.
- **Estado local:** `includeArchived`, `selectedPeriod`, `sheetState`, `archiveTarget`, `defaultProvisionAttempts` em `AccountsPage`; `isDetailsOpen` em `AccountCard`; `step`, `selectedTemplate` em `AccountFormSheet`; `logoFailed` em `AccountIdentity` e `AccountTemplateOption`.

## API Pública e Dependências

- **API pública (`src/features/accounts/index.ts`):** exporta `AccountIdentity` e os tipos `Account`, `AccountTemplate`, `AccountTemplateInput`.
- **Shared (`src/shared/`):** `CurrencyInput`, `ApiErrorAlert`, `MonthYearPicker`, `useIsMobile`, `use-toast`, `dateOnly`, `formatCurrencyFromCents`, `src/shared/errors/*`, primitivos `ui/*` e variáveis `--account-*` / `.account-detail-gradient` em `src/index.css`.
- **Cross-feature:**
  - Consome `api` e `AuthAppShell` de `auth` (`DT-01`, `DT-02`) e `useTransactions` + `buildTransactionsUrl` de `transactions` (`DT-03`).
  - Consumido por `DashboardPage` (`useAccountSummary`), `TransactionsPage` (`useAccounts`, `useAccountSummary`), `transactions/api/mutations.ts` (`ACCOUNT_QUERY_KEYS.accounts`) e formulários/detalhes de transações (`AccountIdentity`, `Account`).
