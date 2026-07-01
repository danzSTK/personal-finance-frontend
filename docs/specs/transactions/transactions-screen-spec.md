# Transactions Screen - Design And Implementation Specification

## Visao Geral

Construir a tela de transacoes do Danfy Finance com foco mobile-first, mantendo desktop denso e escaneavel. A tela deve permitir navegar por mes, alternar o tipo de transacao, aplicar filtros avancados, buscar por descricao quando o backend liberar `search`, criar receitas/despesas, confirmar pendencias, editar transacoes e excluir lancamentos permitidos.

Esta spec segue:

- `.agents/skills/frontend-design/SKILL.md`
- `.agents/skills/material-3-ui-guidance/SKILL.md`
- `.agents/skills/danfy-finance-design-system/SKILL.md`
- `.agents/skills/danfy-api-error-handling/SKILL.md`
- `docs/design-system/danfy-finance-design-system.md`
- `docs/design-system/material-3-reference.md`
- `../personal-finance-backend/docs/integrations/errors.md`
- `../personal-finance-backend/docs/integrations/date-and-time.md`
- `../personal-finance-backend/docs/integrations/response-objects.md`
- `../personal-finance-backend/docs/integrations/transactions/*`
- `../personal-finance-backend/docs/transactions/*`

## Objetivos

- Criar `TransactionsPage` em `src/features/transactions/components/pages`.
- Consumir `GET /transactions` com filtros de mes, tipo, conta, categoria, status, pagina, limite e ordenacao.
- Respeitar o shape dinamico de `summary` pelo campo `object`.
- Criar componentes compartilhados de data reutilizaveis fora de transactions.
- Reutilizar padroes de categories para busca expansivel, botao `+`, tabela desktop, cards/lista mobile, paginacao, menus e sheets.
- Separar claramente os fluxos de criar, confirmar, editar e deletar.
- Tratar `DateOnly` como string `YYYY-MM-DD`, sem conversao para datetime.
- Mapear codigos de erro de transactions em `src/shared/errors`.

## Fora De Escopo Nesta Entrega

- Implementar busca real no backend. O frontend pode renderizar o controle e manter estado local/URL, mas nao deve enviar `search` ate a API documentar o parametro.
- Anexos reais. Usar estado `Em breve`.
- Mais detalhes avancados. Usar toggle/area `Mais detalhes` com estado `Em breve`.
- Recorrencia, parcelamento, cartao de credito, faturas e investimentos.
- Delete de `TRANSFER`, bloqueado pela V0 do backend.

## Decisoes De UX

- Acao primaria: criar receita ou despesa quando a view estiver em `Receitas` ou `Despesas`.
- Informacao principal: periodo selecionado, tipo ativo, KPIs do periodo e lista de transacoes.
- Cor: `state-income` e `state-expense` apenas para semantica financeira; `destructive` para erro/delete/risco.
- Valores dos KPIs ficam em `text-app-text` por padrao. O tom do card e icone comunica receita/despesa, mas o valor do KPI nao deve virar verde/vermelho.
- Valores nas linhas/listas usam cor financeira: receitas positivas com sinal `+`, despesas negativas com sinal `-`, transferencias neutras.
- Erros bloqueantes aparecem perto da regiao afetada com `ApiErrorAlert`; toast e apenas feedback suplementar.
- Loading deve preservar estrutura com skeletons.
- Mobile deve evitar tabela horizontal. A lista mobile e a experiencia principal abaixo de `md`.
- Sheets mobile descem de cima para baixo quando forem filtros/detalhes/edicao, respeitando `100dvh`, safe area e sem consumir header do navegador.

## Contrato Backend

### Modelo De Transaction

```ts
interface Transaction {
  id: string
  accountId: string
  destinationAccountId: string | null
  categoryId: string
  type: TransactionType
  status: TransactionStatus
  amountCents: number
  date: string
  effectiveAt: string | null
  description: string | null
  direction: TransactionDirection | null
  createdAt: string
  updatedAt: string
}

type TransactionType = 'INCOME' | 'EXPENSE' | 'TRANSFER' | 'ADJUSTMENT'
type TransactionStatus = 'PENDING' | 'EFFECTIVE'
type TransactionDirection = 'INCREASE' | 'DECREASE'
```

