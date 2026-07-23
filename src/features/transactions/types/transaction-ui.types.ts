import type {
  Transaction,
  TransactionStatus,
  TransactionType,
} from './transaction.types'

export type TransactionView = 'ALL' | 'EXPENSE' | 'INCOME' | 'TRANSFER'

export interface TransactionAdvancedFilters {
  accountId: string | null
  categoryId: string | null
  status: TransactionStatus | null
  dateFrom: string
  dateTo: string
}

export type TransactionFormMode = 'create' | 'edit'

export type TransactionFormSheetState =
  | {
      mode: 'create'
      type: Extract<TransactionType, 'INCOME' | 'EXPENSE' | 'TRANSFER'>
    }
  | {
      mode: 'edit'
      transaction: Transaction
    }
  | null

export type TransactionConfirmSheetState =
  | {
      transaction: Transaction
    }
  | null

export type TransactionDetailsSheetState =
  | {
      transaction: Transaction
    }
  | null

export type TransactionDeleteDialogState =
  | {
      transaction: Transaction
    }
  | null
