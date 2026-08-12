---
area: auth
feature: providers
type: documentation-flow
status: current
related:
  - ../decisions/provider-derived-capability.md
  - ../components/security-provider-controls.md
---

# Vincular métodos de acesso

## Email e senha

Sem provider `EMAIL`, `LinkEmailProviderForm` valida email e senha centralizada,
envia o vínculo e invalida o usuário. O formulário preserva valores em falha e
aplica field errors.

## Google

Sem provider `GOOGLE`, a ação navega para o endpoint autenticado de vínculo. O
backend conclui OAuth e redireciona para `/auth/link`. A página comunica
sucesso/erro à janela de origem por `postMessage` com mesma origin ou volta a
settings quando não existe opener.

`AUTH_PROVIDER_ALREADY_LINKED` encerra sem repetir; provider ligado a outra
conta e `google_provider_conflict` orientam usar outro método. Estados OAuth
`missing_state`/`invalid_state` pedem reinício do vínculo.

## Backend consumido

| Operação | Autenticação | Contrato relevante | Efeito/cache | Erros e recuperação | Fonte |
| --- | --- | --- | --- | --- | --- |
| `GET /users/me` | cookie | `providers[]` | define capacidades | erro: alert/retry sem ações | `backend/docs/integrations/auth/get-me.md` |
| `POST /auth/providers/link/email` | cookie | email/password | invalida usuário | validação/conflito: corrigir | `backend/docs/integrations/auth/link-providers.md` |
| `GET /auth/providers/link/google` | cookie | redirect 302 | inicia vínculo | falha: manter método atual | mesma fonte |
| callback Google | state público | `/auth/link?success|error` | mensagem entre janelas e invalidação | código conhecido recebe copy segura | mesma fonte |
