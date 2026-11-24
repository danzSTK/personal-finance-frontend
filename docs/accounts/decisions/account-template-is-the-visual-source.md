---
area: accounts
type: decision
status: current
decision-id: DEC-001
decision-status: accepted
related:
  - ../README.md
  - ../concepts/account-and-template-model.md
  - ../flows/create-and-update-account.md
  - ../components/account-components.md
  - ../../specs/accounts/account-templates-flow/specs/decisions.md
---

# `account.template` é a fonte visual primária da conta

## Problema

Contas passaram a carregar `templateId` e `template`, enquanto `color` e `icon` na raiz permanecem temporariamente por compatibilidade (`DB-COMPAT-002`). Sem uma fonte visual primária clara, cards, detalhes e seletores de transações divergiriam entre contas institucionais, personalizadas e legadas.

## Decisão

Definir `account.template` como fonte visual primária e concentrar a resolução em `resolveAccountVisual` + `AccountIdentity`:
- contas institucionais exibem `logoUrl` retornado pela API (com fallback automático para ícone + tom em `onError`);
- contas personalizadas exibem ícone e `colorToken` do template;
- contas legadas sem `template` usam `account.color`/`account.icon` apenas como fallback até serem editadas;
- todos os tokens visuais (20 customizados + 10 institucionais) são mapeados para variáveis estáticas `--account-*` em `src/index.css`.

## Consequência

- Garante apresentação consistente entre `/accounts` e todos os seletores/detalhes de `/transactions` via API pública `AccountIdentity`.
- O frontend não monta URLs de CDN/storage nem hardcoda cores fora do sistema de tokens.
- Permite remover futuramente `color`/`icon` legados tocando apenas o fallback de `resolveAccountVisual`.
