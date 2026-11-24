---
area: auth
type: concept
status: current
last_reviewed: 2026-11-24
related:
  - ../README.md
  - ./session-and-cookie-model.md
  - ../flows/email-verification.md
  - ../flows/link-providers.md
  - ../flows/change-password.md
  - ../decisions/pending-session-capability.md
  - ../decisions/resend-status-polling.md
  - ../decisions/provider-derived-capability.md
  - ../decisions/email-provider-gate.md
  - ../decisions/operational-status-gate.md
  - ../decisions/absolute-retry-deadline.md
  - ../reference/api-and-routes.md
---

# Estados de Verificação e Capacidades por Provider

Este documento consolidou as máquinas de estado que controlam o acesso do usuário autenticado, a verificação de e-mail, o vínculo de provedores e os gates de segurança da alteração de senha.

## Status do Usuário (`AUTH_USER_STATUS`)

Definidos em `src/features/auth/constants/auth.constants.ts` e retornados por `GET /users/me`:

| Status | Significado | Acesso na Aplicação |
| --- | --- | --- |
| `ACTIVE` | Conta ativa e e-mail verificado | Acesso pleno às rotas privadas (`/dashboard`, `/accounts`, `/categories`, `/transactions`, `/settings/*`). |
| `PENDING_EMAIL_VERIFICATION` | Sessão autenticada com e-mail ainda não confirmado | Capacidade restrita (ver [`DEC-AUTH-005`](../decisions/pending-session-capability.md)): redirecionado para `/email-verification-pending`, podendo apenas confirmar/reenviar e-mail ou sair. |
| `BLOCKED` | Conta bloqueada pelo backend | Acesso operacional bloqueado pelos guards. |
| `PENDING_PROFILE` | Estado de perfil pendente previsto no contrato | Mapeado na constante `AUTH_USER_STATUS.pendingProfile`. |

## Verificação de E-mail e Polling de Reenvio

- **Confirmação explícita:** acessar `/verification-email?token=...` não confirma o e-mail no carregamento da página; exige ação explícita do usuário (evita consumo acidental por scanners de link em provedores de e-mail). Em sucesso, o token é removido da URL e `AUTH_QUERY_KEYS.user` é invalidada.
- **Status operacional de reenvio:** `useEmailVerificationResendStatus` consulta `GET /auth/email-verification/resend/status` com `staleTime: 0`, `retry: false`, `refetchOnMount: 'always'` e `refetchOnWindowFocus: true`, combinando o payload com o header HTTP `Retry-After` via `buildEmailVerificationResendAvailability` (ver [`DEC-AUTH-006`](../decisions/resend-status-polling.md)).

## Capacidades Derivadas de `providers[]` (Fail-Closed)

A disponibilidade de cada ação de segurança em `/settings/security` é derivada estritamente da lista `user.providers[]` retornada por `GET /users/me` (ver [`DEC-AUTH-008`](../decisions/provider-derived-capability.md)):

- **Política fail-closed:** enquanto `useUser()` está carregando ou em erro, nenhuma ação de vínculo ou troca de senha é assumida como disponível.
- **Vínculo de `EMAIL` (`POST /auth/providers/link/email`):** disponível apenas quando `EMAIL` **não** consta em `user.providers[]` (usuário criado originalmente via Google). Usa o mesmo `passwordSchema` (6–50 caracteres) do cadastro.
- **Vínculo de `GOOGLE` (`GET /auth/providers/link/google`):** disponível apenas quando `GOOGLE` **não** consta em `user.providers[]`. Usa popup/callback em `/auth/link` com mensagens de janela `auth:google-link-success` e `auth:google-link-error`.

## Gates Duplos da Alteração de Senha Local

Alterar senha exige satisfazer dois gates consecutivos (fail-closed):

1. **Gate de provider ([`DEC-AUTH-009`](../decisions/email-provider-gate.md)):** `EMAIL` precisa estar presente em `user.providers[]`. Caso contrário, o fluxo não é liberado e o endpoint de status nem é consultado.
2. **Gate de status operacional ([`DEC-AUTH-012`](../decisions/operational-status-gate.md)):** `usePasswordChangeStatus` consulta `GET /auth/password/change/status` (`staleTime: 0`, `retry: false`, `refetchOnMount: 'always'`, `refetchOnWindowFocus: true`). Somente uma resposta validada com `status: true` habilita o envio.
3. **Prazo `Retry-After` absoluto ([`DEC-AUTH-010`](../decisions/absolute-retry-deadline.md)):** quando o backend informa bloqueio temporário (cooldown, limite diário, operação pendente ou limitação de custo), o frontend calcula um timestamp de vencimento absoluto a partir de `Retry-After`/payload. Quando o contador zera, o relógio local **nunca** libera o botão sozinho — ele dispara apenas uma nova consulta `GET /auth/password/change/status` para que o backend reavalie a permissão.
