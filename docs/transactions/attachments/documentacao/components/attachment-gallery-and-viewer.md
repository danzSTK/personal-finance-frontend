# Componentes: Galeria e Visualizador de Anexos

Documenta os componentes do módulo de galeria de comprovantes.

## 1. `TransactionAttachmentBadge` (Atom)
- **Responsabilidade**: Exibir na listagem (tabela e cards mobile) a quantidade de anexos vinculados (`X anexo(s)`).
- **Semântica**: Ícone de clipe (`Paperclip`) com texto conciso, oculto quando `attachmentsCount === 0`.

## 2. `TransactionAttachmentThumbnail` (Molecule)
- **Responsabilidade**: Renderizar o cartão de miniatura da imagem (proporção retangular com `object-cover`), suporte a toque/arraste para reordenação, menu acessível de ações (`...`) e gatilho de clique para abrir o visualizador ampliado.
- **Estados**: Normal, hover, focado, arrastando (`opacity-90`, `scale-105`), desabilitado.

## 3. `TransactionAttachmentUploadCard` (Molecule)
- **Responsabilidade**: Área de adição de novo comprovante. Exibida enquanto `attachments.length < 3`. Suporta drag-and-drop de arquivo e clique para selecionar via diálogo do sistema.

## 4. `TransactionAttachmentsGallery` (Organism)
- **Responsabilidade**: Compor as miniaturas e o slot de upload.
- **Responsividade**:
  - **Mobile**: Faixa horizontal com rolagem suave por toque, `snap-x` e peek da próxima imagem.
  - **Desktop**: Ocultação da barra de rolagem nativa, navegação por botões `<` e `>` combinados a degradês laterais de fade.

## 5. `TransactionAttachmentImageViewer` (Organism)
- **Responsabilidade**: Modal overlay em tela cheia (fundo escuro translúcido) para inspeção da imagem em alta resolução.
- **Recursos**: Zoom suave (1x a 3x via duplo toque/clique e botões explícitos), pan com arraste, navegação por setas e fechamento via `Esc`.
