---
area: accounts
type: reference
status: current
last_reviewed: 2026-11-24
related:
  - ../README.md
  - ../flows/list-and-filter-accounts.md
  - ../flows/create-and-update-account.md
  - ../flows/account-detail-and-summary.md
  - ../flows/archive-and-default-account.md
  - ../../architecture/api-error-handling.md
---

# Referência — API, Rotas, Erros e Gaps de `accounts`

## Rotas Frontend

| Rota | Guard | Estado em URL | Observação |
| --- | --- | --- | --- |
| `/accounts` | `PrivateRoute` | Nenhum no momento (`selectedPeriod` e `includeArchived` em `useState`) | Título `Danfy Finance \| Contas` |

## Endpoints Consumidos e Query Keys

| Operação | Hook | Query Key (`ACCOUNT_QUERY_KEYS`) | Cache / Invalidação |
| --- | --- | --- | --- |
| `GET /accounts` | `useAccounts(params)` | `['accounts', { includeArchived, projectedUntil }]` | `staleTime: 30_000`, `retry < 2` |
| `GET /accounts/summary` | `useAccountSummary(params)` | `['accounts', 'summary', params]` | `staleTime: 30_000`, `retry < 2` |
| `GET /account-templates` | `useAccountTemplates({ enabled })` | `['account-templates']` | `staleTime: 300_000` (5m), `retry < 2` |
| `GET /transactions` *(cross-feature)* | `useTransactions(params, { enabled: isDetailsOpen })` | `['transactions', 'list', params]` | Lazy ao abrir detalhe da conta (`limit=1`, `status=EFFECTIVE`) |
| `POST /accounts` | `useCreateAccount()` | — | Invalida `['accounts']` (`exact: false`) |
| `PATCH /accounts/:id` | `useUpdateAccount()` | — | Invalida `['accounts']` (`exact: false`) |
| `PATCH /accounts/:id/archive` | `useArchiveAccount()` | — | Invalida `['accounts']` (`exact: false`) |
| `PATCH /accounts/:id/unarchive` | `useUnarchiveAccount()` | — | Invalida `['accounts']` (`exact: false`) |
| `PATCH /accounts/:id/default` | `useSetDefaultAccount()` | — | Invalida `['accounts']` (`exact: false`) |

## Códigos de Erro Mapeados (`src/shared/errors/`)

- **Específicos de `accounts` (15):** `ACCOUNT_ALREADY_DEFAULT`, `ACCOUNT_ARCHIVED`, `ACCOUNT_ARCHIVED_MUTATION`, `ACCOUNT_CANNOT_BE_ARCHIVED`, `ACCOUNT_CANNOT_BE_DEFAULT`, `ACCOUNT_HAS_SCHEDULED_TRANSACTIONS`, `ACCOUNT_MUST_REMAIN_ACTIVE`, `ACCOUNT_NOT_ARCHIVED`, `ACCOUNT_NOT_FOUND`, `ACCOUNT_TEMPLATE_NOT_FOUND`, `ACCOUNT_TEMPLATE_INPUT_CONFLICT`, `ACCOUNT_UPDATE_EMPTY`, `INVALID_ACCOUNT`, `INVALID_ACCOUNT_TEMPLATE`, `INVALID_ACCOUNT_NAME`.
- **Contextos em `resolveApiError.ts`:** `accounts.list`, `accounts.summary`, `accounts.templates`, `accounts.create`, `accounts.update`, `accounts.archive`, `accounts.unarchive`, `accounts.set-default` (além de `transactions.list` no detalhe).

## Fontes de Integração no Backend

- `personal-finance-backend:docs/integrations/accounts/README.md`
- `personal-finance-backend:docs/integrations/accounts/list-accounts.md`
- `personal-finance-backend:docs/integrations/accounts/get-account-summary.md`
- `personal-finance-backend:docs/integrations/accounts/list-account-templates.md`
- `personal-finance-backend:docs/integrations/accounts/create-account.md`
- `personal-finance-backend:docs/integrations/accounts/update-account.md`
- `personal-finance-backend:docs/integrations/accounts/archive-account.md`
- `personal-finance-backend:docs/integrations/accounts/unarchive-account.md`
- `personal-finance-backend:docs/integrations/accounts/set-default-account.md`
- `personal-finance-backend:docs/integrations/transactions/list-transactions.md`

## Gaps e Divergências Observadas no Código

1. **Período e arquivadas fora da URL:** `AccountsPage` guarda `selectedPeriod` e `includeArchived` em `useState` local, sem persistência na query string.
2. **Duplicação de utilitários de data:** `accountPeriod.utils.ts` duplica `getCurrentYearMonth`, `getMonthStartDateOnly` e `getMonthEndDateOnly` de `src/shared/utils/dateOnly.ts`, e `AccountsPage` define `shiftAccountPeriod` local em vez de usar `shiftYearMonth`.
3. **Placeholders desabilitados:** `Reajustar saldo` / `Reajuste de saldo` estão renderizados desabilitados sem endpoint integrado.
4. **Símbolos não utilizados:** `AccountStatusPill.tsx`, `USER_CREATABLE_ACCOUNT_TYPES`, `mergeAccountIconMetadata`, `createInstitutionalAccountSchema`, `createCustomAccountSchema` e `updateAccountSchema`.
5. **Divergência histórica de spec:** a spec histórica `account-sheet-metadata-cents` mencionava reusar `GET /categories/metadata` e toggle `isDefault` na criação; o código vigente usa `GET /account-templates` + constantes locais e não oferece toggle `isDefault` no `AccountFormSheet`.