`date` e `DateOnly`. `effectiveAt`, `createdAt` e `updatedAt` sao instantes ISO UTC.

### Listagem

```http
GET /transactions?dateFrom=2026-06-01&dateTo=2026-06-30&page=1&limit=20&sort=date:desc
```

Query documentada:

| Campo | Tipo | Uso |
| --- | --- | --- |
| `status` | `PENDING \| EFFECTIVE` | Filtro de situacao. |
| `type` | `INCOME \| EXPENSE \| TRANSFER \| ADJUSTMENT` | Filtro de tipo. |
| `accountId` | `uuid` | Origem ou destino. |
| `categoryId` | `uuid` | Categoria. |
| `dateFrom` | `YYYY-MM-DD` | Inicio inclusivo. |
| `dateTo` | `YYYY-MM-DD` | Fim inclusivo. |
| `page` | `number` | Default `1`. |
| `limit` | `number` | Default `20`, maximo `100`. |
| `sort` | `date:desc \| date:asc` | Default `date:desc`. |

Importante: sem `type`, o backend retorna somente `INCOME` e `EXPENSE`. `TRANSFER` e `ADJUSTMENT` nao entram em "Todas" na V0, a menos que uma view explicita envie `type=TRANSFER` ou `type=ADJUSTMENT`.

### Response Sem `type`

```ts
interface TransactionListOverviewResponse {
  object: 'transaction.list'
  data: Transaction[]
  meta: TransactionListMeta
  summary: {
    object: 'transaction_summary.overview'
    currentBalanceCents: number
    income: TransactionTypeSummary
    expense: TransactionTypeSummary
    balance: {
      pendingDeltaCents: number
      effectiveDeltaCents: number
      expectedBalanceCents: number
    }
  }
}

interface TransactionTypeSummary {
  pendingCents: number
  effectiveCents: number
  totalCents: number
}
```

### Response Com `type`

```ts
interface TransactionListTypeResponse {
  object: 'transaction.list'
  data: Transaction[]
  meta: TransactionListMeta
  summary: {
    object: 'transaction_summary.type'
    pendingCents: number
    effectiveCents: number
    totalCents: number
  }
}
```

O frontend deve checar `response.object === 'transaction.list'` e `summary.object` antes de acessar campos especificos.

### Mutations

Criar:

```http
POST /transactions
```

Campos:

- `accountId`
- `destinationAccountId`, quando `type=TRANSFER`
- `categoryId`, somente para `INCOME` e `EXPENSE`
- `type`
- `status`, opcional
- `amountCents`, inteiro positivo
- `date`, `YYYY-MM-DD`
- `description`
- `direction`, somente para `ADJUSTMENT`

Editar:

```http
PATCH /transactions/:id
```

Nao muda `status`. Aceita `accountId`, `destinationAccountId`, `categoryId`, `type`, `amountCents`, `date`, `description` e `direction`.

Confirmar:

```http
PATCH /transactions/:id/confirm
```

Muda `PENDING` para `EFFECTIVE`, preenche `effectiveAt` e pode receber ajustes finais. Na UI de confirmar V0, expor apenas valor, data e conta para manter o fluxo limpo.

Deletar:

```http
DELETE /transactions/:id
```

Permitido para `INCOME`, `EXPENSE` e `ADJUSTMENT`. `TRANSFER` retorna `TRANSACTION_CANNOT_DELETE_TRANSFER`.

## DateOnly

Obrigatorio:

- `dateFrom`, `dateTo` e `date` devem ser strings literais `YYYY-MM-DD`.
- Comparar atraso usando string civil normalizada, nao `Date`.
- Criar util compartilhado para `DateOnly`.

Proibido:

