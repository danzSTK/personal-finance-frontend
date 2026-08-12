---
area: auth
feature: email-verification
type: documentation-component
status: current
related:
  - ../flow/confirm-and-resend.md
  - ../decisions/pending-session-capability.md
---

# Componentes de verificação

- `EmailVerificationPage` (page): token, mutation, sincronização e continuação.
- `PendingEmailVerificationPage` (page): gate por status, cooldown, reenvio e
  logout.
- `EmailVerificationConfirmPanel` e `PendingEmailVerificationPanel`
  (organisms): apresentação dos estados e ações.
- `resolvePostAuthRoute` concentra a decisão de rota por status.
- `ApiErrorAlert`, `Toaster` e atoms shared apresentam recuperação acessível.

Tokens permanecem somente na URL recebida e no request de confirmação; a página
remove o parâmetro após sucesso. Estado de cooldown é memória local, enquanto o
backend continua autoridade para limites.
