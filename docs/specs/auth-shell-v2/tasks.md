# Auth Shell v2 - Implementation Tasks

## 📋 Overview

Este documento quebra a implementação em tarefas para corrigir shell, dashboard e settings, e consumir integralmente os contratos de auth disponíveis no backend.

---

## 🧭 Ordem de execução

1. Ajustar arquitetura de navegação (shell + sidebar + perfil).
2. Corrigir informações de perfil e header.
3. Consolidar settings com submenu real.
4. Implementar Segurança com sessões reais.
5. Fechar gap de providers quando contrato backend for disponibilizado.

---

## Fase 1 — Shell e navegação principal

### Task 1.1 — Sidebar fixa com modo ícone
**Arquivos-alvo**
- `src/features/auth/components/templates/AuthAppShell.tsx`

**Entregas**
- Sidebar fixa em desktop.
- Toggle de colapso (`expandido` ↔ `ícone`).
- Persistência de estado de colapso (store/localStorage).
- Drawer responsivo no mobile com backdrop.

**Critérios**
- No desktop, estado colapsado mantém somente ícones funcionais.
- No mobile, abrir/fechar não quebra scroll da página.

---

### Task 1.2 — Navegação principal sem Configurações
**Arquivos-alvo**
- `src/features/auth/components/templates/AuthAppShell.tsx`
- `src/features/auth/constants/auth.constants.ts`

**Entregas**
- Menu principal com item único: `Painel`.
- Remover `Configurações` da navegação principal.

**Critérios**
- Acesso a Configurações ocorre exclusivamente via dropdown de perfil.

---

### Task 1.3 — Perfil no rodapé com dados reais
**Arquivos-alvo**
- `src/features/auth/components/templates/AuthAppShell.tsx`
- `src/features/auth/api/queries.ts`
- `src/features/auth/stores/auth.store.ts`

**Entregas**
- Exibir avatar/initials, nome e email reais.
- Fallback de nome consistente.
- Estado de loading e erro de forma segura.

**Critérios**
- Dados vêm de `GET /auth/me`.
- Sem placeholders estáticos quando usuário autenticado existir.

---

### Task 1.4 — Dropdown de perfil com ações corretas
**Arquivos-alvo**
- `src/features/auth/components/templates/AuthAppShell.tsx`
- `src/app/routes/index.tsx`

**Entregas**
- Ações do dropdown:
  - `Configurações`
  - `Sair`
- Navegação para settings por ação de perfil.
- Logout integrado a mutation atual.

**Critérios**
- Fluxo de saída limpa estado local e redireciona para login.

---

## Fase 2 — Header e página de Configurações

### Task 2.1 — Header alinhado ao produto
**Arquivos-alvo**
- `src/features/auth/components/templates/AuthAppShell.tsx`
- `src/features/auth/components/templates/DashboardPage.tsx`
- `src/features/auth/components/templates/SettingsPage.tsx`

**Entregas**
- Header minimalista com título/subtítulo de contexto.
- Remover textos técnicos ou irrelevantes.

**Critérios**
- Linguagem de produto (“Danfy Finance”), não linguagem de infraestrutura.

---

### Task 2.2 — Submenu lateral de settings com nomes de domínio
**Arquivos-alvo**
- `src/features/auth/components/templates/SettingsPage.tsx`

**Entregas**
- Submenu com seções:
  - `Conta`
  - `Segurança`
  - `Notificações`
  - `Preferências`
- Estado ativo claro e navegável por teclado.

**Critérios**
- Proibido rótulo genérico como “Submenu”.

---

### Task 2.3 — Conteúdo inicial por seção
**Arquivos-alvo**
- `src/features/auth/components/templates/SettingsPage.tsx`

**Entregas**
- `Conta`: dados básicos de perfil.
- `Segurança`: sessões reais (fase 3 detalha).
- `Notificações` e `Preferências`: blocos de estado inicial estruturados.

**Critérios**
- Nenhuma seção crítica vazia sem contexto.

---

## Fase 3 — Segurança com dados reais do backend

### Task 3.1 — Listagem de sessões ativas
**Arquivos-alvo**
- `src/features/auth/api/queries.ts`
- `src/features/auth/components/organisms/SessionCard.tsx`
- `src/features/auth/components/templates/SettingsPage.tsx`

**Entregas**
- Consumir `GET /auth/sessions`.
- Exibir sessão atual + sessões adicionais.
- Formatação de data e metadata.

**Critérios**
- Sessão atual claramente destacada.

---

### Task 3.2 — Revogar sessão específica
**Arquivos-alvo**
- `src/features/auth/api/mutations.ts`
- `src/features/auth/components/organisms/SessionCard.tsx`
- `src/features/auth/components/templates/SettingsPage.tsx`

**Entregas**
- Ação de revogar por `jti`.
- Refetch/invalidação de cache após sucesso.
- Feedback de erro tipado.

**Critérios**
- Revogação funciona sem recarregar a aplicação inteira.

---

## Fase 4 — Métodos de login e gap remanescente

### Task 4.1 — Integrar seção “Métodos de login”
**Dependência:** `GET /users/me` com `providers[]`

**Arquivos-alvo**
- `src/features/auth/components/templates/SettingsPage.tsx`
- `src/features/auth/api/queries.ts`
- `src/features/auth/api/mutations.ts`

**Entregas**
- Render de cards por provider com estados reais.
- CTA de vínculo/desvínculo conforme contrato.
- Remoção de qualquer inferência frágil no frontend.

**Critérios**
- Tela reflete fonte única de verdade do backend.

---

### Task 4.2 — Contrato opcional para método atual
**Owner sugerido:** backend-auth

**Entregas**
- Expor método da sessão atual via:
  - campo `currentProvider` em `GET /users/me`; ou
  - claim equivalente no access token.

**Critérios**
- Frontend consegue distinguir método atual de métodos apenas vinculados.

---

## Fase 5 — Qualidade e governança

### Task 5.1 — Governança de cores
**Arquivos-alvo**
- `src/index.css`
- Tailwind v4 `@theme inline` em `src/index.css`
- componentes da feature auth

**Entregas**
- Remover cores hardcoded remanescentes.
- Usar apenas tokens semânticos.

**Critérios**
- Nenhum componente auth usando cor literal fora do design token.

---

### Task 5.2 — TypeScript safety
**Arquivos-alvo**
- `src/features/auth/**/*`

**Entregas**
- Eliminar casts inseguros.
- Validar shape de erro antes de ler propriedades.
- Centralizar magic strings restantes em constantes.

**Critérios**
- Fluxos de erro sem acessos inválidos de propriedades.

---

## ✅ Definition of Done (global)

1. Shell responsivo com sidebar colapsável entregue.
2. Configurações acessível apenas via perfil.
3. Perfil mostra dados reais do usuário.
4. Segurança mostra sessões reais e permite revogação.
5. Submenu de settings com nomenclatura de domínio.
6. Cores governadas por tokens semânticos.
7. TS safety alinhado às instruções do repositório.
8. Gap de providers documentado com contrato explícito para backend.
