import type { Account } from '@/features/accounts/types/account.types'
import type { Category } from '@/features/categories/types/category.types'
import {
  compareDateOnly,
  formatDateOnlyForDisplay,
  getTodayDateOnly,
  isPastDateOnly,
} from '@/shared/utils/dateOnly'
import {
  TRANSACTION_TYPE_ICONS,
  TRANSACTION_TYPE_LABELS,
  TRANSACTION_VIEW_OPTIONS,
} from '../constants/transaction.constants'
import type { TransactionFormValues } from '../schemas/transaction.schema'
import type {
  ConfirmTransactionDto,
  CreateTransactionDto,
  Transaction,
  TransactionStatus,
  TransactionType,
  UpdateTransactionDto,
} from '../types/transaction.types'
import type { TransactionView } from '../types/transaction-ui.types'

export type TransactionDerivedStatus = 'EFFECTIVE' | 'PENDING' | 'OVERDUE'

export const getTransactionTypeLabel = (type: TransactionType): string =>
  TRANSACTION_TYPE_LABELS[type]

export const getTransactionTypeIcon = (type: TransactionType) =>
  TRANSACTION_TYPE_ICONS[type]

export const getTransactionViewOption = (view: TransactionView) =>
  TRANSACTION_VIEW_OPTIONS.find((option) => option.value === view) ??
  TRANSACTION_VIEW_OPTIONS[0]

export const getTransactionViewToneClassName = (
  view: TransactionView,
  target: 'text' | 'border' | 'bg' | 'softBg' = 'text'
): string => {
  const tone = getTransactionViewOption(view).tone

  if (tone === 'income') {
    if (target === 'border') return 'border-state-income'
    if (target === 'bg') return 'bg-state-income'
    if (target === 'softBg') return 'bg-state-income/10'
    return 'text-state-income'
  }

  if (tone === 'expense') {
    if (target === 'border') return 'border-state-expense'
    if (target === 'bg') return 'bg-state-expense'
    if (target === 'softBg') return 'bg-state-expense/10'
    return 'text-state-expense'
  }

  if (target === 'border') return 'border-state-info'
  if (target === 'bg') return 'bg-state-info'
  if (target === 'softBg') return 'bg-state-info/10'
  return 'text-state-info'
}

export const viewToTransactionType = (
  view: TransactionView
): TransactionType | undefined => (view === 'ALL' ? undefined : view)

export const getTransactionDerivedStatus = (
  transaction: Pick<Transaction, 'status' | 'date' | 'effectiveAt'>,
  today: string = getTodayDateOnly()
): TransactionDerivedStatus => {
  if (transaction.status === 'EFFECTIVE') {
    return 'EFFECTIVE'
  }

  if (transaction.effectiveAt === null && isPastDateOnly(transaction.date, today)) {
    return 'OVERDUE'
  }

  return 'PENDING'
}

export const getTransactionStatusLabel = (
  status: TransactionDerivedStatus
): string => {
  if (status === 'EFFECTIVE') return 'Efetuada'
  if (status === 'OVERDUE') return 'Atrasada'
  return 'Pendente'
}

export const getTransactionAmountSign = (type: TransactionType): string => {
  if (type === 'INCOME') return '+'
  return ''
}

export const getTransactionAmountClassName = (type: TransactionType): string => {
  if (type === 'INCOME') return 'text-state-income'
  if (type === 'EXPENSE') return 'text-state-expense'
  return 'text-foreground'
}

export const formatSignedTransactionAmount = (
  transaction: Pick<Transaction, 'type' | 'amountCents'>,
  formatter: (cents: number) => string
): string => {
  const sign = getTransactionAmountSign(transaction.type)
  const amount = formatter(transaction.amountCents)

  return sign ? `${sign} ${amount}` : amount
}

export const getTransactionDescription = (
  transaction: Pick<Transaction, 'description'>
): string => transaction.description?.trim() || 'Sem descrição'

export const getAccountName = (
  accounts: Account[],
  accountId: string | null | undefined
): string => {
  if (!accountId) return 'Conta não informada'

  return accounts.find((account) => account.id === accountId)?.name ?? 'Conta'
}

