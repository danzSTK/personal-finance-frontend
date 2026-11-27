---
area: fiscal-notes
feature: nfce-ce-reader
type: spec-requirements
status: approved
last_reviewed: 2026-11-27
related:
  - ./design.md
  - ./tasks.md
  - ./decisions.md
  - ../../../transactions/README.md
  - ../../../architecture/module-boundaries.md
  - ../../../architecture/api-error-handling.md
---

# Requirements — Leitor de NFC-e (SEFAZ-CE) e Lista de Compras

## 1. Objetivo e Contexto

Permitir que o usuário da **Danfy Finance** leia uma **Nota Fiscal de Consumidor Eletrônica (NFC-e)** do **Ceará (`UF = 23`, modelo `65`, ambiente de produção)** por câmera, foto/print da galeria ou entrada manual (URL do QR Code / chave de 44 dígitos), visualize a prévia detalhada da nota e:

1. **Importe a NFC-e criando uma nova despesa (`EXPENSE`) atomicamente** — com pré-preenchimento editável dos dados financeiros e suporte completo a anexos/comprovantes em staging, tal como no fluxo padrão de criação de transação;
2. **Vincule a NFC-e a uma despesa (`EXPENSE`) já existente** sem sobrescrever silenciosamente valor, data ou descrição da transação;
3. **Consulte a nota fiscal persistida ("lista de compras")** — emitente, itens ordenados, totais, formas de pagamento e metadados fiscais — e **desvincule** a nota de forma isolada quando necessário.

### Referências de Origem

- **Issue Frontend:** `danzSTK/personal-finance-frontend#8`
- **Issue & PR Backend:** `danzSTK/personal-finance-backend#144` / `danzSTK/personal-finance-backend#146`
- **Contratos Backend:** `personal-finance-backend:docs/fiscal-notes/reference/http-and-error-contracts.md`, `flows/preview-and-resilience.md`, `flows/import-link-and-lifecycle.md` e `concepts/fiscal-note-aggregate.md`
- **Documentação Frontend Existente:** `docs/transactions/README.md`, `docs/architecture/module-boundaries.md`, `docs/architecture/api-error-handling.md`, `docs/design-system/danfy-finance-design-system.md`

---

## 2. Escopo

### In Scope (V1)

- Novo módulo dedicado `src/features/fiscal-notes/` com API pública via `src/features/fiscal-notes/index.ts`, já estruturado com componentes desacoplados para futura tela dedicada de lista de compras/notas fiscais.
- Captura da NFC-e por **3 modos de entrada**:
  1. **Câmera ao vivo** via `barcode-detector` (`zxing-wasm`, self-hosted no bundle Vite, hook próprio `useQrCodeScanner`);
  2. **Foto / print da galeria** decodificado localmente via `BarcodeDetector.detect()`;
  3. **Entrada manual** (URL completa do QR Code, payload `p` separado por `|` ou chave de acesso de 44 dígitos com formatação visual em blocos de 4 dígitos).
- Validação local fail-fast antes de chamar a API (formato, 44 dígitos, modelo `65`, dígito verificador módulo 11, ambiente produção `1`, UF `23`).
- Fluxo em 2 passos em `Sheet` responsivo (`FiscalNoteReaderSheet`) suportando:
  - **Modo `import`**: Captura → Preview (`POST /fiscal-notes/preview`) → Formulário de criação de despesa pré-preenchido (editável + anexos em staging) → `POST /fiscal-notes/import` + upload pós-criação dos anexos em staging.
  - **Modo `link`**: Captura → Preview (`POST /fiscal-notes/preview`) → Conferência com alerta de divergência (se houver) → `POST /transactions/:id/fiscal-note`.
- Pontos de entrada de **importação**:
  - Botão dedicado na barra de ações de `/transactions` (visões `ALL` e `EXPENSE`, e menu `...` no mobile);
  - Atalho **"Ler NFC-e"** no `MobileQuickActions` (barra inferior mobile) navegando via deep link `/transactions?view=EXPENSE&create=FISCAL_NOTE`;
  - Atalho **"Importar via NFC-e"** no `TransactionFormSheet` (modo criação de `EXPENSE`).
