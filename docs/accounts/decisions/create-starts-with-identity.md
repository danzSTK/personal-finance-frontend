---
area: accounts
type: decision
status: current
decision-id: DEC-002
decision-status: accepted
related:
  - ../README.md
  - ../flows/create-and-update-account.md
  - ../components/account-components.md
  - ../../specs/accounts/account-templates-flow/specs/decisions.md
---

# Criação começa pela identidade da conta

## Problema

Identidade institucional e identidade personalizada exigem campos diferentes. Mostrar todas as opções no mesmo formulário aumentaria a carga de decisão, especialmente no mobile, e permitiria combinações inválidas de `template` com campos legados.

## Decisão

Abrir `+ Nova conta` na etapa de escolha entre o catálogo de templates institucionais (`AccountTemplatePicker`) e `Criar personalizada`. A seleção avança com transição direcional de `200ms` (removida sob `prefers-reduced-motion`) e foco programático para o formulário apropriado:
- institucional pré-preenche `name` com `template.name` editável;
- personalizada expõe os pickers de cor e ícone (`CustomAccountIdentityFields`).

Na edição (`mode: 'edit'`), a classe visual não é alterada e `initialBalanceCents` permanece somente leitura.

## Consequência

- O usuário decide primeiro a identidade e recebe apenas os campos aplicáveis.
- A UI nunca envia `template` junto de `color`/`icon` na raiz (`ACCOUNT_TEMPLATE_INPUT_CONFLICT` evitado por construção).
- Ao voltar à etapa 1 e selecionar uma nova identidade, `form.reset(...)` reinicia os campos com os defaults da escolha selecionada.
