import {
  Banknote,
  BookOpen,
  BriefcaseBusiness,
  Bus,
  Car,
  CircleHelp,
  Coins,
  CreditCard,
  Dumbbell,
  Film,
  Fuel,
  Gamepad2,
  Gift,
  GraduationCap,
  HandCoins,
  HeartPulse,
  Home,
  Landmark,
  Lightbulb,
  Music,
  PiggyBank,
  Plane,
  Receipt,
  ShoppingCart,
  Shield,
  Smartphone,
  Stethoscope,
  Train,
  TrendingUp,
  Utensils,
  Wallet,
  Wifi,
  type LucideIcon,
} from 'lucide-react'
import type {
  CategoryColorMetadata,
  CategoryIconMetadata,
  CategoryManagementType,
  CategoryType,
  ManageableCategoryType,
} from '../types/category.types'

export const CATEGORY_ROUTES = {
  categories: '/categories',
} as const

export const CATEGORY_API_ENDPOINTS = {
  categories: '/categories',
  metadata: '/categories/metadata',
} as const

const CATEGORY_QUERY_ROOT = ['categories'] as const

export const CATEGORY_QUERY_KEYS = {
  categories: CATEGORY_QUERY_ROOT,
  list: (params: {
    page: number
    limit: number
    type: ManageableCategoryType
    search: string
    includeArchived: boolean
  }) => [...CATEGORY_QUERY_ROOT, params] as const,
  detail: (categoryId: string) =>
    [...CATEGORY_QUERY_ROOT, 'detail', categoryId] as const,
  metadata: [...CATEGORY_QUERY_ROOT, 'metadata'] as const,
} as const

export const CATEGORY_TYPE_LABELS: Record<CategoryType, string> = {
  INCOME: 'Receita',
  EXPENSE: 'Despesa',
  INVESTMENT: 'Investimento',
  TRANSFER: 'Transferência',
  ADJUSTMENT: 'Ajuste',
}

export const CATEGORY_MANAGEMENT_TABS: Array<{
  value: CategoryManagementType
  label: string
  createLabel: string
}> = [
  {
    value: 'EXPENSE',
    label: 'Despesas',
    createLabel: 'Categoria de despesa',
  },
  {
    value: 'INCOME',
    label: 'Receitas',
    createLabel: 'Categoria de receita',
  },
]

export const CATEGORY_PAGE_SIZE_OPTIONS = [10, 20, 50, 100] as const
export const CATEGORY_DEFAULT_PAGE = 1
export const CATEGORY_DEFAULT_LIMIT = 20
export const CATEGORY_SEARCH_DEBOUNCE_MS = 300

export const CATEGORY_ICON_OPTIONS: Array<{
  value: string
  key: string
  label: string
  icon: LucideIcon
}> = [
  { value: 'wallet', key: 'wallet', label: 'Carteira', icon: Wallet },
  { value: 'landmark', key: 'landmark', label: 'Banco', icon: Landmark },
  {
    value: 'credit-card',
    key: 'credit-card',
    label: 'Cartão de crédito',
    icon: CreditCard,
  },
  { value: 'banknote', key: 'banknote', label: 'Dinheiro', icon: Banknote },
  { value: 'coins', key: 'coins', label: 'Moedas', icon: Coins },
  {
    value: 'piggy-bank',
    key: 'piggy-bank',
    label: 'Reserva',
    icon: PiggyBank,
  },
  { value: 'utensils', key: 'utensils', label: 'Alimentação', icon: Utensils },
  {
    value: 'shopping-cart',
    key: 'shopping-cart',
    label: 'Compras',
    icon: ShoppingCart,
  },
  { value: 'car', key: 'car', label: 'Carro', icon: Car },
  { value: 'bus', key: 'bus', label: 'Ônibus', icon: Bus },
  { value: 'train', key: 'train', label: 'Transporte público', icon: Train },
  { value: 'home', key: 'home', label: 'Moradia', icon: Home },
  {
    value: 'heart-pulse',
    key: 'heart-pulse',
    label: 'Saúde',
    icon: HeartPulse,
  },
  {
    value: 'stethoscope',
    key: 'stethoscope',
    label: 'Médico',
    icon: Stethoscope,
  },
  { value: 'gamepad-2', key: 'gamepad-2', label: 'Jogos', icon: Gamepad2 },
  { value: 'film', key: 'film', label: 'Cinema', icon: Film },
  { value: 'music', key: 'music', label: 'Música', icon: Music },
  { value: 'dumbbell', key: 'dumbbell', label: 'Academia', icon: Dumbbell },
  {
    value: 'graduation-cap',
    key: 'graduation-cap',
    label: 'Educação',
    icon: GraduationCap,
  },
  { value: 'book-open', key: 'book-open', label: 'Estudos', icon: BookOpen },
  { value: 'plane', key: 'plane', label: 'Viagem', icon: Plane },
  { value: 'fuel', key: 'fuel', label: 'Combustível', icon: Fuel },
  { value: 'wifi', key: 'wifi', label: 'Internet', icon: Wifi },
  { value: 'smartphone', key: 'smartphone', label: 'Celular', icon: Smartphone },
  { value: 'lightbulb', key: 'lightbulb', label: 'Energia', icon: Lightbulb },
  { value: 'shield', key: 'shield', label: 'Seguro', icon: Shield },
  { value: 'gift', key: 'gift', label: 'Presentes', icon: Gift },
  {
    value: 'briefcase-business',
    key: 'briefcase-business',
    label: 'Trabalho',
    icon: BriefcaseBusiness,
  },
  {
    value: 'trending-up',
    key: 'trending-up',
    label: 'Investimentos',
    icon: TrendingUp,
  },
  { value: 'circle-help', key: 'circle-help', label: 'Outros', icon: CircleHelp },
  { value: 'receipt', key: 'receipt', label: 'Contas', icon: Receipt },
  {
    value: 'hand-coins',
    key: 'hand-coins',
    label: 'Recebimentos',
    icon: HandCoins,
  },
]

