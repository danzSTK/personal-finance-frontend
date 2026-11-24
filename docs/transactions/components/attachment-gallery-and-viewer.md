---
area: transactions
type: component
status: current
last_reviewed: 2026-11-24
related:
  - ../README.md
  - ../concepts/transaction-attachments-model.md
  - ../flows/manage-attachments.md
  - ../decisions/lazy-attachment-fetching-and-cache.md
  - ../decisions/dual-reordering-drag-and-accessible-menu.md
  - ./transaction-screen-components.md
  - ../reference/api-and-contracts.md
---

# Galeria de Anexos, Staging e Lightbox

Este documento detalha os componentes responsáveis pela sinalização, upload, staging local, reordenação e visualização em tela cheia de comprovantes em `src/features/transactions/components/`.

## Árvore de Componentes

```text
Listagem (TransactionRow / TransactionMobileItem)
└── TransactionAttachmentBadge (atoms/)

TransactionDetailsSheet / TransactionFormSheet (modo edit)
└── TransactionAttachmentsGallery (organisms/)
    ├── TransactionAttachmentThumbnail (molecules/) × N (0..3)
    │   └── Menu acessível ("...") [Mover esquerda | Mover direita | Excluir]
    ├── TransactionAttachmentUploadCard (molecules/)  [quando attachments.length < 3]
    └── TransactionAttachmentImageViewer (organisms/) [portal fullscreen]

TransactionFormSheet (modo create)
└── TransactionStagedAttachmentsField (organisms/)
    ├── TransactionAttachmentThumbnail (molecules/) × N (0..3)
    ├── TransactionAttachmentUploadCard (molecules/)  [quando staged.length < 3]
    └── TransactionAttachmentImageViewer (organisms/) [portal fullscreen]
```

## Inventário por Camada (Atomic Design)

### 1. `TransactionAttachmentBadge` (Atom)
- **Responsabilidade:** exibir na listagem (`TransactionRow` e `TransactionMobileItem`) a quantidade de anexos vinculados (`X anexo(s)`).
- **Semântica:** ícone `Paperclip` com texto conciso; oculto automaticamente quando `attachmentsCount === 0` ou quando a transação não é elegível.

### 2. `TransactionAttachmentThumbnail` (Molecule)
- **Responsabilidade:** renderizar a miniatura retangular (`object-cover`) de um comprovante (persistido ou em staging), oferecer arraste por toque/pointer para reordenação, menu acessível (`...`) e clique principal para abrir o lightbox.
- **Estados:** normal, hover, focado (`focus-visible`), arrastando (`opacity-90`, `scale-105`), desabilitado/em mutação.
- **Acessibilidade:** o menu `...` oferece explicitamente **"Mover para a esquerda"**, **"Mover para a direita"** e **"Excluir"** (ver [`DEC-TRX-004`](../decisions/dual-reordering-drag-and-accessible-menu.md)).

### 3. `TransactionAttachmentUploadCard` (Molecule)
- **Responsabilidade:** área interativa para adicionar novo comprovante; visível apenas enquanto o total for menor que `3`.
- **Interações:** suporta drag-and-drop de arquivo e clique para abrir o seletor nativo do sistema, validando MIME (`image/jpeg`, `image/png`, `image/webp`) e tamanho máximo (`5 MiB`) antes do envio.

### 4. `TransactionAttachmentsGallery` (Organism)
- **Responsabilidade:** orquestrar `useTransactionAttachments`, `useUploadTransactionAttachment`, `useReorderTransactionAttachments` e `useDeleteTransactionAttachment` para transações já persistidas (`TransactionDetailsSheet` e `TransactionFormSheet` em modo `edit`).
- **Responsividade:**
  - **Mobile:** faixa horizontal com rolagem suave por toque, `snap-x` e *peek* da próxima imagem.
  - **Desktop:** ocultação da barra de rolagem nativa, navegação por botões `<` e `>` combinados a degradês laterais de fade.
- **Gaps observados no código atual:**
  - A query usa `enabled: isEligible` sem restringir a `attachmentsCount > 0` em modo detalhes.
  - Falha na query de listagem ainda não renderiza `ApiErrorAlert` inline.
  - A ação **Excluir** no menu `...` executa a mutação imediatamente sem modal de confirmação.

### 5. `TransactionStagedAttachmentsField` (Organism)
- **Responsabilidade:** gerenciar em estado local (memória do formulário, via `URL.createObjectURL`) até 3 comprovantes durante a criação de uma nova receita ou despesa (`TransactionFormSheet` modo `create`).
- **Reutilização e ciclo de vida:** reutiliza `TransactionAttachmentThumbnail`, `TransactionAttachmentUploadCard` e `TransactionAttachmentImageViewer`, revoga `objectURL` ao remover/desmontar e entrega os arquivos para upload sequencial imediato após `POST /transactions` concluir com sucesso.

### 6. `TransactionAttachmentImageViewer` (Organism)
- **Responsabilidade:** modal overlay em tela cheia (fundo escuro translúcido) para inspeção do comprovante em alta resolução.
- **Recursos:** zoom suave (`1x` a `3x`) via duplo clique/toque e botões explícitos, pan com arraste quando ampliado, navegação entre anexos por setas/teclado (`ArrowLeft`, `ArrowRight`) e fechamento via `Esc` ou botão dedicado.
