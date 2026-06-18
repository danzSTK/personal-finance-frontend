# Tratamento de erros da API

O frontend trata falhas da API pelo contrato estável `code`. O campo `message`
do backend não é texto de interface e não deve ser exibido ao usuário.

## Fonte da verdade

1. `../personal-finance-backend/docs/integrations/errors.md`
2. Documentação completa do recurso em
   `../personal-finance-backend/docs/integrations/<resource>/`
3. `.agents/skills/danfy-api-error-handling/SKILL.md`

Antes de integrar um endpoint, registre todos os códigos documentados para a
operação e defina a superfície, a mensagem e a recuperação de cada um.

## Módulo compartilhado

- `apiErrorCodes.ts`: catálogo central dos códigos aceitos.
- `parseApiError.ts`: valida a resposta Axios sem assumir payloads aninhados.
- `resolveApiError.ts`: converte código, contexto e status em texto e recuperação.
- `applyApiFieldErrors.ts`: aplica `details.fields` em formulários React Hook Form.
- `showApiErrorToast.ts`: feedback complementar para ações não bloqueantes.
- `ApiErrorAlert.tsx`: erro persistente próximo ao formulário ou painel afetado.

## Uso

```tsx
const presentation = mutation.error
  ? resolveApiError(mutation.error, 'categories.create')
  : null

{
  presentation ? <ApiErrorAlert error={presentation} /> : null
}
```

Queries mostram o erro no painel e conectam `Tentar novamente` ao `refetch`.
Formulários permanecem abertos, preservam os valores e focam o primeiro campo
inválido. Ações rápidas como arquivar ou restaurar podem usar toast centralizado.
Conflitos que mudam o fluxo devem verificar o código exato, como
`CATEGORY_HAS_TRANSACTIONS`, nunca apenas o status `409`.
