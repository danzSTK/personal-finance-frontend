# Module `AGENTS.md` Template

Use este modelo para criar ou atualizar `src/features/<modulo>/AGENTS.md` (ou `src/shared/AGENTS.md`).

```markdown
# Módulo `<Modulo>` — Instruções Locais

Resumo conciso (1 a 2 frases) da responsabilidade do módulo no frontend da Danfy.

## Documentação Obrigatória

Antes de planejar, editar ou revisar código neste módulo, leia:
- `docs/<modulo>/README.md` — Índice geral, cobertura e mapa de leitura do módulo.
- `docs/<modulo>/concepts/<conceito>.md` — Conceitos centrais e estados.
- `docs/<modulo>/flows/<fluxo>.md` — Fluxos principais e consumo de API.
- `docs/<modulo>/reference/api-and-contracts.md` — Endpoints, query keys e códigos de erro.
- `docs/architecture/module-boundaries.md` — Limites entre módulos e dívidas técnicas registradas.

## Regras de Fronteira e Invariantes

- **Invariante 1:** regra verificável que nunca pode ser quebrada neste módulo.
- **Invariante 2:** regra de contrato de dados (ex.: `amountCents`, `DateOnly`, cookies HttpOnly, estado em URL).
- **Fronteiras:** o que este módulo pode importar e o que deve expor (evitar ampliar acoplamentos listados como dívida técnica em `docs/architecture/module-boundaries.md`).
- **Erros e UX:** contratos de erro específicos (ex.: `VALIDATION_ERROR`, `409`, fallback seguro) via `src/shared/errors`.
- **Sincronização documental:** toda mudança em fluxos, decisões, endpoints, componentes-chave ou invariantes exige atualização de `docs/<modulo>/` e deste `AGENTS.md` na mesma entrega.
```
