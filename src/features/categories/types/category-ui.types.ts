import type { Category, CategoryManagementType } from './category.types'

export type CategorySheetState =
  | {
      mode: 'create'
      type: CategoryManagementType
    }
  | {
      mode: 'edit'
      category: Category
    }
  | null

export type CategoryArchiveView = 'active' | 'archived'

export type CategoryDeleteState =
  | {
      mode: 'confirm'
      category: Category
    }
  | {
      mode: 'merge'
      category: Category
    }
  | null
