---
area: auth
type: concept
status: current
last_reviewed: 2026-11-24
related:
  - ../README.md
  - ./verification-and-provider-states.md
  - ../flows/session-lifecycle.md
  - ../flows/authenticated-shell-routing.md
  - ../decisions/session-by-http-only-cookie.md
  - ../decisions/cookie-lifecycle-and-local-sync.md
  - ../decisions/terminal-success.md
  - ../reference/api-and-routes.md
---

# Modelo de Sessão, Cookies HttpOnly e Sincronização

Este documento descreve como o frontend da Danfy autentica requisições, mantém o estado local sincronizado com o backend e propaga encerramento de sessão entre abas.

## Cookies HttpOnly como Única Fonte de Credencial

A aplicação **nunca** armazena JWTs ou refresh tokens em `localStorage`, `sessionStorage` ou memória JavaScript, nem envia headers `Authorization: Bearer`:

- A instância Axios central (`api` em `src/features/auth/api/auth.api.ts`) configura `withCredentials: true` e header fixo `X-Requested-With: XMLHttpRequest`.
- A identidade ativa do usuário é sempre resolvida via `GET /users/me` (`fetchCurrentUser` / `useUser`), nunca por `/auth/me`.
- Callbacks de OAuth (`/auth/callback`, `/auth/link`) não recebem tokens na query string; o backend define os cookies diretamente e o frontend hidrata o usuário via `GET /users/me` (ver [`DEC-AUTH-002`](../decisions/session-by-http-only-cookie.md) e [`DEC-AUTH-004`](../decisions/callback-without-token-query.md)).

## Estado Local vs. Estado Remoto

| Camada | Artefato | Responsabilidade |
| --- | --- | --- |
| Estado remoto | `useUser()` (`AUTH_QUERY_KEYS.user = ['user']`) | Fonte autoritativa do objeto `User` (`status`, `providers`, `email`, `userName`, `avatarUrl`), `staleTime: 5 min`, `retry: 1`. |
| Estado de sessão UI | `useAuthStore` (`src/features/auth/stores/auth.store.ts`) | Mantém `user`, `isAuthenticated` e `isLoading`, persistido em `sessionStorage` sob a chave `auth-storage` apenas para hidratação rápida da interface. |
| Sessões ativas | `useSessions()` (`AUTH_QUERY_KEYS.sessions = ['sessions']`) | Lista sessões/dispositivos retornados por `GET /auth/sessions` (`staleTime: 2 min`). |

## Refresh Serializado em `401`

O interceptor de resposta em `src/features/auth/api/auth.api.ts` implementa fila única de renovação:

1. Quando uma requisição protegida retorna `401` e ainda não possui `_retry = true`:
   - Se a própria URL falhada for `/auth/refresh`, executa `useAuthStore.getState().logout()` imediatamente e rejeita o erro (evita loop infinito).
   - Se já houver um refresh em andamento (`isRefreshing === true`), a requisição é enfileirada em `failedQueue` e reexecutada assim que a promessa do refresh resolver.
   - Caso contrário, marca `_retry = true`, ativa `isRefreshing = true` e dispara `POST /auth/refresh` com uma chamada `axios.post` isolada (com `withCredentials: true`).
2. **Sucesso do refresh:** esvazia `failedQueue` resolvendo todas as promessas pendentes e refaz a requisição original.
3. **Falha do refresh:** rejeita toda a `failedQueue`, dispara `useAuthStore.getState().logout()` e propaga o erro.

## Evento Global de Verificação de E-mail (`403`)

Quando qualquer resposta retorna HTTP `403` com `code === 'EMAIL_VERIFICATION_REQUIRED'`:

- O interceptor não tenta refresh; ele despacha o evento customizado `window.dispatchEvent(new CustomEvent('auth:email-verification-required'))` (`AUTH_WINDOW_MESSAGES.emailVerificationRequired`) e rejeita o erro.
- Os guards do shell escutam esse evento para redirecionar o usuário ao fluxo de verificação pendente.

## Logout e Sincronização Entre Abas

- **`useLogout()` (`POST /auth/logout`):** no `onSettled`, sempre chama `useAuthStore.logout()` e `queryClient.clear()`, garantindo limpeza local mesmo que a chamada de logout falhe no servidor.
- **`useAuthStore.logout()`:** limpa `sessionStorage`, grava e remove imediatamente a chave `'auth_logout'` em `localStorage` (sinal de broadcast para outras abas) e zera o estado em memória.
- **Listener `storage`:** todas as abas abertas escutam `event.key === 'auth_logout'`, executam `useAuthStore.getState().clearAuth()` e redirecionam via `window.location.href = AUTH_ROUTES.signInAlias` (`/sign-in`).
- **Sucesso terminal na troca de senha (`DEC-AUTH-011`):** após `POST /auth/password/change` retornar sucesso validado, o backend já revogou todas as sessões; o frontend limpa store e cache localmente sem chamar `POST /auth/logout` nem `POST /auth/refresh`.