```ts
new Date(dateOnly).toISOString()
new Date(year, month, day).toISOString()
```

Utilitarios recomendados em `src/shared/utils/dateOnly.ts`:

```ts
interface YearMonth {
  year: number
  month: number
}

type DatePreset = 'today' | 'yesterday' | 'custom'

getTodayDateOnly(): string
getYesterdayDateOnly(): string
formatDateOnlyForDisplay(value: string): string
compareDateOnly(a: string, b: string): -1 | 0 | 1
isPastDateOnly(value: string, today?: string): boolean
getMonthStartDateOnly(value: YearMonth): string
getMonthEndDateOnly(value: YearMonth): string
shiftYearMonth(value: YearMonth, deltaMonths: number): YearMonth
formatMonthYearLabel(value: YearMonth): string
```

`src/shared/utils/formatters.ts` tem `formatDate(date: Date | string)` que converte string para `Date`; nao usar esse helper para `transactions.date`.

## Arquitetura Frontend

### Feature

```txt
src/features/transactions/
  api/
    mutations.ts
    queries.ts
  components/
    molecules/
      TransactionCreateButton.tsx
      TransactionKpiCard.tsx
      TransactionStatusPill.tsx
      TransactionTypeSelect.tsx
    organisms/
      TransactionConfirmSheet.tsx
      TransactionDeleteDialog.tsx
      TransactionDetailsSheet.tsx
      TransactionFiltersSheet.tsx
      TransactionFormSheet.tsx
      TransactionsKpiGrid.tsx
      TransactionsSkeleton.tsx
      TransactionsStatePanels.tsx
      TransactionsTable.tsx
      TransactionsToolbar.tsx
    pages/
      TransactionsPage.tsx
  constants/
    transaction.constants.ts
  schemas/
    transaction.schema.ts
  types/
    transaction.types.ts
    transaction-ui.types.ts
  utils/
    transaction.utils.ts
```

### Shared Components Novos

```txt
src/shared/components/molecules/ExpandableSearch.tsx
src/shared/components/molecules/MonthYearPicker.tsx
src/shared/components/molecules/DateOnlyPicker.tsx
src/shared/components/molecules/DateOnlyRangePicker.tsx
src/shared/components/organisms/ResponsiveActionSheet.tsx
src/shared/utils/dateOnly.ts
```

Regras:

- `ExpandableSearch` nasce da busca de categories e deve substituir o helper local `CategorySearch` depois ou em tarefa separada.
- `MonthYearPicker` substitui gradualmente `AccountsPeriodPicker`.
- `DateOnlyPicker` usa calendario completo para data unica.
- `DateOnlyRangePicker` usa dois campos `dateFrom` e `dateTo` com calendario completo.
- `ResponsiveActionSheet` deve permitir `side="right"` no desktop e `side="top"` no mobile, com altura baseada em `calc(100dvh - var(--safe-area-inset-top, 0px))`; o scroll interno fica apenas no conteudo.

## Navegacao E Rotas

Adicionar:

- `AUTH_ROUTES.transactions = '/transactions'`
- `MainSection` inclui `'transactions'`
- `primaryNavigation` inclui item "Transacoes" com icon lucide adequado, como `ReceiptText` ou `ArrowLeftRight`.
- `src/app/routes/index.tsx` inclui rota privada para `TransactionsPage`.

## Estado Da Pagina

Estado minimo:

```ts
type TransactionView = 'ALL' | 'EXPENSE' | 'INCOME' | 'TRANSFER'

interface TransactionFilters {
  accountId: string | null
  categoryId: string | null
  status: 'PENDING' | 'EFFECTIVE' | null
  dateFrom: string
  dateTo: string
}
```

Defaults:

- `view = 'ALL'`
- periodo inicial = mes atual
- `dateFrom = primeiro dia do mes`
- `dateTo = ultimo dia do mes`
- `page = 1`
- `limit = 20`
- `sort = 'date:desc'`
- `searchDraft = ''`, sem enviar para API ainda

