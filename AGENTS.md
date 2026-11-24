# Personal Finance Frontend Instructions

## Project Context

This repository is the React + TypeScript frontend for **Danfy Finance** (personal finance workflows: `accounts`, `auth`, `categories`, and `transactions`). Build for trust, clarity, and efficiency: financial data must be easy to scan, actions must feel predictable, and errors must be explicit and recoverable.

## Stack

- Vite 8, React 18, TypeScript 5.
- React Router 6 for routing.
- TanStack Query for server state.
- Zustand for focused global client state.
- React Hook Form + Zod for forms and validation.
- Axios for HTTP (HttpOnly cookie session).
- Tailwind CSS v4, Shadcn/UI, Radix UI, CVA, and `cn()` for UI composition.
- Lucide React for icons.
- IMask / react-imask for input masks.
- Vitest + Testing Library for automated tests.

## Antes de Planejar, Editar ou Revisar

1. Identifique todos os módulos envolvidos na tarefa (`src/features/<modulo>/`, `src/shared/`, `src/app/`).
2. Leia o `AGENTS.md` local de cada módulo envolvido (`src/features/<modulo>/AGENTS.md` e `src/shared/AGENTS.md`) antes de propor alterações ou comentários de revisão.
3. Leia o índice do módulo em `docs/<modulo>/README.md` e apenas os documentos específicos relevantes à tarefa.
4. Se a mudança alcançar outro módulo ou fronteira, leia também `docs/architecture/module-boundaries.md` e repita o processo no módulo afetado.
5. Instruções locais complementam as regras globais; restrições globais de segurança, Atomic Design, tokens e contratos de erro nunca podem ser relaxadas por instruções locais.

## Leitura Direcionada por Pastas de Contexto (Just-in-Time Routing)

Para evitar sobrecarga de contexto, **nunca leia todas as documentações de uma vez**. Consulte apenas a pasta correspondente ao escopo da tarefa:

| Se a tarefa envolver... | Consulte primeiro | O que contém |
| --- | --- | --- |
| **Visão geral e mapa de docs** | `docs/README.md` | Índice global, taxonomia de `status`/`type` e links dos módulos |
| **Fronteiras entre módulos / imports** | `docs/architecture/module-boundaries.md` | Limites entre `app`, `shared` e `features`, API pública e dívidas técnicas |
| **Erros de API, retries ou alertas** | `docs/architecture/api-error-handling.md` | Contrato `code`, parser tipado, `ApiErrorAlert`, field errors e toasts |
| **Identidade visual, tokens ou UX** | `docs/design-system/danfy-finance-design-system.md` | Danfy Dark, semântica financeira, Apple HIG, WCAG 2.2 |
| **Componentes comuns e variantes M3** | `docs/design-system/material-3-reference.md` | Famílias Material 3, estados, espaçamento e mapeamento para Danfy |
| **Autenticação, sessão, perfil, settings, shell** | `src/features/auth/AGENTS.md` + `docs/auth/README.md` | Cookies HttpOnly, OAuth, verificação, providers, senha, perfil, shell |
| **Contas e templates visuais** | `src/features/accounts/AGENTS.md` + `docs/accounts/README.md` | Templates institucionais/customizados, saldo derivado, resumo por período |
| **Categorias de receita/despesa** | `src/features/categories/AGENTS.md` + `docs/categories/README.md` | Sistema vs. customizadas, metadados, arquivamento, delete-with-merge |
| **Transações, transferências e anexos** | `src/features/transactions/AGENTS.md` + `docs/transactions/README.md` | CRUD, filtros em URL, KPIs, transferências, confirmação e comprovantes |
| **Utilitários, erros ou UI compartilhados** | `src/shared/AGENTS.md` | Fronteiras de `shared`, `DateOnly`, `CurrencyInput`, `src/shared/errors` |
| **Specs ativas ou históricas** | `docs/specs/<modulo>/<feature>/specs/` | Contratos de mudança (`requirements`, `design`, `tasks`, `decisions`) |

## Skills do Repositório

As skills canônicas ficam em `.agents/skills/` (espelhadas via symlink `.claude/skills -> ../.agents/skills`). Use a skill adequada ao tipo de tarefa:

