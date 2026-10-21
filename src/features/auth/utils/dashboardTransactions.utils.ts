import { AUTH_ROUTES } from '@/features/auth/constants/auth.constants'
import { TRANSACTION_DEFAULT_PAGE } from '@/features/transactions/constants/transaction.constants'
import type {
  Transaction,
  TransactionType,
} from '@/features/transactions/types/transaction.types'
import {
  buildTransactionsUrl,
  type TransactionUrlState,
} from '@/features/transactions/utils/transactionUrl.utils'
import { getTodayDateOnly } from '@/shared/utils/dateOnly'

type PendingDashboardTransactionType = Extract<
  TransactionType,
  'INCOME' | 'EXPENSE'
>

interface BuildPendingDashboardTransactionsUrlParams {
  state: TransactionUrlState
  type: PendingDashboardTransactionType
  oldestTransaction?: Pick<Transaction, 'date'>
  furthestTransaction?: Pick<Transaction, 'date'>
  fallbackDate?: string
}

export const buildPendingDashboardTransactionsUrl = ({
  state,
  type,
  oldestTransaction,
  furthestTransaction,
  fallbackDate = getTodayDateOnly(),
}: BuildPendingDashboardTransactionsUrlParams): string =>
  buildTransactionsUrl(AUTH_ROUTES.transactions, state, {
    view: type,
    status: 'PENDING',
    page: TRANSACTION_DEFAULT_PAGE,
    dateFrom:
      oldestTransaction?.date ?? furthestTransaction?.date ?? fallbackDate,
    dateTo:
      furthestTransaction?.date ?? oldestTransaction?.date ?? fallbackDate,
  })
