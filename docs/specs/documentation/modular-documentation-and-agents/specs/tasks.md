---
area: documentation
feature: modular-documentation-and-agents
type: spec-tasks
status: current
last_reviewed: 2026-11-24
related:
  - ./requirements.md
  - ./design.md
  - ./decisions.md
---

# Tarefas — Documentação Modular, `AGENTS.md` por Módulo e Skills do Frontend

## Fase 0 — Spec e Draft PR

- [x] 0.1 Criar spec em `docs/specs/documentation/modular-documentation-and-agents/specs/` (`requirements.md`, `design.md`, `tasks.md`, `decisions.md`).
- [x] 0.2 Atualizar `docs/specs/documentation/platform-feature-documentation/specs/decisions.md` registrando substituição da estrutura `documentacao/` pela estrutura modular A1.
- [x] 0.3 Fazer push da branch `docs/organizacao-docs-and-skills` e abrir Draft PR contra `develop`.

## Fase 1 — Skills e Higiene Multi-Agente

- [x] 1.1 Criar `.agents/skills/modular-documentation/` com `SKILL.md`, `agents/openai.yaml` e templates em `references/` e remover `.agents/skills/platform-feature-documentation/`.
- [x] 1.2 Adaptar `.agents/skills/spec-driven-development/` (`SKILL.md`, `references/spec-files.md`) para artefatos e governança de frontend.
- [x] 1.3 Atualizar referências cross-repo em `.agents/skills/danfy-api-error-handling/SKILL.md`.
- [x] 1.4 Substituir `.claude/skills` pelo symlink único `../.agents/skills`.
- [x] 1.5 Remover artefatos obsoletos do GitHub Copilot (`.github/copilot-instructions.md`, `.github/instructions/`, `.github/skills/`).

## Fase 2 — `AGENTS.md` Hierárquico e Governança Arquitetural

- [x] 2.1 Refatorar `AGENTS.md` raiz com protocolo hierárquico, tabela de *Just-in-Time Context Routing* e catálogo de skills.
- [x] 2.2 Atualizar `CLAUDE.md` com notas de compatibilidade para leitura explícita de `AGENTS.md` locais.
- [x] 2.3 Criar `docs/README.md` e `docs/architecture/module-boundaries.md` (incluindo frontmatter em `docs/architecture/api-error-handling.md`).
- [x] 2.4 Criar `AGENTS.md` locais em `src/features/accounts/`, `src/features/auth/`, `src/features/categories/`, `src/features/transactions/` e `src/shared/`.
- [x] 2.5 Atualizar `README.md` raiz e `src/features/_template/README.md`.

## Fase 3 — Migração A1 e Documentação Completa por Módulo

- [x] 3.1 Migrar e completar `docs/auth/` (`README.md`, `concepts/`, `flows/`, `decisions/`, `components/`, `reference/`), removendo pastas `documentacao/`.
- [x] 3.2 Migrar e completar `docs/accounts/` (`README.md`, `concepts/`, `flows/`, `decisions/`, `components/`, `reference/`), removendo `account-templates/documentacao/`.
- [x] 3.3 Criar documentação completa de `docs/categories/` (`README.md`, `concepts/`, `flows/`, `decisions/`, `components/`, `reference/`).
- [x] 3.4 Migrar e completar `docs/transactions/` (`README.md`, `concepts/`, `flows/`, `decisions/`, `components/`, `reference/`), removendo `screen/documentacao/` e `attachments/documentacao/`.

## Fase 4 — Saneamento de Specs e Validação Final

- [x] 4.1 Adicionar frontmatter canônico em `docs/specs/transactions/transaction-attachments/specs/*.md` (e `docs/design-system/*.md`) e corrigir links cross-repo quebrados em `docs/specs/`.
- [x] 4.2 Executar auditoria automatizada (zero `documentacao/`, zero links relativos quebrados, frontmatter 100% válido, cobertura de endpoints).
- [x] 4.3 Executar `npm run lint`, `npm test` e `npm run build`.
- [x] 4.4 Atualizar status das tarefas, fazer commits limpos por escopo, push e atualizar descrição do Draft PR.
