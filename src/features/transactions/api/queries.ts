import { useQuery } from '@tanstack/react-query'
import api from '@/features/auth/api/auth.api'
import {
  TRANSACTION_API_ENDPOINTS,
  TRANSACTION_QUERY_KEYS,
} from '../constants/transaction.constants'
import type {
  ListTransactionsParams,
  Transaction,
  TransactionListResponse,
} from '../types/transaction.types'

export const useTransactions = (params: ListTransactionsParams) =>
  useQuery({
    queryKey: TRANSACTION_QUERY_KEYS.list(params),
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

  return compacted
}
