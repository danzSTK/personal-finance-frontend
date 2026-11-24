---
area: accounts
type: flow
status: current
related:
  - ../README.md
  - ../concepts/account-and-template-model.md
  - ../components/account-components.md
  - ../reference/api-and-contracts.md
---

# Arquivar, Restaurar e Definir Conta Padrão

Descreve as mutações de ciclo de vida acionadas a partir do `AccountActionsMenu` em `/accounts`.

## Atores, Pré-condições e Pontos de Entrada

- **Ator:** usuário autenticado em `/accounts`.
- **Pontos de entrada:** menu de ações (`AccountActionsMenu`) no canto de cada `AccountCard`.
- **Regras de elegibilidade:**
  - `Arquivar`: habilitado apenas quando `canArchiveAccount(account)` (`type !== 'CASH' && !isDefault && !isArchived`).
  - `Restaurar`: exibido apenas para contas com `isArchived === true`.
  - `Tornar padrão`: habilitado apenas quando `canSetDefaultAccount(account)` (`!isArchived && !isDefault`).
  - **Exclusão física/soft delete:** não existe `DELETE /accounts/:id` neste módulo.

## Fluxos

### 1. Arquivar Conta
1. Usuário clica em `Arquivar` → abre `AlertDialog` (`Arquivar conta?`) com explicação de impacto.
2. Ao confirmar, dispara `PATCH /accounts/:id/archive` (`useArchiveAccount`).
3. Durante pending, o botão de confirmação fica desabilitado com `Arquivando...`.
4. Em sucesso: invalida `['accounts']` (`exact: false`), fecha o dialog e exibe toast de sucesso.
5. Em erro (`ACCOUNT_CANNOT_BE_ARCHIVED`, `ACCOUNT_HAS_SCHEDULED_TRANSACTIONS`, `ACCOUNT_MUST_REMAIN_ACTIVE`, `ACCOUNT_NOT_FOUND`, etc.): exibe `ApiErrorAlert` inline (`accounts.archive`) dentro do `AlertDialog`. Cancelar/fechar limpa o erro da mutação.

### 2. Restaurar Conta
1. Em conta arquivada, usuário clica em `Restaurar` (ação imediata, sem dialog de confirmação).
2. Dispara `PATCH /accounts/:id/unarchive` (`useUnarchiveAccount`).
3. Em sucesso: invalida `['accounts']` (`exact: false`) e exibe toast de sucesso.
4. Em erro (`ACCOUNT_NOT_ARCHIVED`, `ACCOUNT_NOT_FOUND`, etc.): dispara `showApiErrorToast` (`accounts.unarchive`).

### 3. Definir Conta Padrão
1. Em conta ativa não padrão, usuário clica em `Tornar padrão` (ação imediata, sem dialog de confirmação; `AccountFormSheet` não possui toggle de conta padrão).
2. Dispara `PATCH /accounts/:id/default` (`useSetDefaultAccount`).
3. Em sucesso: invalida `['accounts']` (`exact: false`) e exibe toast de sucesso.
4. Em erro (`ACCOUNT_ALREADY_DEFAULT`, `ACCOUNT_CANNOT_BE_DEFAULT`, `ACCOUNT_ARCHIVED`, etc.): dispara `showApiErrorToast` (`accounts.set-default`).

## Consumo de Backend

| Operação | Autenticação | Contrato relevante | Efeito / Cache | Erros e recuperação | Fonte |
| --- | --- | --- | --- | --- | --- |
| `PATCH /accounts/:id/archive` | Cookie HttpOnly | Path `:id` | Invalida `['accounts']` (`exact: false`) + toast | `ApiErrorAlert` inline no `AlertDialog` (`accounts.archive`) | `personal-finance-backend:docs/integrations/accounts/archive-account.md` |
| `PATCH /accounts/:id/unarchive` | Cookie HttpOnly | Path `:id` | Invalida `['accounts']` (`exact: false`) + toast | `showApiErrorToast` (`accounts.unarchive`) | `personal-finance-backend:docs/integrations/accounts/unarchive-account.md` |
| `PATCH /accounts/:id/default` | Cookie HttpOnly | Path `:id` | Invalida `['accounts']` (`exact: false`) + toast | `showApiErrorToast` (`accounts.set-default`) | `personal-finance-backend:docs/integrations/accounts/set-default-account.md` |
