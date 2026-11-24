# Módulo `accounts` — Instruções Locais

Este módulo gerencia contas financeiras da Danfy, o catálogo de templates visuais (institucionais e personalizados), o saldo consolidado com filtro de período, o resumo detalhado por período e ações de arquivamento/restauração/conta padrão.

## Documentação Obrigatória

Antes de planejar, editar ou revisar código neste módulo, leia:
- `docs/accounts/README.md` — Índice geral, cobertura e mapa de leitura do módulo.
- `docs/accounts/concepts/account-and-template-model.md` — Relação entre `Account` e `AccountTemplate` (`INSTITUTIONAL` vs. `CUSTOM`) e compatibilidade `DB-COMPAT-002`.
- `docs/accounts/concepts/balance-and-period-summary.md` — Saldo derivado, `initialBalanceCents`, `projectedUntil` (`DateOnly`) e resumo por período.
- `docs/accounts/flows/create-and-update-account.md` — Fluxo em 2 etapas (identidade → dados) e regras de edição.
- `docs/accounts/flows/account-detail-and-summary.md` — Detalhe responsivo e busca lazy de receitas/despesas do período.
- `docs/accounts/reference/api-and-contracts.md` — Endpoints consumidos, query keys, códigos de erro e gaps conhecidos.
- `docs/architecture/module-boundaries.md` — Fronteiras com `transactions`, `auth` e API pública em `src/features/accounts/index.ts`.

## Regras de Fronteira e Invariantes

- **`account.template` é a fonte visual primária:** campos raiz `color` e `icon` são fallback legado (`DB-COMPAT-002`). Nunca envie `template` junto com `color`/`icon` legados em mutações. Consuma `logoUrl` como retornado pela API (com fallback para ícone/cor em `onError`) sem montar URLs de CDN manualmente.
- **Classe visual imutável na edição:** contas `INSTITUTIONAL` não trocam de instituição nem viram `CUSTOM` na edição; contas legadas (`template === null`) materializam `template: { type: 'custom', colorToken, iconKey }` ao salvar.
- **`initialBalanceCents` é imutável na edição:** represente sempre em inteiros seguros de centavos (`.numeric`), exiba como somente leitura em `edit` e nunca envie no `PATCH /accounts/:id`.
- **Restrições de tipo e ações:** criação na UI V0 fixa `type: 'BANK'` e `isDefault: false` (`CASH` é provisionada automaticamente pelo backend). Respeite `canArchiveAccount` (`type !== 'CASH' && !isDefault && !isArchived`) e `canSetDefaultAccount` (`!isArchived && !isDefault`). Não existe `DELETE /accounts/:id` neste módulo.
- **Resumo do detalhe é estritamente lazy:** `GET /transactions` (`limit=1`, `status=EFFECTIVE`, sem `type`) só dispara quando o detalhe da conta está aberto (`enabled: isDetailsOpen`) e faz narrowing obrigatório em `summary.object === 'transaction_summary.overview'`.
- **Datas civis (`DateOnly`):** `projectedUntil`, `dateFrom` e `dateTo` são strings `YYYY-MM-DD` sem conversão via `Date`/`toISOString()`.
- **API pública e cache:** mantenha `src/features/accounts/index.ts` restrito à API pública (`AccountIdentity` e tipos `Account*`). Mutações invalidam `ACCOUNT_QUERY_KEYS.accounts` (`['accounts']`, `exact: false`) preservando o cache de `['account-templates']`.
- **Sincronização documental:** toda mudança em fluxos, templates, contratos de erro ou invariantes exige atualização de `docs/accounts/` e deste `AGENTS.md` na mesma entrega.