- `spec-driven-development`: criar ou manter specs em `docs/specs/<modulo>/<feature>/specs/` antes e durante a implementação de features ou mudanças relevantes.
- `modular-documentation`: criar, atualizar ou revisar documentação viva modular em `docs/<modulo>/`, `docs/README.md`, `docs/architecture/module-boundaries.md` e `AGENTS.md` locais.
- `danfy-api-error-handling`: integrar ou revisar queries, mutations, parsers de erro, `apiErrorCodes.ts`, `applyApiFieldErrors`, `ApiErrorAlert` e recuperação UX.
- `frontend-design`: construir ou refinar telas e fluxos React + TypeScript respeitando Atomic Design, tokens Danfy, UX e TypeScript safety.
- `danfy-finance-design-system`: aplicar tokens Danfy Dark, semântica financeira, tipografia Inter, hierarquia de dashboard e acessibilidade WCAG 2.2.
- `material-3-ui-guidance`: auditar variantes, estados, espaçamento e comportamento de componentes comuns com base em Material 3 mapeado para tokens Danfy.

## Architecture Rules

- Organize by feature first: `src/features/<feature>/{api,components,constants,hooks,schemas,stores,types,utils}`.
- Keep shared reusable building blocks under `src/shared/`. `src/shared/` must not grow new dependencies on `src/features/` (see registered debts in `docs/architecture/module-boundaries.md`).
- Use named exports; avoid default exports for project components and utilities.
- Keep one primary component per file.
- Use `index.ts` only for public feature exports. Do not export private stores, internals, or one-off helpers unless they are a real public API.
- Keep business logic out of presentation components when a hook, schema, or utility can own it more cleanly.

## Spec-Driven Development

- Follow `.agents/skills/spec-driven-development/SKILL.md` for every new feature, cross-module behavior, materially large change, or request explicitly framed as a feature.
- Before implementation, inspect every affected module's `AGENTS.md`, live docs (`docs/<modulo>/`), error/design-system docs, and backend integration contract (`personal-finance-backend:docs/integrations/<recurso>/`).
- Create or update `docs/specs/<module>/<feature>/specs/{requirements,design,tasks,decisions}.md`.
- Do not implement feature code until `requirements.md`, `design.md`, and `tasks.md` are reviewed or explicitly approved by the user.
- Keep the spec alive during implementation. Stop and update it before continuing whenever a business rule, API contract, cross-module impact, or material UX/design decision changes.
- Narrowly scoped bug fixes or mechanical refactors do not require a full spec unless they reveal a broader product decision.

## Modular Live Documentation

- Follow `.agents/skills/modular-documentation/SKILL.md` whenever creating, updating, reviewing, or reorganizing documentation, and whenever an implementation changes flows, decisions, backend operations, dependencies, components, or module invariants.
- Keep implementation contracts under `docs/specs/<module>/<feature>/specs/` and implemented behavior under `docs/<module>/{README.md,concepts/,flows/,decisions/,components/,reference/}`.
- Keep `docs/<module>/README.md` and `src/features/<module>/AGENTS.md` synchronized in the same delivery whenever behavior, endpoints, state ownership, boundaries, or invariants change.
- Each decision under `docs/<module>/decisions/` is its own file with `Problema`, `Decisão`, and `Consequência`; contradicting decisions must explicitly supersede previous ones (`supersedes` / `superseded-by`).
- Mark documents `status: current` only when confirmed by implemented code or an active backend contract.

## Atomic Design

Component hierarchy is mandatory for `src/features/*/components` and `src/shared/components`:

- `atoms`: primitive UI elements only (native HTML/SVG, Tailwind, CVA, basic local UI state). Must not import custom components, call APIs, or contain business logic.
- `molecules`: small combinations of atoms with simple UI state. Must not import organisms/templates/pages, call APIs, or use global state.
- `organisms`: complete UI sections. May compose atoms/molecules, use hooks, handle mutations, and own local workflow state.
- `templates`: layout structures and slots only. No real data fetching or business rules.
- `pages`: route-level composition with real data, URL params, page state, and template usage.

Lower levels must not import higher levels.

