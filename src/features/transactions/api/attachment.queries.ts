import { useQuery } from '@tanstack/react-query'
import { api } from '@/features/auth/api/auth.api'
import {
  TRANSACTION_API_ENDPOINTS,
  TRANSACTION_QUERY_KEYS,
} from '../constants/transaction.constants'
import type { TransactionAttachment } from '../types/transaction-attachment.types'

interface UseTransactionAttachmentsOptions {
  enabled?: boolean
}

export const useTransactionAttachments = (
  transactionId: string | null | undefined,
  options: UseTransactionAttachmentsOptions = {}
) =>
  useQuery({
    queryKey: TRANSACTION_QUERY_KEYS.attachments(transactionId ?? ''),
    enabled: Boolean(transactionId) && (options.enabled ?? true),
    queryFn: async () => {
      if (!transactionId) {
        return []
      }

      const { data } = await api.get<TransactionAttachment[]>(
        TRANSACTION_API_ENDPOINTS.attachments(transactionId)
      )

      return data
    },
    staleTime: 240 * 1000,
    retry: (failureCount) => failureCount < 2,
  })
