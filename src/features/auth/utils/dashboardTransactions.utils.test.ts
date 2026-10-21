import { describe, expect, it } from 'vitest'
import type { TransactionUrlState } from '@/features/transactions/utils/transactionUrl.utils'
import { buildPendingDashboardTransactionsUrl } from './dashboardTransactions.utils'

const transactionState: TransactionUrlState = {
  view: 'ALL',
  period: { year: 2025, month: 6 },
  page: 4,
  limit: 50,
  search: 'aluguel',
  filters: {
    accountId: 'account-id',
    categoryId: 'category-id',
    status: null,
    dateFrom: '2025-06-01',
    dateTo: '2025-06-30',
  },
}

describe('buildPendingDashboardTransactionsUrl', () => {
  it('adiciona o intervalo da pendência mais antiga até a mais distante e preserva os filtros existentes', () => {
    const url = new URL(
      buildPendingDashboardTransactionsUrl({
        state: transactionState,
        type: 'EXPENSE',
        oldestTransaction: { date: '2024-11-18' },
        furthestTransaction: { date: '2027-03-15' },
      }),
      'http://localhost'
    )

    expect(url.pathname).toBe('/transactions')
    expect(url.searchParams.get('view')).toBe('EXPENSE')
    expect(url.searchParams.get('status')).toBe('PENDING')
    expect(url.searchParams.get('dateFrom')).toBe('2024-11-18')
    expect(url.searchParams.get('dateTo')).toBe('2027-03-15')
    expect(url.searchParams.get('period')).toBe('2025-06')
    expect(url.searchParams.get('limit')).toBe('50')
    expect(url.searchParams.get('q')).toBe('aluguel')
    expect(url.searchParams.get('accountId')).toBe('account-id')
    expect(url.searchParams.get('categoryId')).toBe('category-id')
    expect(url.searchParams.has('page')).toBe(false)
  })

  it('usa o único extremo carregado nos dois limites enquanto a outra query carrega', () => {
    const url = new URL(
      buildPendingDashboardTransactionsUrl({
        state: {
          ...transactionState,
          search: '',
          filters: {
            accountId: null,
            categoryId: null,
            status: null,
            dateFrom: '2025-06-01',
            dateTo: '2025-06-30',
          },
        },
        type: 'INCOME',
        furthestTransaction: { date: '2027-08-20' },
      }),
      'http://localhost'
    )

    expect(url.searchParams.get('view')).toBe('INCOME')
    expect(url.searchParams.get('status')).toBe('PENDING')
    expect(url.searchParams.get('dateFrom')).toBe('2027-08-20')
    expect(url.searchParams.get('dateTo')).toBe('2027-08-20')
  })

  it('usa a data de fallback quando nenhum extremo foi carregado', () => {
    const url = new URL(
      buildPendingDashboardTransactionsUrl({
        state: transactionState,
        type: 'INCOME',
        fallbackDate: '2026-09-02',
      }),
      'http://localhost'
    )

    expect(url.searchParams.get('dateFrom')).toBe('2026-09-02')
    expect(url.searchParams.get('dateTo')).toBe('2026-09-02')
  })
})
