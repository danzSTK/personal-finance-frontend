import { describe, expect, it } from 'vitest'
import {
  clearTransactionCreateParam,
  clearTransactionOpenParam,
  parseTransactionCreateIntent,
  parseTransactionOpenId,
  parseYearMonthFromDateOnly,
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

  it('extrai openTransaction com trim e validação segura', () => {
    expect(
      parseTransactionOpenId(
        new URLSearchParams(
          'openTransaction=123e4567-e89b-12d3-a456-426614174000'
        )
      )
    ).toBe('123e4567-e89b-12d3-a456-426614174000')
    expect(
      parseTransactionOpenId(new URLSearchParams('openTransaction=  tx_123  '))
    ).toBe('tx_123')
    expect(
      parseTransactionOpenId(new URLSearchParams('openTransaction=   '))
    ).toBeNull()
    expect(
      parseTransactionOpenId(new URLSearchParams('openTransaction=../evil'))
    ).toBeNull()
    expect(parseTransactionOpenId(new URLSearchParams(''))).toBeNull()
  })

  it('remove apenas o parâmetro openTransaction preservando os demais filtros', () => {
    const original = new URLSearchParams(
      'period=2026-10&view=EXPENSE&openTransaction=tx-1'
    )

    const cleaned = clearTransactionOpenParam(original)

    expect(cleaned.get('openTransaction')).toBeNull()
    expect(cleaned.get('period')).toBe('2026-10')
    expect(cleaned.get('view')).toBe('EXPENSE')
    expect(original.get('openTransaction')).toBe('tx-1')
  })

  it('extrai YearMonth válido a partir de DateOnly YYYY-MM-DD', () => {
    expect(parseYearMonthFromDateOnly('2026-10-25')).toEqual({
      year: 2026,
      month: 10,
    })
    expect(parseYearMonthFromDateOnly('2026-02-30')).toBeNull()
    expect(parseYearMonthFromDateOnly(null)).toBeNull()
  })
})
