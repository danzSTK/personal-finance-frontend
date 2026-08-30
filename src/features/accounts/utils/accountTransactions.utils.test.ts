import { describe, expect, it } from 'vitest'
import {
  buildAccountPeriodTransactionsUrl,
  buildAccountTransactionsUrl,
} from './accountTransactions.utils'

const parseUrl = (value: string) => new URL(value, 'https://danfy.local')

describe('account transaction URLs', () => {
  it('abre todas as transações da conta sem serializar período ou status', () => {
    const url = parseUrl(buildAccountTransactionsUrl('account-id'))

    expect(url.pathname).toBe('/transactions')
    expect(url.searchParams.get('accountId')).toBe('account-id')
    expect(url.searchParams.has('period')).toBe(false)
    expect(url.searchParams.has('dateFrom')).toBe(false)
    expect(url.searchParams.has('dateTo')).toBe(false)
    expect(url.searchParams.has('status')).toBe(false)
    expect(url.searchParams.has('view')).toBe(false)
  })

  it('abre receitas efetivas da conta no período selecionado', () => {
    const url = parseUrl(
      buildAccountPeriodTransactionsUrl({
        accountId: 'account-id',
        period: { year: 2026, month: 7 },
        view: 'INCOME',
      })
    )

    expect(url.pathname).toBe('/transactions')
    expect(url.searchParams.get('period')).toBe('2026-07')
    expect(url.searchParams.get('view')).toBe('INCOME')
    expect(url.searchParams.get('status')).toBe('EFFECTIVE')
    expect(url.searchParams.get('accountId')).toBe('account-id')
    expect(url.searchParams.has('dateFrom')).toBe(false)
    expect(url.searchParams.has('dateTo')).toBe(false)
  })
})
