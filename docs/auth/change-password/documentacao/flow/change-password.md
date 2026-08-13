---
area: auth
feature: change-password
type: documentation-flow
status: current
related:
  - ../decisions/email-provider-gate.md
  - ../decisions/operational-status-gate.md
  - ../decisions/absolute-retry-deadline.md
  - ../decisions/terminal-success.md
  - ../components/change-password-dialog.md
---

# Alterar senha local

## Entrada e envio

Em `/settings/security`, provider `EMAIL` torna a alteração aplicável e dispara
`GET /auth/password/change/status`. O trigger permanece visível e desabilitado
durante loading, falha ou `status: false`; somente `status: true` permite abrir
o dialog.

Quando indisponível, o `Retry-After` válido é convertido em deadline absoluto e
data/hora local. Ao fim do prazo, o frontend refaz somente o `GET`; o relógio
local não libera a ação sem uma nova resposta permissiva. Header ausente ou
inválido não cria prazo e oferece verificação manual. O motivo da restrição não
é exibido.

Depois de aberto, o dialog foca `Senha atual`, valida três campos com schema
central de 6–50, impede nova igual à atual e exige confirmação. O request contém
somente `currentPassword` e `newPassword`; a mutation não tem retry automático.

## Falhas e recuperação

- `VALIDATION_ERROR` mapeia campos documentados.
- `CURRENT_PASSWORD_INVALID` foca senha atual; `NEW_PASSWORD_MUST_DIFFER` foca
  a nova senha.
- códigos temporários mostram alerta/countdown e bloqueiam submit pelo deadline.
- falha no status mostra `ApiErrorAlert` junto ao trigger, mantém a ação
  desabilitada e permite repetir apenas a consulta idempotente.
- provider required invalida usuário; verification required segue a página
  pendente; 401/usuário ausente encerram estado local.
- falhas recuperáveis preservam valores; cancelar/desmontar/sucesso os removem.

Pending impede Escape, backdrop, fechar e Cancelar. Fora de pending, fechamento
limpa o formulário e devolve foco ao trigger.

## Backend consumido

| Operação                           | Autenticação  | Contrato relevante                                          | Efeito/cache                               | Erros e recuperação                                                                           | Fonte                                               |
| ---------------------------------- | ------------- | ----------------------------------------------------------- | ------------------------------------------ | --------------------------------------------------------------------------------------------- | --------------------------------------------------- |
| `GET /users/me`                    | cookie        | providers/status                                            | gate e ressincronização                    | erro: sem ação; provider stale: invalidar                                                     | `backend/docs/integrations/auth/get-me.md`          |
| `GET /auth/password/change/status` | access cookie | `status` boolean; `Retry-After` somente quando indisponível | query própria; reconsulta no deadline/foco | `503` ou falha: ação bloqueada e retry manual; `status: false`: data local sem revelar motivo | `backend/docs/integrations/auth/change-password.md` |
| `POST /auth/password/change`       | access cookie | duas senhas; `CHANGED`                                      | revoga todas as sessões; limpa auth/cache  | field, provider, verificação, 429, 503 e sessão terminal                                      | `backend/docs/integrations/auth/change-password.md` |

Nenhum valor de senha entra em store, cache, URL, storage ou log.
