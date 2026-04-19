import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from '@/shared/hooks/use-toast'
import { Toaster } from '@/shared/components/organisms/Toaster'
import api from '../../api/auth.api'
import { useAuthStore } from '../../stores/auth.store'
import type { OAuthCallbackParams, User } from '../../types'
import { AUTH_API_ENDPOINTS, AUTH_QUERY_KEYS, AUTH_ROUTES } from '../../constants/auth.constants'
import { resolveApiErrorMessage } from '../../utils/error.utils'

export function AuthCallbackPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [searchParams] = useSearchParams()
  const setAuth = useAuthStore((state) => state.setAuth)

  useEffect(() => {
    const callbackParams: OAuthCallbackParams = {
      error: searchParams.get('error') ?? undefined,
      error_description: searchParams.get('error_description') ?? undefined,
    }

    if (callbackParams.error) {
      toast({
        variant: 'destructive',
        title: 'Falha no login com Google',
        description: callbackParams.error_description || callbackParams.error,
      })

      navigate(AUTH_ROUTES.login, { replace: true })
      return
    }

    const completeAuth = async () => {
      try {
        const { data: user } = await api.get<User>(AUTH_API_ENDPOINTS.me)

        setAuth(user)
        await queryClient.invalidateQueries({ queryKey: AUTH_QUERY_KEYS.user })

        navigate(AUTH_ROUTES.dashboard, { replace: true })
      } catch (requestError) {
        toast({
          variant: 'destructive',
          title: 'Não foi possível concluir o login',
          description: resolveApiErrorMessage(requestError, 'Tente novamente.'),
        })

        navigate(AUTH_ROUTES.login, { replace: true })
      }
    }

    void completeAuth()
  }, [navigate, queryClient, searchParams, setAuth])

  return (
    <div className="dark flex min-h-screen items-center justify-center bg-app-bg">
      <p className="text-sm text-app-muted">Finalizando login com Google...</p>
      <Toaster />
    </div>
  )
}
