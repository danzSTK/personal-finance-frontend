import { useQuery } from '@tanstack/react-query'
import api from './auth.api'
import type { User, Session } from '../types'
import { useAuthStore } from '../stores/auth.store'
import { AUTH_API_ENDPOINTS, AUTH_QUERY_KEYS } from '../constants/auth.constants'

export const useUser = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)

  return useQuery({
    queryKey: AUTH_QUERY_KEYS.user,
    queryFn: async () => {
      const { data } = await api.get<User>(AUTH_API_ENDPOINTS.me)
      return data
    },
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  })
}

export const useSessions = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)

  return useQuery({
    queryKey: AUTH_QUERY_KEYS.sessions,
    queryFn: async () => {
      const { data } = await api.get<Session[]>(AUTH_API_ENDPOINTS.sessions)
      return data
    },
    enabled: isAuthenticated,
    staleTime: 2 * 60 * 1000,
  })
}