- Pontos de entrada de **vínculo a despesa existente**:
  - Seção de Nota Fiscal no `TransactionDetailsSheet` (quando `type === 'EXPENSE'` e `!hasFiscalNote`);
  - Ação **"Vincular NFC-e"** no menu `...` da linha em `TransactionsTable` (apenas `EXPENSE` com `!hasFiscalNote`).
- Indicador leve **`hasFiscalNote`** em `Transaction` e badge visual (`FiscalNoteBadge`) na listagem (`TransactionsTable`) sem queries adicionais.
- Visualização sob demanda (`GET /transactions/:id/fiscal-note`) no `TransactionDetailsSheet`:
  - Card resumo da NFC-e (emitente, nº/série, data de emissão, valor pago, desconto, quantidade de itens, prévia dos primeiros itens);
  - Botão **"Ver lista completa (N itens)"** abrindo `FiscalNoteDetailsSheet` com busca/filtro nos itens, lista completa read-only, resumo de totais, formas de pagamento e metadados fiscais (chave copiável, protocolo, CNPJ/endereço);
  - Ação **"Desvincular nota"** (`DELETE /transactions/:id/fiscal-note`) protegida por `AlertDialog` de confirmação.
- Tratamento proativo de duplicata (`alreadyImported === true` no preview ou `409 FISCAL_NOTE_ALREADY_IMPORTED`) com navegação direta **"Ver despesa existente"** via `GET /transactions/:id`, abrindo o `TransactionDetailsSheet` mesmo fora do período/página atual.
- Proteção de invariantes em componentes existentes de `transactions`:
  - Bloqueio de alteração de `type` para fora de `EXPENSE` em `TransactionFormSheet` / `TransactionConfirmSheet` quando `hasFiscalNote === true`;
  - Aviso explícito em `TransactionDeleteDialog` quando `hasFiscalNote === true` de que a nota vinculada também será removida e a chave liberada para reimportação.
- Mapeamento completo dos códigos de erro de `fiscal-notes` em `src/shared/errors/` com suporte a `retryAfterSeconds` (`429`/`503`) e recuperação de conflitos (`409`).
- Testes automatizados (Vitest + Testing Library) e sincronização da documentação modular viva.

### Out of Scope (V1)

- Suporte a outras UFs além do Ceará (`UF = 23`) — backend rejeita com `422 FISCAL_NOTE_UNSUPPORTED_UF`.
- Edição dos dados da nota fiscal, itens ou formas de pagamento (imutáveis / read-only na V1).
- Página/rota global listando todas as notas fiscais ou listas de compras manuais sem NFC-e (o backend ainda não expõe `GET /fiscal-notes` global; os componentes de visualização ficam preparados e desacoplados para essa evolução futura).
- Categorização individual por item ou split automático de múltiplas formas de pagamento em múltiplas transações/contas.
- Leitura de NF-e modelo `55` ou notas de ambiente de homologação (`tipo_ambiente = 2`).

---

## 3. Regras de Negócio e Invariantes

1. **Exclusividade para `EXPENSE`:** somente transações do tipo `EXPENSE` podem exibir seção de nota fiscal, receber vínculo de NFC-e ou ter `hasFiscalNote === true`. Transações `INCOME`, `TRANSFER` e `ADJUSTMENT` não oferecem ações de NFC-e.
2. **Cardinalidade 1:1 ativa:** uma despesa aceita no máximo 1 NFC-e ativa. Se `hasFiscalNote === true`, ações de *"Vincular NFC-e"* ficam indisponíveis/ocultas e são substituídas por visualização/desvínculo.
3. **Unicidade por usuário (`userId + accessKey`) em notas ativas:** se `alreadyImported === true` no preview ou se o backend responder `409 FISCAL_NOTE_ALREADY_IMPORTED`, o usuário não pode confirmar importação/vínculo duplicado e deve receber caminho direto para inspecionar a transação existente (`existingTransactionId`).
4. **Confiança zero no payload de itens do cliente:** no passo 2 (`POST /fiscal-notes/import` e `POST /transactions/:id/fiscal-note`), o frontend envia apenas o `input` original da NFC-e (e, no `import`, os campos da transação), nunca enviando listas de itens ou totais da nota.
5. **Imutabilidade da Nota Fiscal e independência da Despesa:**
   - Cabeçalho, itens, totais e pagamentos da NFC-e são sempre exibidos em modo **somente leitura**.
   - Ao vincular a uma `EXPENSE` existente (`POST /transactions/:id/fiscal-note`), nenhum campo da `Transaction` é alterado.
   - Ao importar (`POST /fiscal-notes/import`), os valores sugeridos (`amountCents`, `date`, `description`, `status`) são 100% editáveis antes da confirmação.
