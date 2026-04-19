import { useMutation, useQueryClient } from '@tanstack/react-query'
import api from './auth.api'
import type {
  LinkEmailDto,
  MessageResponse,
  SignInDto,
  SignUpDto,
  User,
} from '../types'
import { useAuthStore } from '../stores/auth.store'
import { toast } from '@/shared/hooks/use-toast'
import { AUTH_API_ENDPOINTS, AUTH_QUERY_KEYS } from '../constants/auth.constants'

export const useSignUp = () => {
  const setAuth = useAuthStore((state) => state.setAuth)

  return useMutation({
    mutationFn: async (dto: SignUpDto) => {
      await api.post(AUTH_API_ENDPOINTS.signUp, dto)
      const { data: user } = await api.get<User>(AUTH_API_ENDPOINTS.me)
      return user
    },
    onSuccess: (user) => {
      setAuth(user)
      toast({
        title: 'Conta criada com sucesso',
        description: `Bem-vindo, ${user.firstName ?? user.userName ?? user.email}`,
      })
    },
  })
}

export const useSignIn = () => {
  const setAuth = useAuthStore((state) => state.setAuth)

  return useMutation({
    mutationFn: async (dto: SignInDto) => {
      await api.post(AUTH_API_ENDPOINTS.signIn, dto)
      const { data: user } = await api.get<User>(AUTH_API_ENDPOINTS.me)
      return user
    },
    onSuccess: (user) => {
      setAuth(user)
      toast({
        title: 'Login realizado com sucesso',
        description: `Bem-vindo, ${user.firstName ?? user.userName ?? user.email}`,
      })
    },
  })
}

export const useLogout = () => {
  const logout = useAuthStore((state) => state.logout)
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async () => {
      await api.post<MessageResponse>(AUTH_API_ENDPOINTS.logout)
    },
    onSettled: () => {
      logout()
      queryClient.clear()
    },
  })
}

export const useRevokeSession = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (jti: string) => {
      await api.delete(`${AUTH_API_ENDPOINTS.sessions}/${jti}`)
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: AUTH_QUERY_KEYS.sessions,
        exact: false,
      })
    },
  })
}

export const useLinkEmail = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (dto: LinkEmailDto) => {
      const { data } = await api.post<MessageResponse>(
        AUTH_API_ENDPOINTS.linkEmail,
        dto
      )
      return data
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: AUTH_QUERY_KEYS.user })
    },
  })
}
