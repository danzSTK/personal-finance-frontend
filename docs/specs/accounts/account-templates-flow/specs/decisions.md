---
area: accounts
feature: account-templates-flow
type: spec-decisions
status: approved
approved-at: 2026-08-29
related:
  - ./requirements.md
  - ./design.md
  - ./tasks.md
---

# Fluxo de contas por template — decisões

## DEC-001 — criação começa pela identidade

Status: accepted

Decision:
Abrir toda nova criação na escolha entre catálogo institucional e conta
personalizada; somente depois mostrar os dados financeiros da conta.

Reason:
O template define campos, defaults e possibilidades de personalização. A ordem
reduz decisões irrelevantes e se adapta melhor ao espaço mobile.

Impact:
`AccountFormSheet` passa a coordenar duas etapas e precisa preservar estado,
foco, scroll e retorno.

## DEC-002 — template é a fonte visual primária

Status: accepted

Decision:
Resolver logo, ícone e cor por `account.template`, usando `account.color` e
`account.icon` somente como fallback durante `DB-COMPAT-002`.

Reason:
O novo contrato centraliza identidade institucional e customizada em
`AccountTemplate`; continuar lendo a raiz como fonte principal perpetuaria o
contrato deprecated.

Impact:
Cards e transactions passam a compartilhar um resolver/componente de accounts,
com tolerância explícita a dados legados e tokens desconhecidos.

## DEC-003 — edição não muda a classe da identidade nesta entrega

Status: accepted

Decision:
Permitir editar metadados customizados de contas `CUSTOM`, mas não trocar uma
conta institucional para outra instituição/custom nem promover custom para
institucional no fluxo de edição desta entrega.

Reason:
Trocar a instituição que representa uma conta financeira existente exige copy,
confirmação e critérios próprios para evitar uma mudança semântica acidental. O
pedido atual prioriza criação e adaptação segura de update ao contrato novo.

Impact:
Update institucional envia apenas campos de account. Update custom envia o
branch customizado quando sua identidade muda. Uma futura troca de identidade
exigirá decisão e requisitos próprios.

## DEC-004 — saldo inicial é informativo no update

Status: accepted

Decision:
Mostrar `initialBalanceCents` como dado somente leitura ao editar.

Reason:
`PATCH /accounts/:id` não aceita esse campo. Um controle editável criaria uma
promessa que o backend não cumpre.

Impact:
O mapper de update nunca inclui saldo inicial e a UI diferencia claramente dado
financeiro informativo de campo editável.

## DEC-005 — movimento curto, direcional e dispensável

Status: accepted

Decision:
Usar transição interna de 200 ms: etapa anterior desloca para a esquerda ao
avançar e o formulário entra pela direita; o inverso ocorre ao voltar. Remover
o deslocamento sob `prefers-reduced-motion`.

Reason:
A direção explica continuidade sem teatralidade e atende à preferência de
movimento do usuário.

Impact:
O sheet precisa de viewport interno com overflow controlado e gestão de foco,
sem depender da animação para comunicar a etapa ativa.

## DEC-006 — gradiente de identidade é um experimento contido

Status: accepted

Decision:
Aplicar apenas ao painel de detalhes um gradiente inferior de baixa intensidade
derivado de token, mantendo conteúdo e superfícies principais em Danfy Dark.

Reason:
Isso testa reconhecimento da conta sem transformar toda a tela em uma superfície
de marca ou comprometer leitura financeira.

Impact:
O efeito fica centralizado no mapa de tons, pode ser removido sem alterar dados
ou composição e deve passar contraste AA.
