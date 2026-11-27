---
area: auth
type: reference
status: current
last_reviewed: 2026-11-27
related:
  - ../README.md
  - ../concepts/session-and-cookie-model.md
  - ../concepts/verification-and-provider-states.md
  - ../../architecture/api-error-handling.md
  - ../../architecture/module-boundaries.md
---

# Referência de API, Rotas, Query Keys e Erros — `auth`

Fonte de verdade das rotas frontend, endpoints `/auth/*` e `/users/*`, query keys, eventos de janela e códigos de erro gerenciados em `src/features/auth/`.

Referências do contrato backend: `personal-finance-backend:docs/auth/reference/`, `personal-finance-backend:docs/users/reference/` e `personal-finance-backend:docs/integrations/frontend-error-handling.md`.

## Rotas Frontend (`AUTH_ROUTES` em `src/features/auth/constants/auth.constants.ts`)

| Constante | Rota | Acesso | Observação |
| --- | --- | --- | --- |
| `login` / `signInAlias` | `/login` e `/sign-in` | Pública | Tela de login (`signInAlias` usado no broadcast `auth_logout`). |
| `signUp` | `/sign-up` | Pública | Criação de conta por credenciais. |
| `authCallback` | `/auth/callback` | Pública (callback) | Retorno de OAuth Google (sem token em query). |
| `linkProviderCallback` | `/auth/link` | Autenticada (callback) | Retorno de vínculo Google via popup/janela. |
| `emailVerification` | `/verification-email` | Pública/Pendente | Confirmação explícita de token de verificação. |
| `emailVerificationPending` | `/email-verification-pending` | Pendente | Tela bloqueante para `PENDING_EMAIL_VERIFICATION`. |
| `dashboard` | `/dashboard` | Privada (`ACTIVE`) | Hospedada hoje em `src/features/auth/` (`DT-04`). |
| `accounts` | `/accounts` | Privada (`ACTIVE`) | Delegada ao módulo `accounts`. |
| `categories` | `/categories` | Privada (`ACTIVE`) | Delegada ao módulo `categories`. |
| `transactions` | `/transactions` | Privada (`ACTIVE`) | Delegada ao módulo `transactions`. |
| `fiscalNotes` | `/fiscal-notes` | Privada (`ACTIVE`) | Delegada a `FiscalNotesRoutePage` (`src/app/pages/`) + módulo `fiscal-notes`. |
| `settings` | `/settings` | Privada (`ACTIVE`) | Layout base de configurações. |
| `settingsAccount` | `/settings/account` | Privada (`ACTIVE`) | Perfil, username e avatar. |
| `settingsSecurity` | `/settings/security` | Privada (`ACTIVE`) | Providers, alteração de senha e sessões ativas. |
| `settingsNotifications` | `/settings/notifications` | Privada (`ACTIVE`) | Preferências de notificações. |
| `settingsPreferences` | `/settings/preferences` | Privada (`ACTIVE`) | Preferências gerais do usuário. |

Atalhos rápidos (`AUTH_QUICK_ACTION_ROUTES`):
- `income`: `/transactions?view=INCOME&create=INCOME`
- `expense`: `/transactions?view=EXPENSE&create=EXPENSE`
- `transfer`: `/transactions?view=TRANSFER&create=TRANSFER`
- `fiscalNote`: `/transactions?view=EXPENSE&create=FISCAL_NOTE` (botão **"Ler NFC-e"** no `MobileQuickActions`)
- `category`: `/categories?create=EXPENSE`

## Endpoints Consumidos (`AUTH_API_ENDPOINTS`)

### Autenticação, Sessões, Verificação, Providers e Senha (`/auth/*`)

| Método | Endpoint | Hook / Origem | Cache / Efeito |
| --- | --- | --- | --- |
| `POST` | `/auth/sign-up` | `useSignUp` | Seguido de `GET /users/me`; atualiza `useAuthStore.setAuth`. |
| `POST` | `/auth/sign-in` | `useSignIn` | Seguido de `GET /users/me`; atualiza `useAuthStore.setAuth`. |
| `GET` | `/auth/google` | Redirecionamento navegador | Inicia fluxo OAuth Google; retorna em `/auth/callback`. |
| `POST` | `/auth/refresh` | Interceptor em `auth.api.ts` | Renovação automática serializada em `401` (com `withCredentials: true`). |
| `POST` | `/auth/logout` | `useLogout` | `onSettled`: chama `useAuthStore.logout()` + `queryClient.clear()`. |
| `GET` | `/auth/sessions` | `useSessions` | Query key `['sessions']`, `staleTime: 2 min`. |
| `DELETE` | `/auth/sessions/:jti` | `useRevokeSession` | Invalida `['sessions']` (`exact: false`). |
| `POST` | `/auth/email-verification/confirm` | `useConfirmEmailVerification` | Invalida `['user']`. |
| `POST` | `/auth/email-verification/resend` | `useResendEmailVerification` | Invalida `['user']` e `['auth', 'email-verification', 'resend-status']`. |
| `GET` | `/auth/email-verification/resend/status` | `useEmailVerificationResendStatus` | Query key `['auth', 'email-verification', 'resend-status']`, `staleTime: 0`, `retry: false`. |
| `POST` | `/auth/providers/link/email` | `useLinkEmail` | Invalida `['user']`. |
| `GET` | `/auth/providers/link/google` | Fluxo popup/navegador | Inicia vínculo Google; retorna em `/auth/link`. |
| `GET` | `/auth/password/change/status` | `usePasswordChangeStatus` | Query key `['auth', 'password-change', 'status']`, `staleTime: 0`, `retry: false`, `refetchOnMount: 'always'`. |
| `POST` | `/auth/password/change` | `useChangePassword` | `retry: false`; sucesso validado encerra sessão localmente sem `POST /auth/logout`. |

