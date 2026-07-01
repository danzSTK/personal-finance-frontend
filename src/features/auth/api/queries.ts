import { useQuery } from '@tanstack/react-query'
import api from './auth.api'
import type { User, Session, UsernameAvailabilityResponse } from '../types'
import { useAuthStore } from '../stores/auth.store'
import { AUTH_API_ENDPOINTS, AUTH_QUERY_KEYS } from '../constants/auth.constants'

export const fetchCurrentUser = async (): Promise<User> => {
  const { data } = await api.get<User>(AUTH_API_ENDPOINTS.me)
  return data
}

export const useUser = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)

  return useQuery({
    queryKey: AUTH_QUERY_KEYS.user,
    queryFn: fetchCurrentUser,
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

export const useUsernameAvailability = (
  username: string,
  enabled: boolean
) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)

  return useQuery({
    queryKey: AUTH_QUERY_KEYS.usernameAvailability(username),
    queryFn: async () => {
      const { data } = await api.get<unknown>(
        AUTH_API_ENDPOINTS.usernameAvailability(username)
      )

      const parsed = parseUsernameAvailabilityResponse(data)

      if (!parsed) {
        throw new Error('Invalid username availability response')
      }

      return parsed
    },
    enabled: isAuthenticated && enabled,
    staleTime: 30 * 1000,
    retry: false,
  })
}

const parseUsernameAvailabilityResponse = (
  data: unknown
): UsernameAvailabilityResponse | null => {
  if (!data || typeof data !== 'object') {
    return null
  }

  const maybeResponse = data as Record<string, unknown>
  const availabilityValue =
    maybeResponse.available ?? maybeResponse.isAvailable

  if (typeof availabilityValue !== 'boolean') {
    return null
  }

  return {
    username:
      typeof maybeResponse.username === 'string'
        ? maybeResponse.username
        : '',
    available: availabilityValue,
  }
}
