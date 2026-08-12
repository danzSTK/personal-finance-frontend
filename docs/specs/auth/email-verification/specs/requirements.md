---
area: auth
feature: email-verification
type: spec-requirements
status: historical
reconstructed-from: legacy:email-verification/design.md
related:
  - ./design.md
  - ./tasks.md
  - ./decisions.md
---

# Requisitos históricos — verificação de email

Reconstrução verificável da spec original, sem declarar aprovação retroativa.

## Objetivo preservado

Representar `PENDING_EMAIL_VERIFICATION`, confirmar tokens em rota pública,
permitir reenvio autenticado e impedir acesso financeiro até o usuário estar
verificado.

## Escopo preservado

- `/verification-email?token=...` para confirmação;
- `/email-verification-pending` para orientação e reenvio;
- `POST /auth/email-verification/confirm` e `/resend`;
- cooldown, limite diário e estados já verificado/bloqueado;
- redirect pós-login/sign-up conforme status do usuário;
- feedback acessível sem expor token ou mensagem técnica.
