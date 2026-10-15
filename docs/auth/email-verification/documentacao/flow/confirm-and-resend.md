---
area: auth
feature: email-verification
type: documentation-flow
status: current
related:
  - ../decisions/pending-session-capability.md
  - ../decisions/resend-status-polling.md
  - ../components/verification-panels.md
---

# Confirmar e reenviar verificação

## Confirmação pública

`/verification-email?token=...` exige ação explícita. Depois de `VERIFIED`, a URL perde o token; se houver sessão, o perfil é sincronizado e define o destino. Token ausente, inválido ou expirado recebe estado próprio e recuperação segura. Os códigos principais são `EMAIL_VERIFICATION_TOKEN_INVALID`, `EMAIL_VERIFICATION_TOKEN_EXPIRED` e `EMAIL_VERIFICATION_USER_BLOCKED`.

## Página pendente

`/email-verification-pending` exige usuário pendente. O status operacional é consultado continuamente via polling em `GET /auth/email-verification/resend/status`.

- Se o status retornar `BLOCKED` com `Retry-After`, o contador visual exibe o tempo restante exato.
- Se o status retornar `ALREADY_VERIFIED` (por verificação em outra aba/dispositivo), o perfil é sincronizado e o usuário é redirecionado ao dashboard.
- Quando o usuário solicita `Reenviar email`, a resposta `QUEUED` invalida a query de status.
- Respostas 429 (`EMAIL_VERIFICATION_COOLDOWN_ACTIVE`, `EMAIL_VERIFICATION_DAILY_LIMIT_EXCEEDED` ou `TOO_MANY_REQUESTS`) extraem `Retry-After` para contagem regressiva.
- Logout continua disponível.

## Backend consumido

| Operação | Autenticação | Contrato relevante | Efeito/cache | Erros e recuperação | Fonte |
| --- | --- | --- | --- | --- | --- |
| `POST /auth/email-verification/confirm` | Pública por token | `VERIFIED` | invalida/sincroniza usuário | token inválido/expirado: orientar novo acesso | `backend/docs/integrations/auth/email-verification.md` |
| `POST /auth/email-verification/resend` | cookie | `QUEUED` ou `ALREADY_VERIFIED` | invalida usuário e status; ativa cooldown | cooldown/limite/429: aguardar prazo de retry | mesma fonte |
| `GET /auth/email-verification/resend/status` | cookie | `AVAILABLE`, `BLOCKED`, `ALREADY_VERIFIED` | polling contínuo; atualiza cooldown e auto-redirect | 503: estado indisponível; rede: tentar novamente | mesma fonte |
| `GET /users/me` | cookie | perfil/status | atualiza store/cache e rota | falha: sign-in | `backend/docs/integrations/auth/get-me.md` |

`QUEUED` confirma intenção persistida, não entrega do email.

