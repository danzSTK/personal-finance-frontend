import { useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/features/auth/api/auth.api'
import { toast } from '@/shared/hooks/use-toast'
import { resolveApiErrorMessage } from '@/features/auth/utils/error.utils'
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
    onError: (error) => {
      toast({
        variant: 'destructive',
        title: 'Falha ao criar conta',
        description: resolveApiErrorMessage(
          error,
          'Confira os dados e tente novamente.'
        ),
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
    onError: (error) => {
      toast({
        variant: 'destructive',
        title: 'Falha ao atualizar conta',
        description: resolveApiErrorMessage(
          error,
          'Não foi possível salvar as alterações agora.'
        ),
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
    onError: (error) => {
      toast({
        variant: 'destructive',
        title: 'Falha ao arquivar conta',
        description: resolveApiErrorMessage(
          error,
          'Contas padrão, carteira ou contas com restrições não podem ser arquivadas.'
        ),
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
    onError: (error) => {
      toast({
        variant: 'destructive',
        title: 'Falha ao restaurar conta',
        description: resolveApiErrorMessage(
          error,
          'Não foi possível restaurar esta conta agora.'
        ),
      })
    },
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
    onError: (error) => {
      toast({
        variant: 'destructive',
        title: 'Falha ao definir padrão',
        description: resolveApiErrorMessage(
          error,
          'Contas arquivadas ou já padrão não podem ser escolhidas.'
        ),
      })
    },
  })
}
