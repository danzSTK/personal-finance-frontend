---
area: categories
type: decision
status: current
decision-id: DEC-002
decision-status: accepted
related:
  - ../README.md
  - ../flows/manage-category-lifecycle.md
  - ../reference/api-and-contracts.md
---

# Exclusão com transações vinculadas transiciona para merge guiado

## Problema

Excluir uma categoria já associada a lançamentos quebraria a integridade histórica das transações ou obrigaria o usuário a recategorizar lançamentos manualmente antes de conseguir remover a categoria.

## Decisão

Tentar inicialmente `DELETE /categories/:id` após confirmação e, ao receber o código estável `CATEGORY_HAS_TRANSACTIONS`, transicionar automaticamente o `CategoryDeleteDialogs` do `AlertDialog` de confirmação para o `Dialog` de merge (`POST /categories/:id/delete-with-merge`), restringindo as opções de destino a categorias ativas, gerenciáveis e do mesmo `type`.

## Consequência

- Trata o conflito `409` como um fluxo guiado de produto, e não como erro técnico bloqueante.
- Preserva o histórico financeiro migrando transações no backend de forma atômica.
- **Gap conhecido (`DT-05`):** atualmente `useDeleteCategoryWithMerge` invalida apenas `['categories']`; será necessário invalidar também `['transactions']` para refletir imediatamente a nova categoria nas listagens em cache.
