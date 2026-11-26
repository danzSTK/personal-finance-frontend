---
area: design-system
feature: shadcn-v4-rhea-react19-ai-tooling
type: spec-requirements
status: draft
last_reviewed: 2026-11-26
related:
  - ./design.md
  - ./tasks.md
  - ./decisions.md
  - ../../../../design-system/danfy-finance-design-system.md
  - ../../../../design-system/material-3-reference.md
  - ../../../../architecture/module-boundaries.md
  - ../../../../README.md
---

# Requirements — Atualização do Design System Danfy (shadcn v4 Rhea, React 19 e AI Tooling)

## Objetivo

Modernizar integralmente a base de componentes, estilos e ferramental de IA do frontend da **Danfy Finance** (`personal-finance-frontend`), consolidando:

1. **AI Tooling oficial do shadcn v4:** servidor **MCP** configurado para **Claude Code** e **Codex**, **skill oficial `shadcn`** instalada em `.agents/skills/` (espelhada para `.claude/skills/`) e governança explícita da **CLI v4 (`4.23.1+`)** nos arquivos `AGENTS.md` e `CLAUDE.md`.
2. **Modernização da plataforma UI:** atualização para **React 19**, **`lucide-react` v1**, pacote unificado **`radix-ui`**, pacote **`cn`**, `shadcn/tailwind.css` e atualização do `components.json` para o estilo moderno **`radix-rhea`** (geometria arredondada suave inspirada em Apple HIG/macOS com densidade compacta ideal para SaaS financeiro).
3. **Eliminação de duplicatas legadas:** unificação de `src/shared/lib/{button,card,input,label,toast}.tsx` para a fonte única de verdade em `src/shared/components/ui/*`.
4. **Atualização dos componentes de UI e refino visual dos consumidores:** migração controlada dos primitivos em `src/shared/components/ui/*` para a geração v4 **`radix-rhea`** preservando 100% dos tokens **Danfy Dark**, customizações de acessibilidade e contratos funcionais, seguida de refino nos componentes compartilhados e telas de produto.

## Fontes de Contexto

- `AGENTS.md` e `CLAUDE.md`
- `src/shared/AGENTS.md`
- `docs/design-system/danfy-finance-design-system.md`
- `docs/design-system/material-3-reference.md`
- `docs/architecture/module-boundaries.md`
- `docs/architecture/api-error-handling.md`
- `docs/README.md`
- Documentação oficial shadcn/ui v4 (`https://ui.shadcn.com/docs/mcp`, `/docs/skills`, `/docs/cli`, `/docs/components-json`, `/docs/changelog`)

## Escopo (`In Scope`)

### Frente 1 — AI Tooling (MCP + Skills + CLI v4)
- Configurar o servidor MCP oficial do shadcn (`npx shadcn@latest mcp`) para **Claude Code** via `.mcp.json` versionado no repositório.
- Configurar o servidor MCP oficial do shadcn para **Codex** no ambiente local (`~/.codex/config.toml`) e documentar o bloco de configuração no repositório para reprodutibilidade.
- Instalar a skill oficial `shadcn` em `.agents/skills/shadcn/` (acessível automaticamente via symlink `.claude/skills -> ../.agents/skills`) e revisar sua sinergia com `danfy-finance-design-system`, `frontend-design` e `material-3-ui-guidance`.
- Documentar explicitamente no `AGENTS.md`, `CLAUDE.md` e `src/shared/AGENTS.md` a existência e o uso recomendado do MCP, da skill `shadcn` e dos comandos da CLI v4 (`shadcn info --json`, `shadcn docs <comp>`, `shadcn search`, `shadcn list`, `shadcn view`, `shadcn add --dry-run / --diff / --view`).

### Frente 2 — Plataforma React 19 + Radix Unificado + `cn` + `components.json`
- Atualizar `react`, `react-dom`, `@types/react` e `@types/react-dom` para **React 19** (`19.3.x`), atualizando `lucide-react` para `^1.81.0` (removendo o bloqueio de peerDependency de `lucide-react@0.356.0`).
- Instalar `shadcn` em `devDependencies` e integrar `@import 'shadcn/tailwind.css';` em `src/index.css`, preservando todos os tokens semânticos **Danfy Dark** (`app-*`, `brand*`, `state-*`, `account-*`, `sidebar-*`), `.numeric`, utilitários de gradiente de conta e estilos de scrollbar.
- Atualizar `components.json` para o schema v4:
  - `style: "radix-rhea"` (substituindo `"default"`, hoje depreciado),
  - `iconLibrary: "lucide"`,
  - aliases explícitos para `components`, `utils`, `ui`, `lib` e `hooks`.
