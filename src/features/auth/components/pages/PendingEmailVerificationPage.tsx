import { useEffect, useMemo, useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { resolveApiError } from '@/shared/errors'
import { Toaster } from '@/shared/components/organisms/Toaster'
import { useLogout, useResendEmailVerification } from '../../api/mutations'
import { fetchCurrentUser } from '../../api/queries'
import {
  AUTH_QUERY_KEYS,
  AUTH_ROUTES,
} from '../../constants/auth.constants'
import { useAuthStore } from '../../stores/auth.store'
import {
  isPendingEmailVerification,
  resolvePostAuthRoute,
} from '../../utils/emailVerification'
import { PendingEmailVerificationPanel } from '../organisms/PendingEmailVerificationPanel'

const RESEND_COOLDOWN_MS = 60 * 60 * 1000

export function PendingEmailVerificationPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const user = useAuthStore((state) => state.user)
  const setAuth = useAuthStore((state) => state.setAuth)
  const resendMutation = useResendEmailVerification()
  const logoutMutation = useLogout()
  const [cooldownEndsAt, setCooldownEndsAt] = useState<number | null>(null)
  const [now, setNow] = useState(() => Date.now())
  const [resendQueued, setResendQueued] = useState(false)

  useEffect(() => {
    if (!cooldownEndsAt || cooldownEndsAt <= now) {
      return
    }

    const intervalId = window.setInterval(() => {
      setNow(Date.now())
    }, 60 * 1000)

    return () => window.clearInterval(intervalId)
  }, [cooldownEndsAt, now])

  const cooldownMinutes = useMemo(() => {
    if (!cooldownEndsAt) {
      return null
    }

    return Math.max(0, Math.ceil((cooldownEndsAt - now) / 60000))
  }, [cooldownEndsAt, now])

  const errorPresentation = useMemo(
    () =>
      resendMutation.error
        ? resolveApiError(
            resendMutation.error,
            'auth.email-verification.resend'
          )
        : null,
    [resendMutation.error]
  )

  const handleResend = async () => {
    try {
      const response = await resendMutation.mutateAsync()

      if (response.status === 'ALREADY_VERIFIED') {
        const syncedUser = await fetchCurrentUser()
        setAuth(syncedUser)
        queryClient.setQueryData(AUTH_QUERY_KEYS.user, syncedUser)
        navigate(resolvePostAuthRoute(syncedUser), { replace: true })
        return
      }

      setResendQueued(true)
      setNow(Date.now())
      setCooldownEndsAt(Date.now() + RESEND_COOLDOWN_MS)
    } catch {
      // The mutation error is rendered inline through resolveApiError.
    }
  }

  if (!user) {
    return null
  }

  if (!isPendingEmailVerification(user)) {
    return <Navigate to={AUTH_ROUTES.dashboard} replace />
  }

  return (
    <>
      <PendingEmailVerificationPanel
        email={user.email}
        isResending={resendMutation.isPending}
        isLoggingOut={logoutMutation.isPending}
        cooldownMinutes={cooldownMinutes}
        resendQueued={resendQueued}
        error={errorPresentation}
        onResend={() => void handleResend()}
        onLogout={() => logoutMutation.mutate()}
      />
      <Toaster />
    </>
  )
}
