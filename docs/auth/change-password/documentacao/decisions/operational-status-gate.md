---
area: auth
feature: change-password
type: documentation-decision
status: current
decision-id: DEC-004
decision-status: accepted
related:
  - ./email-provider-gate.md
  - ./absolute-retry-deadline.md
  - ../flow/change-password.md
  - ../components/change-password-dialog.md
  - ../../../../specs/auth/change-password/specs/decisions.md
---

# Status operacional antes de liberar a alteração

## Problema

O provider `EMAIL` confirma que existe uma credencial local, mas não informa se
uma restrição temporal impede a alteração naquele momento. Habilitar a ação
somente pelo perfil transfere um bloqueio já conhecido para depois do
preenchimento do formulário.

## Decisão

Depois de confirmar provider `EMAIL`, o frontend consulta
`GET /auth/password/change/status`. Somente `status: true` habilita o trigger.
Loading, erro, payload inválido e `status: false` mantêm a ação desabilitada.

Quando `status: false` possui `Retry-After` inteiro positivo, o frontend calcula
um deadline absoluto, apresenta a data e hora no fuso local do usuário e agenda
uma nova consulta. O relógio local nunca habilita a ação sozinho; um novo
`status: true` é obrigatório. O motivo da restrição não é inferido nem exibido.

## Consequência

A interface falha de forma fechada e evita um formulário previsivelmente
bloqueado. Existe uma consulta idempotente adicional apenas para contas com
senha local. O `POST` continua reavaliando todas as regras porque o estado pode
mudar depois do `GET`.
