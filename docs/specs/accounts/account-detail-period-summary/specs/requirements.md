---
area: accounts
feature: account-detail-period-summary
type: spec-requirements
status: approved
approved-at: 2026-08-29
related:
  - ./design.md
  - ./tasks.md
  - ./decisions.md
---

# Resumo do período no detalhe da conta — requisitos

Spec aprovada pela solicitação explícita do usuário em 29/08/2026.

## Objetivo

Transformar os indicadores de receitas e despesas do detalhe da conta em dados
reais do período selecionado, carregados somente quando o detalhe for aberto, e
usar os indicadores e a ação `Ver transações` como entradas previsíveis para a
tela de transações filtrada.

## Fontes do contrato

- Backend `docs/integrations/transactions/README.md`.
- Backend `docs/integrations/transactions/list-transactions.md`.
- Backend `docs/integrations/errors.md`.
- `docs/design-system/danfy-finance-design-system.md`.
- `docs/design-system/material-3-reference.md`.
- `docs/specs/accounts/account-templates-flow/specs/requirements.md`.

## Escopo

- Corrigir o recorte do ring/borda dos campos roláveis no drawer desktop de
  criar/editar account.
- Consultar `GET /transactions` somente após abrir o detalhe da account.
- Filtrar o resumo por `accountId`, `status=EFFECTIVE`, `dateFrom` e `dateTo`
  correspondentes ao mês selecionado em Accounts.
- Mostrar `summary.income.effectiveCents` e
  `summary.expense.effectiveCents` com moeda local e algarismos tabulares.
- Explicar em tooltip que cada valor é o total efetivado do período selecionado.
- Navegar de receitas/despesas para `/transactions` com conta, período, status
  efetivo e view correspondente na URL.
- Habilitar `Ver transações` com somente o filtro de account explícito; a tela de
  destino mantém o período padrão próprio.
- Corrigir a semântica visual com tendência de alta para receita e de baixa para
  despesa.
- Reordenar o grid como nome/saldo inicial, receitas/despesas e tipo/total geral.

## Fora de escopo

- Alterar a semântica do summary ou a rota de listagem no backend.
- Somar transações no cliente.
- Incluir pendências, transferências ou ajustes nos indicadores.
- Criar um seletor de período dentro do detalhe da account.
- Implementar reajuste de saldo.

## Regras e estados

1. BEFORE o detalhe abrir, THE SYSTEM SHALL NOT disparar a consulta de resumo
   de transações da account.
2. WHEN o detalhe abrir, THE SYSTEM SHALL consultar uma única listagem sem
   `type`, com `limit=1`; o summary continua abrangendo todos os itens filtrados.
3. Loading preserva as duas células com skeletons, sem valor financeiro
   inventado.
4. Erro aparece dentro do detalhe com explicação segura e ação de retry; o
   restante dos dados da account continua visível.
5. Receita e despesa são valores positivos; cor, rótulo e ícone comunicam o
   significado em conjunto.
6. Clique em receita/despesa fecha o detalhe por navegação e leva à view
   correspondente com filtros serializados na URL.
7. Clique em `Ver transações` não herda o período escolhido em Accounts; envia
   somente `accountId` além dos defaults omitidos da tela de destino.
8. O intervalo usa strings civis `YYYY-MM-DD`, sem conversão para UTC.

## Critérios de aceite

- [ ] O campo de nome focado não tem ring/borda recortado no drawer desktop.
- [ ] Nenhum request de resumo ocorre antes de abrir o detalhe.
- [ ] O request lazy contém conta, status efetivo e limites inclusivos do mês.
- [ ] Receitas e despesas exibem os campos efetivos do overview summary.
- [ ] Loading e erro/retry ficam contidos no painel.
- [ ] Tooltips nomeiam o período selecionado.
- [ ] Os links de receita/despesa preservam view, account, effective e período.
- [ ] `Ver transações` funciona com filtro de conta e sem período explícito.
- [ ] Grid e ícones seguem a nova ordem/semântica solicitada.
- [ ] Testes, lint e build passam.
