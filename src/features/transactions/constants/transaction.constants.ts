import {
  ArrowLeftRight,
  CircleDollarSign,
  HandCoins,
  ListChecks,
  ReceiptText,
  WalletCards,
  type LucideIcon,
} from 'lucide-react'
import type { TransactionType } from '../types/transaction.types'
import type { TransactionView } from '../types/transaction-ui.types'

export const TRANSACTION_ROUTES = {
  transactions: '/transactions',
} as const

export const TRANSACTION_API_ENDPOINTS = {
  transactions: '/transactions',
} as const

const TRANSACTION_QUERY_ROOT = ['transactions'] as const

export const TRANSACTION_QUERY_KEYS = {
  transactions: TRANSACTION_QUERY_ROOT,
  list: (params: unknown) => [...TRANSACTION_QUERY_ROOT, 'list', params] as const,
  detail: (transactionId: string) =>
    [...TRANSACTION_QUERY_ROOT, 'detail', transactionId] as const,
} as const

export const TRANSACTION_PAGE_SIZE_OPTIONS = [10, 20, 50, 100] as const
export const TRANSACTION_DEFAULT_PAGE = 1
export const TRANSACTION_DEFAULT_LIMIT = 20
export const TRANSACTION_SEARCH_DEBOUNCE_MS = 300

export const TRANSACTION_TYPE_LABELS: Record<TransactionType, string> = {
  INCOME: 'Receita',
  EXPENSE: 'Despesa',
  TRANSFER: 'Transferência',
  ADJUSTMENT: 'Ajuste',
}

export const TRANSACTION_VIEW_OPTIONS: Array<{
  value: TransactionView
  label: string
  icon: LucideIcon
  tone: 'info' | 'expense' | 'income'
}> = [
  {
    value: 'ALL',
    label: 'Todas',
    icon: ListChecks,
    tone: 'info',
  },
  {
    value: 'EXPENSE',
    label: 'Despesas',
    icon: ReceiptText,
    tone: 'expense',
  },
  {
    value: 'INCOME',
    label: 'Receitas',
    icon: HandCoins,
    tone: 'income',
  },
  {
    value: 'TRANSFER',
    label: 'Transferências',
    icon: ArrowLeftRight,
    tone: 'info',
  },
]

export const TRANSACTION_TYPE_ICONS: Record<TransactionType, LucideIcon> = {
  INCOME: HandCoins,
  EXPENSE: ReceiptText,
  TRANSFER: ArrowLeftRight,
  ADJUSTMENT: CircleDollarSign,
}

export const TRANSACTION_VIEW_CREATE_LABELS: Record<
  Extract<TransactionView, 'EXPENSE' | 'INCOME'>,
  string
> = {
  EXPENSE: 'Nova despesa',
  INCOME: 'Nova receita',
}

export const TRANSACTION_ACCOUNT_FALLBACK_ICON = WalletCards