export const getCategoryName = (
  categories: Category[],
  transaction: Pick<Transaction, 'categoryId' | 'type'>
): string => {
  if (transaction.type === 'TRANSFER') return 'Transferência'
  if (transaction.type === 'ADJUSTMENT') return 'Ajuste'

  return (
    categories.find((category) => category.id === transaction.categoryId)
      ?.displayName ?? 'Categoria'
  )
}

export const sortDateOnlyDescending = (a: string, b: string): number =>
  compareDateOnly(a, b) * -1

export const getTransactionFormDefaults = (
  type: TransactionType,
  transaction?: Transaction
): TransactionFormValues => {
  if (transaction) {
    return {
      type: transaction.type,
      status: transaction.status,
      amountCents: transaction.amountCents,
      date: transaction.date,
      description: transaction.description,
      accountId: transaction.accountId,
      destinationAccountId: transaction.destinationAccountId,
      categoryId:
        transaction.type === 'INCOME' || transaction.type === 'EXPENSE'
          ? transaction.categoryId
          : null,
      direction: transaction.direction,
    }
  }

  return {
    type,
    status: 'EFFECTIVE',
    amountCents: undefined,
    date: getTodayDateOnly(),
    description: null,
    accountId: '',
    destinationAccountId: null,
    categoryId: null,
    direction: null,
  }
}

export const buildCreateTransactionDto = (
  values: TransactionFormValues
): CreateTransactionDto => {
  const dto: CreateTransactionDto = {
    accountId: values.accountId,
    type: values.type,
    status: values.status,
    amountCents: values.amountCents ?? 0,
    date: values.date,
    description: normalizeOptionalText(values.description),
  }

  if (values.type === 'INCOME' || values.type === 'EXPENSE') {
    dto.categoryId = values.categoryId ?? undefined
  }

  if (values.type === 'TRANSFER') {
    dto.destinationAccountId = values.destinationAccountId ?? undefined
  }

  if (values.type === 'ADJUSTMENT') {
    dto.direction = values.direction ?? undefined
  }

  return dto
}

export const buildConfirmTransactionDto = (
  values: Pick<
    TransactionFormValues,
    'accountId' | 'amountCents' | 'date' | 'destinationAccountId' | 'type'
  >
): ConfirmTransactionDto => ({
  amountCents: values.amountCents ?? 0,
  date: values.date,
  accountId: values.accountId,
  ...(values.type === 'TRANSFER' && values.destinationAccountId
    ? { destinationAccountId: values.destinationAccountId }
    : {}),
})

export const buildUpdateTransactionDto = (
  values: TransactionFormValues,
  original: Transaction
): UpdateTransactionDto => {
  const description = normalizeOptionalText(values.description)
  const originalDescription = normalizeOptionalText(original.description)
  const dto: UpdateTransactionDto = {}

  if (values.accountId !== original.accountId) {
    dto.accountId = values.accountId
  }

  if (values.type !== original.type) {
    dto.type = values.type
  }

  if (
    values.amountCents !== undefined &&
    values.amountCents !== original.amountCents
  ) {
    dto.amountCents = values.amountCents
  }

  if (values.date !== original.date) {
    dto.date = values.date
  }

  if (description !== originalDescription) {
    dto.description = description
  }

  if (
    (values.type === 'INCOME' || values.type === 'EXPENSE') &&
    values.categoryId &&
    values.categoryId !== original.categoryId
  ) {
    dto.categoryId = values.categoryId
  }

  if (
    values.type === 'TRANSFER' &&
    values.destinationAccountId &&
    values.destinationAccountId !== original.destinationAccountId
  ) {
    dto.destinationAccountId = values.destinationAccountId
  }

  if (
    values.type === 'ADJUSTMENT' &&
    values.direction &&
    values.direction !== original.direction
  ) {
    dto.direction = values.direction
  }

  return dto
}

export const normalizeOptionalText = (value: string | null): string | null => {
  const normalized = value?.trim() ?? ''

  return normalized === '' ? null : normalized
}

export const formatTransactionDate = formatDateOnlyForDisplay

export const getConfirmActionLabel = (
  type: TransactionType,
  status: TransactionStatus = 'PENDING'
): string => {
  if (status === 'EFFECTIVE') return 'Efetuada'
  if (type === 'INCOME') return 'Confirmar recebimento'
  if (type === 'EXPENSE') return 'Pagar despesa'
  if (type === 'TRANSFER') return 'Confirmar transferência'
  return 'Confirmar ajuste'
}
