---
area: categories
type: concept
status: current
related:
  - ../README.md
  - ../flows/list-and-filter-categories.md
  - ../flows/manage-category-lifecycle.md
  - ../decisions/system-categories-are-immutable.md
---

# Modelo de Categoria, Propriedade e Metadados

Uma categoria classifica lançamentos financeiros (`EXPENSE` ou `INCOME`) para organização visual, filtragem e relatórios. No frontend, o domínio distingue **categorias de sistema** (fornecidas pela plataforma e imutáveis) de **categorias personalizadas** criadas pelo usuário autenticado.

## Identidade, Ownership e Fonte de Verdade

- **Identidade:** `id` (UUID estável retornado pelo backend).
- **Ownership:** categorias personalizadas pertencem ao usuário autenticado (escopo imposto pelo backend via sessão HttpOnly; o cliente nunca envia `userId`). Categorias de sistema têm `isSystem: true`.
- **Fonte de verdade:**
  - Lista de categorias e metadados de ícones/cores: TanStack Query (`['categories', ...]`).
  - Tipo ativo da aba (`type`) e intenção de criação (`create`): URL query string.
  - Estado visual transitório (busca expandida, página, limite, visão de arquivadas, sheets/dialogs abertos): estado local em `CategoriesPage`.

## Tipos de Categoria e Escopo na Interface

| `CategoryType` | Rótulo (`CATEGORY_TYPE_LABELS`) | Semântica visual | Gerenciável em `/categories`? |
| --- | --- | --- | --- |
| `EXPENSE` | `Despesa` | `text-state-expense bg-state-expense/10` | Sim (aba padrão) |
| `INCOME` | `Receita` | `text-state-income bg-state-income/10` | Sim (`?type=INCOME`) |
| `INVESTMENT` | `Investimento` | `text-state-info bg-state-info/10` | Modelado em `ManageableCategoryType`, sem aba na UI |
| `TRANSFER` | `Transferência` | `text-state-info bg-state-info/10` | Não (técnica) |
| `ADJUSTMENT` | `Ajuste` | `text-state-info bg-state-info/10` | Não (técnica) |

O `type` é definido apenas na criação (`CreateCategoryDto`); na edição (`UpdateCategoryDto`) o tipo é imutável.

## Regras de Gerenciabilidade e Arquivamento

Os predicados em `src/features/categories/utils/category.utils.ts` governam as ações disponíveis na UI:

- **`canManageCategory(category)`:** verdadeiro apenas quando `category.isEditable && category.isVisibleInManagement && !category.isSystem && isManagementType(category.type)`. Controla habilitação de `Editar`, `Arquivar` e `Excluir`.
- **`canRestoreCategory(category)`:** verdadeiro apenas quando `category.isArchived && !category.isSystem && isManagementType(category.type)`. Controla habilitação de `Restaurar`.
- **Arquivamento:** categorias ativas exibem pill `Ativa` (`state-income`); categorias arquivadas são listadas apenas na visão de arquivadas com `opacity-75`, pill `Arquivada` (`state-warning`), sem ação `Editar` e com `Restaurar` no lugar de `Arquivar`.

## Metadados Visuais (Cores e Ícones) e Compatibilidade Legada

- A API expõe `colorToken` e `iconKey` (com fallback para campos legados `color` e `icon` via `getCategoryColorToken` e `getCategoryIconKey`).
- `GET /categories/metadata` fornece o catálogo oficial de cores e ícones (`staleTime: 10 min`). Quando indisponível ou vazio, `mergeCategoryIconMetadata` e `mergeCategoryColorMetadata` fazem fallback transparente para `CATEGORY_ICON_OPTIONS` (32 ícones Lucide, fallback `CircleHelp` / `wallet`) e `CATEGORY_COLOR_OPTIONS` (20 cores).
- Aliases legados de cor (`var(--state-expense)`, `var(--state-income)`, `var(--state-warning)`, `var(--state-info)`, `var(--brand)`, `coral`, `brand`) são normalizados por `LEGACY_CATEGORY_COLOR_ALIASES`.
- Padrões por tipo na criação: `EXPENSE` inicia com cor `orange` e ícone `receipt`; `INCOME` inicia com cor `emerald` e ícone `hand-coins`; `includeInReports` inicia como `true` e `sortOrder` como `0`.

## Relação com Outros Módulos

- **`transactions`:** consome categorias ativas (`EXPENSE` e `INCOME`) para filtros, formulários de criação/edição e renderização de badge colorido/ícone na tabela e detalhes de transações.