Quando o usuario muda mes, tipo, filtros, limit ou search futura, resetar `page` para `1`.

## Header De Periodo

Componente: `TransactionsPeriodHeader` ou uso direto de `MonthYearPicker`.

Layout inspirado no anexo:

```txt
<    Junho 2026    >
```

Comportamento:

- Botao esquerdo: mes anterior.
- Botao central: abre `MonthYearPicker`.
- Botao direito: proximo mes.
- O label central usa `capitalize` visual, ex.: `Junho 2026`.
- Todos os botoes tem `aria-label` e `title`.

`MonthYearPicker`:

- Desktop: popover compacto.
- Mobile: sheet/dialog responsivo.
- Header com ano e setas de ano.
- Meses em grid.
- Mobile usa `grid-cols-3`, nao lista vertical gigante.
- Desktop pode usar `grid-cols-4`.
- Acoes: `Cancelar` e `Mes atual`.

## Toolbar

### Desktop E Tablet

Mesma linha:

- esquerda: `TransactionTypeSelect`
- direita: `ExpandableSearch`, `TransactionCreateButton` quando aplicavel, `FilterToggle`

`TransactionTypeSelect`:

- opcoes: `Todas`, `Despesas`, `Receitas`, `Transferencias`
- `Todas` nao envia `type`.
- `Despesas` envia `type=EXPENSE`.
- `Receitas` envia `type=INCOME`.
- `Transferencias` envia `type=TRANSFER`.

`FilterToggle`:

- icon button com `SlidersHorizontal` ou `ListFilter`.
- estado ativo quando qualquer filtro avancado difere do default.
- abre sheet lateral no desktop.

### Mobile

Primeira linha:

- `TransactionTypeSelect` no topo, full width ou flexivel.
- lado direito/linha seguinte: search, `+` quando aplicavel e menu `...`.

Menu `...`:

- abre opcoes, incluindo `Filtros`.
- `Filtros` abre sheet de cima para baixo.

`TransactionCreateButton`:

- Aparece apenas em `Despesas` e `Receitas`.
- Tipo preselecionado conforme select.
- Reusar animacao do `CategoryCreateButton`: `h-11 w-11`, hover/focus expande label no desktop.
- Em mobile pode permanecer icon-only com `title`/`aria-label`.

## Filtros

`TransactionFiltersSheet`:

- Desktop: sheet lateral direito.
- Mobile: sheet top-down.
- Campos:
  - categoria
  - conta
  - situacao: todas, pendente, efetuada
  - periodo customizado: `dateFrom`, `dateTo`
- Categorias:
  - Quando view for `INCOME`, listar categorias `type=INCOME`.
  - Quando view for `EXPENSE`, listar categorias `type=EXPENSE`.
  - Quando view for `ALL`, permitir escolher entre categorias de receita e despesa ou mostrar select agrupado.
  - Quando view for `TRANSFER`, esconder categoria ou marcar indisponivel, porque `TRANSFER` usa categoria tecnica nao retornada por `GET /categories`.
- Contas:
  - usar `GET /accounts`, apenas contas ativas por default.
- Acoes:
  - `Aplicar filtros`
  - `Limpar`
  - `Cancelar`

Validacoes:

- `dateFrom <= dateTo` por comparacao DateOnly.
- Campos mantem valores quando erro de query/mutation ocorrer.

## KPIs

Usar `TransactionKpiCard` e `TransactionsKpiGrid`.

### View Todas

Requer `summary.object === 'transaction_summary.overview'`.

Cards:

- `Saldo atual`: `summary.currentBalanceCents`, tone brand/info.
- `Receitas`: `summary.income.totalCents`, icone/tone income.
- `Despesas`: `summary.expense.totalCents`, icone/tone expense.
- `Balanco mensal`: `summary.balance.effectiveDeltaCents` ou delta apresentado como resultado realizado do periodo.

Observacao: `expectedBalanceCents` pode aparecer como helper, nao como o KPI "balanco mensal", para nao confundir saldo projetado com resultado do mes.

