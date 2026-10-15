---
area: auth
feature: core
type: spec-decisions
status: historical
reconstructed-from: legacy:auth-feature/design.md
related:
  - ./requirements.md
  - ./design.md
  - ./tasks.md
---

# Decisões históricas — auth core

## DEC-H01 — organização feature-first e Atomic Design

Status: historical

Decision: concentrar autenticação em `src/features/auth` e organizar UI por
Atomic Design.

Impact: o princípio permanece reconhecível no código, embora a árvore exata da
spec tenha mudado.

## DEC-H02 — separar estado local e servidor

Status: historical

Decision: usar Zustand para sessão adjacente à UI e TanStack Query para dados do
backend.

Impact: orientou o store e os hooks atuais; contratos de token do documento
original foram substituídos.
