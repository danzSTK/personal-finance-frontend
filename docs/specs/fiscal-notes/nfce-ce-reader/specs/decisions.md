---
area: fiscal-notes
feature: nfce-ce-reader
type: spec-decisions
status: approved
last_reviewed: 2026-11-27
related:
  - ./requirements.md
  - ./design.md
  - ./tasks.md
---

# Decisions — Leitor de NFC-e (SEFAZ-CE) e Lista de Compras

## DEC-001 — Usar `barcode-detector` (`zxing-wasm`) direto com hook próprio em vez de wrappers React

Status: accepted

Problem:
Wrappers React de scanner QR (`@yudiel/react-qr-scanner`, `react-zxing`, `html5-qrcode`, `qr-scanner`) têm baixa adoção/manutenção irregular, atrito com React 19 Strict Mode ou acoplamento de UI fora do padrão Danfy Dark/Material 3.

Decision:
Adotar diretamente `barcode-detector` (ponyfill W3C sobre `zxing-wasm`, mantido ativamente por Sec-ant) com hook próprio `useQrCodeScanner` e self-host do binário `zxing_reader.wasm` no build do Vite.

Consequences:
Controle total sobre a UI do viewfinder, cleanup determinístico de `MediaStreamTrack` em React Strict Mode, trava single-shot contra estouro de rate limit, suporte nativo a leitura de foto/print da galeria pela mesma API (`BarcodeDetector.detect()`), zero dependência de CDN externa e alta testabilidade no Vitest.

---

## DEC-002 — Criar módulo dedicado `src/features/fiscal-notes/` mantendo dependência acíclica com `transactions`

Status: accepted

Problem:
O domínio fiscal (leitor de NFC-e + visualização de lista de compras) evoluirá para telas e análises dedicadas (lista de compras global, gestão de mercado, IA) conforme o backend avançar. Colocá-lo dentro de `src/features/transactions/` inchou o módulo e dificultaria essa evolução.

Decision:
Criar módulo próprio `src/features/fiscal-notes/` exportando API pública enxuta via `index.ts`. Manter a direção estrita `transactions -> fiscal-notes` (zero imports de `fiscal-notes` para `transactions`). Recursos específicos de `transactions` necessários no fluxo de importação (como `TransactionStagedAttachmentsField` e `uploadTransactionAttachments`) são injetados por `TransactionsPage` via render slot e callbacks.

Consequences:
Evita ciclos entre módulos em `docs/architecture/module-boundaries.md` e deixa componentes como `FiscalNoteItemsList`, `FiscalNoteSummaryCard` e `FiscalNoteDetailsSheet` prontos para reuso em futuras telas de lista de compras/mercado.

---

## DEC-003 — Suportar anexos em staging no fluxo de Importação de NFC-e

Status: accepted

Problem:
O fluxo de importação de NFC-e substitui a criação manual de uma despesa (`EXPENSE`). Sem staging de anexos nessa etapa, o usuário que quisesse salvar também uma foto do comprovante ou da garantia seria forçado a entrar no fluxo de edição após criar a despesa.

Decision:
Incluir o campo de comprovantes/anexos em staging na Etapa 2 do fluxo `import`, realizando o upload para o `transaction.id` imediatamente após `POST /fiscal-notes/import` retornar `201 Created`. Em falha parcial de upload, o sheet fecha com toast de aviso (preservando a despesa e a nota criadas sem risco de duplicação).

Consequences:
Paridade total de experiência com a criação manual em `TransactionFormSheet` sem introduzir novo endpoint no backend nem criar ciclo entre módulos.

---

## DEC-004 — Suportar 3 modos de captura com entrada padrão adaptada ao dispositivo

Status: accepted

Problem:
No celular, escanear o QR Code pela câmera é o fluxo mais rápido; no desktop, a maioria dos usuários não usa webcam para ler cupom fiscal e prefere colar a URL/chave de 44 dígitos ou enviar uma foto/print.

Decision:
Oferecer 3 modos de captura na Etapa 1 (**Câmera**, **Foto da galeria** e **Chave/URL manual**), abrindo por padrão em **Câmera** no mobile (`useIsMobile() === true`) e em **Manual** no desktop (`useIsMobile() === false`), com alternância em 1 clique entre todos os modos e fallback automático caso a câmera falhe ou não tenha permissão.

Consequences:
Reduz fricção e pedidos desnecessários de permissão de câmera no desktop, mantendo agilidade máxima no mobile.

---

## DEC-005 — Fluxo de captura/importação em `Sheet` responsivo + Lista completa em `FiscalNoteDetailsSheet`

Status: accepted

Problem:
Compras de supermercado podem conter dezenas de itens. Exibir todos os itens inline dentro do `TransactionDetailsSheet` degradaria a legibilidade dos detalhes financeiros da transação, enquanto criar uma rota/página separada para importação quebraria o contexto da tela `/transactions`.

Decision:
1. Manter o fluxo de captura → preview → confirmação em `Sheet` responsivo (`FiscalNoteReaderSheet`), alinhado a `TransactionFormSheet` e `BalanceAdjustmentSheet`.
2. No `TransactionDetailsSheet`, exibir um card resumo compacto da NFC-e com prévia dos 3 primeiros itens e um atalho **"Ver lista completa (N itens)"** que abre `FiscalNoteDetailsSheet` focado na lista de compras com busca em tempo real, totais, pagamentos e metadados fiscais.

Consequences:
Preserva escaneabilidade dos detalhes financeiros da transação e entrega uma visualização confortável para cupons extensos, já reaproveitável na evolução futura de lista de compras.

---

## DEC-006 — Atalho no `MobileQuickActions` usando o padrão existente de deep link (`?create=FISCAL_NOTE`)

