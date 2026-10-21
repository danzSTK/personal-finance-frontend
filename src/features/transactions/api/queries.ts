import { useQuery } from '@tanstack/react-query'
import { api } from '@/features/auth/api/auth.api'
import {
  TRANSACTION_API_ENDPOINTS,
  TRANSACTION_QUERY_KEYS,
} from '../constants/transaction.constants'
import type {
  ListTransactionsParams,
  Transaction,
  TransactionListResponse,
  TransactionType,
} from '../types/transaction.types'

interface UseTransactionsOptions {
  enabled?: boolean
}

export const useTransactions = (
  params: ListTransactionsParams,
  options: UseTransactionsOptions = {}
) =>
  useQuery({
    queryKey: TRANSACTION_QUERY_KEYS.list(params),
    enabled: options.enabled ?? true,
    queryFn: async () => {
      const { data } = await api.get<TransactionListResponse>(
        TRANSACTION_API_ENDPOINTS.transactions,
        { params: compactParams(params) }
      )

      return data
    },
    staleTime: 30 * 1000,
    retry: (failureCount) => failureCount < 2,
  })
type PendingTransactionType = Extract<TransactionType, 'INCOME' | 'EXPENSE'>

export const usePendingTransactionRange = (type: PendingTransactionType) => {
  const oldestQuery = useTransactions({
    page: 1,
    limit: 1,
    sort: 'date:asc',
    type,
    status: 'PENDING',
  })
  const furthestQuery = useTransactions({
    page: 1,
    limit: 1,
    sort: 'date:desc',
    type,
    status: 'PENDING',
  })

  return {
    response: oldestQuery.data,
    oldestTransaction: oldestQuery.data?.data[0],
    furthestTransaction: furthestQuery.data?.data[0],
    isLoading: oldestQuery.isLoading || furthestQuery.isLoading,
    isError: oldestQuery.isError || furthestQuery.isError,
    error: oldestQuery.error ?? furthestQuery.error,
    refetch: () =>
      Promise.all([oldestQuery.refetch(), furthestQuery.refetch()]),
  }
}

export const useTransaction = (transactionId: string | null) =>
  useQuery({
    queryKey: transactionId
      ? TRANSACTION_QUERY_KEYS.detail(transactionId)
      : TRANSACTION_QUERY_KEYS.detail('idle'),
    enabled: transactionId !== null,
    queryFn: async () => {
      const { data } = await api.get<Transaction>(
        `${TRANSACTION_API_ENDPOINTS.transactions}/${transactionId}`
      )

      return data
    },
  })

const compactParams = (params: ListTransactionsParams) => {
  const compacted: Partial<ListTransactionsParams> = { ...params }

  if (!compacted.type) delete compacted.type
  if (!compacted.status) delete compacted.status
  if (!compacted.accountId) delete compacted.accountId
  if (!compacted.categoryId) delete compacted.categoryId
  if (!compacted.dateFrom) delete compacted.dateFrom
  if (!compacted.dateTo) delete compacted.dateTo

  return compacted
}
