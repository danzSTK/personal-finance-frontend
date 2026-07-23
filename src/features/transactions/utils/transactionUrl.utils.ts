import {
  TRANSACTION_CREATE_INTENT_QUERY_PARAM,
  TRANSACTION_DEFAULT_LIMIT,
  TRANSACTION_DEFAULT_PAGE,
  TRANSACTION_PAGE_SIZE_OPTIONS,
} from '../constants/transaction.constants'
import type { TransactionView } from '../types/transaction-ui.types'
import type { TransactionStatus } from '../types/transaction.types'
import {
  getCurrentYearMonth,
  getMonthEndDateOnly,
  getMonthStartDateOnly,
  isValidDateOnly,
  type YearMonth,
} from '@/shared/utils/dateOnly'

export type TransactionCreateIntent = Extract<
  TransactionView,
  'INCOME' | 'EXPENSE' | 'TRANSFER'
>

export interface TransactionUrlState {
  view: TransactionView
  period: YearMonth
  page: number
  limit: number
  search: string
  filters: {
    accountId: string | null
    categoryId: string | null
    status: TransactionStatus | null
    dateFrom: string
    dateTo: string
  }
}

export type TransactionUrlPatch = Partial<{
  view: TransactionView
  period: YearMonth
  page: number
  limit: number
  search: string
  accountId: string | null
  categoryId: string | null
  status: TransactionStatus | null
  dateFrom: string
  dateTo: string
}>

const TRANSACTION_VIEW_VALUES: TransactionView[] = [
  'ALL',
  'EXPENSE',
  'INCOME',
  'TRANSFER',
]

const TRANSACTION_STATUS_VALUES: TransactionStatus[] = ['PENDING', 'EFFECTIVE']

export const parseTransactionCreateIntent = (
  searchParams: URLSearchParams
): TransactionCreateIntent | null => {
  const value = searchParams.get(TRANSACTION_CREATE_INTENT_QUERY_PARAM)

  return value === 'INCOME' || value === 'EXPENSE' || value === 'TRANSFER'
    ? value
    : null
}

export const parseTransactionUrlState = (
  searchParams: URLSearchParams
): TransactionUrlState => {
  const period = parsePeriod(searchParams.get('period')) ?? getCurrentYearMonth()
  const defaultDateFrom = getMonthStartDateOnly(period)
  const defaultDateTo = getMonthEndDateOnly(period)
  const view = parseView(searchParams.get('view'))
  const dateFrom = parseDateOnlyParam(searchParams.get('dateFrom')) ?? defaultDateFrom
  const dateTo = parseDateOnlyParam(searchParams.get('dateTo')) ?? defaultDateTo

  return {
    view,
    period,
    page: parsePositiveInteger(searchParams.get('page')) ?? TRANSACTION_DEFAULT_PAGE,
    limit: parseLimit(searchParams.get('limit')),
    search: searchParams.get('q')?.trim() ?? '',
    filters: {
      accountId: parseNullableString(searchParams.get('accountId')),
      categoryId:
        view === 'TRANSFER'
          ? null
          : parseNullableString(searchParams.get('categoryId')),
      status: parseStatus(searchParams.get('status')),
      dateFrom,
      dateTo,
    },
  }
}

