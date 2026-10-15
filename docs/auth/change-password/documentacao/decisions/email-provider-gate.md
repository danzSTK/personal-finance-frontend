---
area: auth
feature: change-password
type: documentation-decision
status: current
decision-id: DEC-001
decision-status: accepted
related:
  - ../../../providers/documentacao/decisions/provider-derived-capability.md
  - ./operational-status-gate.md
  - ../flow/change-password.md
  - ../components/change-password-dialog.md
  - ../../../../specs/auth/change-password/specs/decisions.md
---

# Alteração condicionada ao provider EMAIL

## Problema

Uma conta exclusivamente OAuth não possui senha local para validar ou alterar;
mostrar o formulário criaria uma ação impossível.

## Decisão

`SecuritySettings` compõe `ChangePasswordDialog` somente quando
`GET /users/me.providers[]` contém `EMAIL`. `EMAIL+GOOGLE` é permitido. Sem
`EMAIL`, a UI oferece vínculo; loading e erro não inferem capacidade.
Para contas com `EMAIL`, essa decisão confirma apenas a existência da credencial;
a disponibilidade temporal é definida separadamente pela consulta de status.

## Consequência

O frontend ainda trata `PASSWORD_CHANGE_EMAIL_PROVIDER_REQUIRED` como defesa
contra estado stale, invalida o perfil e retorna à orientação de providers.
