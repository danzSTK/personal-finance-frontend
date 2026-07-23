---
area: transactions
feature: transfer
type: spec-requirements
status: current
related:
  - ./design.md
  - ./tasks.md
  - ./decisions.md
  - ../../../../../personal-finance-backend/docs/integrations/transactions/README.md
  - ../../../../../personal-finance-backend/docs/integrations/transactions/create-transaction.md
  - ../../../../../personal-finance-backend/docs/integrations/transactions/update-transaction.md
  - ../../../../../personal-finance-backend/docs/integrations/transactions/confirm-transaction.md
  - ../../../../../personal-finance-backend/docs/integrations/transactions/delete-transaction.md
  - ../../../../../personal-finance-backend/docs/integrations/errors.md
---

# Requirements - Transferências Entre Contas

## Objetivo

Implementar no frontend o fluxo completo de `TRANSFER` para movimentar um valor entre duas contas ativas do usuário, reutilizando o contrato e o modelo visual já existentes em transactions.

A entrega também deve corrigir todos os inputs monetários de produto para que a digitação comece pelos centavos, sem exigir que o usuário digite vírgula.

## Fontes De Contexto

Esta spec foi derivada das seguintes fontes:

- `personal-finance-backend/docs/integrations/transactions/**`;
- `personal-finance-backend/docs/integrations/accounts/list-accounts.md`;
- `personal-finance-backend/docs/integrations/errors.md`;
- `personal-finance-backend/docs/integrations/date-and-time.md`;
- `personal-finance-backend/docs/transactions/**`;
- `personal-finance-backend/docs/specs/transactions/core/specs/**`;
- `docs/specs/transactions/transactions-screen-spec.md`;
- `docs/design-system/danfy-finance-design-system.md`;
- `docs/design-system/material-3-reference.md`;
- `.agents/skills/spec-driven-development/SKILL.md`;
- `.agents/skills/danfy-api-error-handling/SKILL.md`.

## Módulos Envolvidos

- `transactions`: criação, edição, confirmação, listagem, detalhes, validação e DTOs.
- `accounts`: opções de origem/destino e invalidação dos saldos após mutations.
- `auth`: ativação do atalho mobile de transferência.
- `shared`: comportamento reutilizável dos inputs monetários em centavos.

## Escopo

- Ativar a criação de transferência a partir da view `Transferências`.
- Ativar o atalho mobile `Transferência` no menu circular do botão central.
- Abrir o mesmo sheet responsivo de transactions já utilizado por receita e despesa, configurado como `TRANSFER`.
- Cadastrar valor, situação, data, conta de origem, conta de destino e descrição opcional.
- Criar transferências `EFFECTIVE` ou `PENDING` conforme a situação escolhida.
- Editar transferências existentes com as mesmas invariantes de origem e destino.
- Confirmar transferências pendentes, permitindo os ajustes finais aceitos pelo backend.
- Exibir transferências na view dedicada, nos detalhes e com semântica financeira neutra.
- Impedir a exclusão de transferências e explicar a correção por transferência inversa.
- Migrar os inputs monetários de transactions e accounts para digitação iniciada nos centavos.
- Preservar o tratamento tipado de erros, valores preenchidos, acessibilidade e estados de loading existentes.

## Fora Do Escopo

- Criar ou alterar endpoints, DTOs do backend, tabelas, migrations ou constraints.
- Movimentar dinheiro em uma instituição financeira real.
- Transferir para contas externas ou pertencentes a outro usuário.
- Excluir, estornar ou reverter automaticamente uma transferência.
- Embutir tarifas na transferência. Uma tarifa continua sendo uma `EXPENSE` separada.
- Criar ou enviar category técnica de transferência.
- Recorrência, parcelamento, anexos, comprovantes, multi-moeda ou agendamento avançado.
- Bloquear transferência por saldo insuficiente; essa regra não existe no contrato atual.
- Alterar os cálculos ou contratos de saldo do backend.

## Regras De Negócio

### Identidade E Ownership

- O frontend nunca envia `userId`.
- Origem e destino devem ser accounts do usuário autenticado.
- Somente accounts ativas podem ser usadas em novas transferências.

### Origem E Destino

- `accountId` representa a conta de origem.
- `destinationAccountId` representa a conta de destino.
- Origem e destino são obrigatórios e precisam ser diferentes.
- A lista de destino deve excluir a origem selecionada.
- Se a troca da origem tornar a seleção atual de destino inválida, o destino deve ser limpo e solicitado novamente.
- A criação deve permanecer indisponível quando houver menos de duas contas ativas, com explicação explícita próxima ao formulário.

### Valor

- `amountCents` deve ser um inteiro positivo.
- O valor nunca é enviado negativo.
- Transferência é financeiramente neutra: diminui o saldo da origem, aumenta o saldo do destino e não é receita nem despesa.

### Data E Situação

- `date` é uma string civil `YYYY-MM-DD` e não pode ser convertida para `Date`, ISO datetime ou UTC antes do envio.
- A situação inicial segue o formulário atual e começa como `EFFECTIVE`.
- `PENDING` não afeta saldo atual até ser confirmada.
- `EFFECTIVE` afeta os saldos individuais das contas envolvidas.

