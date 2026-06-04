import { useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/features/auth/api/auth.api'
import { resolveApiErrorMessage } from '@/features/auth/utils/error.utils'
import { toast } from '@/shared/hooks/use-toast'
import {
  CATEGORY_API_ENDPOINTS,
  CATEGORY_QUERY_KEYS,
} from '../constants/category.constants'
import type {
  Category,
  CreateCategoryDto,
  DeleteCategoryWithMergeDto,
  UpdateCategoryDto,
} from '../types/category.types'

const categoryPath = (categoryId: string) =>
  `${CATEGORY_API_ENDPOINTS.categories}/${categoryId}`

const useInvalidateCategories = () => {
  const queryClient = useQueryClient()

  return () =>
    queryClient.invalidateQueries({
      queryKey: CATEGORY_QUERY_KEYS.categories,
      exact: false,
    })
}

export const useCreateCategory = () => {
  const invalidateCategories = useInvalidateCategories()

  return useMutation({
    mutationFn: async (dto: CreateCategoryDto) => {
      const { data } = await api.post<Category>(
        CATEGORY_API_ENDPOINTS.categories,
        dto
      )
      return data
    },
    onSuccess: (category) => {
      void invalidateCategories()
      toast({
        title: 'Categoria criada',
        description: `${category.displayName} já está disponível.`,
      })
    },
    onError: (error) => {
      toast({
        variant: 'destructive',
        title: 'Falha ao criar categoria',
        description: resolveApiErrorMessage(
          error,
          'Confira os dados e tente novamente.'
        ),
      })
    },
  })
}

export const useUpdateCategory = () => {
  const invalidateCategories = useInvalidateCategories()

  return useMutation({
    mutationFn: async ({
      categoryId,
      dto,
    }: {
      categoryId: string
      dto: UpdateCategoryDto
    }) => {
      const { data } = await api.patch<Category>(categoryPath(categoryId), dto)
      return data
    },
    onSuccess: (category) => {
      void invalidateCategories()
      toast({
        title: 'Categoria atualizada',
        description: `${category.displayName} foi salva com sucesso.`,
      })
    },
    onError: (error) => {
      toast({
        variant: 'destructive',
        title: 'Falha ao atualizar categoria',
        description: resolveApiErrorMessage(
          error,
          'Não foi possível salvar as alterações agora.'
        ),
      })
    },
  })
}

export const useArchiveCategory = () => {
  const invalidateCategories = useInvalidateCategories()

  return useMutation({
    mutationFn: async (categoryId: string) => {
      await api.patch(`${categoryPath(categoryId)}/archive`)
    },
    onSuccess: () => {
      void invalidateCategories()
      toast({
        title: 'Categoria arquivada',
        description: 'Ela pode ser restaurada pela visualização de arquivadas.',
      })
    },
    onError: (error) => {
      toast({
        variant: 'destructive',
        title: 'Falha ao arquivar categoria',
        description: resolveApiErrorMessage(
          error,
          'Esta categoria não pode ser arquivada agora.'
        ),
      })
    },
  })
}

export const useUnarchiveCategory = () => {
  const invalidateCategories = useInvalidateCategories()

  return useMutation({
    mutationFn: async (categoryId: string) => {
      await api.patch(`${categoryPath(categoryId)}/unarchive`)
    },
    onSuccess: () => {
      void invalidateCategories()
      toast({
        title: 'Categoria restaurada',
        description: 'Ela voltou para a lista de categorias ativas.',
      })
    },
    onError: (error) => {
      toast({
        variant: 'destructive',
        title: 'Falha ao restaurar categoria',
        description: resolveApiErrorMessage(
          error,
          'Já pode existir uma categoria ativa com o mesmo nome.'
        ),
      })
    },
  })
}

export const useDeleteCategory = () => {
  const invalidateCategories = useInvalidateCategories()

  return useMutation({
    mutationFn: async (categoryId: string) => {
      await api.delete(categoryPath(categoryId))
    },
    onSuccess: () => {
      void invalidateCategories()
      toast({
        title: 'Categoria excluída',
        description: 'Ela não aparece mais na sua organização financeira.',
      })
    },
  })
}

export const useDeleteCategoryWithMerge = () => {
  const invalidateCategories = useInvalidateCategories()

  return useMutation({
    mutationFn: async ({
      categoryId,
      dto,
    }: {
      categoryId: string
      dto: DeleteCategoryWithMergeDto
    }) => {
      await api.post(`${categoryPath(categoryId)}/delete-with-merge`, dto)
    },
    onSuccess: () => {
      void invalidateCategories()
      toast({
        title: 'Categoria excluída',
        description: 'Os lançamentos foram movidos para a categoria escolhida.',
      })
    },
    onError: (error) => {
      toast({
        variant: 'destructive',
        title: 'Falha ao mover lançamentos',
        description: resolveApiErrorMessage(
          error,
          'Escolha uma categoria ativa do mesmo tipo e tente novamente.'
        ),
      })
    },
  })
}
