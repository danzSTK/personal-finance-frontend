---
area: auth
feature: change-password
type: spec-requirements
status: current
related:
  - ./design.md
  - ./tasks.md
  - ./decisions.md
  - ../../../../../../personal-finance-backend/docs/integrations/auth/change-password.md
  - ../../../../../../personal-finance-backend/docs/auth/change-password/index.md
---

# Requisitos — segurança e alteração de senha

## Objetivo

Permitir que uma pessoa autenticada, com provider local `EMAIL`, altere sua
senha em `Configurações > Segurança` por um diálogo mobile-first, com
confirmação da senha atual, confirmação local da nova senha, tratamento de todos
os bloqueios documentados e encerramento seguro de todas as sessões após o
sucesso.

Esta entrega também padroniza todos os campos de senha do módulo `auth`, adiciona
confirmação de senha ao cadastro e centraliza a política Zod usada pelos fluxos
que criam ou alteram credenciais.

## Fontes de verdade

- `AGENTS.md`.
- `.agents/skills/spec-driven-development/SKILL.md`.
- `.agents/skills/danfy-api-error-handling/SKILL.md` e suas referências.
- `.agents/skills/frontend-design/SKILL.md`.
- `.agents/skills/danfy-finance-design-system/SKILL.md`.
- `.agents/skills/material-3-ui-guidance/SKILL.md`.
- `docs/design-system/danfy-finance-design-system.md`.
- `docs/design-system/material-3-reference.md`.
- `../personal-finance-backend/docs/integrations/errors.md`.
- `../personal-finance-backend/docs/integrations/auth/README.md` e toda a pasta.
- `../personal-finance-backend/docs/integrations/auth/change-password.md`.
- `../personal-finance-backend/docs/auth/change-password/**`.
- `../personal-finance-backend/docs/specs/auth/change-password/specs/**`.
- Contratos e implementação atuais de `src/features/auth` e
  `src/shared/errors`.

Quando uma documentação interna do backend divergir do contrato público, o
frontend deve seguir a integração publicada e o comportamento atual do código.
Foi identificada uma divergência histórica: um fluxo interno registra `409` para
`PASSWORD_CHANGE_OPERATION_PENDING`, enquanto contrato público, spec do backend
e filtro HTTP atual registram `429`.

## Escopo

- Adicionar a ação de alterar senha em `SettingsSecurityPage`/
  `SecuritySettings` somente quando `user.providers` contiver `EMAIL`.
- Abrir um diálogo com senha atual, nova senha e confirmação da nova senha.
- Consumir `POST /auth/password/change` com cookies HttpOnly existentes.
- Tratar sucesso, validação, sessão, provider, bloqueio, cooldown, limite diário,
  concorrência, limite técnico, indisponibilidade e falhas desconhecidas.
- Respeitar `Retry-After`/`details.retryAfterSeconds` sem retry automático.
- Encerrar o estado autenticado e redirecionar ao login após sucesso.
- Adicionar `confirmPassword` ao sign-up sem enviá-lo ao backend.
- Centralizar a política de senha para sign-up, vínculo de provider `EMAIL` e
  alteração de senha.
- Manter o sign-in com validação não reveladora: apenas presença da senha.
- Adicionar toggle acessível mostrar/ocultar em todos os campos de senha atuais e
  novos do módulo `auth`.
- Atualizar testes e a documentação viva de auth definida pela spec documental.

## Fora de escopo

- Recuperação de senha sem sessão.
- Criação do primeiro provider `EMAIL` dentro do diálogo de alteração.
- Mudanças na política ou nos DTOs do backend.
- MFA, histórico de senhas, passkeys ou dispositivos confiáveis.
- Exibir quantidade de tentativas restantes; o backend não fornece esse dado.
- Alterar senha de uma conta exclusivamente OAuth.
- Implementar a documentação de outros módulos além de `auth`.

## Regras de negócio

### Disponibilidade por provider

- A ação `Alterar senha` só fica disponível quando existe provider `EMAIL`.
- Uma conta com `EMAIL` e `GOOGLE` pode alterar a senha normalmente.
- Uma conta somente `GOOGLE` não recebe um formulário impossível; a área de
  métodos de login continua oferecendo o vínculo de email e senha.
