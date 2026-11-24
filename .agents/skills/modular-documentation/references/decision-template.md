# Decision Template

Use este modelo para registrar uma única decisão durável por arquivo em `docs/<modulo>/decisions/`.

```markdown
---
area: <modulo>
type: decision
status: current
decision-id: DEC-NNN
decision-status: accepted
related:
  - ../README.md
  - ../flows/<fluxo-relacionado>.md
---

# <Título claro da decisão>

## Problema

Descreva o contexto, a tensão técnica ou de UX e por que uma escolha explícita foi necessária.

## Decisão

Descreva de forma direta a escolha vigente, sua justificativa e por que alternativas relevantes foram descartadas.

## Consequência

- Efeitos positivos para confiabilidade, UX, segurança ou manutenção;
- Trade-offs ou restrições aceitas;
- Impactos conectados em outros fluxos, módulos ou decisões.
```

> Quando uma nova decisão invalidar uma decisão aceita anteriormente, informe `supersedes: ./decisao-antiga.md` na nova e atualize a antiga com `decision-status: superseded`, `status: historical` (ou `deprecated`) e `superseded-by: ./decisao-nova.md`.
