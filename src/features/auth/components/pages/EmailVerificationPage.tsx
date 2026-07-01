import { useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { resolveApiError } from '@/shared/errors'
import { Toaster } from '@/shared/components/organisms/Toaster'
import { useConfirmEmailVerification } from '../../api/mutations'
import { fetchCurrentUser } from '../../api/queries'
import {
  AUTH_QUERY_KEYS,
  AUTH_ROUTES,
} from '../../constants/auth.constants'
import { useAuthStore } from '../../stores/auth.store'
import { resolvePostAuthRoute } from '../../utils/emailVerification'
import { EmailVerificationConfirmPanel } from '../organisms/EmailVerificationConfirmPanel'

export function EmailVerificationPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')?.trim() ?? ''
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const setAuth = useAuthStore((state) => state.setAuth)
  const confirmMutation = useConfirmEmailVerification()
  const [isConfirmed, setIsConfirmed] = useState(false)
  const [continueRoute, setContinueRoute] = useState<string>(
    AUTH_ROUTES.signInAlias
  )

  const errorPresentation = useMemo(
    () =>
      confirmMutation.error
        ? resolveApiError(
            confirmMutation.error,
            'auth.email-verification.confirm'
          )
        : null,
    [confirmMutation.error]
  )

  const handleConfirm = async () => {
    if (!token) {
      return
    }

    try {
      await confirmMutation.mutateAsync({ token })

      if (isAuthenticated) {
        try {
          const user = await fetchCurrentUser()
          setAuth(user)
          queryClient.setQueryData(AUTH_QUERY_KEYS.user, user)
          setContinueRoute(resolvePostAuthRoute(user))
        } catch {
          setContinueRoute(AUTH_ROUTES.signInAlias)
        }
      }

      window.history.replaceState(null, '', AUTH_ROUTES.emailVerification)
      setIsConfirmed(true)
    } catch {
      // The mutation error is rendered inline through resolveApiError.
    }
  }

  return (
    <>
      <EmailVerificationConfirmPanel
        hasToken={Boolean(token)}
        isPending={confirmMutation.isPending}
        isConfirmed={isConfirmed}
        error={errorPresentation}
        onConfirm={() => void handleConfirm()}
        onRetry={() => void handleConfirm()}
        onContinue={() => navigate(continueRoute, { replace: true })}
        onSignIn={() => navigate(AUTH_ROUTES.signInAlias, { replace: true })}
      />
      <Toaster />
    </>
  )
}