### View Receitas

Requer `summary.object === 'transaction_summary.type'`.

Desktop:

- `Receitas pendentes`: `pendingCents`
- `Receitas recebidas`: `effectiveCents`
- `Total`: `totalCents`

Mobile:

- `Pendente`: `pendingCents`
- `Recebido`: `effectiveCents`

### View Despesas

Requer `summary.object === 'transaction_summary.type'`.

Desktop:

- `Despesas pendentes`: `pendingCents`
- `Despesas pagas`: `effectiveCents`
- `Total`: `totalCents`

Mobile:

- `Pendente`: `pendingCents`
- `Pago`: `effectiveCents`

### View Transferencias

Requer `summary.object === 'transaction_summary.type'`.

Cards:

- `Transferencias pendentes`
- `Transferencias efetivadas`
- `Total movimentado`

Valores neutros, sem usar income/expense.

## Tabela Desktop

Componente: `TransactionsTable`.

Acima de `md`, renderizar tabela semelhante a categories:

- `Status`
- `Data`
- `Descricao`
- `Categoria`
- `Conta`
- `Valor`
- `Acoes`

Detalhes:

- `Status`:
  - `EFFECTIVE`: `Efetuada`, icon `CheckCircle2`, tone `state-income`/info neutro.
  - `PENDING` futuro/hoje: `Pendente`, icon `Clock3`, tone `state-warning` ou `state-info`.
  - `PENDING` com `date < today` e `effectiveAt == null`: `Atrasada`, icon `CircleAlert` ou texto `!`, visual `destructive`.
- `Data`: formatar `YYYY-MM-DD` como `dd/MM/yyyy` sem timezone.
- `Descricao`: compactada com truncate; fallback `Sem descricao`.
- `Categoria`: icon + nome. Para `TRANSFER`, usar label tecnico `Transferencia` e icon neutro se a category tecnica nao vier enriquecida.
- `Conta`: nome da conta; para transferencia mostrar origem -> destino quando houver dados das duas contas.
- `Valor`:
  - income: `+ R$ ...`, `text-state-income`
  - expense: `- R$ ...`, `text-state-expense`
  - transfer: `R$ ...`, `text-app-text`
- `Acoes`: menu com:
  - `Confirmar recebimento`/`Pagar despesa` quando `PENDING`
  - `Editar`
  - `Excluir`

## Lista Mobile

Abaixo de `md`, nao usar tabela. Renderizar lista de itens clicaveis.

Item:

- Icone da categoria.
- Titulo: descricao compactada ou `Sem descricao`.
- Subtitulo: `<categoria> | <conta>`.
- Direita: valor com cor financeira e icon/status.
- Clique na linha abre `TransactionDetailsSheet` top-down.

O botao de acoes direto pode ficar fora do item mobile para reduzir ruido. As acoes aparecem no footer do sheet de detalhes.

## Sheet De Detalhes Mobile

`TransactionDetailsSheet`:

- Abre de cima para baixo.
- Mostra:
  - tipo: receita, despesa, transferencia
  - status com icon e nome
  - descricao
  - valor
  - data
  - categoria
  - conta origem
  - conta destino, se transferencia
  - anexos: `Em breve`
  - mais detalhes: `Em breve`
- Footer sticky:
  - `Editar receita/despesa/transferencia`
  - `Confirmar recebimento` ou `Pagar despesa` se `PENDING`
  - acao destrutiva `Excluir` dentro da edicao ou como opcao secundaria conforme densidade

## Criar Receita/Despesa

`TransactionFormSheet` em modo `create`.

Disponivel somente quando view for `INCOME` ou `EXPENSE`.

Campos V0:

- valor, `MaskedInput` currency, convertido com `currencyInputToCents`
- status: `Pendente` ou `Efetuada`
- data:
  - presets `Hoje`, `Ontem`, `Outro`
  - `Outro` abre `DateOnlyPicker`
