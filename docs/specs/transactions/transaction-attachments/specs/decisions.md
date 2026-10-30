# Decisões de Arquitetura: Galeria de Anexos

## 1. Busca sob Demanda (Lazy Fetching) e Cache de 240s
- **Problema**: A listagem de transações pode conter centenas de registros por mês. Baixar URLs assinadas ou imagens para todas as transações aumentaria drasticamente o tráfego de rede e consumo de dados, além do risco de expiração das Presigned URLs do Cloudflare R2 (válidas por 300s).
- **Decisão**: A listagem geral consome unicamente o contador `attachmentsCount`. A galeria com URLs assinadas é requisitada unicamente ao abrir a `TransactionDetailsSheet` de uma transação específica, com `staleTime: 240 * 1000` (4 minutos) para evitar expiração durante a navegação.
- **Consequência**: Carregamento instantâneo da listagem, economia de banda e integridade garantida das URLs.

## 2. Reordenação Dupla: Gestual (Drag-and-Drop) + Menu Acessível (WCAG 2.2)
- **Problema**: Apenas arrastar e soltar (drag-and-drop) exclui usuários que navegam por teclado, utilizam leitores de tela ou têm dificuldades motoras finas em telas touch.
- **Decisão**: Oferecer reordenação direta por segurar/arrastar o card (interação natural Apple HIG) em conjunto com um menu de opções (`...`) em cada miniatura com ações explícitas ("Mover para esquerda", "Mover para direita").
- **Consequência**: Conformidade com WCAG 2.2 nível AA e usabilidade excelente em qualquer dispositivo.

## 3. Navegação Desktop com Fades e sem Barra de Scroll
- **Problema**: Barras de rolagem horizontais padrão poluem visualmente o painel de detalhes no desktop e quebram a estética limpa do Danfy Dark tokens.
- **Decisão**: Ocultar a scrollbar nativa no desktop e fornecer botões suspensos `<` e `>` com degradês laterais de fade suave (`from-card to-transparent`).
- **Consequência**: Interface sofisticada, mantendo a visibilidade parcial da imagem adjacente (peek) sem elementos nativos intrusivos.
