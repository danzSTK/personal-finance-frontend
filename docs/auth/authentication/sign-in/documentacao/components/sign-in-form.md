---
area: auth
feature: authentication
subfeature: sign-in
type: documentation-component
status: current
related:
  - ../flow/email-and-password.md
  - ../decisions/session-by-http-only-cookie.md
---

# Componentes do sign-in

## Próprios

- `SignInForm` (organism): dono do RHF, field errors, mutation e redirect.
- `LoginPage` (template atual): escolhe modo sign-in/sign-up e compõe o card.

## Reutilizados

- `FormField` (molecule): label, erro, prefixo e toggle acessível de senha.
- `SocialButton` e `Divider`: alternativa Google e separação visual.
- `Button`, `ApiErrorAlert`, `Toaster` e `BrandLogo`: shared/UI.

## Dados e limites

`signInSchema` mantém política deliberadamente simples. `useSignIn` possui os
side effects de API/store; apresentação não acessa Axios diretamente. O fluxo
depende de `resolvePostAuthRoute` e do contrato de sessão compartilhado com
OAuth, verificação de email e authenticated shell.
