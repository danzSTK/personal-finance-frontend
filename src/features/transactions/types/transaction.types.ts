export type TransactionType = 'INCOME' | 'EXPENSE' | 'TRANSFER' | 'ADJUSTMENT'

export type TransactionStatus = 'PENDING' | 'EFFECTIVE'

export type TransactionDirection = 'INCREASE' | 'DECREASE'

export type TransactionSort = 'date:desc' | 'date:asc'

export type TransactionListObject = 'transaction.list'

export type TransactionSummaryObject =
  | 'transaction_summary.overview'
  | 'transaction_summary.type'

export interface Transaction {
  id: string
  accountId: string
  destinationAccountId: string | null
  categoryId: string
  type: TransactionType
  status: TransactionStatus
  amountCents: number
  date: string
  effectiveAt: string | null
  description: string | null
  direction: TransactionDirection | null
  createdAt: string
  updatedAt: string
}

export interface TransactionListMeta {
  total: number
  page: number
  limit: number
  totalPages: number
  hasNextPage: boolean
  hasPreviousPage: boolean
}

export interface TransactionTypeSummary {
  pendingCents: number
  effectiveCents: number
  totalCents: number
}

export interface TransactionOverviewSummary {
  object: 'transaction_summary.overview'
  income: TransactionTypeSummary
  expense: TransactionTypeSummary
  balance: {
    pendingDeltaCents: number
    effectiveDeltaCents: number
    expectedBalanceCents: number
  }
}

export interface TransactionSimpleSummary extends TransactionTypeSummary {
  object: 'transaction_summary.type'
}

export type TransactionSummary =
  | TransactionOverviewSummary
  | TransactionSimpleSummary

export interface TransactionListResponse {
  object: TransactionListObject
  data: Transaction[]
  meta: TransactionListMeta
  summary: TransactionSummary
}

export interface ListTransactionsParams {
  page: number
  limit: number
  sort: TransactionSort
  dateFrom?: string
  dateTo?: string
  type?: TransactionType
  status?: TransactionStatus
  accountId?: string
  categoryId?: string
}

export interface CreateTransactionDto {
  accountId: string
  destinationAccountId?: string
  categoryId?: string
  type: TransactionType
  status?: TransactionStatus
  amountCents: number
  date: string
  description?: string | null
  direction?: TransactionDirection
}

export interface UpdateTransactionDto {
  accountId?: string
  destinationAccountId?: string | null
  categoryId?: string
  type?: TransactionType
  amountCents?: number
  date?: string
  description?: string | null
  direction?: TransactionDirection | null
}

export type ConfirmTransactionDto = UpdateTransactionDto
