import {
  BadgeDollarSign,
  Banknote,
  CreditCard,
  Landmark,
  PiggyBank,
  Wallet,
  type LucideIcon,
} from 'lucide-react'
import {
  ACCOUNT_COLOR_OPTIONS,
  ACCOUNT_ICON_OPTIONS,
  ACCOUNT_TYPE_LABELS,
} from '../constants/account.constants'
import type { Account, AccountType } from '../types/account.types'

const iconMap: Record<string, LucideIcon> = {
  wallet: Wallet,
  landmark: Landmark,
  'credit-card': CreditCard,
  'piggy-bank': PiggyBank,
  banknote: Banknote,
  'badge-dollar-sign': BadgeDollarSign,
}

const typeIconMap: Record<AccountType, LucideIcon> = {
  CASH: Wallet,
  BANK: Landmark,
  CREDIT_CARD: CreditCard,
  INVESTMENT: PiggyBank,
}

export const getAccountTypeLabel = (type: AccountType): string =>
  ACCOUNT_TYPE_LABELS[type]

export const getAccountIcon = (
  account: Pick<Account, 'icon' | 'type'>
): LucideIcon =>
  account.icon
    ? (iconMap[account.icon] ?? typeIconMap[account.type])
    : typeIconMap[account.type]

export const getAccountIconOption = (value: string | null | undefined) =>
  ACCOUNT_ICON_OPTIONS.find((option) => option.value === value)

export const getAccountColorOption = (value: string | null | undefined) =>
  ACCOUNT_COLOR_OPTIONS.find((option) => option.value === value) ??
  ACCOUNT_COLOR_OPTIONS[0]

export const canArchiveAccount = (account: Account): boolean =>
  account.type !== 'CASH' && !account.isDefault && !account.isArchived

export const canSetDefaultAccount = (account: Account): boolean =>
  !account.isArchived && !account.isDefault

export const buildAccountSummary = (accounts: Account[]) => {
  const activeAccounts = accounts.filter((account) => !account.isArchived)
  const archivedAccounts = accounts.filter((account) => account.isArchived)
  const includedAccounts = activeAccounts.filter(
    (account) => account.includeInTotal
  )
  const totalInitialBalance = includedAccounts.reduce(
    (sum, account) => sum + account.initialBalance,
    0
  )

  return {
    activeCount: activeAccounts.length,
    archivedCount: archivedAccounts.length,
    includedCount: includedAccounts.length,
    totalInitialBalance,
    defaultAccount: activeAccounts.find((account) => account.isDefault) ?? null,
  }
}
