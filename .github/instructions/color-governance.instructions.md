---
applyTo: 'src/**/*.{ts,tsx,css}'
description: 'Color governance for Danfy Finance UI consistency'
---

# Color Governance Rule (Mandatory)

Todas as cores do frontend devem seguir um único padrão de design system.

## Regras obrigatórias

1. Nunca usar cores hardcoded em componentes:
- Proibido: `#RRGGBB`, `rgb(...)`, `rgba(...)`, `hsl(...)` inline.
- Proibido: classes utilitárias com paletas cruas (`text-slate-*`, `bg-violet-*`, `border-red-*`, etc.) para UI de produto.

2. Toda cor deve vir de tokens:
- CSS Variables em `src/index.css` (`--app-*`, `--brand-*`, `--state-*`, `--destructive`).
- Mapeamento no Tailwind v4 `@theme inline` em `src/index.css` (`app`, `brand`, `state`, `destructive`).

3. Em JSX/TSX, usar apenas classes semânticas do Tailwind:
- Exemplos: `bg-app-surface`, `text-app-muted`, `border-app-border`, `bg-brand`, `text-state-income`, `text-state-expense`, `text-state-warning`, `text-state-info`, `text-destructive`.
- `state-income`: dinheiro entrando ou movimento financeiro positivo.
- `state-expense`: dinheiro saindo ou movimento financeiro negativo.
- `destructive`: erros, validação, delete, revoke, logout perigoso e ações destrutivas.
- Nunca depender só de cor para dinheiro; sempre combinar com sinal, label, ícone ou contexto.

4. Novas cores só podem ser criadas por token:
- Primeiro definir variável CSS.
- Depois expor no `@theme inline` do Tailwind v4.
- Só então usar no componente.

## Objetivo

Garantir manutenção fácil, consistência visual e harmonia de cores em toda a aplicação.
