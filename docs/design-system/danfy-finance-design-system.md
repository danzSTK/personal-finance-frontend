# Danfy Finance Design System

Danfy Finance uses **Danfy Dark**: a dark-first SaaS finance interface with Obsidian-like calm, premium dashboard structure, and Apple HIG-first UX judgment. The goal is trust, clarity, control, and fast scanning of money.

## References

- Apple Human Interface Guidelines: [Color](https://developer.apple.com/design/human-interface-guidelines/color), [Accessibility](https://developer.apple.com/design/human-interface-guidelines/accessibility), [Typography](https://developer.apple.com/design/human-interface-guidelines/typography), [Layout](https://developer.apple.com/design/human-interface-guidelines/layout), [Dark Mode](https://developer.apple.com/design/human-interface-guidelines/dark-mode), [Alerts](https://developer.apple.com/design/human-interface-guidelines/alerts/), [Sheets](https://developer.apple.com/design/human-interface-guidelines/sheets), [Feedback](https://developer.apple.com/design/human-interface-guidelines/feedback), and [Progress indicators](https://developer.apple.com/design/human-interface-guidelines/progress-indicators).
- Material Design 3: [Components](https://m3.material.io/components), [Foundations](https://m3.material.io/foundations), [Principles/accessibility](https://m3.material.io/foundations/overview/principles), [Spacing](https://m3.material.io/foundations/layout/understanding-layout/spacing), and the project reference in `docs/design-system/material-3-reference.md`.
- WCAG 2.2: [W3C Recommendation](https://www.w3.org/TR/WCAG22/) for perceivable, operable, understandable, and robust interfaces.
- Material Design: [Color usability and contrast](https://m1.material.io/style/color.html), plus [Elevation](https://material-web.dev/components/elevation/) as a reference for restrained surface depth.
- Inter: [official repository](https://github.com/rsms/inter), chosen for screen readability, variable font support, and tabular numbers.

## Visual Philosophy

- Dark-first, not black-first. Use layered surfaces so users can separate background, card, panel, input, hover, and overlay.
- Purple is brand. It identifies Danfy and primary actions.
- Green is income. It means money entering or positive financial movement.
- Coral/red is expense. It means money leaving or negative financial movement.
- Destructive red is not financial expense. Use `destructive` for validation, errors, delete, revoke, and risky actions.
- Financial UI must be calm. Avoid neon-heavy effects, decorative blobs, noisy gradients, and animation that competes with numbers.
- Material 3 is the component behavior reference. Use it for button variants, dialogs, sheets, snackbars, text fields, cards, navigation, progress, spacing, layout, states, and accessibility. Do not copy Material colors directly; map intent to Danfy tokens.

## UX Decision Framework

Every screen or component must answer these questions before styling:

1. What is the primary action on this screen?
2. What information does the user need to see first?
3. Is color communicating meaning, decoration, or both?
4. Does this button behave like the same action in other screens?
5. If an error happens, does the user know what happened and what to do next?
6. If the state is loading, empty, offline, unauthorized, or without data, does the screen still feel intentional?
7. Can the workflow be completed without a mouse?
8. Do charts help the user make a decision, or are they only decorative?

If a UI cannot answer these questions, simplify it before making it prettier.

## Primary Action Rule

- Each screen should have one obvious primary action.
- Put the primary action near the context it affects and keep its label action-based, such as "Nova transação" or "Salvar alterações".
- Secondary actions must not compete visually with the primary action.
- Dangerous actions must not look like normal secondary actions.

## Information Priority

- Put the user's most urgent financial signal first: balance, due date, failed action, risk, or next required decision.
- Avoid leading with metadata, decorative summaries, or charts before the user sees the core financial state.
- In dashboards, summary metrics come before detailed lists.
- In forms, the current task and fields come before secondary explanations.

## Error Handling

- Errors must be actionable: say what failed, why if known, and what the user can do next.
- Field errors appear next to the field.
- Page or request errors appear close to the affected region, not only in a toast.
- Toasts are acceptable for short-lived confirmation or supplemental feedback, but they cannot be the only place where a critical failure is explained.
- Destructive or irreversible failures must preserve the user's input and offer a retry, cancel, or safe next step.
- Never expose raw technical errors, stack traces, HTTP jargon, or backend codes unless they help support or debugging.

Error copy pattern:

```txt
Title: Não foi possível salvar a transação
Body: Confira sua conexão e tente novamente. Seus dados continuam nesta tela.
Action: Tentar novamente
```

## Modal, Sheet, and Inline Rules

- Prefer inline UI for normal editing, filtering, and non-blocking details.
- Use a modal/dialog only when the user must make a focused decision before continuing.
- Use a confirmation dialog for destructive or irreversible actions.
- Use a sheet/drawer for contextual creation or editing that benefits from staying near the current screen.
- Do not use modals for ordinary success messages, simple hints, or content that can live inline.
- A dialog must have a clear title, concise body, a primary action, and a visible cancel/close path.
- Do not stack modals. Resolve or close the current modal before opening another.

## Loading, Empty, and No-Data States

- Loading states should show stable layout using skeletons, disabled pending buttons, or progress indicators.
- Do not replace an entire app surface with a spinner when only one panel is loading.
- Empty states should say what is missing and what appears when data exists.
- No-data states must not fabricate charts, transactions, balances, categories, or insights.
- Unauthorized/session states must tell the user how to recover: sign in again, refresh, or contact support.

## Keyboard and Accessibility

- All primary flows must work without a mouse.
- Interactive elements need visible focus states and accessible names.
- Dialogs must support Escape and return focus to the triggering control where possible.
- Do not override common browser or OS keyboard behavior.
- Do not use color as the only indicator of status; use signs, labels, icons, or text.
- Ensure financial values remain readable with larger text and on narrow screens.

## Chart Decision Rule

Charts are allowed only when they improve financial decision-making.

Use a chart when it helps answer:

- Is my cash flow improving or worsening?
- Which category is driving spend?
- What changed compared with last month?
- What bill or trend needs attention?

Do not use a chart when:

- The same answer is clearer as a number, table, or short list.
- The chart has no real data.
- The chart exists only to make the screen look busy.
- Color is the only way to interpret the series.

Charts must include labels, legends or direct labeling, empty states, and accessible textual summaries where practical.

## Tokens

| Purpose | CSS variable | Tailwind class |
| --- | --- | --- |
| App background | `--app-bg` | `bg-app-bg` |
| Main surface | `--app-surface` | `bg-app-surface` |
| Nested panel/input | `--app-panel` | `bg-app-panel` |
| Hover/elevated surface | `--app-elevated` | `bg-app-elevated` |
| Primary text | `--app-text` | `text-app-text` |
| Muted text | `--app-muted` | `text-app-muted` |
| Borders | `--app-border` | `border-app-border` |
| Brand | `--brand` | `bg-brand`, `text-brand` |
| Income | `--state-income` | `text-state-income`, `bg-state-income/*` |
| Expense | `--state-expense` | `text-state-expense`, `bg-state-expense/*` |
| Warning | `--state-warning` | `text-state-warning`, `bg-state-warning/*` |
| Info | `--state-info` | `text-state-info`, `bg-state-info/*` |

New product colors must be added first to `src/index.css`, then exposed through the Tailwind v4 `@theme inline` block in the same file, then used through semantic classes.

## Typography

- Use Inter locally through `@fontsource-variable/inter`.
- Global stack: `Inter Variable`, `Inter`, `ui-sans-serif`, `system-ui`, `sans-serif`.
- Use regular, medium, semibold, and bold. Avoid thin weights in small UI.
- Monetary values must use `.numeric` for tabular numbers.
- Use small, calm labels and larger numeric values. Do not use hero-sized type inside compact dashboard panels.

```tsx
<span className="numeric text-2xl font-semibold tracking-tight">
  R$ 0,00
</span>
```

## Money Color Rules

- Income: `+ R$ 0,00`, label "Entrada", `text-state-income`.
- Expense: `- R$ 0,00`, label "Saída", `text-state-expense`.
- Balance or neutral money: `text-app-text` or brand only when the value represents a product-level highlight.
- Warning: budget risk, due soon, attention needed.
- Info: forecast, projection, explanation, or neutral guidance.
- Destructive: auth errors, failed requests, delete, revoke, logout-danger, irreversible actions.
- Never rely only on green/red. Always include sign, label, icon, or context.

## Components

Before creating a component, check `docs/design-system/material-3-reference.md` and identify the closest M3 component family. Use M3 for structure, variants, states, and interaction behavior; use Danfy tokens for visual identity.

### Cards and Panels

- Cards use `bg-app-surface`, `border-app-border`, and restrained shadow.
- Nested content uses `bg-app-panel` or `bg-app-elevated`.
- Do not place UI cards inside other cards. Empty states can be bordered panels when they clarify the panel state.
- Keep surfaces subtle; avoid large decorative glows inside product screens.

### Inputs

- Inputs use `bg-app-panel`, `border-app-border`, `text-app-text`, and `placeholder:text-app-muted`.
- Focus uses brand ring for normal input focus.
- Validation errors use `border-destructive`, `ring-destructive`, and a clear field-level error.

### Buttons

- Primary actions use brand.
- Secondary and ghost actions use app surfaces and clear hover states.
- Destructive actions use `destructive`, not `state-expense`.
- Disabled buttons must visibly communicate unavailable state and avoid layout shift.

### Empty, Loading, and Error States

- Empty states should state what is missing and what will appear later.
- Loading states should use skeletons or pending buttons.
- Error states should explain the failure and next step in human language.
- Do not fabricate financial data. Use zero states, skeletons, or explicit "sem dados ainda" copy.

## Dashboard Pattern

The first dashboard screen must answer:

1. Quanto eu tenho?
2. Quanto entrou?
3. Quanto saiu?
4. O que exige atenção agora?

Default dashboard scaffold:

- Saldo total.
- Entradas do mês.
- Saídas do mês.
- Restante planejado ou orçamento.
- Fluxo de caixa.
- Gastos por categoria.
- Últimas transações.
- Próximos vencimentos.
- Contas e cartões.
- Insights simples.

## Accessibility Rules

- WCAG 2.2 AA is the baseline for contrast and interaction.
- Do not communicate state with color alone.
- Preserve keyboard operation, visible focus, semantic landmarks, and accessible names.
- Keep touch targets large enough for primary actions and mobile navigation.
- Support responsive layouts without truncating critical financial values.
- Avoid motion that prevents reading numbers or understanding state.

## Implementation Checklist

- Uses Danfy Dark tokens only.
- No raw Tailwind palettes for product UI.
- No literal component colors (`#`, `rgb`, `rgba`, inline `hsl`).
- Monetary values use `.numeric`.
- Income and expense are semantically separated from errors and destructive actions.
- Dark surfaces have visible hierarchy.
- Empty states do not invent financial history.
- Mobile and desktop layouts keep text inside containers.
