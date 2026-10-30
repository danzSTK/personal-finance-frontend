# Requisitos: Galeria de Anexos de Transações

## 1. Contexto & Escopo
Permitir a visualização, upload, reordenação e exclusão de até 3 comprovantes (PNG, JPEG, WebP de até 5 MB) vinculados a transações dos tipos \`INCOME\` e \`EXPENSE\`.
A experiência é estritamente **Mobile-First**, aderente aos princípios do **Apple Human Interface Guidelines (HIG)** e componentes do **Material 3 (M3)**, garantindo acessibilidade (WCAG 2.2) e retenção inteligente de cache.

## 2. Requisitos de Usuário e Negócio
- **R1: Indicador na Listagem**: O usuário visualiza na tabela (desktop) e nos itens de lista (mobile) um badge discreto informando a quantidade de anexos (`1 anexo`, `2 anexos`, etc.) apenas se `attachmentsCount > 0`.
- **R2: Busca sob Demanda (Lazy Fetching)**: As URLs das imagens e metadados detalhados da galeria só são buscados ao abrir os detalhes de uma transação específica (`TransactionDetailsSheet`).
- **R3: Upload de Comprovantes**:
  - Aceita de 1 a 3 imagens válidas (`image/png`, `image/jpeg`, `image/webp`).
  - Tamanho máximo de 5 MB por arquivo.
  - Bloqueio e mensagem amigável para transações do tipo `TRANSFER` e `ADJUSTMENT`.
- **R4: Reordenação Visual e Acessível**:
  - Reordenação fluida por toque/arraste (drag-and-drop / hold & move) das miniaturas.
  - Alternativa acessível por menu de opções (`...`) em cada miniatura com ações ("Mover para a esquerda", "Mover para a direita").
  - Atualização otimista na interface para resposta imediata, persistida via `PATCH /transactions/:id/attachments/positions`.
- **R5: Exclusão de Comprovante**:
  - Ação de exclusão acessível pelo menu de cada miniatura com confirmação.
  - Remoção via `DELETE /transactions/:id/attachments/:attachmentId`, reordenando automaticamente as posições restantes.
- **R6: Visualizador Imersivo (Lightbox Modal com Zoom)**:
  - Ao clicar em uma miniatura, abrir modal sobreposto com fundo escuro translúcido (`backdrop-blur-md`).
  - Suporte a zoom suave (1x até 3x) por duplo toque/clique e botões explícitos no cabeçalho (`+`, `-`, reset).
  - Capacidade de arrastar a imagem (pan) quando em modo ampliado.
  - Navegação entre anexos adjacentes (`<` e `>`) e fechamento por tecla `Esc` ou botão fechar.
- **R7: Navegação Desktop vs. Mobile**:
  - **Mobile**: Faixa horizontal com rolagem suave por toque, snapping e peek visual do próximo item.
  - **Desktop**: Ocultação da barra de rolagem nativa, navegação lateral com botões suspensos `<` e `>` combinados a gradientes suaves de fade nas bordas.

## 3. Casos de Borda e Validação
- **CB1: Upload que excede o limite de 3**: O frontend desabilita a adição se já existirem 3 anexos e valida o total selecionado.
- **CB2: Expiração de Presigned URL**: O cache da query (`staleTime: 240s`) garante que URLs de 300s não expirem na navegação do usuário.
- **CB3: Falha de rede na reordenação**: A interface reverte otimisticamente a ordem visual para a anterior e emite toast de erro amigável em PT-BR.
