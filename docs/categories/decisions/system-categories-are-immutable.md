---
area: categories
type: decision
status: current
decision-id: DEC-001
decision-status: accepted
related:
  - ../README.md
  - ../concepts/category-model-and-ownership.md
  - ../flows/manage-category-lifecycle.md
---

# Categorias de sistema são imutáveis na interface

## Problema

A plataforma fornece categorias padrão (`isSystem: true`) e categorias técnicas (`TRANSFER`, `ADJUSTMENT`) que sustentam o modelo financeiro. Permitir que a UI acione edição, arquivamento ou exclusão sobre essas categorias geraria falhas previsíveis (`CATEGORY_NOT_MANAGEABLE`) e confusão sobre o que o usuário pode personalizar.

## Decisão

Centralizar a regra de elegibilidade nos predicados `canManageCategory(category)` e `canRestoreCategory(category)` em `src/features/categories/utils/category.utils.ts`, desabilitando ações de mutação no `CategoryActionsMenu` sempre que a categoria for de sistema, não editável ou fora de `ManageableCategoryType`.

## Consequência

- Previne tentativas inválidas antes da chamada HTTP, mantendo o backend como fonte final de validação.
- Centraliza a regra entre a versão desktop (`CategoryRow`) e a versão mobile (`CategoryMobileItem`).
- Exige manter os predicados alinhados caso novos tipos gerenciáveis (como `INVESTMENT`) sejam expostos futuramente na tela.
