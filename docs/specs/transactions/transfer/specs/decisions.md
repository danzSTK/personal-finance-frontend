---
area: transactions
feature: transfer
type: spec-decisions
status: current
related:
  - ./requirements.md
  - ./design.md
  - ./tasks.md
---

# Decisions - Transferências Entre Contas

## DEC-001 - Reutilizar O Recurso Transaction Existente

Status: accepted

Decision:
A transferência será criada, editada, confirmada e listada pelos endpoints existentes de `/transactions`, usando `type=TRANSFER`.

Reason:
O backend já implementa o contrato, atomicidade, ownership, category técnica e impacto em saldos. Um endpoint frontend ou backend separado duplicaria regras.

Impact:
O frontend estende tipos, estados e UI existentes, sem migration nem novo client de API.

## DEC-002 - Representar Origem E Destino Em Uma Única Transaction

Status: accepted

Decision:
`accountId` representa origem e `destinationAccountId` representa destino.

Reason:
É a modelagem pública atual do backend e mantém a transferência atômica em um único recurso.

Impact:
Todos os fluxos devem carregar e validar os dois IDs, e filtros por account podem encontrar a account como origem ou destino.

## DEC-003 - Nunca Enviar Categoria Técnica

Status: accepted

Decision:
Create, update e confirm de `TRANSFER` omitem `categoryId`; o backend resolve a category técnica.

Reason:
Categories técnicas não são gerenciáveis nem devem ser conhecidas como opção de produto pelo frontend.

Impact:
O formulário não renderiza categoria para transferência. Um `categoryId` retornado só pode apoiar leitura interna e não volta em mutations.

## DEC-004 - Reutilizar O Mesmo Sheet De Transactions

Status: accepted

Decision:
Receita, despesa e transferência usam `TransactionFormSheet`, com campos e copy derivados do type.

Reason:
Os fluxos compartilham valor, status, data, conta, descrição, mutations, erros e comportamento responsivo.

Impact:
O organism ganha variantes tipadas, mas não surge um formulário paralelo que possa divergir.

## DEC-005 - Digitação Monetária Começa Nos Centavos

Status: accepted

Decision:
Todo input monetário editável de produto usa deslocamento por dígitos a partir dos centavos e mantém inteiro em centavos como valor canônico.

Reason:
O usuário não deve precisar digitar vírgula, e o domínio/API já usa `*Cents`. Isso evita parsing decimal ambíguo e diferenças entre formulários.

Impact:
Será criado um `CurrencyInput` compartilhado e migrados transaction create/edit, transaction confirm e account initial balance. Testes fixam `123 -> R$ 1,23`.

## DEC-006 - Excluir A Origem Das Opções De Destino

Status: accepted

Decision:
Depois de selecionar uma origem, o select de destino não apresenta a mesma account.

Reason:
Previne reconhecimento de uma combinação inválida antes do submit e reduz erro sem substituir a validação Zod/backend.

Impact:
Trocar a origem para o destino atual limpa o destino e exige nova escolha.

## DEC-007 - Preservar Status Pending E Effective

Status: accepted

Decision:
Transferências usam o mesmo controle de situação das demais transactions e iniciam como `EFFECTIVE` por padrão.

Reason:
O contrato backend suporta transferência planejada e efetiva, e a solicitação pede o mesmo modelo de cadastro atual.

Impact:
Transferência pending pode ser confirmada depois; a confirmação precisa preservar a invariância entre origem e destino.

## DEC-008 - Não Verificar Saldo Suficiente No Frontend

Status: accepted

Decision:
O frontend não bloqueia uma transferência quando o saldo exibido da origem é menor que o valor.

Reason:
Essa regra não existe no contrato atual e saldos podem envolver projeções ou política de saldo negativo. Inventá-la no frontend criaria divergência.

Impact:
Somente as invariantes documentadas são validadas; qualquer futura regra de saldo exige atualização de requirements e backend contract.

## DEC-009 - Transferência Não Pode Ser Excluída

Status: accepted

Decision:
A UI não dispara delete de `TRANSFER` e orienta correção por uma nova transferência inversa.

Reason:
É uma invariante explícita da V0 do backend e preserva histórico das duas accounts.

Impact:
Detalhes precisam explicar a indisponibilidade; não basta apresentar um botão silenciosamente desabilitado.

## DEC-010 - Transferência Usa Semântica Visual Neutra

Status: accepted

Decision:
Transferências usam `ArrowLeftRight`, tokens neutros/`state-info` e valores sem sinal de receita/despesa.

Reason:
Transferência move dinheiro internamente e não muda o resultado financeiro agregado.

Impact:
Não usar verde/income nem vermelho/expense como semântica principal; origem e destino textuais complementam o ícone.

## DEC-011 - Atalho Mobile E View Compartilham Intent De URL

Status: accepted

Decision:
O atalho mobile navega para `view=TRANSFER&create=TRANSFER`, enquanto a view abre o mesmo create state diretamente.

Reason:
O deep link preserva contexto, funciona entre rotas e evita acoplamento do shell ao estado interno da página.

Impact:
O intent é transitório, validado e removido com replace depois de consumido.

## DEC-012 - Nenhuma Mudança De Banco Ou API

Status: accepted

Decision:
A implementação é exclusivamente frontend sobre o contrato backend atual.

Reason:
Schema, endpoint, DTO, category técnica e erros necessários já existem e estão documentados.

Impact:
Se a implementação revelar necessidade de migration ou novo contrato, o trabalho deve parar e esta spec deve ser revisada antes de continuar.

## DEC-013 - Adotar Vitest Para A Cobertura Focada Da Feature

Status: accepted

Decision:
Adicionar Vitest, Testing Library, jest-dom e jsdom como infraestrutura de testes unitários e de componentes do frontend.

Reason:
O repositório ainda não possuía runner configurado, mas a semântica monetária cent-first e os DTOs financeiros precisam de regressão automatizada antes de chegar à API.

Impact:
`npm test` executa a suíte uma vez e `npm run test:watch` mantém o runner ativo. A configuração é compartilhada e não altera o runtime de produção.
