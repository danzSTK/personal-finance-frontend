import { useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/features/auth/api/auth.api'
import { toast } from '@/shared/hooks/use-toast'
import { showApiErrorToast } from '@/shared/errors'
import {
  ACCOUNT_API_ENDPOINTS,
  ACCOUNT_QUERY_KEYS,
} from '../constants/account.constants'
import type {
  Account,
  CreateAccountDto,
  UpdateAccountDto,
} from '../types/account.types'

const accountPath = (accountId: string) =>
  `${ACCOUNT_API_ENDPOINTS.accounts}/${accountId}`

const useInvalidateAccounts = () => {
  const queryClient = useQueryClient()

  return () =>
    queryClient.invalidateQueries({
      queryKey: ACCOUNT_QUERY_KEYS.accounts,
      exact: false,
    })
}

export const useCreateAccount = () => {
  const invalidateAccounts = useInvalidateAccounts()

  return useMutation({
    mutationFn: async (dto: CreateAccountDto) => {
      const { data } = await api.post<Account>(
        ACCOUNT_API_ENDPOINTS.accounts,
        dto
      )
      return data
    },
    onSuccess: (account) => {
      void invalidateAccounts()
      toast({
        title: 'Conta criada',
        description: `${account.name} já está disponível na sua lista.`,
      })
    },
  })
}

export const useUpdateAccount = () => {
  const invalidateAccounts = useInvalidateAccounts()

  return useMutation({
    mutationFn: async ({
      accountId,
      dto,
    }: {
      accountId: string
      dto: UpdateAccountDto
    }) => {
      const { data } = await api.patch<Account>(accountPath(accountId), dto)
      return data
    },
    onSuccess: (account) => {
      void invalidateAccounts()
      toast({
        title: 'Conta atualizada',
        description: `${account.name} foi salva com sucesso.`,
      })
    },
  })
}

export const useArchiveAccount = () => {
  const invalidateAccounts = useInvalidateAccounts()

  return useMutation({
    mutationFn: async (accountId: string) => {
      await api.patch(`${accountPath(accountId)}/archive`)
    },
    onSuccess: () => {
      void invalidateAccounts()
      toast({
        title: 'Conta arquivada',
        description: 'Ela fica oculta dos totais e pode ser restaurada depois.',
      })
    },
  })
}

export const useUnarchiveAccount = () => {
  const invalidateAccounts = useInvalidateAccounts()

  return useMutation({
    mutationFn: async (accountId: string) => {
      await api.patch(`${accountPath(accountId)}/unarchive`)
    },
    onSuccess: () => {
      void invalidateAccounts()
      toast({
        title: 'Conta restaurada',
        description: 'Ela voltou para a lista de contas ativas.',
      })
    },
    onError: (error) => showApiErrorToast(error, 'accounts.unarchive'),
  })
}

export const useSetDefaultAccount = () => {
  const invalidateAccounts = useInvalidateAccounts()

  return useMutation({
    mutationFn: async (accountId: string) => {
      await api.patch(`${accountPath(accountId)}/default`)
    },
    onSuccess: () => {
      void invalidateAccounts()
      toast({
        title: 'Conta padrão atualizada',
        description: 'Novas movimentações podem usar essa conta por padrão.',
      })
    },
    onError: (error) => showApiErrorToast(error, 'accounts.set-default'),
  })
}
