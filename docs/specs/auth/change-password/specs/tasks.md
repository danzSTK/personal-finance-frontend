---
area: auth
feature: change-password
type: spec-tasks
status: current
related:
  - ./requirements.md
  - ./design.md
  - ./decisions.md
---

# Tarefas — segurança e alteração de senha

## Regra de execução

Nenhuma tarefa de implementação começa antes da aprovação explícita de
`requirements.md`, `design.md` e deste arquivo. Mudança de regra, API, UX
material ou impacto cross-module exige atualização prévia da spec.

## 0. Aprovação e baseline

- [x] 0.1 Revisar e aprovar os três arquivos de contrato com o usuário.
- [x] 0.2 Confirmar novamente o contrato público do backend e a lista exata de
      códigos antes de editar a integração.
- [x] 0.3 Registrar em `decisions.md` qualquer mudança ocorrida após a aprovação.

## 1. Testes da política de senha

- [x] 1.1 Criar testes que fixem a política central em 6–50 caracteres.
- [x] 1.2 Cobrir sign-in apenas obrigatório, sem revelar política.
- [x] 1.3 Cobrir igualdade das confirmações de sign-up e change-password.
- [x] 1.4 Cobrir que confirmações nunca entram nos DTOs.

## 2. Schema central

- [x] 2.1 Criar `schemas/password.schema.ts` com limites, schema e mensagens
      únicas.
- [x] 2.2 Refatorar `signUpSchema` e `linkEmailSchema` para compor o schema.
- [x] 2.3 Criar `changePasswordSchema` com senha atual, nova, confirmação,
      igualdade e diferença local.
- [x] 2.4 Manter `signInSchema.password` apenas obrigatório.
- [x] 2.5 Ajustar `PasswordStrength` para não contradizer a política aceita.
- [x] 2.6 Conectar o formulário de vínculo `EMAIL` ao React Hook Form/Zod e ao
      schema central, removendo a validação manual baseada apenas em campos não
      vazios.

## 3. Campo de senha reutilizável

- [x] 3.1 Adicionar testes de visibilidade ao `FormField`.
- [x] 3.2 Implementar toggle acessível automático para `type="password"`.
- [x] 3.3 Garantir padding, prefixo, foco, caret, disabled e erros sem regressão.
- [x] 3.4 Aplicar/verificar o comportamento em sign-in, sign-up, confirmação,
      vínculo de email e diálogo de alteração.

## 4. Confirmação no sign-up

- [x] 4.1 Adicionar `confirmPassword` aos form values, label e autocomplete.
- [x] 4.2 Exibir erro de divergência junto à confirmação e focar o campo.
- [x] 4.3 Montar `SignUpDto` explicitamente sem a confirmação.
- [x] 4.4 Atualizar mapeamento de erros e testes do formulário.

## 5. Contratos e mutation de alteração

- [x] 5.1 Adicionar endpoint constante, DTO e response discriminada.
- [x] 5.2 Implementar validação estreita da response de sucesso.
- [x] 5.3 Criar `useChangePassword` com retry desabilitado.
- [x] 5.4 Implementar limpeza de auth/query cache, comunicação entre abas e
      redirect sem refresh ou logout HTTP.
- [x] 5.5 Testar request exato e fluxo de sucesso.

## 6. Contrato tipado de erros e retry

- [x] 6.1 Adicionar todos os códigos de password change ao catálogo central.
- [x] 6.2 Adicionar contexto `auth.password.change` e copies acionáveis.
- [x] 6.3 Implementar parser estreito de `Retry-After` e
      `details.retryAfterSeconds`.
- [x] 6.4 Testar header, body, prioridade, divergência e payload malformado.
- [x] 6.5 Testar resolução de cada código documentado, 401, 500, network e
      unknown sem vazamento de mensagem do backend.

## 7. Diálogo e disponibilidade por provider

- [x] 7.1 Criar testes do trigger para `EMAIL`, `EMAIL+GOOGLE`, `GOOGLE` e
      loading.
- [x] 7.2 Criar `ChangePasswordDialog` com RHF/Zod e componentes existentes.
- [x] 7.3 Integrar o trigger contextual em `SecuritySettings`.
- [x] 7.4 Implementar pending, preservação de valores, field errors e alerta.
- [x] 7.5 Implementar deadline/countdown e bloqueio de submit sem auto-retry.
- [x] 7.6 Implementar foco inicial, Escape, cancelamento, retorno de foco e
      reset seguro.
- [x] 7.7 Testar layout mobile 320/375 px e desktop.

## 8. Fluxos especiais

- [x] 8.1 Direcionar `EMAIL_VERIFICATION_REQUIRED` ao fluxo existente.
- [x] 8.2 Atualizar perfil e orientar vínculo em provider required.
- [x] 8.3 Tratar sessão terminal e `USER_NOT_FOUND` com limpeza segura.
- [x] 8.4 Confirmar que a quinta falha pode entrar direto em bloqueio/countdown.
- [x] 8.5 Confirmar que fechar/reabrir não burla um deadline conhecido durante a
      montagem da página.

## 9. Documentação viva de auth

- [x] 9.1 Produzir manualmente a documentação viva desta feature no formato
      aprovado; a criação da skill e a migração global permanecem na spec 2.
- [x] 9.2 Criar a documentação inicial de change-password; a spec documental
      posterior migra o conteúdo para `decisions/`, `flow/` e `components/`.
- [x] 9.3 Registrar endpoint, providers, sessão pós-sucesso, códigos, retry,
      componentes próprios e reutilizados.
- [x] 9.4 Validar links e conteúdo contra código e documentação do backend.

## 10. Validação final

- [x] 10.1 Executar testes focados de schema, erros e componentes.
- [x] 10.2 Executar `npm run lint`.
- [x] 10.3 Executar `npm run build`.
- [x] 10.4 Fazer auditoria Material 3, Danfy tokens, teclado, leitor de tela e
      touch targets.
- [x] 10.5 Revisar todos os critérios de aceite e atualizar tasks/decisions.

## 11. Disponibilidade operacional antecipada

- [x] 11.1 Adicionar contrato, parser estreito, endpoint e query key do
      `GET /auth/password/change/status`.
- [x] 11.2 Implementar `usePasswordChangeStatus` sem retry automático e com
      deadline absoluto calculado do `Retry-After`.
- [x] 11.3 Manter o trigger visível e desabilitado em loading, erro e
      `status: false`, com data/hora local e recuperação inline.
- [x] 11.4 Reconsultar o status ao fim do prazo sem habilitar pelo relógio local
      e sem disparar o `POST`.
- [x] 11.5 Cobrir parser, query, estados do trigger, retry manual e deadline em
      testes focados.
- [x] 11.6 Atualizar documentação viva, executar testes, typecheck, lint e
      build.

## Evidências de conclusão

- `npm test`: 13 arquivos e 87 testes aprovados.
- `npm run lint`: concluído sem warnings ou erros.
- `npm run build`: TypeScript e Vite 8 concluídos com sucesso.
- Testes novos: parser/query de status, fail-closed do trigger, data local,
  retry manual e reconsulta no deadline.
- Auditoria de código: dialog responsivo a partir de 320 px, Danfy tokens,
  Material 3 dialog, navegação por teclado, foco, labels, live status e alvos de
  toque de 44 px verificados.
