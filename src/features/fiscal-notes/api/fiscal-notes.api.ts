import { api } from '@/shared/config/axios'
import { FISCAL_NOTES_API_ENDPOINTS } from '../constants/fiscal-notes.constants'
import type {
  FiscalNoteDetail,
  FiscalNoteImportRequest,
  FiscalNoteImportResponse,
  FiscalNoteLinkRequest,
  FiscalNoteListQueryParams,
  FiscalNoteListResponse,
  FiscalNotePreviewRequest,
  FiscalNotePreviewResponse,
} from '../types/fiscal-note.types'

const cleanFiscalNoteListParams = (
  params: FiscalNoteListQueryParams
): FiscalNoteListQueryParams => {
  const cleaned: FiscalNoteListQueryParams = {}

  if (params.issuedFrom?.trim()) cleaned.issuedFrom = params.issuedFrom.trim()
  if (params.issuedTo?.trim()) cleaned.issuedTo = params.issuedTo.trim()
  if (params.issuerCnpj?.trim()) cleaned.issuerCnpj = params.issuerCnpj.trim()
  if (params.sourceUf?.trim()) cleaned.sourceUf = params.sourceUf.trim()
  if (typeof params.minAmountCents === 'number') {
    cleaned.minAmountCents = params.minAmountCents
  }
  if (typeof params.maxAmountCents === 'number') {
    cleaned.maxAmountCents = params.maxAmountCents
  }
  if (params.search?.trim()) cleaned.search = params.search.trim()
  if (typeof params.page === 'number') cleaned.page = params.page
  if (typeof params.limit === 'number') cleaned.limit = params.limit
  if (params.sort) cleaned.sort = params.sort

  return cleaned
}

/** Fetches the paginated list of active fiscal notes with optional filters and summary totals. */
export const listFiscalNotes = async (
  params: FiscalNoteListQueryParams = {}
): Promise<FiscalNoteListResponse> => {
  const cleanParams = cleanFiscalNoteListParams(params)
  const { data } = await api.get<FiscalNoteListResponse>(
    FISCAL_NOTES_API_ENDPOINTS.list,
    { params: cleanParams }
  )
  return data
}

/** Fetches a single persisted fiscal note by its ID with ordered items and payments. */
export const getFiscalNoteById = async (
  fiscalNoteId: string
): Promise<FiscalNoteDetail> => {
  const { data } = await api.get<FiscalNoteDetail>(
    FISCAL_NOTES_API_ENDPOINTS.byId(fiscalNoteId)
  )
  return data
}

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
