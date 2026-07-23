---
area: transactions
feature: transfer
type: spec-design
status: current
related:
  - ./requirements.md
  - ./tasks.md
  - ./decisions.md
---

# Design - Transferências Entre Contas

## Resumo Da Solução

A feature será uma extensão do módulo frontend de transactions e consumirá os endpoints já existentes. Não haverá endpoint dedicado, mudança de schema ou migration.

O fluxo reutilizará `TransactionFormSheet`, `TransactionConfirmSheet`, a mutation de transactions, a query de accounts e os componentes visuais atuais. O atalho mobile e a view `Transferências` apenas criam um intent `TRANSFER` para o mesmo formulário.

A correção de moeda será centralizada em um atom compartilhado controlado por centavos, evitando três implementações diferentes de máscara e parsing.

## Arquitetura E Camadas Afetadas

```text
src/
├── features/
│   ├── auth/
│   │   ├── components/organisms/MobileQuickActions.tsx
│   │   ├── components/templates/AuthAppShell.tsx
│   │   └── constants/auth.constants.ts
│   ├── accounts/
│   │   └── components/organisms/AccountFormSheet.tsx
│   └── transactions/
│       ├── components/molecules/TransactionCreateButton.tsx
│       ├── components/organisms/TransactionFormSheet.tsx
│       ├── components/organisms/TransactionConfirmSheet.tsx
│       ├── components/organisms/TransactionDetailsSheet.tsx
│       ├── components/organisms/TransactionsTable.tsx
│       ├── components/pages/TransactionsPage.tsx
│       ├── constants/transaction.constants.ts
│       ├── schemas/transaction.schema.ts
│       ├── types/transaction-ui.types.ts
│       ├── types/transaction.types.ts
│       ├── utils/transaction.utils.ts
│       └── utils/transactionUrl.utils.ts
└── shared/
    ├── components/atoms/CurrencyInput.tsx
    └── utils/formatters.ts
```

Arquivos exatos podem variar durante a implementação sem mudar o contrato. Mudanças que alterem comportamento, módulos ou API exigem atualização prévia desta spec.

## Dependências Entre Módulos

```text
MobileQuickActions
       │ create=TRANSFER
       ▼
TransactionsPage ──────► TransactionFormSheet
       │                         │
       │                         ├── useAccounts (origem/destino)
       │                         ├── transactionFormSchema
       │                         └── useCreateTransaction
       │                                      │
       └──────── queries TRANSFER ◄────────────┤
                                              ├── invalidate transactions
                                              └── invalidate accounts/saldos

CurrencyInput ──► TransactionFormSheet
              ├─► TransactionConfirmSheet
              └─► AccountFormSheet
```

- `transactions` pode importar os tipos e utilitários visuais públicos de `accounts` já usados hoje.
- `auth` navega por constantes de rota e não contém regra de negócio de transferência.
- `shared` contém apenas comportamento monetário reutilizável; não conhece DTOs nem mutations.

## Contrato HTTP Existente

### Criar

```http
POST /transactions
Content-Type: application/json
```

```json
{
  "accountId": "origin-account-id",
  "destinationAccountId": "destination-account-id",
  "type": "TRANSFER",
  "status": "EFFECTIVE",
  "amountCents": 5000,
  "date": "2026-07-22",
  "description": "Reserva mensal"
}
```

### Editar

```http
PATCH /transactions/:id
```

Enviar somente campos alterados. Ao manter ou mudar para `TRANSFER`, nunca enviar category técnica.

### Confirmar

```http
PATCH /transactions/:id/confirm
```

O body pode conter ajustes finais de `accountId`, `destinationAccountId`, `amountCents`, `date` e `description`. O backend muda o status para `EFFECTIVE` e preenche `effectiveAt`.

### Listar

```http
GET /transactions?type=TRANSFER&dateFrom=2026-07-01&dateTo=2026-07-31&page=1&limit=20&sort=date:desc
```

Sem `type`, o backend retorna apenas receitas e despesas. A view dedicada precisa manter `type=TRANSFER` na query.

### Excluir

`DELETE /transactions/:id` não é uma operação válida para `TRANSFER` na V0 e retorna `TRANSACTION_CANNOT_DELETE_TRANSFER`.

## Modelos Frontend

O contrato HTTP existente já suporta:

