---
area: transactions
feature: screen
type: documentation-decision
status: current
decision-id: DEC-TRX-002
decision-status: accepted
supersedes: ./pending-deep-link-date-range.md
related:
  - ../flow/dashboard-pending-navigation.md
  - ../components/transaction-state-panels.md
  - ../../../../specs/transactions/screen/specs/design.md
---

# Intervalo completo das pendências da dashboard

## Problema

Limitar os cartões e links de pendências à data atual excluía transações
planejadas para datas futuras. Como essas transações continuam com
`status=PENDING`, o painel deixava de representar todo o conjunto pendente.

## Decisão

Para cada tipo, a dashboard executa duas consultas leves e sem `dateFrom` ou
`dateTo`:

- `sort=date:asc&limit=1` identifica a transação pendente mais antiga e fornece
  o `summary` e `meta.total` do conjunto completo;
- `sort=date:desc&limit=1` identifica a transação pendente com data mais
  distante, inclusive no futuro.

O deep link preserva os filtros existentes e adiciona `view`,
`status=PENDING`, `page=1`, `dateFrom` com o extremo mais antigo e
`dateTo` com o extremo mais distante. As datas permanecem strings `DateOnly`
no formato `YYYY-MM-DD`.

## Consequência

Contador, valor e listagem de destino abrangem todas as pendências do tipo,
incluindo lançamentos futuros. A dashboard realiza uma consulta adicional de um
item por tipo para descobrir o limite superior. As duas consultas compartilham o
mesmo tratamento inline de erro e são refeitas juntas pelo retry.
