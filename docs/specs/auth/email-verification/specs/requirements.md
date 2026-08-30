---
area: auth
feature: email-verification
type: spec-requirements
status: current
related:
  - ./design.md
  - ./tasks.md
  - ./decisions.md
  - ../../../../../../personal-finance-backend/docs/integrations/auth/email-verification.md
---

# Requisitos — verificação de email e status de reenvio

## Objetivo

Permitir que usuários com status `PENDING_EMAIL_VERIFICATION` acompanhem o estado de verificação na rota autenticada `/email-verification-pending`, consultem a disponibilidade operacional do reenvio através de polling no endpoint `GET /auth/email-verification/resend/status`, iniciem a contagem regressiva de segurança a partir do `Retry-After` recebido no primeiro acesso ou polling, e tenham uma interface clara, limpa e acessível que destaque a proteção de reenvio.

## Fontes de verdade

- `AGENTS.md`.
- `.agents/skills/spec-driven-development/SKILL.md`.
- `.agents/skills/danfy-api-error-handling/SKILL.md`.
- `.agents/skills/danfy-finance-design-system/SKILL.md`.
- `.agents/skills/material-3-ui-guidance/SKILL.md`.
- `docs/design-system/danfy-finance-design-system.md`.
- `docs/design-system/material-3-reference.md`.
- `../personal-finance-backend/docs/integrations/auth/email-verification.md`.
- `../personal-finance-backend/docs/integrations/auth/get-me.md`.
- `../personal-finance-backend/docs/integrations/errors.md`.

## Escopo

- Consultar `GET /auth/email-verification/resend/status` via TanStack Query com polling ativo na tela `/email-verification-pending`.
- Iniciar e manter o contador de tempo de espera (cooldown/bloqueio) a partir de `Retry-After` / `retryAfterSeconds` em uma nova entrada na página.
- Detectar status `ALREADY_VERIFIED` pelo polling, sincronizar o perfil com `GET /users/me` e redirecionar ao fluxo autorizado sem exigir ação manual ou recarregamento de página.
- Ajustar a estrutura visual do `PendingEmailVerificationPanel`:
  - Remover o container com o ícone de email que existia acima do título "Confirme sua identidade pelo email".
  - Remover o grid anterior de dois cards de orientação ("Confira sua caixa de entrada" e o card antigo).
  - Incluir o card com a informação destacada:
    - Título: `Reenvio protegido`
    - Descrição: `Você pode solicitar um novo email respeitando o intervalo de segurança e o limite diário.`
- Mapear o código `EMAIL_VERIFICATION_STATE_UNAVAILABLE` (503) e demais erros conhecidos no catálogo compartilhado.
- Atualizar a documentação viva e testes unitários/integração.

## Fora de escopo

- Alterações nas regras ou endpoints do backend.
- Verificação para provedores OAuth (Google/Apple).
- Alteração do fluxo de confirmação pública em `/verification-email?token=...`.

## Requisitos funcionais

### REQ-001 — Consulta e polling de status de reenvio

WHEN o usuário estiver na rota `/email-verification-pending` com status `PENDING_EMAIL_VERIFICATION`
THE SYSTEM SHALL consultar `GET /auth/email-verification/resend/status` e realizar polling periódico com intervalo controlado.

### REQ-002 — Inicialização do contador via Retry-After

WHEN a resposta do status contiver `status: "BLOCKED"` e/ou o cabeçalho `Retry-After` / campo `retryAfterSeconds`
THE SYSTEM SHALL calcular o deadline absoluto (`retryAtMs`) e iniciar a contagem regressiva visível no botão/painel até o término do bloqueio.

### REQ-003 — Transição automática para verificado

WHEN o polling de status retornar `status: "ALREADY_VERIFIED"`
THE SYSTEM SHALL buscar os dados atualizados com `GET /users/me`, atualizar o store de autenticação e redirecionar o usuário para a rota autorizada (`/dashboard`).

### REQ-004 — Reenvio manual e atualização de status

WHEN o usuário clicar em `Reenviar email` e a mutação retornar `QUEUED`
THE SYSTEM SHALL invalidar a query de status para obter os novos parâmetros de bloqueio/cooldown imediatamente.

IF a mutação retornar `ALREADY_VERIFIED`
THEN o sistema deve atualizar o perfil e redirecionar para o dashboard.

IF a mutação falhar com 429 (`EMAIL_VERIFICATION_COOLDOWN_ACTIVE`, `EMAIL_VERIFICATION_DAILY_LIMIT_EXCEEDED` ou `TOO_MANY_REQUESTS`)
THEN o sistema deve extrair o `Retry-After` retornado e atualizar a contagem regressiva.

### REQ-005 — Simplificação visual do painel pendente

THE SYSTEM SHALL NOT exibir ícone decorativo de email antecedendo o título principal da seção.
THE SYSTEM SHALL exibir a mensagem de orientação em card único com o título "Reenvio protegido" e a descrição "Você pode solicitar um novo email respeitando o intervalo de segurança e o limite diário.".

## Critérios de aceite

- Ao acessar `/email-verification-pending`, se houver cooldown ativo no backend, o contador exibe o tempo restante derivado de `Retry-After`.
- O polling atualiza o estado sem disparar toasts ou interferir na interação do usuário.
- Se o usuário confirmar o email em outra aba/dispositivo, a página detecta `ALREADY_VERIFIED` e navega automaticamente para o dashboard.
- O título "Confirme sua identidade pelo email" é exibido sem o ícone anterior no topo.
- O painel exibe o card único de "Reenvio protegido" com as cores semânticas de Danfy tokens e sem paletas cruas.
- `npm run lint`, `npm test` e `npm run build` passam com 100% de sucesso.
