---
area: categories
type: component
status: current
related:
  - ../README.md
  - ../flows/list-and-filter-categories.md
  - ../flows/manage-category-lifecycle.md
  - ../reference/api-and-contracts.md
---

# Arquitetura de Componentes de Categorias

## Árvore por Atomic Design (`src/features/categories/components/`)

- **Pages:**
  - `CategoriesPage`: composição da rota `/categories`, leitura/escrita da URL (`type`, `create`), busca com debounce (`CategorySearch`), alternância de arquivadas, paginação (`CategoriesPagination`) e orquestração de sheets/dialogs.
- **Organisms:**
  - `CategoriesTable`: renderização responsiva desktop (`Table` / `CategoryRow`) e mobile (`CategoryMobileItem`), compartilhando `CategoryActionsMenu`.
  - `CategoryFormSheet`: criação e edição com React Hook Form + Zod (`categoryFormSchema`), seletores de cor/ícone com overflow e `ApiErrorAlert` inline.
  - `CategoryDeleteDialogs`: confirmação de exclusão (`AlertDialog`) e transição automática para merge (`Dialog`) quando ocorre `CATEGORY_HAS_TRANSACTIONS`.
  - `CategoriesStatePanels`: `CategoriesEmptyState` (3 variações contextuais) e `CategoriesErrorState` (`ApiErrorAlert` + retry).
  - `CategoriesSkeleton`: estado de carregamento inicial com 6 linhas pulsantes.
- **Molecules:**
  - `CategoryCreateButton`: CTA semântico expansível compartilhado entre cabeçalho e empty state.
  - `CategoryFormField`: wrapper de label, controle e mensagem de erro para campos do sheet.
- **Atoms / Templates:** não possui átomos ou templates próprios; utiliza `AuthAppShell` e primitivos de `src/shared/components/ui/`.

## Donos de Estado, Dados e Side Effects

- **Server state (TanStack Query):**
  - `CategoriesPage`: `useCategories`, `useArchiveCategory`, `useUnarchiveCategory`.
  - `CategoryFormSheet`: `useCategoryMetadata`, `useCreateCategory`, `useUpdateCategory`.
  - `CategoryDeleteDialogs`: `useCategories` (candidatas de merge), `useDeleteCategory`, `useDeleteCategoryWithMerge`.
- **URL state (`useSearchParams`):** `type` (`INCOME`; omitido para `EXPENSE`) e intenção transitória `create` (`EXPENSE | INCOME`, removida com `replace: true` após abrir o sheet).
- **Local UI state:** `archiveView`, `page`, `limit`, `isSearchOpen`, `searchDraft`, `search`, `sheetState`, `deleteState` em `CategoriesPage`; `targetCategoryId` em `CategoryDeleteDialogs`.
- **Formulário e schema:** `categoryFormSchema` (`src/features/categories/schemas/category.schema.ts`) validando `displayName` (2–120), `description` (até 255, vazio → `null`), `color` (até 20), `icon` (até 100), `includeInReports` (boolean) e `sortOrder` (inteiro `>= 0`).

## Dependências (`shared` e Cross-Feature)

- **Shared (`src/shared/`):** `ApiErrorAlert`, `Button`, `Input`, `Textarea`, `Sheet`, `AlertDialog`, `Dialog`, `DropdownMenu`, `Select`, `Table`, `cn`, `use-toast`, `src/shared/errors/*`.
- **Dependências em `auth`:** `api` (`@/features/auth/api/auth.api` — `DT-01`) e `AuthAppShell` (`@/features/auth/components/templates/AuthAppShell` — `DT-02`).
- **Consumido por `transactions`:** `useCategories`, tipo `Category` e utilitários `getCategoryColorOption`, `getCategoryColorToken`, `getCategoryIconKey`, `getCategoryIconOption`.

## Limites de Importação e Gaps Conhecidos

- Novos consumidores cross-feature devem evitar alcançar internos de `categories`; recomenda-se formalizar `src/features/categories/index.ts` (`DT-03`).
- `CategoryDeleteDialogs` monta a query de candidatas de merge enquanto `CategoriesPage` está montada (sem `enabled: isMergeOpen`) — oportunidade de otimização futura.
