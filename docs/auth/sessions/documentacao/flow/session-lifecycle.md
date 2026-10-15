---
area: auth
feature: sessions
type: documentation-flow
status: current
related:
  - ../decisions/cookie-lifecycle-and-local-sync.md
  - ../components/session-controls.md
  - ../../../change-password/documentacao/decisions/terminal-success.md
---

# Ciclo de sessão

## Refresh e logout

Uma resposta 401 protegida dispara refresh central, com fila para requests
concorrentes. Sucesso repete a request original; falha limpa auth. Logout chama
o backend e, em `onSettled`, limpa store/cache mesmo se a rede falhar.

## Gerenciamento em settings

`SecuritySettings` lista sessões, coloca a atual primeiro e permite revogar por
`jti`. Loading, vazio e erro têm superfícies próprias; revogação invalida a
menor query de sessions.
`SESSION_NOT_FOUND` orienta atualizar a lista; tokens inválidos e
`POTENTIAL_SESSION_HIJACKING` encerram a sessão local.

## Backend consumido

| Operação | Autenticação | Contrato relevante | Efeito/cache | Erros e recuperação | Fonte |
| --- | --- | --- | --- | --- | --- |
| `POST /auth/refresh` | refresh cookie | rotaciona cookies | repete request em fila | falha: logout local | `backend/docs/integrations/auth/refresh-tokens.md` |
| `POST /auth/logout` | cookies | sem body | limpa auth/cache em settled | rede não preserva estado local | `backend/docs/integrations/auth/logout.md` |
| `GET /auth/sessions` | access cookie | array de sessões | query `sessions` | alert + refetch | `backend/docs/integrations/auth/sessions.md` |
| `DELETE /auth/sessions/:jti` | access cookie | 204 | invalida sessions | toast seguro/atualizar | mesma fonte |
