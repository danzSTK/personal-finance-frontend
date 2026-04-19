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
- CSS Variables em `src/index.css` (`--app-*`, `--brand-*`, `--state-*`).
- Mapeamento no `tailwind.config.js` (`app`, `brand`, `state`).

3. Em JSX/TSX, usar apenas classes semânticas do Tailwind:
- Exemplos: `bg-app-surface`, `text-app-muted`, `border-app-border`, `bg-brand`, `text-state-danger`.

4. Novas cores só podem ser criadas por token:
- Primeiro definir variável CSS.
- Depois mapear no Tailwind.
- Só então usar no componente.

## Objetivo

Garantir manutenção fácil, consistência visual e harmonia de cores em toda a aplicação.
