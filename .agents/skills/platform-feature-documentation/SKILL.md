---
name: platform-feature-documentation
description: "Create, update, review, or reorganize Danfy Finance feature documentation and specs. Use when implementing a feature that changes flows, decisions, backend consumption, dependencies, or components; documenting current behavior in the module docs tree; reconciling spec, source, backend docs, and live docs; migrating legacy specs to the module-first specs tree; or recording and superseding architectural decisions."
---

# Platform Feature Documentation

Maintain a traceable distinction between implementation contracts and current
feature documentation.

## Workflow

1. Read `AGENTS.md`, the applicable spec, current feature docs, relevant source,
   and complete backend integration documentation before editing.
2. Classify the target as module, feature, and optional autonomous subfeature.
3. Keep implementation contracts under
   `docs/specs/<module>/<feature>/[<subfeature>/]specs/`.
4. Keep implemented behavior under the module and feature `documentacao/` tree,
   divided into `decisions/`, `flow/`, and `components/` directories.
5. Read [references/documentation-files.md](references/documentation-files.md)
   completely before creating, reviewing, or migrating documentation.
6. Build an evidence inventory: current source, routes/endpoints, state owners,
   schemas, errors, components, dependencies, specs, and backend sources.
7. Update the affected documents under `decisions/`, `flow/`, and
   `components/`. Keep one cohesive responsibility per Markdown file.
8. Mark content `current` only when source or an active external contract
   confirms it. Mark proposals and historical reconstruction explicitly.
9. Reconcile contradictions. Supersede an accepted decision explicitly instead
   of leaving incompatible decisions active.
10. Validate expected files, relative links, backend-operation coverage, stale
    contracts, and references to migrated paths.
11. Report changed coverage and remaining gaps without inventing behavior.

## Rules

- Write in Brazilian Portuguese while preserving technical identifiers exactly.
- Document structure, responsibilities, dependencies, flow, and rationale; do
  not copy large implementation blocks.
- Document every consumed backend operation with authentication, relevant
  request/response effects, errors, and source.
- Distinguish feature-owned, shared, and cross-feature components.
- Write each decision as its own file with `Problema`, `Decisão`, and
  `Consequência` sections.
- Do not make product changes, approve specs, or rewrite historical intent while
  performing documentation-only work.
- Do not describe Bearer tokens, browser-stored tokens, token query parameters,
  or `/auth/me` as current when auth uses HttpOnly cookies and `GET /users/me`.
- Do not create documentation for an unrelated module merely to make coverage
  appear complete.

## Spec Migration

Preserve original content and status. Split monolithic or incomplete legacy
specs into `requirements.md`, `design.md`, `tasks.md`, and `decisions.md`; label
reconstructed files as historical and never invent retrospective approval.
Update incoming links before removing the old path.
