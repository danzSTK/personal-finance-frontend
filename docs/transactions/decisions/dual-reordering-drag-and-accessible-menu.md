---
area: transactions
type: decision
status: current
last_reviewed: 2026-11-24
decision-id: DEC-TRX-004
decision-status: accepted
related:
  - ../README.md
  - ../flows/manage-attachments.md
  - ../components/attachment-gallery-and-viewer.md
  - ../../specs/transactions/transaction-attachments/specs/design.md
---

# DEC-TRX-004: Reordenação dual de anexos (Drag-and-Drop e Menu Acessível)

## Problema

Arrastar e soltar (drag-and-drop) oferece a interação mais intuitiva por toque e mouse para ordenar comprovantes, mas é inacessível para usuários que navegam exclusivamente por teclado, leitores de tela ou tecnologias assistivas (requisito WCAG 2.2 AA).

## Decisão

1. Disponibilizar reordenação direta por arraste (pointer/touch) sobre as miniaturas de `TransactionAttachmentThumbnail`.
2. Simultaneamente, oferecer em cada miniatura um menu de ações acessível (`...`) com opções explícitas **"Mover para a esquerda"** e **"Mover para a direita"**.
3. Aplicar atualização otimista imediata na lista de anexos em cache do TanStack Query (`useReorderTransactionAttachments`), revertendo para o snapshot anterior (`rollback`) e notificando erro via toast caso `PATCH /transactions/:id/attachments/positions` falhe.

## Consequência

- Conformidade com WCAG 2.2 Nível AA para operação de arraste (critério *Dragging Movements*) sem prejudicar a fluidez tátil em desktop e mobile.
- Consistência visual imediata ao reordenar, com recuperação segura em caso de falha de rede ou posição inválida (`INVALID_ATTACHMENT_POSITION`).
