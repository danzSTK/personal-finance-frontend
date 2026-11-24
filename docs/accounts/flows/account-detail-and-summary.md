---
area: accounts
type: flow
status: current
related:
  - ../README.md
  - ../concepts/balance-and-period-summary.md
  - ../decisions/account-detail-summary-is-lazy.md
  - ../components/account-components.md
  - ../reference/api-and-contracts.md
---

# Detalhe da Conta e Resumo Lazy por Período

Descreve a abertura do painel de detalhes de uma conta a partir de `AccountCard`, a consulta lazy de receitas e despesas efetivadas do período selecionado e a navegação em profundidade para `/transactions`.

## Atores, Pré-condições e Pontos de Entrada

- **Ator:** usuário autenticado em `/accounts`.
- **Gatilho:** clique ou tecla `Enter`/`Space` sobre o `AccountCard` (`role="button"`, `tabIndex={0}`). Cliques/teclas no `AccountActionsMenu` interrompem propagação.
- **Superfície responsiva:** bottom `Sheet` em mobile (`useIsMobile()`), `Dialog` (`max-w-xl`) em desktop, ambos aplicando o gradiente sutil da identidade visual (`account-detail-gradient` + `visualTone.gradientClass`).

## Fluxo Principal e Navegação

```mermaid
flowchart LR
  A[Clique/Enter no AccountCard] --> B[Abre Sheet mobile ou Dialog desktop]
  B --> C[Habilita GET /transactions limit=1 status=EFFECTIVE accountId dateFrom dateTo]
  C -->|Carregando| D[Skeletons em Receitas e Despesas]
  C -->|Sucesso overview| E[Exibe effectiveCents de Receitas e Despesas com tooltip]
  C -->|Erro| F[Preserva dados da conta + ApiErrorAlert com retry]
  E -->|Clique em Receitas/Despesas| G[/transactions com accountId, view, period e status=EFFECTIVE]
```

1. **Dados exibidos no detalhe:**
   - Cabeçalho com `AccountIdentity (size="lg")`, nome da conta e nome do template institucional (ou rótulo do tipo).
   - `Saldo atual`, `projectedBalanceLabel` + valor projetado e botão `Reajustar saldo` (placeholder desabilitado).
   - Grade 2×3: `Nome`, `Saldo inicial`, `Receitas`, `Despesas`, `Tipo da conta` e `Total geral` (`includeInTotal`).
   - Em desktop, o `Dialog` inclui o botão `Editar conta` (fecha detalhe e abre `AccountFormSheet` em modo `edit`).
2. **Resumo lazy do período:**
   - Enquanto fechado, `useTransactions` permanece desabilitado (`enabled: isDetailsOpen`).
   - Ao abrir, faz uma única chamada `GET /transactions` com `page: 1`, `limit: 1`, `sort: 'date:desc'`, `status: 'EFFECTIVE'`, `accountId`, `dateFrom` (dia 1 do mês) e `dateTo` (último dia do mês), **sem** `type`.
   - Apenas após confirmar `summary.object === 'transaction_summary.overview'`, lê `summary.income.effectiveCents` e `summary.expense.effectiveCents`.
3. **Deep links para `/transactions`:**
   - Clicar em `Receitas` ou `Despesas` usa `buildAccountPeriodTransactionsUrl` → `/transactions` com `accountId`, `status=EFFECTIVE`, `view=INCOME|EXPENSE` e `period=YYYY-MM` (omitido se mês atual).
   - Clicar em `Ver transações` no `AccountActionsMenu` usa `buildAccountTransactionsUrl(account.id)` → `/transactions?accountId=<id>` (período padrão da tela de transações).

## Estados de Interface e Recuperação

| Estado | Comportamento observado | Recuperação |
| --- | --- | --- |
| Fechado | Nenhuma chamada de transações disparada | — |
| Loading resumo | `Skeleton` apenas nas células `Receitas` e `Despesas` | Dados da conta já visíveis |
| Sucesso | Valores em BRL (`.numeric`) com `TrendingUp`/`TrendingDown`, rótulo e `Tooltip` explicando total efetivado do período | Clique abre `/transactions` filtrado |
| Erro | Células mostram `Não carregado`; dados da conta permanecem intactos; `ApiErrorAlert` (`transactions.list`) abaixo da grade | Botão `Tentar novamente` (`refetch`) |

## Consumo de Backend

| Operação | Autenticação | Contrato relevante | Efeito / Cache | Erros e recuperação | Fonte |
| --- | --- | --- | --- | --- | --- |
| `GET /transactions` | Cookie HttpOnly | `accountId`, `status=EFFECTIVE`, `dateFrom`, `dateTo`, `limit=1`, sem `type` → `transaction_summary.overview` | `['transactions', 'list', params]` (`staleTime: 30s`, `enabled: isDetailsOpen`) | `ApiErrorAlert` inline (`transactions.list`) com retry | `personal-finance-backend:docs/integrations/transactions/list-transactions.md` |