6. **Invariantes monetárias e decimais:**
   - Valores monetários em centavos (`amountCents`, `grossAmountCents`, `discountAmountCents`, `payableAmountCents`, `taxAmountCents`, `changeAmountCents`, `totalPriceCents`) são inteiros seguros formatados com `.numeric`.
   - No `import`, `amountCents` efetivo deve ser estritamente positivo (`>= 1`). Se a nota vier com `payableAmountCents === 0`, o formulário exige que o usuário informe um valor positivo antes de submeter.
   - `quantity` e `unitPrice` dos itens são decimais (até 4 casas decimais, ex.: `0,468 kg × R$ 26,99`) exibidos em formato pt-BR com `.numeric` sem arredondamento destrutivo.
   - `changeAmountCents === null` (inclusive quando a SEFAZ retornou `NaN`) indica ausência de troco e deve ser omitido na exibição.
7. **Invariante temporal (`DateOnly` vs `Instant`):**
   - `suggestedTransaction.date` e `fiscalNote.issuedDate` são strings civis `DateOnly` (`YYYY-MM-DD`) manipuladas exclusivamente via `src/shared/utils/dateOnly.ts` — nunca convertidas via `toISOString()`.
   - `fiscalNote.issuedAt`, `createdAt` e `updatedAt` são `Instant` UTC convertidos apenas para exibição local (`dd/MM/yyyy HH:mm`).
8. **Zero-PII:** nenhum dado de consumidor existe na resposta; logs de erro ou mensagens de UI não devem exibir URLs cruas com `cscId`/`qrHash` nem mensagens técnicas brutas do backend.
9. **Desvínculo e exclusão sincronizada:**
   - Desvincular (`DELETE /transactions/:id/fiscal-note`) preserva a `Transaction` como uma `EXPENSE` comum e libera a chave para reimportação.
   - Excluir uma `Transaction` com `hasFiscalNote === true` remove também a nota vinculada no backend e libera a chave; o diálogo de exclusão deve informar isso claramente.
   - Editar ou confirmar uma `Transaction` com `hasFiscalNote === true` não permite mudar `type` para fora de `EXPENSE`.

---

## 4. Requisitos Funcionais Detalhados (EARS)

### 4.1 Captura de NFC-e e Validação Local

- **REQ-01 (Modo inicial responsivo):**
  WHEN o usuário abrir o `FiscalNoteReaderSheet` em viewport mobile (`useIsMobile() === true`)
  THE SYSTEM SHALL iniciar na aba **Câmera** (com alternância em 1 clique para **Foto** e **Chave/URL**).
  WHEN o usuário abrir o `FiscalNoteReaderSheet` em viewport desktop (`useIsMobile() === false`)
  THE SYSTEM SHALL iniciar na aba **Chave / URL manual** (com alternância em 1 clique para **Câmera** e **Foto**).

- **REQ-02 (Leitura por câmera ao vivo):**
  WHEN a aba **Câmera** estiver ativa e o ambiente suportar câmera (`navigator.mediaDevices?.getUserMedia` e contexto seguro)
  THE SYSTEM SHALL solicitar acesso à câmera traseira (`facingMode: { ideal: 'environment' }`), exibir o preview de vídeo (`playsInline`, `muted`, `autoPlay`) com guia visual de enquadramento e executar detecção de `qr_code` com throttling (~250 ms) via `barcode-detector` (`zxing-wasm` local).
  WHEN um QR Code for detectado
  THE SYSTEM SHALL pausar imediatamente a leitura da câmera (trava de leitura única), validar o conteúdo localmente e disparar a consulta de preview (`POST /fiscal-notes/preview`) uma única vez.
  WHEN o componente desmontar ou o usuário trocar de aba ou fechar o sheet
  THE SYSTEM SHALL encerrar imediatamente todas as `MediaStreamTrack`s ativas (incluindo proteção contra race condition em React Strict Mode).

