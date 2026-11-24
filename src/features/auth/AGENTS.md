# Módulo `auth` — Instruções Locais

Este módulo concentra autenticação (e-mail/senha e Google OAuth), ciclo de vida de sessões via cookies HttpOnly, verificação de e-mail, vínculo de providers, alteração de senha local, perfil/avatar do usuário (`/users/*`), configurações (`/settings/*`), o shell autenticado (`AuthAppShell`) e o `DashboardPage`.

## Documentação Obrigatória

Antes de planejar, editar ou revisar código neste módulo, leia:
- `docs/auth/README.md` — Índice geral e mapa completo dos fluxos e decisões de `auth`.
- `docs/auth/concepts/session-and-cookie-model.md` — Sessão por cookies HttpOnly, `GET /users/me`, refresh serializado e sincronização entre abas.
- `docs/auth/concepts/verification-and-provider-states.md` — Estados de verificação (`PENDING_EMAIL_VERIFICATION`) e capacidades derivadas de `providers[]`.
- `docs/auth/reference/api-and-routes.md` — Matriz completa de rotas frontend, endpoints `/auth/*` e `/users/*`, query keys e códigos de erro.
- `docs/architecture/module-boundaries.md` — Dívidas registradas (`DT-01`, `DT-02`, `DT-04`) referentes a `auth.api.ts`, `AuthAppShell`, `DashboardPage` e `templates/` vs. `pages/`.

## Regras de Fronteira e Invariantes

- **Sessão exclusivamente por cookies HttpOnly:** nunca introduza Bearer tokens em headers, armazenamento de JWT em `localStorage`/`sessionStorage`, tokens em query string de callbacks OAuth ou chamadas a `/auth/me`. A identidade ativa sempre vem de `GET /users/me` com `withCredentials: true`.
- **Refresh centralizado e fail-safe:** `auth.api.ts` serializa retentativas `401` em fila única via `POST /auth/refresh` e despacha `auth:email-verification-required` em `403 EMAIL_VERIFICATION_REQUIRED`. Logout (`useLogout`) e sucesso terminal de troca de senha devem limpar `useAuthStore`, `queryClient` e propagar `auth_logout` entre abas.
- **Capacidades derivadas do backend (fail-closed):**
  - Nunca infira disponibilidade de troca de senha ou vínculo de providers durante loading/erro; derive estritamente de `GET /users/me.providers[]`.
  - Alteração de senha exige `EMAIL` em `providers[]` **e** resposta permissiva `status: true` em `GET /auth/password/change/status`. Prazos `Retry-After` usam deadline absoluto e reconsultam apenas o `GET` ao vencer (relógio local nunca libera o botão).
  - Sucesso validado (`auth.password_change` / `CHANGED`) encerra sessão localmente sem chamar `POST /auth/logout` ou `POST /auth/refresh`.
- **Política central de senha:** use `passwordSchema` (`src/features/auth/schemas/password.schema.ts`, 6–50 caracteres) em cadastro, vínculo `EMAIL` e troca de senha; nunca envie `confirmPassword` no payload HTTP (remova via `buildSignUpDto` / `buildChangePasswordDto`).
- **Verificação de e-mail:** confirmação em `/verification-email` exige ação explícita (não confirma apenas ao carregar a URL) e limpa o token da URL em sucesso.
- **Fronteiras e dívidas registradas:** perfil/avatar (`/users/*`), `AuthAppShell`, `AUTH_ROUTES`, `auth.api.ts` e `DashboardPage` residem hoje em `src/features/auth/` (`DT-01`, `DT-02`, `DT-04`). Não acople novos domínios de produto dentro de `auth`.
- **Sincronização documental:** qualquer mudança em rotas, endpoints, guards, providers, erros ou componentes-chave exige atualização de `docs/auth/` e deste `AGENTS.md` na mesma entrega.
