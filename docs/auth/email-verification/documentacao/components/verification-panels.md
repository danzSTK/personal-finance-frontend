---
area: auth
feature: email-verification
type: documentation-component
status: current
related:
  - ../flow/confirm-and-resend.md
  - ../decisions/pending-session-capability.md
  - ../decisions/resend-status-polling.md
---

# Componentes de verificação

- `EmailVerificationPage` (page): token, mutation de confirmação, sincronização de perfil e continuação.
- `PendingEmailVerificationPage` (page): gate por status, polling de `GET /auth/email-verification/resend/status`, contagem regressiva por `Retry-After`, mutation de reenvio e logout.
- `EmailVerificationConfirmPanel` e `PendingEmailVerificationPanel` (organisms): apresentação dos estados e ações.
- `PendingEmailVerificationPanel`: layout limpo sem ícone decorativo antes do título e com card informativo único para `"Reenvio protegido"`.
- `resolvePostAuthRoute` concentra a decisão de rota por status.
- `ApiErrorAlert`, `Toaster` e atoms shared apresentam recuperação acessível.

Tokens de confirmação pública permanecem somente na URL recebida e no request de confirmação; a página remove o parâmetro após sucesso. O estado de cooldown deriva do `Retry-After` fornecido pelo backend, garantindo fidelidade entre montagens e acessos.

