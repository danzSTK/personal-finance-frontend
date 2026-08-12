---
area: auth
feature: sessions
type: documentation-component
status: current
related:
  - ../flow/session-lifecycle.md
  - ../decisions/cookie-lifecycle-and-local-sync.md
---

# Componentes e estado de sessão

- `api` (Axios compartilhado em auth) possui cookies, refresh e fila.
- `useAuthStore` possui usuário, estado autenticado e evento cross-tab.
- `useLogout`, `useSessions` e `useRevokeSession` concentram side effects/cache.
- `SecuritySettings` compõe listagem e recuperação; `SessionCard` representa uma
  sessão e sua ação.
- `ApiErrorAlert` atende falha bloqueante da lista; toast atende revogação curta.

O `jti` é identificador de ação da sessão, nunca credencial. Estado de sidebar
em localStorage é UI do shell e não faz parte do estado autenticado.
