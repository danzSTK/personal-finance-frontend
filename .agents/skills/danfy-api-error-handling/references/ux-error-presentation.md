# UX And UI Error Presentation

## Surface Decision Matrix

| Situation | Primary surface | Required behavior |
|---|---|---|
| Invalid form field | Text-field error | Mark field, explain correction, focus first invalid field |
| Form-wide business conflict | Inline form alert | Keep values, explain rule, offer next action |
| Query/panel failed | Inline panel state | Preserve page shell, explain failure, provide retry |
| Brief non-blocking mutation feedback | Snackbar/toast | Short message; do not replace critical inline explanation |
| Destructive action requires decision | Dialog | Clear consequence, cancel path, explicit action label |
| Session expired | Auth recovery then page/banner | Retry refresh first; otherwise route to sign-in with explanation |
| App cannot continue safely | Full-page state | Keep navigation/recovery available when possible |

## Material 3 Mapping

- **Text fields:** show field-level error directly below the field; keep label and entered value.
- **Snackbar:** use for short, non-blocking feedback. Never make it the sole critical error surface.
- **Dialog:** use only for a blocking decision or critical actionable information. Do not open a dialog merely to announce a server failure.
- **Button:** use a clear retry or recovery command. Disable while pending and keep dimensions stable.
- **Progress:** replace retry state with local pending feedback; do not blank the whole screen for panel retries.

Use Danfy components and tokens rather than importing Material Web.

## Copy Pattern

Write three parts:

1. **Title:** what could not be completed, in user language.
2. **Body:** what the user should know, including preservation of data when relevant.
3. **Action:** the concrete recovery command.

Examples:

### Unknown Or 500

```text
Title: Serviço indisponível no momento
Body: Não foi possível concluir esta ação agora. Seus dados continuam nesta tela.
Action: Tentar novamente
```

### Failed Query

```text
Title: Não foi possível carregar as categorias
Body: Confira sua conexão e tente novamente.
Action: Tentar novamente
```

### Business Conflict

```text
Title: Esta categoria já existe
Body: Use outro nome ou edite a categoria existente.
Action: Voltar ao nome
```

### Session Expired

```text
Title: Sua sessão terminou
Body: Entre novamente para continuar com segurança.
Action: Entrar novamente
```

Avoid `Algo deu errado`, `Erro 500`, `Bad Request`, `Conflict`, and unexplained `Tente novamente` when a more specific statement is known.

## Visual Rules

- Use `destructive` for error icon, border, invalid field, and risky action states.
- Keep body text in `text-app-muted` and primary content in `text-app-text`.
- Do not use `state-expense` for errors.
- Pair color with icon, title, body, and accessible text.
- Avoid large solid red panels for ordinary query failures. Use restrained borders/surfaces.
- Keep the affected layout stable; error content must not cause incoherent jumps.
- Preserve visible focus and return focus after dialogs.
- Use `role="alert"` or an appropriate live region for newly appeared actionable errors; avoid repeated announcements.

## Recovery Rules

- Retry only idempotent queries automatically. Mutations require deliberate retry unless the operation is proven idempotent.
- Do not clear forms, close sheets, or navigate away after mutation failure.
- For conflicts, provide the business-specific next step instead of generic retry.
- For delete-with-merge flows, keep the origin and selected destination until success or explicit cancel.
- When no recovery is possible in place, offer a safe route back.
