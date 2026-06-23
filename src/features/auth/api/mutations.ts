import { useMutation, useQueryClient } from '@tanstack/react-query'
import api from './auth.api'
import type {
  LinkEmailDto,
  MessageResponse,
  SignInDto,
  SignUpDto,
  UpdateProfileDto,
  UpdateUserAvatarResponse,
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

export const useUpdateProfile = () => {
  const queryClient = useQueryClient()
  const setAuth = useAuthStore((state) => state.setAuth)

  return useMutation({
    mutationFn: async (dto: UpdateProfileDto) => {
      const { data } = await api.patch<User>(AUTH_API_ENDPOINTS.me, dto)
      return data
    },
    onSuccess: (user) => {
      queryClient.setQueryData(AUTH_QUERY_KEYS.user, user)
      setAuth(user)
    },
  })
}

export const useUpdateUserAvatar = () => {
  const queryClient = useQueryClient()
  const updateUser = useAuthStore((state) => state.updateUser)

  return useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData()
      formData.append('file', file)

      const { data } = await api.put<UpdateUserAvatarResponse>(
        AUTH_API_ENDPOINTS.userAvatar,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      )

      return data
    },
    onSuccess: ({ url }) => {
      queryClient.setQueryData<User | undefined>(
        AUTH_QUERY_KEYS.user,
        (currentUser) =>
          currentUser ? { ...currentUser, avatarUrl: url } : currentUser
      )
      updateUser({ avatarUrl: url })
      void queryClient.invalidateQueries({ queryKey: AUTH_QUERY_KEYS.user })
    },
  })
}

export const useRemoveUserAvatar = () => {
  const queryClient = useQueryClient()
  const updateUser = useAuthStore((state) => state.updateUser)

  return useMutation({
    mutationFn: async () => {
      await api.delete(AUTH_API_ENDPOINTS.userAvatar)
    },
    onSuccess: () => {
      queryClient.setQueryData<User | undefined>(
        AUTH_QUERY_KEYS.user,
        (currentUser) =>
          currentUser ? { ...currentUser, avatarUrl: null } : currentUser
      )
      updateUser({ avatarUrl: null })
      void queryClient.invalidateQueries({ queryKey: AUTH_QUERY_KEYS.user })
    },
  })
}
