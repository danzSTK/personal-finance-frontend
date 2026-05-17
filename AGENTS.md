# Personal Finance Frontend Instructions

## Project Context

This repository is a React + TypeScript personal finance frontend for account, auth, dashboard, and transaction workflows. Build for trust, clarity, and efficiency: financial data must be easy to scan, actions must feel predictable, and errors must be explicit.

## Stack

- Vite 5, React 18, TypeScript 5.
- React Router 6 for routing.
- TanStack Query for server state.
- Zustand for focused global client state.
- React Hook Form + Zod for forms and validation.
- Axios for HTTP.
- Tailwind CSS, Shadcn/UI, Radix UI, CVA, and `cn()` for UI composition.
- Lucide React for icons.
- IMask / react-imask for input masks.

## Architecture Rules

- Organize by feature first: prefer `src/features/<feature>/{api,components,hooks,stores,types,utils}` over technical top-level buckets.
- Keep shared reusable building blocks under `src/shared`.
- Use named exports; avoid default exports for project components and utilities.
- Keep one primary component per file.
- Use `index.ts` only for public feature exports. Do not export private stores, internals, or one-off helpers unless they are a real public API.
- Keep business logic out of presentation components when a hook, service, schema, or utility can own it more cleanly.

## Atomic Design

Component hierarchy is mandatory for `src/features/*/components` and `src/shared/components`:

- `atoms`: primitive UI elements such as Button, Input, Label, Badge, Icon. Atoms may use native HTML/SVG, Tailwind, CVA, and basic local UI state only. They must not import custom components, call APIs, or contain business logic.
- `molecules`: small combinations of atoms such as FormField, SearchBar, CardHeader. Molecules may manage simple UI state, but must not import organisms/templates/pages, call APIs, or use global state.
- `organisms`: complete UI sections such as LoginForm, TransactionCard, Navbar, DataTable. Organisms may compose atoms and molecules, use hooks, handle mutations, and own local workflow state.
- `templates`: layout structures and slots only. Templates define placement and responsive structure, not real data fetching or business rules.
- `pages`: route-level composition with real data, URL params, page state, and template usage.

Lower levels must not import higher levels.

## TypeScript Safety

- Do not use `any`; `as any` is prohibited.
- Use `unknown` rarely and narrow it immediately with type guards.
- Do not access nested error payloads with loose assumptions. Parse error shapes through typed helpers or guards.
- Avoid broad object assertions. Prefer discriminated unions, schema inference, and small narrow functions.
- Put routes, endpoints, query keys, event names, and error codes in shared constants instead of magic strings.
- Invalid parsing should return typed fallback values such as `null` or a safe explicit result. Do not invent data to hide failures.

## State, Data, and Forms

- Use TanStack Query for server data, including loading, error, cache, and invalidation behavior.
- Use mutations for POST/PUT/PATCH/DELETE and invalidate the smallest practical query key after success.
- Use Zustand only for focused client state such as theme, sidebar visibility, wizard state, or session-adjacent UI state.
- Keep Zustand stores small and scoped. Avoid one giant app store.
- Use React Hook Form + Zod for forms. Infer form types from schemas when possible.
- Validate early, disable invalid submissions, and show field-level errors in clear human language.

## UI and UX

- Follow the Danfy Finance design system in `docs/design-system/danfy-finance-design-system.md`.
- Treat Apple Human Interface Guidelines as the primary UX reference for clarity, hierarchy, accessibility, typography, layout, and user control. WCAG 2.2 is the accessibility baseline.
- Treat Material 3 as the component and foundation reference for buttons, icon buttons, dialogs, sheets, snackbars, text fields, cards, navigation, progress, tabs, chips, menus, layout spacing, styles, and component states. Use `docs/design-system/material-3-reference.md` before building or changing common UI.
- Design mobile-first with responsive Tailwind breakpoints.
- Provide visible system status: loading states, disabled pending buttons, skeletons, progress, and success/error feedback.
- Preserve user control: destructive actions need confirmation or undo where appropriate; dialogs need Cancel and keyboard escape paths.
- Use familiar financial language and local formats, especially for currency, dates, and account balances.
- Prefer recognition over recall: selects, visible options, labels, icons with text, breadcrumbs, and contextual help.
- Keep screens minimal but not empty. Show the essential financial signal first and hide technical metadata unless it helps the user.
- Make error messages actionable: explain what failed and how to fix it.
- Ensure semantic HTML, keyboard support, aria labels where needed, and sensible focus states.
- Use large enough touch targets for primary actions.
- Do not depend on color alone for financial meaning. Pair color with signs (`+`/`-`), labels, icons, or clear context.
- Monetary values must use the `numeric` utility for tabular numbers.
- Dark mode uses layered Danfy Dark surfaces. Do not flatten product UI into absolute black.
- Before styling a screen, identify the primary action, the first information the user needs, all loading/empty/error states, keyboard-only path, and whether charts actually support a decision.
- Before finishing common UI, identify the closest Material 3 component family and verify the chosen variant, spacing, states, and accessibility. Use Danfy tokens for final colors.
- Prefer inline UI for non-blocking details. Use modals only for focused decisions, destructive confirmations, or critical actionable information. Use sheets/drawers for contextual creation or editing.
- Critical errors must explain what happened and how to recover near the affected region. A toast alone is not enough for a blocking or data-loss risk.

## Color Governance

All product UI colors must come from design tokens.

- Do not hardcode `#...`, `rgb(...)`, `rgba(...)`, or inline `hsl(...)` in components.
- Do not use raw Tailwind palette utilities for product UI such as `text-slate-*`, `bg-violet-*`, `border-red-*`, `text-emerald-*`, or similar.
- Use semantic Tailwind v4 tokens from `src/index.css`: `app`, `brand`, `state`, and the Shadcn semantic tokens when appropriate.
- Preferred product classes include `bg-app-bg`, `bg-app-surface`, `bg-app-panel`, `bg-app-elevated`, `text-app-text`, `text-app-muted`, `border-app-border`, `bg-brand`, `text-brand`, `text-state-income`, `text-state-expense`, `text-state-warning`, and `text-state-info`.
- Use `state-income` for incoming money, positive financial movement, and earned value. Use `state-expense` for outgoing money and negative financial movement.
- Use `destructive` for validation errors, failed requests, delete/revoke/logout-danger states, and other risky or destructive actions. Do not use `state-expense` for errors.
- New colors must be added first as CSS variables in `src/index.css`, then exposed through the Tailwind v4 `@theme inline` block in the same file, then used through semantic classes.

Current product palette is Danfy Dark: near-black layered app surfaces, purple brand accents, green income, coral/red expense, amber warning, blue info, and destructive red for errors or risky actions.

## File and Naming Conventions

- Components: `PascalCase.tsx`.
- Hooks: `useThing.ts`.
- Stores: `thingStore.ts` or the existing local store naming pattern.
- Types: prefer clear PascalCase types; use `.type.ts` when matching existing feature conventions.
- Constants: `UPPER_SNAKE_CASE` for exported constant maps.
- Import aliases: `@/` maps to `src/`, with `@/features` and `@/shared` as common roots.

## Quality Checks

- Run `npm run lint` after meaningful TypeScript or React changes.
- Run `npm run build` when changes affect routing, config, shared types, or cross-feature behavior.
- Add focused tests for critical auth, money, validation, and data transformation behavior when changing those paths.
- Do not commit secrets or edit `.env` values casually.