### Categoria E Direção

- O frontend não deve mostrar campo de categoria para `TRANSFER`.
- O payload de `TRANSFER` não deve enviar `categoryId`.
- O backend resolve e retorna a category técnica de transferência.
- O payload de `TRANSFER` não deve enviar `direction`.

### Descrição

- A descrição é opcional.
- Quando preenchida, deve ser normalizada e respeitar o limite atual de 120 caracteres.

### Exclusão E Correção

- Uma transferência não pode ser excluída na V0.
- A UI não deve oferecer uma ação de exclusão aparentemente disponível.
- Para corrigir uma transferência já efetivada, a UI deve orientar a criação de outra transferência no sentido contrário.

### Inputs Monetários Em Centavos

- Todo input monetário editável de produto deve interpretar os dígitos digitados a partir dos centavos.
- A digitação não deve exigir vírgula ou ponto decimal.
- A sequência `1`, `2`, `3` deve produzir `R$ 0,01`, `R$ 0,12` e `R$ 1,23`.
- Backspace deve percorrer o caminho inverso sem deixar formato inválido.
- Colar `123,45` ou `12345` deve produzir `R$ 123,45`.
- Campo vazio continua semanticamente vazio até a regra do formulário aplicar seu default.
- O estado e os DTOs devem continuar usando inteiros em centavos; cálculos monetários não podem usar float.
- A correção abrange, no mínimo, valor da transaction, valor na confirmação e saldo inicial da account.

## Fluxos

### FLW-001 - Criar Pela View De Transferências

1. O usuário seleciona a view `Transferências`.
2. A página consulta `GET /transactions` com `type=TRANSFER`.
3. O usuário aciona `Nova transferência`.
4. O sheet abre com valor, situação, data, origem, destino e descrição.
5. O frontend valida os dados e envia `POST /transactions`.
6. Em sucesso, o sheet fecha, a lista e os saldos de accounts são atualizados e o feedback confirma a transferência.

### FLW-002 - Criar Pelo Atalho Mobile

1. O usuário abre o menu circular pelo botão central.
2. O usuário toca em `Transferência`.
3. A navegação abre `/transactions?view=TRANSFER&create=TRANSFER`.
4. A página consome o intent `create`, remove-o da URL com replace e abre o mesmo sheet de criação.

### FLW-003 - Editar Transferência

1. O usuário abre os detalhes de uma transferência.
2. O usuário escolhe editar.
3. O sheet apresenta os dados atuais, incluindo origem e destino.
4. O frontend envia apenas os campos alterados por `PATCH /transactions/:id`.
5. `categoryId` e `direction` permanecem ausentes no payload.

### FLW-004 - Confirmar Transferência Pendente

1. O usuário abre uma transferência `PENDING` e escolhe confirmar.
2. O sheet de confirmação mostra valor, data, origem e destino para conferência e ajuste final.
3. O frontend impede origem e destino iguais.
4. O frontend envia `PATCH /transactions/:id/confirm`.
5. Em sucesso, a transferência passa a `EFFECTIVE` e os saldos são invalidados.

### FLW-005 - Digitar Valor Em Centavos

1. O campo monetário recebe foco com placeholder ou valor atual formatado.
2. Cada dígito inserido desloca o valor decimal a partir dos centavos.
3. O usuário vê o formato local brasileiro durante toda a edição.
4. O formulário recebe o inteiro em centavos, sem parsing decimal no submit.

## Requisitos Funcionais

### REQ-001 - Disponibilizar A Criação

WHEN a view ativa for `TRANSFER`
THE SYSTEM SHALL oferecer a ação `Nova transferência` em desktop e nos estados vazios aplicáveis.

WHEN o usuário selecionar o atalho mobile `Transferência`
THE SYSTEM SHALL abrir o sheet de criação de `TRANSFER` e fechar o menu circular.

### REQ-002 - Validar As Contas

WHEN o formulário de transferência for aberto
THE SYSTEM SHALL listar somente accounts ativas como origem e destino.

WHEN uma origem for escolhida
THE SYSTEM SHALL removê-la das opções de destino.

IF origem e destino forem iguais ou algum deles estiver ausente
THEN o sistema deve impedir o submit e apresentar erro junto ao campo afetado.

IF houver menos de duas accounts ativas
THEN o sistema deve explicar que são necessárias duas contas e manter o submit desabilitado.

### REQ-003 - Montar O Payload Correto

WHEN uma transferência válida for submetida
THE SYSTEM SHALL enviar `accountId`, `destinationAccountId`, `type=TRANSFER`, `status`, `amountCents`, `date` e descrição normalizada quando informada.

THE SYSTEM SHALL NOT enviar `categoryId`, `direction` ou `userId`.

Exemplo:

```json
{
  "accountId": "origin-account-id",
  "destinationAccountId": "destination-account-id",
  "type": "TRANSFER",
  "status": "EFFECTIVE",
  "amountCents": 5000,
  "date": "2026-07-22",
  "description": "Reserva mensal"
}
```

### REQ-004 - Preservar A Neutralidade Financeira

