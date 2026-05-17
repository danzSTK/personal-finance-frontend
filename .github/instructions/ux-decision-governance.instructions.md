---
applyTo: 'src/**/*.{ts,tsx}'
description: 'UX decision governance for Danfy Finance screens, flows, states, modals, accessibility, and charts'
---

# UX Decision Governance

Antes de implementar ou revisar qualquer tela, componente ou fluxo, responda:

1. Qual é a ação principal desta tela?
2. Qual informação o usuário precisa ver primeiro?
3. A cor está comunicando significado, enfeite ou ambos?
4. Este botão tem o mesmo comportamento em outras telas?
5. Se der erro, o usuário sabe o que aconteceu e o que fazer?
6. Se estiver carregando, vazio, offline, sem autorização ou sem dados, a tela continua decente?
7. Consigo usar esse fluxo sem mouse?
8. Os gráficos ajudam a tomar decisão ou só estão bonitos?

Se uma resposta for fraca, ajuste o fluxo antes de melhorar a estética.

## Erros

- Erro precisa ser acionável: o que falhou, impacto e próximo passo.
- Erro de campo fica perto do campo.
- Erro crítico ou bloqueante fica perto da região afetada; toast sozinho não basta.
- Nunca mostrar stack trace, mensagem crua do backend ou código técnico sem contexto humano.

## Modal, Sheet e Inline

- Preferir inline para edição normal, filtros, dicas e detalhes não bloqueantes.
- Usar modal/dialog apenas para decisão focada, confirmação destrutiva ou informação crítica.
- Usar sheet/drawer para criação/edição contextual sem abandonar a tela atual.
- Todo dialog precisa de título claro, corpo curto, ação principal e cancelar/fechar visível.

## Loading, Empty e Sem Dados

- Loading deve preservar layout com skeleton, botão pending ou indicador no painel correto.
- Empty state deve dizer o que falta e o que aparecerá quando houver dados.
- Não inventar dados financeiros para preencher gráficos, transações ou saldos.

## Acessibilidade

- Fluxos principais devem funcionar sem mouse.
- Elementos interativos precisam de foco visível e nome acessível.
- Não depender só de cor para estado financeiro; usar sinal, label, ícone ou texto.

## Gráficos

- Use gráfico apenas quando ele ajuda a decidir: tendência, comparação, categoria dominante, vencimento ou risco.
- Se a decisão fica mais clara como número, lista ou tabela, não use gráfico.
- Gráficos precisam de label/legenda e empty state honesto.
