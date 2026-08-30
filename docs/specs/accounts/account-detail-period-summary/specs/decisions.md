---
area: accounts
feature: account-detail-period-summary
type: spec-decisions
status: approved
approved-at: 2026-08-29
related:
  - ./requirements.md
  - ./design.md
  - ./tasks.md
---

# Resumo do período no detalhe da conta — decisões

## DEC-001 — usar o overview summary em uma única chamada lazy

Status: accepted

Decision:
Consultar a listagem sem `type`, somente após abrir o detalhe, e ler os totais
efetivos agrupados de income/expense.

Reason:
O backend já calcula ambos sobre os mesmos filtros. Duas consultas por tipo ou
soma no cliente duplicariam custo e poderiam divergir da paginação.

Impact:
O detalhe depende do discriminante `transaction_summary.overview`; `limit=1`
reduz o payload de itens sem reduzir a abrangência do summary.

## DEC-002 — filtros de detalhe são links reproduzíveis

Status: accepted

Decision:
Serializar view, status, account e período pelo contrato de URL vigente de
Transactions. A ação geral serializa somente a account e deixa o destino adotar
seus defaults.

Reason:
Refresh, voltar e compartilhamento preservam a intenção, enquanto `Ver
transações` não carrega silenciosamente um período escolhido em outra tela.

Impact:
Accounts passa a depender dos helpers públicos de URL de Transactions, sem
duplicar nomes de query params.

## DEC-003 — células financeiras são ações com tooltip

Status: accepted

Decision:
Tornar receitas e despesas botões completos, com tooltip contextual do período,
ícones de tendência e foco visível.

Reason:
O mesmo bloco apresenta o total e oferece o aprofundamento correspondente; uma
área de toque inteira é mais clara e adequada ao mobile do que um ícone isolado.

Impact:
O grid usa semântica de grupos/células em vez de `dl`, evitando aninhar conteúdo
interativo em termos/descrições.
