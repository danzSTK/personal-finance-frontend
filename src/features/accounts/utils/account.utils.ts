import { Wallet, type LucideIcon } from 'lucide-react'
import {
  ACCOUNT_ICON_OPTIONS,
  ACCOUNT_ICON_MAP,
  ACCOUNT_TYPE_LABELS,
  ACCOUNT_VISUAL_TONES,
  DEFAULT_ACCOUNT_VISUAL_TONE,
  type AccountVisualTone,
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
  account: Pick<Account, 'icon' | 'template' | 'type'>
): LucideIcon =>
  (account.template?.iconKey ?? account.icon)
    ? (ACCOUNT_ICON_MAP[account.template?.iconKey ?? account.icon ?? ''] ??
      typeIconMap[account.type])
    : typeIconMap[account.type]

export const getAccountIconOption = (value: string | null | undefined) =>
  ACCOUNT_ICON_OPTIONS.find((option) => option.value === value)

export const getAccountColorToken = (
  account: Pick<Account, 'color' | 'template'>
): string | null => account.template?.colorToken ?? account.color

export const getAccountVisualTone = (
  account: Pick<Account, 'color' | 'template'>
): AccountVisualTone =>
  ACCOUNT_VISUAL_TONES[getAccountColorToken(account) ?? ''] ??
  DEFAULT_ACCOUNT_VISUAL_TONE

export type AccountVisual =
  | {
      kind: 'logo'
      logoUrl: string
      fallbackIcon: LucideIcon
      tone: AccountVisualTone
    }
  | {
      kind: 'icon'
      icon: LucideIcon
      tone: AccountVisualTone
    }

export const resolveAccountVisual = (
  account: Pick<Account, 'color' | 'icon' | 'template' | 'type'>
): AccountVisual => {
  const fallbackIcon = getAccountIcon(account)
  const tone = getAccountVisualTone(account)
  const logoUrl = account.template?.logoUrl?.trim()

  if (account.template?.type === 'INSTITUTIONAL' && logoUrl) {
    return { kind: 'logo', logoUrl, fallbackIcon, tone }
  }

  return { kind: 'icon', icon: fallbackIcon, tone }
}

export const canArchiveAccount = (account: Account): boolean =>
  account.type !== 'CASH' && !account.isDefault && !account.isArchived

export const canSetDefaultAccount = (account: Account): boolean =>
  !account.isArchived && !account.isDefault