- Durante o carregamento do usuário, a interface não deve inferir providers nem
  piscar uma ação incorreta.
- O frontend ainda deve tratar
  `PASSWORD_CHANGE_EMAIL_PROVIDER_REQUIRED`, pois o estado pode mudar entre a
  leitura do perfil e a mutation.

### Política de senha

- A política pública atual é: string com 6 a 50 caracteres.
- Sign-up, vínculo de provider `EMAIL`, nova senha e confirmação da nova senha
  usam o mesmo schema Zod central.
- A senha atual no fluxo autenticado respeita o contrato de 6 a 50 caracteres.
- Sign-in valida somente que a senha foi preenchida; não expõe a política antes
  da autenticação.
- A confirmação deve ser idêntica à senha correspondente.
- `confirmPassword` e `confirmNewPassword` existem apenas no estado do
  frontend e nunca aparecem em requests, tipos de DTO ou logs.
- A nova senha deve ser diferente da senha atual. O frontend pode prevenir a
  igualdade, mas o código `NEW_PASSWORD_MUST_DIFFER` permanece obrigatório como
  autoridade do backend.
- O componente de força/requisitos não pode apresentar critérios como condição
  obrigatória se eles não fizerem parte do schema central.

### Visibilidade de senha

- Todo campo com semântica de senha no módulo `auth` possui controle
  independente para mostrar ou ocultar seu valor.
- O estado inicial é oculto.
- O controle alterna somente `type="password"`/`type="text"`, sem limpar valor,
  erro, caret ou foco do formulário.
- O botão usa `type="button"`, nome acessível dinâmico (`Mostrar senha`/
  `Ocultar senha`), `aria-pressed`, ícone e alvo de toque mínimo de 44 px.
- O toggle se aplica a sign-in, sign-up, confirmação do sign-up, vínculo de
  email, senha atual, nova senha e confirmação da nova senha.

### Sucesso e sessões

- O sucesso `200` com `object: "auth.password_change"` e `status: "CHANGED"`
  significa que a senha foi alterada, todos os tokens anteriores foram
  revogados e os cookies foram expirados.
- O frontend não chama refresh nem `POST /auth/logout` depois desse sucesso.
- O frontend limpa Zustand, session storage autenticado e TanStack Query,
  notifica outras abas pelo mecanismo local existente e redireciona para
  `/sign-in`.
- O login deve apresentar feedback de que a senha foi alterada e que é
  necessário entrar novamente.
- O email de segurança é assíncrono; a UI não afirma que ele foi entregue.

## Fluxos

### FLW-001 — abrir alteração de senha

1. O usuário acessa `Configurações > Segurança`.
2. `GET /users/me` fornece `providers[]`.
3. Se existir `EMAIL`, a UI apresenta `Alterar senha` junto ao método local.
4. A ação abre um único diálogo e move o foco para `Senha atual`.

### FLW-002 — alterar com sucesso

1. O usuário preenche senha atual, nova senha e confirmação.
2. O frontend valida os três campos e a igualdade da confirmação.
3. O frontend envia somente `currentPassword` e `newPassword`.
4. Durante a mutation, o submit fica estável e desabilitado.
5. Em `CHANGED`, o frontend limpa autenticação/cache e leva ao sign-in.
6. O sign-in informa que todas as sessões foram encerradas por segurança.

### FLW-003 — falha recuperável

1. A API retorna um erro conhecido ou de transporte.
2. O diálogo permanece aberto e preserva os três valores.
3. Erros de campo são aplicados e o primeiro campo inválido recebe foco.
4. Conflitos e indisponibilidade aparecem em `ApiErrorAlert` dentro do diálogo.
5. O usuário corrige ou tenta novamente deliberadamente quando for seguro.

### FLW-004 — restrição temporária

1. A API retorna um código temporário com retry em segundos.
2. O frontend extrai um inteiro positivo do header ou de
   `details.retryAfterSeconds`.
3. A UI apresenta tempo restante em linguagem humana e desabilita o submit até
   o instante calculado.
