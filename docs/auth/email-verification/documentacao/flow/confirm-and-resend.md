---
area: auth
feature: email-verification
type: documentation-flow
status: current
related:
  - ../decisions/pending-session-capability.md
  - ../components/verification-panels.md
---

# Confirmar e reenviar verificação

## Confirmação pública

`/verification-email?token=...` exige ação explícita. Depois de `VERIFIED`, a
URL perde o token; se houver sessão, o perfil é sincronizado e define o destino.
Token ausente, inválido ou expirado recebe estado próprio e recuperação segura.
Os códigos principais são `EMAIL_VERIFICATION_TOKEN_INVALID`,
`EMAIL_VERIFICATION_TOKEN_EXPIRED` e `EMAIL_VERIFICATION_USER_BLOCKED`.

## Página pendente

`/email-verification-pending` exige usuário pendente. Reenvio `QUEUED` inicia
cooldown local de 60 minutos; `ALREADY_VERIFIED` sincroniza perfil e continua.
Limite diário e cooldown do backend usam alertas inline. Logout continua
disponível.
`EMAIL_VERIFICATION_COOLDOWN_ACTIVE` exige espera e
`EMAIL_VERIFICATION_DAILY_LIMIT_EXCEEDED` interrompe novas solicitações no dia.

## Backend consumido

| Operação | Autenticação | Contrato relevante | Efeito/cache | Erros e recuperação | Fonte |
| --- | --- | --- | --- | --- | --- |
| `POST /auth/email-verification/confirm` | Pública por token | `VERIFIED` | invalida/sincroniza usuário | token inválido/expirado: orientar novo acesso | `backend/docs/integrations/auth/email-verification.md` |
| `POST /auth/email-verification/resend` | cookie | `QUEUED` ou `ALREADY_VERIFIED` | invalida usuário; ativa cooldown visual | cooldown/limite: aguardar | mesma fonte |
| `GET /users/me` | cookie | perfil/status | atualiza store/cache e rota | falha: sign-in | `backend/docs/integrations/auth/get-me.md` |

`QUEUED` confirma intenção persistida, não entrega do email.