- descricao
- categoria, filtrada pelo tipo selecionado
- conta
- anexos: `Em breve`
- toggle/area `Mais detalhes`: `Em breve`

Payload:

- `type`: vem da view ativa
- `categoryId`: obrigatorio para receita/despesa
- `amountCents`: inteiro positivo
- `date`: DateOnly
- `accountId`
- `status`
- `description`

## Confirmar Transacao

`TransactionConfirmSheet`.

Disponivel somente para `PENDING`.

Copy por tipo:

- receita: `Confirmar recebimento`
- despesa: `Pagar despesa`
- transferencia: `Confirmar transferencia`

Campos editaveis na V0:

- valor
- data
- conta

Nao expor todos os campos do update aqui, mesmo que o backend aceite, para manter confirmacao limpa. Futuramente novos campos podem entrar no edit completo sem poluir confirmacao.

Ao salvar:

- chamar `PATCH /transactions/:id/confirm`
- fechar sheet somente no sucesso
- invalidar/atualizar query de transactions e accounts quando necessario

## Editar Transacao

`TransactionFormSheet` em modo `edit`.

Deve ser fluxo separado de confirmar.

Campos permitidos conforme backend:

- type
- amountCents
- date
- description
- accountId
- destinationAccountId, quando `TRANSFER`
- categoryId, quando `INCOME`/`EXPENSE`
- direction, quando `ADJUSTMENT`
- mais detalhes: `Em breve`

Regras:

- Status nao muda por `PATCH /transactions/:id`.
- Se mudar para `TRANSFER`, exigir destino valido e diferente da origem.
- Se mudar para `INCOME`/`EXPENSE`, exigir categoria compativel.
- Se mudar para `ADJUSTMENT`, exigir `direction` e descricao, mas a UI V0 pode ocultar ajuste se nao for uma view publicamente suportada.
- Footer:
  - `Cancelar`
  - `Salvar`
  - acao `Excluir` destrutiva separada visualmente

Mobile: sheet top-down. Desktop: sheet lateral.

## Excluir Transacao

`TransactionDeleteDialog`.

Usar `AlertDialog`, nao sheet.

Conteudo:

- titulo: `Excluir despesa?`, `Excluir receita?` ou `Excluir transacao?`
- body inclui descricao e valor formatado.
- avisar que a acao nao pode ser revertida.
- `Cancelar`
- `Excluir definitivamente`

Regras:

- Para `TRANSFER`, desabilitar ou tratar erro `TRANSACTION_CANNOT_DELETE_TRANSFER` com copy especifica: `Transferencias nao podem ser excluidas nesta versao. Registre uma transferencia no sentido contrario para corrigir.`
- Fechar dialog apenas no sucesso.
- Em falha, manter dialog aberto com `ApiErrorAlert`.

## API, Query Keys E Cache

Constants:

```ts
export const TRANSACTION_API_ENDPOINTS = {
  transactions: '/transactions',
} as const

export const TRANSACTION_QUERY_KEYS = {
  transactions: ['transactions'] as const,
  list: (params: ListTransactionsParams) =>
    ['transactions', 'list', params] as const,
  detail: (transactionId: string) =>
    ['transactions', 'detail', transactionId] as const,
} as const
```

Queries:

- `useTransactions(params)`
- `useTransaction(transactionId)`

Mutations:

- `useCreateTransaction`
- `useUpdateTransaction`
- `useConfirmTransaction`
- `useDeleteTransaction`

Cache:

- Mutations que retornam body podem atualizar detail/list quando simples, mas devem invalidar `TRANSACTION_QUERY_KEYS.transactions` como fonte de verdade.
- Tambem invalidar accounts quando saldo atual/projetado puder mudar:
  - criar `EFFECTIVE`
  - editar transaction `EFFECTIVE`
  - confirmar
  - deletar `EFFECTIVE`
- Evitar retry automatico em mutations.

## Tipos De Erro E Copy

Adicionar em `src/shared/errors/apiErrorCodes.ts`:

