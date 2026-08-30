---
area: accounts
feature: account-templates
type: documentation-decision
status: current
decision-id: DEC-002
decision-status: accepted
related:
  - ../flow/create-and-update-account.md
  - ../../../../specs/accounts/account-templates-flow/specs/decisions.md
---

# Criação começa pela identidade da conta

## Problema

Identidade institucional e identidade personalizada exigem campos diferentes.
Mostrar todas as opções no mesmo formulário aumentaria a carga de decisão,
especialmente no mobile, e permitiria combinações inválidas de template com os
campos legados.

## Decisão

Abrir `+ Nova conta` na escolha entre um template institucional e `Criar
personalizada`. A seleção avança para o formulário apropriado. Institucional
preenche o nome da instituição como default editável; personalizada expõe cor e
ícone. A transição interna dura 200 ms e é removida para reduced motion.

## Consequência

O usuário decide primeiro a identidade e recebe somente os campos aplicáveis.
Voltar preserva os dados durante a sessão do sheet; fechar e reabrir inicia um
novo fluxo. A UI nunca envia `template` junto de `color`/`icon` na raiz.