- **REQ-03 (Controles opcionais de câmera e fallback de erros):**
  IF o dispositivo possuir mais de uma câmera de vídeo
  THEN o scanner deve oferecer botão acessível para alternar câmera.
  IF a track ativa reportar suporte a `torch`
  THEN o scanner deve oferecer botão acessível para ligar/desligar lanterna.
  IF ocorrer `NotAllowedError`, `NotFoundError`, `NotReadableError` ou contexto inseguro (`!window.isSecureContext`)
  THEN THE SYSTEM SHALL exibir um estado explicativo em português informando a causa e oferecer ação imediata para usar **Foto da galeria** ou **Chave/URL manual**.

- **REQ-04 (Leitura a partir de foto/print da galeria):**
  WHEN o usuário selecionar uma imagem (`PNG`, `JPEG`, `WebP`) na aba/ação de **Foto da galeria**
  THE SYSTEM SHALL decodificar o QR Code localmente usando `BarcodeDetector.detect()`, validar o conteúdo extraído e disparar o preview.
  IF nenhum QR Code for encontrado na imagem ou o arquivo for inválido
  THEN THE SYSTEM SHALL manter o usuário na etapa de captura e exibir erro claro e recuperável (*"Não encontramos um QR Code legível nessa imagem..."*).

- **REQ-05 (Entrada manual e validação local fail-fast):**
  WHEN o usuário digitar ou colar uma chave de acesso de 44 dígitos, um payload `p` (`chave|versao|ambiente|...`) ou uma URL de QR Code na aba **Manual**
  THE SYSTEM SHALL normalizar e validar localmente antes de chamar a API:
  - rejeitar entrada vazia ou `> 1024` caracteres;
  - extrair e validar chave de 44 dígitos, modelo `65` (posições 21–22), dígito verificador módulo 11 (44º dígito);
  - rejeitar ambiente de homologação (`ambiente === '2'`) com copy clara;
  - rejeitar UFs diferentes de `23` (Ceará) informando que a versão atual suporta apenas NFC-e do Ceará;
  - exibir formatação legível em grupos de 4 dígitos quando o usuário digitar somente números da chave.

### 4.2 Preview e Tratamento de Duplicata

- **REQ-06 (Consulta de Preview):**
  WHEN a entrada passar na validação local e o usuário submeter (ou escanear)
  THE SYSTEM SHALL chamar `POST /fiscal-notes/preview` com `{ input }`, exibindo estado de carregamento claro (skeleton/status *"Consultando nota na SEFAZ-CE..."*) sem desmontar o sheet.

- **REQ-07 (Exibição do Preview da Nota):**
  WHEN `POST /fiscal-notes/preview` retornar `200 OK`
  THE SYSTEM SHALL avançar para a Etapa 2 exibindo um bloco resumido e claro da NFC-e:
  - razão social do emitente, CNPJ formatado, número/série e data/hora de emissão;
  - resumo financeiro (valor bruto, desconto quando `> 0`, valor a pagar em destaque com `.numeric`, tributos informativos e troco quando `changeAmountCents !== null`);
  - formas de pagamento registradas (`payments[]`);
  - resumo da lista de itens com opção de expandir/visualizar todos os itens ainda no preview;
  - botão **"Ler outra nota"** para voltar à Etapa 1.

