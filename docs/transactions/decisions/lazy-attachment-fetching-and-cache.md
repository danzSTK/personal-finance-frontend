---
area: transactions
type: decision
status: current
last_reviewed: 2026-11-24
decision-id: DEC-TRX-003
decision-status: accepted
related:
  - ../README.md
  - ../concepts/transaction-attachments-model.md
  - ../flows/manage-attachments.md
  - ../components/attachment-gallery-and-viewer.md
  - ../reference/api-and-contracts.md
  - ../../specs/transactions/transaction-attachments/specs/design.md
---

# DEC-TRX-003: Busca sob demanda e retenção de cache de anexos (`240s`)

## Problema

As URLs pré-assinadas (`presigned URLs`) emitidas pelo backend para leitura de comprovantes têm validade de `300s` (5 minutos). Carregar anexos junto à listagem paginada de transações geraria tráfego desnecessário e alto risco de URLs expirarem enquanto o usuário navega pela tela.

## Decisão

1. A listagem `GET /transactions` retorna apenas o contador inteiro `attachmentsCount`, usado por `TransactionAttachmentBadge` para sinalizar presença de comprovantes sem disparar chamadas adicionais.
2. Os anexos completos (`GET /transactions/:id/attachments`) são carregados sob demanda apenas quando o usuário abre a `TransactionDetailsSheet` ou o `TransactionFormSheet` em modo de edição para transações elegíveis (`INCOME` e `EXPENSE`).
3. A query `useTransactionAttachments` configura `staleTime: 240_000` (4 minutos), alinhado ao `cacheMaxAgeSeconds: 240` informado pelo backend, deixando uma margem de segurança de 60 segundos antes da expiração real das URLs (`300s`).

## Consequência

- Consumo mínimo de banda na listagem principal `/transactions`.
- Redução drástica de imagens quebradas por expiração de presigned URLs durante a sessão.
- **Gap observado no código atual:** `TransactionAttachmentsGallery` habilita a query com `enabled: isEligible`, sem checar `attachmentsCount > 0` no modo detalhes — uma oportunidade de otimização registrada em [api-and-contracts.md](../reference/api-and-contracts.md).
