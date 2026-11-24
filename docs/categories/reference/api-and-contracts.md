---
area: categories
type: reference
status: current
last_reviewed: 2026-11-24
related:
  - ../README.md
  - ../flows/list-and-filter-categories.md
  - ../flows/manage-category-lifecycle.md
  - ../../architecture/api-error-handling.md
  - ../../architecture/module-boundaries.md
---

# Referência — API, Rotas, Erros e Gaps de `categories`

## Rotas Frontend e Parâmetros de URL

| Rota | Guard | Parâmetros de URL | Observação |
| --- | --- | --- | --- |
| `/categories` | `PrivateRoute` | `type=INCOME` (omitido para `EXPENSE`), `create=EXPENSE\|INCOME` (transitório, limpo com `replace: true`) | Título `Danfy \| Categorias` |

## Endpoints Consumidos e Query Keys

| Operação | Hook (`src/features/categories/api/`) | Query Key (`CATEGORY_QUERY_KEYS`) | Cache / Invalidação |
| --- | --- | --- | --- |
| `GET /categories` | `useCategories(params)` | `['categories', params]` | `staleTime: 30_000`, `retry < 2` |
| `GET /categories/:id` | `useCategory(categoryId)` *(sem consumidor ativo)* | `['categories', 'detail', id \| 'idle']` | Defaults do `QueryClient` |
| `GET /categories/metadata` | `useCategoryMetadata()` | `['categories', 'metadata']` | `staleTime: 600_000` (10m), `retry < 2` |
| `POST /categories` | `useCreateCategory()` | — | Invalida `['categories']` (`exact: false`) |
| `PATCH /categories/:id` | `useUpdateCategory()` | — | Invalida `['categories']` (`exact: false`) |
| `PATCH /categories/:id/archive` | `useArchiveCategory()` | — | Invalida `['categories']` (`exact: false`) |
| `PATCH /categories/:id/unarchive` | `useUnarchiveCategory()` | — | Invalida `['categories']` (`exact: false`) |
| `DELETE /categories/:id` | `useDeleteCategory()` | — | Invalida `['categories']` (`exact: false`) |
| `POST /categories/:id/delete-with-merge` | `useDeleteCategoryWithMerge()` | — | Invalida `['categories']` (`exact: false`) |

## Códigos de Erro Mapeados (`src/shared/errors/`)

| Código | Recuperação configurada | Superfície principal |
| --- | --- | --- |
| `CATEGORY_HAS_TRANSACTIONS` | `choose-target` | Transição automática para merge em `CategoryDeleteDialogs` |
| `CATEGORY_INVALID_MERGE` | `choose-target` | `ApiErrorAlert` no dialog de merge |
| `CATEGORY_NAME_ALREADY_EXISTS` | `correct-fields` | `ApiErrorAlert` em `CategoryFormSheet` |
| `CATEGORY_UPDATE_EMPTY` | `correct-fields` | `ApiErrorAlert` em `CategoryFormSheet` |
| `INVALID_CATEGORY` | `correct-fields` | `ApiErrorAlert` em `CategoryFormSheet` |
| `TECHNICAL_CATEGORY_CANNOT_BE_CREATED` | `correct-fields` | `ApiErrorAlert` em `CategoryFormSheet` |
| `CATEGORY_NOT_FOUND` | `retry` | `ApiErrorAlert` ou `showApiErrorToast` conforme ação |
| `CATEGORY_NOT_MANAGEABLE` | `retry` | `ApiErrorAlert` ou `showApiErrorToast` conforme ação |
| `CATEGORY_INVALID_LIST_QUERY` | `retry` | `CategoriesErrorState` (`ApiErrorAlert` + retry) |
| `VALIDATION_ERROR` | `correct-fields` | `applyApiFieldErrors` + `ApiErrorAlert` |

Contextos registrados em `resolveApiError.ts`: `categories.list`, `categories.metadata`, `categories.create`, `categories.update`, `categories.archive`, `categories.unarchive`, `categories.delete`, `categories.merge-delete`.

## Fontes de Integração no Backend

- `personal-finance-backend:docs/integrations/categories/README.md`
- `personal-finance-backend:docs/integrations/categories/list-categories.md`
- `personal-finance-backend:docs/integrations/categories/get-category-metadata.md`
- `personal-finance-backend:docs/integrations/categories/create-category.md`
- `personal-finance-backend:docs/integrations/categories/update-category.md`
- `personal-finance-backend:docs/integrations/categories/archive-category.md`
- `personal-finance-backend:docs/integrations/categories/unarchive-category.md`
- `personal-finance-backend:docs/integrations/categories/delete-category.md`
- `personal-finance-backend:docs/integrations/categories/delete-category-with-merge.md`
- `personal-finance-backend:docs/integrations/errors.md`

## Gaps e Símbolos Não Utilizados Observados no Código

1. **Invalidação de cache cross-feature (`DT-05`):** `useDeleteCategoryWithMerge` não invalida `['transactions']` após migrar lançamentos para a categoria de destino.
2. **Query antecipada no dialog de merge:** `CategoryDeleteDialogs` executa `useCategories({ limit: 100, ... })` enquanto a página está montada, sem restringir `enabled` ao modo `merge`.
3. **Símbolos exportados sem consumidor ativo na UI:** `useCategory`, `categoryMergeTargetParams` (`api/queries.ts`), `CATEGORY_ROUTES` (`category.constants.ts`) e contexto `'categories.metadata'` (`resolveApiError.ts`).
4. **Tipo `INVESTMENT`:** presente nos tipos de domínio, porém sem aba dedicada na interface `/categories`.
