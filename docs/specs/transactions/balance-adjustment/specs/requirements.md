---
area: transactions
feature: balance-adjustment
type: spec-requirements
status: approved
last_reviewed: 2026-11-25
related:
  - ./design.md
  - ./tasks.md
  - ./decisions.md
  - ../../../../transactions/README.md
  - ../../../../accounts/README.md
---

# Requirements — Reajuste de Saldo (Automático por Saldo Alvo e Ajuste Manual)

## Objetivo

Entregar no frontend da Danfy Finance a funcionalidade completa de **Reajuste de Saldo**, substituindo os placeholders desabilitados existentes na tela de Contas (`/accounts`) e integrando a criação, visualização, edição e exclusão de lançamentos técnicos do tipo `ADJUSTMENT` na tela de Transações (`/transactions`).

O fluxo suporta dois modos de entrada complementares:

1. **Modo Principal — Reajuste por Saldo Desejado (`POST /transactions/balance-adjustments`):** o usuário informa o saldo real que a conta deveria apresentar (negativo, zero ou positivo), visualiza em tempo real a diferença calculada e o backend cria automaticamente a transação técnica `ADJUSTMENT` (`EFFECTIVE`) com `direction` (`INCREASE` ou `DECREASE`) e `amountCents` exatos.
2. **Modo Alternativo — Ajuste Manual por Valor (`POST /transactions` com `type: 'ADJUSTMENT'`):** o usuário informa diretamente o valor absoluto do ajuste (`amountCents > 0`), a direção (`INCREASE` ou `DECREASE`), a situação (`EFFECTIVE` ou `PENDING`), a data e o motivo obrigatório.

## Fontes de Contexto

- `personal-finance-backend:docs/integrations/transactions/create-balance-adjustment.md`
- `personal-finance-backend:docs/integrations/transactions/create-transaction.md`
- `personal-finance-backend:docs/integrations/transactions/list-transactions.md`
- `personal-finance-backend:docs/integrations/transactions/update-transaction.md`
- `personal-finance-backend:docs/integrations/transactions/delete-transaction.md`
- `personal-finance-backend:docs/integrations/errors.md`
- `personal-finance-backend:docs/transactions/flows/balance-adjustment.md`
- `personal-finance-backend:docs/transactions/decisions/adjustments-are-technical-transactions.md`
- `docs/accounts/README.md`, `docs/accounts/flows/account-detail-and-summary.md`, `docs/accounts/reference/api-and-contracts.md`
- `docs/transactions/README.md`, `docs/transactions/concepts/transaction-model-and-types.md`, `docs/transactions/reference/api-and-contracts.md`
- `docs/architecture/module-boundaries.md`, `docs/architecture/api-error-handling.md`
- `docs/design-system/danfy-finance-design-system.md`, `docs/design-system/material-3-reference.md`

## Escopo (`In Scope`)

- Habilitar os pontos de entrada de reajuste de saldo na tela `/accounts` (`AccountActionsMenu` e `AccountDetailsPanel`), removendo os placeholders desabilitados e a etiqueta `"Planejado"`.
- Criar um sheet responsivo dedicado (`BalanceAdjustmentSheet`) acessível tanto a partir de `/accounts` (com conta pré-selecionada) quanto de `/transactions` (com seletor de conta ativa).
- Implementar no `BalanceAdjustmentSheet` os dois modos com alternância clara (padrão no modo principal):
  - **Informar novo saldo** (`POST /transactions/balance-adjustments`);
  - **Informar valor do ajuste** (`POST /transactions`, `type: 'ADJUSTMENT'`).
