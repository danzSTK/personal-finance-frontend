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
- **Atomic Design e primitivos duplicados:** respeite `atoms` → `molecules` → `organisms` (sem importar níveis superiores). Observe que `src/shared/lib/{button,card,input,label,toast}.tsx` coexiste historicamente com `src/shared/components/ui/*` — prefira `src/shared/components/ui/*` em código novo e evite criar novas duplicatas.
- **Atenção a `src/shared/config/env.ts`:** atualmente `auth.api.ts` usa `VITE_API_URL ?? VITE_API_BASE_URL || 'http://localhost:3000'` diretamente e não consome `env.ts` (que tem fallback divergente `http://localhost:8080/api`). Não altere URLs base sem reconciliar ambos.
