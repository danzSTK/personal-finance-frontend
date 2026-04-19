---
applyTo: 'src/**/*.{ts,tsx}'
description: 'Strict TypeScript safety rules for auth and UI flows'
---

# TypeScript Safety Rule (Mandatory)

## Regras obrigatórias

1. `unknown` deve ser raro e imediatamente refinado:
- Se usar `unknown`, aplicar type guard logo em seguida.
- Não propagar `unknown` por múltiplas funções sem narrow.

2. Proibido acessar estrutura de erro sem tipagem:
- Não usar suposições soltas como `.response.message` ou `.data.message` sem validação de shape.
- Preferir util central com parsing seguro e guardas.

3. Evitar type assertions amplas:
- Proibido `as any`.
- Evitar casts de objeto inteiro quando possível.
- Preferir funções de narrow (`isRecord`, `isXPayload`) e tipos discriminados.

4. Sem magic strings para contratos:
- Rotas, endpoints, query keys, eventos e códigos de erro devem ficar em constantes compartilhadas.

5. Falhas devem ser explícitas:
- Em parsing inválido, retornar `null`/fallback tipado.
- Não mascarar erro com dados inventados.

## Objetivo

Manter o frontend estrito, previsível e resiliente a mudanças de contrato.
