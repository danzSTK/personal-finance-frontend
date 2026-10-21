---
area: transactions
feature: screen
type: documentation-flow
status: current
related:
  - ../decisions/pending-range-includes-future.md
  - ../components/transaction-state-panels.md
  - ../../../../specs/transactions/screen/specs/design.md
---

# Navegação das pendências da dashboard

## Objetivo e entrada

Permitir que a pessoa autenticada abra, a partir de `/dashboard`, todas as
receitas ou despesas pendentes que compõem o contador e o valor exibidos no
cartão correspondente, inclusive quando possuem data futura.

Pré-condições:

- sessão autenticada por cookies HttpOnly;
- API e dependências disponíveis;
- acesso à rota privada `/dashboard`.

## Fluxo principal

1. Para cada tipo, `usePendingTransactionRange` consulta
   `GET /transactions` com `status=PENDING`, `page=1` e `limit=1`.
2. A consulta `sort=date:asc` fornece a pendência mais antiga, o
   `meta.total` do conjunto completo e o `summary` tipado usado no valor.
3. A consulta `sort=date:desc` fornece a pendência com data mais distante,
   inclusive no futuro.
4. O helper `buildPendingDashboardTransactionsUrl` preserva o estado de URL
   recebido e acrescenta tipo, status e o intervalo entre os dois extremos.
5. A navegação abre `/transactions`; `TransactionsPage` interpreta os
   parâmetros e consulta o mesmo intervalo completo.

## Estados e alternativas

- **Loading:** os cartões preservam a estrutura e exibem texto de carregamento.
  Se apenas um extremo chegou, o helper usa essa data nos dois limites para não
  produzir um intervalo inválido.
- **Empty:** o contador é zero; sem extremos carregados, o link usa a data civil
  atual nos dois limites como fallback seguro.
- **Error:** `ApiErrorAlert` fica junto ao painel e oferece nova tentativa para
  cada tipo; o retry refaz as duas ordenações e mensagens técnicas não são
  expostas.
- **Pending/success:** o link permanece acessível por teclado, mantém nome
  acessível e abre o conjunto correspondente ao número exibido.
- **Datas futuras:** entram no painel e definem `dateTo` quando constituem o
  extremo mais distante.

## Segurança e privacidade

O frontend não envia `userId`. A API resolve o usuário pela sessão autenticada
e mantém o isolamento dos dados. `DateOnly` não é convertido para instante,
UTC ou timezone local.

## Consumo backend

| Operação            | Autenticação     | Contrato relevante                       | Efeito/cache                                                                                                   | Erros e recuperação                                                                          | Fonte                                                                                                                     |
| ------------------- | ---------------- | ---------------------------------------- | -------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------- |
| `GET /transactions` | Cookies HttpOnly | `type`, `status=PENDING`, `sort=date:asc | date:desc`, `page=1`, `limit=1`, sem limite de datas; resposta `transaction.list`com`transaction_summary.type` | Duas queries por tipo, cacheadas separadamente pelo conjunto exato de parâmetros e ordenação | `VALIDATION_ERROR`, `UNAUTHORIZED`, `INTERNAL_SERVER_ERROR`, rede ou payload desconhecido; alerta inline e retry de ambas | Backend: `docs/integrations/transactions/list-transactions.md` |