- Consolidar os 27 pacotes `@radix-ui/react-*` individuais no pacote único `radix-ui` (`shadcn migrate radix`).
- Migrar `clsx` + `tailwind-merge` para o pacote único `cn` (`shadcn migrate cn`), mantendo `src/shared/lib/utils.ts` re-exportando `export { cn } from 'cn'` para preservar compatibilidade com todo o projeto.

### Frente 3 — Consolidação de Primitivos Legados (`src/shared/lib/*`)
- Migrar todos os imports de `@/shared/lib/{button,card,input,label,toast}` em `src/shared/` e `src/features/` para `@/shared/components/ui/{button,card,input,label,toast}` (incluindo `src/shared/components/organisms/Toaster.tsx`).
- Remover os 5 arquivos duplicados `src/shared/lib/{button,card,input,label,toast}.tsx`, mantendo `src/shared/lib/utils.ts`.

### Frente 4 — Atualização dos Primitivos UI (`radix-rhea`) e Refino Consumidor
- Atualizar os componentes em `src/shared/components/ui/` para a geração v4 **`radix-rhea`** (funções nativas React 19 com `data-slot`, imports de `radix-ui` e `cn`, geometria arredondada suave + densidade compacta) usando inspeção prévia (`--diff` / `view`).
- Preservar integralmente customizações de produto já existentes, incluindo:
  - `DialogContent`: suporte às props `closeDisabled` e `hideCloseButton` (compatível com `showCloseButton`), texto acessível `"Fechar"` em português e alvo de toque confortável;
  - `AlertDialog`, `Sheet`, `Drawer`, `Select`, `Popover`, `DropdownMenu`, `Toast`/`Toaster`, `Table`, `Card`, `Button`, `Input`: harmonia visual com Danfy Dark, contraste WCAG 2.2 e foco visível.
- Auditar e refinar componentes compartilhados (`CurrencyInput`, `DateOnlyPicker`, `MonthYearPicker`, `ExpandableSearch`, `ApiErrorAlert`, `ErrorState`, `Toaster`) e telas consumidoras (`auth`, `accounts`, `categories`, `transactions`) para garantir consistência visual e ergonômica com o novo sistema **`radix-rhea`**.
- Sincronizar documentação viva (`docs/design-system/*`, `docs/README.md`, `src/shared/AGENTS.md`, `AGENTS.md`, `CLAUDE.md`).

## Fora de Escopo (`Out of Scope`)

- Migração para `@base-ui/react` ou `react-aria` (mantemos **Radix UI** unificado para preservar `asChild` e estabilidade da base).
- Alteração de regras de negócio financeiras, contratos HTTP, payloads de API, `DateOnly`, centavos ou fluxos de autenticação/transações/contas/categorias.
- Resolução das dívidas técnicas arquiteturais não relacionadas a UI (`DT-01`, `DT-02`, `DT-03`, `DT-04`, `DT-05` em `docs/architecture/module-boundaries.md`).
- Adição de tema claro (Light Mode): o produto permanece **Danfy Dark** (`dark-first`).
- Instalação de registries externos pagos ou privados de terceiros (o `components.json` fica pronto para `registries`, usando `@shadcn` como padrão).

## Requisitos Funcionais e Técnicos (Testáveis)

### RF-01 — MCP do shadcn operacional para Claude Code e Codex
- **WHEN** um cliente MCP (Claude Code via `.mcp.json` ou Codex via `~/.codex/config.toml`) inicia o servidor `shadcn` configurado com `npx shadcn@latest mcp`,
- **THE SYSTEM SHALL** completar o handshake MCP e expor todas as 7 tools oficiais (`get_project_registries`, `list_items_in_registries`, `search_items_in_registries`, `view_items_in_registries`, `get_item_examples_from_registries`, `get_add_command_for_items`, `get_audit_checklist`) operando sobre o `components.json` do repositório.

### RF-02 — Skill oficial `shadcn` e governança CLI v4 para agentes
- **WHEN** um agente (Codex, Claude Code ou Antigravity) consulta `.agents/skills/` ou `AGENTS.md` / `CLAUDE.md`,
- **THE SYSTEM SHALL** disponibilizar a skill `shadcn` em `.agents/skills/shadcn/` (refletida em `.claude/skills/shadcn/`) e instruções claras sobre MCP, `shadcn info --json`, `shadcn docs <componente>`, `shadcn search/list/view` e `shadcn add --dry-run / --diff / --view`, explicitando que regras de tokens **Danfy Dark** e **Atomic Design** prevalecem sobre padrões genéricos do shadcn.

