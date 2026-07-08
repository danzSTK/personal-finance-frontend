import {
  BadgeDollarSign,
  Banknote,
  CreditCard,
  CircleHelp,
  Landmark,
  PiggyBank,
  TrendingUp,
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
  summary: '/accounts/summary',
} as const

export const ACCOUNT_QUERY_KEYS = {
  accounts: ['accounts'] as const,
  list: (params: { includeArchived: boolean; projectedUntil?: string }) =>
    [...ACCOUNT_QUERY_KEYS.accounts, params] as const,
  summary: (params: {
    includeArchived: boolean
    includeExcludedFromTotal: boolean
    projectedUntil?: string
  }) => [...ACCOUNT_QUERY_KEYS.accounts, 'summary', params] as const,
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
  key: string
  label: string
  icon: LucideIcon
}> = [
  { value: 'landmark', key: 'landmark', label: 'Banco', icon: Landmark },
  { value: 'wallet', key: 'wallet', label: 'Carteira', icon: Wallet },
  { value: 'banknote', key: 'banknote', label: 'Dinheiro', icon: Banknote },
  {
    value: 'piggy-bank',
    key: 'piggy-bank',
    label: 'Reserva',
    icon: PiggyBank,
  },
  {
    value: 'badge-dollar-sign',
    key: 'badge-dollar-sign',
    label: 'Valor',
    icon: BadgeDollarSign,
  },
  {
    value: 'credit-card',
    key: 'credit-card',
    label: 'Cartão',
    icon: CreditCard,
  },
  {
    value: 'trending-up',
    key: 'trending-up',
    label: 'Investimentos',
    icon: TrendingUp,
  },
]

export interface AccountColorOption {
  value: string
  key: string
  label: string
  hex: `#${string}`
}

export const ACCOUNT_COLOR_OPTIONS: AccountColorOption[] = [
  { value: 'blue', key: 'blue', label: 'Azul', hex: '#3B82F6' },
  { value: 'purple', key: 'purple', label: 'Roxo', hex: '#A855F7' },
  { value: 'emerald', key: 'emerald', label: 'Esmeralda', hex: '#10B981' },
  { value: 'cyan', key: 'cyan', label: 'Ciano', hex: '#06B6D4' },
  { value: 'amber', key: 'amber', label: 'Âmbar', hex: '#F59E0B' },
  { value: 'slate', key: 'slate', label: 'Ardósia', hex: '#64748B' },
  { value: 'gray', key: 'gray', label: 'Cinza', hex: '#6B7280' },
  { value: 'zinc', key: 'zinc', label: 'Zinco', hex: '#71717A' },
  { value: 'red', key: 'red', label: 'Vermelho', hex: '#EF4444' },
  { value: 'orange', key: 'orange', label: 'Laranja', hex: '#F97316' },
  { value: 'yellow', key: 'yellow', label: 'Amarelo', hex: '#EAB308' },
  { value: 'lime', key: 'lime', label: 'Lima', hex: '#84CC16' },
  { value: 'green', key: 'green', label: 'Verde', hex: '#22C55E' },
  { value: 'teal', key: 'teal', label: 'Verde azulado', hex: '#14B8A6' },
  { value: 'sky', key: 'sky', label: 'Céu', hex: '#0EA5E9' },
  { value: 'indigo', key: 'indigo', label: 'Índigo', hex: '#6366F1' },
  { value: 'violet', key: 'violet', label: 'Violeta', hex: '#8B5CF6' },
  { value: 'fuchsia', key: 'fuchsia', label: 'Fúcsia', hex: '#D946EF' },
  { value: 'pink', key: 'pink', label: 'Rosa', hex: '#EC4899' },
  { value: 'rose', key: 'rose', label: 'Rose', hex: '#F43F5E' },
]

export const ACCOUNT_ICON_MAP: Record<string, LucideIcon> =
  ACCOUNT_ICON_OPTIONS.reduce<Record<string, LucideIcon>>((acc, option) => {
    acc[option.key] = option.icon
    return acc
  }, {})

export interface AccountIconMetadata {
  key: string
  label: string
}

export interface AccountColorMetadata {
  key: string
  label: string
  hex: `#${string}`
}

export const mergeAccountIconMetadata = (
  icons: AccountIconMetadata[] | undefined
) => {
  const metadata = icons?.length ? icons : ACCOUNT_ICON_OPTIONS
  const metadataByKey = new Map(metadata.map((icon) => [icon.key, icon]))
  const ordered = ACCOUNT_ICON_OPTIONS.flatMap((option) => {
    const metadataIcon = metadataByKey.get(option.key)
    return metadataIcon ? [metadataIcon] : []
  })
  const source = ordered.length ? ordered : ACCOUNT_ICON_OPTIONS

  return source.map((icon) => ({
    ...icon,
    value: icon.key,
    icon: ACCOUNT_ICON_MAP[icon.key] ?? CircleHelp,
  }))
}

export const mergeAccountColorMetadata = (
  colors: AccountColorMetadata[] | undefined
) => {
  const metadataByKey = new Map((colors ?? []).map((color) => [color.key, color]))
  const ordered = ACCOUNT_COLOR_OPTIONS.map(
    (option) => metadataByKey.get(option.key) ?? option
  )
  const orderedKeys = new Set(ACCOUNT_COLOR_OPTIONS.map((option) => option.key))
  const extras = (colors ?? []).filter((color) => !orderedKeys.has(color.key))
  const source = colors?.length ? [...ordered, ...extras] : ACCOUNT_COLOR_OPTIONS

  return source.map((color) => ({
    ...color,
    value: color.key,
  }))
}