```ts
interface CreateTransactionDto {
  accountId: string
  destinationAccountId?: string
  categoryId?: string
  type: TransactionType
  status?: TransactionStatus
  amountCents: number
  date: string
  description?: string | null
  direction?: TransactionDirection
}
```

Alterações planejadas para estado de UI:

```ts
type CreatableTransactionType = 'INCOME' | 'EXPENSE' | 'TRANSFER'

type TransactionFormSheetState =
  | { mode: 'create'; type: CreatableTransactionType }
  | { mode: 'edit'; transaction: Transaction }
  | null

interface TransactionFormValues {
  type: TransactionType
  status: TransactionStatus
  amountCents?: number
  date: string
  description: string | null
  accountId: string
  destinationAccountId: string | null
  categoryId: string | null
  direction: TransactionDirection | null
}
```

O nome final do alias pode variar, mas o create state deve aceitar `TRANSFER` de forma tipada, sem assertions amplas.

## Intent De URL E Entradas

### Atalho Mobile

Adicionar rota tipada:

```ts
transfer: `${AUTH_ROUTES.transactions}?view=TRANSFER&create=TRANSFER`
```

O parser do query param `create` deve aceitar somente os tipos realmente criáveis pela UI. O intent deve ser removido com `replace` após abrir o sheet para que refresh/back não o reexecute.

`MobileQuickActions` deve:

- remover `disabled` e `Em breve` de Transferência;
- manter o item no arco circular atual;
- fechar o popover antes da navegação;
- manter foco, Escape, backdrop e reduced motion já implementados.

### View Transferências

`TransactionsPage` deve permitir `openCreateSheet` quando `view=TRANSFER` e exibir:

- CTA `Nova transferência` no toolbar aplicável;
- CTA no estado vazio sem filtros;
- o mesmo sheet usado pelo intent mobile.

## Design Do Formulário

### Componente

Continuar usando `TransactionFormSheet` como organism. Não criar um segundo formulário ou mutation exclusivos para transferências.

### Hierarquia De Campos

Para `TRANSFER`, a ordem será:

1. Valor.
2. Situação.
3. Data.
4. Conta de origem.
5. Conta de destino.
6. Descrição opcional.

Categoria e direção não são renderizadas.

### Copy

- Título: `Nova transferência` ou `Editar transferência` quando o tipo atual for conhecido.
- Supporting text: `Mova dinheiro entre suas contas sem registrar receita ou despesa.`
- Conta principal deve ser rotulada `Conta de origem`, não apenas `Conta`.
- Destino: `Conta de destino`.
- Submit de criação: `Salvar transferência`.
- Pending copy: `Foi transferida` para `EFFECTIVE` e linguagem equivalente de previsão quando pendente.
- Sucesso: `Transferência registrada` com descrição segura e curta.

### Seletores De Conta

Reutilizar `AccountSelectLabel`, ícone, cor e nome já empregados no formulário atual.

- `activeAccounts = accounts.filter(!isArchived)`.
- `destinationAccounts = activeAccounts.filter(id !== accountId)`.
- Ao alterar origem para o destino atual, limpar `destinationAccountId` com validação imediata.
- Não inventar saldo mínimo nem bloquear saldo negativo.
- Com menos de duas contas ativas, mostrar mensagem inline informativa e desabilitar submit.

### Responsividade

- Mobile: bottom sheet atual, respeitando `100dvh`, safe area e scroll interno.
- Desktop: right sheet atual.
- Touch targets de pelo menos 44 px.
- O teclado virtual numérico deve abrir no campo monetário.

## CurrencyInput Compartilhado

### Motivação

Hoje `TransactionFormSheet` e `TransactionConfirmSheet` usam `IMask Number`, que trata o primeiro dígito como unidade inteira e exige vírgula para informar centavos. `AccountFormSheet` mantém uma implementação manual diferente. A feature deve remover essa divergência.

### Local E Responsabilidade

Criar `src/shared/components/atoms/CurrencyInput.tsx`.

Como atom, ele pode usar input nativo ou IMask, tokens, CVA e estado local de caret, mas não pode importar forms, organisms, APIs ou regras de accounts/transactions.

Contrato sugerido:

```ts
interface CurrencyInputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange'> {
  valueCents: number | null | undefined
  onValueCentsChange: (value: number | undefined) => void
  currency?: 'BRL'
}
```

### Algoritmo De Entrada

