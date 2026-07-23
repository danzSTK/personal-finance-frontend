---
area: transactions
feature: transfer
type: spec-tasks
status: current
related:
  - ./requirements.md
  - ./design.md
  - ./decisions.md
---

# Tasks - Transferências Entre Contas

## Regra De Execução

As tarefas abaixo só podem iniciar depois da aprovação explícita de `requirements.md`, `design.md` e deste arquivo. Durante a implementação, marque cada item concluído e atualize a spec antes de qualquer mudança material de regra ou design.

## 0. Spec E Aprovação

- [x] 0.1 Ler a skill de Spec-Driven Development e o modelo dos quatro arquivos.
- [x] 0.2 Ler o contrato completo de integrations de transactions, accounts, erros e DateOnly no backend.
- [x] 0.3 Mapear os módulos frontend `transactions`, `accounts`, `auth` e `shared` afetados.
- [x] 0.4 Criar `requirements.md`, `design.md`, `tasks.md` e `decisions.md`.
- [x] 0.5 Revisar e aprovar requirements, design e tasks com o usuário.

## 1. Testes De Contrato Monetário

- [x] 1.1 Criar testes unitários que fixem a semântica cent-first: `1 -> 1`, `12 -> 12`, `123 -> 123` centavos.
- [x] 1.2 Cobrir backspace, campo vazio, zero, paste formatado/não formatado e limite de inteiro seguro.
- [x] 1.3 Cobrir formatação BRL e round-trip de valores existentes sem perda de centavos.

## 2. CurrencyInput Compartilhado

- [x] 2.1 Criar `src/shared/components/atoms/CurrencyInput.tsx` com contrato controlado por centavos e suporte a ref/acessibilidade.
- [x] 2.2 Implementar digitação e paste por dígitos, formatação BRL, caret previsível, `inputMode="numeric"` e classe `numeric`.
- [x] 2.3 Rejeitar valores acima de `Number.MAX_SAFE_INTEGER` sem corromper o valor anterior.
- [x] 2.4 Adicionar testes de componente para teclado, paste, backspace, disabled, erro e ref.

## 3. Migrar Todos Os Inputs Monetários De Produto

- [x] 3.1 Migrar `TransactionFormSheet` de string decimal para `amountCents` inteiro no form state.
- [x] 3.2 Migrar `TransactionConfirmSheet` para o mesmo contrato.
- [x] 3.3 Migrar o saldo inicial de `AccountFormSheet` e remover o estado/display manual paralelo.
- [x] 3.4 Atualizar schemas e builders para consumir centavos diretamente, sem parsing por float ou vírgula no submit.
- [x] 3.5 Remover usos de produto obsoletos de `MaskedInput`/`currencyInputToCents` e manter apenas compatibilidade realmente necessária.
- [x] 3.6 Executar testes de regressão de receita, despesa, confirmação e criação de account com `R$ 0,01`, `R$ 1,23` e `R$ 1.234,56`.

## 4. Tipos, URL E Entradas De Transferência

- [x] 4.1 Expandir o create state tipado para aceitar `TRANSFER` sem `any` ou assertion ampla.
- [x] 4.2 Expandir o parser de `create` para aceitar `TRANSFER` e manter fallback seguro para valores inválidos.
- [x] 4.3 Adicionar `AUTH_QUICK_ACTION_ROUTES.transfer` com `view=TRANSFER&create=TRANSFER`.
- [x] 4.4 Ativar o item Transferência em `MobileQuickActions`, remover `Em breve` e conectar a navegação.
- [x] 4.5 Permitir `Nova transferência` no toolbar e no empty state da view `TRANSFER`.
- [x] 4.6 Testar consumo único do intent e remoção por replace sem reabrir no refresh/back.

## 5. Schema E DTOs De Transferência

- [x] 5.1 Adicionar testes do schema para origem/destino obrigatórios, distintos e amount inteiro positivo.
- [x] 5.2 Garantir que category continue obrigatória somente para `INCOME`/`EXPENSE`.
- [x] 5.3 Garantir que `direction` seja ausente para `TRANSFER`.
- [x] 5.4 Adicionar testes do create DTO com payload exato e omissão de `categoryId`, `direction` e `userId`.
- [x] 5.5 Adicionar testes de update e confirm para mudanças de origem/destino e preservação do próximo estado válido.

