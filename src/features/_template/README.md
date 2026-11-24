# Feature Module Template

Template base para criação de novos módulos de domínio em `src/features/<modulo>/`.

## Como usar

1. Copie esta pasta `_template` e renomeie para o nome do módulo (ex.: `budgets`, `dashboard`).
2. Crie o `AGENTS.md` local seguindo `.agents/skills/modular-documentation/references/module-agents-template.md`.
3. Crie a documentação viva do módulo em `docs/<modulo>/` (`README.md`, `concepts/`, `flows/`, `decisions/`, `components/`, `reference/`) e registre-o em `docs/README.md` e `AGENTS.md` raiz.
4. Exponha apenas a API pública intencional do módulo em `index.ts` (não exporte internos, stores privadas ou helpers one-off).

## Estrutura Recomendada

```text
<modulo>/
├── AGENTS.md           # Instruções locais, docs obrigatórios e invariantes
├── index.ts            # API pública do módulo para consumo cross-feature
├── api/                # Queries e mutations (TanStack Query)
├── components/         # Componentes organizados por Atomic Design
│   ├── atoms/
│   ├── molecules/
│   ├── organisms/
│   ├── templates/
│   └── pages/
├── constants/          # Rotas, endpoints, query keys e labels
├── hooks/              # Hooks customizados do módulo (quando necessário)
├── schemas/            # Schemas Zod para formulários e parsing
├── stores/             # Stores Zustand focadas (somente se necessário)
├── types/              # Contratos TypeScript de API e UI
└── utils/              # Funções puras de transformação/URL/regras locais
```

## Convenções

- Use named exports; evite default exports.
- Mantenha regras de negócio fora de componentes de apresentação.
- Trate erros da API exclusivamente via `src/shared/errors` (`apiErrorCodes.ts`, `ApiErrorAlert`, `applyApiFieldErrors`, `showApiErrorToast`).
- Persista filtros, busca, paginação e períodos na URL query string.
- Preserve contratos `amountCents` (inteiros) e `DateOnly` (`YYYY-MM-DD`).
