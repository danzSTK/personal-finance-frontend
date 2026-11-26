---
area: design-system
feature: shadcn-v4-rhea-react19-ai-tooling
type: spec-tasks
status: draft
last_reviewed: 2026-11-26
related:
  - ./requirements.md
  - ./design.md
  - ./decisions.md
---

# Tasks — Atualização do Design System Danfy (shadcn v4 Rhea, React 19 e AI Tooling)

Execução **fase a fase** ("uma por uma"), com implementação delegada a workers Orca (`--agent antigravity --model gemini-4-hydrogen-high`), revisão técnica e teste real de consumo pelo supervisor após cada fase.

## Fase 0 — Spec & Draft PR (Supervisor)
- [x] 0.1 Auditar estado atual (`components.json`, `package.json`, peerDependencies React 19, duplicatas `src/shared/lib/*`, customizações em `src/shared/components/ui/*`, baseline `lint`/`test`/`build`).
- [x] 0.2 Escrever spec completa em `docs/specs/design-system/shadcn-v4-rhea-react19-ai-tooling/specs/{requirements,design,tasks,decisions}.md`.
- [x] 0.3 Comitar a spec na branch `style/atualizar-shadcn-consumer-ai`, fazer push e abrir Draft PR no GitHub apontando para `develop`.

## Fase 1 — AI Tooling: MCP + Skill `shadcn` + CLI v4 Docs
- [x] 1.1 Configurar `.mcp.json` na raiz do repositório para Claude Code com o servidor oficial `shadcn` (`npx shadcn@latest mcp`).
- [x] 1.2 Configurar `[mcp_servers.shadcn]` em `~/.codex/config.toml` para Codex preservando todas as configurações existentes.
- [x] 1.3 Instalar a skill oficial `shadcn` em `.agents/skills/shadcn/` (espelhada via symlink `.claude/skills -> ../.agents/skills`) e revisar integração com as skills Danfy.
- [x] 1.4 Atualizar `AGENTS.md`, `CLAUDE.md` e `src/shared/AGENTS.md` documentando MCP, skill `shadcn`, precedência do Danfy Dark e comandos da CLI v4 (`info --json`, `docs`, `search`, `list`, `view`, `add --dry-run / --diff / --view`).
- [x] 1.5 **[QA Supervisor — Consumo Real]** Executar handshake MCP real + `tools/list` + chamadas reais (`get_project_registries`, `search_items_in_registries`, `view_items_in_registries`), validar TOML/JSON e testar `npx shadcn@latest info --json` e `npx shadcn@latest docs button`.

## Fase 2 — Plataforma: React 19 + `lucide-react` v1 + `radix-ui` + `cn` + `components.json` (`radix-rhea`)
- [x] 2.1 Atualizar `react`, `react-dom`, `@types/react`, `@types/react-dom` para React 19 (`19.3.x`) e `lucide-react` para `^1.81.0`, corrigindo eventuais ícones renomeados ou ajustes de tipagem React 19.
- [x] 2.2 Instalar `shadcn` em `devDependencies`, atualizar `components.json` para `style: "radix-rhea"`, `iconLibrary: "lucide"` e aliases explícitos (`ui`, `lib`, `hooks`), e integrar `@import 'shadcn/tailwind.css';` em `src/index.css` preservando 100% dos tokens Danfy Dark.
- [x] 2.3 Executar migração para pacote unificado `radix-ui` (`shadcn migrate radix`) removendo os 27 `@radix-ui/react-*` individuais órfãos.
- [x] 2.4 Executar migração para o pacote `cn` (`shadcn migrate cn`), mantendo `export { cn } from 'cn'` em `src/shared/lib/utils.ts` e removendo `clsx`/`tailwind-merge` se não houver mais referências diretas.
- [x] 2.5 **[QA Supervisor]** Validar `npx shadcn@latest info --json` (`radix-rhea`, `radix`, `lucide`), `npm run lint`, `npm test` (182+ testes) e `npm run build`.

