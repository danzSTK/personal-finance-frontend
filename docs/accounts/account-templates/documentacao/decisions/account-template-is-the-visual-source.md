---
area: accounts
feature: account-templates
type: documentation-decision
status: current
decision-id: DEC-001
decision-status: accepted
related:
  - ../flow/create-and-update-account.md
  - ../components/account-template-components.md
  - ../../../../specs/accounts/account-templates-flow/specs/decisions.md
---

# Account template é a fonte da identidade visual

## Problema

O contrato legado armazenava `color` e `icon` diretamente na account. O
contrato atual separa identidade visual em `AccountTemplate` e mantém os campos
da raiz somente durante `DB-COMPAT-002`. Accounts institucionais ainda precisam
renderizar logo e cor curados, enquanto linhas legadas podem chegar sem
`template`.

## Decisão

Resolver a identidade visual nesta ordem:

1. `account.template.logoUrl`, `colorToken` e `iconKey`;
2. `account.color` e `account.icon` como fallback legado;
3. tom neutro e ícone coerente com `account.type`.

O frontend usa `logoUrl` sem construir URL, bucket ou storage key. Os tokens
institucionais e customizados são convertidos em tokens CSS locais. A mesma
resolução é compartilhada com os controles de account em transactions.

## Consequência

Contas novas não dependem do contrato deprecated, contas antigas continuam
legíveis durante o rollout e logos quebrados não removem o nome ou o ícone de
fallback. Inclusões futuras no catálogo exigem um novo mapeamento visual local,
mas não mudança em componentes consumidores.
