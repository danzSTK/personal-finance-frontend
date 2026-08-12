---
area: auth
feature: authenticated-shell-v2
type: spec-requirements
status: historical
reconstructed-from: legacy:auth-shell-v2/design.md
related:
  - ./design.md
  - ./tasks.md
  - ./decisions.md
---

# Requisitos históricos — authenticated shell v2

Reconstrução da spec legada, sem aprovação retroativa.

## Objetivo preservado

Fornecer shell autenticado responsivo com sidebar, header, perfil real,
navegação principal e área de configurações, incluindo segurança, sessões e
providers obtidos do backend.

## Critérios preservados

- sidebar colapsável no desktop e navegação adequada no mobile;
- settings com navegação própria e páginas por seção;
- perfil, avatar e identificação vindos do usuário autenticado;
- métodos de login e sessões sem mocks;
- tokens sem cores hardcoded, TypeScript estrito e acessibilidade de teclado.
