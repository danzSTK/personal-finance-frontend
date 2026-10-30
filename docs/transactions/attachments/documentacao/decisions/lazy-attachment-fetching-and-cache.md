# Decisão: Busca sob Demanda e Retenção de Cache

## Problema
Presigned URLs emitidas pelo backend têm validade de 300 segundos (5 minutos). Baixar anexos na listagem geraria carga desnecessária e risco de URLs expiradas durante a permanência na tela.

## Decisão
Carregar anexos sob demanda apenas na `TransactionDetailsSheet` configurando `staleTime: 240 * 1000` (4 minutos) no TanStack Query, correspondendo ao `cacheMaxAgeSeconds: 240` enviado pelo backend. A listagem apenas exibe `attachmentsCount`.

## Consequência
Consumo mínimo de banda, ausência de imagens quebradas por expiração e alta responsividade da aplicação.
