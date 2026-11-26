---
area: design-system
feature: shadcn-v4-rhea-react19-ai-tooling
type: spec-decisions
status: current
last_reviewed: 2026-11-26
related:
  - ./requirements.md
  - ./design.md
  - ./tasks.md
---

# Decisions — Atualização do Design System Danfy (shadcn v4 Rhea, React 19 e AI Tooling)

## DEC-001 — Manter Radix UI (pacote unificado `radix-ui`) em vez de migrar para Base UI

Status: accepted

Problem:
O shadcn v4 passou a oferecer três bases de primitivos (`base`, `radix` e `aria`), adotando Base UI como padrão em projetos novos. Porém, todo o frontend atual da Danfy Finance consome primitivos Radix (incluindo composição com `asChild` em botões, triggers, dialogs, sheets, dropdowns e tooltips).

Decision:
Manter **Radix UI** como base de primitivos, migrando os 27 pacotes `@radix-ui/react-*` individuais para o pacote unificado oficial **`radix-ui`** via `shadcn migrate radix`.

Consequences:
Preserva 100% da compatibilidade com `asChild` e toda a suíte de 182 testes existentes, reduz drasticamente o risco de regressão funcional e ainda libera acesso total aos novos estilos v4 (`radix-rhea`), `data-slot`, React 19 nativo e pacote `cn`.

---

## DEC-002 — Adotar o estilo visual `radix-rhea` sobre os tokens Danfy Dark

Status: accepted

Problem:
O `components.json` atual utiliza `style: "default"`, oficialmente depreciado pelo shadcn/ui. A atualização visa modernizar a geometria e o refinamento visual dos componentes mantendo a identidade visual **Danfy Dark** e o alinhamento com **Apple HIG** para SaaS financeiro.

Decision:
Adotar **`radix-rhea`** como estilo oficial em `components.json`, combinado com `@import 'shadcn/tailwind.css';` e os tokens semânticos existentes em `src/index.css`.

Consequences:
Traz a linguagem visual arredondada suave inspirada em macOS/Apple HIG (base do Luma) com densidade compacta e controles ajustados para interfaces de produto densas em dados financeiros (tabelas, KPIs, filtros, sheets e modais), sem alterar a paleta Danfy Dark nem o significado semântico de `state-income`, `state-expense` e `destructive`.

---

## DEC-003 — Atualizar para React 19 + `lucide-react` v1 + `cn` na mesma trilha de plataforma

Status: accepted

Problem:
O repositório está em `react@18.2.0` e `lucide-react@0.356.0`, enquanto os componentes shadcn v4 (`radix-rhea`) já são gerados para React 19 (sem `forwardRef`, usando `React.ComponentProps` e `cn`). A auditoria de `peerDependencies` mostrou que todas as bibliotecas do projeto já suportam React 19, exceto `lucide-react@0.356.0`.

Decision:
Atualizar `react`, `react-dom`, `@types/react`, `@types/react-dom` para `19.3.x`, atualizar `lucide-react` para `^1.81.0` e adotar o pacote oficial `cn` (mantendo `export { cn } from 'cn'` em `src/shared/lib/utils.ts`).

Consequences:
Alinha o projeto à geração atual do ecossistema shadcn/React sem conflitos de peerDependencies e evita retrabalho ao instalar novos componentes via MCP/CLI. Exige validação criteriosa de nomes de ícones do `lucide-react` v1 e tipagem estrita (`tsc`) na Fase 2.

---

## DEC-004 — Unificar duplicatas legadas de `src/shared/lib/` em `src/shared/components/ui/`

Status: accepted

Problem:
Cinco primitivos legados (`button.tsx`, `card.tsx`, `input.tsx`, `label.tsx`, `toast.tsx`) coexistem em `src/shared/lib/` com seus equivalentes em `src/shared/components/ui/`, sendo `src/shared/lib/button.tsx` ainda importado por ~40 arquivos. Se atualizarmos apenas `src/shared/components/ui/`, grande parte da aplicação ficaria presa ao visual antigo.

Decision:
Consolidar todos os consumidores para `@/shared/components/ui/*` na Fase 3 e remover os 5 arquivos legados de `src/shared/lib/`, preservando apenas `src/shared/lib/utils.ts`.

Consequences:
Garante fonte única de verdade para o Design System (`src/shared/components/ui/*`), fazendo com que toda a aplicação receba automaticamente a atualização `radix-rhea` na Fase 4 e simplificando o trabalho futuro via shadcn MCP/CLI.

---

## DEC-005 — Manter `Toaster` + `use-toast` compatível na migração (sem quebrar `showApiErrorToast`)

Status: accepted

Problem:
No shadcn v4 o componente `toast` foi descontinuado no registry em favor do `sonner`, mas toda a camada de feedback de erro e confirmação da Danfy (`src/shared/hooks/use-toast.ts`, `src/shared/errors/showApiErrorToast.ts`, mutations e testes) consome `useToast` + `Toaster`.

Decision:
Unificar o primitivo `toast` em `src/shared/components/ui/toast.tsx`, modernizá-lo para `radix-ui` + `cn` + estética `radix-rhea` e manter `src/shared/components/organisms/Toaster.tsx` e `use-toast.ts` funcionando sem quebra de contrato. Eventual migração completa para `sonner` fica como decisão futura opcional caso desejada.

Consequences:
Zero risco de quebrar o contrato centralizado de erros de API (`danfy-api-error-handling`) e seus testes durante a modernização visual.

---

## DEC-006 — Delegação supervisionada com `gemini-4-hydrogen-high` fase a fase

Status: accepted

Problem:
O escopo abrange tooling de IA, upgrade de major do React, consolidação de ~55 imports e atualização de 55 primitivos UI + consumidores. Fazer tudo em uma única execução sem portões de verificação aumenta risco de regressões silenciosas.

Decision:
Executar fase a fase com um supervisor (spec, GitHub/PR, revisão e testes reais de consumo) delegando a escrita de código para workers Orca explicitamente configurados com `--agent antigravity --model gemini-4-hydrogen-high` (`Gemini 4 Hydrogen (High)`).

Consequences:
Cada fase gera diff auditável, validação automatizada (`lint`, `test`, `build`) e teste real de cliente (protocolo MCP na Fase 1; navegador Orca nas Fases 4–5) antes de avançar.
