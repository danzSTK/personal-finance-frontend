---
area: auth
feature: providers
type: documentation-decision
status: current
decision-id: DEC-001
decision-status: accepted
related:
  - ../flow/link-access-methods.md
  - ../components/security-provider-controls.md
  - ../../../change-password/documentacao/decisions/email-provider-gate.md
---

# Capacidade derivada de providers

## Problema

Oferecer alteração de senha ou vínculo já existente sem conhecer os providers
cria ações impossíveis e estado incoerente após mudanças concorrentes.

## Decisão

`GET /users/me.providers[]` determina as capacidades atuais. `EMAIL` habilita
change-password; sua ausência oferece vínculo por email. `GOOGLE` controla a
ação de vínculo social. Loading/erro não inferem capacidade.

## Consequência

`SecuritySettings` precisa atualizar a query após vínculos e continuar tratando
conflitos do backend. Features dependentes apontam para esta decisão em vez de
duplicar heurísticas.
