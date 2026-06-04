import {
  BadgeDollarSign,
  Banknote,
  CreditCard,
  Landmark,
  PiggyBank,
  Wallet,
  type LucideIcon,
} from 'lucide-react'
import type {
  AccountType,
  UserCreatableAccountType,
} from '../types/account.types'

export const ACCOUNT_ROUTES = {
  accounts: '/accounts',
} as const

export const ACCOUNT_API_ENDPOINTS = {
  accounts: '/accounts',
} as const

export const ACCOUNT_QUERY_KEYS = {
  accounts: ['accounts'] as const,
  list: (includeArchived: boolean) =>
    [...ACCOUNT_QUERY_KEYS.accounts, { includeArchived }] as const,
} as const

export const ACCOUNT_TYPE_LABELS: Record<AccountType, string> = {
  CASH: 'Carteira',
  BANK: 'Conta bancária',
  CREDIT_CARD: 'Cartão de crédito',
  INVESTMENT: 'Investimento',
}

export const USER_CREATABLE_ACCOUNT_TYPES: Array<{
  value: UserCreatableAccountType
  label: string
  description: string
}> = [
  {
    value: 'BANK',
    label: ACCOUNT_TYPE_LABELS.BANK,
    description: 'Conta corrente, poupança ou conta digital.',
  },
  {
    value: 'CREDIT_CARD',
    label: ACCOUNT_TYPE_LABELS.CREDIT_CARD,
    description: 'Cartão usado para acompanhar compras futuras.',
  },
  {
    value: 'INVESTMENT',
    label: ACCOUNT_TYPE_LABELS.INVESTMENT,
    description: 'Corretora, reserva ou aplicação financeira.',
  },
]

export const ACCOUNT_ICON_OPTIONS: Array<{
  value: string
  label: string
  icon: LucideIcon
}> = [
  { value: 'wallet', label: 'Carteira', icon: Wallet },
  { value: 'landmark', label: 'Banco', icon: Landmark },
  { value: 'credit-card', label: 'Cartão', icon: CreditCard },
  { value: 'piggy-bank', label: 'Reserva', icon: PiggyBank },
  { value: 'banknote', label: 'Dinheiro', icon: Banknote },
  { value: 'badge-dollar-sign', label: 'Valor', icon: BadgeDollarSign },
]

export const ACCOUNT_COLOR_OPTIONS: Array<{
  value: string
  label: string
  swatchClassName: string
  textClassName: string
  surfaceClassName: string
}> = [
  {
    value: 'var(--acct-lav)',
    label: 'Lavanda',
    swatchClassName: 'bg-account-lavender',
    textClassName: 'text-account-lavender',
    surfaceClassName: 'bg-account-lavender/15',
  },
  {
    value: 'var(--acct-cyan)',
    label: 'Ciano',
    swatchClassName: 'bg-account-cyan',
    textClassName: 'text-account-cyan',
    surfaceClassName: 'bg-account-cyan/15',
  },
  {
    value: 'var(--acct-mint)',
    label: 'Menta',
    swatchClassName: 'bg-account-mint',
    textClassName: 'text-account-mint',
    surfaceClassName: 'bg-account-mint/15',
  },
  {
    value: 'var(--acct-gold)',
    label: 'Dourado',
    swatchClassName: 'bg-account-gold',
    textClassName: 'text-account-gold',
    surfaceClassName: 'bg-account-gold/15',
  },
  {
    value: 'var(--acct-rose)',
    label: 'Rosa',
    swatchClassName: 'bg-account-rose',
    textClassName: 'text-account-rose',
    surfaceClassName: 'bg-account-rose/15',
  },
]
