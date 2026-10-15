---
area: auth
feature: email-verification
type: spec-tasks
status: current
related:
  - ./requirements.md
  - ./design.md
  - ./decisions.md
---

# Tarefas — status de reenvio e ajustes visuais

- [x] Definir constantes de rota/query key e tipos de status de reenvio (`EmailVerificationResendStatusResponse`, `EmailVerificationResendAvailability`).
- [x] Mapear `EMAIL_VERIFICATION_STATE_UNAVAILABLE` em `apiErrorCodes.ts` e `resolveApiError.ts`.
- [x] Implementar utilitários `parseEmailVerificationResendStatusResponse` e `buildEmailVerificationResendAvailability` com testes unitários.
- [x] Criar query hook `useEmailVerificationResendStatus` com suporte a polling autenticado e testes.
- [x] Atualizar `PendingEmailVerificationPanel`:
  - [x] Remover o ícone/badge de email antes do título "Confirme sua identidade pelo email".
  - [x] Substituir o grid anterior pelo card destacado com o título "Reenvio protegido" e texto explicativo.
  - [x] Atualizar o botão de reenvio para exibir o tempo formatado com precisão durante o bloqueio/cooldown.
- [x] Atualizar `PendingEmailVerificationPage`:
  - [x] Habilitar polling contínuo da query de status.
  - [x] Iniciar contagem regressiva a partir do `Retry-After` recebido no acesso inicial ou polling.
  - [x] Sincronizar usuário e redirecionar automaticamente para `/dashboard` em caso de `ALREADY_VERIFIED`.
  - [x] Revalidar query e atualizar timers ao executar mutação de reenvio.
- [x] Atualizar a documentação viva em `docs/auth/email-verification/documentacao/`.
- [x] Validar testes unitários, testes de integração, lint e build.


