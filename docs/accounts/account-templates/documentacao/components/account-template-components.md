---
area: accounts
feature: account-templates
type: documentation-component
status: current
related:
  - ../flow/create-and-update-account.md
  - ../decisions/account-template-is-the-visual-source.md
  - ../decisions/account-detail-summary-is-lazy.md
  - ../../../../specs/accounts/account-templates-flow/specs/design.md
---

# Componentes de account templates

## Composição significativa

```text
AccountsPage (page)
├── AccountFormSheet (organism)
│   ├── AccountTemplatePicker (organism)
│   │   └── AccountTemplateOption (molecule)
│   ├── CustomAccountIdentityFields (organism)
│   ├── AccountFormIdentityHeader (molecule)
│   ├── AccountIdentity (molecule)
│   ├── AccountFormField (molecule)
│   └── atoms/shared: CurrencyInput, Input, Switch, Button, Sheet
└── AccountCard (organism)
    ├── AccountIdentity (molecule)
    └── painel de detalhes
        ├── useTransactions lazy
        ├── células de receitas/despesas com Tooltip
        └── ApiErrorAlert local

Transactions organisms
└── AccountIdentity (public API de accounts)
```

## Responsabilidades

- `AccountFormSheet` possui etapa ativa, template escolhido, React Hook Form,
  mutations, erros de campo, foco e fechamento no sucesso.
- `AccountTemplatePicker` possui a query do catálogo e seus estados locais de
  loading, empty, error e retry.
- `AccountTemplateOption` apresenta uma instituição como opção acessível e
  mantém fallback quando o SVG falha.
- `CustomAccountIdentityFields` contém os seletores acessíveis de cor e ícone,
  sem chamadas de API.
- `AccountFormIdentityHeader` apresenta a identidade institucional bloqueada ou
  a orientação da identidade personalizada.
- `AccountIdentity` é a superfície reutilizável de logo/ícone. Ela recebe dados,
  não chama API e mantém somente o estado local de falha da imagem.
- `AccountCard` possui `isDetailsOpen`, habilita o overview de transactions
  somente quando aberto, estreita o discriminante do summary e mantém o retry
  dentro do painel. Callbacks de navegação continuam vindo da page.
- `accountTransactions.utils.ts` centraliza os dois destinos filtrados usando o
  serializer público de Transactions: aprofundamento do período e listagem
  geral da account.
- `account.utils.ts` resolve a prioridade template → legado → fallback e os
  tons sem introduzir estado em componentes.
- `account.constants.ts` mantém endpoint/query keys, catálogo customizado de
  cor/ícone e mapeamento estático dos tokens institucionais.

## Dados e side effects

- TanStack Query: `useAccountTemplates`, `useAccounts` e
  `useAccountSummary`; o detalhe também consome `useTransactions` com
  `enabled=isDetailsOpen`.
- Mutations: `useCreateAccount` e `useUpdateAccount`, com invalidação da menor
  família relevante.
- Form: React Hook Form + Zod; saldo usa `CurrencyInput` em centavos.
- Estado de etapa e template: local ao sheet; não há Zustand para estado
  transitório do formulário.
- Erros: `resolveApiError`, `applyApiFieldErrors` e `ApiErrorAlert`.

## Dependência cross-feature

Transactions importa `AccountIdentity` e tipos pelo public API de accounts.
Accounts, por sua vez, consome somente a query e os helpers públicos de URL de
Transactions para o resumo lazy e os links de aprofundamento. Queries/tipos não
dependem de components, portanto não há ciclo de execução entre organisms.

## Limites e extensão

- Molecules não chamam APIs nem importam organisms.
- Templates institucionais não recebem controles de cor/ícone.
- Um novo `colorToken` requer token em `src/index.css` e entrada no mapa visual.
- `logoUrl` é consumida como fornecida; componentes não conhecem storage/CDN.
- A troca entre institucional e custom na edição permanece fora desta versão.
