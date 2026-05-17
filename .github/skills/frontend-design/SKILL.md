---
name: frontend-design
description: Build React + TypeScript UI for Danfy Finance using Danfy Dark tokens, Material 3 component guidance, Apple HIG-first UX, WCAG accessibility, and Atomic Design.
license: Project-specific
---

# Danfy Finance Frontend Design

Use this skill when building or changing product UI: dashboards, auth, settings, forms, navigation, financial summaries, empty states, loading states, or component visuals.

## Design Direction

Danfy Finance is a dark-first personal finance SaaS. The interface must feel calm, premium, trustworthy, and efficient. Use Obsidian only as atmosphere inspiration; the product identity is **Danfy Dark**.

Primary references:

- Apple Human Interface Guidelines for clarity, hierarchy, accessibility, typography, layout, and user control.
- Material 3 for component purpose, variants, states, layout spacing, foundations, styles, and accessibility.
- WCAG 2.2 for accessibility baseline.
- Material color/elevation guidance for contrast and restrained surface layering.
- Inter for readable interface text and tabular financial numbers.

Before creating or changing common UI, check `docs/design-system/material-3-reference.md`. Use Material 3 for buttons, icon buttons, dialogs, sheets, snackbars, text fields, cards, navigation, progress, tabs, chips, menus, and spacing decisions. Use Danfy tokens for final colors and product identity.

## UX Decision Gate

Before styling any screen or component, answer:

- What is the primary action on this screen?
- What information does the user need to see first?
- Is color communicating meaning, decoration, or both?
- Does this button behave like the same action in other screens?
- If an error happens, does the user know what happened and what to do next?
- If the state is loading, empty, offline, unauthorized, or without data, does the screen still feel intentional?
- Can the workflow be completed without a mouse?
- Do charts help the user make a decision, or are they only decorative?

If the answer is unclear, simplify the interaction before improving visuals.

## Mandatory Tokens

- App surfaces: `bg-app-bg`, `bg-app-surface`, `bg-app-panel`, `bg-app-elevated`.
- Text/border: `text-app-text`, `text-app-muted`, `border-app-border`.
- Brand: `bg-brand`, `text-brand`, `text-brand-soft`, `bg-brand-intense`.
- Finance states: `text-state-income`, `text-state-expense`, `text-state-warning`, `text-state-info`.
- Errors and risky actions: `destructive`, never `state-expense`.

Never hardcode product colors and never use raw Tailwind palettes such as `text-slate-*`, `bg-red-*`, `text-green-*`, or `bg-violet-*`.

## Financial Semantics

- `state-income`: incoming money, positive financial movement, earned value.
- `state-expense`: outgoing money, negative financial movement.
- `state-warning`: budget risk, due soon, requires attention.
- `state-info`: forecast, projection, explanation, neutral guidance.
- `destructive`: validation errors, failed requests, delete, revoke, logout-danger, and irreversible actions.
- Never rely on color alone. Add signs, labels, icons, or text context.
- Monetary values must use `.numeric`.

## UX Rules

- Show system status: loading, pending, empty, success, error, disabled.
- Preserve user control: cancel, escape, confirmation, or undo for destructive flows.
- Prevent errors: validate early and disable invalid submission.
- Prefer recognition over recall: visible options, labels, icons with text when clarity matters.
- Use local financial formats for money, dates, balances, accounts, and transactions.
- Do not fabricate financial data. Use zero states, skeletons, or explicit empty copy.
- Keep motion short and functional; do not animate numbers in a way that harms reading.

## Modal and State Rules

- Prefer inline UI for normal editing, filtering, hints, and non-blocking details.
- Use a modal/dialog only for blocking decisions, destructive confirmations, or critical actionable information.
- Use a sheet/drawer for contextual creation or editing attached to the current screen.
- Every dialog needs a clear title, concise body, primary action, and visible cancel/close path.
- Critical errors must be visible near the affected region and explain recovery; a toast alone is not enough.
- Loading states must keep layout stable and show what is pending.
- Empty/no-data states must say what is missing and what will appear later.
- Charts must answer a financial decision question. If they do not, use a metric, list, or table instead.

## Atomic Design

- `atoms`: primitive UI only. No custom component imports, API calls, global state, or business logic.
- `molecules`: atom combinations. No API calls, global state, organisms, templates, or pages.
- `organisms`: complete sections and workflows. May use hooks, mutations, and local workflow state.
- `templates`: layout structures and slots. No real data fetching.
- `pages`: route-level composition with real data, URL state, and templates.

Lower levels must not import higher levels.

## Dashboard Baseline

The first dashboard view should answer: quanto eu tenho, quanto entrou, quanto saiu, and what needs attention.

Default scaffold:

- Saldo total.
- Entradas do mês.
- Saídas do mês.
- Restante planejado/orçamento.
- Fluxo de caixa.
- Gastos por categoria.
- Últimas transações.
- Próximos vencimentos.
- Contas/cartões.
- Insights simples.

## Completion Checklist

- The closest Material 3 component family was checked and the chosen variant matches action emphasis.
- UI uses only semantic tokens.
- Money values use `.numeric`.
- Income/expense are separated from destructive/error states.
- Dark surfaces are layered and readable.
- Empty states are explicit and honest.
- Text fits on mobile and desktop.
- Keyboard focus and accessible names are present where needed.
- Run `npm run lint` and `npm run build` after meaningful UI changes.
