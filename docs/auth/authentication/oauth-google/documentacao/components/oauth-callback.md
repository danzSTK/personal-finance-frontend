---
area: auth
feature: authentication
subfeature: oauth-google
type: documentation-component
status: current
related:
  - ../flow/google-login.md
  - ../decisions/callback-without-token-query.md
---

# Componentes de OAuth Google

- `SocialButton` (molecule) inicia o redirect usando endpoint constante e base
  configurada.
- `AuthCallbackPage` (template de rota) é dono da sincronização final,
  feedback, store/cache e navegação.
- `api`, `AUTH_API_ENDPOINTS`, `AUTH_QUERY_KEYS` e `resolvePostAuthRoute`
  compõem a integração sem expor tokens.
- `Toaster` apresenta falha/sucesso não bloqueante; não substitui estado de
  carregamento da página.

O callback de login é distinto de `LinkProviderCallbackPage`, que pertence ao
fluxo autenticado de providers e comunica resultado à janela de origem.