- **REQ-08 (Detecção proativa e recuperação de Duplicata):**
  IF `preview.alreadyImported === true` (ou se o backend retornar `409 FISCAL_NOTE_ALREADY_IMPORTED` na confirmação)
  THEN THE SYSTEM SHALL exibir um banner/alerta destacado informando que esta NFC-e já está vinculada a uma despesa ativa, desabilitar o botão de importar/vincular e exibir o botão **"Ver despesa existente"** (quando `existingTransactionId` estiver presente).
  WHEN o usuário clicar em **"Ver despesa existente"**
  THE SYSTEM SHALL buscar a transação pelo ID (`GET /transactions/:id`), fechar o `FiscalNoteReaderSheet` e abrir diretamente o `TransactionDetailsSheet` dessa transação (mesmo que pertença a outro mês/página).

### 4.3 Fluxo 1 — Importar NFC-e Criando Nova Despesa

- **REQ-09 (Pontos de entrada para Importação):**
  THE SYSTEM SHALL permitir iniciar o fluxo `import` a partir de:
  1. Botão dedicado **"Ler NFC-e"** na barra de ações de `/transactions` nas visões `ALL` e `EXPENSE` (e item no menu `...` mobile);
  2. Atalho **"Ler NFC-e"** no `MobileQuickActions` navegando para `/transactions?view=EXPENSE&create=FISCAL_NOTE`;
  3. Atalho **"Importar via NFC-e"** no `TransactionFormSheet` quando em modo `create` com `type === 'EXPENSE'`.
  WHEN `/transactions` abrir com `?create=FISCAL_NOTE`
  THE SYSTEM SHALL abrir o `FiscalNoteReaderSheet` em modo `import` e limpar o parâmetro `create` da URL via `replace: true`.

- **REQ-10 (Formulário de Despesa na Etapa 2 com Anexos em Staging):**
  WHEN o preview tiver sucesso com `alreadyImported === false` no modo `import`
  THE SYSTEM SHALL pré-preencher os campos da despesa a partir de `suggestedTransaction`:
  - `amountCents`: `suggestedTransaction.amountCents` (editável via `CurrencyInput`; se `0`, exige valor `> 0`);
  - `date`: `suggestedTransaction.date` (`DateOnly` editável via `DateOnlyPicker` com atalhos Hoje/Ontem);
  - `description`: `suggestedTransaction.description` (editável, até 500 chars);
  - `status`: `suggestedTransaction.status` (`EFFECTIVE` por padrão, editável para `PENDING`);
  - `accountId`: seletor obrigatório de contas ativas (pré-selecionando conta padrão se existir ou mantendo explícito conforme padrão do `TransactionFormSheet`);
  - `categoryId`: seletor obrigatório de categorias ativas do tipo `EXPENSE`;
  - **Comprovantes/Anexos (staging):** permitir anexar até 3 arquivos (PNG, JPEG, WebP até 5 MB cada) com reordenação e preview antes de confirmar.

- **REQ-11 (Submissão Atômica + Upload Pós-Criação de Anexos):**
  WHEN o usuário confirmar a importação com formulário válido
  THE SYSTEM SHALL enviar `POST /fiscal-notes/import` com `{ input, accountId, categoryId, amountCents, date, description, status }`.
  WHEN `POST /fiscal-notes/import` retornar `201 Created`
  THE SYSTEM SHALL:
  1. Se houver anexos em staging, realizar o upload para o `transaction.id` retornado;
  2. Se algum anexo falhar no upload, fechar o sheet mesmo assim (para evitar duplicação) e notificar via toast que a despesa e a nota fiscal foram salvas, mas os anexos precisam ser reenviados nos detalhes;
  3. Invalidar caches de `transactions`, `accounts` e `fiscal-notes` e exibir toast de sucesso.

### 4.4 Fluxo 2 — Vincular NFC-e a Despesa Existente

- **REQ-12 (Pontos de entrada para Vínculo):**
  WHEN uma transação for `type === 'EXPENSE'` e `!transaction.hasFiscalNote`
  THE SYSTEM SHALL oferecer a ação **"Vincular NFC-e"**:
  1. Na seção **Nota fiscal** do `TransactionDetailsSheet`;
  2. No menu `...` de ações da linha correspondente em `TransactionsTable`.

