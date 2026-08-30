import type { PropsWithChildren } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { api } from '@/features/auth/api/auth.api'
import { TRANSACTION_API_ENDPOINTS } from '../constants/transaction.constants'
import type {
  ListTransactionsParams,
  TransactionListResponse,
} from '../types/transaction.types'
import { useTransactions } from './queries'

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
})
