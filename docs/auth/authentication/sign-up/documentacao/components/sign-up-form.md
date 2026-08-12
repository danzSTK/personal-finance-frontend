---
area: auth
feature: authentication
subfeature: sign-up
type: documentation-component
status: current
related:
  - ../flow/create-account.md
  - ../decisions/local-password-confirmation.md
---

# Componentes do sign-up

## Próprios

- `SignUpForm` (organism): RHF, validação, mutation, field errors e redirect.
- `PasswordStrength` (molecule): mostra somente o requisito real de 6–50.

## Compartilhados e cross-feature

- `FormField`: toggle independente e acessível para senha/confirmação.
- `passwordSchema`: também usado por vínculo EMAIL e change-password.
- `buildSignUpDto`: fronteira explícita entre form values e API.
- `LoginPage`, `SocialButton`, `ApiErrorAlert`, atoms e `Toaster` são
  reutilizados pelo conjunto authentication.

`SignUpForm` não conhece cookies nem token. `useSignUp` concentra API/store e
`resolvePostAuthRoute` conecta o cadastro à verificação de email.
