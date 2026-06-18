---
name: danfy-api-error-handling
description: Standardize typed API error handling for Danfy Finance with stable backend codes, actionable Portuguese UX copy, field validation, session recovery, TanStack Query/Axios integration, and Material 3 error surfaces. Use when implementing or reviewing API queries, mutations, forms, Axios interceptors, error parsers, error states, dialogs, snackbars/toasts, retries, or mappings from backend error codes to frontend behavior.
---

# Danfy API Error Handling

Treat API failures as recoverable product states. Decide behavior from the stable backend `code`, preserve user work, and present the error near the affected task.

## Sources Of Truth

Use this priority:

1. Backend contract: `../personal-finance-backend/docs/integrations/errors.md`.
2. Resource integration docs in `../personal-finance-backend/docs/integrations/<resource>/` for operation-specific errors and recovery.
3. `docs/design-system/danfy-finance-design-system.md` for copy, surfaces, tokens, and accessibility.
4. `docs/design-system/material-3-reference.md` for text fields, snackbars, dialogs, buttons, and progress behavior.

Read [references/platform-error-contract.md](references/platform-error-contract.md) when parsing errors or mapping codes. Read [references/ux-error-presentation.md](references/ux-error-presentation.md) when choosing UI/copy. Read [references/frontend-implementation.md](references/frontend-implementation.md) before implementing shared TypeScript utilities, forms, Axios, or TanStack Query behavior.

## Required Workflow

1. Locate and read the global error contract and the complete integration documentation for the specific resource being consumed.
2. Build an operation-level inventory of every documented `code` for each endpoint being added or changed.
3. Identify the affected user intent and whether entered data can be lost.
4. Parse the response into a typed platform error. Never use `any` or assume nested payloads.
5. Branch on `code`; use HTTP status only as fallback when a valid code is unavailable.
6. Choose the smallest adequate error surface:
   - field error for one invalid field;
   - inline panel/banner for a blocked region or failed query;
   - snackbar/toast for brief, non-blocking supplemental feedback;
   - dialog only for a blocking decision or critical actionable information.
7. Write Portuguese copy that says what happened and what the user can do next.
8. Preserve form values and financial context after failures.
9. Provide a concrete recovery action when one exists: retry, sign in, choose another target, correct a field, or cancel safely.
10. Test every documented operation code plus malformed/legacy payloads, offline/network failure, `500`, keyboard flow, and loading-to-error transitions.

## Non-Negotiable Rules

- Use `code` as the stable decision contract. Never branch on exact `message` text.
- Never implement an API integration before checking the error codes documented for that resource and operation.
- Do not assume that the global catalog describes every endpoint behavior; reconcile it with the resource integration docs.
- Never expose stack traces, SQL, raw paths, internal identifiers, HTTP jargon, or backend codes in product copy.
- Use `details.fields` from `VALIDATION_ERROR` to mark fields and focus the first invalid control.
- Handle `401` through the existing refresh/session flow. On terminal failure, clear auth and explain that the user must sign in again.
- Treat `409` as a business conflict, not a technical outage. Explain the rule and available next step.
- Present unknown/network/`500` failures as `Serviço indisponível no momento` and offer retry where safe.
- Do not discard typed form input after mutation failure.
- Do not use a toast as the only surface for blocking, critical, or data-loss-risk errors.
- Use `destructive` for error visuals. Never use `state-expense` as an error color.
- Do not rely on color alone; pair state with title, body, icon, and action.
- Avoid duplicate feedback. Do not show the same error inline, in a toast, and in a dialog without distinct purposes.

## Completion Check

- Known backend codes have explicit behavior or intentionally use a documented fallback.
- The changed endpoint has an explicit inventory of documented codes from its resource integration docs.
- Error copy is actionable and does not leak implementation details.
- Query failures remain near their panel and include retry when appropriate.
- Form validation is field-level; form-wide errors remain visible near submit/context.
- Pending controls are disabled without clearing input.
- Error surfaces support keyboard focus and accessible announcements.
- Tests cover the code mapping and at least one unknown/network fallback.
- `npm run lint` and `npm run build` pass after implementation changes.
