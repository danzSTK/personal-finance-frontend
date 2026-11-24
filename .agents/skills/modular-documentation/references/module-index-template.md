# Module Index Template

Use este modelo para estruturar o `README.md` de cada módulo em `docs/<modulo>/README.md`.

```markdown
---
area: <modulo>
type: index
status: current
last_reviewed: <YYYY-MM-DD>
related:
  - ../README.md
  - ../architecture/module-boundaries.md
---

# Módulo `<modulo>`

Descrição executiva de 1 a 2 parágrafos sobre a responsabilidade do módulo no produto Danfy, o código que ele governa (`src/features/<modulo>/`) e as fronteiras que preserva.

## Mapa da Documentação

### Conceitos (`concepts/`)
- [Nome do Conceito](./concepts/<arquivo>.md) — Resumo em 1 linha.

### Fluxos (`flows/`)
- [Nome do Fluxo](./flows/<arquivo>.md) — Resumo em 1 linha.

### Decisões (`decisions/`)
- [DEC-NNN — Título](./decisions/<arquivo>.md) — Escolha vigente e motivo central.

### Componentes (`components/`)
- [Mapa de Componentes](./components/<arquivo>.md) — Árvore Atomic Design, estado e fronteiras.

### Referência (`reference/`)
- [API, Rotas e Contratos](./reference/<arquivo>.md) — Endpoints, query keys, códigos de erro e invariantes.

## Fronteiras e Dependências

- **Código proprietário:** `src/features/<modulo>/`
- **API pública:** `src/features/<modulo>/index.ts` (ou indicar ausência como dívida registrada)
- **Dependências cross-feature atuais:** listar dependências legítimas e dívidas registradas em `../architecture/module-boundaries.md`.

## Estado Atual de Implementação

### Implementado e Documentado
- [x] Capacidade 1 confirmada no código.

### Gaps Conhecidos / Pendente
- [ ] Pendência ou melhoria conhecida sem inventar comportamento não implementado.
```
