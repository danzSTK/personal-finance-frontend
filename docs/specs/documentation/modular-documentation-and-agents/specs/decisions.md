---
area: documentation
feature: modular-documentation-and-agents
type: spec-decisions
status: current
last_reviewed: 2026-11-24
related:
  - ./requirements.md
  - ./design.md
  - ./tasks.md
  - ../../platform-feature-documentation/specs/decisions.md
---

# Decisões — Documentação Modular, `AGENTS.md` por Módulo e Skills do Frontend

## DEC-001 — Adotar estrutura modular A1 alinhada ao backend

Status: accepted

Supersedes: `../../platform-feature-documentation/specs/decisions.md` (`DEC-011`)

Problem:
A estrutura anterior (`docs/<modulo>/<feature>/[<subfeature>/]documentacao/{decisions,flow,components}/`) gerava profundidade de até 5 níveis, misturava português (`documentacao/`) com inglês (`decisions/`, `flow/`, `components/`) e não possuía nível de módulo (`README.md`, `concepts/`, `reference/`) para ancorar `AGENTS.md` locais.

Decision:
Adotar a estrutura modular A1 em todos os módulos de domínio do frontend: `docs/<modulo>/{README.md, concepts/, flows/, decisions/, components/, reference/}`, removendo todas as pastas intermediárias `documentacao/`.

Consequences:
- Alinhamento cognitivo e estrutural direto entre `personal-finance-backend` e `personal-finance-frontend`.
- Mantém o eixo `components/` específico de frontend (Atomic Design, estado, shared e cross-feature) ao lado dos 4 pilares do backend (`concepts/`, `flows/`, `decisions/`, `reference/`).
- Exige migração única dos documentos atuais de `accounts`, `auth` e `transactions`, atualizando todos os links internos.

## DEC-002 — Evoluir a skill documental para `modular-documentation`

Status: accepted

Supersedes: `../../platform-feature-documentation/specs/decisions.md` (`DEC-003` quanto ao nome e escopo da skill)

Problem:
`platform-feature-documentation` focava apenas em folhas de feature sem templates reutilizáveis, sem governança de `AGENTS.md` por módulo e contendo regras específicas de `auth` hardcoded no `SKILL.md` global.

Decision:
Substituir `platform-feature-documentation` por `.agents/skills/modular-documentation/`, equipada com templates dedicados em `references/` (incluindo `module-index-template.md`, `module-agents-template.md` e `component-template.md`), governando em conjunto `docs/<modulo>/`, `docs/README.md`, `docs/architecture/module-boundaries.md` e `src/features/<modulo>/AGENTS.md`.

Consequences:
- Mesmo nome de skill entre backend e frontend, reduzindo atrito de invocação.
- Regras específicas de domínio (ex.: cookies HttpOnly de `auth`) migram para o `AGENTS.md` do respectivo módulo.

## DEC-003 — `AGENTS.md` locais por módulo e `src/shared/`

Status: accepted

Problem:
Concentrar todas as regras de todos os domínios em um único `AGENTS.md` raiz sobrecarrega contexto global e deixa invariantes específicas de cada módulo (`accounts`, `auth`, `categories`, `transactions`, `shared`) sem proteção local próxima ao código.

Decision:
Criar `AGENTS.md` em cada módulo (`src/features/<modulo>/AGENTS.md` e `src/shared/AGENTS.md`) seguindo o modelo do backend (propósito, documentação obrigatória em `docs/<modulo>/`, fronteiras e invariantes) e adicionar roteamento *Just-in-Time* no `AGENTS.md` raiz e instruções explícitas de leitura no `CLAUDE.md`.

Consequences:
- Agentes carregam apenas o contexto necessário ao módulo alterado.
- Mudanças de fronteira ou invariante passam a exigir atualização do `AGENTS.md` local na mesma entrega.

## DEC-004 — Fonte única de skills via `.claude/skills -> ../.agents/skills` e remoção do legado Copilot

Status: accepted

Problem:
Symlinks manuais individuais em `.claude/skills/` deixaram duas skills fora do alcance do Claude Code; `.github/skills/frontend-design/SKILL.md` divergiu; e `.github/copilot-instructions.md` continha contratos obsoletos (Bearer token, Vite 5, `useAuth`) sem uso ativo de GitHub Copilot no repositório.

Decision:
Substituir `.claude/skills` por um único symlink apontando para `../.agents/skills` (idêntico ao backend) e remover `.github/copilot-instructions.md`, `.github/instructions/` e `.github/skills/`.

Consequences:
- Elimina risco de drift entre `.agents/skills` e `.claude/skills`.
- Remove ~1.800 linhas de instruções duplicadas e contraditórias em `.github/`.

## DEC-005 — Notação portável para referências cross-repo ao backend

Status: accepted

Problem:
Links relativos como `../../../../../../personal-finance-backend/docs/integrations/...` assumem um layout fixo de pasta irmã e quebram em worktrees isolados.

Decision:
Referenciar documentos do repositório backend com o identificador canônico `personal-finance-backend:docs/<caminho>` em texto e tabelas, mantendo links relativos apenas dentro do próprio repositório frontend.

Consequences:
- Zero falsos positivos ou links quebrados em validações dentro de worktrees.
- Mantém rastreabilidade clara para o contrato de integração no backend.
