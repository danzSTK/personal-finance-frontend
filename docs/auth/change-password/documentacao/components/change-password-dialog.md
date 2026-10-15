---
area: auth
feature: change-password
type: documentation-component
status: current
related:
  - ../flow/change-password.md
  - ../decisions/email-provider-gate.md
  - ../decisions/operational-status-gate.md
  - ../decisions/absolute-retry-deadline.md
  - ../decisions/terminal-success.md
---

# Componentes de alteração de senha

## Próprios

- `ChangePasswordDialog` (organism): RHF, open state, mutation, erros de campo,
  disponibilidade antecipada, deadline, limpeza de segredos e conclusão
  terminal. O organismo mantém o trigger fail-closed e agenda a reconsulta do
  status sem habilitação otimista.
- `parseChangePasswordResponse`: valida a resposta discriminada.
- `parsePasswordChangeStatusResponse`: valida objeto e status boolean do `GET`.
- `buildPasswordChangeAvailability`: valida `Retry-After` e calcula
  `retryAtMs`; header inválido mantém indisponibilidade sem prazo inventado.
- `buildChangePasswordDto`: remove confirmação do contrato HTTP.

## Reutilizados

- `SecuritySettings` decide a capacidade a partir de providers.
- `FormField` oferece toggle acessível; `passwordSchema` centraliza 6–50.
- Dialog Radix/Shadcn, `Button` e `ApiErrorAlert` compõem a UI.
- `usePasswordChangeStatus`, `useChangePassword`, `useAuthStore`, QueryClient,
  Router e parser shared de erros/retry possuem os side effects externos.

O status e o deadline do `GET` pertencem ao TanStack Query e ao organismo; o
deadline recebido do `POST` permanece local até nova verificação. O estado de
cada toggle pertence ao `FormField`; senhas permanecem apenas na memória do
formulário. Lower Atomic Design levels não importam o dialog.
