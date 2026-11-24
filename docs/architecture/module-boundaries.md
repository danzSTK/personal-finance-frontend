---
area: architecture
type: reference
status: current
last_reviewed: 2026-11-24
related:
  - ../README.md
  - ./api-error-handling.md
  - ../accounts/README.md
  - ../auth/README.md
  - ../categories/README.md
  - ../transactions/README.md
---

# Limites entre Módulos (Module Boundaries)

Este documento define as fronteiras, regras de dependência e dívidas técnicas registradas entre `src/app/`, `src/shared/` e os módulos de domínio em `src/features/` no frontend da Danfy.

## 1. Camadas e Direção de Dependência

```mermaid
flowchart TD
  App[src/app — providers e rotas] --> Features[src/features/<modulo> — domínios de produto]
  Features --> Shared[src/shared — UI, erros, config, utils e tipos genéricos]
```

1. **`src/app/`** compõe providers globais (`QueryProvider`) e rotas (`src/app/routes/index.tsx`). Pode importar páginas, layouts e bootstrap de `src/features/*` e utilitários de `src/shared/`.
2. **`src/features/<modulo>/`** encapsula cada domínio do produto (`accounts`, `auth`, `categories`, `transactions`).
   - Cada módulo possui `api/`, `components/` (Atomic Design), `constants/`, `schemas/`, `types/`, `utils/` (e `stores/`/`hooks/` quando necessários) + seu `AGENTS.md` local.
   - Regras de negócio, queries, mutations, schemas e helpers internos devem permanecer privados ao módulo.
3. **`src/shared/`** fornece infraestrutura transversal sem conhecimento de regras específicas de domínio:
   - `components/{atoms,molecules,organisms,ui}` (primitivos Shadcn/UI, `CurrencyInput`, `DateOnlyPicker`, `MonthYearPicker`, `ApiErrorAlert`, `ExpandableSearch`, `Toaster`),
   - `errors/` (catálogo `apiErrorCodes.ts`, parser, resolvedor, `applyApiFieldErrors`, `showApiErrorToast`),
   - `utils/` (`dateOnly.ts`, `formatters.ts`, `masks.ts`),
   - `config/` (`brand.ts`, `env.ts`), `hooks/` e `types/`.
   - **Regra alvo:** `src/shared/` **não deve importar** de `src/features/*` nem de `src/app/`.
4. **Comunicação cross-feature:**
   - Um módulo só deve importar de outro módulo através de sua **API pública (`src/features/<modulo>/index.ts`)** (ex.: tipos de contrato, hooks de leitura públicos ou componentes explicitamente compartilhados como `AccountIdentity`).
   - Evitar introduzir novos ciclos bidirecionais entre features.
   - Nunca importar stores privadas, formulários internos ou helpers one-off de outro módulo.

## 2. Exceções Pragmáticas Toleradas

1. **Composição de leituras entre domínios financeiros em telas compostas:**
   - `TransactionsPage` e sheets de transações consomem listas ativas de contas (`accounts`) e categorias (`categories`) para seletores e exibição de identidade visual.
   - `AccountsPage` consulta transações recentes da conta selecionada e constrói deep links para `/transactions`.
   - *Direção desejada:* consumir apenas contratos públicos exportados via `index.ts` de cada módulo, sem alcançar internos.
2. **Constantes de rotas e deep links em navegação:**
   - Links entre telas (`DashboardPage` → `/transactions?status=PENDING...`, `AccountsPage` → `/transactions?accountId=...`, `MobileQuickActions` → `/categories?create=EXPENSE`) precisam de contratos de URL estáveis compartilhados.

## 3. Dívidas Técnicas Registradas (Estado Atual do Código)

Os acoplamentos abaixo existem hoje no código-fonte e estão registrados explicitamente para orientar futuras refatorações controladas sem ampliar o problema:

### DT-01 — Inversão de dependência `shared -> auth` em `axios.ts`
- **Onde ocorre:** `src/shared/config/axios.ts` importa e re-exporta `api` de `@/features/auth/api/auth.api`. Além disso, `accounts`, `categories` e `transactions` importam diretamente `@/features/auth/api/auth.api`.
- **Por que é dívida:** O cliente HTTP base é infraestrutura compartilhada; acoplar todos os módulos e `shared` ao interno de `auth` cria dependência radial em `auth`.
- **Direção futura:** Mover a criação da instância Axios base para `src/shared/config/axios.ts` e registrar interceptors de refresh/sessão via hook/registrador no bootstrap de `src/app/` ou `auth`.

### DT-02 — Sobrecarga de responsabilidades no módulo `auth`
- **Onde ocorre:** `src/features/auth/` hospeda, além de autenticação/sessões/providers/verificação/senha:
  - Perfil e avatar do recurso `users` (`AccountProfileForm`, `Avatar*Dialog`, `SettingsAccountPage`),
  - Shell autenticado global (`AuthAppShell`) e rotas globais (`AUTH_ROUTES`),
  - O **Dashboard** (`DashboardPage.tsx`, `dashboardTransactions.utils.ts`), o que cria ciclos `auth <-> accounts` e `auth <-> transactions`.
- **Por que é dívida:** Mistura segurança/identidade com layout global da aplicação e agregação financeira do dashboard.
- **Direção futura:** Extrair shell/rotas globais para `src/app/` ou `src/shared/` e promover `dashboard` (e eventualmente `users`/`settings`) para módulos próprios quando houver ciclo de refatoração dedicado.

### DT-03 — Ausência de API pública (`index.ts`) em `auth`, `categories` e `transactions`
- **Onde ocorre:** Apenas `src/features/accounts/index.ts` existe atualmente (exportando `AccountIdentity` e tipos `Account*`). Mesmo assim, `transactions` e `auth` ainda importam caminhos internos como `@/features/accounts/api/queries`, `@/features/categories/api/queries`, `@/features/categories/utils/category.utils`, `@/features/transactions/api/queries` e `@/features/transactions/utils/transactionUrl.utils`.
- **Direção futura:** Criar `index.ts` enxutos nos módulos com apenas as APIs públicas intencionais e migrar imports cross-feature para consumir exclusivamente esses entrypoints.

### DT-04 — Páginas dentro de `components/templates/` em `auth`
- **Onde ocorre:** `DashboardPage.tsx`, `LoginPage.tsx`, `AuthCallbackPage.tsx` e `LinkProviderCallbackPage.tsx` vivem em `src/features/auth/components/templates/` em vez de `components/pages/`.
- **Por que é dívida:** Contraria a regra de Atomic Design do repositório (`templates` definem apenas layout/slots sem data fetching ou orquestração de rota).
- **Direção futura:** Mover esses arquivos para `components/pages/` (ou para o módulo `dashboard` no caso de `DashboardPage`) atualizando `src/app/routes/index.tsx`.

### DT-05 — Invalidação cross-feature ausente em `useDeleteCategoryWithMerge`
- **Onde ocorre:** `src/features/categories/api/mutations.ts` (`useDeleteCategoryWithMerge`) invalida apenas `['categories']` e não invalida `['transactions']`, mesmo quando transações tiveram seu `categoryId` migrado no backend.
- **Direção futura:** Invalidar a query key pública de transações (via constante/contrato público) após conclusão de merge com exclusão.
