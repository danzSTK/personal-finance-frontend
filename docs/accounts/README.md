---
area: accounts
type: index
status: current
last_reviewed: 2026-11-25
related:
  - ../README.md
  - ../architecture/module-boundaries.md
  - ./concepts/account-and-template-model.md
  - ./concepts/balance-and-period-summary.md
  - ./flows/list-and-filter-accounts.md
  - ./flows/create-and-update-account.md
  - ./flows/account-detail-and-summary.md
  - ./flows/archive-and-default-account.md
  - ./decisions/account-template-is-the-visual-source.md
  - ./decisions/create-starts-with-identity.md
  - ./decisions/account-detail-summary-is-lazy.md
  - ./components/account-components.md
  - ./reference/api-and-contracts.md
---

# Módulo `accounts`

O módulo `accounts` governa a gestão de contas financeiras em `/accounts`: catálogo de templates visuais (institucionais e personalizados), criação/edição em duas etapas, saldo consolidado com filtro de período (`DateOnly`), detalhe responsivo com resumo financeiro lazy por período, arquivamento/restauração e definição de conta padrão.

Todo o código proprietário reside em `src/features/accounts/`, com instruções locais em `src/features/accounts/AGENTS.md`.

## Mapa da Documentação

### Conceitos (`concepts/`)
- [Modelo de Conta e Template Visual](./concepts/account-and-template-model.md) — Agregados `Account` e `AccountTemplate` (`INSTITUTIONAL` vs. `CUSTOM`), resolução visual e compatibilidade `DB-COMPAT-002`.
- [Saldo Derivado, `initialBalanceCents` e Filtro de Período](./concepts/balance-and-period-summary.md) — Saldo atual vs. projetado (`projectedUntil` em `DateOnly`), resumo global e resumo efetivado por conta.

### Fluxos (`flows/`)
- [Listagem, Provisionamento Inicial e Filtro de Período](./flows/list-and-filter-accounts.md) — Carregamento de `/accounts`, retentativas de provisionamento da conta padrão, toggle de arquivadas e seletor de mês/ano.
- [Criar e Atualizar Conta por Template](./flows/create-and-update-account.md) — Fluxo em duas etapas (`AccountTemplatePicker` → `AccountFormSheet`), edição institucional vs. customizada e recuperação de erros.
- [Detalhe da Conta e Resumo Lazy por Período](./flows/account-detail-and-summary.md) — Sheet mobile / Dialog desktop, consulta lazy em `GET /transactions` (`limit=1`, `overview`) e deep links para `/transactions`.
- [Arquivar, Restaurar e Definir Conta Padrão](./flows/archive-and-default-account.md) — Regras de elegibilidade, confirmação de arquivamento e mutações imediatas.

### Decisões (`decisions/`)
- [DEC-001 — `account.template` é a fonte visual primária da conta](./decisions/account-template-is-the-visual-source.md) — Prioridade de `template`, consumo direto de `logoUrl` e tokens estáticos em `src/index.css`.
- [DEC-002 — Criação começa pela identidade da conta](./decisions/create-starts-with-identity.md) — Escolha entre template institucional e personalizada antes dos dados financeiros.
- [DEC-003 — Resumo financeiro no detalhe da conta é lazy](./decisions/account-detail-summary-is-lazy.md) — Consulta sob demanda apenas quando o detalhe abre, alimentando receitas/despesas em um único request.

### Componentes (`components/`)
- [Arquitetura de Componentes de Contas](./components/account-components.md) — Árvore Atomic Design, donos de estado, schema Zod, API pública (`index.ts`) e dependências `shared` e cross-feature.

### Referência (`reference/`)
- [API, Rotas, Query Keys, Erros e Gaps](./reference/api-and-contracts.md) — Matriz completa de endpoints, códigos de erro mapeados e divergências/gaps observados no código.

## Fronteiras e Dependências

- **Código proprietário:** `src/features/accounts/`
- **API pública (`src/features/accounts/index.ts`):** exporta `AccountIdentity` e os tipos `Account`, `AccountTemplate` e `AccountTemplateInput`.
- **Consumidores cross-feature atuais:** `DashboardPage` (`useAccountSummary`), `TransactionsPage` (`useAccounts`, `useAccountSummary`), `transactions/api/mutations.ts` (`ACCOUNT_QUERY_KEYS.accounts`) e sheets de transações (`AccountIdentity` e tipo `Account`).
- **Dependências de entrada:** `api` (`DT-01`), `AuthAppShell` (`DT-02`), `BalanceAdjustmentSheet` e `BalanceAdjustmentSheetState` via `@/features/transactions`, e `useTransactions` + `buildTransactionsUrl` de `transactions` (`DT-03`).

## Estado Atual de Implementação

### Implementado e Documentado
- [x] Listagem de contas com provisionamento automático da conta inicial (até 4 tentativas a cada 1800ms) e filtro de arquivadas.
- [x] Filtro de período mensal com `MonthYearPicker` e cards de `Saldo atual` / `Saldo previsto` (ou `Saldo no fim de <mês> de <ano>`).
- [x] Criação em duas etapas (template institucional ou personalizada) e edição preservando classe visual e `initialBalanceCents` somente leitura.
- [x] Detalhe responsivo (bottom Sheet mobile / Dialog desktop) com resumo lazy de receitas/despesas efetivadas e deep links para `/transactions`.
- [x] Arquivamento com confirmação, restauração e troca de conta padrão.
- [x] Reajuste de saldo (`Reajustar saldo`) no menu `...` e no detalhe de contas ativas via `BalanceAdjustmentSheet` (`@/features/transactions`), bloqueado/oculto para contas arquivadas.

### Gaps Conhecidos / Pendente
- [ ] `AccountsPage` ainda mantém `selectedPeriod` e `includeArchived` apenas em `useState` (sem sincronização com a URL query string).
- [ ] `DELETE /accounts/:id` não é suportado pelo módulo.
- [ ] `accountPeriod.utils.ts` duplica helpers já existentes em `src/shared/utils/dateOnly.ts` (`getCurrentYearMonth`, `getMonthStartDateOnly`, `getMonthEndDateOnly`).
