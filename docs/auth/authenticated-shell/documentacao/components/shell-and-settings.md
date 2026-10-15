---
area: auth
feature: authenticated-shell
type: documentation-component
status: current
related:
  - ../flow/routing-and-navigation.md
  - ../decisions/bootstrap-and-status-guards.md
---

# Shell autenticado e settings

- `AppRoutes` é dono do bootstrap e dos guards de rota.
- `AuthAppShell` (template) compõe sidebar desktop, navegação mobile, perfil,
  quick actions, conteúdo e `Toaster`.
- `SettingsLayout` (template) adiciona `SettingsNav` e outlet; pages de settings
  compõem conteúdo real ou placeholder.
- `MobileQuickActions` conecta shell aos intents de transactions/categories.
- `useUser`, `useLogout`, `useAuthStore` e constantes de rota/UX fornecem dados
  e side effects.

O shell não implementa lógica financeira das páginas filhas. Atomic Design
impede seus organisms/templates de serem importados por atoms/molecules.
