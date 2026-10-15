import { useCallback, useEffect, useMemo, useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { resolveApiError } from '@/shared/errors'
import { Toaster } from '@/shared/components/organisms/Toaster'
import { useLogout, useResendEmailVerification } from '../../api/mutations'
import {
  fetchCurrentUser,
  useEmailVerificationResendStatus,
} from '../../api/queries'
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

const STATUS_POLLING_INTERVAL_MS = 5000

export function PendingEmailVerificationPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const user = useAuthStore((state) => state.user)
  const setAuth = useAuthStore((state) => state.setAuth)
  const resendMutation = useResendEmailVerification()
  const logoutMutation = useLogout()

  const isPending = Boolean(user && isPendingEmailVerification(user))
  const statusQuery = useEmailVerificationResendStatus({
    enabled: isPending,
    refetchInterval: isPending ? STATUS_POLLING_INTERVAL_MS : false,
  })

  const [cooldownEndsAt, setCooldownEndsAt] = useState<number | null>(null)
  const [now, setNow] = useState(() => Date.now())
  const [resendQueued, setResendQueued] = useState(false)

  const handleAlreadyVerified = useCallback(async () => {
    try {
      const syncedUser = await fetchCurrentUser()
      setAuth(syncedUser)
      queryClient.setQueryData(AUTH_QUERY_KEYS.user, syncedUser)
      navigate(resolvePostAuthRoute(syncedUser), { replace: true })
    } catch {
      // In case of error syncing user, let next polling cycle or user action retry.
    }
  }, [navigate, queryClient, setAuth])

  useEffect(() => {
    if (statusQuery.data?.status === 'ALREADY_VERIFIED') {
      void handleAlreadyVerified()
    }
  }, [handleAlreadyVerified, statusQuery.data?.status])

  useEffect(() => {
    if (
      statusQuery.data?.status === 'BLOCKED' &&
      statusQuery.data.retryAtMs !== null
    ) {
      setCooldownEndsAt(statusQuery.data.retryAtMs)
      setNow(Date.now())
    }
  }, [statusQuery.data])

  useEffect(() => {
    if (!cooldownEndsAt || cooldownEndsAt <= now) {
      return
    }

    const intervalId = window.setInterval(() => {
      const currentNow = Date.now()
      setNow(currentNow)

      if (cooldownEndsAt <= currentNow) {
        setCooldownEndsAt(null)
        void statusQuery.refetch()
      }
    }, 1000)

    return () => window.clearInterval(intervalId)
  }, [cooldownEndsAt, now, statusQuery])

  const cooldownSeconds = useMemo(() => {
    if (!cooldownEndsAt || cooldownEndsAt <= now) {
      return null
    }

    return Math.max(0, Math.ceil((cooldownEndsAt - now) / 1000))
  }, [cooldownEndsAt, now])

  const errorPresentation = useMemo(() => {
    if (resendMutation.error) {
      return resolveApiError(
        resendMutation.error,
        'auth.email-verification.resend'
      )
    }

    if (statusQuery.error) {
      return resolveApiError(
        statusQuery.error,
        'auth.email-verification.resend'
      )
    }

    return null
  }, [resendMutation.error, statusQuery.error])

  const handleResend = async () => {
    try {
      const response = await resendMutation.mutateAsync()

      if (response.status === 'ALREADY_VERIFIED') {
        await handleAlreadyVerified()
        return
      }

      setResendQueued(true)
      setNow(Date.now())
      void statusQuery.refetch()
    } catch (error) {
      const resolved = resolveApiError(
        error,
        'auth.email-verification.resend'
      )
      if (
        resolved.retryAfterSeconds !== null &&
        resolved.retryAfterSeconds > 0
      ) {
        setNow(Date.now())
        setCooldownEndsAt(Date.now() + resolved.retryAfterSeconds * 1000)
      }
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
        cooldownSeconds={cooldownSeconds}
        resendQueued={resendQueued}
        error={errorPresentation}
        onResend={() => void handleResend()}
        onLogout={() => logoutMutation.mutate()}
      />
      <Toaster />
    </>
  )
}

