# Módulo `categories` — Instruções Locais

Este módulo gerencia as categorias financeiras de receitas e despesas da Danfy (categorias do sistema e personalizadas do usuário), incluindo metadados visuais, arquivamento e exclusão segura com merge.

## Documentação Obrigatória

Antes de planejar, editar ou revisar código neste módulo, leia:
- `docs/categories/README.md` — Índice geral, cobertura e mapa de leitura do módulo.
- `docs/categories/concepts/category-model-and-ownership.md` — Tipos, categorias de sistema vs. personalizadas e metadados visuais.
- `docs/categories/flows/list-and-filter-categories.md` — Listagem responsiva, filtros, URL state e paginação.
- `docs/categories/flows/manage-category-lifecycle.md` — Criação, edição, arquivamento, restauração, exclusão e merge.
- `docs/categories/reference/api-and-contracts.md` — Endpoints consumidos, query keys, erros mapeados e gaps conhecidos.
- `docs/architecture/module-boundaries.md` — Fronteiras com `transactions`, `auth` e dívidas técnicas registradas.

## Regras de Fronteira e Invariantes

- **Categorias do sistema são imutáveis:** respeite `canManageCategory(category)` (`isEditable && isVisibleInManagement && !isSystem && isManagementType(type)`) e `canRestoreCategory(category)`. Nunca habilite edição, arquivamento ou exclusão de categorias de sistema.
- **Tipo imutável na edição:** `PATCH /categories/:id` não altera `type`; o formulário cria categorias com o tipo da aba/intenção atual (`EXPENSE` ou `INCOME`) e não permite trocar o tipo ao editar.
- **Exclusão segura com merge:** `DELETE /categories/:id` que retorna `CATEGORY_HAS_TRANSACTIONS` deve transicionar para o fluxo de `POST /categories/:id/delete-with-merge`, oferecendo apenas categorias ativas, gerenciáveis e do **mesmo tipo** (excluindo a própria categoria).
- **Fallback resiliente de metadados:** falhas em `GET /categories/metadata` não podem bloquear o formulário; use fallback local (`CATEGORY_ICON_OPTIONS` / `CATEGORY_COLOR_OPTIONS`) e normalize tokens legados (`LEGACY_CATEGORY_COLOR_ALIASES`).
- **Superfícies de erro:** erros de listagem, formulário, exclusão e merge usam `ApiErrorAlert` inline (com `applyApiFieldErrors` em criação/edição); falhas de arquivar/restaurar usam `showApiErrorToast`.
- **Fronteiras e dívida registrada:** `transactions` consome `useCategories`, `Category` e utilitários visuais deste módulo. Evite ampliar acoplamentos internos sem expor contratos explícitos em `index.ts` (ver `DT-03` e `DT-05` em `docs/architecture/module-boundaries.md`).
- **Sincronização documental:** qualquer mudança em fluxos, endpoints, códigos de erro, metadados ou invariantes exige atualização de `docs/categories/` e deste `AGENTS.md` na mesma entrega.
