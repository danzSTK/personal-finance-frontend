---
area: accounts
feature: account-templates-flow
type: spec-tasks
status: approved
approved-at: 2026-08-29
related:
  - ./requirements.md
  - ./design.md
  - ./decisions.md
---

# Fluxo de contas por template — tarefas

- [x] 1. Adicionar os tipos discriminados de account template, os novos campos
     de `Account` e os DTOs create/update sem identidade legada na raiz.
- [x] 2. Adicionar endpoint, query key e `useAccountTemplates` com loading,
     empty, erro e retry tipados.
- [x] 3. Adicionar os tokens CSS institucionais/customizados e o mapa estático
     de tons/gradientes sem cores literais nos componentes.
- [x] 4. Criar o resolver puro de identidade com prioridade template → legado →
     fallback e cobri-lo com testes.
- [x] 5. Criar `AccountIdentity` e `AccountTemplateOption` nas camadas Atomic
     Design corretas, incluindo fallback de imagem e acessibilidade.
- [x] 6. Criar o catálogo rolável `AccountTemplatePicker` com skeleton, vazio,
     erro, retry e ação personalizada persistente.
- [x] 7. Separar schemas e mappers dos fluxos institutional/custom create e
     custom/legacy update, incluindo field errors aninhados.
- [x] 8. Refatorar `AccountFormSheet` para criação em duas etapas, movimento de
     200 ms, reduced motion, foco e preservação de valores.
- [x] 9. Adaptar o modo edit para identidade institucional imutável,
     customização por template e saldo inicial somente leitura.
- [x] 10. Atualizar `AccountCard` e painel de detalhes com logo/ícone e gradiente
      inferior derivado de token.
- [x] 11. Reutilizar `AccountIdentity` nos seletores, filtros, confirmação e
      detalhes de transactions, removendo resolvers visuais duplicados.
- [x] 12. Adicionar `accounts.templates` e os códigos de template ao tratamento
      compartilhado de erros, com cópia/recovery e testes.
- [x] 13. Adicionar testes focados de query, forms, navegação, payloads,
      fallback de logo e consumo cross-feature.
- [x] 14. Criar a documentação viva de decisions, flow e components para
      account templates e registrar dependências de transactions.
- [x] 15. Executar `npm run lint`, testes focados e `npm run build`; corrigir
      regressões sem alterar o contrato aprovado.