## Fase 3 — Consolidação dos Primitivos Legados (`src/shared/lib/*`)
- [ ] 3.1 Migrar todos os imports de `@/shared/lib/{button,card,input,label,toast}` em `src/shared/` e `src/features/` para `@/shared/components/ui/{button,card,input,label,toast}` (incluindo `Toaster.tsx`).
- [ ] 3.2 Remover os 5 arquivos duplicados `src/shared/lib/{button,card,input,label,toast}.tsx`, preservando `src/shared/lib/utils.ts`.
- [ ] 3.3 **[QA Supervisor]** Confirmar zero referências legadas via grep e validar `npm run lint`, `npm test` e `npm run build`.

## Fase 4 — Atualização dos Componentes UI para shadcn v4 `radix-rhea`
- [ ] 4.1 **Lote 4A (Ações e Formulários):** atualizar `button`, `input`, `textarea`, `label`, `field`, `select`, `checkbox`, `radio-group`, `switch`, `slider`, `toggle`, `toggle-group`, `input-group`, `button-group`, `input-otp`, `form` para `radix-rhea` (`--diff` prévio), preservando tokens Danfy Dark e contratos de props/testes.
- [ ] 4.2 **Lote 4B (Overlays, Menus e Navegação):** atualizar `dialog` (preservando `closeDisabled`, `hideCloseButton`, `"Fechar"` e alvo de toque), `alert-dialog`, `sheet`, `drawer`, `dropdown-menu`, `context-menu`, `menubar`, `navigation-menu`, `popover`, `hover-card`, `tooltip`, `command`, `tabs`, `breadcrumb`, `pagination`, `sidebar`, `accordion`, `collapsible` para `radix-rhea`.
- [ ] 4.3 **Lote 4C (Superfícies, Dados e Feedback):** atualizar `card` (verificando semântica/testes de `CardTitle`), `badge`, `table`, `skeleton`, `separator`, `avatar`, `alert`, `empty`, `spinner`, `progress`, `scroll-area`, `calendar`, `chart`, `carousel`, `resizable`, `aspect-ratio`, `kbd`, `item`, `sonner` e harmonizar `toast`/`toaster` com `radix-rhea` mantendo `use-toast.ts` e `showApiErrorToast.ts` intactos.
- [ ] 4.4 **[QA Supervisor]** Auditar diff completo de `src/shared/components/ui/` (zero cores hardcoded, zero regressões em `DialogContent`/`Sheet`/`AlertDialog`), rodar `npm run lint`, `npm test`, `npm run build` e inspecionar renderização real.

## Fase 5 — Refino Consumidor, QA Real no Navegador e Documentação Viva
- [ ] 5.1 Auditar e refinar componentes compartilhados (`CurrencyInput`, `DateOnlyPicker`, `MonthYearPicker`, `ExpandableSearch`, `ApiErrorAlert`, `ErrorState`, `Toaster`) e telas consumidoras (`auth`, `accounts`, `categories`, `transactions`) para harmonia total com `radix-rhea` e Danfy Dark.
- [ ] 5.2 Atualizar testes afetados e adicionar cobertura para customizações preservadas (ex.: `DialogContent` com `closeDisabled` e `hideCloseButton`).
- [ ] 5.3 Atualizar documentação viva (`docs/design-system/danfy-finance-design-system.md`, `docs/design-system/material-3-reference.md`, `docs/README.md`, `src/shared/AGENTS.md`, `AGENTS.md`, `CLAUDE.md`) e marcar os 4 arquivos desta spec com `status: current`.
- [ ] 5.4 **[QA Supervisor — Consumo Real no Navegador]** Subir `npm run dev`, inspecionar no navegador Orca em desktop e mobile (snapshots, screenshots, interação real com botões/inputs/menus/dialogs/sheets, console limpo) e validar `npm run lint`, `npm test` e `npm run build`.
- [ ] 5.5 Atualizar a Draft PR no GitHub com resumo final, evidências de testes e checklist completo.
