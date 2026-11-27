import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  FISCAL_NOTES_EXTERNAL_QUERY_KEY_PREFIXES,
  FISCAL_NOTES_QUERY_KEYS,
} from '../constants/fiscal-notes.constants'
import {
  importFiscalNote,
  linkFiscalNote,
  previewFiscalNote,
  unlinkTransactionFiscalNote,
} from './fiscal-notes.api'

export interface LinkFiscalNoteVariables {
  transactionId: string
  input: string
}

/**
 * Mutation for previewing a fiscal note before import or linking.
 */
export const usePreviewFiscalNote = () =>
  useMutation({
    mutationFn: previewFiscalNote,
    retry: false,
  })

/**
 * Mutation for importing a fiscal note as a new expense transaction and updating related caches.
 */
export const useImportFiscalNote = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: importFiscalNote,
    onSuccess: (data) => {
      queryClient.setQueryData(
        FISCAL_NOTES_QUERY_KEYS.byTransaction(data.transaction.id),
        data.fiscalNote
      )
      queryClient.setQueryData(
        FISCAL_NOTES_QUERY_KEYS.detail(data.fiscalNote.id),
        data.fiscalNote
      )
      void queryClient.invalidateQueries({
        queryKey: FISCAL_NOTES_QUERY_KEYS.lists(),
        exact: false,
      })
      void queryClient.invalidateQueries({
        queryKey: FISCAL_NOTES_EXTERNAL_QUERY_KEY_PREFIXES.transactions,
        exact: false,
      })
      void queryClient.invalidateQueries({
        queryKey: FISCAL_NOTES_EXTERNAL_QUERY_KEY_PREFIXES.accounts,
        exact: false,
      })
      void queryClient.invalidateQueries({
        queryKey: FISCAL_NOTES_EXTERNAL_QUERY_KEY_PREFIXES.dashboard,
        exact: false,
      })
    },
  })
}

/**
 * Mutation for linking a fiscal note to an existing expense transaction.
 */
export const useLinkFiscalNote = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ transactionId, input }: LinkFiscalNoteVariables) =>
      linkFiscalNote(transactionId, { input }),
    onSuccess: (data, { transactionId }) => {
      queryClient.setQueryData(
        FISCAL_NOTES_QUERY_KEYS.byTransaction(transactionId),
        data
      )
      queryClient.setQueryData(FISCAL_NOTES_QUERY_KEYS.detail(data.id), data)
      void queryClient.invalidateQueries({
        queryKey: FISCAL_NOTES_QUERY_KEYS.lists(),
        exact: false,
      })
      void queryClient.invalidateQueries({
        queryKey: FISCAL_NOTES_EXTERNAL_QUERY_KEY_PREFIXES.transactions,
        exact: false,
      })
      void queryClient.invalidateQueries({
        queryKey:
          FISCAL_NOTES_EXTERNAL_QUERY_KEY_PREFIXES.transactionDetail(
            transactionId
          ),
      })
    },
  })
}

/**
 * Mutation for unlinking a fiscal note from an expense transaction.
 */
export const useUnlinkFiscalNote = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: unlinkTransactionFiscalNote,
    onSuccess: (_data, transactionId) => {
      queryClient.removeQueries({
        queryKey: FISCAL_NOTES_QUERY_KEYS.byTransaction(transactionId),
      })
      void queryClient.invalidateQueries({
        queryKey: FISCAL_NOTES_QUERY_KEYS.lists(),
        exact: false,
      })
      void queryClient.invalidateQueries({
        queryKey: FISCAL_NOTES_QUERY_KEYS.details(),
        exact: false,
      })
      void queryClient.invalidateQueries({
        queryKey: FISCAL_NOTES_EXTERNAL_QUERY_KEY_PREFIXES.transactions,
        exact: false,
      })
      void queryClient.invalidateQueries({
        queryKey:
          FISCAL_NOTES_EXTERNAL_QUERY_KEY_PREFIXES.transactionDetail(
            transactionId
          ),
      })
    },
  })
}
