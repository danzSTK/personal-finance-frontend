---
area: auth
feature: change-password
type: spec-design
status: current
related:
  - ./requirements.md
  - ./tasks.md
  - ./decisions.md
---

# Design — segurança e alteração de senha

## Resumo da solução

A entrega estende o módulo feature-first `auth`. `SecuritySettings` decide a
capacidade a partir do perfil; um organismo de diálogo mantém o workflow local;
React Hook Form e Zod validam dados; TanStack Query executa a mutation; o módulo
compartilhado de erros resolve códigos e retry; o store de auth encerra a sessão
local depois do sucesso.

```mermaid
flowchart TD
  Profile[GET /users/me e providers] --> Security[SecuritySettings]
  Security -->|EMAIL presente| Trigger[Alterar senha]
  Trigger --> Dialog[ChangePasswordDialog]
  Policy[passwordSchema central] --> Dialog
  Field[FormField com toggle] --> Dialog
  Dialog --> Mutation[useChangePassword]
  Mutation --> API[POST /auth/password/change]
  API -->|erro| Errors[resolveApiError + retry]
  Errors --> Dialog
  API -->|CHANGED| Cleanup[limpar auth + QueryClient + abas]
  Cleanup --> SignIn[/sign-in]
```

## Arquitetura e arquivos previstos

### Contratos e constantes

- `src/features/auth/constants/auth.constants.ts`
  - adicionar `passwordChange: '/auth/password/change'`;
  - manter endpoints e rotas sem strings mágicas.
- `src/features/auth/types/auth.types.ts`
  - `ChangePasswordDto` com `currentPassword` e `newPassword`;
  - `ChangePasswordResponse` discriminada por `object` e `status`.

### Schemas

- Criar `src/features/auth/schemas/password.schema.ts`:
  - limites exportados/centralizados conforme backend;
  - `passwordSchema` para credenciais criadas/alteradas;
  - helper tipado para igualdade de confirmação, sem duplicar mensagens.
- Manter/refatorar `src/features/auth/utils/validation.ts` para compor:
  - `signInSchema`: senha somente obrigatória;
  - `signUpSchema`: `password` + `confirmPassword` com schema central e
    igualdade;
  - `linkEmailSchema`: password schema central;
  - `changePasswordSchema`: current/new/confirm, política e invariantes.

Os DTOs são tipos independentes dos form values. Builders/submits removem os
campos de confirmação de modo explícito, sem assertions amplas.

### Componentes

- Refatorar `src/features/auth/components/molecules/FormField.tsx` para que
  campos `type="password"` ofereçam visibilidade padronizada. A própria molecule
  continua compondo atoms; não é criada uma molecule que importe outra
  molecule.
- Ajustar `PasswordStrength.tsx` para consumir a política central e separar
  requisitos obrigatórios de recomendações, ou reduzir a apresentação ao
  contrato realmente aceito.
- Criar
  `src/features/auth/components/organisms/ChangePasswordDialog.tsx` como único
  dono do React Hook Form, estado do diálogo, countdown e mutation.
- `SecuritySettings.tsx` apenas detecta provider, apresenta o trigger e compõe o
  organismo. Não recebe lógica de senha ou parsing de erro.
- Atualizar `SignUpForm.tsx`, `SignInForm.tsx` e o formulário de vínculo de email
  para reutilizarem o campo padronizado.
- Refatorar o vínculo de provider `EMAIL`, hoje controlado manualmente dentro de
  `SecuritySettings`, para validar com React Hook Form/Zod e o schema central;
  ele pode permanecer no organismo ou ser extraído se a responsabilidade ficar
  independente, sem criar dependência Atomic Design invertida.

### API e estado

- Adicionar `useChangePassword` em `src/features/auth/api/mutations.ts`.
- Mutation retry deve ser `false`; alteração de senha não é repetida
  automaticamente.
- A mutation valida/tipa a resposta de sucesso; payload inesperado não deve ser
  tratado como sucesso silencioso.
- No sucesso, o workflow chama a limpeza local existente, limpa QueryClient e
  navega para sign-in. Não invalida queries para refetch porque a sessão já foi
  revogada.
- O mecanismo de storage event existente deve informar logout às outras abas.

## Estado do diálogo

Estado local necessário:

- `open` controlado pelo trigger/pai;
- form values tipados;
- visibilidade de cada campo dentro do próprio `FormField`;
- `retryDeadlineMs: number | null`;
- relógio de apresentação derivado do deadline;
- erro da mutation resolvido por contexto `auth.password.change`.

O deadline absoluto evita drift de timers. Um intervalo de apresentação pode
atualizar o restante e deve ser limpo ao desmontar. O bloqueio termina quando
`deadline <= Date.now()`. Não persistir senha nem countdown em storage.

## Contrato HTTP

```http
POST /auth/password/change
Content-Type: application/json
Cookie: accessToken=<HttpOnly>
```

Request:

```ts
interface ChangePasswordDto {
  currentPassword: string
  newPassword: string
}
```

Response:

```ts
interface ChangePasswordResponse {
  object: 'auth.password_change'
  status: 'CHANGED'
}
```

