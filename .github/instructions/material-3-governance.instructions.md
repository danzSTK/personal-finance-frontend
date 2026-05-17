---
applyTo: 'src/**/*.{ts,tsx,css}'
description: 'Material 3 component, foundation, spacing, style, and accessibility governance for Danfy Finance UI'
---

# Material 3 Governance

Material 3 is the reference for component behavior, variants, states, spacing, layout, styles, and accessibility. Danfy Dark remains the visual identity and token system.

Before building or changing UI:

1. Identify the closest M3 component family.
2. Check `docs/design-system/material-3-reference.md`.
3. Choose the component variant based on action emphasis.
4. Implement with repo patterns: React, Tailwind, Radix/Shadcn, CVA, `cn()`, Atomic Design.
5. Map M3 intent to Danfy tokens. Do not copy Material colors directly.

## Required Component Checks

- Buttons: filled primary, tonal important secondary, outlined medium emphasis, text low emphasis, icon button only with accessible label.
- Dialogs: blocking decisions, destructive confirmations, or critical actionable information.
- Sheets/drawers: contextual creation or editing attached to the current screen.
- Snackbars/toasts: brief non-blocking feedback; not the only surface for critical errors.
- Text fields: visible label, helper/error text, focus, disabled, invalid states.
- Progress: local loading state where possible; preserve layout with skeletons when needed.
- Cards: group related content or repeated items; never decorative page wrappers.
- Navigation: active state must be clear and accessible.

## Required Audit

- Which M3 component family did this use?
- Does the variant match the action priority?
- Are hover, focus, active, disabled, loading, error, and empty states handled where relevant?
- Is spacing consistent with Material layout spacing and the local Tailwind scale?
- Is the UI accessible without relying on color alone?
