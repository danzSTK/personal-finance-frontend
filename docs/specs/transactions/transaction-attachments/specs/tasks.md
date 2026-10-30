# Tarefas de Implementação: Galeria de Anexos

- [ ] **1. Contratos de Tipos e Serviços de API**
  - [ ] 1.1 Criar `src/features/transactions/types/transaction-attachment.types.ts`
  - [ ] 1.2 Atualizar `Transaction` em `transaction.types.ts` com `attachmentsCount: number`
  - [ ] 1.3 Implementar queries em `src/features/transactions/api/attachment.queries.ts`
  - [ ] 1.4 Implementar mutations em `src/features/transactions/api/attachment.mutations.ts`
  - [ ] 1.5 Implementar formatador e mapeador de erros em `src/features/transactions/utils/attachment-error.utils.ts`

- [ ] **2. Componentes de UI (Atomic Design)**
  - [ ] 2.1 Criar átomo `TransactionAttachmentBadge`
  - [ ] 2.2 Criar molécula `TransactionAttachmentThumbnail` com suporte a drag-and-drop e menu de opções acessível
  - [ ] 2.3 Criar molécula `TransactionAttachmentUploadCard`
  - [ ] 2.4 Criar organismo `TransactionAttachmentImageViewer` (lightbox overlay com zoom e pan)
  - [ ] 2.5 Criar organismo `TransactionAttachmentsGallery` com suporte mobile snap e desktop fade controls

- [ ] **3. Integração nas Telas Existentes**
  - [ ] 3.1 Integrar `TransactionAttachmentsGallery` na `TransactionDetailsSheet`
  - [ ] 3.2 Integrar `TransactionAttachmentBadge` na `TransactionsTable` (linhas desktop e cartões mobile)

- [ ] **4. Testes e Qualidade**
  - [ ] 4.1 Escrever testes unitários para queries/mutations e componentes
  - [ ] 4.2 Executar linter e build do projeto

- [ ] **5. Testes Visuais e Validação de Breakpoints**
  - [ ] 5.1 Validar em mobile (375px/390px)
  - [ ] 5.2 Validar em tablet (768px)
  - [ ] 5.3 Validar em desktop (1280px+)