Status: accepted

Problem:
O usuário precisa conseguir acionar a leitura de NFC-e a partir do botão `+` da barra inferior mobile (`MobileQuickActions`) em qualquer tela autenticada (Dashboard, Contas, Categorias, Configurações), sem acoplar `auth` aos sheets de `fiscal-notes`.

Decision:
Estender o mecanismo já existente em `AUTH_QUICK_ACTION_ROUTES` e `parseTransactionCreateIntent` com `/transactions?view=EXPENSE&create=FISCAL_NOTE`, posicionando o botão **"Ler NFC-e"** no slot central livre da 2ª linha do grid do `MobileQuickActions`.

Consequences:
Zero acoplamento entre `auth` e `fiscal-notes`, consistência total com os demais atalhos rápidos (`INCOME`, `EXPENSE`, `TRANSFER`) e URL limpa automaticamente após abertura do sheet.

---

## DEC-007 — Recuperação direta de nota duplicada via `GET /transactions/:id`

Status: accepted

Problem:
Uma NFC-e duplicada (`alreadyImported: true` ou `409 FISCAL_NOTE_ALREADY_IMPORTED`) pode estar vinculada a uma despesa de outro mês ou página não carregada atualmente em `/transactions`.

Decision:
Ao clicar em *"Ver despesa existente"*, buscar a transação diretamente via `GET /transactions/:id`, fechar o `FiscalNoteReaderSheet` e abrir o `TransactionDetailsSheet` com os dados da transação encontrada.

Consequences:
Recuperação imediata e previsível independente dos filtros ou período ativos na tela `/transactions`.

---

## DEC-008 — Criar rota dedicada `/fiscal-notes` em vez de aba em `/transactions`

Status: accepted

Problem:
Com a entrega de `GET /fiscal-notes` (com KPIs agregados, busca por estabelecimento/item e filtros próprios por emitente/CNPJ/UF/faixa de valor) e `GET /fiscal-notes/:id`, encaixar essa listagem como uma aba dentro de `/transactions` misturaria semânticas distintas (movimentações de fluxo de caixa vs. notas fiscais e listas de compras) e sobrecarregaria a barra de filtros e URL de `/transactions`.

Decision:
Criar a rota dedicada `/fiscal-notes` ("Notas fiscais"), posicionada na sidebar desktop do `AuthAppShell` logo abaixo de *Transações* (`NFC-e e compras`) e no topo do sheet *Mais* no mobile (preservando os 5 slots da barra inferior).

Consequences:
Separação clara de domínio e filtros específicos na URL, mantendo `/transactions` enxuta e permitindo evolução futura de inteligência de compras sem refatorar abas.

---

## DEC-009 — Exibir todo o histórico por padrão em `/fiscal-notes` (`issuedFrom`/`issuedTo` vazios)

Status: accepted

Problem:
Diferente de lançamentos recorrentes mensais em `/transactions`, consultas a notas fiscais e compras passadas frequentemente buscam itens ou estabelecimentos ao longo de vários meses (garantias, comparação de preços, histórico de supermercado). Filtrar apenas o mês corrente por padrão esconderia a maior parte do histórico recém-importado.

Decision:
Iniciar `/fiscal-notes` com `issuedFrom` e `issuedTo` vazios (todo o histórico por padrão) e oferecer presets rápidos (*Este mês*, *Últimos 30 dias*, *Últimos 90 dias*, *Todo o período*) dentro do drawer de filtros.

Consequences:
Experiência imediata ao abrir a tela mesmo quando notas foram emitidas em meses anteriores, mantendo filtragem temporal rápida em um clique.

---

## DEC-010 — Usar compositor fino em `src/app/` para manter `fiscal-notes` acíclico com `Ler NFC-e` inline

Status: accepted

Problem:
O usuário precisa acionar **Ler NFC-e** diretamente dentro da tela `/fiscal-notes`, o que exige abrir `FiscalNoteReaderSheet` em modo `import` alimentado por contas (`accounts`), categorias (`categories`), staging de anexos (`transactions`) e navegação para despesa existente — sem violar a fronteira acíclica estrita que proíbe `src/features/fiscal-notes/` de importar de outras features.

Decision:
Manter `FiscalNotesPage` dentro de `src/features/fiscal-notes/` livre de imports cross-feature, recebendo props opcionais (`onImportFiscalNote` / slot de leitor ou orquestração externa), e criar um compositor fino na camada `src/app/` que conecta `FiscalNotesPage` às contas, categorias, staging de anexos e navegação para `/transactions?openTransaction=<id>`.

Consequences:
Preserva a fronteira acíclica em `docs/architecture/module-boundaries.md` (zero imports de `transactions`, `accounts`, `categories` ou `auth` em `src/features/fiscal-notes/`), mantendo a tela autocontida e testável.

---

## DEC-011 — Navegar para despesa vinculada via deep-link `?openTransaction=<transactionId>`

Status: accepted

Problem:
A partir de `/fiscal-notes` (linha da tabela, card mobile ou `FiscalNoteDetailsSheet`), o usuário precisa abrir a despesa vinculada mesmo que ela pertença a um mês ou página diferente do padrão atual de `/transactions`.

Decision:
Navegar para `/transactions?openTransaction=<transactionId>`. Em `TransactionsPage`, ler `openTransaction` na montagem/mudança de URL, buscar `GET /transactions/:id`, abrir `TransactionDetailsSheet` diretamente e limpar o query param `openTransaction` com `{ replace: true }`.

Consequences:
Desacoplamento total entre `/fiscal-notes` e `TransactionsPage`, reutilizando a infraestrutura já existente de `getTransactionById` e mantendo URLs compartilháveis e idempotentes.