Axios já usa `withCredentials: true`. Não adicionar Bearer token, userId ou
identificador de sessão.

## Extensão do contrato de erros

### Catálogo

Adicionar a `API_ERROR_CODES`:

- `CURRENT_PASSWORD_INVALID`;
- `NEW_PASSWORD_MUST_DIFFER`;
- `PASSWORD_CHANGE_EMAIL_PROVIDER_REQUIRED`;
- `PASSWORD_CHANGE_BLOCKED`;
- `PASSWORD_CHANGE_COOLDOWN_ACTIVE`;
- `PASSWORD_CHANGE_DAILY_LIMIT_EXCEEDED`;
- `PASSWORD_CHANGE_OPERATION_PENDING`;
- `PASSWORD_CHANGE_COST_LIMITED`;
- `PASSWORD_CHANGE_STATE_UNAVAILABLE`.

Adicionar `auth.password.change` ao `ApiErrorContext` e copies portuguesas
específicas em `resolveApiError`.

### Retry tipado

Evoluir o parser compartilhado para retornar `retryAfterSeconds: number | null`
sem afrouxar `unknown`:

1. aceitar apenas inteiro finito e positivo;
2. ler `Retry-After` numérico do Axios response;
3. ler `details.retryAfterSeconds` validado;
4. preferir o header quando ambos forem válidos;
5. não interpretar HTTP-date, negativo, zero, float ou string arbitrária;
6. manter `null` quando ausente/malformado.

O resolver fornece copy; o organismo decide countdown e disabled state. Não
mostrar códigos ou detalhes técnicos.

### Field errors

Mapa explícito:

```text
currentPassword -> currentPassword
newPassword -> newPassword
```

`confirmNewPassword` nunca recebe erro do backend. Erros locais de igualdade
ficam nesse campo. `CURRENT_PASSWORD_INVALID` e `NEW_PASSWORD_MUST_DIFFER`
podem ser convertidos em erro de campo pelo organismo após identificar o code,
mantendo alerta apenas quando existe informação form-wide distinta.

## Design do diálogo

- Base: Radix/Shadcn `Dialog`, comportamento de Material 3 dialog.
- Trigger contextual na linha/card `Email e senha`.
- Largura mobile `calc(100vw - spacing)` e máximo compacto no desktop.
- Conteúdo rolável quando altura for limitada; ações permanecem alcançáveis.
- Superfícies e cores usam tokens Danfy existentes.
- A ação principal é brand, não destructive: o ato é sensível, mas não
  destrutivo.
- Supporting text avisa antes do formulário: `Ao alterar sua senha, você sairá
  de todos os dispositivos.`
- Alertas ficam antes das ações e depois dos campos.
- Countdown deve ter texto estável e live region moderada, sem anunciar a cada
  segundo de forma agressiva.

## Segurança e privacidade

- Nunca registrar values, DTOs, responses contendo senha ou conteúdo de campos.
- Nunca armazenar senha em Zustand, Query cache, localStorage ou sessionStorage.
- Query/mutation keys não incluem valores de senha.
- Cancelamento/desmontagem chama `reset` para liberar referências aos valores.
- O toggle não muda autocomplete nem nome do campo.
- O frontend não promete entrega de email, não mostra contagem de tentativas e
  não infere regras temporais sem resposta válida.

## Estratégia de testes

### Unitários

- política central: limites 5/6/50/51;
- sign-in aceita qualquer senha não vazia sem política estrutural;
- sign-up e change-password exigem confirmação idêntica;
- builders omitem confirmações;
- parser de retry: header, body, prioridade, malformed e ausência;
- resolver de todos os códigos novos.

### Componentes

- toggle por teclado e mouse, nome acessível e preservação do valor;
- todos os formulários de senha usam o comportamento padronizado;
- trigger disponível para `EMAIL`, `EMAIL+GOOGLE` e ausente para `GOOGLE` only;
- foco inicial, Escape, retorno de foco e bloqueio de fechamento durante pending;
- erro de campo, alerta form-wide, preservação e countdown;
- submit único e disabled states;
- sucesso limpa estado/cache e solicita navegação ao sign-in.

### Integração

- payload exato da mutation;
- `200 CHANGED` sem refresh/logout HTTP;
- 401 terminal passa pelo fluxo central;
- todos os códigos temporários respeitam retry e não repetem automaticamente.

## Dependência documental

A implementação final deve produzir/atualizar
`docs/auth/change-password/documentacao/{decisions,flow,components}.md` conforme
a spec `docs/specs/documentation/platform-feature-documentation/specs/`. A
documentação descreve estrutura e decisões, não copia a implementação.

## Sem impacto de banco

Não há schema, migration ou alteração em `docs/database/schema.md` no frontend.

## Riscos e mitigação

- Contrato interno do backend com status histórico divergente: decidir por code
  e seguir integração pública `429`.
- Política visual atual diverge do backend: centralizar e testar limites.
- Sucesso invalida a sessão que executou a operação: limpar antes de qualquer
  request posterior.
- Retry countdown pode driftar: usar deadline absoluto.
- Perfil/provider pode ficar stale: backend continua autoridade e query é
  atualizada em conflito.
