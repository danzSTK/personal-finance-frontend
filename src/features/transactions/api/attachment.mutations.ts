import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/features/auth/api/auth.api'
import { showApiErrorToast } from '@/shared/errors'
import { toast } from '@/shared/hooks/use-toast'
import {
  TRANSACTION_API_ENDPOINTS,
  TRANSACTION_QUERY_KEYS,
} from '../constants/transaction.constants'
import type {
  ReorderAttachmentsDto,
  TransactionAttachment,
} from '../types/transaction-attachment.types'

export const useAddTransactionAttachments = (transactionId: string) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (files: File[]) => {
      const formData = new FormData()
      files.forEach((file) => {
        formData.append('files', file)
      })

      const { data } = await api.post<TransactionAttachment[]>(
        TRANSACTION_API_ENDPOINTS.attachments(transactionId),
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      )
      return data
    },
    onSuccess: (createdAttachments) => {
      void queryClient.invalidateQueries({
        queryKey: TRANSACTION_QUERY_KEYS.attachments(transactionId),
      })
      void queryClient.invalidateQueries({
        queryKey: TRANSACTION_QUERY_KEYS.transactions,
        exact: false,
      })
      const count = createdAttachments.length
      toast({
        title: count === 1 ? 'Comprovante anexado' : 'Comprovantes anexados',
        description:
          count === 1
            ? 'O arquivo foi enviado com sucesso para a transação.'
            : `${count} arquivos foram enviados com sucesso.`,
      })
    },
    onError: (error) => {
      showApiErrorToast(error, 'transactions.attachments.add')
    },
  })
}

export const useDeleteTransactionAttachment = (transactionId: string) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (attachmentId: string) => {
      await api.delete(
        TRANSACTION_API_ENDPOINTS.attachmentItem(transactionId, attachmentId)
      )
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: TRANSACTION_QUERY_KEYS.attachments(transactionId),
      })
      void queryClient.invalidateQueries({
        queryKey: TRANSACTION_QUERY_KEYS.transactions,
        exact: false,
      })
      toast({
        title: 'Comprovante excluído',
        description: 'O anexo foi removido com sucesso.',
      })
    },
    onError: (error) => {
      showApiErrorToast(error, 'transactions.attachments.delete')
    },
  })
}

export const useReorderTransactionAttachments = (transactionId: string) => {
  const queryClient = useQueryClient()
  const queryKey = TRANSACTION_QUERY_KEYS.attachments(transactionId)

  return useMutation({
    mutationFn: async (dto: ReorderAttachmentsDto) => {
      await api.patch(
        TRANSACTION_API_ENDPOINTS.attachmentPositions(transactionId),
        dto
      )
    },
    onMutate: async (dto) => {
      await queryClient.cancelQueries({ queryKey })
      const previousAttachments =
        queryClient.getQueryData<TransactionAttachment[]>(queryKey)

      if (previousAttachments) {
        const positionMap = new Map(
          dto.positions.map((p) => [p.id, p.position])
        )
        const updated = [...previousAttachments]
          .map((item) => ({
            ...item,
            position: positionMap.get(item.id) ?? item.position,
          }))
          .sort((a, b) => a.position - b.position)

        queryClient.setQueryData<TransactionAttachment[]>(queryKey, updated)
      }

      return { previousAttachments }
    },
    onError: (error, _dto, context) => {
      if (context?.previousAttachments) {
        queryClient.setQueryData<TransactionAttachment[]>(
          queryKey,
          context.previousAttachments
        )
      }
      showApiErrorToast(error, 'transactions.attachments.reorder')
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey })
    },
  })
}
