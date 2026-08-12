---
area: documentation
feature: platform-feature-documentation
type: spec-requirements
status: current
related:
  - ./design.md
  - ./tasks.md
  - ./decisions.md
---

# Requisitos — padrão documental de features da plataforma

## Objetivo

Criar um padrão documental durável para o frontend Danfy Finance que mantenha
separados:

1. o contrato de implementação em `docs/specs/<module>/<feature>/specs/`;
2. a documentação viva da feature em
   `docs/<module>/<feature>/[<subfeature>/]documentacao/`;
3. as instruções executáveis para agentes em uma skill local do repositório.

A primeira aplicação do padrão deve corrigir a organização das specs atuais e
documentar somente o módulo `auth`, incluindo o comportamento existente e a
feature de alteração de senha quando ela for implementada.

## Fontes de verdade

- `AGENTS.md`.
- `.agents/skills/spec-driven-development/SKILL.md` e
  `references/spec-files.md`.
- Skill global `skill-creator`.
- Skill `code-documenter`.
- Skills locais de frontend, design system, Material 3 e erros de API.
- Código atual do módulo que está sendo documentado.
- Documentação de integração completa do backend consumido pela feature.
- Specs aprovadas e decisões já registradas.

Em caso de conflito, contrato atual do backend e código implementado definem o
comportamento presente; a spec aprovada define intenção e limites; documentos
históricos não podem sobrescrever ambos silenciosamente.

## Escopo

- Criar a skill local `.agents/skills/platform-feature-documentation/`.
- Atualizar `AGENTS.md` para exigir a skill ao criar, alterar, revisar ou
  reorganizar documentação viva de features.
- Definir os três diretórios obrigatórios da documentação viva:
  `decisions/`, `flow/` e `components/`, cada um composto por documentos
  Markdown de responsabilidade única.
- Definir frontmatter, conteúdo mínimo, relações, status e validação.
- Normalizar specs legadas para o padrão por módulo da skill
  `spec-driven-development`.
- Preservar histórico e status real; não declarar aprovação retroativa.
- Criar documentação viva somente para as features atuais de `auth`.
- Incluir endpoints/recursos do backend consumidos, componentes próprios,
  componentes reutilizados, estado, dependências, erros e decisões.
- Documentar divergências encontradas sem ocultá-las ou escolher comportamento
  arbitrariamente.
- Validar caminhos, links, cobertura e coerência contra o código.

## Fora de escopo

- Documentar `accounts`, `categories`, `transactions` ou módulos futuros nesta
  primeira execução, além da reorganização mecânica de suas specs legadas.
- Criar portal, VitePress, Docusaurus ou pipeline de publicação.
- Gerar OpenAPI no frontend.
- Copiar arquivos inteiros de código para documentação.
- Duplicar documentação interna do backend.
- Reescrever decisões históricas para fazê-las parecer atuais.
- Implementar features de produto descritas nas specs.

## Estrutura obrigatória

### Specs

```text
docs/specs/<module>/<feature>/specs/
├── requirements.md
├── design.md
├── tasks.md
└── decisions.md
```

Subfeatures que possuem contrato independente podem usar:

```text
docs/specs/<module>/<feature>/<subfeature>/specs/
```

### Documentação viva

```text
docs/<module>/<feature>/documentacao/
├── decisions/
│   └── <decision-name>.md
├── flow/
│   └── <flow-name>.md
└── components/
    └── <component-or-group-name>.md
```

Quando necessário:

```text
docs/<module>/<feature>/<subfeature>/documentacao/
```

Uma subfeature só ganha pasta própria quando possui fluxo, decisões ou
dependências que não cabem com clareza na feature pai. A árvore não deve
espelhar mecanicamente cada componente de código.

## Requisitos das árvores vivas

### `decisions/*.md`

Cada arquivo registra uma única decisão durável e contém, no mínimo:

