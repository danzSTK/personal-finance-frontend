# Fluxo: Gerenciamento de Anexos de Transações

Descreve o ciclo de vida e interação com comprovantes na galeria de uma transação.

## 1. Visualização
1. Usuário acessa a página de transações; visualiza na tabela ou lista mobile a quantidade de comprovantes através do badge.
2. Ao clicar na transação, a `TransactionDetailsSheet` é aberta.
3. Se `attachmentsCount > 0`, a query `GET /transactions/:id/attachments` é disparada sob demanda.
4. As miniaturas são renderizadas na ordem especificada por `position` (0 a 2).

## 2. Upload
1. Se `attachmentsCount < 3` e a transação for `INCOME` ou `EXPENSE`, o card de upload fica visível.
2. O usuário arrasta ou seleciona de 1 a 3 imagens (PNG, JPG, JPEG, WebP de até 5 MB).
3. `POST /transactions/:id/attachments` é enviado como `multipart/form-data`.
4. Em caso de sucesso, o cache é invalidado e as novas imagens aparecem na galeria.

## 3. Reordenação
1. O usuário pode arrastar uma miniatura para outra posição ou acionar o menu `...` da imagem e clicar em "Mover para a esquerda" ou "Mover para a direita".
2. O estado visual local é atualizado imediatamente (otimista).
3. O frontend envia `PATCH /transactions/:id/attachments/positions` com todas as novas posições.
4. Se a API falhar, a ordem é revertida e uma notificação de erro é apresentada.

## 4. Visualização Ampliada (Lightbox)
1. O usuário clica na miniatura.
2. O visualizador em tela cheia é aberto com fundo translúcido escuro.
3. O usuário pode aplicar zoom (duplo clique ou botões), navegar para imagens anteriores/posteriores ou fechar via `Esc` / botão fechar.
