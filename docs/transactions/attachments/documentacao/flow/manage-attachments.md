# Fluxo: Gerenciamento de Anexos de Transações

Descreve o ciclo de vida e interação com comprovantes na galeria de uma transação.

## 1. Visualização
1. Usuário acessa a página de transações; visualiza na tabela ou lista mobile a quantidade de comprovantes através do badge.
2. Ao clicar na transação, a `TransactionDetailsSheet` é aberta.
3. Se `attachmentsCount > 0`, a query `GET /transactions/:id/attachments` é disparada sob demanda.
4. As miniaturas são renderizadas na ordem especificada por `position` (0 a 2).

## 2. Upload (Detalhes, Edição e Criação)
1. Se `attachmentsCount < 3` e a transação for `INCOME` ou `EXPENSE`, o card de upload fica visível tanto na `TransactionDetailsSheet` quanto na `TransactionFormSheet` (modos `edit` e `create`).
2. Na edição e nos detalhes, ao selecionar ou arrastar de 1 a 3 imagens (PNG, JPG, JPEG, WebP de até 5 MB), `POST /transactions/:id/attachments` é enviado imediatamente como `multipart/form-data` e o cache é invalidado.
3. Na criação (`TransactionFormSheet` modo `create`), as imagens ficam em staging local (`TransactionStagedAttachmentsField`, com pré-visualização, lightbox e reordenação) e são enviadas via `POST /transactions/:id/attachments` logo após o retorno de `POST /transactions`. Caso o upload falhe após a criação, um toast PT-BR orienta o usuário e o formulário fecha para evitar duplicação do lançamento.

## 3. Reordenação
1. O usuário pode arrastar uma miniatura para outra posição ou acionar o menu `...` da imagem e clicar em "Mover para a esquerda" ou "Mover para a direita".
2. O estado visual local é atualizado imediatamente (otimista).
3. O frontend envia `PATCH /transactions/:id/attachments/positions` com todas as novas posições.
4. Se a API falhar, a ordem é revertida e uma notificação de erro é apresentada.

## 4. Visualização Ampliada (Lightbox)
1. O usuário clica na miniatura.
2. O visualizador em tela cheia é aberto com fundo translúcido escuro.
3. O usuário pode aplicar zoom (duplo clique ou botões), navegar para imagens anteriores/posteriores ou fechar via `Esc` / botão fechar.