4. Não existe retry automático nem exposição de tentativas restantes.
5. Encerrar/reabrir o diálogo durante a mesma montagem não deve permitir envio
   antes do prazo conhecido.

### FLW-005 — confirmar senha no cadastro

1. O sign-up exibe `Senha` e `Confirmar senha`.
2. Ambos usam o schema central e toggles independentes.
3. Divergência aparece junto à confirmação e impede o submit.
4. O DTO enviado continua contendo somente `password`.

## Requisitos funcionais

### REQ-001 — renderizar pela capacidade real

WHEN `user.providers` contiver `EMAIL`
THE SYSTEM SHALL disponibilizar a ação `Alterar senha`.

IF o provider `EMAIL` estiver ausente
THEN o sistema não deve abrir o diálogo e deve manter o fluxo de vínculo já
existente como próxima ação adequada.

### REQ-002 — validar e montar o request

WHEN o formulário estiver válido
THE SYSTEM SHALL enviar exatamente:

```json
{
  "currentPassword": "<senha-atual>",
  "newPassword": "<nova-senha>"
}
```

THE SYSTEM SHALL NOT enviar confirmação, userId, JTI ou token.

### REQ-003 — confirmação local

WHEN senha e confirmação divergirem
THE SYSTEM SHALL bloquear o submit, associar a mensagem à confirmação e
preservar os valores.

### REQ-004 — preservar trabalho em falha

WHEN a mutation falhar
THE SYSTEM SHALL manter o diálogo aberto, preservar os campos e apresentar o
erro próximo ao formulário, sem usar toast como única superfície.

### REQ-005 — respeitar restrições temporárias

WHEN um erro temporário trouxer retry válido
THE SYSTEM SHALL impedir novo submit até o prazo e atualizar a informação
visível sem disparar requests automaticamente.

### REQ-006 — encerrar autenticação no sucesso

WHEN a alteração for confirmada pelo backend
THE SYSTEM SHALL limpar o estado autenticado e todo cache sensível antes de
redirecionar ao sign-in, sem tentar refresh.

### REQ-007 — centralizar política

WHEN um fluxo criar ou alterar uma senha local
THE SYSTEM SHALL importar o mesmo schema Zod central, em vez de repetir limites
ou regex em schemas de cada formulário.

### REQ-008 — não revelar política no sign-in

WHEN o usuário estiver no sign-in
THE SYSTEM SHALL validar apenas email e presença da senha, mantendo mensagens de
credencial deliberadamente genéricas.

### REQ-009 — padronizar visibilidade

WHEN qualquer campo de senha for renderizado no módulo `auth`
THE SYSTEM SHALL oferecer o mesmo comportamento acessível de mostrar/ocultar.

## Inventário de erros do endpoint

| Código | Superfície e comportamento |
| --- | --- |
| `VALIDATION_ERROR` | Aplicar `details.fields` a `currentPassword` e `newPassword`; mensagens não mapeadas ficam no alerta do formulário. |
| `NEW_PASSWORD_MUST_DIFFER` | Erro em `newPassword`, pedir uma senha diferente e focar o campo. |
| `CURRENT_PASSWORD_INVALID` | Erro em `currentPassword`; não informar tentativas restantes. |
| `EMAIL_VERIFICATION_REQUIRED` | Encerrar o diálogo e direcionar ao fluxo de verificação, preservando a sessão válida. |
| `PASSWORD_CHANGE_EMAIL_PROVIDER_REQUIRED` | Alerta de conflito de capacidade; atualizar `GET /users/me` e orientar vínculo de email se ainda ausente. |
| `PASSWORD_CHANGE_BLOCKED` | Alerta persistente, countdown e submit bloqueado até o retry. |
| `PASSWORD_CHANGE_COOLDOWN_ACTIVE` | Informar que uma alteração recente exige espera; countdown. |
| `PASSWORD_CHANGE_DAILY_LIMIT_EXCEEDED` | Informar limite temporário e prazo; não sugerir repetição imediata. |
| `PASSWORD_CHANGE_OPERATION_PENDING` | Informar que outra alteração está em andamento e respeitar o retry. Contrato atual: `429`. |
| `PASSWORD_CHANGE_COST_LIMITED` | Interromper repetição e respeitar o retry por proteção de segurança. |
| `PASSWORD_CHANGE_STATE_UNAVAILABLE` | `Serviço indisponível no momento`; não assumir sucesso e permitir tentativa manual segura. |
| `INVALID_ACCESS_TOKEN` / `UNAUTHORIZED` | Usar recuperação central de sessão; em falha terminal, limpar auth e ir ao sign-in. |
| `USER_NOT_FOUND` | Estado terminal de sessão/perfil inconsistente; limpar auth e pedir novo login. |
| `INTERNAL_SERVER_ERROR`, rede, malformed ou unknown | Alerta inline seguro, valores preservados e retry manual. |

