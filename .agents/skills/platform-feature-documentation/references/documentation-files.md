# Contratos dos arquivos documentais

## Estrutura e autoridade

Use uma das estruturas abaixo:

```text
docs/specs/<module>/<feature>/[<subfeature>/]specs/
├── requirements.md
├── design.md
├── tasks.md
└── decisions.md

docs/<module>/<feature>/[<subfeature>/]documentacao/
├── decisions/
│   └── <decision-name>.md
├── flow/
│   └── <flow-name>.md
└── components/
    └── <component-or-group-name>.md
```

Specs definem contrato proposto/aprovado. Documentação viva descreve o
comportamento implementado. Uma subfeature só recebe pasta própria se possuir
fluxo, decisão ou dependência autônoma.

## Frontmatter vivo

Todos os arquivos das três árvores usam:

```yaml
---
area: <module>
feature: <feature>
subfeature: <subfeature opcional>
type: documentation-decision | documentation-flow | documentation-component
status: current | proposed | historical | deprecated
related:
  - <link relativo válido>
---
```

- `current`: confirmado pelo código ou contrato externo atual.
- `proposed`: planejado, ainda não implementado.
- `historical`: preservado como contexto, não normativo.
- `deprecated`: não deve orientar novas mudanças.

Decisões também incluem `decision-id: DEC-NNN` e
`decision-status: accepted | proposed | superseded | deprecated`.

## `decisions/*.md`

Registre uma decisão durável por arquivo, não detalhes triviais. Cada documento
contém:

- `## Problema`: contexto e tensão que exigem escolha;
- `## Decisão`: escolha vigente e razão;
- `## Consequência`: efeitos positivos, negativos e impactos conectados;
- status, fontes e `supersedes`/`superseded-by` no frontmatter.

Uma decisão nova que contradiz uma decisão aceita precisa substituí-la
explicitamente e atualizar o link reverso.

## `flow/*.md`

Inclua:

- objetivo, atores e pré-condições;
- capacidade/disponibilidade e pontos de entrada;
- rotas frontend;
- fluxo principal e alternativos;
- estados loading, empty, pending, success, error e recovery;
- segurança e privacidade;
- códigos de erro por operação e recuperação;
- tabela de consumo backend;
- Mermaid quando três ou mais passos/ramificações ficarem mais claros assim.

Tabela mínima de backend:

| Operação | Autenticação | Contrato relevante | Efeito/cache | Erros e recuperação | Fonte |
| --- | --- | --- | --- | --- | --- |

Não copie mensagens internas, segredos, cookies ou payloads reais.

## `components/*.md`

Inclua:

- árvore significativa por Atomic Design;
- componentes próprios;
- shared e dependências cross-feature;
- dono de estado, dados e side effects;
- queries/mutations, Zustand, React Hook Form/Zod e helpers;
- limites de importação e pontos de extensão;
- componentes obsoletos ou gaps conhecidos.

Evite inventário mecânico de arquivos. Descreva responsabilidade, composição e
relações que orientam futuras mudanças.

## Reconciliação

Use esta ordem de evidência para comportamento atual:

1. contrato backend atual consumido;
2. código e testes implementados;
3. decisões aceitas ainda vigentes;
4. spec aprovada;
5. documento histórico.

Classifique divergências como documentação obsoleta, código fora da spec,
contrato externo divergente ou proposta não implementada. Não corrija produto
fora do escopo documental; registre o gap e sua fonte.

## Validação

Antes de concluir:

1. confira os três diretórios esperados, ao menos um documento relevante em
   cada um e os quatro arquivos de toda spec migrada;
2. resolva links relativos e referências a caminhos removidos;
3. compare todas as operações backend com constantes, queries e mutations;
4. busque contratos obsoletos em arquivos `current`;
5. confira relações de decisões substituídas;
6. confira distinção entre componentes próprios, shared e cross-feature;
7. reporte cobertura e gaps sem transformar ausência em comportamento.
