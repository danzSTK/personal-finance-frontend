---
area: transactions
feature: screen
type: documentation-component
status: current
related:
  - ../flow/dashboard-pending-navigation.md
  - ../decisions/pending-range-includes-future.md
  - ../../../../specs/transactions/screen/specs/design.md
---

# Estados e atalhos da tela de transações

## Árvore significativa

```text
DashboardPage
└── PendingAlertsGrid
    └── PendingAlertCard
        └── Link -> /transactions

TransactionsPage
├── TransactionsErrorState
└── TransactionsEmptyState
    ├── ícone contextual
    ├── título e descrição
    └── limpar filtros ou criar transação
```

## Responsabilidades

`DashboardPage` é dona das queries de resumo e pendências. Para cada tipo
pendente, ela usa `usePendingTransactionRange`, que compõe duas chamadas de
`useTransactions` para localizar os extremos ascendente e descendente, e
entrega ao `PendingAlertsGrid` o contador, o valor e a URL pronta. O helper
`buildPendingDashboardTransactionsUrl`, em `features/auth/utils`, concentra a
composição do deep link sem remover filtros preexistentes.

`TransactionsEmptyState` é um organismo de estado da listagem. O contêiner
externo mantém espaçamento, alinhamento e conteúdo, mas não usa borda nem
preenchimento tonal. O tom de receita, despesa ou transferência permanece no
ícone contextual e nas ações aplicáveis, evitando um card decorativo ao redor de
todo o estado vazio.

`TransactionsErrorState` permanece separado e usa `ApiErrorAlert` com ação de
retry, pois falha de consulta é um estado bloqueante diferente de ausência de
dados.

## Estado, dependências e acessibilidade

- O estado de filtros compartilhável pertence à URL de `TransactionsPage`.
- Dados remotos pertencem ao TanStack Query por meio de `useTransactions` e do hook composto `usePendingTransactionRange`.
- O helper de link usa somente strings `DateOnly` e os builders públicos da
  feature transactions.
- Links e botões continuam navegáveis por teclado e com nomes acessíveis.
- Cor não comunica ausência de dados sozinha: título, descrição e ação continuam
  visíveis.
- Não há nova cor; todos os tons continuam vindo dos tokens Danfy.
