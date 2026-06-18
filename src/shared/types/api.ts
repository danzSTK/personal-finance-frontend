export type { PlatformErrorResponse as ApiError } from '@/shared/errors'

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export interface ApiResponse<T> {
  data: T
  message?: string
}
