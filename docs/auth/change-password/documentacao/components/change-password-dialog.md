---
area: auth
feature: change-password
type: documentation-component
status: current
related:
  - ../flow/change-password.md
  - ../decisions/email-provider-gate.md
  - ../decisions/absolute-retry-deadline.md
  - ../decisions/terminal-success.md
---

# Componentes de alteração de senha

## Próprios

- `ChangePasswordDialog` (organism): RHF, open state, mutation, erros de campo,
  deadline, limpeza de segredos e conclusão terminal.
- `parseChangePasswordResponse`: valida a resposta discriminada.
- `buildChangePasswordDto`: remove confirmação do contrato HTTP.

## Reutilizados

- `SecuritySettings` decide a capacidade a partir de providers.
- `FormField` oferece toggle acessível; `passwordSchema` centraliza 6–50.
- Dialog Radix/Shadcn, `Button` e `ApiErrorAlert` compõem a UI.
- `useChangePassword`, `useAuthStore`, QueryClient, Router e parser shared de
  erros/retry possuem os side effects externos.

O estado de cada toggle pertence ao `FormField`; senhas e deadline permanecem
locais ao organismo. Lower Atomic Design levels não importam o dialog.
