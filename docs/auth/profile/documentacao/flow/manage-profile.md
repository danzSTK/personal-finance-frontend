---
area: auth
feature: profile
type: documentation-flow
status: current
related:
  - ../decisions/separate-profile-operations.md
  - ../components/profile-editor.md
---

# Gerenciar perfil, username e avatar

`/settings/account` carrega `GET /users/me`. Nomes e username têm formulários
separados; availability é feedback preventivo e 409 continua autoridade. Avatar
passa por seleção/câmera, crop e validação antes do multipart. Remoção é
idempotente. Sucessos atualizam store/query imediatamente e invalidam perfil.

Perfil trata `USER_UPDATE_INPUT_VOID`/`INVALID_USER`; username trata
`INVALID_USERNAME_FORMAT`/`USERNAME_ALREADY_EXISTS`; avatar trata tamanho,
payload, formato, imagem inválida e upload indisponível pelos códigos centrais.

## Backend consumido

| Operação | Autenticação | Contrato relevante | Efeito/cache | Erros e recuperação | Fonte |
| --- | --- | --- | --- | --- | --- |
| `GET /users/me` | cookie | perfil + `avatarUrl` | fonte da página/shell | alert/retry | `backend/docs/integrations/auth/get-me.md` |
| `PATCH /users/me` | cookie | somente nomes alterados | substitui perfil em cache/store | field errors | `backend/docs/integrations/users/update-user-profile.md` |
| `GET /users/usernames/:username/availability` | cookie | boolean de disponibilidade | query curta | permitir nova checagem | `backend/docs/integrations/users/update-username.md` |
| `PUT /users/me/username` | cookie | username | substitui perfil | 409/formato/429 | mesma fonte |
| `PUT /users/me/avatar` | cookie multipart | file até 5 MB | atualiza `avatarUrl` | tamanho/formato/processamento | `backend/docs/integrations/users/update-user-avatar.md` |
| `DELETE /users/me/avatar` | cookie | sem body, idempotente | define avatar null | 429/401 | `backend/docs/integrations/users/remove-user-avatar.md` |
