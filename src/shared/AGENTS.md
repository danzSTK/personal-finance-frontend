# Módulo `shared` — Instruções Locais

Este diretório concentra infraestrutura transversal, primitivos de UI (Atomic Design + Shadcn/Radix), tratamento centralizado de erros de API, utilitários de dinheiro/datas e configurações compartilhadas entre todos os módulos do frontend.

## Documentação Obrigatória

Antes de planejar, editar ou revisar código em `src/shared/`, leia:
- `docs/architecture/module-boundaries.md` — Fronteiras entre `app`, `shared` e `features` e dívidas técnicas registradas (`DT-01`).
- `docs/architecture/api-error-handling.md` — Contrato central de erros da API (`src/shared/errors/`).
- `docs/design-system/danfy-finance-design-system.md` — Tokens Danfy Dark, tipografia e acessibilidade.
- `docs/design-system/material-3-reference.md` — Referência de componentes Material 3.

## Regras de Fronteira e Invariantes

- **Direção estrita de dependência:** `src/shared/` **não deve importar** de `src/features/*` nem de `src/app/`. A única exceção existente é a dívida técnica registrada `DT-01` em `src/shared/config/axios.ts`; nunca amplie esse acoplamento.
- **Erros da API (`src/shared/errors/`):** todo código estável do backend deve ser registrado em `apiErrorCodes.ts`, parseado via `parseApiError.ts` e resolvido via `resolveApiError.ts` com copy acionável em português (sem expor `message` bruto do backend). Use `ApiErrorAlert` para falhas bloqueantes, `applyApiFieldErrors` para `VALIDATION_ERROR.details.fields` e `showApiErrorToast` apenas para feedback breve não bloqueante.
- **Contrato `DateOnly` (`src/shared/utils/dateOnly.ts` e `DateOnlyPicker` / `MonthYearPicker`):** opere estritamente sobre strings civis `YYYY-MM-DD` e objetos `YearMonth`, sem `new Date(...).toISOString()` nem shifts de fuso horário.
- **Contrato monetário (`CurrencyInput`, `formatCurrencyFromCents`):** trate dinheiro sempre como inteiros seguros em centavos e aplique a classe `.numeric` para tabular numbers.
- **Atomic Design e fonte única de verdade UI:** respeite `atoms` → `molecules` → `organisms` (sem importar níveis superiores). Todos os 55 primitivos Shadcn/Radix (`radix-rhea`) vivem exclusivamente em `src/shared/components/ui/*` (incluindo `toast.tsx` harmonizado com `organisms/Toaster.tsx`, `use-toast.ts` e `showApiErrorToast.ts`, conforme DEC-005). `src/shared/lib/` contém apenas `utils.ts` reexportando `cn` do pacote `cn` — nunca recrie duplicatas de primitivos em `src/shared/lib/`.
- **Primitivos `src/shared/components/ui/` (estilo `radix-rhea`, MCP/Skill `shadcn` + CLI v4):** utilize o pacote unificado `radix-ui`, `cn` (`@/shared/lib/utils`) e `lucide-react` v1. Consulte o MCP `shadcn`, a skill `shadcn` e `npx shadcn@latest info --json` / `docs <componente>` / `search` / `view` antes de adicionar componentes. Antes de atualizar qualquer primitivo já customizado em `src/shared/components/ui/`, execute obrigatoriamente `npx shadcn@latest add <componente> --dry-run` e `--diff` (ou `--view`) para preservar tokens Danfy Dark, acessibilidade (ex.: `closeDisabled`, `hideCloseButton` e rótulo `"Fechar"` de `DialogContent`, `CardTitle` em `<h3>`, `CardDescription` em `<p>`) e precedência de `danfy-finance-design-system`, `frontend-design` e `material-3-ui-guidance` sobre defaults genéricos do shadcn.
- **Atenção a `src/shared/config/env.ts`:** atualmente `auth.api.ts` usa `VITE_API_URL ?? VITE_API_BASE_URL || 'http://localhost:3000'` diretamente e não consome `env.ts` (que tem fallback divergente `http://localhost:8080/api`). Não altere URLs base sem reconciliar ambos.
