export type FiscalNoteTransactionStatus = 'PENDING' | 'EFFECTIVE'

export type FiscalNoteTransactionType =
  | 'INCOME'
  | 'EXPENSE'
  | 'TRANSFER'
  | 'ADJUSTMENT'

export type FiscalNoteTransactionDirection = 'INCREASE' | 'DECREASE'

export interface FiscalNotePreviewItem {
  position: number
  rawDescription: string
  storeCode: string | null
  unit: string
  quantity: number
  unitPrice: number
  totalPriceCents: number
}

export interface FiscalNoteItem extends FiscalNotePreviewItem {
  id: string
}

export interface FiscalNotePreviewPayment {
  position: number
  methodLabel: string
  amountCents: number
}

export interface FiscalNotePayment extends FiscalNotePreviewPayment {
  id: string
}

export interface FiscalNotePreviewDetail {
  accessKey: string
  sourceUf: string
  number: string
  series: string
  issuedAt: string
  issuedDate: string
  protocol: string | null
  issuerName: string
  issuerCnpj: string
  issuerAddress: string | null
  grossAmountCents: number
  discountAmountCents: number
  payableAmountCents: number
  taxAmountCents: number
  changeAmountCents: number | null
  xmlVersion: string | null
  xsltVersion: string | null
  parserVersion: string
  items: FiscalNotePreviewItem[]
  payments: FiscalNotePreviewPayment[]
}

export interface FiscalNoteDetail {
  object: 'fiscal_note.item'
  id: string
  transactionId: string
  accessKey: string
  sourceUf: string
  number: string
  series: string
  issuedAt: string
  protocol: string | null
  issuerName: string
  issuerCnpj: string
  issuerAddress: string | null
  grossAmountCents: number
  discountAmountCents: number
  payableAmountCents: number
  taxAmountCents: number
  changeAmountCents: number | null
  xmlVersion: string | null
  xsltVersion: string | null
  parserVersion: string
  items: FiscalNoteItem[]
  payments: FiscalNotePayment[]
  createdAt: string
  updatedAt: string
}

export type FiscalNote = FiscalNoteDetail

export interface FiscalNoteSuggestedTransaction {
  type: 'EXPENSE'
  status: 'EFFECTIVE'
  amountCents: number
  date: string
  description: string
}

export interface FiscalNotePreviewRequest {
  input: string
}

export interface FiscalNotePreviewResponse {
  object: 'fiscal_note.preview'
  alreadyImported: boolean
  existingTransactionId: string | null
  existingFiscalNoteId: string | null
  cacheHit: boolean
  suggestedTransaction: FiscalNoteSuggestedTransaction
  fiscalNote: FiscalNotePreviewDetail
}

export interface FiscalNoteImportRequest {
  input: string
  accountId: string
  categoryId: string
  amountCents?: number
  date?: string
  description?: string | null
  status?: FiscalNoteTransactionStatus
}

export interface FiscalNoteImportedTransaction {
  id: string
  accountId: string
  destinationAccountId: string | null
  categoryId: string
  type: FiscalNoteTransactionType
  status: FiscalNoteTransactionStatus
  amountCents: number
  date: string
  effectiveAt: string | null
  description: string | null
  direction: FiscalNoteTransactionDirection | null
  hasFiscalNote?: boolean
  attachmentsCount?: number
  createdAt: string
  updatedAt: string
}

export interface FiscalNoteImportResponse {
  object: 'fiscal_note.import'
  transaction: FiscalNoteImportedTransaction
  fiscalNote: FiscalNoteDetail
}

export interface FiscalNoteLinkRequest {
  input: string
}

export interface FiscalNoteAlreadyImportedDetails {
  existingTransactionId: string
  existingFiscalNoteId: string
}

export interface TransactionAlreadyHasFiscalNoteDetails {
  existingFiscalNoteId: string
}

export type FiscalNoteListSort =
  | 'issuedAt:desc'
  | 'issuedAt:asc'
  | 'payableAmountCents:desc'
  | 'payableAmountCents:asc'
  | 'createdAt:desc'
  | 'createdAt:asc'

export interface FiscalNoteSummaryItem {
  object: 'fiscal_note.summary'
  id: string
  transactionId: string
  accessKey: string
  sourceUf: string
  number: string
  series: string
  issuedAt: string
  issuerName: string
  issuerCnpj: string
  grossAmountCents: number
  discountAmountCents: number
  payableAmountCents: number
  taxAmountCents: number
  itemsCount: number
  createdAt: string
  updatedAt: string
}

export interface FiscalNoteListMeta {
  total: number
  page: number
  limit: number
  totalPages: number
  hasNextPage: boolean
  hasPreviousPage: boolean
}

export interface FiscalNoteListSummaryTotals {
  object: 'fiscal_note.summary_totals'
  totalNotes: number
  totalGrossAmountCents: number
  totalDiscountAmountCents: number
  totalPayableAmountCents: number
  totalTaxAmountCents: number
}

export interface FiscalNoteListResponse {
  object: 'fiscal_note.list'
  data: FiscalNoteSummaryItem[]
  meta: FiscalNoteListMeta
  summary: FiscalNoteListSummaryTotals
}

export interface FiscalNoteListQueryParams {
  issuedFrom?: string
  issuedTo?: string
  issuerCnpj?: string
  sourceUf?: string
  minAmountCents?: number
  maxAmountCents?: number
  search?: string
  page?: number
  limit?: number
  sort?: FiscalNoteListSort
}