- **REQ-13 (Alerta de Divergência e Confirmação de Vínculo):**
  WHEN o preview retornar `alreadyImported === false` no modo `link` para uma `targetTransaction`
  IF `fiscalNote.payableAmountCents !== targetTransaction.amountCents` OR `fiscalNote.issuedDate !== targetTransaction.date`
  THEN THE SYSTEM SHALL exibir um alerta comparativo informativo (`state-warning`) contrastando valor/data da despesa existente vs. valor/data da nota e afirmando explicitamente que **os dados da despesa não serão alterados**.
  WHEN o usuário confirmar o vínculo
  THE SYSTEM SHALL chamar `POST /transactions/:id/fiscal-note` com `{ input }`, invalidar `transactions` e `fiscal-notes`, atualizar os detalhes e exibir toast de confirmação.

### 4.5 Listagem, Visualização da Nota ("Lista de Compras") e Desvínculo

- **REQ-14 (Indicador na Listagem):**
  WHEN uma transação retornada pela API possuir `hasFiscalNote === true`
  THE SYSTEM SHALL exibir o indicador `FiscalNoteBadge` na linha desktop e no card mobile de `TransactionsTable` (sem disparar requisições `GET /transactions/:id/fiscal-note` na listagem).

- **REQ-15 (Resumo no `TransactionDetailsSheet` e Lista Completa em `FiscalNoteDetailsSheet`):**
  WHEN o usuário abrir o `TransactionDetailsSheet` de uma `EXPENSE`
  - IF `hasFiscalNote === true`: THE SYSTEM SHALL buscar `GET /transactions/:id/fiscal-note` sob demanda (`enabled: isExpense && Boolean(transaction.hasFiscalNote)`), exibindo skeleton enquanto carrega, `ApiErrorAlert` com *Tentar novamente* em erro, e, quando carregada, um **card resumo da NFC-e** contendo emitente, nº/série, data de emissão, total pago, desconto (se houver), quantidade de itens, prévia dos 3 primeiros itens, botão **"Ver lista completa (N itens)"** e botão **"Desvincular nota"**.
  - IF `hasFiscalNote === false`: THE SYSTEM SHALL exibir estado vazio compacto com botão **"Vincular NFC-e"**.
  WHEN o usuário clicar em **"Ver lista completa (N itens)"**
  THE SYSTEM SHALL abrir o `FiscalNoteDetailsSheet` exibindo:
  - cabeçalho da nota (emitente, CNPJ formatado, endereço se presente, número/série, data/hora local de emissão, protocolo se presente e chave de 44 dígitos formatada com botão de copiar);
  - campo de **busca/filtro em tempo real** nos itens (por descrição ou código da loja) + contagem de itens exibidos;
  - **lista completa de compras** (read-only) em ordem `position ASC` com descrição original, código na loja (quando houver), `quantity` + `unit`, `unitPrice` e `totalPriceCents` (`.numeric`);
  - bloco de totais (subtotal bruto, descontos, total a pagar, tributos aproximados Lei 12.741/2012 e troco se `changeAmountCents !== null`);
  - bloco de formas de pagamento (`payments[]` com label e valor `.numeric`);
  - ação **"Desvincular nota"** acessível também a partir do rodapé/cabeçalho do sheet.

- **REQ-16 (Desvínculo Isolado):**
  WHEN o usuário acionar **"Desvincular nota"**
  THE SYSTEM SHALL abrir um `AlertDialog` de confirmação explicando que apenas a nota fiscal e seus itens serão removidos, que a despesa permanecerá salva normalmente e que a chave de acesso voltará a ficar disponível para reimportação.
  WHEN confirmado
  THE SYSTEM SHALL executar `DELETE /transactions/:id/fiscal-note`, limpar/invalidar os caches de `fiscal-notes` e `transactions`, fechar o diálogo (e `FiscalNoteDetailsSheet` se aberto) e exibir toast de confirmação.

### 4.6 Invariantes nos Fluxos Existentes de `transactions`