- `Problema`: contexto e contradição que exigem decisão;
- `Decisão`: escolha vigente e motivo;
- `Consequência`: efeitos positivos, negativos e impacto conectado.

O frontmatter mantém ID estável `DEC-NNN`, status, relações
`supersedes`/`superseded-by` e links para fontes. O nome do arquivo usa
kebab-case descritivo, sem depender do ID para ser compreendido.

Não deve registrar detalhe trivial de implementação como decisão
arquitetural. Uma decisão contraditória deve substituir explicitamente a
anterior, nunca apenas coexistir.

### `flow/*.md`

Cada arquivo explica um fluxo coeso da feature sem reproduzir código:

- objetivo e atores;
- pré-condições e capacidade/disponibilidade;
- rotas frontend e pontos de entrada;
- fluxo principal e alternativos;
- estados loading, empty, pending, success, error e recovery;
- limites de segurança e privacidade;
- tabela de consumo backend com método, rota, autenticação, request/response
  relevante, efeitos e documentação fonte;
- códigos de erro por operação e recuperação;
- diagrama Mermaid quando uma sequência ou ramificação ficar mais clara.

### `components/*.md`

Cada arquivo descreve um componente próprio relevante ou um grupo arquitetural
coeso:

- árvore/componentes por nível Atomic Design;
- componentes próprios da feature;
- componentes, hooks e utilities reutilizados;
- responsabilidade e dono do estado/dado;
- APIs, TanStack Query, Zustand, React Hook Form/Zod e helpers envolvidos;
- dependências cross-feature e shared;
- pontos de extensão e limites de importação;
- arquivos obsoletos ou gaps conhecidos quando relevantes.

Não deve incluir implementação completa, grandes blocos TSX ou inventário de
todo arquivo sem significado arquitetural.

## Frontmatter

Todo arquivo dentro das três árvores usa, no mínimo:

```yaml
area: <module>
feature: <feature>
type: documentation-decision | documentation-flow | documentation-component
status: current | proposed | historical | deprecated
related: []
```

Documentos de decisão também usam `decision-id`. `subfeature` é adicionado
quando existir. Links relativos devem ser válidos.

## Skill local

A skill terá o nome `platform-feature-documentation` e será criada em
`.agents/skills/platform-feature-documentation/` por ser específica deste
repositório.

Ela deve disparar quando um agente:

- criar ou atualizar documentação de feature;
- implementar uma feature que exige documentação viva;
- revisar divergência entre spec, docs, backend e código;
- migrar documentação/specs para o padrão por módulo;
- registrar ou substituir uma decisão.

Ela deve obrigar o agente a:

1. ler `AGENTS.md`, spec, documentação atual, código e integração backend;
2. identificar módulo/feature/subfeature antes de criar caminhos;
3. atualizar os documentos afetados nas três árvores quando necessário;
4. registrar decisões e relações sem contradição silenciosa;
5. distinguir comportamento atual, proposto e histórico;
6. documentar consumo backend por operação;
7. validar links e cobertura;
8. manter texto conciso, estrutural e sem cópia extensa de código.

## Normalização das specs existentes

A migração deve seguir este destino:

| Identificador da origem legada | Destino normalizado |
| --- | --- |
| `legacy:auth-feature` | `docs/specs/auth/core/specs/` |
| `legacy:auth-shell-v2` | `docs/specs/auth/authenticated-shell-v2/specs/` |
| `legacy:email-verification` | `docs/specs/auth/email-verification/specs/` |
| `legacy:account-sheet-metadata-cents` | `docs/specs/accounts/account-sheet-metadata-cents/specs/` |
| `legacy:accounts-balances-period-filter` | `docs/specs/accounts/balance-period-filter/specs/` |
| `legacy:categories-responsive` | `docs/specs/categories/responsive-list/specs/` |
| `legacy:transactions-screen` | `docs/specs/transactions/screen/specs/` |
| `docs/specs/transactions/transfer/specs/` | permanece no local atual |

Para specs monolíticas ou incompletas:

