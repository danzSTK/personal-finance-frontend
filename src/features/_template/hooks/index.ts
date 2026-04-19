import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { exampleService } from '../api'
import type { CreateExampleDto, UpdateExampleDto } from '../types'
import { toast } from '@/shared/hooks/use-toast'

export const useExamples = () => {
  return useQuery({
    queryKey: ['examples'],
    queryFn: () => exampleService.getAll(),
  })
}

export const useExample = (id: string) => {
  return useQuery({
    queryKey: ['examples', id],
    queryFn: () => exampleService.getById(id),
    enabled: !!id,
  })
}

export const useCreateExample = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateExampleDto) => exampleService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['examples'] })
      toast({
        title: 'Sucesso',
        description: 'Item criado com sucesso',
      })
    },
    onError: () => {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Erro ao criar item',
      })
    },
  })
}

export const useUpdateExample = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateExampleDto }) =>
      exampleService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['examples'] })
      toast({
        title: 'Sucesso',
        description: 'Item atualizado com sucesso',
      })
    },
    onError: () => {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Erro ao atualizar item',
      })
    },
  })
}

export const useDeleteExample = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => exampleService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['examples'] })
      toast({
        title: 'Sucesso',
        description: 'Item excluído com sucesso',
      })
    },
    onError: () => {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Erro ao excluir item',
      })
    },
  })
}
