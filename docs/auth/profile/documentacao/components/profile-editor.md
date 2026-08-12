---
area: auth
feature: profile
type: documentation-component
status: current
related:
  - ../flow/manage-profile.md
  - ../decisions/separate-profile-operations.md
---

# Editor de perfil

- `AccountProfileForm` (organism) coordena os formulários de nomes/username,
  availability, mutations e diálogos de avatar.
- `AvatarActionMenu`, `AvatarCameraDialog` e `AvatarCropDialog` separam captura,
  ajuste e confirmação.
- `updateProfileSchema` e `updateUsernameSchema` são donos da validação local.
- `useUser`, mutations de profile/username/avatar e `useAuthStore` mantêm API,
  cache e shell sincronizados.
- `FormField`, avatar UI, dialogs, buttons e `ApiErrorAlert` são shared.

O frontend usa somente a URL pronta retornada; não conhece bucket, key ou
storage lifecycle. Componentes de captura não fazem upload diretamente.
