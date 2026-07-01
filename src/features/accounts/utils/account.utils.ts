import {
  Wallet,
  type LucideIcon,
} from 'lucide-react'
import {
  ACCOUNT_COLOR_OPTIONS,
  ACCOUNT_ICON_OPTIONS,
  ACCOUNT_ICON_MAP,
  ACCOUNT_TYPE_LABELS,
  type AccountColorOption,
} from '../constants/account.constants'
import type { Account, AccountType } from '../types/account.types'

const typeIconMap: Record<AccountType, LucideIcon> = {
  CASH: Wallet,
  BANK: ACCOUNT_ICON_MAP.landmark ?? Wallet,
  CREDIT_CARD: ACCOUNT_ICON_MAP['credit-card'] ?? Wallet,
  INVESTMENT: ACCOUNT_ICON_MAP['piggy-bank'] ?? Wallet,
}

export const getAccountTypeLabel = (type: AccountType): string =>
  ACCOUNT_TYPE_LABELS[type]

export const getAccountIcon = (
  account: Pick<Account, 'icon' | 'type'>
): LucideIcon =>
  account.icon
    ? (ACCOUNT_ICON_MAP[account.icon] ?? typeIconMap[account.type])
    : typeIconMap[account.type]

export const getAccountIconOption = (value: string | null | undefined) =>
  ACCOUNT_ICON_OPTIONS.find((option) => option.value === value)

export const getAccountColorOption = (
  value: string | null | undefined,
  options: AccountColorOption[] = ACCOUNT_COLOR_OPTIONS
) =>
  options.find((option) => option.value === value) ??
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
  const totalCurrentCents = includedAccounts.reduce(
    (sum, account) => sum + account.balance.currentCents,
    0
  )
  const projectedBalances = includedAccounts
    .map((account) => account.balance.projectedCents)
    .filter((value): value is number => typeof value === 'number')
  const totalProjectedCents = projectedBalances.reduce(
    (sum, value) => sum + value,
    0
  )

  return {
    activeCount: activeAccounts.length,
    archivedCount: archivedAccounts.length,
    includedCount: includedAccounts.length,
    totalCurrentCents,
    totalProjectedCents,
    hasProjectedBalance: projectedBalances.length === includedAccounts.length,
    defaultAccount: activeAccounts.find((account) => account.isDefault) ?? null,
  }
}
