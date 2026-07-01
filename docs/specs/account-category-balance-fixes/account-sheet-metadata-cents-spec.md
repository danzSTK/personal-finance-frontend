# Account Sheet Metadata And Cents Fix - Design Specification

## Visao Geral

Atualizar o sheet de criacao/edicao de contas para o contrato novo do backend:

- dinheiro em centavos inteiros;
- `color` e `icon` como tokens oficiais aceitos pelo backend;
- experiencia V0 focada em `BANK`, sem expor cartao e investimento por enquanto;
- seletores de cor e icone no mesmo padrao de categorias: 5 opcoes visiveis + menu `...`.

Esta spec segue:

- `.agents/skills/frontend-design/SKILL.md`
- `.agents/skills/material-3-ui-guidance/SKILL.md`
- `.agents/skills/danfy-finance-design-system/SKILL.md`
- `.agents/skills/danfy-api-error-handling/SKILL.md`
- `../personal-finance-backend/docs/integrations/accounts/*`
- `../personal-finance-backend/docs/integrations/categories/get-category-metadata.md`
- `../personal-finance-backend/docs/integrations/errors.md`

## Objetivo

Remover o modelo antigo de account no frontend e alinhar o formulario com a API atual, sem mostrar opcoes de produto que ainda nao existem na experiencia.

## Componentes E Modulos Lidos

### Afetados

- `src/features/accounts/components/organisms/AccountFormSheet.tsx`
- `src/features/accounts/constants/account.constants.ts`
- `src/features/accounts/schemas/account.schema.ts`
- `src/features/accounts/types/account.types.ts`
- `src/features/accounts/utils/account.utils.ts`
- `src/features/accounts/api/mutations.ts`
- `src/features/accounts/api/queries.ts`
- `src/features/accounts/components/organisms/AccountCard.tsx`
- `src/features/accounts/components/pages/AccountsPage.tsx`
- `src/shared/utils/formatters.ts`

### Reutilizaveis

- `CategoryFormSheet` como referencia de UX para metadata: `VISIBLE_METADATA_OPTIONS = 5`, primeiras opcoes visiveis e overflow em menu.
- `useCategoryMetadata` ou uma query compartilhada para `GET /categories/metadata`.
- `ApiErrorAlert`, `resolveApiError`, `applyApiFieldErrors`.
- `AccountFormField`.
- `Button`, `Input`, `DropdownMenu`, `Sheet`.

### Criaveis

- `src/shared/utils/money.ts` ou extensao de `src/shared/utils/formatters.ts`:
  - `formatCurrencyFromCents(cents: number): string`
  - `currencyInputToCents(value: string): number | undefined`
  - `centsToCurrencyInput(cents: number): string`
- Metadata/mappers compartilhados:
  - `src/shared/constants/financialMetadata.constants.ts` ou `src/features/accounts/constants/accountMetadata.constants.ts`
  - allowlists de icones para accounts;
  - allowlists de cores para accounts;
  - fallback de icone/cor quando token desconhecido vier de cache/resposta antiga.

## Contrato Backend

### `POST /accounts`

Body novo:

```json
{
  "name": "Nubank",
  "type": "BANK",
  "initialBalanceCents": 100000,
  "color": "purple",
  "icon": "landmark",
  "includeInTotal": true,
  "isDefault": false
}
```

Regras:

- Nao enviar `userId`.
- Nao criar `CASH`.
- Na V0, criar apenas `BANK`.
- Nao enviar hex, SVG, classe CSS ou `var(--...)`.
- Enviar apenas tokens oficiais do catalogo.
- `initialBalanceCents` precisa ser inteiro e nao negativo.

### `PATCH /accounts/:id`

Body:

```json
{
  "name": "Conta principal",
  "color": "blue",
  "icon": "landmark",
  "includeInTotal": true
}
```

Regras:

- Nao enviar `initialBalanceCents`.
- Account arquivada nao aceita update comum.
- Body vazio retorna conflito.
- Para `CASH`, expor apenas nome, cor, icone e `includeInTotal`.

### Metadata Visual

Usar:

```http
GET /categories/metadata
```

O backend retorna catalogo generico:

```json
{
  "icons": [{ "key": "wallet", "label": "Carteira" }],
  "colors": [{ "key": "blue", "label": "Azul", "hex": "#3B82F6" }]
}
```

O frontend decide quais tokens aparecem para accounts e quais aparecem para categories.

## UX Decision Gate

- Acao primaria: salvar conta.
- Informacao principal: nome, saldo inicial e se entra nos totais.
- Cor: personalizacao visual, nao significado financeiro.
- Erro: campo invalido fica no campo; conflito fica em alert inline no sheet.
- Loading: submit pending desabilita acoes sem limpar valores.
- Teclado: todos os chips/botoes de cor/icone e menu `...` devem ser acessiveis.
- Graficos: nao se aplica.

## Design E Comportamento

### Tipo Da Conta

- Criacao V0:
  - nao mostrar cards/select de tipo;
  - enviar `type: 'BANK'`;
  - opcionalmente mostrar uma superficie informativa pequena com `Conta bancaria`, sem parecer uma escolha.
- Edicao:
  - nao permitir mudar tipo nesta iteracao;
  - se for `CASH`, label humano `Carteira`;
  - se for `BANK`, label humano `Conta bancaria`.

### Saldo Inicial

