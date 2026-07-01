# Accounts Balances And Period Filter - Design Specification

## Visao Geral

Atualizar a pagina de contas para usar o novo modelo de saldo do backend:

- `balance.currentCents`: saldo atual solido;
- `balance.projectedCents`: saldo derivado ate `projectedUntil`;
- `projectedUntil`: `DateOnly` (`YYYY-MM-DD`) enviado pelo frontend;
- valores monetarios retornam em centavos inteiros.

O saldo atual nao muda quando o usuario troca o periodo. O valor derivado muda: para periodo passado, ele representa o saldo no fim daquele mes; para mes atual/futuro, representa saldo previsto.

Esta spec segue:

- `.agents/skills/frontend-design/SKILL.md`
- `.agents/skills/material-3-ui-guidance/SKILL.md`
- `.agents/skills/danfy-finance-design-system/SKILL.md`
- `.agents/skills/danfy-api-error-handling/SKILL.md`
- `../personal-finance-backend/docs/integrations/accounts/list-accounts.md`
- `../personal-finance-backend/docs/integrations/date-and-time.md`
- `../personal-finance-backend/docs/integrations/errors.md`

## Objetivo

Adicionar filtro customizado de mes/ano na pagina de contas e exibir saldos atuais e derivados conforme a response do backend, sem inventar dado financeiro.

## Componentes E Modulos Lidos

### Afetados

- `src/features/accounts/components/pages/AccountsPage.tsx`
- `src/features/accounts/components/organisms/AccountCard.tsx`
- `src/features/accounts/components/molecules/AccountSummaryCard.tsx`
- `src/features/accounts/components/organisms/AccountsSkeleton.tsx`
- `src/features/accounts/components/organisms/AccountsErrorState.tsx`
- `src/features/accounts/api/queries.ts`
- `src/features/accounts/constants/account.constants.ts`
- `src/features/accounts/types/account.types.ts`
- `src/features/accounts/utils/account.utils.ts`
- `src/shared/utils/formatters.ts`

### Reutilizaveis

- `AccountSummaryCard`: manter para cards de saldo, ajustando copy e valores.
- `AccountCard`: mostrar saldo atual e saldo derivado por conta.
- `useAccounts`: extender params/query key.
- `ApiErrorAlert` + `resolveApiError(error, 'accounts.list')`.
- `Popover`, `Dialog`, `Sheet`, `Button`, `DropdownMenu` conforme melhor comportamento responsivo.

### Criaveis

- `AccountsPeriodPicker` em `src/features/accounts/components/molecules/AccountsPeriodPicker.tsx` ou organism se carregar estado complexo.
- `accountPeriod.utils.ts`:
  - `getCurrentYearMonth(): YearMonth`
  - `getMonthEndDateOnly(yearMonth): string`
  - `compareYearMonth(a, b): 'past' | 'current' | 'future'`
  - `formatMonthLabel(yearMonth): string`
- `formatCurrencyFromCents` em shared formatter/money helper.

## Contrato Backend

Endpoint:

```http
GET /accounts?includeArchived=false&projectedUntil=2026-06-30
```

Query params:

| Campo | Tipo | Regra |
| --- | --- | --- |
| `includeArchived` | boolean | Inclui arquivadas quando `true`. |
| `projectedUntil` | `YYYY-MM-DD` | Retorna `balance.projectedCents` ate a data informada. |

Response relevante:

```json
{
  "initialBalanceCents": 100000,
  "balance": {
    "currentCents": 125000,
    "projectedCents": 98000,
    "projectedUntil": "2026-06-30"
  }
}
```

## DateOnly Vs Instant

`projectedUntil` e uma data civil. O frontend deve tratar como string literal `YYYY-MM-DD`.

Proibido para request:

```ts
new Date(year, month, day).toISOString()
```

Obrigatorio:

```ts
const projectedUntil = '2026-06-30'
```

Instantes como `createdAt` e `updatedAt` continuam sendo ISO UTC e podem ser convertidos para display.

## UX Decision Gate

- Acao primaria: criar conta.
- Informacao principal: saldo atual e saldo previsto/final do periodo.
- Cor: saldos usam hierarquia e labels, nao apenas cor.
- Erro: falha de listagem aparece perto da area de contas com retry.
- Loading: skeleton preserva cards de resumo e lista.
- Teclado: seletor de periodo, meses e acoes precisam funcionar sem mouse.
- Graficos: nao se aplica; metricas sao mais adequadas aqui.

## Design E Comportamento

### Estado Inicial

- Mes selecionado default: mes civil atual.
- Enviar `projectedUntil` como ultimo dia do mes selecionado.
- Mostrar no topo um trigger compacto com mes selecionado.

### Resumos

Card 1:

- Label: `Saldo atual`
- Valor: soma de `balance.currentCents` das contas ativas e `includeInTotal=true`.
- Helper: deve explicar que este saldo nao muda pelo filtro de periodo.

Card 2:

