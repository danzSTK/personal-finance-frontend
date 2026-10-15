---
area: accounts
feature: account-templates-flow
type: spec-design
status: approved
approved-at: 2026-08-29
related:
  - ./requirements.md
  - ./tasks.md
  - ./decisions.md
---

# Fluxo de contas por template — design técnico

Design aprovado pelo usuário em 29/08/2026.

## Arquitetura afetada

```text
GET /account-templates
        ↓
useAccountTemplates (TanStack Query)
        ↓
AccountFormSheet ── create institutional/custom ── POST /accounts
        │
        └────────── edit custom/account fields ─── PATCH /accounts/:id

GET /accounts
        ↓
Account visual resolver
        ↓
AccountIdentity ── AccountCard / details / transaction account controls
```

O módulo accounts continua dono do contrato e da resolução visual. Transactions
consome um componente público de identidade da conta, em vez de duplicar
resolução de logo, token e fallback em quatro organisms.

## Modelo TypeScript

Adicionar tipos discriminados e sem `any`:

```ts
type AccountTemplateType = 'INSTITUTIONAL' | 'CUSTOM'

interface AccountTemplate {
  object: 'account_template.item'
  id: string
  type: AccountTemplateType
  name: string
  colorToken: string | null
  iconKey: string | null
  logoUrl: string | null
  bankCode: number | null
  ispb: string | null
}

type AccountTemplateInput =
  | { type: 'institutional'; templateId: string }
  | { type: 'custom'; colorToken?: string | null; iconKey?: string | null }
```

`Account` recebe `object`, `templateId: string | null` e
`template: AccountTemplate | null`, preservando `color`/`icon` deprecated apenas
como fallback temporário.

`CreateAccountDto` exige `template: AccountTemplateInput`. `UpdateAccountDto`
aceita `template` opcional e deixa de expor `color`/`icon` na raiz para os novos
call sites.

## API e cache

- Adicionar `ACCOUNT_API_ENDPOINTS.templates = '/account-templates'`.
- Adicionar `ACCOUNT_QUERY_KEYS.templates` sem misturar com as chaves de lista
  de accounts.
- `useAccountTemplates({ enabled })` usa `staleTime` adequado para catálogo
  curado e retry limitado, ficando habilitado quando o fluxo de create abre.
- Create/update continuam invalidando a família `accounts`; o catálogo não é
  invalidado por mutations de account.
- Logo é carregado diretamente de `logoUrl`; não há query externa nem derivação
  de URL.

## Formulários e schemas

Separar intenção do fluxo da forma do DTO:

- `AccountCreationKind = 'institutional' | 'custom'` pertence ao estado local
  do organism.
- O schema institucional valida template selecionado, nome, saldo e toggle.
- O schema custom valida nome, saldo, cor, ícone e toggle.
- O schema de update custom valida nome, cor, ícone e toggle.
- Tipo V0 permanece `BANK` no create e é apresentado como informação, não
  escolha falsa.
- `CurrencyInput` mantém `initialBalanceCents` como inteiro e `.numeric`.
- `applyApiFieldErrors` recebe mapa explícito para `template.templateId`,
  `template.colorToken` e `template.iconKey` quando o backend retornar campos
  aninhados.

## Composição Atomic Design

### Accounts

- `molecules/AccountIdentity.tsx`: logo/ícone, nome opcional e fallback visual;
  sem API ou estado global.
- `molecules/AccountTemplateOption.tsx`: opção acessível do catálogo com logo e
  nome.
- `organisms/AccountTemplatePicker.tsx`: lista rolável, loading, vazio, erro e
  retry.
- `organisms/AccountFormSheet.tsx`: coordena etapa, formulário, focus, create e
  update.
- `organisms/AccountCard.tsx`: consome `AccountIdentity` e aplica o tom resolvido
  ao detalhe.
- `pages/AccountsPage.tsx`: mantém abertura/fechamento e mutations de ações.

