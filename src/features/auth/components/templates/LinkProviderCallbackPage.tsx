import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { toast } from '@/shared/hooks/use-toast'
import { Toaster } from '@/shared/components/organisms/Toaster'
import type { LinkProviderCallbackParams } from '../../types'
import {
  AUTH_ROUTES,
  AUTH_WINDOW_MESSAGES,
  GOOGLE_LINK_ERROR_MESSAGES,
} from '../../constants/auth.constants'

export function LinkProviderCallbackPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  useEffect(() => {
    const callbackParams = getLinkProviderCallbackParams(searchParams)

    if (callbackParams.success === 'google') {
      if (window.opener) {
        window.opener.postMessage(
          { type: AUTH_WINDOW_MESSAGES.googleLinkSuccess },
          window.location.origin
        )
        window.close()
        return
      }

      toast({
        title: 'Conta Google vinculada',
        description: 'O vínculo foi concluído com sucesso.',
      })

      navigate(AUTH_ROUTES.settings, { replace: true })
      return
    }

    if (callbackParams.error) {
      const description =
        resolveGoogleLinkError(callbackParams.error) ?? callbackParams.error

      if (window.opener) {
        window.opener.postMessage(
          {
            type: AUTH_WINDOW_MESSAGES.googleLinkError,
            error: callbackParams.error,
          },
          window.location.origin
        )
        window.close()
        return
      }

      toast({
        variant: 'destructive',
        title: 'Falha ao vincular Google',
        description,
      })

      navigate(AUTH_ROUTES.settings, { replace: true })
      return
    }

    navigate(AUTH_ROUTES.settings, { replace: true })
  }, [navigate, searchParams])

  return (
    <div className="dark flex min-h-screen items-center justify-center bg-app-bg">
      <p className="text-sm text-app-muted">Processando vínculo do provider...</p>
      <Toaster />
    </div>
  )
}

const getLinkProviderCallbackParams = (
  searchParams: URLSearchParams
): LinkProviderCallbackParams => {
  const success = searchParams.get('success')
  const error = searchParams.get('error')

  return {
    success: success === 'google' ? 'google' : undefined,
    error: error ?? undefined,
  }
}

const resolveGoogleLinkError = (errorCode: string): string | null => {
  if (isGoogleLinkErrorCode(errorCode)) {
    return GOOGLE_LINK_ERROR_MESSAGES[errorCode]
  }

  return null
}

const isGoogleLinkErrorCode = (
  value: string
): value is keyof typeof GOOGLE_LINK_ERROR_MESSAGES =>
  value in GOOGLE_LINK_ERROR_MESSAGES
