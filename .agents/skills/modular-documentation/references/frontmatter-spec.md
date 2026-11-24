# Frontmatter Specification

Especificação dos campos YAML obrigatórios no cabeçalho dos documentos em `docs/`.

```yaml
---
area: <modulo | architecture | design-system | documentation>
type: <index | concept | flow | decision | component | reference>
status: <draft | current | historical | deprecated>
last_reviewed: YYYY-MM-DD
related:
  - <link-relativo-valido-no-mesmo-repo>
---
```

## Campos Obrigatórios

### `area`
Domínio ou camada a que o documento pertence (em minúsculas):
- Módulos de feature: `accounts`, `auth`, `categories`, `transactions` (e novos módulos futuros em `src/features/`)
- Transversais: `architecture`, `design-system`, `documentation`, `shared`

### `type`
Classificação estrutural do documento vivo:
- `index`: índice global (`docs/README.md`) ou de módulo (`docs/<modulo>/README.md`).
- `concept`: conceito de domínio/UI, modelo mental, estados, identidade ou ownership.
- `flow`: fluxo operacional ponta a ponta, rotas, estados de interface e consumo de API.
- `decision`: registro de decisão arquitetural/de UX (ADR atômico).
- `component`: mapa de composição por Atomic Design, dono de estado e dependências.
- `reference`: matriz consolidada de rotas, endpoints, query keys, códigos de erro, invariantes ou gaps.

Para specs em `docs/specs/**`, utilize `spec-requirements | spec-design | spec-tasks | spec-decisions`.

### `status`
- `draft`: rascunho ou proposta ainda não implementada.
- `current`: documentação ativa, confirmada pelo código implementado e contratos vigentes.
- `historical`: preservada como contexto histórico, não normativa.
- `deprecated`: descontinuada; não deve orientar novas mudanças.

Para specs em `docs/specs/**`, `approved` também é válido quando uma spec já foi revisada/aprovada antes ou durante a implementação.

## Campos Condicionais

### Para `type: decision`
```yaml
decision-id: DEC-NNN
decision-status: accepted | proposed | superseded | deprecated
supersedes: ./outra-decisao.md          # opcional
superseded-by: ./nova-decisao.md        # obrigatório quando decision-status: superseded
```

### Para `type: index` e `type: reference`
- `last_reviewed: YYYY-MM-DD` é obrigatório para rastrear a última conferência contra o código atual.

### `related`
- Lista de links relativos válidos **dentro do repositório frontend**.
- **Nunca** coloque caminhos relativos cross-repo (como `../../../../../../personal-finance-backend/...`) em `related`. Para contratos do backend, cite no corpo ou em tabelas usando a notação portável `personal-finance-backend:docs/<caminho>`.
