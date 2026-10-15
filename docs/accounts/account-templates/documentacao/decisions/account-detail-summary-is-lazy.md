---
area: accounts
feature: account-templates
type: documentation-decision
status: current
decision-id: DEC-003
decision-status: accepted
related:
  - ../flow/create-and-update-account.md
  - ../components/account-template-components.md
  - ../../../../specs/accounts/account-detail-period-summary/specs/decisions.md
---

# Resumo financeiro do detalhe é carregado sob demanda

## Problema

A lista de accounts precisa permanecer leve, mas o detalhe de cada card deve
mostrar receitas e despesas efetivadas do período selecionado. Consultar
transactions para todos os cards no carregamento inicial produziria requests
que a maioria dos usuários não usaria; somar a página de itens no cliente também
seria incorreto porque o resultado é paginado.

## Decisão

Ao abrir o detalhe, habilitar uma única query `GET /transactions` sem `type`,
filtrada por `accountId`, `status=EFFECTIVE`, `dateFrom` e `dateTo`. Ler
`summary.income.effectiveCents` e `summary.expense.effectiveCents` do overview.
Usar `limit=1`, pois o backend calcula o summary sobre todos os itens filtrados
antes da paginação.

Receita e despesa são ações: seus links incluem account, período, status e view.
`Ver transações` inclui apenas account e deixa Transactions aplicar seu período
padrão.

## Consequência

Nenhum request adicional ocorre enquanto os detalhes permanecem fechados. Ao
abrir, as duas métricas compartilham cache e um único recovery. Os links são
reproduzíveis após refresh/voltar, e Accounts passa a depender do contrato
público de listagem e URL de Transactions sem replicar nomes de query params.
