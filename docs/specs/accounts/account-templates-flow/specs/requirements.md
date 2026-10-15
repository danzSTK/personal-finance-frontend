---
area: accounts
feature: account-templates-flow
type: spec-requirements
status: approved
approved-at: 2026-08-29
related:
  - ./design.md
  - ./tasks.md
  - ./decisions.md
---

# Fluxo de contas por template — requisitos

Spec aprovada pelo usuário em 29/08/2026.

## Objetivo

Alinhar criação, atualização e representação visual de contas ao contrato de
`AccountTemplate`, com um fluxo de criação mobile-first em duas etapas e uma
identidade consistente em contas e transações.

## Fontes do contrato

- `personal-finance-backend/docs/integrations/accounts/README.md`
- `personal-finance-backend/docs/integrations/accounts/list-account-templates.md`
- `personal-finance-backend/docs/integrations/accounts/create-account.md`
- `personal-finance-backend/docs/integrations/accounts/update-account.md`
- `personal-finance-backend/docs/integrations/accounts/list-accounts.md`
- `personal-finance-backend/docs/integrations/errors.md`
- `personal-finance-backend/docs/accounts/concepts/account-template.md`
- `personal-finance-backend/docs/accounts/decisions/account-visual-identity-uses-templates.md`
- `docs/design-system/danfy-finance-design-system.md`
- `docs/design-system/material-3-reference.md`

## Escopo

- Consumir `GET /account-templates` com TanStack Query.
- Modelar `templateId` e `template` no tipo de resposta de account.
- Migrar create/update para o objeto discriminado `template`.
- Criar conta institucional ou personalizada em um sheet de duas etapas.
- Manter atualização coerente para contas institucionais, customizadas e
  legadas sem template durante `DB-COMPAT-002`.
- Renderizar logo institucional ou ícone customizado nos cards e nos pontos de
  seleção/detalhe de conta em transactions.
- Mapear os dez `colorToken` institucionais para tokens locais do design system.
- Aplicar um gradiente inferior sutil, derivado da identidade da conta, ao
  painel de detalhes aberto pelo card.
- Cobrir loading, vazio, erro, retry, pending, teclado e redução de movimento.
- Atualizar a documentação viva de accounts e os pontos cross-feature de
  transactions após a implementação.

## Fora de escopo

- Criar, editar ou desativar o catálogo institucional no frontend.
- Consultar BrasilAPI, CDN de origem, bucket ou storage key.
- Upload de logo personalizada.
- Criar `CASH` manualmente.
- Editar `initialBalanceCents` após a criação.
- Trocar a instituição de uma conta institucional existente nesta entrega.
- Transformar uma conta institucional em customizada, ou o inverso, pela tela
  de edição nesta entrega.
- Remover os fallbacks legados `account.color` e `account.icon` enquanto
  `DB-COMPAT-002` estiver ativo.

## Regras de negócio

### Identidade visual

1. A identidade visual nova vem primeiro de `account.template`.
2. Template `INSTITUTIONAL` usa `template.logoUrl` e
   `template.colorToken`; seu logo, cor e metadados bancários não são
   editáveis.
3. Template `CUSTOM` usa `template.iconKey` e `template.colorToken`.
4. Se `template` estiver nulo durante a compatibilidade, a UI usa
   `account.icon` e `account.color`; se também estiverem ausentes ou forem
   desconhecidos, usa o ícone coerente com `account.type` e um tom neutro.
5. A UI nunca constrói uma URL de logo. Ela usa exclusivamente `logoUrl`.
6. Falha de carregamento do logo mantém nome e fallback de ícone visíveis.
7. Cor nunca é a única forma de distinguir a conta.

### Criação institucional

1. WHEN o usuário aciona `+ Nova conta`, THE SYSTEM SHALL abrir a etapa
   `Escolha como criar`.
2. A etapa inicial lista templates institucionais ativos em uma região rolável
   do próprio sheet, com logo e nome.
3. Uma ação `Criar personalizada` permanece acessível fora da região rolável.
4. WHEN um template institucional é escolhido, THE SYSTEM SHALL avançar para
   `Nova conta`, exibir logo e nome da instituição e preencher o nome da conta
   com o nome do template.
5. O nome preenchido é apenas default e permanece editável.
6. O formulário institucional contém nome, saldo inicial e `Incluir nos
totais`; o tipo enviado é `BANK` e não aparece como uma escolha na V0.
7. O submit envia `template: { type: "institutional", templateId }` e nunca
   combina `template` com `color` ou `icon` legados.

### Criação personalizada

1. WHEN o usuário escolhe `Criar personalizada`, THE SYSTEM SHALL avançar para
   `Conta personalizada`.
