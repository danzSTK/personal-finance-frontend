---
name: danfy-finance-design-system
description: "Apply the Danfy Finance design system: Danfy Dark tokens, finance color semantics, Inter typography, dashboard hierarchy, Apple HIG-first UX, Material 3 component guidance, and WCAG accessibility."
license: Project-specific
---

# Danfy Finance Design System

Use this skill whenever changing product UI, dashboards, auth screens, settings, forms, financial summaries, or visual states in this repository.

## Source of Truth

Read `docs/design-system/danfy-finance-design-system.md` when a UI decision is ambiguous. Read `docs/design-system/material-3-reference.md` before creating or changing buttons, dialogs, sheets, text fields, cards, navigation, progress, or other common UI components. Follow `AGENTS.md` for architecture, Atomic Design, TypeScript safety, and quality checks.

## Mandatory Rules

- Apple Human Interface Guidelines are the primary UX reference. WCAG 2.2 is the accessibility baseline.
- Material 3 is the component and foundation reference for buttons, dialogs, sheets, text fields, cards, navigation, progress, spacing, layout, states, and component accessibility.
- Use Danfy Dark tokens only: `app`, `brand`, `state`, and Shadcn semantic tokens.
- Never hardcode product colors or use raw Tailwind palettes.
- Use `state-income` only for incoming money and positive financial movement.
- Use `state-expense` only for outgoing money and negative financial movement.
- Use `destructive` for validation errors, failed requests, delete, revoke, logout-danger, and risky actions.
- Do not rely on color alone. Pair money color with signs, labels, icons, or context.
- Monetary values must use `.numeric`.
- Dark UI must have layered surfaces: `app-bg`, `app-surface`, `app-panel`, `app-elevated`, `app-border`.
- Do not invent financial data. Use zero states, skeletons, or explicit empty copy.
- Do not copy M3 colors directly; map Material component intent to Danfy tokens.

## UX Decision Checklist

Before implementing or reviewing any UI, answer:

- What is the primary action on this screen?
- What information does the user need to see first?
- Is color communicating meaning, decoration, or both?
- Does this button behave like the same action in other screens?
- If an error happens, does the user know what happened and what to do next?
- If the state is loading, empty, offline, unauthorized, or without data, does the screen still feel intentional?
- Can the workflow be completed without a mouse?
- Do charts help the user make a decision, or are they only decorative?

If the answer is unclear, simplify the UI before styling it.

## Interaction Rules

- Prefer inline UI for ordinary editing, filtering, and non-blocking details.
- Use a modal/dialog only for focused decisions, destructive confirmations, or blocking information.
- Use a sheet/drawer for contextual creation or editing that should stay attached to the current screen.
- Every modal needs a clear title, concise body, primary action, and visible cancel/close path.
- Errors must say what failed and how to recover; do not rely only on toasts for critical errors.
- Loading states must keep layout stable; avoid full-screen spinners for panel-level loading.
- Empty states must explain what is missing and what appears when data exists.
- Charts must answer a financial decision question; otherwise prefer a metric, list, or table.

## Material 3 Component Audit

Before finishing UI work, verify:

- The closest M3 component family was checked.
- The variant matches emphasis: filled primary, tonal important secondary, outlined medium emphasis, text low emphasis, icon button compact action.
- Relevant states exist: hover, focus, active, disabled, loading, error, empty.
- Spacing follows the M3 layout spacing reference and local Tailwind scale.
- Accessibility does not rely on color alone.

## Dashboard Requirements

The default finance dashboard should prioritize:

- Saldo total.
- Entradas do mês.
- Saídas do mês.
- Restante planejado/orçamento.
- Fluxo de caixa.
- Categorias.
- Últimas transações.
- Próximos vencimentos.
- Contas/cartões.
- Insights simples.

## Completion Checklist

- Build uses Inter via local package.
- Values use tabular numbers.
- Errors use `destructive`.
- Income/expense tokens are used only for financial semantics.
- UI works mobile-first with visible focus and stable touch targets.
- `npm run lint` and `npm run build` are run after meaningful changes.
