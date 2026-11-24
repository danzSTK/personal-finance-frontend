# Decisão: Reordenação Dupla (Drag-and-Drop e Menu Acessível)

## Problema
Arrastar e soltar (drag-and-drop) é a experiência tátil mais intuitiva em dispositivos móveis e desktops, mas é inacessível para usuários de navegação por teclado, leitores de tela ou tecnologias assistivas.

## Decisão
Implementar reordenação direta por pointer/touch e, simultaneamente, disponibilizar em cada miniatura um menu de ações (`...`) com botões acessíveis "Mover para a esquerda" e "Mover para a direita".

## Consequência
Conformidade estrita com WCAG 2.2 Nível AA sem comprometer a fluidez tátil para quem prefere arrastar.
