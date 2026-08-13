---
area: auth
feature: change-password
type: spec-decisions
status: current
related:
  - ./requirements.md
  - ./design.md
  - ./tasks.md
---

# Decisões — segurança e alteração de senha

## DEC-001 — ação condicionada ao provider `EMAIL`

Status: accepted

Decision:
A UI usa `GET /users/me.providers[]` para disponibilizar alteração de senha.
`EMAIL+GOOGLE` é permitido; `GOOGLE` only não recebe o formulário.

Reason:
Alterar senha exige uma credencial local existente. Mostrar o formulário para
OAuth-only cria um beco sem saída previsível.

Alternatives considered:

- Mostrar sempre e deixar o backend rejeitar: feedback tardio e evitável.
- Criar provider dentro do diálogo: mistura dois fluxos e está fora de escopo.

Impact:
`SecuritySettings` continua tratando o erro de provider como defesa contra
estado stale.

## DEC-002 — dialog em vez de sheet ou formulário inline

Status: accepted

Decision:
Usar um Material 3 dialog responsivo para a tarefa focada de alteração de senha.

Reason:
A operação exige atenção, senha atual, consequência global sobre sessões e uma
conclusão explícita. O usuário pediu popup e o caso se enquadra na regra de
decisão focada do design system.

Alternatives considered:

- Inline permanente: expõe campos sensíveis e aumenta ruído na página.
- Sheet: adequado a edição contextual comum, mas menos coerente com a decisão de
  segurança focada solicitada.

Impact:
O diálogo deve ser mobile-first, rolável, acessível e nunca empilhado.

## DEC-003 — política central igual ao contrato backend

Status: accepted

Decision:
Centralizar um schema de 6–50 caracteres e reutilizá-lo em fluxos que criam ou
alteram senha. Não inventar regex de maiúscula, minúscula ou número.

Reason:
DTOs atuais de sign-up, vínculo e alteração usam os mesmos limites. O frontend
não deve aceitar/rejeitar de modo diferente da API.

Alternatives considered:

- Manter schemas independentes: favorece drift.
- Tornar a política mais forte só no frontend: cria contrato falso e impede
  senhas que o backend aceita.

Impact:
`PasswordStrength` precisa deixar claro o que é requisito e o que é apenas
recomendação; seu checklist atual não é fonte de validação.

## DEC-004 — sign-in não usa a política estrutural

Status: accepted

Decision:
No sign-in, validar somente presença da senha.

Reason:
Login verifica uma credencial existente e não deve revelar nem presumir a
política usada quando ela foi criada.

Impact:
Mudanças futuras na política de criação não impedem login com credenciais
legadas válidas.

## DEC-005 — confirmações são exclusivamente locais

Status: accepted

Decision:
Adicionar confirmação ao sign-up e change-password, mas removê-la explicitamente
antes de montar os DTOs.

Reason:
Confirmação previne erro de digitação; não é dado de domínio nem acrescenta
segurança ao backend.

Impact:
Types de form e DTO permanecem separados e testes fixam a ausência dos campos.

## DEC-006 — toggle implementado no `FormField`

Status: accepted

Decision:
Evoluir a molecule existente para fornecer o mesmo toggle quando o tipo for
senha, em vez de criar wrappers diferentes por formulário.

Reason:
Garante consistência em todos os campos e respeita Atomic Design: uma molecule
não precisa importar outra molecule para reutilizar `FormField`.

Impact:
Todos os usos atuais recebem o padrão; testes de regressão precisam cobrir
prefixos, padding, erros e disabled.

## DEC-007 — erros por `code` e retry tipado

Status: accepted

Decision:
Adicionar códigos ao catálogo compartilhado e estender a apresentação com retry
estritamente validado. O organismo usa deadline absoluto e nunca auto-retry.

Reason:
Todos os `429` têm significados diferentes. Status ou mensagem não são contratos
suficientes, e repetir mutation pode ser inseguro.

Impact:
O parser compartilhado ganha cobertura para header/body sem expor detalhes
técnicos.

## DEC-008 — preservar valores em falhas, limpar em cancelamento/sucesso

Status: accepted

Decision:
Manter as senhas no estado local do formulário após falha da mutation; limpá-las
ao cancelar, desmontar ou concluir.

Reason:
Evita perda de trabalho e segue o padrão de erros da plataforma sem persistir
segredos fora da memória do componente.

Impact:
Nenhum valor entra em logs, storage, query cache ou store global.

## DEC-009 — sucesso encerra estado local sem novo request

Status: accepted

Decision:
Depois de `CHANGED`, limpar auth e QueryClient, comunicar logout entre abas e
navegar para sign-in. Não chamar refresh nem logout HTTP.

Reason:
O backend já revogou todas as sessões e expirou cookies. Um request posterior é
desnecessário e pode gerar recuperação contraditória.

Impact:
O login recebe feedback de sucesso; a UI não afirma entrega do email assíncrono.

## DEC-010 — contrato público `429` prevalece para operação pendente

Status: accepted

Decision:
Documentar `PASSWORD_CHANGE_OPERATION_PENDING` como `429`, mas continuar
decidindo a interface pelo code.

Reason:
Integração pública, spec aprovada do backend e filtro HTTP atual usam `429`; um
documento interno de fluxo está desatualizado com `409`.

Impact:
A divergência deve ser reportada/corrigida no backend separadamente, sem bloquear
o frontend nem criar branching por status.

## DEC-011 — documentação local sem antecipar a skill da spec 2

Status: accepted

Decision:
Criar os três documentos vivos de `auth/change-password` manualmente no formato
aprovado, sem criar a skill documental nem migrar documentação de outros módulos
nesta execução.

Reason:
O usuário aprovou a execução da spec 1. A skill e a padronização global pertencem
à spec 2 e ainda não foram aprovadas para implementação.

Impact:
Esta feature recebeu a documentação inicial disponível naquele momento. A spec 2
substituiu o formato monolítico pelas árvores `decisions/`, `flow/` e
`components/`, preservando e redistribuindo o conteúdo.

## DEC-012 — provider define capacidade e status define disponibilidade

Status: accepted

Decision:
Manter `GET /users/me.providers[]` como gate de existência da credencial local e
usar `GET /auth/password/change/status` como gate operacional antes de habilitar
o trigger. `status: false` nunca revela a causa e o relógio local apenas agenda
uma nova consulta; somente novo `status: true` libera a ação.

Reason:
O use case do backend avalia bloqueio, cooldown, limite diário e mutação
pendente, mas não verifica provider `EMAIL`. Unir os dois sinais evita tanto um
formulário impossível para OAuth-only quanto um botão permissivo durante uma
restrição temporal.

Alternatives considered:

- Substituir providers pelo status: o endpoint não garante existência de senha
  local.
- Habilitar automaticamente ao zerar o timer: o estado pode ter mudado e o
  contrato declara a consulta como apenas informativa.

Impact:
O frontend consome uma query adicional somente para contas com provider local,
desabilita de forma fechada em falha e calcula data/hora local a partir do
`Retry-After`, sem persistir ou expor o motivo da restrição.
