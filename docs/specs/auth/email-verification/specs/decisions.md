---
area: auth
feature: email-verification
type: spec-decisions
status: current
related:
  - ./requirements.md
  - ./design.md
  - ./tasks.md
---

# Decisões — verificação de email e status de reenvio

## DEC-001 — Confirmação pública e reenvio autenticado

Status: accepted

Decision: separar a confirmação por token da consulta e reenvio associados à sessão.

Impact: as duas operações têm rotas, capacidade e recuperação distintas.

## DEC-002 — Sessão pendente sem acesso financeiro

Status: accepted

Decision: manter a sessão válida enquanto o status pendente bloqueia recursos protegidos e orienta a verificação.

Impact: redirects dependem do status retornado por `GET /users/me`.

## DEC-003 — Consulta contínua via polling de status

Status: accepted

Decision: consultar `GET /auth/email-verification/resend/status` via polling em `/email-verification-pending` para sincronizar automaticamente quando a conta for verificada em outro dispositivo ou aba.

Impact: elimina a necessidade de reload da página quando o usuário confirma o email e mantém a precisão do status operacional.

## DEC-004 — Inicialização de countdown por Retry-After no primeiro acesso

Status: accepted

Decision: extrair `retryAfterSeconds` e `Retry-After` no primeiro acesso ou polling para iniciar a contagem regressiva de segurança a partir do valor real do servidor, sem assumir tempo padrão em memória.

Impact: recarregar a página ou navegar de volta mantém a fidelidade do tempo de espera informado pelo backend.

## DEC-005 — Simplificação visual com destaque de reenvio protegido

Status: accepted

Decision: remover o badge de ícone antes do título e consolidar as orientações em um único card informativo "Reenvio protegido".

Impact: reduz ruído visual, foca a atenção no título principal e na regra de intervalo de segurança e limite diário.


