---
area: documentation
feature: modular-documentation-and-agents
type: spec-requirements
status: current
last_reviewed: 2026-11-24
related:
  - ./design.md
  - ./tasks.md
  - ./decisions.md
  - ../../platform-feature-documentation/specs/decisions.md
---

# Requisitos — Documentação Modular, `AGENTS.md` por Módulo e Skills do Frontend

## Objetivo

Evoluir a documentação viva, a hierarquia de `AGENTS.md` e as skills do repositório `personal-finance-frontend` para o padrão **modular por domínio (A1)** alinhado ao `personal-finance-backend`, ampliando o contexto local de cada módulo (`src/features/<modulo>/AGENTS.md` e `src/shared/AGENTS.md`) e garantindo cobertura documental completa de todos os módulos ativos (`accounts`, `auth`, `categories`, `transactions`).

## Contexto e Motivação

A avaliação arquitetural e documental identificou lacunas que reduzem o desempenho de agentes de IA e de mantenedores humanos:

- Ausência de `AGENTS.md` locais nos módulos de feature e em `src/shared/`.
- Ausência de índices de leitura (`docs/README.md` e `docs/<modulo>/README.md`) e de roteamento Just-in-Time no `AGENTS.md` raiz.
- Ausência de governança explícita de fronteiras (`docs/architecture/module-boundaries.md`) registrando limites e dívidas técnicas reais entre `app`, `shared` e `features`.
- Estrutura documental anterior (`docs/<modulo>/<feature>/[<subfeature>/]documentacao/{decisions,flow,components}/`) com profundidade excessiva, mistura de idiomas (`documentacao/` vs. `decisions/flow/components`), sem camada de módulo (`concepts/`, `reference/`, `README.md`) e sem templates reutilizáveis.
- Desalinhamento de skills: `.claude/skills/` incompleto (faltando `spec-driven-development` e a skill documental), `spec-driven-development` com trechos copiados do backend (`docs/database/schema.md`, migrations, ORM entities, outbox, swagger), e arquivos obsoletos do GitHub Copilot (`.github/copilot-instructions.md`, `.github/instructions/`, `.github/skills/`).
- Cobertura viva desigual (`categories` com 0% de documentação viva; `accounts` e `transactions` parciais; `transactions/attachments` sem frontmatter; 11 links cross-repo quebrados em ambiente de worktree).

## Escopo (In Scope)

1. **Hierarquia de `AGENTS.md` e compatibilidade multi-agente**
   - Refatorar `AGENTS.md` raiz com protocolo de leitura hierárquica, tabela de *Just-in-Time Context Routing* e catálogo completo de skills.
   - Atualizar `CLAUDE.md` com instruções explícitas de leitura de `AGENTS.md` locais por módulo.
   - Criar `AGENTS.md` locais para `src/features/accounts`, `src/features/auth`, `src/features/categories`, `src/features/transactions` e `src/shared`.
   - Atualizar `README.md` raiz e `src/features/_template/README.md`.
2. **Governança arquitetural e índices**
   - Criar `docs/README.md` (índice global e taxonomia canônica de `status`/`type`).
   - Criar `docs/architecture/module-boundaries.md` (regras de fronteira, API pública via `index.ts`, exceções pragmáticas e dívidas técnicas registradas).
3. **Evolução e higiene das skills**
   - Substituir `.agents/skills/platform-feature-documentation` por `.agents/skills/modular-documentation` com templates completos em `references/` (`frontmatter-spec.md`, `module-index-template.md`, `module-agents-template.md`, `concept-template.md`, `flow-template.md`, `decision-template.md`, `component-template.md`).
   - Adaptar `.agents/skills/spec-driven-development` para ser 100% nativo do frontend.
   - Ajustar `.agents/skills/danfy-api-error-handling` para referências cross-repo portáveis.
   - Unificar `.claude/skills` como symlink direto para `../.agents/skills`.
   - Remover arquivos obsoletos do GitHub Copilot em `.github/copilot-instructions.md`, `.github/instructions/` e `.github/skills/`.
