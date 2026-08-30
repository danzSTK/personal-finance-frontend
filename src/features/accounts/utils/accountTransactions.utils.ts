import {
  TRANSACTION_DEFAULT_LIMIT,
  TRANSACTION_DEFAULT_PAGE,
  TRANSACTION_ROUTES,
} from '@/features/transactions/constants/transaction.constants'
import type { TransactionView } from '@/features/transactions/types/transaction-ui.types'
import {
  buildTransactionsUrl,
  type TransactionUrlState,
} from '@/features/transactions/utils/transactionUrl.utils'
import {
  getCurrentYearMonth,
  getMonthEndDateOnly,
  getMonthStartDateOnly,
  type YearMonth,
} from '@/shared/utils/dateOnly'

type AccountTransactionView = Extract<TransactionView, 'INCOME' | 'EXPENSE'>

interface BuildAccountPeriodTransactionsUrlParams {
  accountId: string
  period: YearMonth
  view: AccountTransactionView
}

export const buildAccountTransactionsUrl = (accountId: string): string => {
  const period = getCurrentYearMonth()

  return buildTransactionsUrl(
    TRANSACTION_ROUTES.transactions,
    buildTransactionUrlState(period),
    { accountId, page: TRANSACTION_DEFAULT_PAGE }
  )
}

export const buildAccountPeriodTransactionsUrl = ({
  accountId,
  period,
  view,
}: BuildAccountPeriodTransactionsUrlParams): string =>
  buildTransactionsUrl(
    TRANSACTION_ROUTES.transactions,
    buildTransactionUrlState(period),
    {
      accountId,
      page: TRANSACTION_DEFAULT_PAGE,
      status: 'EFFECTIVE',
      view,
    }
  )

const buildTransactionUrlState = (period: YearMonth): TransactionUrlState => ({
  view: 'ALL',
  period,
  page: TRANSACTION_DEFAULT_PAGE,
  limit: TRANSACTION_DEFAULT_LIMIT,
  search: '',
  filters: {
    accountId: null,
    categoryId: null,
    status: null,
    dateFrom: getMonthStartDateOnly(period),
    dateTo: getMonthEndDateOnly(period),
  },
})
