import { useQuery } from '@tanstack/react-query'
import {
  API_ERROR_CODES,
  getApiErrorStatus,
  isApiErrorCode,
} from '@/shared/errors'
import {
  FISCAL_NOTE_DETAIL_STALE_TIME_MS,
  FISCAL_NOTES_QUERY_KEYS,
} from '../constants/fiscal-notes.constants'
import { getTransactionFiscalNote } from './fiscal-notes.api'

export interface UseTransactionFiscalNoteOptions {
  enabled?: boolean
}

/**
 * Fetches a transaction's linked fiscal note on demand, skipping retries on 404.
 */
export const useTransactionFiscalNote = (
  transactionId: string | null | undefined,
  options: UseTransactionFiscalNoteOptions = {}
) => {
  const resolvedTransactionId = transactionId ?? ''

  return useQuery({
    queryKey: FISCAL_NOTES_QUERY_KEYS.byTransaction(resolvedTransactionId),
    enabled: Boolean(transactionId) && (options.enabled ?? true),
    queryFn: () => {
      if (!transactionId) {
        return Promise.reject(new Error('Transaction ID is required'))
      }

      return getTransactionFiscalNote(transactionId)
    },
    staleTime: FISCAL_NOTE_DETAIL_STALE_TIME_MS,
    retry: (failureCount, error) => {
      if (
        isApiErrorCode(error, API_ERROR_CODES.fiscalNoteNotFound) ||
        getApiErrorStatus(error) === 404
      ) {
        return false
      }

      return failureCount < 2
    },
  })
}
