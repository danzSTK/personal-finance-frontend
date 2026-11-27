---
area: auth
type: component
status: current
last_reviewed: 2026-11-27
related:
  - ../README.md
  - ../flows/authenticated-shell-routing.md
  - ../decisions/bootstrap-and-status-guards.md
---

# Shell autenticado e settings

- `AppRoutes` é dono do bootstrap e dos guards de rota.
- `AuthAppShell` (template) compõe sidebar desktop, navegação mobile, perfil,
  quick actions, conteúdo e `Toaster`:
  - **Sidebar desktop (`primaryNavigation`):** 5 itens principais em sequência — `Painel` (`/dashboard`), `Contas` (`/accounts`), `Categorias` (`/categories`), `Transações` (`/transactions`) e o 5º item **`Notas fiscais`** (`NFC-e e compras`, rota `AUTH_ROUTES.fiscalNotes = '/fiscal-notes'`, `activeSection="fiscal-notes"`).
  - **Navegação mobile:** mantém os **5 slots** da barra inferior fixa (`Principal`, `Transações`, botão central `MobileQuickActions`, `Contas`, `Mais`). O item **`Notas fiscais`** (`NFC-e e histórico de compras`) aparece no **topo do sheet `Mais`**, acima de `Categorias`, `Configurações` e `Sair`, marcando `Mais` como ativo quando `activeSection === 'fiscal-notes'`.
- `SettingsLayout` (template) adiciona `SettingsNav` e outlet; pages de settings
  compõem conteúdo real ou placeholder.
- `MobileQuickActions` conecta o shell aos intents de `transactions` (`Receita`, `Despesa`, `Transferência`), `fiscal-notes` (**"Ler NFC-e"**, no slot central da 2ª linha via `AUTH_QUICK_ACTION_ROUTES.fiscalNote`) e `categories` (`Nova categoria`).
- `useUser`, `useLogout`, `useAuthStore` e constantes de rota/UX fornecem dados
  e side effects.

O shell não implementa lógica financeira das páginas filhas. Atomic Design
impede seus organisms/templates de serem importados por atoms/molecules.
