---
name: modular-documentation
description: "Create, update, organize, or review Danfy Finance frontend living documentation under docs/<module>/, global/module indices, docs/architecture/module-boundaries.md, and local module AGENTS.md files following the modular A1 standard."
---

# Modular Documentation (Documentação Viva Modular do Frontend)

Use esta skill sempre que criar, atualizar, reorganizar ou revisar a documentação viva de um módulo em `docs/<modulo>/`, o índice global `docs/README.md`, fronteiras em `docs/architecture/module-boundaries.md` ou instruções locais em `src/features/<modulo>/AGENTS.md` e `src/shared/AGENTS.md`.

## Filosofia Central

> **Documentamos o comportamento real, os fluxos, os contratos, a composição e os porquês — nunca a sintaxe óbvia do código.**

- **Specs (`docs/specs/<modulo>/<feature>/specs/`)** são contratos propostos/aprovados de mudança (governados por `spec-driven-development`).
- **Documentação viva (`docs/<modulo>/`)** descreve o comportamento **atualmente implementado**, confirmado pelo código-fonte e pelos contratos backend consumidos.
- **`AGENTS.md` locais (`src/features/<modulo>/AGENTS.md` e `src/shared/AGENTS.md`)** são o ponto de entrada operacional de agentes naquele módulo e devem refletir fielmente os documentos e invariantes de `docs/<modulo>/`.

## Estrutura Modular Canônica (A1)

```text
docs/<modulo>/
├── README.md        # Índice do módulo: escopo, mapa de leitura, cobertura e pendências
├── concepts/        # Conceitos de domínio/UI, estados, modelos mentais e ownership
├── flows/           # Fluxos ponta a ponta, rotas, estados (loading/empty/error) e tabela de API
├── decisions/       # ADRs atômicos (Problema, Decisão, Consequência, supersedes)
├── components/      # Composição por Atomic Design, dono de estado, shared e cross-feature
└── reference/       # Contratos consolidados: endpoints, rotas, query keys, códigos de erro e gaps
```

## Workflow

1. **Ler contexto antes de editar:** leia `AGENTS.md` raiz, o `AGENTS.md` local do módulo (`src/features/<modulo>/AGENTS.md` ou `src/shared/AGENTS.md`), `docs/<modulo>/README.md`, a spec aplicável, o código-fonte relevante e a documentação de integração do backend (`personal-finance-backend:docs/integrations/<recurso>/`).
2. **Inventariar evidências:** mapeie rotas frontend, endpoints backend consumidos, query keys/invalidações, schemas Zod, códigos de erro tratados, donos de estado (TanStack Query, URL, Zustand, local), árvore de componentes e dependências cross-feature.
3. **Consultar templates obrigatórios:** antes de redigir ou revisar arquivos, leia os templates correspondentes em `references/`:
   - `references/frontmatter-spec.md` — metadados YAML e semântica de status;
   - `references/module-index-template.md` — `docs/<modulo>/README.md`;
   - `references/module-agents-template.md` — `src/features/<modulo>/AGENTS.md`;
   - `references/concept-template.md` — `docs/<modulo>/concepts/*.md`;
   - `references/flow-template.md` — `docs/<modulo>/flows/*.md`;
   - `references/decision-template.md` — `docs/<modulo>/decisions/*.md`;
   - `references/component-template.md` — `docs/<modulo>/components/*.md`.
4. **Atualizar os pilares afetados:** mantenha **uma responsabilidade coesa por arquivo** em `kebab-case.md`. Atualize `docs/<modulo>/README.md` imediatamente sempre que adicionar, renomear ou deprecar um documento.
5. **Sincronizar `AGENTS.md` e fronteiras:** se a mudança alterou invariantes, responsabilidades, endpoints centrais ou dependências entre módulos, atualize `src/features/<modulo>/AGENTS.md` e `docs/architecture/module-boundaries.md` na mesma entrega.
6. **Reconciliar evidências e contradições:** siga a ordem de autoridade:
   1. contrato backend atual consumido;
   2. código-fonte e testes implementados;
   3. decisões aceitas ainda vigentes;
   4. spec aprovada;
   5. documento histórico.
   Quando uma nova decisão contradisser uma decisão aceita, substitua-a explicitamente (`supersedes` / `superseded-by` e `decision-status: superseded`).
7. **Validar antes de concluir:** verifique frontmatter YAML, links relativos internos válidos, referências cross-repo portáveis (`personal-finance-backend:docs/...`, nunca `../../../../../../personal-finance-backend/...`), cobertura de endpoints contra `src/features/<modulo>/api/*` e atualização do `README.md` do módulo.

## Regras Inegociáveis

- Escreva em **português brasileiro**, preservando identificadores técnicos em inglês exatamente como no código (rotas, endpoints, componentes, hooks, tipos, query keys, códigos de erro).
- Marque `status: current` **somente** quando confirmado pelo código implementado ou contrato externo vigente. Nunca invente comportamento ausente.
- Não copie blocos extensos de implementação, segredos, cookies, tokens ou payloads reais.
- Diferencie explicitamente componentes **próprios do módulo**, **`shared`** e **cross-feature**.
- Cada decisão em `decisions/` deve ser um arquivo próprio contendo `## Problema`, `## Decisão` e `## Consequência`.
- Não faça alterações de comportamento de produto nem aprove specs durante trabalho estritamente documental; registre gaps verificáveis em `reference/` ou `README.md`.
