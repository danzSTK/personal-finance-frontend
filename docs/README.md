---
area: documentation
type: index
status: current
last_reviewed: 2026-11-24
related:
  - ./architecture/module-boundaries.md
  - ./architecture/api-error-handling.md
  - ./design-system/danfy-finance-design-system.md
  - ./design-system/material-3-reference.md
  - ./accounts/README.md
  - ./auth/README.md
  - ./categories/README.md
  - ./transactions/README.md
---

# Documentação — Danfy Finance Frontend

Este índice organiza toda a documentação viva, arquitetural, de design system e de especificações do repositório `personal-finance-frontend`.

## Mapa de Leitura Rápida

### Arquitetura e Plataforma Frontend
- [Limites entre Módulos (`module-boundaries.md`)](./architecture/module-boundaries.md) — Fronteiras entre `app`, `shared` e `features`, API pública via `index.ts` e dívidas técnicas registradas.
- [Tratamento de Erros da API (`api-error-handling.md`)](./architecture/api-error-handling.md) — Contrato estável por `code`, parser tipado em `src/shared/errors`, validação de campos e superfícies UX.

### Design System e UX
- [Danfy Finance Design System](./design-system/danfy-finance-design-system.md) — Tokens Danfy Dark, semântica financeira, tipografia Inter, Apple HIG e WCAG 2.2.
- [Material 3 Reference](./design-system/material-3-reference.md) — Famílias de componentes Material 3, variantes, estados, espaçamento e mapeamento para tokens Danfy.

### Módulos de Domínio (Documentação Viva)
Cada módulo segue a estrutura modular A1 (`README.md`, `concepts/`, `flows/`, `decisions/`, `components/`, `reference/`) e possui instruções locais em `src/features/<modulo>/AGENTS.md`:

- [Módulo `accounts`](./accounts/README.md) — Contas financeiras, templates institucionais/personalizados, saldo derivado, filtro de período e resumo detalhado.
- [Módulo `auth`](./auth/README.md) — Autenticação por cookies HttpOnly, OAuth Google, verificação de e-mail, sessões, providers, alteração de senha, perfil/avatar, configurações e shell autenticado.
- [Módulo `categories`](./categories/README.md) — Categorias de receitas e despesas (sistema e personalizadas), metadados visuais, arquivamento, exclusão e merge seguro.
- [Módulo `transactions`](./transactions/README.md) — Lançamentos (`INCOME`, `EXPENSE`, `TRANSFER`, `ADJUSTMENT`), filtros em URL, KPIs, confirmação de pendências e galeria de anexos.

### Especificações (Contratos de Mudança)
- `docs/specs/<modulo>/<feature>/specs/` — Contratos de Spec-Driven Development (`requirements.md`, `design.md`, `tasks.md`, `decisions.md`) governados pela skill `spec-driven-development`.

## Convenções de Metadados (`status` e `type`)

Todos os documentos vivos em `docs/` iniciam com frontmatter YAML canônico conforme `.agents/skills/modular-documentation/references/frontmatter-spec.md`:

| `status` | Significado |
| --- | --- |
| `draft` | Proposta ou rascunho ainda não consolidado no código implementado |
| `current` | Fonte ativa e canônica confirmada pelo código e contratos backend vigentes |
| `historical` | Registro útil preservado como contexto; não normativo para novas entregas |
| `deprecated` | Conteúdo substituído; não deve orientar novas mudanças |

Em specs (`docs/specs/**`), `approved` também é válido para contratos revisados antes/durante a implementação.

| `type` | Finalidade |
| --- | --- |
| `index` | Índice global (`docs/README.md`) ou de módulo (`docs/<modulo>/README.md`) |
| `concept` | Conceito de domínio/UI, modelo mental, estados e ownership |
| `flow` | Fluxo ponta a ponta, rotas, estados de tela e tabela de consumo backend |
| `decision` | Decisão arquitetural/UX atômica (`Problema`, `Decisão`, `Consequência`) |
| `component` | Composição por Atomic Design, dono de estado e fronteiras de dependência |
| `reference` | Matriz consolidada de rotas, endpoints, query keys, erros e gaps |

## Como Manter Esta Documentação

- Atualize a documentação viva em `docs/<modulo>/` e o `AGENTS.md` local na mesma entrega sempre que mudar fluxos, contratos, decisões ou componentes-chave.
- Use links relativos apenas dentro deste repositório. Para referenciar contratos do backend, use a notação portável `personal-finance-backend:docs/<caminho>`.
- Marque decisões substituídas com `decision-status: superseded` e link reverso `superseded-by`.