2. O formulário contém nome, tipo apresentado como `Conta bancária`, saldo
   inicial, cor, ícone e `Incluir nos totais`.
3. Na V0 o tipo é fixo como `BANK`, consistente com o formulário atual e com o
   foco inicial do produto.
4. O submit envia `template: { type: "custom", colorToken, iconKey }` e não
   envia `color`/`icon` na raiz.

### Atualização

1. Conta institucional mostra sua identidade curada e permite editar nome,
   tipo somente como informação e `Incluir nos totais`.
2. Conta customizada permite editar nome, cor, ícone e `Incluir nos totais`;
   sua mutation envia o branch `template.type="custom"`.
3. Conta legada sem template é tratada como personalizada e sua primeira
   atualização visual usa o contrato novo customizado.
4. Saldo inicial é mostrado como informação não editável, porque o endpoint de
   update não o aceita.
5. Conta `CASH` não troca de tipo e continua sem ações de criar, arquivar ou
   excluir manualmente.
6. Falha de mutation mantém o sheet aberto, preserva todos os valores e mostra
   o erro no formulário.

### Movimento e navegação

1. Ao avançar, a lista desloca levemente para a esquerda e o formulário entra
   pela direita.
2. Ao voltar, o formulário sai pela direita e a lista retorna pela esquerda.
3. A transição dura entre 180 e 250 ms, com preferência por 200 ms.
4. Com `prefers-reduced-motion: reduce`, a troca ocorre sem deslocamento.
5. Após a transição, o foco vai para o título da etapa; `Escape` fecha o sheet
   e o botão voltar retorna à etapa anterior sem perder o formulário já
   digitado.

### Detalhes, cards e transactions

1. O card de account mostra logo institucional quando disponível; caso
   contrário mostra ícone customizado/fallback.
2. O painel de detalhes usa um gradiente de baixo para cima com baixa
   intensidade da cor predominante e preserva contraste AA.
3. A identidade visual reutilizável aparece nos seletores de conta, filtros,
   confirmação e detalhes de transactions.
4. A lista tabular de transactions pode manter o texto compacto quando espaço
   for crítico, mas qualquer affordance visual de conta já existente deve usar
   a identidade nova.

## Estados e casos de borda

- Loading do catálogo: skeletons preservam o espaço da lista e a ação
  personalizada continua disponível.
- Catálogo vazio: explicar que não há instituições disponíveis agora e manter
  `Criar personalizada` utilizável.
- Erro do catálogo: alerta inline com `Tentar novamente`; não fechar o sheet.
- Template removido/inativado entre seleção e submit: preservar o formulário,
  voltar à escolha mediante ação explícita e recarregar o catálogo.
- Logo quebrado, vazio ou bloqueado: renderizar fallback local sem layout shift.
- `colorToken`/`iconKey` desconhecido: usar tom/ícone neutro e não bloquear a
  conta.
- Conta institucional inativa já associada: continuar renderizando os dados
  devolvidos em `account.template`.
- Account legada com `template=null`: manter compatibilidade visual.
- Clique repetido durante submit: botão desabilitado e uma única mutation.
- Voltar da etapa 2: manter os valores locais até fechar explicitamente o
  sheet; ao reabrir para nova criação, resetar o fluxo.

## Critérios de aceite

- [ ] `GET /account-templates` é chamado pelo endpoint documentado e usa query
      key própria.
- [ ] A primeira etapa do create é uma lista rolável de logos e nomes, com
      estados loading, vazio, erro e retry.
- [ ] Escolher Nubank preenche `Nubank` como nome default editável.
- [ ] Create institucional envia somente o branch institucional de `template`.
- [ ] Create custom envia somente o branch customizado de `template`.
- [ ] Update custom envia `colorToken`/`iconKey` dentro de `template`.
- [ ] Update institucional não oferece edição de logo/cor institucional.
- [ ] Update não envia `initialBalanceCents`.
- [ ] Cards e os controles de account em transactions mostram logo ou fallback
      sem depender de `account.color`/`account.icon` como fonte primária.
- [ ] Os tokens `nubank`, `inter`, `itau`, `bradesco`, `santander`,
      `banco-do-brasil`, `caixa`, `c6`, `picpay` e `mercado-pago` possuem
      mapeamento explícito em tokens CSS do produto.
- [ ] O painel de detalhes usa gradiente inferior sutil e legível.
- [ ] A troca interna entre etapas dura 200 ms e respeita redução de movimento.
- [ ] Erros de campo são aplicados ao React Hook Form e erros bloqueantes usam
      `ApiErrorAlert`.
- [ ] Testes cobrem DTOs, fallback visual, catálogo e navegação entre etapas.
- [ ] `npm run lint`, testes focados e `npm run build` passam.