- separar requirements, design, tasks e decisions sem alterar a intenção;
- usar código e documento original apenas para reconstrução verificável;
- marcar conteúdo reconstruído/histórico claramente;
- não inventar data, aprovação ou decisão;
- atualizar links internos e remover o caminho antigo somente após validação.

## Cobertura inicial de `auth`

A documentação viva inicial deve abranger:

```text
docs/auth/authentication/sign-in/documentacao/
docs/auth/authentication/sign-up/documentacao/
docs/auth/authentication/oauth-google/documentacao/
docs/auth/email-verification/documentacao/
docs/auth/providers/documentacao/
docs/auth/sessions/documentacao/
docs/auth/profile/documentacao/
docs/auth/authenticated-shell/documentacao/
docs/auth/change-password/documentacao/
```

`change-password` pode começar como `proposed` a partir da spec e passar a
`current` somente depois da implementação validada. Os demais documentos devem
descrever o código atual, corrigindo contratos antigos como Bearer tokens,
tokens em query ou endpoint `/auth/me` quando o código/backend atuais usam
cookies HttpOnly e `GET /users/me`.

## Requisitos funcionais

### REQ-001 — separar contrato e documentação viva

WHEN uma feature for especificada
THE SYSTEM SHALL manter o contrato em `docs/specs` e a explicação do
comportamento implementado em `docs/<module>`.

### REQ-002 — manter decisões coerentes

WHEN uma decisão nova contradizer uma aceita
THE SYSTEM SHALL marcar a relação de substituição e atualizar impactos nos
fluxos conectados.

### REQ-003 — registrar consumo backend

WHEN uma feature consumir API
THE SYSTEM SHALL documentar cada método/rota usado, autenticação, contrato
relevante, erros e fonte do backend.

### REQ-004 — distinguir próprio e reutilizado

WHEN componentes forem documentados
THE SYSTEM SHALL identificar o que pertence à feature e o que vem de shared ou
outra feature, incluindo responsabilidade e camada Atomic Design.

### REQ-005 — impedir documentação especulativa

IF um comportamento não puder ser confirmado por código, contrato ou decisão
THEN ele deve ser marcado como gap/proposta, nunca descrito como atual.

### REQ-006 — atualizar docs com a feature

WHEN uma implementação mudar fluxo, componente, consumo backend ou decisão
THE SYSTEM SHALL atualizar a documentação viva na mesma entrega.

### REQ-007 — preservar histórico de specs

WHEN uma spec legada for normalizada
THE SYSTEM SHALL preservar conteúdo e status real sem afirmar aprovação
retroativa.

## Critérios de aceite

- A skill local existe, é concisa, possui metadata válida e passa no
  `quick_validate.py`.
- `AGENTS.md` referencia a skill e a estrutura viva.
- Specs atuais estão organizadas por módulo/feature e possuem os quatro arquivos
  obrigatórios ou status histórico reconstruído explícito.
- Nenhum link interno aponta para caminho removido.
- Apenas o módulo `auth` recebe documentação viva nesta primeira execução.
- Cada feature de auth listada possui `decisions/`, `flow/` e `components/`,
  com ao menos um documento relevante em cada árvore.
- A documentação de auth reflete cookies HttpOnly, `GET /users/me`, providers,
  rotas e código atuais.
- Toda rota backend consumida por auth aparece em ao menos um documento de
  `flow/`.
- Componentes próprios e reutilizados são distinguíveis.
- Decisões importantes possuem alternativas, consequências e relações.
- Não há grandes cópias de código nem detalhes sensíveis.
- Links relativos e referências de arquivos são validados.
- `npm run lint` e `npm run build` continuam passando quando arquivos de código
  ou configuração forem alterados pela implementação.

## Gate de aprovação

Esta spec está proposta. A skill, a migração e a documentação viva só podem ser
criadas depois da aprovação explícita de `requirements.md`, `design.md` e
`tasks.md`.