- Estender `CurrencyInput` com suporte opcional a valores negativos (`allowNegative`) sem quebrar os consumidores existentes, combinado com um botão inline discreto de alternância de sinal (`+/−`) integrado dentro do próprio campo `Novo saldo` para ergonomia em teclados móveis.
- Exibir prévia em tempo real do impacto no saldo (diferença calculada no modo por saldo alvo; saldo resultante no modo manual), sem depender apenas de cor.
- Adicionar a visão `ADJUSTMENT` (`Ajustes`) em `/transactions` (`TransactionTypeSelect`, URL `?view=ADJUSTMENT`, `TransactionsKpiGrid`, `TransactionFiltersSheet`, `TransactionCreateButton` e deep link `?create=ADJUSTMENT`).
- Exibir corretamente direção (`INCREASE` / `DECREASE`), sinal e metadados de transações `ADJUSTMENT` na tabela desktop, lista mobile e `TransactionDetailsSheet`.
- Suportar edição (`PATCH /transactions/:id`) de transações `ADJUSTMENT` no `TransactionFormSheet` (incluindo `direction` e `description` obrigatória de até 500 caracteres) e preservar exclusão (`DELETE /transactions/:id`) e confirmação (`PATCH /transactions/:id/confirm` quando `PENDING`).
- Registrar o código `BALANCE_ADJUSTMENT_NO_DIFFERENCE` em `src/shared/errors/apiErrorCodes.ts` e seu mapeamento/contexto em `resolveApiError.ts`, cobrindo todos os erros documentados da operação.
- Invalidar caches de `transactions` e `accounts` após criação/edição/confirmação/exclusão de ajustes.
- Atualizar documentação modular viva em `docs/transactions/`, `docs/accounts/`, `docs/architecture/module-boundaries.md` e `AGENTS.md` locais.

## Fora de Escopo (`Out of Scope`)

- Alterar endpoints, DTOs, locks ou regras de domínio no backend.
- Alterar `initialBalanceCents` de contas existentes.
- Permitir anexos/comprovantes em transações `ADJUSTMENT` (proibido pelo domínio e pelo backend).
- Incluir transações `ADJUSTMENT` na visão `"Todas"` (`GET /transactions` sem `type` continua retornando apenas `INCOME` e `EXPENSE`).
- Permitir reajuste em contas arquivadas.
- Reajustes em lote ou importação de extrato bancário (OFX/CSV).

## Regras de Negócio e Invariantes

### REQ-001 — Elegibilidade de Conta

- WHEN uma conta estiver ativa (`isArchived === false`)
  THE SYSTEM SHALL disponibilizar a ação de reajuste de saldo no menu de ações da conta (`AccountActionsMenu`), no painel de detalhes (`AccountDetailsPanel`) e como opção selecionável no `BalanceAdjustmentSheet`.
- WHEN uma conta estiver arquivada (`isArchived === true`)
  THE SYSTEM SHALL omitir a ação de reajuste no `AccountActionsMenu`, manter o botão desabilitado no `AccountDetailsPanel` com indicação clara de que a conta precisa ser restaurada, e excluir contas arquivadas do seletor de contas do `BalanceAdjustmentSheet`.
- THE SYSTEM SHALL nunca enviar `userId` em nenhum payload.

### REQ-002 — Reajuste Automático por Saldo Alvo (Modo Principal)

- WHEN o usuário abrir o `BalanceAdjustmentSheet`
  THE SYSTEM SHALL abrir por padrão no modo **Informar novo saldo** (`target`).
- THE SYSTEM SHALL exibir o **Saldo atual** (efetivado) da conta selecionada formatado em BRL com `.numeric`.
- THE SYSTEM SHALL aceitar `targetBalanceCents` como inteiro seguro em centavos **negativo, zero (`0`) ou positivo**, em um único campo de valor com botão inline compacto `+/−` integrado à extremidade direita do input (além da digitação nativa de `-`/`+` no teclado).
- WHEN uma conta estiver selecionada e `targetBalanceCents` estiver preenchido
  THE SYSTEM SHALL calcular `delta = BigInt(targetBalanceCents) - BigInt(currentCents)` e exibir uma prévia imediata indicando:
  - para `delta > 0`: direção `Acréscimo`, sinal `+`, ícone ascendente, cor `state-income` e valor formatado;
  - para `delta < 0`: direção `Redução`, sinal `−`, ícone descendente, cor `state-expense` e valor formatado;
  - para `delta === 0`: aviso claro de que o saldo informado já é igual ao saldo atual, impedindo o envio até que o valor seja alterado;
  - para `|delta| > Number.MAX_SAFE_INTEGER`: mensagem de validação bloqueando o envio.
