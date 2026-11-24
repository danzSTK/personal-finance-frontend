---
name: spec-driven-development
description: "Use when starting, planning, reviewing, or implementing a feature/spec in this frontend repository. Enforces Spec-Driven Development as the default project workflow: create or update docs/specs/<module>/<feature>/specs/{requirements,design,tasks,decisions}.md before coding; keep the spec alive during implementation; stop and update the spec when business rules, API contracts, UX decisions, or module boundaries change."
---

# Spec-Driven Development (Frontend)

Use Spec-Driven Development como workflow padrão para novas features, comportamentos cross-module ou mudanças relevantes de produto/arquitetura neste repositório.

A spec é o contrato de implementação. Não a trate como anotação descartável.

## Regra Central

Antes de implementar uma nova feature ou mudança relevante, crie ou atualize:

```text
docs/specs/<module>/<feature>/specs/
├── requirements.md
├── design.md
├── tasks.md
└── decisions.md
```

A implementação de código de produto só começa depois que `requirements.md`, `design.md` e `tasks.md` forem revisados ou explicitamente aprovados pelo usuário.

## Workflow

1. **Ler contexto antes de especificar:** leia o `AGENTS.md` raiz, o `AGENTS.md` local de cada módulo afetado (`src/features/<module>/AGENTS.md` e `src/shared/AGENTS.md`), a documentação viva em `docs/<module>/README.md`, `docs/architecture/module-boundaries.md`, `docs/architecture/api-error-handling.md`, `docs/design-system/` e a documentação de integração correspondente do backend (`personal-finance-backend:docs/integrations/<recurso>/`).
2. **Escrever `requirements.md`:** objetivo, escopo, fora de escopo, regras de negócio e UX, fluxos principais/alternativos, estados (loading, empty, pending, error, offline), casos de borda, acessibilidade e critérios de aceite testáveis.
3. **Derivar `design.md`:** rotas, estrutura por Atomic Design, donos de estado (TanStack Query, URL query string, Zustand, React Hook Form + Zod), consumo de API e códigos de erro (`src/shared/errors/apiErrorCodes.ts`), limites entre módulos, tokens Danfy Dark / Material 3, estratégia de testes (Vitest/Testing Library) e impacto em `docs/<module>/` e `AGENTS.md` locais.
4. **Quebrar `tasks.md`:** tarefas pequenas, ordenadas e rastreáveis incluindo explicitamente testes e atualização da documentação modular viva (`docs/<module>/` e `AGENTS.md`).
5. **Registrar `decisions.md`:** sempre que surgir trade-off de UX, escolha arquitetural, alternativa descartada ou mudança de direção.
6. **Implementar tarefa por tarefa:** mantenha `tasks.md` atualizado e atualize a documentação viva em `docs/<module>/` na mesma entrega via skill `modular-documentation`.

## Condições de Parada (Stop Conditions)

Pare a implementação e atualize a spec primeiro sempre que:

- uma regra de negócio ou fluxo de usuário mudar;
- surgir um caso de borda não coberto;
- um contrato HTTP, payload, `DateOnly`/centavos ou código de erro do backend divergir do previsto;
- uma tarefa exigir um desenho técnico ou superfície de UI (modal/sheet/inline) diferente do aprovado;
- uma decisão impactar fronteiras entre módulos (`docs/architecture/module-boundaries.md`) ou outros módulos consumidores.

Se a mudança for apenas detalhe interno que preserva integralmente o comportamento aprovado, registre em `decisions.md` e continue.

## Detalhes dos Arquivos

Leia [references/spec-files.md](references/spec-files.md) para o formato esperado de cada um dos quatro arquivos da spec.
