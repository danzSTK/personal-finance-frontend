@AGENTS.md

## Notas de Compatibilidade (Claude Code)

Este repositório mantém `AGENTS.md` (na raiz, em `src/features/<modulo>/AGENTS.md` e em `src/shared/AGENTS.md`) e `.agents/skills/` como fonte única de verdade compartilhada entre **Codex**, **Claude Code** e demais agentes.

- **Instruções por módulo:** Antes de planejar, editar ou revisar arquivos dentro de `src/features/<modulo>/` ou `src/shared/`, leia explicitamente o `AGENTS.md` daquele módulo (o Claude Code não carrega `AGENTS.md` aninhados automaticamente).
- **Skills compartilhadas:** `.claude/skills` é um symlink direto para `../.agents/skills`. Use `/spec-driven-development`, `/modular-documentation`, `/danfy-api-error-handling`, `/frontend-design`, `/danfy-finance-design-system`, `/material-3-ui-guidance` e `/shadcn` conforme a tarefa.
- **MCP shadcn:** `.mcp.json` na raiz configura o servidor MCP oficial do shadcn (`npx shadcn@latest mcp`) para o Claude Code consultar registries e exemplos; para tokens Danfy Dark, Atomic Design, Apple HIG e WCAG 2.2, prevalecem `danfy-finance-design-system`, `frontend-design` e `material-3-ui-guidance`.
- **Para editar regras globais:** altere `AGENTS.md` na raiz ou o `AGENTS.md` do módulo correspondente — nunca duplique regras neste arquivo.
