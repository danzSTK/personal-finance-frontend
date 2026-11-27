---
area: auth
type: index
status: current
last_reviewed: 2026-11-27
related:
  - ../README.md
  - ../architecture/module-boundaries.md
  - ../architecture/api-error-handling.md
  - ./concepts/session-and-cookie-model.md
  - ./concepts/verification-and-provider-states.md
  - ./flows/authenticated-shell-routing.md
  - ./flows/sign-in.md
  - ./flows/sign-up.md
  - ./flows/oauth-google.md
  - ./flows/email-verification.md
  - ./flows/session-lifecycle.md
  - ./flows/link-providers.md
  - ./flows/change-password.md
  - ./flows/manage-profile.md
  - ./reference/api-and-routes.md
---

# Módulo `auth`

O módulo `auth` é a base de identidade, autenticação, sessões, verificação de e-mail, segurança de conta e perfil da Danfy Finance. Ele também hospeda hoje o shell autenticado (`AuthAppShell`), as configurações (`/settings/*`), o cliente HTTP compartilhado (`auth.api.ts`), o registro global de rotas (`AUTH_ROUTES`) e o `DashboardPage` (dívidas arquiteturais registradas em [module-boundaries.md](../architecture/module-boundaries.md)).

Todo o código proprietário reside em `src/features/auth/`, com instruções locais em `src/features/auth/AGENTS.md`.

## Mapa da Documentação

### Conceitos (`concepts/`)
- [Modelo de Sessão, Cookies HttpOnly e Sincronização](./concepts/session-and-cookie-model.md) — `GET /users/me`, `withCredentials: true`, fila de refresh `401`, `useAuthStore` e sincronização entre abas.
- [Estados de Verificação e Capacidades por Provider](./concepts/verification-and-provider-states.md) — `ACTIVE` vs. `PENDING_EMAIL_VERIFICATION` vs. `BLOCKED`, `providers[]`, fail-closed gates e `Retry-After` absoluto.

### Fluxos (`flows/`)
- [Shell Autenticado, Guards e Navegação](./flows/authenticated-shell-routing.md) — Bootstrap da sessão, proteção por status, shell lateral/mobile e seções de `/settings/*`.
- [Entrar com E-mail e Senha](./flows/sign-in.md) — Login por credenciais, resolução de sessão via `/users/me` e tratamento de erros.
- [Criar Conta por Credenciais](./flows/sign-up.md) — Cadastro local, `passwordSchema` (6–50 caracteres) e confirmação local de senha.
- [Login com Google OAuth](./flows/oauth-google.md) — Redirecionamento `/auth/google` e callback `/auth/callback` sem token na URL.
- [Confirmar e Reenviar Verificação de E-mail](./flows/email-verification.md) — Confirmação explícita em `/verification-email`, tela pendente e polling de reenvio.
- [Ciclo de Vida de Sessões](./flows/session-lifecycle.md) — Refresh automático em `401`, listagem/revogação de sessões ativas e logout global entre abas.
- [Vincular Métodos de Acesso (Providers)](./flows/link-providers.md) — Vínculo de `EMAIL` e `GOOGLE` (popup/callback `/auth/link`) guiado por `providers[]`.
- [Alterar Senha Local](./flows/change-password.md) — Gates de provider + status operacional, prazo `Retry-After` e encerramento terminal de sessões.
- [Gerenciar Perfil, Username e Avatar](./flows/manage-profile.md) — Operações independentes de perfil, checagem de disponibilidade de username e upload/remoção de avatar.

### Decisões (`decisions/`)
- [DEC-AUTH-001 — Bootstrap e guards por status de usuário](./decisions/bootstrap-and-status-guards.md)
- [DEC-AUTH-002 — Sessão exclusivamente por cookies HttpOnly](./decisions/session-by-http-only-cookie.md)
- [DEC-AUTH-003 — Confirmação de senha somente no formulário](./decisions/local-password-confirmation.md)
- [DEC-AUTH-004 — Callback OAuth sem token em query string](./decisions/callback-without-token-query.md)
- [DEC-AUTH-005 — Sessão pendente com capacidade limitada](./decisions/pending-session-capability.md)
- [DEC-AUTH-006 — Polling de status de reenvio e `Retry-After`](./decisions/resend-status-polling.md)
- [DEC-AUTH-007 — Ciclo de sessão centralizado e sincronização local](./decisions/cookie-lifecycle-and-local-sync.md)
- [DEC-AUTH-008 — Capacidade derivada estritamente de `providers[]`](./decisions/provider-derived-capability.md)
- [DEC-AUTH-009 — Alteração de senha condicionada ao provider `EMAIL`](./decisions/email-provider-gate.md)
- [DEC-AUTH-010 — Deadline absoluto para bloqueios temporários (`Retry-After`)](./decisions/absolute-retry-deadline.md)
- [DEC-AUTH-011 — Sucesso terminal de troca de senha encerra todas as sessões](./decisions/terminal-success.md)
- [DEC-AUTH-012 — Gate de status operacional antes de liberar troca de senha](./decisions/operational-status-gate.md)
- [DEC-AUTH-013 — Operações de perfil separadas por regra de domínio](./decisions/separate-profile-operations.md)

### Componentes (`components/`)
- [Shell Autenticado e Configurações](./components/shell-and-settings.md)
- [Formulário de Sign-In](./components/sign-in-form.md)
- [Formulário de Sign-Up](./components/sign-up-form.md)
- [Callback de OAuth Google](./components/oauth-callback.md)
- [Painéis de Verificação de E-mail](./components/verification-panels.md)
- [Controles e Estado de Sessão](./components/session-controls.md)
- [Controles de Providers de Segurança](./components/security-provider-controls.md)
- [Diálogo de Alteração de Senha](./components/change-password-dialog.md)
- [Editor de Perfil, Username e Avatar](./components/profile-editor.md)

### Referência (`reference/`)
- [API, Rotas Frontend, Query Keys e Códigos de Erro](./reference/api-and-routes.md) — Todos os endpoints `/auth/*` e `/users/*`, rotas de `AUTH_ROUTES`, chaves de cache, mensagens de janela e catálogo de erros.

## Fronteiras e Dívidas Registradas

- **Código proprietário:** `src/features/auth/`
- **API pública:** `src/features/auth/index.ts`
- **Dívidas arquiteturais registradas em [module-boundaries.md](../architecture/module-boundaries.md):**
  - `DT-01`: `src/shared/lib/axios.ts` reexporta `api` de `src/features/auth/api/auth.api.ts`.
  - `DT-02`: `AuthAppShell` e `AUTH_ROUTES` vivem em `src/features/auth/` embora sejam consumidos por todos os módulos.
  - `DT-04`: `DashboardPage`, configurações e perfil (`/users/*`) ainda são hospedados em `src/features/auth/` e há uso misto de `templates/` vs. `pages/`.