- O valor canônico é `number | undefined` em centavos.
- A apresentação BRL é derivada do inteiro; o input não mantém decimal em float.
- Em digitação ou paste, extrair apenas dígitos e interpretar o resultado como centavos.
- `1` vira `1` centavo; `12` vira `12` centavos; `123` vira `123` centavos.
- Backspace remove o último dígito significativo.
- Campo realmente vazio emite `undefined`.
- Rejeitar resultado acima de `Number.MAX_SAFE_INTEGER`.
- Manter o caret em posição previsível, normalmente no final, depois da reformatção.
- Usar `inputMode="numeric"`, classe `numeric` e label externo associado.
- `aria-invalid`, `aria-describedby`, disabled e ref devem ser repassados.

### Migrações De Formulário

- `TransactionFormSheet`: substituir `amount: string` por `amountCents?: number` no form state e schema.
- `TransactionConfirmSheet`: mesma substituição.
- `AccountFormSheet`: usar o atom diretamente sobre `initialBalanceCents` e remover display/parsing paralelo.
- `currencyInputToCents` não deve continuar sendo necessário nos submits migrados. Se permanecer para compatibilidade, deve ter testes e nenhum novo uso de produto.

## Validação E Invariantes

### Zod

O schema deve validar:

- `amountCents` definido, inteiro, positivo e seguro para transactions;
- saldo inicial inteiro, seguro e não negativo conforme o contrato de accounts;
- `date` por `isValidDateOnly`;
- origem obrigatória;
- destino obrigatório para `TRANSFER`;
- origem diferente de destino;
- `categoryId` obrigatório somente para `INCOME`/`EXPENSE`;
- `direction` ausente para `TRANSFER`.

### DTO Builders

`buildCreateTransactionDto` deve usar diretamente `values.amountCents` depois da validação.

Para `TRANSFER`:

- incluir `destinationAccountId`;
- omitir `categoryId` mesmo que exista valor antigo no form state;
- omitir `direction`;
- normalizar descrição vazia.

`buildUpdateTransactionDto` e o builder de confirmação devem aplicar as mesmas regras ao próximo estado lógico.

## Confirmação De Pendência

`TransactionConfirmSheet` deve adaptar o conteúdo quando `transaction.type === 'TRANSFER'`:

- rotular account principal como origem;
- mostrar seletor de destino com a origem excluída;
- preencher ambos a partir da transaction;
- permitir ajustes finais suportados pelo endpoint;
- enviar somente alterações relevantes, além dos campos atualmente exigidos pelo fluxo;
- preservar destination quando não alterado;
- nunca enviar category técnica.

Para `INCOME` e `EXPENSE`, o comportamento atual não deve regredir.

## Listagem, Detalhes E Ações

- A view `TRANSFER` continua enviando filtro explícito e usando `transaction_summary.type`.
- Linhas/cards devem usar `ArrowLeftRight`, tom `state-info` e valor sem sinal positivo/negativo.
- Detalhes devem mostrar `Conta de origem` e `Conta de destino`.
- A ação de excluir deve ser ocultada ou substituída por uma explicação não interativa para transferências; apenas desabilitar sem explicar não é suficiente.
- Edição e confirmação permanecem disponíveis quando o estado permitir.

## Cache E Estado De Servidor

Reutilizar `useCreateTransaction`, `useUpdateTransaction` e `useConfirmTransaction`.

Após sucesso, continuar invalidando:

- `TRANSACTION_QUERY_KEYS.transactions`;
- `ACCOUNT_QUERY_KEYS.accounts`, incluindo summaries e projeções abaixo dessa raiz.

Não adicionar Zustand nem duplicar dados de accounts em estado global.

## Tratamento De Erros

Seguir o contrato tipado atual:

| Code | Surface | Comportamento |
| --- | --- | --- |
| `VALIDATION_ERROR` | Campos + `ApiErrorAlert` quando necessário | Mapear `amountCents`, `date`, `accountId`, `destinationAccountId`, `description`, `status`, `type`; focar primeiro erro. |
| `INVALID_TRANSACTION` | `ApiErrorAlert` no sheet | Pedir revisão dos campos; preservar valores. |
| `TRANSACTION_ACCOUNT_UNAVAILABLE` | `ApiErrorAlert` próximo aos selects | Informar que uma conta não está disponível; oferecer nova tentativa/refetch seguro e preservar seleções válidas. |
| `TRANSACTION_NOT_FOUND` | Inline no edit/confirm | Informar indisponibilidade e permitir atualizar a lista. |
| `TRANSACTION_UPDATE_EMPTY` | Inline no edit | Informar que não há alteração para salvar. |
| `TRANSACTION_ALREADY_EFFECTIVE` | Inline no confirm | Atualizar estado/lista antes de nova ação. |
| `TRANSACTION_CANNOT_DELETE_TRANSFER` | Feedback seguro | Orientar transferência inversa; nunca expor detalhes técnicos. |
| `UNAUTHORIZED` | Fluxo global de sessão | Tentar recuperação; se falhar, solicitar login. |
| Rede/unknown/5xx | `ApiErrorAlert` | Manter sheet e dados, permitir retry manual seguro. |

