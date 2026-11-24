---
area: accounts
type: concept
status: current
related:
  - ../README.md
  - ../flows/create-and-update-account.md
  - ../decisions/account-template-is-the-visual-source.md
  - ../decisions/create-starts-with-identity.md
---

# Modelo de Conta e Template Visual

No frontend da Danfy, uma conta financeira (`Account`, `object: 'account.item'`) separa seus dados financeiros da sua identidade visual (`AccountTemplate`, `object: 'account_template.item'`).

## Identidade, Ownership e Fonte de Verdade

- **Identidade:** `Account.id` e `AccountTemplate.id` (UUIDs estáveis retornados pela API).
- **Ownership:** contas pertencem ao usuário autenticado via cookies HttpOnly (o frontend nunca envia `userId`). O catálogo institucional (`GET /account-templates`) é compartilhado e somente leitura.
- **Fonte de verdade:** TanStack Query (`['accounts', ...]` e `['account-templates']`).

## Tipos de Conta (`AccountType`)

| Tipo | Rótulo | Criação manual na UI V0 | Arquivável? |
| --- | --- | --- | --- |
| `CASH` | `Carteira` | Não (provisionada automaticamente pelo backend) | Não (`canArchiveAccount` bloqueia) |
| `BANK` | `Conta bancária` | Sim (tipo fixado na V0 em `AccountFormSheet`) | Sim, se não for padrão nem arquivada |
| `CREDIT_CARD` | `Cartão de crédito` | Modelado em `UserCreatableAccountType`, não selecionável na V0 | Conforme regra de padrão/arquivamento |
| `INVESTMENT` | `Investimento` | Modelado em `UserCreatableAccountType`, não selecionável na V0 | Conforme regra de padrão/arquivamento |

## Resolução Visual (`resolveAccountVisual`)

`src/features/accounts/utils/account.utils.ts` resolve a apresentação visual em ordem determinística:

1. **Logo institucional:** se `template?.type === 'INSTITUTIONAL'` e `template.logoUrl?.trim()` existir, renderiza a imagem retornada diretamente pela API (`kind: 'logo'`). Se a imagem falhar (`onError`), `AccountIdentity` e `AccountTemplateOption` recuam para ícone + tom de cor.
2. **Ícone (`kind: 'icon'`):** resolve `template?.iconKey ?? account.icon` em `ACCOUNT_ICON_MAP` (7 ícones); se ausente, usa fallback por `account.type` (`CASH` → `Wallet`, `BANK` → `landmark`, `CREDIT_CARD` → `credit-card`, `INVESTMENT` → `piggy-bank`).
3. **Tom de cor (`ACCOUNT_VISUAL_TONES`):** resolve `template?.colorToken ?? account.color` contra 20 tokens personalizados e 10 tokens institucionais (`nubank`, `inter`, `itau`, `bradesco`, `santander`, `banco-do-brasil`, `caixa`, `c6`, `picpay`, `mercado-pago`) definidos como variáveis `--account-*` em `src/index.css`; se ausente, usa `DEFAULT_ACCOUNT_VISUAL_TONE`.

## Regras de Classe Visual e Compatibilidade (`DB-COMPAT-002`)

- **Institucional (`INSTITUTIONAL`):** identidade visual somente leitura na edição; não permite trocar de instituição nem converter para personalizada. Na criação, pré-preenche `name` com `template.name` (editável).
- **Personalizada (`CUSTOM`):** permite escolher cor e ícone tanto na criação quanto na edição (`template: { type: 'custom', colorToken, iconKey }`).
- **Legada (`account.template === null`):** utiliza os campos raiz deprecated `account.color` e `account.icon` apenas como defaults iniciais (fallback `blue`/`wallet`) e materializa um `template` customizado no primeiro salvamento visual. O frontend nunca mistura `template` com `color`/`icon` legados no mesmo payload.

## Elegibilidade de Ações

- **`canArchiveAccount(account)`:** `account.type !== 'CASH' && !account.isDefault && !account.isArchived`.
- **`canSetDefaultAccount(account)`:** `!account.isArchived && !account.isDefault`.
- Contas padrão recebem destaque de gradiente primário e ícone `Star`; contas arquivadas exibem `opacity-75`, ícone `Archive` (`state-warning`), ocultam `Editar`/`Arquivar` e expõem `Restaurar`.
