---
name: frontend-design
description: Build or refine React + TypeScript UI for this personal finance app using Atomic Design, Danfy tokens, Material 3 component guidance, UX, accessibility, TypeScript safety, and color-token rules.
license: Migrated from .github/skills/frontend-design and .github/instructions for this repository.
---

# Personal Finance Frontend Design

Use this skill when building or changing UI components, pages, dashboards, forms, navigation, or visual states in this repository.

## Design Direction

Design for personal finance: trust, clarity, control, and fast scanning. Favor refined, production-grade interfaces with precise spacing, readable numbers, calm hierarchy, and clear action states. A bold aesthetic is welcome only when it improves comprehension and confidence.

Always follow the Danfy Finance design system. If a UI decision is ambiguous, use `.agents/skills/danfy-finance-design-system/SKILL.md` and `docs/design-system/danfy-finance-design-system.md` as the source of truth.

Always use Material 3 as the component/foundation reference. Use `.agents/skills/material-3-ui-guidance/SKILL.md` and `docs/design-system/material-3-reference.md` before creating or changing common UI like buttons, icon buttons, dialogs, sheets, snackbars, text fields, cards, navigation, progress, tabs, chips, menus, and layout spacing.

The current product palette is Danfy Dark:

- App surfaces: `app-bg`, `app-surface`, `app-panel`, `app-elevated`.
- Text and borders: `app-text`, `app-muted`, `app-border`.
- Brand: `brand`, `brand-intense`, `brand-soft`, `brand-foreground`.
- State: `state-income`, `state-expense`, `state-warning`, `state-info`.
- Destructive: validation errors, failed requests, delete, revoke, logout-danger, and risky actions.

Use Apple Human Interface Guidelines as the primary UX reference and WCAG 2.2 as the accessibility baseline.

Material 3 is the concrete component behavior reference. Use it for component purpose, variants, state behavior, spacing, layout, and accessibility. Do not copy Material colors; map M3 intent to Danfy tokens.

## UX Decision Gate

Before styling a screen, answer:

- What is the primary action on this screen?
- What information does the user need to see first?
- Is color communicating meaning, decoration, or both?
- Does this button behave like the same action in other screens?
- If an error happens, does the user know what happened and what to do next?
- If the state is loading, empty, offline, unauthorized, or without data, does the screen still feel intentional?
- Can the workflow be completed without a mouse?
- Do charts help the user make a decision, or are they only decorative?

If any answer is weak, fix the flow before improving aesthetics.

## Mandatory Color Governance

- Never hardcode color values in components.
- Do not use raw Tailwind palette classes for product UI, such as `text-slate-*`, `bg-violet-*`, `border-red-*`, `text-emerald-*`, or similar.
- Use semantic classes from the design system: `bg-app-surface`, `text-app-muted`, `border-app-border`, `bg-brand`, `text-state-income`, `text-state-expense`, `text-state-warning`, `text-state-info`, and related tokens.
- Use `destructive` for errors and risky actions. Do not use `state-expense` for validation or delete/revoke states.
- If a new color is required, first add a CSS variable in `src/index.css`, then expose it through the Tailwind v4 `@theme inline` block in the same file, then use the semantic Tailwind token.

## Atomic Design Workflow

Place components in the correct hierarchy:

- `atoms`: primitive UI only. No custom component imports, API calls, global state, or business logic.
- `molecules`: atom combinations. No API calls, global state, organisms, templates, or pages.
- `organisms`: complete sections and workflows. May use feature hooks, mutations, and local workflow state.
- `templates`: layout slots and responsive structure. No real data fetching.
- `pages`: route-level composition with real data and URL state.

Lower levels must not import higher levels. Prefer feature-local components under `src/features/<feature>/components` unless the component is genuinely shared.

## UX Requirements

Every meaningful UI change should account for:

- System status: loading, pending, success, error, empty, and disabled states.
- User control: cancel, undo, escape, and confirmation for risky or destructive actions.
- Error prevention: real-time validation, disabled invalid submit, constrained inputs, and safe defaults.
- Recognition over recall: visible options, labels, icons with text when clarity matters, breadcrumbs, and contextual help.
- Minimalism: show essential financial information first; avoid technical metadata in the primary view.
- Recovery: error messages should explain the problem and the next step in plain language.
- Accessibility: semantic HTML, keyboard operation, focus states, and aria labels where needed.
- Responsiveness: mobile-first layout with stable dimensions for controls, cards, tables, and dashboard regions.
- Money semantics: include signs, labels, icons, or context. Never rely on color alone.
- Typography: monetary values use the `numeric` utility for tabular numbers.

## Modal and State Rules

- Prefer inline UI for normal editing, filtering, hints, and non-blocking details.
- Use a modal/dialog only for blocking decisions, destructive confirmations, or critical actionable information.
- Use a sheet/drawer for contextual creation or editing attached to the current screen.
- Critical errors must be visible near the affected region and explain recovery; a toast alone is not enough.
- Loading, empty, no-data, unauthorized, and offline states must keep the screen usable and intentional.
- Charts must answer a decision question. If they do not, use a metric, list, or table instead.

## Implementation Rules

- Use React 18 + TypeScript, Tailwind CSS, Shadcn/UI/Radix primitives, CVA, `cn()`, and Lucide icons.
- Use named exports; avoid default exports.
- Define TypeScript interfaces or types for props.
- Keep one primary component per file.
- Use TanStack Query for server state and mutations; invalidate specific query keys after writes.
- Use Zustand only for focused client UI state.
- Use React Hook Form + Zod for forms.
- Avoid `any`; narrow `unknown` immediately.
- Keep routes, endpoints, query keys, events, and error codes in shared constants instead of magic strings.
- Prefer reusable hooks or utilities when UI code starts carrying business rules.

## Visual Quality Checklist

Before finishing UI work, verify:

- The closest Material 3 component family was checked and the chosen variant matches action emphasis.
- The first screen communicates the product state or task immediately.
- Important amounts and statuses are visually scannable.
- Monetary values use `.numeric`.
- Buttons and icon buttons have stable sizes and do not shift layout.
- Text fits within containers on mobile and desktop.
- Destructive actions use state/destructive semantics and are visually distinct.
- No nested cards or decorative card wrappers around whole page sections.
- No one-note palette drift away from the token system.
- The interface feels like a finance product: clear, trustworthy, and efficient.