WHEN uma transferência for exibida
THE SYSTEM SHALL apresentá-la como movimentação neutra, sem sinal de receita ou despesa e sem usar `state-income` ou `state-expense` como significado principal.

THE SYSTEM SHALL mostrar origem e destino nos detalhes.

### REQ-005 - Impedir Exclusão

WHEN a transaction for `TRANSFER`
THE SYSTEM SHALL ocultar ou manter indisponível a ação de excluir e explicar que a correção ocorre por transferência inversa.

IF a API retornar `TRANSACTION_CANNOT_DELETE_TRANSFER`
THEN o frontend deve usar a mensagem segura e acionável já definida no contrato de erros.

### REQ-006 - Corrigir A Digitação Monetária

WHEN o usuário digitar somente dígitos em qualquer input monetário de produto
THE SYSTEM SHALL interpretar a sequência como centavos e manter a apresentação em BRL.

WHEN um valor monetário existente for carregado para edição
THE SYSTEM SHALL preservar exatamente seu inteiro em centavos.

WHEN o formulário for submetido
THE SYSTEM SHALL enviar o inteiro em centavos exibido, sem perda de precisão ou conversão por float.

### REQ-007 - Tratar Erros Sem Perder Dados

WHEN `VALIDATION_ERROR.details.fields` for retornado
THE SYSTEM SHALL mapear `amountCents`, `date`, `accountId`, `destinationAccountId`, `description`, `status` e `type` para os campos correspondentes.

WHEN ocorrer `INVALID_TRANSACTION` ou `TRANSACTION_ACCOUNT_UNAVAILABLE`
THE SYSTEM SHALL manter o sheet aberto, preservar todos os valores e apresentar recuperação próxima ao formulário.

WHEN ocorrer erro de rede, desconhecido ou servidor
THE SYSTEM SHALL preservar os dados e permitir uma nova tentativa segura.

### REQ-008 - Atualizar Dados Dependentes

WHEN create, update ou confirm tiver sucesso
THE SYSTEM SHALL invalidar as queries de transactions e accounts já usadas pelo módulo.

## Estados E Edge Cases

- Nenhuma account ativa: mostrar estado explicativo e submit indisponível.
- Apenas uma account ativa: explicar que é necessária outra conta de destino.
- Account arquivada entre carregamento e submit: tratar `TRANSACTION_ACCOUNT_UNAVAILABLE`, preservar dados e atualizar opções quando solicitado.
- Origem alterada para a account que era destino: limpar destino e exigir nova escolha.
- Valor vazio ou zero: erro de campo; não enviar mutation.
- Valor muito grande ou fora de inteiro seguro: rejeitar localmente com mensagem clara.
- Data inválida: erro de campo; preservar a string civil válida anterior quando aplicável.
- Descrição composta apenas por espaços: normalizar para `null`/omitir conforme o DTO atual.
- Intent `create=TRANSFER` inválido ou repetido: consumir uma vez; refresh após replace não deve reabrir o sheet.
- Transferência pendente: não afeta saldo atual até confirmação.
- Transferência retornada com category técnica: o frontend pode exibir `Transferência`, mas nunca reutiliza esse `categoryId` em create/update/confirm.

## Acessibilidade E UX

- Sheet, selects, botões e mensagens devem funcionar por teclado e leitor de tela.
- Origem e destino devem ter labels distintos e não depender apenas da ordem visual.
- Todos os alvos de toque devem respeitar o mínimo de 44 px.
- O submit deve indicar pending e permanecer desabilitado durante a mutation.
- Erros de campo precisam usar associação semântica e foco no primeiro campo inválido.
- O tom visual da transferência deve usar tokens neutros/`state-info`; cor não pode ser o único indicador.
- Valores monetários devem usar a classe `numeric`.

## Critérios De Aceite

- A view `Transferências` possui ação funcional para criar transferência.
- O atalho mobile de transferência deixa de estar desabilitado e abre o mesmo sheet.
- Criação, edição e confirmação usam duas contas ativas e impedem origem igual ao destino.
- O payload de `TRANSFER` não contém `categoryId`, `direction` ou `userId`.
- O payload usa `amountCents` inteiro positivo e `date` literal `YYYY-MM-DD`.
- Transferências aparecem apenas quando a consulta inclui `type=TRANSFER`, conforme o contrato backend.
- Detalhes exibem origem e destino; exclusão não é oferecida como ação válida.
- Digitar `123` em cada input monetário abrangido resulta em `R$ 1,23` sem digitar vírgula.
- Create/edit/confirm e saldo inicial preservam centavos exatos em load, edição e submit.
- Erros bloqueantes aparecem via `ApiErrorAlert`, field errors são aplicados e valores não são apagados.
- Testes unitários e de componente cobrem invariantes de payload, contas e moeda.
- Testes de navegador cobrem o atalho mobile e o fluxo de criação em mobile e desktop.
- `npm run lint`, testes focados e `npm run build` passam após a implementação.

## Gate De Aprovação

Esta spec foi aprovada explicitamente pelo usuário em 2026-07-22. A implementação deve seguir `design.md` e manter `tasks.md` atualizado.