### RF-03 — `components.json` em conformidade com schema shadcn v4 (`radix-rhea`)
- **WHEN** `npx shadcn@latest info --json` é executado na raiz do projeto,
- **THE SYSTEM SHALL** reconhecer `style: "radix-rhea"`, `base: "radix"`, `iconLibrary: "lucide"`, `tailwindVersion: "v4"` e resolver explicitamente os paths `ui`, `components`, `lib`, `hooks` e `utils` sem avisos de estilo depreciado.

### RF-04 — Upgrade seguro para React 19, `lucide-react` v1, `radix-ui` e `cn`
- **WHEN** `npm install`, `npm run lint`, `npm test` e `npm run build` são executados após o upgrade de dependências,
- **THE SYSTEM SHALL** concluir sem erros de peerDependencies, sem erros de TypeScript (`tsc`), sem avisos de ESLint (`--max-warnings 0`), sem uso de `any` novo e com 100% da suíte de testes unitários e de integração aprovada.
- **IF** algum pacote `@radix-ui/react-*` residual ou referência a `clsx`/`tailwind-merge` permanecer desnecessário em `package.json`,
- **THEN** deverá ser removido após validação de que nenhum módulo do projeto depende diretamente dele.

### RF-05 — Eliminação das duplicatas legadas de `src/shared/lib/`
- **WHEN** o código-fonte em `src/` é inspecionado após a Fase 3,
- **THE SYSTEM SHALL** ter zero imports para `@/shared/lib/{button,card,input,label,toast}` e zero arquivos de componentes duplicados em `src/shared/lib/`, mantendo apenas `src/shared/lib/utils.ts`.

### RF-06 — Primitivos UI atualizados para `radix-rhea` com invariantes Danfy preservadas
- **WHEN** qualquer componente em `src/shared/components/ui/` é renderizado nas telas do produto,
- **THE SYSTEM SHALL** aplicar a geometria e densidade `radix-rhea` sobre os tokens semânticos **Danfy Dark** (`src/index.css`) sem cores hardcoded (`#...`, `rgb(...)`, paletas cruas do Tailwind).
- **WHEN** `DialogContent` é usado com `closeDisabled` (ex.: `ChangePasswordDialog`) ou `hideCloseButton` (ex.: `TransactionAttachmentImageViewer`),
- **THE SYSTEM SHALL** honrar ambas as props, manter o rótulo acessível `"Fechar"` e preservar a operação por teclado (`Escape`, foco visível e retorno de foco).

### RF-07 — Qualidade visual, acessibilidade e verificação real de cliente
- **WHEN** a aplicação é aberta no navegador em viewport desktop e mobile após a modernização,
- **THE SYSTEM SHALL** renderizar sem erros de console/runtime, mantendo hierarquia de superfícies Danfy Dark (`app-bg`, `app-surface`, `app-panel`, `app-elevated`, `app-border`), números monetários com `.numeric`, contraste WCAG 2.2 AA, alvos de toque confortáveis em mobile e estados `hover`, `focus-visible`, `disabled`, `loading`, `empty` e `error` claros e consistentes.

## Critérios de Aceite

1. `.mcp.json` válido na raiz do repo + `[mcp_servers.shadcn]` ativo em `~/.codex/config.toml`, verificados via teste real de protocolo MCP (`initialize`, `tools/list`, chamada de tool).
2. Skill `.agents/skills/shadcn/SKILL.md` presente e acessível via `.claude/skills/shadcn/SKILL.md`; `AGENTS.md`, `CLAUDE.md` e `src/shared/AGENTS.md` atualizados com a governança MCP + Skills + CLI v4.
3. `package.json` rodando em `react@19.x`, `react-dom@19.x`, `lucide-react@1.x`, `radix-ui@1.x`, `cn@0.5.x` e `shadcn` em `devDependencies`, sem os 27 `@radix-ui/react-*` individuais nem `clsx`/`tailwind-merge` órfãos.
4. `components.json` com `style: "radix-rhea"`, `iconLibrary: "lucide"` e aliases explícitos; `npx shadcn@latest info --json` verde.
5. Zero arquivos duplicados em `src/shared/lib/{button,card,input,label,toast}.tsx` e zero imports legados quebrados.
6. Primitivos em `src/shared/components/ui/*` modernizados para `radix-rhea` + `radix-ui` + `cn`, mantendo `DialogContent` (`closeDisabled`, `hideCloseButton`, `"Fechar"`) e tokens Danfy Dark intactos.
7. `npm run lint`, `npm test` e `npm run build` passando com zero erros e zero warnings em cada fase entregue.
8. Validação visual e funcional no navegador real (Orca browser) em desktop e mobile, sem erros de console e com telas/overlays verificados.
9. Documentação viva (`docs/design-system/*`, `docs/README.md`, `src/shared/AGENTS.md`, `AGENTS.md`, `CLAUDE.md`) sincronizada e spec atualizada.
