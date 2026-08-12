---
area: auth
feature: authentication
subfeature: sign-in
type: documentation-flow
status: current
related:
  - ../decisions/session-by-http-only-cookie.md
  - ../components/sign-in-form.md
---

# Entrar com email e senha

## Entrada e pré-condições

As rotas `/sign-in` e o alias `/login` são públicas. O usuário informa email e
senha; o schema valida email e apenas exige que a senha não esteja vazia, sem
revelar política de criação.

## Fluxo

1. `SignInForm` valida com React Hook Form/Zod e desabilita submit inválido ou
   pendente.
2. `useSignIn` cria a sessão e consulta o perfil atual.
3. O usuário entra no store/cache e recebe feedback de sucesso.
4. `resolvePostAuthRoute` leva status pendente à verificação; caso contrário,
   respeita o destino privado anterior ou usa `/dashboard`.

Credenciais incorretas usam copy genérica. Field errors documentados são
aplicados sem limpar os valores. Rede/servidor aparecem em `ApiErrorAlert`.
`VALIDATION_ERROR` corrige campos; `UNAUTHORIZED` permanece genérico para não
confirmar qual credencial falhou.

## Backend consumido

| Operação | Autenticação | Contrato relevante | Efeito/cache | Erros e recuperação | Fonte |
| --- | --- | --- | --- | --- | --- |
| `POST /auth/sign-in` | Público; define cookies HttpOnly | `{email,password}` | cria sessão | credencial/validação: corrigir; rede: tentar manualmente | `backend/docs/integrations/auth/sign-in.md` |
| `GET /users/me` | cookie `accessToken` | perfil e `status` | preenche Zustand e query `user` | 401: fluxo central de sessão | `backend/docs/integrations/auth/get-me.md` |

Senhas e cookies nunca entram em URL, logs ou storage legível por JavaScript.
