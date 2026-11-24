---
area: auth
type: decision
status: current
last_reviewed: 2026-11-24
decision-id: DEC-AUTH-009
decision-status: accepted
related:
  - ../README.md
  - ./provider-derived-capability.md
  - ./operational-status-gate.md
  - ../flows/change-password.md
  - ../components/change-password-dialog.md
  - ../../specs/auth/change-password/specs/decisions.md
---

# DEC-AUTH-009: Alteração condicionada ao provider EMAIL

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