- THE SYSTEM SHALL **não** exibir seletor de data no `BalanceAdjustmentSheet` (em nenhum dos dois modos), enviando automaticamente a data civil local atual (`getTodayDateOnly()`, formato `YYYY-MM-DD`) no payload para refletir o dia em que a ação ocorreu no dispositivo do usuário.
- WHEN o usuário confirmar o reajuste por saldo alvo
  THE SYSTEM SHALL enviar `POST /transactions/balance-adjustments` com `{ accountId, targetBalanceCents, date, description? }`, usando `date` como `DateOnly` (`YYYY-MM-DD`) do dia local atual sem conversão UTC/ISO e omitindo `type`, `status`, `categoryId` e `direction`.
- IF `description` estiver em branco ou omitida
  THEN THE SYSTEM SHALL enviar `description: null` (ou omiti-la), permitindo que o backend aplique o fallback `"Reajuste de saldo"`.
- THE SYSTEM SHALL limitar `description` a no máximo 500 caracteres.

### REQ-003 — Ajuste Manual por Valor (Modo Alternativo)

- WHEN o usuário alternar para o modo **Informar valor do ajuste** (`manual`)
  THE SYSTEM SHALL permitir informar:
  - conta ativa (`accountId`);
  - direção obrigatória (`INCREASE` = Aumentar saldo / `DECREASE` = Reduzir saldo);
  - valor estritamente positivo em centavos (`amountCents > 0`, `<= Number.MAX_SAFE_INTEGER`) via `CurrencyInput`;
  - situação (`EFFECTIVE` por padrão ou `PENDING`);
  - motivo obrigatório não vazio (`description`, 1 a 500 caracteres após `trim()`).
- THE SYSTEM SHALL enviar `date` automaticamente com `getTodayDateOnly()` (`YYYY-MM-DD`) sem exibir seletor de data.
- WHEN uma conta ativa estiver selecionada e `amountCents > 0`
  THE SYSTEM SHALL exibir uma prévia do saldo resultante (ou impacto previsto quando `status === 'PENDING'`).
- WHEN o usuário confirmar o ajuste manual
  THE SYSTEM SHALL enviar `POST /transactions` com `{ accountId, type: 'ADJUSTMENT', status, amountCents, direction, date, description }`, sem `categoryId` e sem `destinationAccountId`.

### REQ-004 — Atualização de Cache e Feedback Pós-Sucesso

- WHEN qualquer reajuste (automático ou manual) for criado com sucesso (`201 Created`)
  THE SYSTEM SHALL:
  1. invalidar `TRANSACTION_QUERY_KEYS.transactions` (`exact: false`) e `ACCOUNT_QUERY_KEYS.accounts` (`exact: false`);
  2. exibir toast de confirmação conciso em português;
  3. fechar o `BalanceAdjustmentSheet` limpando erros de mutação anteriores.

### REQ-005 — Visão `Ajustes`, Exibição, Edição e Exclusão em `/transactions`

- WHEN o usuário acessar `/transactions`
  THE SYSTEM SHALL oferecer a opção `Ajustes` (`view=ADJUSTMENT`) no `TransactionTypeSelect` e sincronizá-la na URL (`?view=ADJUSTMENT`).
- WHEN `view === 'ADJUSTMENT'`
  THE SYSTEM SHALL:
  - consultar `GET /transactions` com `type=ADJUSTMENT` e sem `categoryId`;
  - exibir no `TransactionsKpiGrid` rótulos coerentes (`Ajustes pendentes`, `Ajustes efetivados`, `Total ajustado`);
  - ocultar o filtro de categoria no `TransactionFiltersSheet` com explicação de categoria técnica;
  - exibir `TransactionCreateButton` com ação para abrir o `BalanceAdjustmentSheet` (pré-selecionando `filters.accountId` se houver filtro de conta ativo).
- WHEN uma transação `ADJUSTMENT` for renderizada em `TransactionsTable`, `TransactionMobileItem` ou `TransactionDetailsSheet`
  THE SYSTEM SHALL exibir claramente a direção sem depender apenas de cor:
  - `INCREASE`: prefixo `+`, tom `state-income`, indicação textual `Acréscimo`;
  - `DECREASE`: prefixo `−`, tom `state-expense`, indicação textual `Redução`.