export const CATEGORY_COLOR_OPTIONS: Array<{
  value: string
  key: string
  label: string
  hex: `#${string}`
}> = [
  { value: 'slate', key: 'slate', label: 'Ardosia', hex: '#64748B' },
  { value: 'gray', key: 'gray', label: 'Cinza', hex: '#6B7280' },
  { value: 'zinc', key: 'zinc', label: 'Zinco', hex: '#71717A' },
  { value: 'red', key: 'red', label: 'Vermelho', hex: '#EF4444' },
  { value: 'orange', key: 'orange', label: 'Laranja', hex: '#F97316' },
  { value: 'amber', key: 'amber', label: 'Âmbar', hex: '#F59E0B' },
  { value: 'yellow', key: 'yellow', label: 'Amarelo', hex: '#EAB308' },
  { value: 'lime', key: 'lime', label: 'Lima', hex: '#84CC16' },
  { value: 'green', key: 'green', label: 'Verde', hex: '#22C55E' },
  { value: 'emerald', key: 'emerald', label: 'Esmeralda', hex: '#10B981' },
  { value: 'teal', key: 'teal', label: 'Verde azulado', hex: '#14B8A6' },
  { value: 'cyan', key: 'cyan', label: 'Ciano', hex: '#06B6D4' },
  { value: 'sky', key: 'sky', label: 'Céu', hex: '#0EA5E9' },
  { value: 'blue', key: 'blue', label: 'Azul', hex: '#3B82F6' },
  { value: 'indigo', key: 'indigo', label: 'Índigo', hex: '#6366F1' },
  { value: 'violet', key: 'violet', label: 'Violeta', hex: '#8B5CF6' },
  { value: 'purple', key: 'purple', label: 'Roxo', hex: '#A855F7' },
  { value: 'fuchsia', key: 'fuchsia', label: 'Fúcsia', hex: '#D946EF' },
  { value: 'pink', key: 'pink', label: 'Rosa', hex: '#EC4899' },
  { value: 'rose', key: 'rose', label: 'Rose', hex: '#F43F5E' },
]

export const DEFAULT_CATEGORY_COLOR_BY_TYPE: Record<
  CategoryManagementType,
  string
> = {
  EXPENSE: 'orange',
  INCOME: 'emerald',
}

export const DEFAULT_CATEGORY_ICON_BY_TYPE: Record<
  CategoryManagementType,
  string
> = {
  EXPENSE: 'receipt',
  INCOME: 'hand-coins',
}

export const CATEGORY_ICON_MAP: Record<string, LucideIcon> =
  CATEGORY_ICON_OPTIONS.reduce<Record<string, LucideIcon>>((acc, option) => {
    acc[option.key] = option.icon
    return acc
  }, {})

export const mergeCategoryIconMetadata = (
  icons: CategoryIconMetadata[] | undefined
) =>
  (icons?.length ? icons : CATEGORY_ICON_OPTIONS).map((icon) => ({
    ...icon,
    value: icon.key,
    icon: CATEGORY_ICON_MAP[icon.key] ?? CircleHelp,
  }))

export const mergeCategoryColorMetadata = (
  colors: CategoryColorMetadata[] | undefined
) =>
  (colors?.length ? colors : CATEGORY_COLOR_OPTIONS).map((color) => ({
    ...color,
    value: color.key,
  }))
