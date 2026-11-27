import { api } from '@/shared/config/axios'
import { FISCAL_NOTES_API_ENDPOINTS } from '../constants/fiscal-notes.constants'
import type {
  FiscalNoteDetail,
  FiscalNoteImportRequest,
  FiscalNoteImportResponse,
  FiscalNoteLinkRequest,
  FiscalNotePreviewRequest,
  FiscalNotePreviewResponse,
} from '../types/fiscal-note.types'

/** Consults SEFAZ-CE preview data and duplicate status for a fiscal note input. */
export const previewFiscalNote = async (
  payload: FiscalNotePreviewRequest
): Promise<FiscalNotePreviewResponse> => {
  const { data } = await api.post<FiscalNotePreviewResponse>(
    FISCAL_NOTES_API_ENDPOINTS.preview,
    payload
  )
  return data
}

/** Atomically imports a fiscal note and creates its corresponding expense transaction. */
export const importFiscalNote = async (
  payload: FiscalNoteImportRequest
): Promise<FiscalNoteImportResponse> => {
  const { data } = await api.post<FiscalNoteImportResponse>(
    FISCAL_NOTES_API_ENDPOINTS.import,
    payload
  )
  return data
}

/** Links a fiscal note to an existing expense transaction without altering transaction fields. */
export const linkFiscalNote = async (
  transactionId: string,
  payload: FiscalNoteLinkRequest
): Promise<FiscalNoteDetail> => {
  const { data } = await api.post<FiscalNoteDetail>(
    FISCAL_NOTES_API_ENDPOINTS.byTransaction(transactionId),
    payload
  )
  return data
}

/** Fetches the persisted fiscal note and shopping list items for a transaction. */
export const getTransactionFiscalNote = async (
  transactionId: string
): Promise<FiscalNoteDetail> => {
  const { data } = await api.get<FiscalNoteDetail>(
    FISCAL_NOTES_API_ENDPOINTS.byTransaction(transactionId)
  )
  return data
}

/** Unlinks and removes the fiscal note associated with a transaction. */
export const unlinkTransactionFiscalNote = async (
  transactionId: string
): Promise<void> => {
  await api.delete(FISCAL_NOTES_API_ENDPOINTS.byTransaction(transactionId))
}
