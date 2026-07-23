import {
  CATEGORY_COLOR_OPTIONS,
  CATEGORY_ICON_OPTIONS,
  CATEGORY_TYPE_LABELS,
  DEFAULT_CATEGORY_COLOR_BY_TYPE,
  DEFAULT_CATEGORY_ICON_BY_TYPE,
} from '../constants/category.constants'
import type {
  Category,
  CategoryManagementType,
  CategoryType,
  ManageableCategoryType,
} from '../types/category.types'

const LEGACY_CATEGORY_COLOR_ALIASES: Record<string, string> = {
  'var(--state-expense)': 'orange',
  'var(--state-income)': 'emerald',
  'var(--state-warning)': 'amber',
  'var(--state-info)': 'blue',
  'var(--brand)': 'violet',
  coral: 'orange',
  brand: 'violet',
}

export const getCategoryTypeLabel = (type: CategoryType): string =>
  CATEGORY_TYPE_LABELS[type]

export const parseCategoryManagementType = (
  value: string | null
): CategoryManagementType | null =>
  value === 'INCOME' || value === 'EXPENSE' ? value : null

export const isManagementType = (
  type: CategoryType
): type is ManageableCategoryType =>
  type === 'INCOME' || type === 'EXPENSE' || type === 'INVESTMENT'

export const canManageCategory = (category: Category): boolean =>
  category.isEditable &&
  category.isVisibleInManagement &&
  !category.isSystem &&
  isManagementType(category.type)

export const canRestoreCategory = (category: Category): boolean =>
  category.isArchived && !category.isSystem && isManagementType(category.type)

export const getCategoryIconKey = (
  category: Pick<Category, 'iconKey' | 'icon'>
) => category.iconKey ?? category.icon ?? null

export const getCategoryColorToken = (
  category: Pick<Category, 'colorToken' | 'color'>
) => category.colorToken ?? category.color ?? null

export const getCategoryIconOption = (value: string | null | undefined) =>
  CATEGORY_ICON_OPTIONS.find((option) => option.key === value) ??
  CATEGORY_ICON_OPTIONS[0]

export const getCategoryColorOption = (
  value: string | null | undefined,
  fallbackType: CategoryManagementType
) => {
  const normalizedValue = value
    ? (LEGACY_CATEGORY_COLOR_ALIASES[value] ?? value)
    : null

  return (
    CATEGORY_COLOR_OPTIONS.find((option) => option.key === normalizedValue) ??
    CATEGORY_COLOR_OPTIONS.find(
      (option) =>
        normalizedValue !== null &&
        option.hex.toLowerCase() === normalizedValue.toLowerCase()
    ) ??
    CATEGORY_COLOR_OPTIONS.find(
      (option) => option.key === DEFAULT_CATEGORY_COLOR_BY_TYPE[fallbackType]
    ) ??
    CATEGORY_COLOR_OPTIONS[0]
  )
}

export const getDefaultCategoryColor = (type: CategoryManagementType) =>
  DEFAULT_CATEGORY_COLOR_BY_TYPE[type]

export const getDefaultCategoryIcon = (type: CategoryManagementType) =>
  DEFAULT_CATEGORY_ICON_BY_TYPE[type]

export const categoryTypeTone = (type: CategoryType) => {
  if (type === 'INCOME') {
    return 'text-state-income bg-state-income/10'
  }

  if (type === 'EXPENSE') {
    return 'text-state-expense bg-state-expense/10'
  }

  return 'text-state-info bg-state-info/10'
}
