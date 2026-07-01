import { useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/features/auth/api/auth.api'
import { ACCOUNT_QUERY_KEYS } from '@/features/accounts/constants/account.constants'
import { showApiErrorToast } from '@/shared/errors'
import { toast } from '@/shared/hooks/use-toast'
import {
  TRANSACTION_API_ENDPOINTS,
  TRANSACTION_QUERY_KEYS,
} from '../constants/transaction.constants'
import type {
  ConfirmTransactionDto,
  CreateTransactionDto,
  Transaction,
  UpdateTransactionDto,
} from '../types/transaction.types'
import { getTransactionTypeLabel } from '../utils/transaction.utils'

const transactionPath = (transactionId: string) =>
  `${TRANSACTION_API_ENDPOINTS.transactions}/${transactionId}`

const useInvalidateTransactionData = () => {
  const queryClient = useQueryClient()

  return () => {
    void queryClient.invalidateQueries({
      queryKey: TRANSACTION_QUERY_KEYS.transactions,
      exact: false,
    })
    void queryClient.invalidateQueries({
      queryKey: ACCOUNT_QUERY_KEYS.accounts,
      exact: false,
    })
  }
}

export const useCreateTransaction = () => {
  const invalidateTransactionData = useInvalidateTransactionData()

  return useMutation({
    mutationFn: async (dto: CreateTransactionDto) => {
      const { data } = await api.post<Transaction>(
        TRANSACTION_API_ENDPOINTS.transactions,
        dto
      )
      return data
    },
    onSuccess: (transaction) => {
      invalidateTransactionData()
      toast({
        title: 'Transação criada',
        description: `${getTransactionTypeLabel(transaction.type)} registrada com sucesso.`,
      })
    },
  })
}

export const useUpdateTransaction = () => {
  const invalidateTransactionData = useInvalidateTransactionData()

  return useMutation({
    mutationFn: async ({
      transactionId,
      dto,
    }: {
      transactionId: string
      dto: UpdateTransactionDto
    }) => {
      const { data } = await api.patch<Transaction>(
        transactionPath(transactionId),
        dto
      )
      return data
    },
    onSuccess: () => {
      invalidateTransactionData()
      toast({
        title: 'Transação atualizada',
        description: 'As alterações foram salvas.',
      })
    },
  })
}

export const useConfirmTransaction = () => {
  const invalidateTransactionData = useInvalidateTransactionData()

  return useMutation({
    mutationFn: async ({
      transactionId,
      dto,
    }: {
      transactionId: string
      dto: ConfirmTransactionDto
    }) => {
      const { data } = await api.patch<Transaction>(
        `${transactionPath(transactionId)}/confirm`,
        dto
      )
      return data
    },
    onSuccess: () => {
      invalidateTransactionData()
      toast({
        title: 'Transação efetivada',
        description: 'O lançamento agora entra no saldo atual.',
      })
    },
  })
}

export const useDeleteTransaction = () => {
  const invalidateTransactionData = useInvalidateTransactionData()

  return useMutation({
    mutationFn: async (transactionId: string) => {
      await api.delete(transactionPath(transactionId))
    },
    onSuccess: () => {
      invalidateTransactionData()
      toast({
        title: 'Transação excluída',
        description: 'O lançamento saiu do histórico ativo.',
      })
    },
    onError: (error) => showApiErrorToast(error, 'transactions.delete'),
  })
}