- WHEN o usuário abrir `TransactionDetailsSheet` de um `ADJUSTMENT`
  THE SYSTEM SHALL exibir o campo `Direção` (`Acréscimo no saldo` / `Redução no saldo`), ocultar a seção de comprovantes e permitir `Editar`, `Excluir` e (se `PENDING`) `Confirmar ajuste`.
- WHEN o usuário editar um `ADJUSTMENT` no `TransactionFormSheet`
  THE SYSTEM SHALL preservar o tipo `ADJUSTMENT`, exibir o seletor de `Direção`, exigir `description` não vazia (até 500 caracteres), ocultar categoria e comprovantes, e enviar `PATCH /transactions/:id` diff-only.

### REQ-006 — Tratamento de Erros e Recuperação

- WHEN `POST /transactions/balance-adjustments` ou `POST /transactions` falhar
  THE SYSTEM SHALL manter o sheet aberto, preservar todos os valores digitados pelo usuário e apresentar feedback acionável em português baseado no `code` do backend (nunca expondo `message` bruto ou códigos internos):
  - `BALANCE_ADJUSTMENT_NO_DIFFERENCE` (`409`): informar que o saldo atual da conta já corresponde ao valor informado, orientar revisar o valor e invalidar cache de contas para atualizar o saldo exibido;
  - `VALIDATION_ERROR` (`400`): aplicar erros por campo via `applyApiFieldErrors` com foco no primeiro controle inválido + `ApiErrorAlert`;
  - `INVALID_TRANSACTION` (`400`): exibir `ApiErrorAlert` orientando revisão dos campos;
  - `TRANSACTION_ACCOUNT_UNAVAILABLE` (`409`): exibir `ApiErrorAlert` informando que a conta não está disponível/ativa;
  - `TRANSACTION_CATEGORY_UNAVAILABLE` (`400`/`409`): exibir `ApiErrorAlert` acionável sem vazar detalhe técnico;
  - Falha de rede / `500` / `401`: seguir fluxo padrão de `resolveApiError` e interceptors de sessão.
- THE SYSTEM SHALL evitar feedback duplicado (não exibir simultaneamente o mesmo erro em `ApiErrorAlert` e toast).

### REQ-007 — Acessibilidade e Responsividade Mobile-First

- THE SYSTEM SHALL funcionar em mobile (bottom `Sheet` com `safe-area-inset-bottom`, alvos de toque `>= 44px`, controle de sinal `+`/`−` tocável) e desktop (side `Sheet` à direita com largura adequada).
- THE SYSTEM SHALL suportar navegação completa por teclado (`Tab`, `Enter`, `Space`, `Escape`, teclas `-` e `+` no `CurrencyInput` com `allowNegative`), foco visível (`focus-visible`) e atributos ARIA adequados (`aria-invalid`, `role="status"`/`aria-live="polite"` para prévia e erros).
- THE SYSTEM SHALL usar exclusivamente tokens semânticos Danfy Dark (`app-*`, `brand`, `state-income`, `state-expense`, `state-info`, `state-warning`, `destructive`, tokens Shadcn), nunca cores hardcoded nem paletas Tailwind brutas.

## Estados Obrigatórios de Tela

| Estado | Comportamento Esperado |
| --- | --- |
| **Inicial (aberto de `/accounts`)** | Conta pré-selecionada em modo somente leitura, saldo atual exibido, modo `Informar novo saldo` ativo, campo `Novo saldo` vazio e focado/pronto para digitação, data = hoje. |
| **Inicial (aberto de `/transactions`)** | Seletor de contas ativas habilitado (pré-seleciona `filters.accountId` se ativo). Se não houver contas ativas, exibe estado informativo bloqueando envio. |
| **Sem diferença (`delta === 0`)** | Prévia destaca aviso neutro/warning explicando que o saldo já está igual; botão de envio desabilitado. |
| **Pending (submissão em andamento)** | Botão primário desabilitado com rótulo de progresso (`Aplicando reajuste...` / `Registrando ajuste...`), inputs preservados, sem fechar prematuramente. |
| **Sucesso** | Sheet fecha, toast de confirmação exibido, saldos em `/accounts`, resumo global e lista `/transactions?view=ADJUSTMENT` atualizados. |
| **Erro de validação / negócio / rede** | Sheet permanece aberto com todos os dados preservados, erros de campo destacados + `ApiErrorAlert` inline próximo ao submit. |
| **Offline / 401** | Mensagem clara de conexão ou expiração de sessão conforme `resolveApiError` e interceptor Axios. |

