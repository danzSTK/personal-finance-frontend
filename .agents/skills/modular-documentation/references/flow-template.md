# Flow Template

Use este modelo para documentar fluxos operacionais e jornadas de usuário em `docs/<modulo>/flows/`.

```markdown
---
area: <modulo>
type: flow
status: current
related:
  - ../README.md
  - ../concepts/<conceito>.md
  - ../decisions/<decisao>.md
  - ../components/<componentes>.md
---

# <Nome do Fluxo>

Objetivo funcional em 1 a 2 frases.

## Atores, Pré-condições e Pontos de Entrada

- **Ator:** usuário autenticado / visitante / sessão pendente de verificação.
- **Pré-condições:** capacidade exigida (ex.: provider `EMAIL`, conta ativa, filtro de período).
- **Rotas frontend:** `/rota-1`, `/rota-2`.
- **Pontos de entrada:** botão, deep link, redirect ou callback.

## Fluxo Principal e Alternativos

Inclua um diagrama Mermaid (`flowchart LR` ou `sequenceDiagram`) quando três ou mais passos/ramificações ficarem mais claros visualmente.

1. Passo observável 1.
2. Passo observável 2.
3. Passo observável 3.

## Estados de Interface e Recuperação

| Estado | Comportamento observado | Recuperação / Próximo passo |
| --- | --- | --- |
| Loading | Skeleton ou indicador local sem salto de layout | Aguarda resolução |
| Empty | Mensagem clara e CTA primário quando aplicável | Criar item / limpar filtros |
| Pending | Controle desabilitado preservando dados digitados | Evita duplo envio |
| Success | Invalidação mínima de cache e feedback adequado | Atualiza lista/detalhe |
| Error | `ApiErrorAlert`, erro de campo ou toast conforme gravidade | Retry, correção de campo ou login |

## Segurança e Privacidade

- Regras relevantes (cookies HttpOnly, ausência de `userId` no payload, ausência de tokens em URL, copy segura sem vazar detalhes internos).

## Consumo de Backend

| Operação | Autenticação | Contrato relevante | Efeito / Cache | Erros e recuperação | Fonte |
| --- | --- | --- | --- | --- | --- |
| `METHOD /caminho` | Cookie HttpOnly / Pública | Params/body principais | Query key ou invalidação | Códigos tratados e ação UX | `personal-finance-backend:docs/integrations/...` |
```