`AccountIdentity` será exportado pelo public API de accounts por ser consumido
por transactions. Helpers privados e query internals não serão reexportados.

### Transactions

Substituir as implementações locais de `AccountSelectLabel` e
`TransactionAccountDetail` por composição de `AccountIdentity` em:

- `TransactionFormSheet`;
- `TransactionConfirmSheet`;
- `TransactionFiltersSheet`;
- `TransactionDetailsSheet`.

`TransactionsTable` mantém o nome textual onde a densidade da tabela não
comporta avatar sem perda de leitura.

## Layout mobile-first e movimento

Referências M3: bottom sheet/drawer, list items, filled button, text field,
switch, skeleton/progress e inline error.

- Mobile: sheet inferior com altura máxima por `dvh`, header e ação principal
  estáveis e conteúdo central rolável.
- Desktop: drawer lateral com a mesma ordem e sem alterar o modelo mental.
- Etapa 1: título `Escolha como criar`, catálogo rolável e ação tonal/outlined
  `Criar personalizada` fora do scroll.
- Etapa 2 institucional: voltar, logo + instituição, nome, saldo, switch e botão
  filled `Criar conta`.
- Etapa 2 custom: voltar + `Conta personalizada`, tipo informativo, nome, saldo,
  cor, ícone, switch e botão filled.
- O viewport interno usa `overflow-hidden`; painéis usam `transform` e
  `opacity`, `duration-200`, easing curto e
  `motion-reduce:transition-none motion-reduce:transform-none`.
- Títulos recebem `tabIndex={-1}` e foco programático após troca de etapa.

## Tokens de cor

Adicionar primeiro variáveis em `src/index.css`, expô-las no `@theme inline` e
depois referenciá-las por classes estáticas. Mapeamento predominante:

| Token backend     | Família visual local           |
| ----------------- | ------------------------------ |
| `nubank`          | roxo                           |
| `inter`           | laranja                        |
| `itau`            | laranja profundo               |
| `bradesco`        | rosa/vermelho                  |
| `santander`       | vermelho                       |
| `banco-do-brasil` | amarelo com contraste escuro   |
| `caixa`           | azul                           |
| `c6`              | grafite claro sobre Danfy Dark |
| `picpay`          | verde                          |
| `mercado-pago`    | azul-ciano                     |

Tokens customizados oficiais também devem resolver para classes estáticas. Um
token desconhecido usa `app-muted`; nenhum componente recebe hexadecimal
literal ou raw Tailwind palette.

O gradiente de detalhes usa a classe estática correspondente ao token, com a
cor em baixa opacidade na base e `app-surface` no topo. O logo fica em uma placa
neutra de tamanho estável para preservar legibilidade de SVGs claros/escuros.

## Resolução visual e fallback

Criar um resolver puro que devolve uma união discriminada:

```ts
type AccountVisual =
  | { kind: 'logo'; logoUrl: string; colorToken: string | null }
  | { kind: 'icon'; iconKey: string; colorToken: string | null }
```

Prioridade:

1. `template.type === 'INSTITUTIONAL'` e `logoUrl` não vazio;
2. `template.iconKey` para custom;
3. `account.icon` legado;
4. fallback por `account.type`.

Cor segue `template.colorToken`, depois `account.color`, depois tom neutro. O
estado local de erro da imagem troca apenas a mídia para o fallback e não altera
o objeto de domínio.

## Update e compatibilidade

- Institucional: enviar somente campos de account alterados; não reenviar
  template se sua identidade não mudou.
- Custom: quando cor/ícone forem editados, enviar
  `{ template: { type: 'custom', colorToken, iconKey } }`.
- Legado com `template=null`: defaults vêm de `color`/`icon`; ao salvar, enviar
  branch customizado e permitir ao backend materializar o template privado.
- `initialBalanceCents` aparece em texto no update e nunca entra no DTO.
- O mapper de patch remove campos sem alteração para evitar
  `ACCOUNT_UPDATE_EMPTY`; o botão salvar fica desabilitado quando não há diff.

