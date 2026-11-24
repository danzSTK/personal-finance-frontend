---
area: transactions
type: decision
status: historical
last_reviewed: 2026-11-24
decision-id: DEC-TRX-001
decision-status: superseded
superseded-by: ./pending-range-includes-future.md
related:
  - ../README.md
  - ../flows/dashboard-pending-navigation.md
  - ./pending-range-includes-future.md
  - ../components/transaction-screen-components.md
  - ../../specs/transactions/screen/specs/design.md
---

# DEC-TRX-001: Intervalo explícito nos links de pendências da dashboard até hoje

> **Superada por:** [`DEC-TRX-002`](./pending-range-includes-future.md). Mantida apenas para rastreabilidade histórica da evolução dos cards de pendências.

## Problema

Os cartões de receitas e despesas pendentes na Dashboard consultavam transações sem limitar o período, mas o destino em `/transactions` herdava o mês selecionado na dashboard. O contador e o valor podiam, portanto, representar pendências que não apareciam após a navegação.

## Decisão

As consultas de pendências da dashboard passavam a usar `status=PENDING`, `dateTo=<data civil atual>`, `sort=date:asc` e `limit=1` separadamente para `INCOME` e `EXPENSE`. O primeiro item identificava a data mais antiga do mesmo tipo dentro do intervalo devido até hoje.

O link preservava o estado e os filtros já presentes e adicionava explicitamente:

- `view` com o tipo do cartão;
- `status=PENDING`;
- `page=1`;
- `dateFrom` com a data da transação mais antiga;
- `dateTo` com a data civil atual.

As datas permaneciam strings `DateOnly` no formato `YYYY-MM-DD`.

## Consequência

O total, o valor pendente e a listagem de destino passaram a usar o mesmo limite temporal. Entretanto, transações planejadas para datas futuras continuavam com `status=PENDING` no domínio e ficavam de fora do painel — motivando a substituição por [`DEC-TRX-002`](./pending-range-includes-future.md).
