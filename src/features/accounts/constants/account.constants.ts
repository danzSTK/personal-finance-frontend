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
  templates: '/account-templates',
} as const

export const ACCOUNT_QUERY_KEYS = {
  accounts: ['accounts'] as const,
  templates: ['account-templates'] as const,
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
  backgroundClass: string
  foregroundClass: string
}

export const ACCOUNT_COLOR_OPTIONS: AccountColorOption[] = [
  colorOption('blue', 'Azul', 'bg-account-blue', 'text-app-text'),
  colorOption('purple', 'Roxo', 'bg-account-purple', 'text-app-text'),
  colorOption('emerald', 'Esmeralda', 'bg-account-emerald', 'text-app-text'),
  colorOption('cyan', 'Ciano', 'bg-account-cyan', 'text-app-bg'),
  colorOption('amber', 'Âmbar', 'bg-account-amber', 'text-app-bg'),
  colorOption('slate', 'Ardósia', 'bg-account-slate', 'text-app-text'),
  colorOption('gray', 'Cinza', 'bg-account-gray', 'text-app-text'),
  colorOption('zinc', 'Zinco', 'bg-account-zinc', 'text-app-text'),
  colorOption('red', 'Vermelho', 'bg-account-red', 'text-app-text'),
  colorOption('orange', 'Laranja', 'bg-account-orange', 'text-app-bg'),
  colorOption('yellow', 'Amarelo', 'bg-account-yellow', 'text-app-bg'),
  colorOption('lime', 'Lima', 'bg-account-lime', 'text-app-bg'),
  colorOption('green', 'Verde', 'bg-account-green', 'text-app-bg'),
  colorOption('teal', 'Verde azulado', 'bg-account-teal', 'text-app-bg'),
  colorOption('sky', 'Céu', 'bg-account-sky', 'text-app-bg'),
  colorOption('indigo', 'Índigo', 'bg-account-indigo', 'text-app-text'),
  colorOption('violet', 'Violeta', 'bg-account-violet', 'text-app-text'),
  colorOption('fuchsia', 'Fúcsia', 'bg-account-fuchsia', 'text-app-text'),
  colorOption('pink', 'Rosa', 'bg-account-pink', 'text-app-text'),
  colorOption('rose', 'Rose', 'bg-account-rose-token', 'text-app-text'),
]

function colorOption(
  key: string,
  label: string,
  backgroundClass: string,
  foregroundClass: string
): AccountColorOption {
  return { value: key, key, label, backgroundClass, foregroundClass }
}

export interface AccountVisualTone {
  backgroundClass: string
  foregroundClass: string
  gradientClass: string
}

export const ACCOUNT_VISUAL_TONES: Record<string, AccountVisualTone> = {
  slate: tone('bg-account-slate', 'text-app-text', '--account-slate'),
  gray: tone('bg-account-gray', 'text-app-text', '--account-gray'),
  zinc: tone('bg-account-zinc', 'text-app-text', '--account-zinc'),
  red: tone('bg-account-red', 'text-app-text', '--account-red'),
  orange: tone('bg-account-orange', 'text-app-bg', '--account-orange'),
  amber: tone('bg-account-amber', 'text-app-bg', '--account-amber'),
  yellow: tone('bg-account-yellow', 'text-app-bg', '--account-yellow'),
  lime: tone('bg-account-lime', 'text-app-bg', '--account-lime'),
  green: tone('bg-account-green', 'text-app-bg', '--account-green'),
  emerald: tone('bg-account-emerald', 'text-app-text', '--account-emerald'),
  teal: tone('bg-account-teal', 'text-app-bg', '--account-teal'),
  cyan: tone('bg-account-cyan', 'text-app-bg', '--account-cyan'),
  sky: tone('bg-account-sky', 'text-app-bg', '--account-sky'),
  blue: tone('bg-account-blue', 'text-app-text', '--account-blue'),
  indigo: tone('bg-account-indigo', 'text-app-text', '--account-indigo'),
  violet: tone('bg-account-violet', 'text-app-text', '--account-violet'),
  purple: tone('bg-account-purple', 'text-app-text', '--account-purple'),
  fuchsia: tone('bg-account-fuchsia', 'text-app-text', '--account-fuchsia'),
  pink: tone('bg-account-pink', 'text-app-text', '--account-pink'),
  rose: tone('bg-account-rose-token', 'text-app-text', '--account-rose-token'),
  nubank: tone('bg-account-nubank', 'text-app-text', '--account-nubank'),
  inter: tone('bg-account-inter', 'text-app-bg', '--account-inter'),
  itau: tone('bg-account-itau', 'text-app-bg', '--account-itau'),
  bradesco: tone('bg-account-bradesco', 'text-app-text', '--account-bradesco'),
  santander: tone(
    'bg-account-santander',
    'text-app-text',
    '--account-santander'
  ),
  'banco-do-brasil': tone(
    'bg-account-banco-do-brasil',
    'text-app-bg',
    '--account-banco-do-brasil'
  ),
  caixa: tone('bg-account-caixa', 'text-app-text', '--account-caixa'),
  c6: tone('bg-account-c6', 'text-app-bg', '--account-c6'),
  picpay: tone('bg-account-picpay', 'text-app-bg', '--account-picpay'),
  'mercado-pago': tone(
    'bg-account-mercado-pago',
    'text-app-bg',
    '--account-mercado-pago'
  ),
}

function tone(
  backgroundClass: string,
  foregroundClass: string,
  gradientToneVariable: string
): AccountVisualTone {
  const gradientTone = gradientToneVariable.replace('--account-', '')

  return {
    backgroundClass,
    foregroundClass,
    gradientClass: `account-detail-gradient account-detail-tone-${gradientTone}`,
  }
}

export const DEFAULT_ACCOUNT_VISUAL_TONE: AccountVisualTone = {
  backgroundClass: 'bg-app-elevated',
  foregroundClass: 'text-app-text',
  gradientClass: 'account-detail-gradient',
}

export const ACCOUNT_ICON_MAP: Record<string, LucideIcon> =
  ACCOUNT_ICON_OPTIONS.reduce<Record<string, LucideIcon>>((acc, option) => {
    acc[option.key] = option.icon
    return acc
  }, {})

export interface AccountIconMetadata {
  key: string
  label: string
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
