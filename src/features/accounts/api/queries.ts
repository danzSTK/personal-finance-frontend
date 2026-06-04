import { useQuery } from '@tanstack/react-query'
import api from '@/features/auth/api/auth.api'
import {
  ACCOUNT_API_ENDPOINTS,
  ACCOUNT_QUERY_KEYS,
} from '../constants/account.constants'
import type { Account, ListAccountsParams } from '../types/account.types'

export const useAccounts = ({
  includeArchived = false,
}: ListAccountsParams = {}) =>
  useQuery({
    queryKey: ACCOUNT_QUERY_KEYS.list(includeArchived),
    queryFn: async () => {
      const { data } = await api.get<Account[]>(
        ACCOUNT_API_ENDPOINTS.accounts,
        {
          params: { includeArchived },
        }
      )

      return data
    },
    staleTime: 30 * 1000,
    retry: (failureCount) => failureCount < 2,
  })