## Casos de Borda

1. **Conta com saldo positivo (`100000`) ajustada para menor positivo (`50000`):** prévia `− R$ 500,00` (`DECREASE`), saldo após commit = `R$ 500,00`.
2. **Conta com saldo positivo (`100000`) ajustada para zero (`0`):** usuário digita `0`, campo mostra `R$ 0,00`, prévia `− R$ 1.000,00` (`DECREASE`), payload envia `targetBalanceCents: 0`.
3. **Conta com saldo positivo (`100000`) ajustada para negativo (`-25000`):** usuário alterna sinal para negativo e digita `25000`, campo mostra `-R$ 250,00`, prévia `− R$ 1.250,00` (`DECREASE`), payload envia `targetBalanceCents: -25000`.
4. **Conta com saldo negativo (`-50000`) ajustada para menos negativo (`-10000`) ou positivo (`20000`):** prévia `+ R$ 400,00` ou `+ R$ 700,00` (`INCREASE`).
5. **Concorrência (`BALANCE_ADJUSTMENT_NO_DIFFERENCE` 409):** outra aba/dispositivo já aplicou o mesmo saldo alvo; backend retorna `409`, UI mostra mensagem clara de negócio e revalida `accounts` para sincronizar o saldo exibido.
6. **Alternância entre abas (`Informar novo saldo` ↔ `Informar valor do ajuste`):** limpa erro de mutação anterior e preserva conta selecionada, data e descrição já digitada.
7. **Conta aberta via `AccountDetailsPanel`:** clicar em `Reajustar saldo` fecha o detalhe da conta antes de abrir o `BalanceAdjustmentSheet`, evitando sobreposição de modais/sheets e conflito de foco.
8. **Paste com sinal negativo (`-150,00`, `-R$ 150,00`) no `CurrencyInput` com `allowNegative`:** preserva corretamente o valor `-15000`.

## Critérios de Aceite Testáveis

1. Em `/accounts`, clicar em `Reajustar saldo` no menu `...` ou no detalhe de uma conta ativa abre `BalanceAdjustmentSheet` com o saldo atual correto daquela conta; contas arquivadas não permitem disparar reajuste.
2. No modo principal (`Informar novo saldo`), informar `500,00` para uma conta com `1.000,00` mostra prévia de redução de `R$ 500,00`, envia `POST /transactions/balance-adjustments` com `{ accountId, targetBalanceCents: 50000, date: 'YYYY-MM-DD', description: null }` e atualiza o saldo exibido da conta para `R$ 500,00` sem recarregar a página.
3. No modo principal, valores negativos (`-150,00`) e zero (`0,00`) são aceitos, exibidos corretamente na prévia e enviados como inteiros negativos/`0` em `targetBalanceCents`.
4. Quando `targetBalanceCents === currentCents` (ou quando backend retorna `409 BALANCE_ADJUSTMENT_NO_DIFFERENCE`), o usuário recebe feedback claro sem mensagem técnica bruta e sem perder os dados preenchidos.
5. No modo alternativo (`Informar valor do ajuste`), exigir `direction`, `amountCents > 0` e `description` não vazia, enviando `POST /transactions` com `type: 'ADJUSTMENT'` e atualizando saldos e listagem.
6. Em `/transactions`, selecionar `Ajustes` (`?view=ADJUSTMENT`) lista as transações `ADJUSTMENT` com sinal/cor/rótulo de direção, exibe KPIs corretos, permite abrir detalhes, editar (`PATCH /transactions/:id`), confirmar se pendente e excluir (`DELETE /transactions/:id`) refletindo no saldo da conta.
7. Testes unitários/integração (Vitest + Testing Library), `npm run lint` e `npm run build` passam sem erros.