- `INVALID_TRANSACTION`
- `TRANSACTION_ACCOUNT_UNAVAILABLE`
- `TRANSACTION_ALREADY_EFFECTIVE`
- `TRANSACTION_CANNOT_DELETE_TRANSFER`
- `TRANSACTION_CATEGORY_INCOMPATIBLE`
- `TRANSACTION_CATEGORY_UNAVAILABLE`
- `TRANSACTION_INVALID_STATE_TRANSITION`
- `TRANSACTION_NOT_FOUND`
- `TRANSACTION_UPDATE_EMPTY`

Adicionar contextos em `ApiErrorContext`:

- `transactions.list`
- `transactions.detail`
- `transactions.create`
- `transactions.update`
- `transactions.confirm`
- `transactions.delete`

Inventario por endpoint:

| Endpoint | Codes |
| --- | --- |
| `GET /transactions` | `VALIDATION_ERROR`, `UNAUTHORIZED`, `INTERNAL_SERVER_ERROR`, network/unknown |
| `GET /transactions/:id` | `TRANSACTION_NOT_FOUND`, auth/session, server/network |
| `POST /transactions` | `VALIDATION_ERROR`, `INVALID_TRANSACTION`, `TRANSACTION_ACCOUNT_UNAVAILABLE`, `TRANSACTION_CATEGORY_UNAVAILABLE`, `TRANSACTION_CATEGORY_INCOMPATIBLE` |
| `PATCH /transactions/:id` | `VALIDATION_ERROR`, `TRANSACTION_NOT_FOUND`, `TRANSACTION_UPDATE_EMPTY`, `INVALID_TRANSACTION`, `TRANSACTION_ACCOUNT_UNAVAILABLE`, `TRANSACTION_CATEGORY_UNAVAILABLE`, `TRANSACTION_CATEGORY_INCOMPATIBLE` |
| `PATCH /transactions/:id/confirm` | `TRANSACTION_NOT_FOUND`, `TRANSACTION_ALREADY_EFFECTIVE`, `INVALID_TRANSACTION`, `TRANSACTION_ACCOUNT_UNAVAILABLE`, `TRANSACTION_CATEGORY_UNAVAILABLE`, `TRANSACTION_CATEGORY_INCOMPATIBLE` |
| `DELETE /transactions/:id` | `TRANSACTION_NOT_FOUND`, `TRANSACTION_CANNOT_DELETE_TRANSFER` |

Copy sugerida:

| Code | Surface | Copy |
| --- | --- | --- |
| `INVALID_TRANSACTION` | form alert/field errors | `Revise os dados da transacao` / `Alguma informacao nao combina com as regras financeiras. Corrija os campos e tente novamente.` |
| `TRANSACTION_ACCOUNT_UNAVAILABLE` | form alert | `Conta indisponivel` / `Escolha uma conta ativa para continuar.` |
| `TRANSACTION_CATEGORY_UNAVAILABLE` | form alert | `Categoria indisponivel` / `Escolha uma categoria ativa para este tipo de transacao.` |
| `TRANSACTION_CATEGORY_INCOMPATIBLE` | field error em categoria/type | `Categoria incompativel` / `Use uma categoria do mesmo tipo da transacao.` |
| `TRANSACTION_ALREADY_EFFECTIVE` | confirm sheet alert | `Transacao ja efetivada` / `Atualize a lista para ver o estado mais recente.` |
| `TRANSACTION_CANNOT_DELETE_TRANSFER` | delete dialog alert | `Transferencia nao pode ser excluida` / `Nesta versao, corrija com uma transferencia no sentido contrario.` |
| `TRANSACTION_INVALID_STATE_TRANSITION` | sheet alert | `Esta mudanca nao esta disponivel` / `Atualize os dados e tente novamente.` |
| `TRANSACTION_NOT_FOUND` | panel/dialog alert | `Transacao nao encontrada` / `Ela pode ter sido excluida ou nao estar mais disponivel.` |
| `TRANSACTION_UPDATE_EMPTY` | edit form alert | `Nenhuma alteracao para salvar` / `Altere pelo menos um campo antes de salvar.` |

