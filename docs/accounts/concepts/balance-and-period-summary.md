---
area: accounts
type: concept
status: current
related:
  - ../README.md
  - ../flows/list-and-filter-accounts.md
  - ../flows/account-detail-and-summary.md
  - ../decisions/account-detail-summary-is-lazy.md
---

# Saldo Derivado, `initialBalanceCents` e Filtro de Período

As contas da Danfy não expõem um campo mutável de saldo na interface: todo saldo exibido é calculado pelo backend a partir do `initialBalanceCents` somado aos lançamentos elegíveis.

## Representação Monetária (`amountCents` / `initialBalanceCents`)

- Todos os valores monetários são manipulados como **inteiros seguros em centavos** (`0` a `Number.MAX_SAFE_INTEGER`) e renderizados com `formatCurrencyFromCents` + classe `.numeric`.
- Na criação (`AccountFormSheet`), `initialBalanceCents` é opcional (`""` normalizado para `undefined`).
- Na edição, `initialBalanceCents` é exibido apenas para leitura e **nunca** enviado em `PATCH /accounts/:id`.

## Saldo Atual vs. Saldo Projetado (`projectedUntil`)

| Conceito | Campo / Origem | Varia com o mês selecionado? | Rótulo na UI |
| --- | --- | --- | --- |
| **Saldo atual** | `balance.currentCents` (conta) / `summary.currentCents` (`GET /accounts/summary`) | Não | `Saldo atual` |
| **Saldo no período** | `balance.projectedCents` / `summary.projectedCents` com `projectedUntil` (`YYYY-MM-DD`) | Sim (último dia civil do mês selecionado) | `Saldo no fim de <mês> de <ano>` / `Saldo no fim do período` (mês passado) ou `Saldo previsto` (mês atual/futuro) |

- `projectedUntil` é calculado como string civil `DateOnly` (`YYYY-MM-DD`, considerando ano bissexto) sem conversão via `Date.toISOString()`.
- Quando `projectedCents` não retorna número válido, a UI exibe explicitamente `Não calculado` sem fabricar zero.
- Os dois cards de resumo no topo de `/accounts` são alimentados por `GET /accounts/summary?projectedUntil=...` (agregação de servidor das contas ativas com `includeInTotal: true`).

## Resumo Efetivado do Detalhe da Conta

Ao abrir o detalhe de uma conta específica (`AccountCard`), o frontend busca receitas e despesas efetivadas daquela conta no mês selecionado em `/accounts`:

- Executa uma única consulta `GET /transactions` com `accountId`, `status=EFFECTIVE`, `dateFrom=YYYY-MM-01`, `dateTo=YYYY-MM-<ultimoDia>`, `page=1`, `limit=1`, **sem** `type`.
- Faz narrowing explícito em `summary.object === 'transaction_summary.overview'` antes de ler `summary.income.effectiveCents` e `summary.expense.effectiveCents`.