- Se mes selecionado for passado:
  - Label: `Saldo no fim de <mes>`
  - Valor: soma de `balance.projectedCents`.
  - Helper: saldo calculado ate o ultimo dia do periodo selecionado.
- Se mes selecionado for atual ou futuro:
  - Label: `Saldo previsto`
  - Valor: soma de `balance.projectedCents`.
  - Helper: considera movimentacoes ate o fim do periodo selecionado.

Se `projectedCents` nao vier:

- Nao inventar valor.
- Mostrar copy explicita como `Selecione um periodo para calcular` ou manter skeleton/estado indisponivel conforme o caso.

### Cards De Conta

Cada `AccountCard` deve mostrar:

- `Saldo atual`: `balance.currentCents`;
- saldo derivado:
  - `Saldo no fim do periodo` para passado;
  - `Saldo previsto` para atual/futuro;
- `includeInTotal` continua como chip textual;
- `initialBalanceCents` pode aparecer apenas como detalhe secundario, nao como saldo principal.

### Period Picker

Componente visual inspirado no anexo:

- Trigger: mes atual selecionado, ex.: `junho`.
- Superficie:
  - header com ano;
  - botoes anterior/proximo ano;
  - grid de meses;
  - acao `Cancelar`;
  - acao `Mes atual`.
- Mobile:
  - usar sheet/dialog responsivo;
  - respeitar safe area;
  - altura adaptativa;
  - targets confortaveis.
- Desktop:
  - popover ou dialog compacto, mantendo foco e escape.

Material 3 mapping:

- Period picker: date picker/month picker adaptado.
- Trigger: outlined/tonal button conforme enfase secundaria.
- Summary cards: cards informativos.
- Loading: skeleton local.
- Error: inline panel.

## Implementacao De Dados

### Types

Atualizar `Account`:

```ts
interface AccountBalance {
  currentCents: number
  projectedCents?: number
  projectedUntil?: string
}

interface Account {
  initialBalanceCents: number
  balance: AccountBalance
}
```

### Query

Atualizar params:

```ts
interface ListAccountsParams {
  includeArchived?: boolean
  projectedUntil?: string
}
```

Query key:

```ts
ACCOUNT_QUERY_KEYS.list({ includeArchived, projectedUntil })
```

Nunca usar uma key que ignore `projectedUntil`, senao o cache mistura saldos de meses diferentes.

### Summary

`buildAccountSummary(accounts)` deve retornar:

- `totalCurrentCents`;
- `totalProjectedCents`;
- `hasProjectedBalance`;
- `activeCount`;
- `archivedCount`;
- `includedCount`;
- `defaultAccount`.

Somar apenas contas ativas e `includeInTotal=true` para totais principais.

## Inventario De Erros

### `GET /accounts`

| Code | Surface | Tratamento |
| --- | --- | --- |
| `VALIDATION_ERROR` | Inline panel | `projectedUntil` ou query invalida; orientar tentar novamente/restaurar periodo. |
| `UNAUTHORIZED`/`INVALID_ACCESS_TOKEN`/`INVALID_REFRESH_TOKEN` | Fluxo global de sessao | Recuperar sessao; se falhar, pedir login. |
| `INTERNAL_SERVER_ERROR` | Inline panel | `Servico indisponivel no momento`; retry seguro. |
| Network/unknown | Inline panel | Explicar conexao e oferecer retry. |

Contexto: `accounts.list`.

### Mutations Que Invalidam A Lista

Embora esta spec foque listagem, os saldos dependem de invalidacao correta apos:

- `POST /accounts`
- `PATCH /accounts/:id`
- `PATCH /accounts/:id/archive`
- `PATCH /accounts/:id/unarchive`
- `PATCH /accounts/:id/default`

A invalidacao deve atingir todas as query keys de accounts, incluindo variantes com `projectedUntil`.

## Criterios De Aceite

- `GET /accounts` envia `projectedUntil=YYYY-MM-DD` do ultimo dia do mes selecionado.
- `projectedUntil` nunca passa por timezone/ISO instant.
- Trocar mes refaz a query.
- `Saldo atual` nao muda por causa do filtro.
- `Saldo previsto`/`Saldo no fim de <mes>` usa `projectedCents`.
- Todos os valores monetarios vindos da API sao convertidos de centavos para BRL.
- Valores usam `.numeric`.
- Query key inclui `projectedUntil`.
- Empty/provisioning/loading/error continuam intencionais.
- Period picker e navegavel por teclado e tem `title`/`aria-label` nos botoes.

## QA

- Mes atual.
- Mes futuro.
- Mes passado.
- Dezembro -> janeiro e janeiro -> dezembro ao trocar ano.
- Conta com `includeInTotal=false`.
- Conta arquivada com `includeArchived=false` e `true`.
- Response sem `projectedCents`.
- `VALIDATION_ERROR` por `projectedUntil` invalido.
- `500` e network failure.
- Mobile 320px e 375px.
- Desktop com sidebar expandida e colapsada.

