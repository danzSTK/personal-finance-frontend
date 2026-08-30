---
area: auth
feature: email-verification
type: documentation-decision
status: current
decision-id: DEC-002
decision-status: accepted
related:
  - ../flow/confirm-and-resend.md
  - ../components/verification-panels.md
  - ./pending-session-capability.md
  - ../../../../specs/auth/email-verification/specs/decisions.md
---

# Polling de status e inicialização por Retry-After

## Problema

Sem consultar o status operacional do reenvio, a página `/email-verification-pending` não sabia se o usuário estava sob cooldown de tentativas anteriores após um recarregamento e não detectava se o email já havia sido confirmado em outra aba ou dispositivo sem um reload manual.

## Decisão

Consultar `GET /auth/email-verification/resend/status` via polling no TanStack Query enquanto o usuário permanecer na página pendente. Inicializar a contagem regressiva a partir do `Retry-After` / `retryAfterSeconds` do backend e redirecionar automaticamente para `/dashboard` ao receber `ALREADY_VERIFIED`.

## Consequência

A interface reflete o estado em tempo real sem polling agressivo, o usuário não perde o tempo real de cooldown ao recarregar a tela e o fluxo de desbloqueio da conta torna-se imediato assim que a verificação for concluída.
