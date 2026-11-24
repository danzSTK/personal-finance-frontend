# Spec Files (Frontend)

Use esta estrutura para specs de features no frontend:

```text
docs/specs/<module>/<feature>/specs/
├── requirements.md
├── design.md
├── tasks.md
└── decisions.md
```

Exemplo:

```text
docs/specs/transactions/transaction-attachments/specs/
├── requirements.md
├── design.md
├── tasks.md
└── decisions.md
```

Todos os quatro arquivos devem iniciar com frontmatter YAML canônico:

```yaml
---
area: <module>
feature: <feature>
type: spec-requirements | spec-design | spec-tasks | spec-decisions
status: draft | approved | current | historical | deprecated
last_reviewed: YYYY-MM-DD
related:
  - ./design.md
---
```

## `requirements.md`

Propósito: definir **o que** deve acontecer e **por quê**, sem código de implementação.

Inclua:

- objetivo e contexto (referenciando `docs/<module>/README.md` e contratos backend como `personal-finance-backend:docs/integrations/<recurso>/...`);
- escopo (`In Scope`) e fora de escopo (`Out of Scope`);
- regras de negócio, capacidades (gates por provider/status/permissão) e invariantes financeiras/temporais (`amountCents`, `DateOnly`);
- fluxos principais e alternativos do usuário;
- estados obrigatórios de tela (loading, empty, pending, success, error, offline/unauthorized);
- acessibilidade (teclado, foco, contraste, não depender apenas de cor) e responsividade mobile-first;
- casos de borda e critérios de aceite testáveis.

Prefira redação testável:

```text
WHEN <condição>
THE SYSTEM SHALL <comportamento esperado>
```

```text
IF <condição>
THEN <resultado esperado>
```

## `design.md`

Propósito: definir **como** os requisitos aprovados serão implementados no frontend.

Inclua:

- rotas frontend afetadas e parâmetros de URL (query string para filtros/períodos/busca/ordenação);
- composição de componentes por Atomic Design (`atoms`, `molecules`, `organisms`, `templates`, `pages`) e distinção entre próprio, `shared` e cross-feature;
- donos de estado: TanStack Query (query keys, `staleTime`, invalidações), Zustand (quando aplicável), React Hook Form + Zod;
- consumo de API backend (operações, payloads, contrato `DateOnly`/centavos) e inventário de códigos de erro mapeados em `src/shared/errors/apiErrorCodes.ts` com superfícies de recuperação (`ApiErrorAlert`, erro de campo, toast);
- decisões de Design System (Danfy Dark tokens, família Material 3, modal vs. sheet vs. inline);
- impacto em fronteiras entre módulos (`docs/architecture/module-boundaries.md` e API pública `index.ts`);
- estratégia de testes (Vitest + Testing Library: schemas, utils, queries/mutations, fluxos críticos de erro/acessibilidade);
- impacto documental em `docs/<module>/` e `src/features/<module>/AGENTS.md`.

Não esconda mudanças de regra de negócio aqui. Se o design revelar nova regra, atualize `requirements.md`.

## `tasks.md`

Propósito: quebrar a implementação em tarefas pequenas, ordenadas e rastreáveis.

Use checklist em Markdown:

```md
- [ ] 1. Adicionar constantes de rota/endpoint e tipos em `src/features/<module>/`
- [ ] 2. Implementar schema Zod e utilitários com testes unitários
- [ ] 3. Implementar queries/mutations e mapeamento de erros em `src/shared/errors`
- [ ] 4. Construir componentes (atoms/molecules/organisms/page) com estados loading/empty/error
- [ ] 5. Atualizar documentação viva em `docs/<module>/` e `src/features/<module>/AGENTS.md`
```

Regras:

- cada tarefa deve ter saída clara e verificável;
- evite tarefas vagas como "implementar tudo";
- inclua explicitamente tarefas de testes, `npm run lint` / `npm run build` e atualização de documentação modular;
- mantenha a ordem próxima da ordem real de execução.

## `decisions.md`

Propósito: manter a spec viva registrando escolhas, trade-offs e desvios durante o planejamento e a implementação.

Use ADRs leves locais:

```md
## DEC-001 — Manter filtros da listagem sincronizados na URL

Status: accepted

Problem:
Manter filtros apenas em `useState` perde o contexto ao recarregar a página ou compartilhar deep links do dashboard.

Decision:
Persistir filtros, busca e período na query string com utilitário dedicado de parse/serialize.

Consequences:
Preserva histórico do navegador e habilita deep links, exigindo normalização segura de parâmetros inválidos.
```

## Regra de Aprovação e Manutenção

Não implemente código de feature antes que `requirements.md`, `design.md` e `tasks.md` existam e sejam aprovados ou liberados pelo usuário.

Durante a implementação:

- se comportamento de produto mudar, atualize `requirements.md`;
- se desenho técnico mudar, atualize `design.md`;
- se ordem/escopo de tarefas mudar, atualize `tasks.md`;
- se surgir decisão/trade-off relevante, registre em `decisions.md`;
- ao concluir a entrega, sincronize a documentação viva em `docs/<module>/` e `src/features/<module>/AGENTS.md` via skill `modular-documentation`.