### Usuário, Perfil, Username e Avatar (`/users/*`)

| Método | Endpoint | Hook / Origem | Cache / Efeito |
| --- | --- | --- | --- |
| `GET` | `/users/me` | `fetchCurrentUser` / `useUser` | Query key `['user']`, `staleTime: 5 min`, `retry: 1`. |
| `PATCH` | `/users/me` | `useUpdateProfile` | Atualiza `['user']` e `useAuthStore.setAuth`. |
| `PUT` | `/users/me/username` | `useUpdateUsername` | Atualiza `['user']` e `useAuthStore.setAuth`. |
| `GET` | `/users/usernames/:username/availability` | `useUsernameAvailability` | Query key `['user', 'username-availability', username]`, `staleTime: 30 s`, `retry: false`. |
| `PUT` | `/users/me/avatar` | `useUpdateUserAvatar` | `multipart/form-data` (`file`); atualiza `avatarUrl` no cache/store e invalida `['user']`. |
| `DELETE` | `/users/me/avatar` | `useRemoveUserAvatar` | Define `avatarUrl: null` no cache/store e invalida `['user']`. |

## Eventos de Janela e Storage

| Canal | Chave / Evento | Uso |
| --- | --- | --- |
| `window` (`CustomEvent`) | `auth:email-verification-required` | Disparado pelo interceptor em `403 EMAIL_VERIFICATION_REQUIRED`. |
| `window.postMessage` | `auth:google-link-success` / `auth:google-link-error` | Comunicação entre popup `/auth/link` e tela `/settings/security`. |
| `sessionStorage` | `auth-storage` | Persistência de `useAuthStore` por aba (sem tokens). |
| `localStorage` | `auth_logout` | Broadcast instantâneo de logout entre abas. |
| `localStorage` | `auth:sidebar-collapsed` | Estado persistido da sidebar do `AuthAppShell`. |

## Códigos de Erro do Domínio (`src/shared/errors/apiErrorCodes.ts`)

### Sessão e Providers
- `INVALID_ACCESS_TOKEN`, `INVALID_REFRESH_TOKEN`, `POTENTIAL_SESSION_HIJACKING`, `SESSION_NOT_FOUND`
- `AUTH_PROVIDER_ALREADY_LINKED`, `AUTH_PROVIDER_LINKED_TO_ANOTHER_USER`
- Códigos de callback OAuth Google em `GOOGLE_LINK_ERROR_MESSAGES`: `missing_state`, `invalid_state`, `google_provider_conflict`.

### Verificação de E-mail
- `EMAIL_VERIFICATION_REQUIRED`, `EMAIL_VERIFICATION_COOLDOWN_ACTIVE`, `EMAIL_VERIFICATION_DAILY_LIMIT_EXCEEDED`, `EMAIL_VERIFICATION_TOKEN_EXPIRED`, `EMAIL_VERIFICATION_TOKEN_INVALID`, `EMAIL_VERIFICATION_USER_BLOCKED`, `EMAIL_VERIFICATION_STATE_UNAVAILABLE`.

### Alteração de Senha
- `CURRENT_PASSWORD_INVALID`, `NEW_PASSWORD_MUST_DIFFER`, `PASSWORD_CHANGE_EMAIL_PROVIDER_REQUIRED`, `PASSWORD_CHANGE_BLOCKED`, `PASSWORD_CHANGE_COOLDOWN_ACTIVE`, `PASSWORD_CHANGE_DAILY_LIMIT_EXCEEDED`, `PASSWORD_CHANGE_OPERATION_PENDING`, `PASSWORD_CHANGE_COST_LIMITED`, `PASSWORD_CHANGE_STATE_UNAVAILABLE`.

### Usuário, Perfil, Username e Avatar
- `USER_EMAIL_ALREADY_EXISTS`, `USERNAME_ALREADY_EXISTS`, `INVALID_USERNAME_FORMAT`, `USER_NOT_FOUND`, `USER_UPDATE_INPUT_VOID`, `INVALID_USER`.
- `AVATAR_FILE_TOO_LARGE`, `AVATAR_UPLOAD_FAILED`, `INVALID_AVATAR_IMAGE`, `PAYLOAD_TOO_LARGE`, `UNSUPPORTED_AVATAR_FILE`.
