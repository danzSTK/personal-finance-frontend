---
name: material-3-ui-guidance
description: Use Material Design 3 as the component, foundation, style, spacing, accessibility, and interaction reference when building or reviewing Danfy Finance screens and UI components.
license: Project-specific
---

# Material 3 UI Guidance

Use this skill whenever building or reviewing a screen, dashboard, form, navigation surface, button, dialog, sheet, snackbar/toast, text field, card, progress state, menu, chip, tab, or chart-adjacent UI.

## Source of Truth

Read `docs/design-system/material-3-reference.md` for the project's curated M3 links and mapping rules. Use `docs/design-system/danfy-finance-design-system.md` for Danfy tokens, finance semantics, dashboard hierarchy, and UX decision rules.

## Priority Order

1. Danfy product identity and tokens.
2. Apple HIG and WCAG for UX/accessibility judgment.
3. Material 3 for concrete component behavior, variants, states, spacing, layout, and interaction patterns.
4. Existing repo architecture and Atomic Design boundaries.

## Mandatory M3 Audit

Before finishing any UI change, answer:

- Which M3 component family is this based on?
- Did I choose the right component variant for emphasis?
- Does the component include relevant states: hover, focus, active, disabled, loading, error, empty?
- Did I map M3 behavior to Danfy tokens instead of copying colors?
- Does spacing follow Material layout spacing and the local Tailwind scale?
- Is the control accessible without relying only on color?

## Component Rules

- Buttons: filled for primary completion, filled tonal for important secondary, outlined for medium emphasis, text for low emphasis, icon button only with accessible label.
- Dialogs: blocking decisions, destructive confirmations, or critical actionable information only.
- Sheets/drawers: contextual creation/editing attached to the current screen.
- Snackbars/toasts: short non-blocking feedback, never the only critical error surface.
- Text fields: always label; show field error near the field; support focused, invalid, disabled, and helper states.
- Progress: keep loading local to the affected region; use skeletons when preserving layout matters.
- Cards: group related content or repeated items; never use as decorative page wrappers.
- Navigation: desktop uses sidebar/drawer/rail; mobile uses drawer or bottom nav depending on destination frequency.

## Do Not

- Do not copy Material colors into product UI.
- Do not use M3 Expressive as permission for noisy finance screens.
- Do not add charts, FABs, or dialogs because they look modern; they must solve a workflow or decision problem.
- Do not introduce Material Web components directly unless explicitly requested. Use it as implementation reference.
