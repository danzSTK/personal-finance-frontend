---
area: categories
type: index
status: current
last_reviewed: 2026-11-24
related:
  - ../README.md
  - ../architecture/module-boundaries.md
  - ./concepts/category-model-and-ownership.md
  - ./flows/list-and-filter-categories.md
  - ./flows/manage-category-lifecycle.md
  - ./decisions/system-categories-are-immutable.md
  - ./decisions/delete-with-merge-preserves-history.md
  - ./decisions/responsive-list-and-metadata-catalog.md
  - ./components/category-components.md
  - ./reference/api-and-contracts.md
---

# Módulo `categories`

O módulo `categories` governa o gerenciamento de categorias financeiras de despesas (`EXPENSE`) e receitas (`INCOME`) em `/categories`, cobrindo visualização responsiva (tabela desktop e cards mobile), criação e edição com catálogo de cores/ícones, arquivamento/restauração e exclusão com merge seguro quando existem lançamentos vinculados.

Todo o código proprietário reside em `src/features/categories/`, com instruções locais em `src/features/categories/AGENTS.md`.

## Mapa da Documentação

### Conceitos (`concepts/`)
- [Modelo de Categoria, Propriedade e Metadados](./concepts/category-model-and-ownership.md) — Tipos suportados, categorias de sistema vs. personalizadas, arquivamento e resolução de cor/ícone.

### Fluxos (`flows/`)
- [Listagem, Filtros, URL State e Paginação](./flows/list-and-filter-categories.md) — Navegação em `/categories`, abas por tipo, busca com debounce, visão de arquivadas e deep link `?create=`.
- [Ciclo de Vida: Criar, Editar, Arquivar e Excluir/Merge](./flows/manage-category-lifecycle.md) — Formulário contextual, arquivamento/restauração imediata e fluxo de exclusão com fallback para merge.

### Decisões (`decisions/`)
- [DEC-001 — Categorias de sistema são imutáveis na interface](./decisions/system-categories-are-immutable.md) — Proteção explícita de `isSystem` e `isEditable` nas ações de linha.
- [DEC-002 — Exclusão com transações vinculadas transiciona para merge guiado](./decisions/delete-with-merge-preserves-history.md) — Tratamento do erro `CATEGORY_HAS_TRANSACTIONS` com preservação do histórico financeiro.
- [DEC-003 — Lista responsiva separada por breakpoint e fallback local de metadados](./decisions/responsive-list-and-metadata-catalog.md) — Tabela desktop vs. cards mobile e catálogo visual resiliente.

### Componentes (`components/`)
- [Arquitetura de Componentes de Categorias](./components/category-components.md) — Árvore Atomic Design, donos de estado, schema Zod e dependências `shared` e cross-feature.

### Referência (`reference/`)
- [API, Rotas, Query Keys, Erros e Gaps](./reference/api-and-contracts.md) — Matriz completa de endpoints, códigos de erro mapeados e gaps observados no código atual.

## Fronteiras e Dependências

- **Código proprietário:** `src/features/categories/`
- **API pública:** sem `index.ts` dedicado atualmente (dívida registrada em `DT-03` de [module-boundaries.md](../architecture/module-boundaries.md)).
- **Consumidores cross-feature atuais:**
  - `transactions` consome `useCategories`, o tipo `Category` e utilitários de cor/ícone (`getCategoryColorOption`, `getCategoryColorToken`, `getCategoryIconKey`, `getCategoryIconOption`).
  - `auth` (`AuthAppShell` / `MobileQuickActions`) e `src/app/routes/index.tsx` navegam para `/categories` e `/categories?create=EXPENSE`.
- **Dependências de entrada:** `api` de `@/features/auth/api/auth.api` (`DT-01`) e `AuthAppShell` de `@/features/auth/components/templates/AuthAppShell` (`DT-02`).

## Estado Atual de Implementação

### Implementado e Documentado
- [x] Listagem paginada por aba (`Despesas` / `Receitas`) com busca debounced (300ms) e alternância Ativas/Arquivadas.
- [x] Deep link `/categories?create=EXPENSE|INCOME` consumido por `MobileQuickActions`.
- [x] Criação e edição via `CategoryFormSheet` com metadados da API e fallback local.
- [x] Arquivamento e restauração imediata com feedback via toast.
- [x] Exclusão simples com transição automática para merge guiado em `CATEGORY_HAS_TRANSACTIONS`.

### Gaps Conhecidos / Pendente
- [ ] `useDeleteCategoryWithMerge` invalida `['categories']`, mas ainda não invalida `['transactions']` (`DT-05`).
- [ ] `CategoryDeleteDialogs` executa a query de candidatas de merge mesmo antes do dialog de merge abrir (`enabled` não condicionado ao modo `merge`).
- [ ] `INVESTMENT` está modelado em `ManageableCategoryType`, mas não possui aba na tela `/categories`.
- [ ] Não há `index.ts` público em `src/features/categories/` (`DT-03`).