## TypeScript Safety

- Do not use `any`; `as any` is prohibited.
- Use `unknown` rarely and narrow it immediately with type guards.
- Parse API error shapes strictly through `src/shared/errors` helpers.
- Prefer discriminated unions, Zod schema inference, and small narrow functions over broad assertions.
- Put routes, endpoints, query keys, event names, and error codes in shared constants instead of magic strings.
- Invalid parsing returns explicit safe fallbacks (`null` or typed defaults) instead of fabricating data.

## State, Data, Money, and Temporal Contracts

- **Server state:** TanStack Query for queries/mutations; invalidate the smallest practical query key after writes.
- **Client state:** Zustand only for focused global UI/session-adjacent state; keep stores small and scoped.
- **URL state:** persist user-facing filters, search terms, sort order, pagination, selected periods, and shareable view parameters in the URL query string.
- **Forms:** React Hook Form + Zod; validate early, disable invalid submissions, preserve values on error, and show human-readable field errors.
- **Money:** represent and submit monetary values as safe integer cents (`amountCents`, `initialBalanceCents`); never use floating-point math for money; display values with the `numeric` utility for tabular numbers.
- **DateOnly vs. Instant:**
  - Treat backend `DateOnly` fields (`transactions.date`, `dateFrom`, `dateTo`, `projectedUntil`) as civil-date strings in `YYYY-MM-DD`. Never convert them to `Date`, ISO datetime, or UTC via `toISOString()` before sending to the API; use `src/shared/utils/dateOnly.ts`.
  - Treat backend `Instant` fields (`createdAt`, `updatedAt`, `effectiveAt`, `deletedAt`, `archivedAt`) as ISO 8601 UTC timestamps, converting to local timezone for display only.

## API Error Handling

- Follow `.agents/skills/danfy-api-error-handling/SKILL.md` and `docs/architecture/api-error-handling.md`.
- Keep stable backend codes in `src/shared/errors/apiErrorCodes.ts`; branch on `code` and use HTTP status only as fallback.
- Never expose raw backend messages, codes, paths, or technical identifiers in product copy.
- Use `ApiErrorAlert` for blocking form/query failures, `applyApiFieldErrors` for `VALIDATION_ERROR.details.fields`, and `showApiErrorToast` only for brief non-blocking feedback.

## UI, UX, and Color Governance

- Follow `docs/design-system/danfy-finance-design-system.md` (Apple HIG-first UX, WCAG 2.2 baseline) and `docs/design-system/material-3-reference.md` (M3 component families mapped to Danfy tokens).
- Design mobile-first with visible system status (loading, pending, empty, error, recovery), keyboard accessibility, and safe confirmations for destructive actions.
- Prefer inline UI for non-blocking details, sheets/drawers for contextual creation/editing, and modals only for focused decisions or destructive confirmations.
- Do not hardcode `#...`, `rgb(...)`, `rgba(...)`, inline `hsl(...)`, or raw Tailwind palette utilities (`text-slate-*`, `bg-violet-*`, `border-red-*`, etc.) in product UI.
- Use semantic Tailwind v4 tokens from `src/index.css`: `app-*`, `brand*`, `state-income`, `state-expense`, `state-warning`, `state-info`, and `destructive` (use `destructive` for errors and risky actions, never `state-expense`).
- Never depend on color alone for financial meaning; pair color with signs (`+`/`-`), labels, or icons.

## File, Naming, and Commit Conventions

- Components: `PascalCase.tsx`; Hooks: `useThing.ts`; Stores: `thing.store.ts`; Constants: `UPPER_SNAKE_CASE`.
- Import aliases: `@/` maps to `src/`, with `@/features` and `@/shared` as common roots.
- Use Conventional Commits in Portuguese with `<type>(<scope>): <description>` (e.g., `feat(transactions)`, `fix(auth)`, `docs(categories)`).

## Quality Checks

- Run `npm run lint` after meaningful TypeScript or React changes.
- Run `npm test` to verify affected unit and integration tests.
- Run `npm run build` when changes affect routing, config, shared types, or cross-feature behavior.
- Do not commit secrets or edit `.env` values casually.