## Inventário de erros

### `GET /account-templates`

| Código/condição                    | Superfície                 | Recuperação                                  |
| ---------------------------------- | -------------------------- | -------------------------------------------- |
| `UNAUTHORIZED` e códigos de sessão | fluxo global de sessão     | renovar ou entrar novamente                  |
| `INTERNAL_SERVER_ERROR`            | `ApiErrorAlert` na etapa 1 | tentar novamente                             |
| rede/timeout/desconhecido          | `ApiErrorAlert` na etapa 1 | tentar novamente; custom continua disponível |

Adicionar o contexto `accounts.templates` ao resolvedor compartilhado.

### `POST /accounts`

| Código                            | Superfície                                 | Recuperação                                |
| --------------------------------- | ------------------------------------------ | ------------------------------------------ |
| `VALIDATION_ERROR`                | campo + alerta para mensagens não mapeadas | corrigir e reenviar                        |
| `INVALID_ACCOUNT_NAME`            | campo nome                                 | corrigir nome                              |
| `INVALID_ACCOUNT`                 | alerta inline                              | revisar dados                              |
| `INVALID_ACCOUNT_TEMPLATE`        | alerta na identidade                       | escolher outra opção/customizar            |
| `ACCOUNT_TEMPLATE_NOT_FOUND`      | alerta na identidade                       | voltar e recarregar catálogo               |
| `ACCOUNT_TEMPLATE_INPUT_CONFLICT` | alerta inline                              | não repetir payload misto; preservar dados |
| `INTERNAL_SERVER_ERROR` ou rede   | alerta inline                              | retry deliberado, mantendo dados           |

### `PATCH /accounts/:id`

Além dos códigos acima:

| Código                                           | Superfície                        | Recuperação                               |
| ------------------------------------------------ | --------------------------------- | ----------------------------------------- |
| `ACCOUNT_NOT_FOUND`                              | alerta inline                     | fechar/atualizar lista por ação explícita |
| `ACCOUNT_ARCHIVED` / `ACCOUNT_ARCHIVED_MUTATION` | alerta inline                     | restaurar antes de editar                 |
| `ACCOUNT_UPDATE_EMPTY`                           | estado do botão + fallback inline | alterar ao menos um campo                 |

Adicionar os códigos de template a `apiErrorCodes.ts` e testes do resolvedor.
Mensagens cruas, códigos e paths do backend não aparecem na UI.

## Acessibilidade

- Template option é botão ou radio semântico com nome acessível contendo a
  instituição e estado selecionado quando aplicável.
- Logo usa `alt=""` quando o nome adjacente já identifica a instituição; sem
  duplicação no leitor de tela.
- Lista é navegável por teclado e mantém touch targets de pelo menos 44 px.
- Switch tem label associado e texto explicativo.
- Erros recém-exibidos usam a semântica existente de `ApiErrorAlert`.
- Foco retorna ao gatilho ao fechar pelo comportamento Radix.
- Gradiente e cor sempre acompanham logo/ícone e texto.

## Estratégia de testes

- Unitários: schemas e mappers dos dois branches; patch sem diff; resolver de
  template, legado, token desconhecido e logo ausente.
- Query: endpoint, query key e retorno de catálogo vazio.
- Components: loading/erro/retry; avanço/volta; prefill do template; preservação
  de valores; custom; reduced motion por classes; submit pending.
- Cross-feature: pelo menos um teste de selector de transactions com logo e um
  com fallback.
- Erros: novos códigos, unknown/network e field mapping aninhado.
- Qualidade: lint, testes focados e build.

## Documentação viva

Após a implementação, criar/atualizar em
`docs/accounts/account-templates/documentacao/`:

- `decisions/`: identidade derivada de template e fluxo create em duas etapas;
- `flow/`: criar/atualizar conta e consumo de catálogo;
- `components/`: composição Atomic Design e consumo por transactions.

Os documentos só mudam para `current` quando o código correspondente estiver
implementado e validado.
