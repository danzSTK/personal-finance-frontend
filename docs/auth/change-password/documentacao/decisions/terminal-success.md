---
area: auth
feature: change-password
type: documentation-decision
status: current
decision-id: DEC-003
decision-status: accepted
related:
  - ../../../sessions/documentacao/decisions/cookie-lifecycle-and-local-sync.md
  - ../flow/change-password.md
  - ../../../../specs/auth/change-password/specs/decisions.md
---

# Sucesso terminal para todas as sessões

## Problema

Depois de `CHANGED`, o backend já revogou todas as sessões e expirou cookies;
chamar refresh ou logout HTTP produziria requests contraditórios.

## Decisão

O frontend valida `auth.password_change/CHANGED`, limpa formulário, Zustand e
QueryClient, emite a sincronização entre abas e navega para `/sign-in` com
feedback. Não executa request posterior.

## Consequência

A pessoa precisa entrar novamente com a nova senha em todos os dispositivos. O
feedback não promete entrega do email de segurança assíncrono.