- Campo continua sendo currency input.
- Form state pode guardar centavos ou guardar display + converter no submit, mas DTO deve enviar `initialBalanceCents`.
- Campo vazio envia omitido ou `0`, conforme decisao da implementacao; nunca enviar decimal em reais.
- Nao manter bug de zero fixo.
- Nao usar input number com spinners.
- Exibicao sempre com `.numeric`.

### Cores

- Usar metadata do backend.
- Filtrar/ordenar no frontend para o contexto account.
- Mostrar 5 primeiras opcoes.
- Se houver mais, mostrar botao `...` com menu `Outras cores`.
- Se a cor selecionada estiver no overflow, o botao `...` precisa indicar selecao.
- Preview de cor pode usar `hex` recebido do backend somente como swatch/fallback visual de metadata; produto nao deve transformar isso em cor de layout.

### Icones

- Usar metadata do backend.
- Mapear `key` para Lucide React no frontend.
- Mostrar 5 primeiras opcoes.
- Restante em menu `Outros icones`.
- Se token desconhecido vier da API, usar fallback visual local e manter a tela funcional.

### Toggles

- `Incluir nos totais` e `Tornar padrao` permanecem como cards/switches visuais, nao checkbox cru.
- Checked de `Incluir nos totais` pode usar `state-income` apenas como sinal positivo de inclusao; texto deve explicar o significado.
- `Tornar padrao` usa `state-info` ou brand conforme hierarquia, sem linguagem tecnica.

## Inventario De Erros

### `GET /categories/metadata`

| Code | Surface | Tratamento |
| --- | --- | --- |
| `UNAUTHORIZED`/tokens invalidos | Fluxo global de sessao | Recuperar sessao; se falhar, pedir login. |
| `INTERNAL_SERVER_ERROR` | Inline alert no sheet ou fallback local | Mostrar que opcoes visuais nao carregaram; permitir usar fallback seguro se existente. |
| Network/unknown | Inline alert nao bloqueante | Manter formulario e usar fallback local quando possivel. |

Contexto: `categories.metadata`.

### `POST /accounts`

| Code | Surface | Tratamento |
| --- | --- | --- |
| `VALIDATION_ERROR` | Field errors | Mapear `name`, `type`, `initialBalanceCents`, `color`, `icon`, `includeInTotal`, `isDefault`; focar primeiro campo invalido. |
| `INVALID_ACCOUNT_NAME` | Field error em `name` | Pedir nome valido. |
| `INVALID_ACCOUNT` | Inline form alert + field errors quando houver | Revisar dados da conta; preservar valores. |
| `UNAUTHORIZED`/tokens invalidos | Fluxo global de sessao | Recuperar sessao; se falhar, pedir login. |
| `INTERNAL_SERVER_ERROR` | Inline form alert | `Servico indisponivel no momento`; manter sheet aberto. |
| Network/unknown | Inline form alert | Explicar conexao/servico e manter dados. |

Contexto: `accounts.create`.

### `PATCH /accounts/:id`

| Code | Surface | Tratamento |
| --- | --- | --- |
| `VALIDATION_ERROR` | Field errors | Mapear campos do formulario. |
| `ACCOUNT_NOT_FOUND` | Inline alert | Conta indisponivel; orientar atualizar lista. |
| `ACCOUNT_ARCHIVED`/`ACCOUNT_ARCHIVED_MUTATION` | Inline alert | Restaurar a conta antes de alterar. |
| `ACCOUNT_UPDATE_EMPTY` | Inline alert | Alterar pelo menos um campo antes de salvar. |
| `INVALID_ACCOUNT_NAME` | Field error em `name` | Pedir nome valido. |
| `INVALID_ACCOUNT` | Inline alert + field errors quando houver | Revisar dados. |
| `UNAUTHORIZED`/tokens invalidos | Fluxo global de sessao | Recuperar sessao; se falhar, pedir login. |
| `INTERNAL_SERVER_ERROR` | Inline form alert | `Servico indisponivel no momento`. |
| Network/unknown | Inline form alert | Manter sheet aberto e oferecer retry manual. |

Contexto: `accounts.update`.

## Criterios De Aceite

- Criacao de conta envia `type: 'BANK'`.
- Criacao nao mostra opcoes de `CREDIT_CARD` ou `INVESTMENT`.
- DTO de criacao usa `initialBalanceCents` inteiro.
- Nenhum payload de account envia `initialBalance` decimal.
- Cores e icones enviados sao tokens oficiais, nao hex/classes/CSS vars.
- Account sheet mostra 5 cores + menu `...` e 5 icones + menu `...`.
- Edicao nao mostra saldo inicial como editavel.
- Erros de validacao marcam campos e preservam valores.
- Erros bloqueantes aparecem no sheet via `ApiErrorAlert`, nao apenas toast.
- `npm run lint` e `npm run build` devem passar depois da implementacao.

## QA

- Criar conta sem saldo.
- Criar conta com `R$ 0,01`, `R$ 1.234,56` e campo vazio.
- Validar payload no Network: `initialBalanceCents`.
- Criar com cor/icon visivel.
- Criar com cor/icon no menu overflow.
- Editar conta `BANK`.
- Editar conta `CASH`.
- Forcar `VALIDATION_ERROR`, `INVALID_ACCOUNT`, `ACCOUNT_ARCHIVED_MUTATION`, `ACCOUNT_UPDATE_EMPTY` e `500`.
- Navegar por teclado por todos os campos, cores, icones, toggles e footer.

