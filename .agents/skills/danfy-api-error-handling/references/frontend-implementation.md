# Frontend Implementation

## Required Endpoint Error Inventory

Before writing a query, mutation, form, or callback:

1. Read `../personal-finance-backend/docs/integrations/errors.md`.
2. Read the complete resource folder at `../personal-finance-backend/docs/integrations/<resource>/`.
3. Record every documented error `code` for the exact endpoint and method.
4. Define the UI surface, copy, recovery action, and test for each code.
5. Keep an unknown-code and transport fallback even after all known codes are mapped.

Do not infer the resource's possible errors from HTTP status alone or from another module's behavior.

## Typed Parsing

Create shared types and narrow `unknown` explicitly. Do not cast Axios payloads broadly.

```ts
interface PlatformError {
  statusCode: number
  code: string
  message: string
  path: string
  timestamp: string
  details: Record<string, unknown> | null
}

interface FieldError {
  field: string
  messages: string[]
}
```

Provide guards for the base shape and for `details.fields`. Parsing failure must return a typed fallback such as `null`, never invented data.

## Central Resolution

Keep stable codes in constants. Resolve errors into UI descriptors instead of returning raw backend messages:

```ts
interface ErrorPresentation {
  title: string
  description: string
  fieldErrors: FieldError[]
  recovery: 'retry' | 'sign-in' | 'correct-fields' | 'choose-target' | 'none'
}
```

Resolution order:

1. Parse platform error.
2. Handle `VALIDATION_ERROR` and field details.
3. Map known `code` to behavior and copy.
4. Apply transport-status fallback.
5. Apply network/unknown fallback.

Do not make `message` the default product copy. It may be logged safely for development/observability, subject to privacy rules.

## Suggested Code Mappings

- `CATEGORY_HAS_TRANSACTIONS`: open/continue the merge flow; do not show generic conflict.
- `CATEGORY_NAME_ALREADY_EXISTS`: attach error to category name and preserve sheet values.
- `CATEGORY_INVALID_MERGE`: keep dialog open and ask for another active category of the same type.
- `ACCOUNT_CANNOT_BE_ARCHIVED`: explain why archive is blocked; keep account visible.
- `ACCOUNT_MUST_REMAIN_ACTIVE`: explain that one active account must remain.
- `ACCOUNT_HAS_SCHEDULED_TRANSACTIONS`: explain scheduled activity and avoid blind retry.
- `INVALID_ACCESS_TOKEN` / `INVALID_REFRESH_TOKEN`: defer to the centralized session flow.
- `INTERNAL_SERVER_ERROR`: show `Serviço indisponível no momento` near the affected task.

## React Hook Form

For `VALIDATION_ERROR`:

1. Parse `details.fields`.
2. Map backend field names to actual form field names through an explicit map when names differ.
3. Call `setError(field, { type: 'server', message })`.
4. Focus the first invalid field.
5. Put unmapped/global messages in a form-level alert.

Clear a server error when the user edits that field or when a new submission succeeds. Do not clear unrelated input.

## TanStack Query

- Queries: render error state inside the owning panel and connect retry to `refetch()`.
- Mutations: keep sheet/dialog/form open on failure; close only in `onSuccess`.
- Invalidate the smallest relevant query key after success.
- Avoid automatic mutation retry unless idempotency is explicit.
- Avoid duplicate toast plus inline copies of the same failure.

## Axios And Sessions

- Keep `withCredentials: true` for the API.
- Centralize refresh behavior for `401`.
- Prevent refresh loops by marking retried requests.
- On terminal refresh failure, clear auth once and navigate to sign-in.
- Do not let each component independently implement token refresh.

## Testing Checklist

- Parse a valid platform error.
- Reject malformed `details.fields` safely.
- Resolve every code used by the changed workflow.
- Resolve unknown code through status fallback.
- Resolve no-response/network failure.
- Verify `500` copy does not expose backend `message`.
- Verify form values survive mutation failure.
- Verify query retry calls the correct refetch.
- Verify keyboard focus reaches field errors and recovery actions.
- Verify critical failures remain visible without relying on toast history.
