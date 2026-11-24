# Component Template

Use este modelo para documentar arquitetura de componentes, donos de estado e fronteiras em `docs/<modulo>/components/`.

Evite inventário mecânico de arquivos: foque responsabilidades, composição por Atomic Design, dono de estado e limites que orientam futuras mudanças.

```markdown
---
area: <modulo>
type: component
status: current
related:
  - ../README.md
  - ../flows/<fluxo-principal>.md
---

# <Grupo Coeso de Componentes>

## Árvore por Atomic Design

- **Pages:** `NomePage` — composição da rota, leitura de URL e coordenação de estado de tela.
- **Templates:** `NomeLayout` — estrutura de layout e slots (sem data fetching).
- **Organisms:** `NomeSheet`, `NomeTable` — seções completas com hooks, mutations e estado local de workflow.
- **Molecules:** `NomeField`, `NomePill` — combinações de átomos com UI state simples.
- **Atoms:** `NomeBadge` — primitivos puros de apresentação.

## Donos de Estado, Dados e Side Effects

- **Server state (TanStack Query):** quais hooks/queries e mutations cada camada consome e invalida.
- **URL state:** quais filtros/parâmetros vivem na query string e qual utilitário faz parse/serialize.
- **Client state (Zustand / local):** stores ou estados locais efêmeros (sheets abertos, seleção, staging).
- **Formulários e validação:** React Hook Form + schemas Zod em `schemas/`.

## Dependências (`shared` e Cross-Feature)

- **Próprios do módulo:** componentes e utilitários internos de `src/features/<modulo>/`.
- **Shared (`src/shared/`):** componentes (`ApiErrorAlert`, `CurrencyInput`, `DateOnlyPicker`, primitives `ui/`), erros (`src/shared/errors`) e utilitários (`dateOnly`, `formatters`).
- **Cross-feature:** dependências explícitas de outros módulos (distinguindo API pública via `index.ts` de acoplamentos registrados como dívida técnica em `docs/architecture/module-boundaries.md`).

## Limites de Importação e Pontos de Extensão

- Onde estender o fluxo com segurança sem violar Atomic Design ou fronteiras de módulo.
- Gaps conhecidos ou componentes legados/obsoletos, quando houver.
```
