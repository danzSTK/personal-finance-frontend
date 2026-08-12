---
area: auth
feature: authentication
subfeature: sign-up
type: documentation-flow
status: current
related:
  - ../decisions/local-password-confirmation.md
  - ../components/sign-up-form.md
---

# Criar conta por credenciais

## Entrada e fluxo

Em `/sign-up`, o usuário informa username, email, senha, confirmação e nomes
opcionais. O formulário valida em tempo real, monta DTO sem confirmação e cria
a conta. A mutation consulta `GET /users/me` após o sucesso para obter o estado
canônico e preencher auth/cache.

Contas por credenciais normalmente retornam
`PENDING_EMAIL_VERIFICATION`; `resolvePostAuthRoute` encaminha para
`/email-verification-pending`. Falhas preservam os dados e aplicam field errors.
`VALIDATION_ERROR`, `USER_EMAIL_ALREADY_EXISTS` e `USERNAME_ALREADY_EXISTS`
orientam correção nos respectivos campos; falhas desconhecidas não expõem a
mensagem bruta.

## Backend consumido

| Operação | Autenticação | Contrato relevante | Efeito/cache | Erros e recuperação | Fonte |
| --- | --- | --- | --- | --- | --- |
| `POST /auth/sign-up` | Público; define cookies HttpOnly | username, email, password e nomes opcionais | cria conta/sessão e dispara email | validação/conflito: corrigir campos | `backend/docs/integrations/auth/sign-up.md` |
| `GET /users/me` | cookie `accessToken` | perfil completo e status | preenche Zustand/query | 401: sessão não concluída | `backend/docs/integrations/auth/get-me.md` |

O sucesso não afirma entrega do email; apenas a criação e o estado retornado.