`VALIDATION_ERROR.details.fields` deve ser aplicado com `applyApiFieldErrors`, preservando valores digitados.

## Estados

Loading:

- skeleton do header de KPIs
- skeleton de tabela/lista
- botoes pendentes com texto estavel

Empty:

- Sem transacoes no periodo: explicar que novas receitas/despesas do mes aparecerao ali.
- Com filtros: `Nenhuma transacao encontrada com estes filtros`; oferecer limpar filtros.
- Em `TRANSFER`: explicar que transferencias entre contas aparecem quando cadastradas.

Error:

- Query: `TransactionsErrorState` com retry.
- Mutation: alert dentro do sheet/dialog, mantendo dados.

Unauthorized:

- Fluxo global de sessao; se terminal, copy de sessao encerrada.

## Acessibilidade

- Todos icon buttons com `aria-label` e `title`.
- Menus com labels claros.
- Sheets e dialogs retornam foco ao trigger.
- `AlertDialog` para delete com cancel visivel e Escape.
- Status nao depende de cor: usar texto + icon.
- Valores financeiros sempre com sinal/contexto.
- `numeric` em todos valores monetarios.
- Touch targets de pelo menos `44px`.

## Material 3 Mapping

- Periodo: date/month picker adaptado.
- Select de tipo: select/menu.
- Busca: search field expansivel.
- Filtros: sheet/drawer contextual.
- Criar/editar/confirmar: sheet contextual.
- Delete: dialog de confirmacao destrutiva.
- Tabela desktop: data table.
- Lista mobile: list items/cards.
- KPIs: cards informativos.
- Feedback curto: snackbar/toast apenas para sucesso ou acao nao bloqueante.

## Criterios De Aceite

- Em 320px, nao ha scroll horizontal nem corte de botoes.
- `MonthYearPicker` mobile mostra meses em grid de 3 colunas.
- Setas `<` e `>` mudam mes mantendo `dateFrom`/`dateTo` corretos.
- Clique no mes atual abre seletor de mes/ano.
- View `Todas` nao envia `type` e renderiza summary overview.
- Views `Receitas`, `Despesas` e `Transferencias` enviam `type` e renderizam summary type.
- KPIs mudam conforme view e mobile reduz receitas/despesas para dois KPIs.
- Search abre com mesma animacao de categories e nao envia parametro nao documentado.
- Filtros por categoria, conta, situacao e periodo funcionam e resetam pagina.
- Status atrasado e derivado por `PENDING`, `effectiveAt == null` e `date < today`.
- Criar receita/despesa filtra categorias pelo tipo.
- Confirmar usa rota propria e sheet proprio, expondo apenas valor, data e conta.
- Editar usa rota propria e sheet proprio com todos os campos suportados pela V0.
- Delete usa dialog destrutivo com descricao, valor e aviso de irreversibilidade.
- `TRANSFER` nao pode ser deletada sem tratamento especifico.
- Erros documentados tem copy segura e nao exibem `code`, `path` ou `message` bruto.
- `npm run lint` passa apos implementacao.
- `npm run build` passa apos rota/tipos/shared serem alterados.

## QA

- Mobile: 320x568, 375x667, 430x932.
- Desktop: 1366x768 e 1440x900.
- Views: todas, despesas, receitas, transferencias.
- Mes anterior, atual e proximo.
- Month picker em mobile e desktop.
- Filtros vazios, combinados e sem resultado.
- Status pendente futura, pendente atrasada e efetivada.
- Criar receita efetivada.
- Criar despesa pendente.
- Confirmar despesa atrasada.
- Editar descricao, valor, data, conta e categoria.
- Excluir receita/despesa.
- Tentar excluir transferencia.
- Falha de rede em listagem.
- `VALIDATION_ERROR` em formulario.
- Navegacao por teclado em header, toolbar, menus, sheets, dialog e paginacao.
