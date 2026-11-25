---
area: transactions
feature: balance-adjustment
type: spec-decisions
status: approved
last_reviewed: 2026-11-25
related:
  - ./requirements.md
  - ./design.md
  - ./tasks.md
---

# Decisions — Reajuste de Saldo (Frontend)

## DEC-001 — Unificar os dois modos de reajuste em um único `BalanceAdjustmentSheet` com modo por saldo alvo como padrão

Status: accepted

Problem:
O domínio oferece duas formas de corrigir o saldo de uma conta: informar o saldo real desejado (`POST /transactions/balance-adjustments`, principal) e criar uma transação de ajuste manual informando valor e direção (`POST /transactions` com `type: 'ADJUSTMENT'`, alternativo). Criar duas telas ou dois botões competindo no menu da conta aumentaria o atrito cognitivo e duplicaria estado de conta/data/erros.

Decision:
Criar um único `BalanceAdjustmentSheet` responsivo (bottom Sheet em mobile, right Sheet em desktop) que abre por padrão na aba **"Informar novo saldo"** (`target`) e oferece a aba secundária **"Informar valor do ajuste"** (`manual`), preservando conta, data e motivo ao alternar entre elas.

Consequences:
Reduz complexidade de navegação em `/accounts` e `/transactions`, prioriza o fluxo mais seguro e intuitivo (informar o saldo do extrato) e mantém o ajuste manual imediatamente acessível quando o usuário já sabe a diferença exata.

---

## DEC-002 — Manter `BalanceAdjustmentSheet` em `src/features/transactions/` e expô-lo via barrel público `index.ts`

Status: accepted

Problem:
O reajuste é acionado tanto em `/accounts` quanto em `/transactions`, mas ambos os endpoints (`POST /transactions/balance-adjustments` e `POST /transactions`) e o recurso retornado (`Transaction`) pertencem ao módulo `transactions`. Importar caminhos internos de `transactions` a partir de `accounts` ampliaria a dívida técnica `DT-03`.

Decision:
Implementar schema, utils, mutação e `BalanceAdjustmentSheet` dentro de `src/features/transactions/` e criar `src/features/transactions/index.ts` expondo apenas a API pública necessária (`BalanceAdjustmentSheet`, `BalanceAdjustmentSheetState`, `BalanceAdjustmentMode`), consumida por `AccountsPage`.

Consequences:
Mantém coesão do domínio de transações, evita duplicação de formulário/mutação e inicia a resolução controlada de `DT-03` em `docs/architecture/module-boundaries.md`.

---

## DEC-003 — Estender `CurrencyInput` com `allowNegative` opcional + controle explícito de sinal `+`/`−`

Status: accepted

Problem:
`POST /transactions/balance-adjustments` aceita `targetBalanceCents` negativo, zero ou positivo (ex.: cheque especial). O `CurrencyInput` existente só aceita dígitos positivos e, em dispositivos móveis, `inputMode="numeric"` frequentemente omite a tecla de sinal negativo `-`.

Decision:
Adicionar a prop opcional `allowNegative?: boolean` (default `false`) em `CurrencyInput` para suportar digitação de `-`/`+` e paste negativo sem quebrar nenhum consumidor atual, e acoplar um único botão compacto `+/−` integrado à extremidade direita dentro do próprio campo `Novo saldo` (sem botões empilhados acima do input), devolvendo o foco ao campo após alternar o sinal.

Consequences:
Preserva 100% da retrocompatibilidade nos formulários de receitas, despesas, transferências e saldo inicial, mantém o formulário limpo e de linha única e garante entrada fluida de saldos negativos tanto no teclado desktop quanto no touch mobile.

---

## DEC-006 — Ocultar seletor de data no `BalanceAdjustmentSheet` (ambos os modos) e enviar data local automática

Status: accepted

Problem:
O campo `date` (`YYYY-MM-DD`) no reajuste de saldo serve para o frontend informar o dia civil em que a ação está ocorrendo para o usuário (evitando divergências de fuso horário com o servidor), e não para o usuário escolher uma data no momento do reajuste. Exibir o seletor `Data (Hoje / Ontem / Outro)` em qualquer um dos modos do `BalanceAdjustmentSheet` adicionava fricção desnecessária.

Decision:
Remover o seletor de data da UI em **ambos os modos** (`Informar novo saldo` e `Informar valor do ajuste`) do `BalanceAdjustmentSheet` e enviar automaticamente `getTodayDateOnly()` nos payloads de criação. A edição eventual da data de um ajuste já criado continua disponível via `TransactionFormSheet` em `/transactions?view=ADJUSTMENT`.

Consequences:
Torna o fluxo de reajuste mais enxuto, direto e consistente nos dois modos.

---

## DEC-004 — Adicionar a visão `Ajustes` (`?view=ADJUSTMENT`) em `/transactions`

Status: accepted

Problem:
`GET /transactions` sem `type` retorna apenas `INCOME` e `EXPENSE`. Sem uma visão dedicada em `/transactions`, o usuário não teria como consultar, auditar, editar ou excluir os reajustes de saldo criados.

Decision:
Adicionar `ADJUSTMENT` (`Ajustes`) ao `TransactionView` (`TransactionTypeSelect`, `transactionUrl.utils.ts`, `TransactionsKpiGrid`, `TransactionFiltersSheet`), exibir sinal/direção explícita (`Acréscimo`/`Redução`) na tabela, lista mobile e detalhes, e habilitar edição de `ADJUSTMENT` no `TransactionFormSheet`.

Consequences:
Fecha o ciclo ponta a ponta do reajuste (criar → visualizar histórico → auditar/editar/excluir) sem poluir a visão `"Todas"` nem os cálculos de receitas/despesas mensais.

---

## DEC-005 — Fechar o painel de detalhes da conta antes de abrir o `BalanceAdjustmentSheet`

Status: accepted

Problem:
No `AccountCard`, o painel de detalhes usa `Dialog` (desktop) ou bottom `Sheet` (mobile). Abrir outro `Sheet` por cima de um `Dialog`/`Sheet` Radix aberto pode causar conflitos de focus trap, scroll lock e fechamento via `Escape`.

Decision:
Seguir exatamente o padrão já adotado pela ação `Editar conta` no `AccountCard`: ao acionar `Reajustar saldo` dentro do `AccountDetailsPanel`, fechar o painel de detalhes (`setIsDetailsOpen(false)`) e disparar `onAdjustBalance()`, delegando a renderização do `BalanceAdjustmentSheet` para `AccountsPage`.

Consequences:
Garante gerenciamento limpo de foco, acessibilidade previsível via teclado (`Escape`) e compatibilidade consistente entre mobile e desktop.