export const buildTransactionSearchParams = (
  state: TransactionUrlState,
  patch: TransactionUrlPatch = {}
): URLSearchParams => {
  const nextPeriod =
    hasPatchKey(patch, 'period') && patch.period ? patch.period : state.period
  const defaultDateFrom = getMonthStartDateOnly(nextPeriod)
  const defaultDateTo = getMonthEndDateOnly(nextPeriod)
  const nextView =
    hasPatchKey(patch, 'view') && patch.view ? patch.view : state.view
  const nextDateFrom =
    hasPatchKey(patch, 'dateFrom') && patch.dateFrom
      ? patch.dateFrom
      : state.filters.dateFrom
  const nextDateTo =
    hasPatchKey(patch, 'dateTo') && patch.dateTo
      ? patch.dateTo
      : state.filters.dateTo
  const nextAccountId = hasPatchKey(patch, 'accountId')
    ? patch.accountId
    : state.filters.accountId
  const nextCategoryId = hasPatchKey(patch, 'categoryId')
    ? patch.categoryId
    : state.filters.categoryId
  const nextStatus = hasPatchKey(patch, 'status')
    ? patch.status
    : state.filters.status
  const nextPage =
    hasPatchKey(patch, 'page') && typeof patch.page === 'number'
      ? patch.page
      : state.page
  const nextLimit =
    hasPatchKey(patch, 'limit') && typeof patch.limit === 'number'
      ? patch.limit
      : state.limit
  const nextSearch = hasPatchKey(patch, 'search') ? patch.search : state.search
  const params = new URLSearchParams()

  setPeriodParam(params, nextPeriod)
  setStringParam(params, 'view', nextView === 'ALL' ? null : nextView)
  setNumberParam(
    params,
    'page',
    nextPage,
    TRANSACTION_DEFAULT_PAGE
  )
  setNumberParam(
    params,
    'limit',
    nextLimit,
    TRANSACTION_DEFAULT_LIMIT
  )
  setStringParam(params, 'q', nextSearch)
  setStringParam(params, 'accountId', nextAccountId)
  setStringParam(
    params,
    'categoryId',
    nextView === 'TRANSFER' ? null : nextCategoryId
  )
  setStringParam(params, 'status', nextStatus)
  setStringParam(
    params,
    'dateFrom',
    nextDateFrom === defaultDateFrom ? null : nextDateFrom
  )
  setStringParam(
    params,
    'dateTo',
    nextDateTo === defaultDateTo ? null : nextDateTo
  )

  return params
}

export const buildTransactionsUrl = (
  basePath: string,
  state: TransactionUrlState,
  patch: TransactionUrlPatch = {}
): string => {
  const params = buildTransactionSearchParams(state, patch)
  const query = params.toString()

  return query ? `${basePath}?${query}` : basePath
}

const parseView = (value: string | null): TransactionView =>
  value && isTransactionView(value) ? value : 'ALL'

const parseStatus = (value: string | null): TransactionStatus | null =>
  value && isTransactionStatus(value) ? value : null

const parseLimit = (value: string | null): number => {
  const parsed = parsePositiveInteger(value)

  return parsed && isPageSizeOption(parsed)
    ? parsed
    : TRANSACTION_DEFAULT_LIMIT
}

const parsePositiveInteger = (value: string | null): number | null => {
  if (!value || !/^\d+$/.test(value)) return null

  const parsed = Number(value)
  return parsed > 0 ? parsed : null
}

const parsePeriod = (value: string | null): YearMonth | null => {
  if (!value || !/^\d{4}-\d{2}$/.test(value)) return null

  const [yearValue = '', monthValue = ''] = value.split('-')
  const year = Number(yearValue)
  const month = Number(monthValue)

  if (!Number.isInteger(year) || month < 1 || month > 12) {
    return null
  }

  return { year, month }
}

const parseDateOnlyParam = (value: string | null): string | null =>
  value && isValidDateOnly(value) ? value : null

const parseNullableString = (value: string | null): string | null => {
  const trimmed = value?.trim()
  return trimmed ? trimmed : null
}

const isPageSizeOption = (
  value: number
): value is (typeof TRANSACTION_PAGE_SIZE_OPTIONS)[number] =>
  TRANSACTION_PAGE_SIZE_OPTIONS.some((option) => option === value)

const isTransactionView = (value: string): value is TransactionView =>
  TRANSACTION_VIEW_VALUES.some((option) => option === value)

const isTransactionStatus = (value: string): value is TransactionStatus =>
  TRANSACTION_STATUS_VALUES.some((option) => option === value)

const hasPatchKey = (
  patch: TransactionUrlPatch,
  key: keyof TransactionUrlPatch
): boolean => Object.prototype.hasOwnProperty.call(patch, key)

const setPeriodParam = (params: URLSearchParams, period: YearMonth) => {
  const current = getCurrentYearMonth()

  if (period.year === current.year && period.month === current.month) {
    return
  }

  params.set('period', `${period.year}-${String(period.month).padStart(2, '0')}`)
}

const setStringParam = (
  params: URLSearchParams,
  key: string,
  value: string | null | undefined
) => {
  const trimmed = value?.trim()

  if (trimmed) {
    params.set(key, trimmed)
  }
}

const setNumberParam = (
  params: URLSearchParams,
  key: string,
  value: number,
  defaultValue: number
) => {
  if (value !== defaultValue) {
    params.set(key, String(value))
  }
}
