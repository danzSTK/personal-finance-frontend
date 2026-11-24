---
area: categories
type: decision
status: current
decision-id: DEC-003
decision-status: accepted
related:
  - ../README.md
  - ../flows/list-and-filter-categories.md
  - ../components/category-components.md
  - ../../specs/categories/responsive-list/specs/decisions.md
---

# Lista responsiva separada por breakpoint e fallback local de metadados

## Problema

Uma tabela larga (`min-w-[760px]`) sofre corte horizontal severo em telas mobile (`320px–640px`). Paralelamente, o formulário de criação/edição depende de ícones e cores servidos por `GET /categories/metadata` e precisa permanecer operável mesmo sob falha temporária desse endpoint.

## Decisão

1. Renderizar dois layouts dedicados em `CategoriesTable`: `Table` em viewports `md+` (`hidden md:block`) e cards `CategoryMobileItem` abaixo de `md` (`grid gap-3 md:hidden`), compartilhando `CategoryActionsMenu` e `CategoryCreateButton`.
2. Combinar `GET /categories/metadata` (`staleTime: 10 min`) com catálogos locais em `category.constants.ts` via `mergeCategoryIconMetadata` e `mergeCategoryColorMetadata`, exibindo as `5` primeiras opções inline e o restante em menus de overflow.

## Consequência

- Elimina overflow horizontal em mobile sem perder densidade analítica no desktop.
- Garante criação e edição resilientes a falhas de metadados e compatibilidade com tokens de cor legados (`LEGACY_CATEGORY_COLOR_ALIASES`).
- Exige manter paridade funcional entre `CategoryRow` e `CategoryMobileItem` ao evoluir colunas ou ações.