4. **Migração para estrutura modular A1 e documentação completa de todos os módulos**
   - Migrar todos os documentos vivos de `docs/accounts`, `docs/auth` e `docs/transactions` para `docs/<modulo>/{README.md, concepts/, flows/, decisions/, components/, reference/}`, removendo integralmente todas as pastas `documentacao/`.
   - Completar a documentação viva dos módulos `accounts`, `auth`, `categories` e `transactions` com base estrita no código implementado e contratos vigentes.
5. **Saneamento de higiene documental**
   - Adicionar frontmatter canônico em documentos vivos e specs sem metadados.
   - Substituir links relativos frágeis `../../../../../../personal-finance-backend/...` por referências portáveis `personal-finance-backend:docs/...`.

## Fora de Escopo (Out of Scope)

- Refatoração de código de produto (como extrair `DashboardPage` de `auth`, inverter `src/shared/config/axios.ts` ou criar novos `index.ts` de barrel export alterando imports de runtime). Essas dívidas devem ser registradas explicitamente em `docs/architecture/module-boundaries.md` para refatorações futuras controladas.
- Alteração de comportamento de telas, rotas, chamadas HTTP ou regras de negócio.
- Remoção de specs históricas em `docs/specs/`.

## Requisitos Funcionais e de Governança

- **REQ-01:** WHEN um agente ou mantenedor atuar em qualquer módulo (`src/features/<modulo>/` ou `src/shared/`), THE SYSTEM SHALL disponibilizar um `AGENTS.md` local contendo propósito do módulo, documentação obrigatória em `docs/<modulo>/`, fronteiras arquiteturais e invariantes locais.
- **REQ-02:** WHEN a documentação viva de qualquer módulo for consultada em `docs/<modulo>/`, THE SYSTEM SHALL seguir a estrutura modular A1 (`README.md`, `concepts/`, `flows/`, `decisions/`, `components/`, `reference/`), sem nenhuma pasta legada `documentacao/`.
- **REQ-03:** WHEN um documento Markdown existir em `docs/<modulo>/`, THE SYSTEM SHALL iniciar com frontmatter YAML válido (`area`, `type`, `status`, e `related` com links relativos válidos; e para decisões, `decision-id` e `decision-status`).
- **REQ-04:** WHEN uma decisão nova substituir uma anterior, THE SYSTEM SHALL preservar a rastreabilidade explícita via `supersedes` / `superseded-by` e `decision-status: superseded`.
- **REQ-05:** WHEN uma skill for carregada via `.agents/skills/` ou `.claude/skills/`, THE SYSTEM SHALL expor exatamente o mesmo conjunto de skills através de fonte única de verdade (`.claude/skills -> ../.agents/skills`).
- **REQ-06:** WHEN a skill `spec-driven-development` for consultada no frontend, THE SYSTEM SHALL orientar exclusivamente artefatos e impactos de frontend, sem exigir arquivos inexistentes do backend (`docs/database/schema.md`, migrations, ORM entities, outbox).
- **REQ-07:** WHEN a validação automatizada de links e cobertura for executada ao final da entrega, THE SYSTEM SHALL apresentar zero pastas `documentacao/`, zero links relativos internos quebrados em `docs/` e `AGENTS.md`, e 100% dos módulos ativos (`accounts`, `auth`, `categories`, `transactions`) documentados com base em evidências do código atual.

## Critérios de Aceite

- Draft PR aberto contra `develop` a partir da branch `docs/organizacao-docs-and-skills`.
- Todos os 5 `AGENTS.md` locais criados e validados contra os caminhos existentes em `docs/`.
- `docs/README.md`, `docs/architecture/module-boundaries.md` e `docs/<modulo>/README.md` (4 módulos) criados e coerentes.
- Toda a documentação de `auth`, `accounts`, `categories` e `transactions` migrada/completada em A1 sem perda de conteúdo nem links quebrados.
- `.agents/skills/modular-documentation` e `.agents/skills/spec-driven-development` atualizadas; `.claude/skills` apontando para `../.agents/skills`; artefatos obsoletos do GitHub Copilot removidos.
- `npm run lint`, `npm test` e `npm run build` verdes (garantindo zero regressão no projeto).