Erros `429` devem ser decididos por `code`, nunca apenas pelo status. Header e
body precisam ser estreitamente validados; valor ausente ou inválido usa copy
sem countdown e não cria um prazo inventado.

## Estados e edge cases

- Perfil carregando: skeleton/estado estável, sem inferir provider.
- Perfil falhou: erro da área de segurança continua próximo ao conteúdo.
- Provider removido entre leitura e submit: tratar código do backend e refazer
  `GET /users/me`.
- Quinta senha atual incorreta: pode retornar bloqueio imediatamente.
- Duplo clique/Enter: uma mutation por vez.
- Nova senha igual à atual: impedimento local e autoridade final no backend.
- Retry recebido em ambas as fontes: usar o valor inteiro válido; se divergirem,
  preferir o header exposto pela resposta e registrar a inconsistência apenas em
  ambiente de desenvolvimento, sem mostrar dados técnicos.
- Fechar/cancelar antes do envio limpa os valores sensíveis.
- Falha de mutation não limpa valores.
- Trocar visibilidade não dispara validação nem submit.
- Navegação para fora desmonta o diálogo e remove valores da memória local.
- Sucesso recebido, mas feedback visual falha: limpeza e redirect continuam
  prioritários.

## UX e acessibilidade

- Família Material 3: dialog para uma decisão/tarefa focada; text fields;
  filled button para concluir; text/outlined para cancelar; progress local.
- Mobile-first: largura limitada ao viewport, conteúdo rolável, footer estável e
  respeito à safe area; desktop usa diálogo compacto.
- Título: `Alterar senha`; supporting text explica que todas as sessões serão
  encerradas.
- Ordem: senha atual, nova senha, confirmar nova senha, alerta, ações.
- Submit: `Alterar senha`; pending: `Alterando...` sem mudança de dimensão.
- Cancelar, Escape e retorno de foco ao trigger funcionam quando não há request
  em andamento.
- Durante a mutation, fechamento acidental por backdrop/Escape deve ser
  impedido; o status de processamento precisa ser anunciado.
- Campos usam labels persistentes, `autoComplete="current-password"` e
  `autoComplete="new-password"`.
- Erros novos usam live region adequada e foco no primeiro campo afetado.
- Danfy tokens apenas; erros usam `destructive`, nunca `state-expense`.

## Critérios de aceite

- Apenas contas com provider `EMAIL` veem a ação funcional de alteração.
- O diálogo funciona em 320 px, desktop, teclado e leitor de tela.
- O request contém apenas `currentPassword` e `newPassword`.
- Sign-up exige confirmação idêntica e não envia `confirmPassword`.
- Todos os campos de senha possuem toggle acessível e consistente.
- Sign-in continua sem revelar a política de senha.
- Fluxos que criam/alteram senha usam um único schema central de 6–50.
- `PasswordStrength` não contradiz o schema/backend.
- Todos os códigos documentados possuem copy, superfície e recuperação
  explícitas.
- Retry temporário desabilita submit sem retry automático.
- Falhas preservam valores; cancelamento e sucesso os removem.
- Sucesso limpa auth/cache, notifica abas e redireciona ao login sem refresh.
- Testes cobrem schemas, DTOs, providers, toggles, diálogo, erros e sucesso.
- `npm run lint`, testes focados e `npm run build` passam.

## Gate de aprovação

Esta spec está proposta. Nenhuma implementação descrita aqui pode começar antes
da aprovação explícita de `requirements.md`, `design.md` e `tasks.md`.