## 6. Formulário De Criação/Edição

- [x] 6.1 Adaptar título, supporting text, labels e submit para `TRANSFER`.
- [x] 6.2 Reordenar campos de transferência para valor, situação, data, origem, destino e descrição.
- [x] 6.3 Reutilizar `AccountSelectLabel` para ambos os selects.
- [x] 6.4 Filtrar somente accounts ativas e excluir a origem das opções de destino.
- [x] 6.5 Limpar o destino quando uma mudança de origem o tornar inválido.
- [x] 6.6 Implementar estado explícito para menos de duas accounts ativas e desabilitar submit.
- [x] 6.7 Garantir que categoria e direção não sejam renderizadas nem enviadas.
- [x] 6.8 Ajustar feedback de sucesso para `Transferência registrada` sem duplicar mutation.
- [x] 6.9 Criar testes de componente mobile e desktop do sheet.

## 7. Confirmação De Transferência Pendente

- [x] 7.1 Expandir os valores/schema de confirmação para compreender origem e destino quando o type for `TRANSFER`.
- [x] 7.2 Mostrar os dois selects com opções ativas e invariantes iguais às do create/edit.
- [x] 7.3 Montar o confirm DTO sem category técnica e sem direction.
- [x] 7.4 Preservar o fluxo atual de confirmação de receitas e despesas.
- [x] 7.5 Testar confirmação válida, contas iguais, conta indisponível e transaction já efetivada.

## 8. Listagem, Detalhes E Exclusão

- [x] 8.1 Verificar que a view `TRANSFER` sempre consulta com `type=TRANSFER` e interpreta `transaction_summary.type`.
- [x] 8.2 Verificar cards/linhas mobile e desktop com ícone neutro, sem sinal de receita/despesa.
- [x] 8.3 Rotular explicitamente conta de origem e conta de destino nos detalhes.
- [x] 8.4 Substituir delete desabilitado sem contexto por explicação de transferência inversa.
- [x] 8.5 Garantir que nenhuma UI dispare `DELETE` para uma transferência.

## 9. Erros E Recuperação

- [x] 9.1 Revisar `apiErrorCodes.ts` e manter somente códigos estáveis documentados.
- [x] 9.2 Mapear `VALIDATION_ERROR.details.fields` para amount, data, origem, destino, descrição, status e type.
- [x] 9.3 Validar `ApiErrorAlert` para `INVALID_TRANSACTION` e `TRANSACTION_ACCOUNT_UNAVAILABLE`, preservando valores.
- [x] 9.4 Validar recuperação de `TRANSACTION_NOT_FOUND`, `TRANSACTION_UPDATE_EMPTY` e `TRANSACTION_ALREADY_EFFECTIVE`.
- [x] 9.5 Cobrir rede, unknown, 401 e 5xx sem expor mensagens técnicas.
- [x] 9.6 Confirmar que transfer errors não dependem de category técnica no frontend.

## 10. Cache E Regressão Cross-Module

- [x] 10.1 Confirmar invalidação da raiz de transactions após create/update/confirm.
- [x] 10.2 Confirmar invalidação de accounts, summaries e saldos projetados afetados.
- [x] 10.3 Testar que receita, despesa e account creation continuam enviando os mesmos contratos, exceto pela melhora cent-first.
- [x] 10.4 Confirmar que filtros e deep links existentes não regrediram.

## 11. QA, Acessibilidade E Documentação

- [x] 11.1 Testar teclado, leitor de tela, foco inicial, Escape, backdrop e retorno de foco nos sheets.
- [x] 11.2 Testar touch targets, safe area, teclado numérico e scroll no mobile.
- [x] 11.3 Executar E2E do atalho mobile e da view de transferências com API mockada.
- [x] 11.4 Inspecionar payloads de create/update/confirm e comprovar ausência de category/direction/userId.
- [x] 11.5 Atualizar `decisions.md` com trade-offs descobertos durante a implementação.
- [x] 11.6 Atualizar documentação ampla da tela se o comportamento final divergir da spec anterior.
- [x] 11.7 Executar testes focados, `npm run lint` e `npm run build`.
- [x] 11.8 Fazer revisão final contra todos os critérios de aceite de `requirements.md`.