- **REQ-17 (Bloqueio de mudança de tipo com nota ativa):**
  WHEN o usuário abrir `TransactionFormSheet` (modo `edit`) ou `TransactionConfirmSheet` para uma transação com `hasFiscalNote === true`
  THE SYSTEM SHALL desabilitar a alteração do campo `type` para qualquer valor diferente de `EXPENSE` e exibir orientação visível (*"Esta despesa possui uma NFC-e vinculada. Desvincule a nota antes de alterar o tipo."*).

- **REQ-18 (Aviso de exclusão sincronizada):**
  WHEN o usuário abrir `TransactionDeleteDialog` para uma transação com `hasFiscalNote === true`
  THE SYSTEM SHALL exibir aviso claro no corpo do diálogo informando que a nota fiscal vinculada também será removida e que a chave ficará liberada para reimportação futura.

### 4.7 Estados Obrigatórios, Rate Limit, Erros e Acessibilidade

- **REQ-19 (Tratamento de Erros e `retryAfterSeconds`):**
  WHEN qualquer operação de `fiscal-notes` falhar
  THE SYSTEM SHALL resolver o erro exclusivamente pelo código estável (`code`) via `src/shared/errors/resolveApiError.ts` (nunca exibindo `message` bruto do backend), preservando os dados preenchidos no formulário.
  IF o erro for `429 FISCAL_NOTE_RATE_LIMIT_EXCEEDED` ou `503 SEFAZ_TEMPORARILY_UNAVAILABLE` com `retryAfterSeconds > 0`
  THEN THE SYSTEM SHALL exibir contagem regressiva visível na mensagem/ação de retry e desabilitar o botão de reenvio até o prazo expirar.

- **REQ-20 (Acessibilidade WCAG 2.2 e Mobile-First):**
  THE SYSTEM SHALL garantir:
  - navegação completa por teclado (`Tab`, `Enter`, `Escape`) nos sheets, abas de captura, busca de itens e diálogos;
  - gerenciamento seguro de foco ao trocar entre Etapa 1 e Etapa 2;
  - alvos de toque mínimos adequados em mobile (`>= 44px` para botões principais);
  - nenhum indicador dependendo apenas de cor (sempre combinado com ícone e texto/label);
  - valores financeiros e quantidades renderizados com `.numeric`.

---

## 5. Critérios de Aceite Testáveis

1. **Validação local:** chaves de 44 dígitos válidas (CE, mod `65`, DV válido), QR Code v2 normal (5 campos), QR Code v2 contingência (8 campos) e QR Code v3 são aceitos; DV inválido, mod `55`, homologação (`2`) e UF `!= 23` são barrados localmente antes de qualquer request HTTP.
2. **Scanner & Foto:** `useQrCodeScanner` chama `track.stop()` ao desmontar ou após 1ª leitura (sem disparar 2 previews simultâneos); erros de permissão/hardware exibem fallback limpo; leitura por imagem chama `BarcodeDetector.detect()` e trata ausência de QR sem quebrar a UI.
3. **Import completo:** preview → pré-preenchimento editável → seleção de conta/categoria → staging de anexos → `POST /fiscal-notes/import` → upload de anexos → invalidação de `transactions`, `accounts` e `fiscal-notes`.
4. **Duplicata:** preview com `alreadyImported: true` ou `409 FISCAL_NOTE_ALREADY_IMPORTED` bloqueia reenvio e permite abrir o `TransactionDetailsSheet` de `existingTransactionId` via `GET /transactions/:id`.
5. **Link com divergência:** exibe alerta comparativo quando valor ou data divergem, confirma via `POST /transactions/:id/fiscal-note` sem alterar a transação.
6. **Lista de compras e Desvínculo:** `TransactionDetailsSheet` carrega nota sob demanda apenas quando `hasFiscalNote === true`, abre `FiscalNoteDetailsSheet` com busca funcional nos itens, copia chave formatada e desvincula com `AlertDialog` + `DELETE /transactions/:id/fiscal-note`.
7. **Invariantes:** `TransactionFormSheet` bloqueia troca de `type` quando `hasFiscalNote === true`; `TransactionDeleteDialog` exibe aviso de remoção sincronizada.
8. **Qualidade:** `npm run lint`, `npm test` e `npm run build` passam com 0 erros e 0 warnings.
