---
area: accounts
feature: account-detail-period-summary
type: spec-design
status: approved
approved-at: 2026-08-29
related:
  - ./requirements.md
  - ./tasks.md
  - ./decisions.md
---

# Resumo do período no detalhe da conta — design

## Fluxo de dados

```text
AccountsPage (mês selecionado)
  ├── datas civis + callbacks de navegação
  └── AccountCard (isDetailsOpen)
        └── useTransactions(..., { enabled: isDetailsOpen })
              └── GET /transactions?accountId&status=EFFECTIVE&dateFrom&dateTo&limit=1
                    └── summary overview → receitas/despesas
```

`useTransactions` ganha uma opção tipada `enabled`, mantendo os call sites
atuais compatíveis. Accounts importa apenas a query pública, tipos e helpers de
URL de Transactions; a query não depende de componentes de Accounts e não cria
ciclo de execução.

## Request, cache e leitura

- Parâmetros: `page=1`, `limit=1`, `sort=date:desc`, `status=EFFECTIVE`,
  `accountId`, `dateFrom` e `dateTo`.
- Sem `type`, o backend devolve `transaction_summary.overview` e considera
  somente `INCOME`/`EXPENSE`.
- A UI estreita o discriminante `summary.object` antes de ler
  `income.effectiveCents` e `expense.effectiveCents`.
- A query key existente inclui todos os parâmetros. O cache de 30 segundos pode
  ser reutilizado ao reabrir o mesmo detalhe/período.
- `enabled=false` impede fetch no render inicial; retry manual usa `refetch`.

## URL e navegação

`AccountsPage` constrói um `TransactionUrlState` e reutiliza
`buildTransactionsUrl`:

- receita/despesa: período selecionado, `view=INCOME|EXPENSE`,
  `status=EFFECTIVE`, `accountId` e página 1;
- menu geral: estado padrão do período corrente + `accountId`, fazendo o
  serializer omitir período/datas/status/view defaults.

Não haverá concatenação manual de query strings.

## UI e acessibilidade

Referências M3: dialog/bottom sheet, tooltip, progress skeleton, list/action
item e inline error.

- O grid deixa de usar `dl` para permitir células inteiras como botões sem HTML
  interativo inválido.
- Células navegáveis têm `button`, hover, foco visível, nome acessível e tooltip
  no trigger completo.
- `TrendingUp` representa receitas e `TrendingDown` representa despesas.
- Valores monetários usam `.numeric`; skeletons mantêm altura estável.
- `ApiErrorAlert` aparece após o grid e mantém o retry local.
- O scroll do formulário recebe padding interno horizontal com margem negativa,
  reservando espaço para o ring sem mudar o alinhamento visual dos campos.

## Erros

`GET /transactions` não documenta código de negócio específico. A UI usa
`resolveApiError(error, 'transactions.list')` para sessão, validação de query,
rede, status desconhecido e `INTERNAL_SERVER_ERROR`, sem expor mensagem técnica.

## Testes

- Hook: `enabled=false` não chama API; ao habilitar, envia os filtros e mantém o
  overview summary.
- Card: loading/valores, ordem, tooltip e callbacks de navegação.
- URL: receita/despesa carregam período/status/account; geral omite período.
- Form: classe do viewport rolável reserva espaço para o focus ring.
- Regressão: suíte, lint e build.
