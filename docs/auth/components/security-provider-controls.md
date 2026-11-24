---
area: auth
type: component
status: current
last_reviewed: 2026-11-24
related:
  - ../README.md
  - ../flows/link-providers.md
  - ../decisions/provider-derived-capability.md
---

# Controles de providers

- `SecuritySettings` (organism) consulta usuário, apresenta estado de cada
  provider e compõe a próxima ação.
- `LinkEmailProviderForm` (organism) possui RHF/Zod e `useLinkEmail`.
- `LinkProviderCallbackPage` (template de rota) interpreta o callback e comunica
  a janela de origem.
- `GoogleLogo`, `FormField`, `Button`, `ApiErrorAlert` e cards são reutilizados.
- `AUTH_WINDOW_MESSAGES` e `GOOGLE_LINK_ERROR_MESSAGES` evitam strings mágicas.

O componente de provider não implementa change-password; ele apenas decide se
compõe o organismo dessa feature. Senha de vínculo nunca sai do formulário/DTO.
