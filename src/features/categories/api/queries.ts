import { useQuery } from '@tanstack/react-query'
import api from '@/features/auth/api/auth.api'
import {
  CATEGORY_API_ENDPOINTS,
  CATEGORY_DEFAULT_LIMIT,
  CATEGORY_DEFAULT_PAGE,
  CATEGORY_QUERY_KEYS,
} from '../constants/category.constants'
import type {
  Category,
  CategoryListResponse,
  CategoryMetadataResponse,
  ListCategoriesParams,
  ManageableCategoryType,
} from '../types/category.types'

interface UseCategoriesParams {
  page: number
  limit: number
  type: ManageableCategoryType
  search: string
  includeArchived: boolean
}

export const useCategories = ({
  page,
  limit,
  type,
  search,
  includeArchived,
}: UseCategoriesParams) =>
  useQuery({
    queryKey: CATEGORY_QUERY_KEYS.list({
      page,
      limit,
      type,
      search,
      includeArchived,
    }),
    queryFn: async () => {
      const params: ListCategoriesParams = {
        page,
        limit,
        type,
        includeArchived,
      }

      if (search.trim() !== '') {
        params.search = search.trim()
      }

      const { data } = await api.get<CategoryListResponse>(
        CATEGORY_API_ENDPOINTS.categories,
        { params }
      )

      return data
    },
    staleTime: 30 * 1000,
    retry: (failureCount) => failureCount < 2,
  })

export const useCategory = (categoryId: string | null) =>
  useQuery({
    queryKey: categoryId
      ? CATEGORY_QUERY_KEYS.detail(categoryId)
      : CATEGORY_QUERY_KEYS.detail('idle'),
    enabled: categoryId !== null,
    queryFn: async () => {
      const { data } = await api.get<Category>(
        `${CATEGORY_API_ENDPOINTS.categories}/${categoryId}`
      )

      return data
    },
  })

export const useCategoryMetadata = () =>
  useQuery({
    queryKey: CATEGORY_QUERY_KEYS.metadata,
    queryFn: async () => {
      const { data } = await api.get<CategoryMetadataResponse>(
        CATEGORY_API_ENDPOINTS.metadata
      )

      return data
    },
    staleTime: 10 * 60 * 1000,
    retry: (failureCount) => failureCount < 2,
  })

export const categoryMergeTargetParams = ({
  type,
}: {
  type: ManageableCategoryType
}): UseCategoriesParams => ({
  page: CATEGORY_DEFAULT_PAGE,
  limit: CATEGORY_DEFAULT_LIMIT,
  type,
  search: '',
  includeArchived: false,
})
