import { keepPreviousData, useQuery } from '@tanstack/react-query'
import {
  API_ERROR_CODES,
  getApiErrorStatus,
  isApiErrorCode,
} from '@/shared/errors'
import {
  FISCAL_NOTE_DETAIL_STALE_TIME_MS,
  FISCAL_NOTES_QUERY_KEYS,
} from '../constants/fiscal-notes.constants'
import type { FiscalNoteListQueryParams } from '../types/fiscal-note.types'
import {
  getFiscalNoteById,
  getTransactionFiscalNote,
  listFiscalNotes,
} from './fiscal-notes.api'

const FISCAL_NOTE_LIST_STALE_TIME_MS = 30 * 1000

export interface UseFiscalNotesListOptions {
  enabled?: boolean
}

export interface UseFiscalNoteByIdOptions {
  enabled?: boolean
}

export interface UseTransactionFiscalNoteOptions {
  enabled?: boolean
}

/**
 * Fetches paginated fiscal notes keeping previous page/filter data while refetching.
 */
export const useFiscalNotesList = (
  params: FiscalNoteListQueryParams = {},
  options: UseFiscalNotesListOptions = {}
) =>
  useQuery({
    queryKey: FISCAL_NOTES_QUERY_KEYS.list(params),
    enabled: options.enabled ?? true,
    queryFn: () => listFiscalNotes(params),
    placeholderData: keepPreviousData,
    staleTime: FISCAL_NOTE_LIST_STALE_TIME_MS,
    retry: (failureCount) => failureCount < 2,
  })

/**
 * Fetches a persisted fiscal note directly by ID, skipping retries on 404.
 */
export const useFiscalNoteById = (
  fiscalNoteId: string | null | undefined,
  options: UseFiscalNoteByIdOptions = {}
) => {
  const resolvedFiscalNoteId = fiscalNoteId ?? ''

  return useQuery({
    queryKey: FISCAL_NOTES_QUERY_KEYS.detail(resolvedFiscalNoteId),
    enabled: Boolean(fiscalNoteId) && (options.enabled ?? true),
    queryFn: () => {
      if (!fiscalNoteId) {
        return Promise.reject(new Error('Fiscal note ID is required'))
      }

      return getFiscalNoteById(fiscalNoteId)
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
