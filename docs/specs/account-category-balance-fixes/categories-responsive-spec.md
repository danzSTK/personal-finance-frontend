# Categories Responsiveness Fix - Design Specification

## Visao Geral

Corrigir a tela de categorias para funcionar em mobile quando existem dados reais. O estado vazio ja se comporta bem, mas a tabela atual usa largura minima de desktop dentro de um container com `overflow-hidden`, cortando colunas, acoes e leitura em telas estreitas.

Esta spec segue:

- `.agents/skills/frontend-design/SKILL.md`
- `.agents/skills/material-3-ui-guidance/SKILL.md`
- `.agents/skills/danfy-finance-design-system/SKILL.md`
- `.agents/skills/danfy-api-error-handling/SKILL.md`
- `docs/design-system/material-3-reference.md`
- `docs/design-system/danfy-finance-design-system.md`
- `../personal-finance-backend/docs/integrations/categories/*`
- `../personal-finance-backend/docs/integrations/errors.md`

## Objetivo

Manter uma tabela completa no desktop e renderizar uma lista/card mobile para categorias abaixo de `md`, sem clipping horizontal e sem esconder a acao principal.

## Componentes E Modulos Lidos

### Afetados

- `src/features/categories/components/pages/CategoriesPage.tsx`
- `src/features/categories/components/organisms/CategoriesTable.tsx`
- `src/features/categories/components/organisms/CategoriesStatePanels.tsx`
- `src/features/categories/components/molecules/CategoryCreateButton.tsx`
- `src/features/categories/api/queries.ts`
- `src/features/categories/constants/category.constants.ts`
- `src/features/categories/utils/category.utils.ts`

### Reutilizaveis

- `CategoryCreateButton`: botao unico para criar categoria, ja com cor por tipo e title.
- `CategoriesEmptyState`: estado vazio ja usa o botao centralizado.
- `CategoryActionsMenu` dentro de `CategoriesTable`: deve ser reaproveitado ou extraido para servir desktop e mobile.
- `getCategoryColorOption`, `getCategoryIconOption`, `categoryTypeTone`, `getCategoryTypeLabel`: manter semantica e fallback visual.
- `ApiErrorAlert` + `resolveApiError(error, 'categories.list')`.

### Criaveis

- `CategoryMobileList` ou `CategoryListItem` em `src/features/categories/components/organisms/CategoriesTable.tsx` ou arquivo dedicado.
- Opcional: extrair `CategoryActionsMenu` para componente interno reutilizado por `CategoryRow` e `CategoryMobileItem`.

## Problema Atual No Codigo

`CategoriesTable.tsx` renderiza:

```tsx
<div className="max-w-full overflow-hidden ...">
  <Table className="min-w-[760px]">
```

Em mobile, a largura minima da tabela excede a tela e o container esconde o excesso. Resultado: o usuario ve apenas parte da linha e perde contexto/acoes.

## UX Decision Gate

- Acao primaria: criar categoria do tipo ativo.
- Informacao principal: nome da categoria, tipo, status de relatorio e menu de acoes.
- Cor: semantica financeira para `INCOME` e `EXPENSE`; roxo apenas marca/selecao.
- Erro: falha de listagem aparece no painel com retry, nao apenas toast.
- Loading/empty: skeleton e empty state permanecem proporcionais.
- Teclado: tabs, menus e botoes continuam focaveis.
- Graficos: nao se aplica.

## Design E Comportamento

### Desktop

- Manter a tabela com colunas:
  - Categoria
  - Tipo
  - Relatorios
  - Ordem
  - Status
  - Acoes
- A tabela deve aparecer apenas em `md` ou maior.
- A largura minima pode continuar existindo no desktop, desde que nao afete mobile.

### Mobile

- Abaixo de `md`, renderizar lista de itens/cards compactos.
- Cada item deve mostrar:
  - swatch de cor e icone;
  - `displayName`;
  - descricao ou `Sem descricao`;
  - chip de tipo: `Despesa`/`Receita`;
  - status de relatorios: `Entra nos relatorios`/`Fora dos relatorios`;
  - status `Ativa`/`Arquivada`;
  - botao `:` com title/aria-label.
- Evitar cards gigantes: cada item precisa ser escaneavel, com altura proporcional ao conteudo.
- Long names devem usar truncate/clamp sem empurrar acoes para fora.

### Paginacao

- `CategoriesPagination` deve funcionar em mobile:
  - seletor de linhas por pagina em uma linha;
  - texto `Pagina X de Y`;
  - botoes primeira/anterior/proxima/ultima em wrap ou grid;
  - todos os botoes com `title` e `aria-label`.

### Barra De Acoes

- Busca, `+ Categoria de despesa/receita` e menu `:` devem continuar em uma linha quando couber.
- Quando nao couber, podem quebrar linha sem cortar.
- `CategoryCreateButton` segue como fonte unica para header e empty state.

## Material 3 Mapping

- Tabela desktop: data table/list pattern adaptado ao produto.
- Mobile: list item/card para conteudo repetido.
- Menu `:`: Material menu.
- Icon buttons: compact actions com accessible label.
- Empty/error/loading: progress, empty state e inline error panel.

## Contrato Backend

Endpoint principal:

```http
GET /categories?page=1&limit=20&type=EXPENSE&search=alimentacao&includeArchived=false
```

Regras:

- A UI inicial alterna apenas `EXPENSE` e `INCOME`.
- Nunca misturar despesa e receita na mesma view.
- `includeArchived=false` mostra ativas.
- `includeArchived=true` mostra arquivadas, mas o frontend ainda deve filtrar `isArchived === true` por seguranca visual.

## Inventario De Erros

### `GET /categories`

| Code | Surface | Tratamento |
| --- | --- | --- |
| `CATEGORY_INVALID_LIST_QUERY` | Inline panel | Informar que os filtros nao puderam ser aplicados; oferecer `Tentar novamente` e restaurar pagina/limit se necessario. |
| `VALIDATION_ERROR` | Inline panel | Mostrar que filtros/paginacao devem ser revisados; retry seguro. |
| `UNAUTHORIZED`/`INVALID_ACCESS_TOKEN`/`INVALID_REFRESH_TOKEN` | Fluxo global de sessao | Tentar recuperacao; se falhar, pedir login. |
| `INTERNAL_SERVER_ERROR` | Inline panel | `Servico indisponivel no momento`; manter tela e retry. |
| Network/unknown | Inline panel | `Sem conexao com o servico`; retry. |

O contexto de erro deve continuar sendo `categories.list`.

## Criterios De Aceite

- Em 320px de largura, nenhuma coluna/acao fica cortada.
- Estado com dados e estado vazio sao responsivos.
- Desktop preserva a tabela completa.
- Mobile usa lista/card propria, sem scroll horizontal obrigatorio.
- Menu de acoes funciona em categorias ativas e arquivadas.
- Busca, tabs, menu de arquivadas e paginacao nao causam overflow.
- Cores usam tokens Danfy e semantica financeira.
- Erro de query fica perto da tabela/lista e tem retry.

## QA

- Mobile 320x568, 375x667 e 430x932.
- Desktop 1366x768.
- Despesas ativas com 1 e muitas categorias.
- Receitas ativas.
- Arquivadas.
- Busca sem resultado.
- Nome longo e descricao longa.
- Paginacao com `10`, `20`, `50`, `100`.
- Navegacao por teclado ate tabs, busca, `+`, menu `:` e paginacao.

