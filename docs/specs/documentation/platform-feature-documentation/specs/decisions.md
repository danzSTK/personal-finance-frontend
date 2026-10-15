---
area: documentation
feature: platform-feature-documentation
type: spec-decisions
status: current
related:
  - ./requirements.md
  - ./design.md
  - ./tasks.md
---

# Decisões — padrão documental de features da plataforma

## DEC-001 — separar spec e documentação viva

Status: accepted

Decision:
Manter specs em `docs/specs` e documentação implementada em `docs/<module>`.

Reason:
Spec é contrato proposto/aprovado; documentação viva precisa refletir o código
atual. Misturar ambos torna propostas não implementadas indistinguíveis do
comportamento real.

Alternatives considered:
- Um único documento por feature: menor número de arquivos, mas autoridade e
  status ambíguos.

Consequences:
- Existe alguma duplicação de contexto, reduzida por links e escopos distintos.
- A implementação precisa atualizar a documentação viva ao concluir.

## DEC-002 — três arquivos vivos obrigatórios

Status: superseded

Superseded-by: DEC-011

Decision:
Toda folha documental usa `decisions.md`, `flow.md` e `components.md`.

Reason:
Esses eixos separam por que, como o usuário/sistema percorre a feature e como o
frontend se compõe, sem virar dump de código.

Alternatives considered:
- Um README único: simples no início, difícil de manter e relacionar.
- Replicar quatro arquivos da spec: confunde contrato com documentação atual.

Consequences:
Novos tipos de documento exigem justificativa; o padrão inicial permanece
pequeno.

## DEC-003 — skill específica do repositório

Status: accepted

Decision:
Criar `platform-feature-documentation` em `.agents/skills`, não no diretório
global do Codex.

Reason:
Estrutura, módulos, fontes backend e regras de Danfy são particulares deste
workspace.

Alternatives considered:
- Skill global: reutilizável, porém carregaria regras específicas em projetos
  sem relação.

Consequences:
A skill viaja com o repositório e pode ser versionada/revisada junto às regras.

## DEC-004 — detalhes em uma única referência da skill

Status: accepted

Decision:
Manter workflow essencial no `SKILL.md` e templates/contratos em
`references/documentation-files.md`.

Reason:
Aplica progressive disclosure e reduz consumo de contexto.

Consequences:
A referência deve ser lida integralmente ao criar ou revisar os arquivos vivos.

## DEC-005 — idioma português com identificadores técnicos originais

Status: accepted

Decision:
Escrever documentação do projeto em português brasileiro, preservando nomes de
rotas, códigos, componentes, tipos e eventos em inglês.

Reason:
Mantém clareza para o time sem traduzir contratos que precisam ser buscáveis no
código.

Consequences:
Não normalizar identificadores técnicos para palavras portuguesas.

## DEC-006 — subfeature somente quando existir autonomia documental

Status: accepted

Decision:
Usar o nível opcional de subfeature apenas quando houver fluxo, decisão ou
dependência distinta.

Reason:
Espelhar toda pasta/componente cria árvores profundas e documentação vazia.

Consequences:
Authentication usa subfeatures sign-in/sign-up/oauth; providers permanece
agrupado enquanto seus vínculos compartilham decisões e componentes.

## DEC-007 — reconstrução histórica sem aprovação retroativa

Status: accepted

Decision:
Completar a estrutura de specs legadas com conteúdo verificável e status
histórico/reconstruído, sem declarar que arquivos ausentes foram aprovados no
passado.

Reason:
O padrão exige quatro arquivos, mas integridade histórica vale mais que uma
aparência falsa de conformidade.

Consequences:
Algumas specs normalizadas poderão permanecer não normativas e servir apenas de
contexto para manutenção.

## DEC-008 — documentação viva inicial limitada a auth

Status: accepted

Decision:
Documentar somente auth nesta primeira aplicação; outros módulos recebem apenas
a organização de suas specs existentes.

Reason:
Auth é o módulo em mudança e possui contexto disponível. Expandir para toda a
plataforma produziria documentação longa e superficial.

Consequences:
Accounts, categories e transactions serão documentados quando uma mudança com
contexto próprio os colocar em escopo.

## DEC-009 — código e integração atuais vencem documento histórico

Status: accepted

Decision:
Marcar divergências e construir documentação `current` a partir de código e
contratos backend atuais. Specs históricas preservam intenção, não autoridade
operacional automática.

Reason:
As specs antigas de auth ainda citam Bearer token, token OAuth em query e
`/auth/me`, contrariando cookies HttpOnly, callback atual e `GET /users/me`.

Consequences:
Correções precisam de nota/decisão quando alteram compreensão histórica; não se
deve copiar cegamente specs antigas para docs vivas.

## DEC-010 — decisões contraditórias exigem substituição explícita

Status: accepted

Decision:
Uma nova decisão que invalida outra deve referenciar `supersedes`, e a anterior
passa a `superseded` com link reverso.

Reason:
Features de auth compartilham sessão, providers, redirects e segurança;
decisões independentes aparentemente locais podem criar bugs cross-flow.

Consequences:
Revisões documentais precisam percorrer relações antes de aceitar uma mudança.

## DEC-011 — documentação viva usa árvores de responsabilidade única

Status: accepted

Supersedes: DEC-002

Problem:
Arquivos únicos de `decisions`, `flow` e `components` crescem de forma
monolítica, dificultam links precisos e misturam decisões, fluxos e componentes
independentes no mesmo histórico.

Decision:
Cada eixo é um diretório: `decisions/`, `flow/` e `components/`. Cada arquivo
Markdown descreve uma responsabilidade coesa. Em `decisions/`, cada arquivo
contém obrigatoriamente `Problema`, `Decisão` e `Consequência`.

Consequences:
- Relações apontam diretamente ao documento relevante.
- Mudanças independentes geram diffs menores e histórico mais claro.
- A árvore pode conter vários arquivos, mas não deve espelhar mecanicamente todo
  componente de código.
- A documentação já criada de change-password precisa ser migrada.
