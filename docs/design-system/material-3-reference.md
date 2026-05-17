# Material 3 Reference

Material 3 is the component and foundation reference for Danfy Finance UI decisions. Danfy Dark remains the product identity and token system; Material 3 informs component purpose, hierarchy, states, spacing, accessibility, and interaction behavior.

## How to Use M3 in This Project

- Before creating or changing a screen, identify the Material component family involved.
- Check the M3 component page for purpose, variants, states, anatomy, and interaction expectations.
- Apply the behavior through this repo's React, Tailwind, Radix/Shadcn, CVA, and `cn()` patterns.
- Do not copy Material colors directly. Map M3 intent to Danfy tokens.
- M3 Expressive can inform flexibility and motion, but Danfy Finance must remain calm, readable, and financial.

## Primary Material Links

- [Material Design 3](https://m3.material.io/)
- [Components](https://m3.material.io/components)
- [Foundations](https://m3.material.io/foundations)
- [Styles](https://m3.material.io/styles)
- [Material Web](https://material-web.dev/) for web implementation references.

## Foundations

- [Principles and accessibility overview](https://m3.material.io/foundations/overview/principles)
- [Layout overview](https://m3.material.io/foundations/layout/overview)
- [Spacing](https://m3.material.io/foundations/layout/understanding-layout/spacing)
- [Interaction states](https://m3.material.io/foundations/interaction/states/overview)
- [Accessible color contrast](https://m3.material.io/foundations/designing/color-contrast)
- [Content design and writing](https://m3.material.io/foundations/content-design/global-writing/overview)
- [Design tokens](https://m3.material.io/foundations/design-tokens/overview)
- [Adaptive design](https://m3.material.io/foundations/adaptive-design/overview)

## Styles

- [Color](https://m3.material.io/styles/color/overview)
- [Typography](https://m3.material.io/styles/typography/overview)
- [Elevation](https://m3.material.io/styles/elevation/overview)
- [Motion](https://m3.material.io/styles/motion/overview)
- [Shape](https://m3.material.io/styles/shape/overview)
- [Icons](https://m3.material.io/styles/icons/overview)

## Component Links

- [Buttons](https://m3.material.io/components/buttons/overview)
- [Icon buttons](https://m3.material.io/components/icon-buttons/overview)
- [Floating action button](https://m3.material.io/components/floating-action-button/overview)
- [Cards](https://m3.material.io/components/cards/overview)
- [Dialogs](https://m3.material.io/components/dialogs/overview)
- [Bottom sheets](https://m3.material.io/components/bottom-sheets/overview)
- [Snackbars](https://m3.material.io/components/snackbar/overview)
- [Text fields](https://m3.material.io/components/text-fields/overview)
- [Chips](https://m3.material.io/components/chips/overview)
- [Menus](https://m3.material.io/components/menus/overview)
- [Progress indicators](https://m3.material.io/components/progress-indicators/overview)
- [Tabs](https://m3.material.io/components/tabs/overview)
- [Navigation bar](https://m3.material.io/components/navigation-bar/overview)
- [Navigation drawer](https://m3.material.io/components/navigation-drawer/overview)
- [Navigation rail](https://m3.material.io/components/navigation-rail/overview)
- [Top app bar](https://m3.material.io/components/top-app-bar/overview)

## Material Web Implementation References

- [Material Web buttons](https://material-web.dev/components/button/)
- [Material Web dialogs](https://material-web.dev/components/dialog/)
- [Material Web text fields](https://material-web.dev/components/text-field/)
- [Material Web progress indicators](https://material-web.dev/components/progress/)

Use Material Web as implementation guidance only. This repo still uses React components, Radix/Shadcn primitives, Tailwind, and Danfy tokens.

## Component Mapping for Danfy Finance

### Buttons

- Filled button: primary action that completes or advances the main flow.
- Filled tonal button: secondary but still important action, such as a next step.
- Outlined button: medium-emphasis alternative action.
- Text button: low-emphasis action, inline action, or secondary dialog action.
- Icon button: compact toolbar/action surface; must have an accessible label.
- FAB: use sparingly. Prefer normal primary buttons on finance dashboards unless mobile creation is the dominant task.

### Dialogs and Sheets

- Dialog: blocking decision, destructive confirmation, or critical actionable information.
- Bottom sheet/drawer: contextual creation/editing or a temporary secondary surface.
- Snackbar/toast: brief non-blocking feedback. It must not be the only place critical errors appear.

### Text Fields

- Labels are required.
- Field-level errors appear near the field and explain recovery.
- Disabled, focused, invalid, and loading states must be visually distinct.
- Masks and helpers should prevent invalid financial input without hiding user intent.

### Progress

- Use progress indicators for real waiting states.
- Prefer skeletons or panel-level loading over full-screen spinners.
- Keep loading indicators in a consistent location.

### Cards

- Cards group related content or represent a repeated item.
- Do not use cards as decorative wrappers around entire pages.
- Cards need a clear heading, hierarchy, and state.

### Navigation

- Desktop: sidebar/drawer or rail depending on density.
- Mobile: drawer or bottom navigation depending on frequent destination count.
- Active states must use both visual styling and accessible state/context.

## Required M3 Audit

Before finishing a UI change, answer:

- Which M3 component family did I use as reference?
- Did I choose the right variant for emphasis?
- Did I implement hover, focus, active, disabled, loading, error, and empty states where relevant?
- Did I map M3 behavior to Danfy tokens instead of copying colors?
- Is spacing consistent with Material layout spacing and the local Tailwind scale?
- Does the component remain accessible without relying only on color?
