import { describe, expect, it } from 'vitest'
import {
  clearTransactionCreateParam,
  parseTransactionCreateIntent,
} from './transactionUrl.utils'

describe('transactionUrl.utils (create intents & cleanup)', () => {
  it('reconhece create=FISCAL_NOTE e os demais intents suportados', () => {
    expect(
      parseTransactionCreateIntent(
        new URLSearchParams('view=EXPENSE&create=FISCAL_NOTE')
      )
    ).toBe('FISCAL_NOTE')
    expect(
      parseTransactionCreateIntent(new URLSearchParams('create=EXPENSE'))
    ).toBe('EXPENSE')
    expect(
      parseTransactionCreateIntent(new URLSearchParams('create=INCOME'))
    ).toBe('INCOME')
    expect(
      parseTransactionCreateIntent(new URLSearchParams('create=TRANSFER'))
    ).toBe('TRANSFER')
    expect(
      parseTransactionCreateIntent(new URLSearchParams('create=ADJUSTMENT'))
    ).toBe('ADJUSTMENT')
    expect(
      parseTransactionCreateIntent(new URLSearchParams('create=INVALID'))
    ).toBeNull()
    expect(parseTransactionCreateIntent(new URLSearchParams(''))).toBeNull()
  })

  it('remove apenas o parâmetro create da URL preservando filtros existentes', () => {
    const original = new URLSearchParams(
      'view=EXPENSE&period=2026-11&accountId=acc-1&create=FISCAL_NOTE'
    )

    const cleaned = clearTransactionCreateParam(original)

    expect(cleaned.get('create')).toBeNull()
    expect(cleaned.get('view')).toBe('EXPENSE')
    expect(cleaned.get('period')).toBe('2026-11')
    expect(cleaned.get('accountId')).toBe('acc-1')
    expect(original.get('create')).toBe('FISCAL_NOTE')
  })
})
