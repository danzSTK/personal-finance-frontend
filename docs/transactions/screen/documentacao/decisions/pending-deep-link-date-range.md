---
area: transactions
feature: screen
type: documentation-decision
status: historical
decision-id: DEC-TRX-001
decision-status: superseded
superseded-by: ./pending-range-includes-future.md
related:
  - ../flow/dashboard-pending-navigation.md
  - ../components/transaction-state-panels.md
  - ../../../../specs/transactions/screen/specs/design.md
---

# Intervalo explícito nos links de pendências da dashboard

## Problema

Os cartões de receitas e despesas pendentes consultavam transações sem limitar o
período, mas o destino em `/transactions` herdava o mês selecionado na
dashboard. O contador e o valor podiam, portanto, representar pendências que não
apareciam após a navegação.

## Decisão

As consultas de pendências da dashboard usam `status=PENDING`,
`dateTo=<data civil atual>`, `sort=date:asc` e `limit=1` separadamente para
`INCOME` e `EXPENSE`. O primeiro item identifica a data mais antiga do mesmo
tipo dentro do intervalo devido até hoje.

O link preserva o estado e os filtros já presentes e adiciona explicitamente:

- `view` com o tipo do cartão;
- `status=PENDING`;
- `page=1`;
- `dateFrom` com a data da transação mais antiga;
- `dateTo` com a data civil atual.

As datas permanecem strings `DateOnly` no formato `YYYY-MM-DD`.

## Consequência

O total, o valor pendente e a listagem de destino passam a usar o mesmo limite
temporal. Transações futuras continuam pendentes no domínio, mas não entram no
painel de pendências vencidas ou devidas até hoje. A ordenação ascendente altera
somente o item retornado em `data[0]`; o `summary` e `meta.total` continuam
abrangendo todos os itens que atendem aos filtros.
