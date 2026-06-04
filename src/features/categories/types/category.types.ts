export type CategoryType =
  | 'INCOME'
  | 'EXPENSE'
  | 'INVESTMENT'
  | 'TRANSFER'
  | 'ADJUSTMENT'

export type ManageableCategoryType = 'INCOME' | 'EXPENSE' | 'INVESTMENT'

export type CategoryManagementType = 'INCOME' | 'EXPENSE'

export interface Category {
  id: string
  name: string
  displayName: string
  description: string | null
  type: CategoryType
  colorToken: string | null
  iconKey: string | null
  color?: string | null
  icon?: string | null
  isSystem: boolean
  includeInReports: boolean
  isArchived: boolean
  archivedAt: string | null
  sortOrder: number
  isEditable: boolean
  isVisibleInManagement: boolean
  createdAt: string
  updatedAt: string
}

export interface CategoryListMeta {
  total: number
  page: number
  limit: number
  totalPages: number
  hasNextPage: boolean
  hasPreviousPage: boolean
}

export interface CategoryListResponse {
  data: Category[]
  meta: CategoryListMeta
}

export interface ListCategoriesParams {
  page?: number
  limit?: number
  type?: ManageableCategoryType
  search?: string
  includeArchived?: boolean
}

export interface CreateCategoryDto {
  displayName: string
  type: ManageableCategoryType
  description?: string | null
  colorToken?: string | null
  iconKey?: string | null
  includeInReports?: boolean
  sortOrder?: number
}

export interface UpdateCategoryDto {
  displayName?: string
  description?: string | null
  colorToken?: string | null
  iconKey?: string | null
  includeInReports?: boolean
  sortOrder?: number
}

export interface DeleteCategoryWithMergeDto {
  targetCategoryId: string
}

export interface CategoryIconMetadata {
  key: string
  label: string
}

export interface CategoryColorMetadata {
  key: string
  label: string
  hex: `#${string}`
}

export interface CategoryMetadataResponse {
  icons: CategoryIconMetadata[]
  colors: CategoryColorMetadata[]
}
