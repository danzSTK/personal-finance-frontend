---
area: transactions
feature: transaction-attachments
type: spec-tasks
status: current
last_reviewed: 2026-11-24
related:
  - ./requirements.md
  - ./design.md
  - ./decisions.md
---

# Tarefas de Implementação: Galeria de Anexos

- [x] **1. Contratos de Tipos e Serviços de API**
  - [x] 1.1 Criar `src/features/transactions/types/transaction-attachment.types.ts`
  - [x] 1.2 Atualizar `Transaction` em `transaction.types.ts` com `attachmentsCount?: number`
  - [x] 1.3 Implementar queries em `src/features/transactions/api/attachment.queries.ts`
  - [x] 1.4 Implementar mutations em `src/features/transactions/api/attachment.mutations.ts`
  - [x] 1.5 Mapear erros de anexo em `src/shared/errors/resolveApiError.ts`

- [x] **2. Componentes de UI (Atomic Design)**
  - [x] 2.1 Criar átomo `TransactionAttachmentBadge`
  - [x] 2.2 Criar molécula `TransactionAttachmentThumbnail` com suporte a drag-and-drop e menu de opções acessível
  - [x] 2.3 Criar molécula `TransactionAttachmentUploadCard`
  - [x] 2.4 Criar organismo `TransactionAttachmentImageViewer` (lightbox overlay com zoom e pan)
  - [x] 2.5 Criar organismo `TransactionAttachmentsGallery` com suporte mobile snap e desktop fade controls
  - [x] 2.6 Criar organismo `TransactionStagedAttachmentsField` para staging de anexos na criação

- [x] **3. Integração nas Telas Existentes e Refinamentos de UX**
  - [x] 3.1 Integrar `TransactionAttachmentsGallery` na `TransactionDetailsSheet`
  - [x] 3.2 Integrar `TransactionAttachmentBadge` na `TransactionsTable` (linhas desktop e cartões mobile)
  - [x] 3.3 Integrar anexos na `TransactionFormSheet` (modo `create` com staging e modo `edit` com galeria ao vivo), removendo placeholder "em breve"
  - [x] 3.4 Exibir data de criação no cabeçalho e data do pagamento na `TransactionDetailsSheet`
  - [x] 3.5 Padronizar divisores de dia (`dd/mm/aaaa`) na `TransactionsTable` para todas as visualizações e tipos
  - [x] 3.6 Restaurar scroll horizontal na `TransactionsKpiGrid` para mobile e todas as visualizações sem overflow de página
  - [x] 3.7 Remover descrição redundante do cabeçalho de `TransactionsPage`

- [x] **4. Testes e Qualidade**
  - [x] 4.1 Atualizar e adicionar testes unitários para os componentes alterados
  - [x] 4.2 Executar testes, linter e build do projeto

- [x] **5. Testes Visuais e Validação de Breakpoints**
  - [x] 5.1 Validar em mobile (375px/390px)
  - [x] 5.2 Validar em tablet (768px)
  - [x] 5.3 Validar em desktop (1280px+)