`TRANSACTION_CATEGORY_UNAVAILABLE` e `TRANSACTION_CATEGORY_INCOMPATIBLE` não são esperados em um payload correto de transferência. Se ocorrerem, usar a resolução segura existente e registrar a inconsistência sem mostrar category técnica ao usuário.

Nenhum raw `message`, code, path ou identificador do backend deve aparecer na UI.

## Segurança E Privacidade

- Sessão continua por cookies HttpOnly e `withCredentials`.
- Não enviar `userId`.
- Não confiar no frontend para ownership; o backend continua autoritativo.
- Não registrar payloads financeiros em console, telemetry ou mensagens de erro.
- IDs só trafegam no contrato; a UI mostra nomes das contas.

## Banco De Dados E Migrations

Não há mudança de schema planejada. O backend já possui `destination_account_id`, `type=TRANSFER`, category técnica e invariantes de transferência.

Portanto:

- nenhuma migration deve ser criada;
- `docs/database/schema.md` não precisa ser alterado por esta feature frontend;
- qualquer descoberta que exija mudança de schema é uma stop condition e exige atualizar esta spec antes de continuar.

## Estratégia De Testes

### Unitários

- `CurrencyInput`/função pura: digitação `1`, `12`, `123`; backspace; vazio; paste; zero; valor máximo seguro.
- Schema: destino obrigatório, contas diferentes, amount positivo inteiro e DateOnly.
- DTO create: inclui destination e omite category/direction/user.
- DTO update/confirm: preserva ou altera destination corretamente e omite category técnica.
- Parser de URL: aceita `create=TRANSFER`, rejeita valores desconhecidos e consome intent uma vez.

### Componentes

- Sheet de criação de transferência mostra os campos e copies corretos.
- Destino exclui origem e é limpo quando se torna inválido.
- Menos de duas accounts bloqueia submit com explicação.
- Loading desabilita ações e falha preserva valores.
- Confirm sheet de transferência mostra origem e destino.
- Inputs monetários de transaction, confirm e account usam o comportamento em centavos.

### Integração Com API Mockada

- Verificar body exato de `POST /transactions` para `TRANSFER`.
- Verificar `PATCH` e confirm sem category técnica.
- Simular todos os erros esperados e validar surface/recovery.
- Confirmar invalidação de transactions e accounts.

### E2E/Navegador

- Desktop: view Transferências -> Nova transferência -> submit válido.
- Mobile: botão central -> Transferência -> sheet -> submit válido.
- Teclado: abrir, preencher selects, salvar e fechar por Escape.
- Valor: `123` renderiza `R$ 1,23` nos três inputs abrangidos.
- Transferência pendente: confirmar com origem/destino distintos.
- Detalhes: origem/destino visíveis e delete indisponível com explicação.

## Observabilidade E Documentação

- Não adicionar logs de valores financeiros.
- Atualizar `docs/specs/transactions/transactions-screen-spec.md` somente se a implementação mudar o contrato mais amplo daquela tela.
- Manter `tasks.md` atualizado durante a implementação.
- Registrar qualquer trade-off novo em `decisions.md` antes de desviar deste design.

## Trade-offs

- Reutilizar o sheet atual reduz duplicação, mas exige separar copy e campos por tipo com clareza.
- Um `CurrencyInput` controlado por centavos exige cuidado explícito com caret, porém elimina parsing decimal divergente e mantém precisão.
- Excluir a origem das opções de destino evita erro antes do submit, mas ainda é necessário validar no schema e aceitar o backend como autoridade.

## Gate De Aprovação

Este design foi aprovado explicitamente pelo usuário em 2026-07-22 e passa a ser o contrato técnico da implementação.
