# Platform Error Contract

Use the backend documentation as the live source of truth:

- `../personal-finance-backend/docs/errors/README.md`
- `../personal-finance-backend/docs/integrations/errors.md`

## Response Shape

```ts
interface PlatformErrorResponse {
  statusCode: number
  code: string
  message: string
  path: string
  timestamp: string
  details: Record<string, unknown> | null
}
```

Use `code` for frontend decisions. Treat `message` only as a last-resort diagnostic fallback; do not expose it automatically to users.

`VALIDATION_ERROR` may include:

```ts
interface ValidationErrorDetails {
  fields: Array<{
    field: string
    messages: string[]
  }>
}
```

Validate and narrow every field before use.

## Current Codes

### Global

| Code | Status | Meaning |
|---|---:|---|
| `VALIDATION_ERROR` | 400 | DTO body/query/params validation failed |
| `INTERNAL_SERVER_ERROR` | 500 | Unexpected internal failure |

### Auth And Sessions

| Code | Status | Meaning |
|---|---:|---|
| `AUTH_PROVIDER_ALREADY_LINKED` | 409 | Provider is already linked |
| `AUTH_PROVIDER_LINKED_TO_ANOTHER_USER` | 409 | Provider belongs to another user |
| `INVALID_ACCESS_TOKEN` | 401 | Access token missing or invalid |
| `INVALID_REFRESH_TOKEN` | 401 | Refresh token missing, invalid, or expired |
| `POTENTIAL_SESSION_HIJACKING` | 401 | Session integrity failure; backend revokes sessions |
| `SESSION_NOT_FOUND` | 404 | Requested session does not exist |

### Users

| Code | Status | Meaning |
|---|---:|---|
| `INVALID_USERNAME_FORMAT` | 400 | Username format violates domain rules |
| `USER_EMAIL_ALREADY_EXISTS` | 409 | Email is already registered |
| `USERNAME_ALREADY_EXISTS` | 409 | Username is already registered |
| `USER_NOT_FOUND` | 404 | Expected user does not exist |

### Accounts

| Code | Status | Meaning |
|---|---:|---|
| `ACCOUNT_ALREADY_DEFAULT` | 409 | Account is already default |
| `ACCOUNT_ARCHIVED` | 409 | Common operation is blocked for archived account |
| `ACCOUNT_ARCHIVED_MUTATION` | 409 | Domain blocked mutation of archived account |
| `ACCOUNT_CANNOT_BE_ARCHIVED` | 409 | Account cannot be archived, such as default account |
| `ACCOUNT_CANNOT_BE_DEFAULT` | 409 | Account cannot become default, such as archived account |
| `ACCOUNT_HAS_SCHEDULED_TRANSACTIONS` | 409 | Future scheduled activity blocks the action |
| `ACCOUNT_MUST_REMAIN_ACTIVE` | 409 | Archiving would leave no active account |
| `ACCOUNT_NOT_ARCHIVED` | 409 | Account is not archived |
| `ACCOUNT_NOT_FOUND` | 404 | Account is missing or inaccessible |
| `ACCOUNT_UPDATE_EMPTY` | 409 | PATCH contains no editable fields |
| `INVALID_ACCOUNT` | 400 | Account structure or visual field is invalid |
| `INVALID_ACCOUNT_NAME` | 400 | Account name is invalid |

### Categories

| Code | Status | Meaning |
|---|---:|---|
| `CATEGORY_HAS_TRANSACTIONS` | 409 | Delete requires merge into another category |
| `CATEGORY_INVALID_LIST_QUERY` | 400 | Pagination/filter query is invalid |
| `CATEGORY_INVALID_MERGE` | 409 | Merge target is invalid |
| `CATEGORY_NAME_ALREADY_EXISTS` | 409 | Active normalized name/type already exists |
| `CATEGORY_NOT_FOUND` | 404 | Category is missing, inaccessible, or invisible |
| `CATEGORY_NOT_MANAGEABLE` | 409 | System, technical, or archived category rejects action |
| `CATEGORY_UPDATE_EMPTY` | 409 | PATCH contains no editable fields |
| `INVALID_CATEGORY` | 400 | Category violates a domain rule |
| `TECHNICAL_CATEGORY_CANNOT_BE_CREATED` | 400 | Client attempted to create a technical category |

## Fallback By Transport Status

Use only when the payload is missing, malformed, legacy, or has an unknown code:

| Condition | User-facing direction |
|---|---|
| Offline, timeout, DNS, no response | Explain connection failure and offer retry |
| 400 | Ask user to review provided data |
| 401 | Run session recovery; otherwise request sign-in |
| 403 | Explain that the action is unavailable to this user |
| 404 | Show contextual not-found state |
| 409 | Explain that the current state conflicts with the action |
| 429 | Ask user to wait and try again |
| 500+ | `Serviço indisponível no momento`; preserve state and offer retry |

Do not infer a specific business rule from status alone.
