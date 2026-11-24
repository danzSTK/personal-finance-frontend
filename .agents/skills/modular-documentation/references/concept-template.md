# Concept Template

Use este modelo para documentar entidades, modelos mentais de UI/domínio, máquinas de estado ou ownership em `docs/<modulo>/concepts/`.

```markdown
---
area: <modulo>
type: concept
status: current
related:
  - ../README.md
  - ../flows/<fluxo-relacionado>.md
---

# <Nome do Conceito>

Definição clara e substantiva do conceito no contexto do frontend da Danfy.

Explique:
- O que ele representa para o usuário e para o contrato com o backend;
- Quais regras de representação o frontend preserva (ex.: `amountCents`, `DateOnly`, status);
- O que ele **não é** ou **não deve assumir** no cliente.

## Identidade, Ownership e Fonte de Verdade

- **Identidade:** chave estável (ex.: UUID retornado pela API, slug de template).
- **Fonte de verdade:** backend (TanStack Query), URL query string, Zustand ou derivado local.
- **Regras de propriedade:** escopo por usuário autenticado (sem envio de `userId` pelo cliente).

## Estados e Variantes

| Estado / Tipo | Significado no produto | Comportamento no frontend |
| --- | --- | --- |
| `VALOR_1` | Significado | Ações permitidas, semântica visual e restrições |

## Relação com Outros Conceitos e Módulos

- Descreva como este conceito interage com outros módulos (`accounts`, `categories`, `transactions`, `auth`, `shared`).
```
