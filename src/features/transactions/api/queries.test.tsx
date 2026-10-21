import type { PropsWithChildren } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { api } from '@/features/auth/api/auth.api'
import { TRANSACTION_API_ENDPOINTS } from '../constants/transaction.constants'
import type {
  ListTransactionsParams,
  Transaction,
  TransactionListResponse,
} from '../types/transaction.types'
import { usePendingTransactionRange, useTransactions } from './queries'

vi.mock('@/features/auth/api/auth.api', () => ({
  api: { get: vi.fn() },
}))

const params: ListTransactionsParams = {
  page: 1,
  limit: 1,
  sort: 'date:desc',
  status: 'EFFECTIVE',
  accountId: 'account-id',
  dateFrom: '2026-07-01',
  dateTo: '2026-07-31',
}

const response: TransactionListResponse = {
  object: 'transaction.list',
  data: [],
  meta: {
    total: 0,
    page: 1,
    limit: 1,
    totalPages: 0,
    hasNextPage: false,
    hasPreviousPage: false,
  },
  summary: {
    object: 'transaction_summary.overview',
    income: { pendingCents: 0, effectiveCents: 30000, totalCents: 30000 },
    expense: { pendingCents: 0, effectiveCents: 15000, totalCents: 15000 },
    balance: {
      pendingDeltaCents: 0,
      effectiveDeltaCents: 15000,
      expectedBalanceCents: 15000,
    },
  },
}

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })

  return ({ children }: PropsWithChildren) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}

describe('useTransactions', () => {
  beforeEach(() => vi.clearAllMocks())

  it('não consulta a API enquanto a query lazy está desabilitada', () => {
    renderHook(() => useTransactions(params, { enabled: false }), {
      wrapper: createWrapper(),
    })

    expect(api.get).not.toHaveBeenCalled()
  })

  it('consulta o overview com os filtros efetivos quando habilitada', async () => {
    vi.mocked(api.get).mockResolvedValue({ data: response })

    const { result, rerender } = renderHook(
      ({ enabled }) => useTransactions(params, { enabled }),
      {
        initialProps: { enabled: false },
        wrapper: createWrapper(),
      }
    )

    expect(api.get).not.toHaveBeenCalled()

    rerender({ enabled: true })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(api.get).toHaveBeenCalledWith(
      TRANSACTION_API_ENDPOINTS.transactions,
      { params }
    )
    expect(result.current.data?.summary).toEqual(response.summary)
  })
  describe('usePendingTransactionRange', () => {
    beforeEach(() => vi.clearAllMocks())

    it('consulta os extremos ascendente e descendente sem limitar datas futuras', async () => {
      const oldestTransaction: Transaction = {
        id: 'oldest-id',
        accountId: 'account-id',
        destinationAccountId: null,
        categoryId: 'category-id',
        type: 'INCOME',
        status: 'PENDING',
        amountCents: 10000,
        date: '2024-11-18',
        effectiveAt: null,
        description: null,
        direction: null,
        createdAt: '2024-11-18T12:00:00.000Z',
        updatedAt: '2024-11-18T12:00:00.000Z',
      }
      const oldestResponse: TransactionListResponse = {
        object: 'transaction.list',
        data: [oldestTransaction],
        meta: {
          total: 2,
          page: 1,
          limit: 1,
          totalPages: 2,
          hasNextPage: true,
          hasPreviousPage: false,
        },
        summary: {
          object: 'transaction_summary.type',
          pendingCents: 30000,
          effectiveCents: 0,
          totalCents: 30000,
        },
      }
      const furthestResponse: TransactionListResponse = {
        ...oldestResponse,
        data: [
          {
            ...oldestTransaction,
            id: 'furthest-id',
            date: '2028-04-10',
          },
        ],
      }

      vi.mocked(api.get)
        .mockResolvedValueOnce({ data: oldestResponse })
        .mockResolvedValueOnce({ data: furthestResponse })

      const { result } = renderHook(
        () => usePendingTransactionRange('INCOME'),
        { wrapper: createWrapper() }
      )

      await waitFor(() => expect(result.current.isLoading).toBe(false))

      expect(api.get).toHaveBeenCalledWith(
        TRANSACTION_API_ENDPOINTS.transactions,
        {
          params: {
            page: 1,
            limit: 1,
            sort: 'date:asc',
            type: 'INCOME',
            status: 'PENDING',
          },
        }
      )
      expect(api.get).toHaveBeenCalledWith(
        TRANSACTION_API_ENDPOINTS.transactions,
        {
          params: {
            page: 1,
            limit: 1,
            sort: 'date:desc',
            type: 'INCOME',
            status: 'PENDING',
          },
        }
      )
      expect(result.current.oldestTransaction?.date).toBe('2024-11-18')
      expect(result.current.furthestTransaction?.date).toBe('2028-04-10')
      expect(result.current.response?.meta.total).toBe(2)
    })
  })
})
