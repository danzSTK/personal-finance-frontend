import { useEffect, useMemo, useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useQueryClient } from '@tanstack/react-query'
import { KeyRound, Loader2, Lock } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { ApiErrorAlert } from '@/shared/components/molecules/ApiErrorAlert'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/shared/components/ui/dialog'
import {
  API_ERROR_CODES,
  applyApiFieldErrors,
  resolveApiError,
} from '@/shared/errors'
import { toast } from '@/shared/hooks/use-toast'
import { Button } from '@/shared/lib/button'
import { formatDateTime } from '@/shared/utils/formatters'
import { useChangePassword } from '../../api/mutations'
import { usePasswordChangeStatus } from '../../api/queries'
import { AUTH_QUERY_KEYS, AUTH_ROUTES } from '../../constants/auth.constants'
import { useAuthStore } from '../../stores/auth.store'
import { buildChangePasswordDto } from '../../utils/formDtos'
import {
  changePasswordSchema,
  type ChangePasswordFormData,
} from '../../utils/validation'
import { FormField } from '../molecules'

const FIELD_ONLY_ERROR_CODES = new Set<string>([
  API_ERROR_CODES.currentPasswordInvalid,
  API_ERROR_CODES.newPasswordMustDiffer,
])

const TERMINAL_SESSION_ERROR_CODES = new Set<string>([
  API_ERROR_CODES.unauthorized,
  API_ERROR_CODES.invalidAccessToken,
  API_ERROR_CODES.invalidRefreshToken,
  API_ERROR_CODES.userNotFound,
])

const DEFAULT_VALUES: ChangePasswordFormData = {
  currentPassword: '',
  newPassword: '',
  confirmNewPassword: '',
}

export const ChangePasswordDialog = () => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const logout = useAuthStore((state) => state.logout)
  const mutation = useChangePassword()
  const passwordChangeStatus = usePasswordChangeStatus()
  const refetchPasswordChangeStatus = passwordChangeStatus.refetch
  const [open, setOpen] = useState(false)
  const [retryDeadlineMs, setRetryDeadlineMs] = useState<number | null>(null)
  const [clockMs, setClockMs] = useState(() => Date.now())
  const {
    register,
    handleSubmit,
    reset,
    setError,
    setFocus,
    formState: { errors, isValid },
  } = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
    mode: 'onChange',
    defaultValues: DEFAULT_VALUES,
  })

  const errorPresentation = useMemo(
    () =>
      mutation.error
        ? resolveApiError(mutation.error, 'auth.password.change')
        : null,
    [mutation.error]
  )
  const statusErrorPresentation = useMemo(
    () =>
      passwordChangeStatus.error
        ? resolveApiError(passwordChangeStatus.error, 'auth.password.change')
        : null,
    [passwordChangeStatus.error]
  )
  const statusRetryAtMs =
    passwordChangeStatus.data?.status === false
      ? passwordChangeStatus.data.retryAtMs
      : null
  const retrySecondsRemaining = retryDeadlineMs
    ? Math.max(0, Math.ceil((retryDeadlineMs - clockMs) / 1000))
    : 0
  const shouldShowFormAlert =
    errorPresentation !== null &&
    !FIELD_ONLY_ERROR_CODES.has(errorPresentation.code ?? '')

  useEffect(() => {
    if (!open || retryDeadlineMs === null || retrySecondsRemaining === 0) {
      return
    }

    const interval = window.setInterval(() => {
      setClockMs(Date.now())
    }, 1000)

    return () => window.clearInterval(interval)
  }, [open, retryDeadlineMs, retrySecondsRemaining])

  useEffect(() => {
    const deadlines = [statusRetryAtMs, retryDeadlineMs].filter(
      (deadline): deadline is number => deadline !== null
    )

    if (deadlines.length === 0) {
      return
    }

    const nextDeadlineMs = Math.min(...deadlines)
    const delayMs = Math.max(0, nextDeadlineMs - Date.now())
    const timeout = window.setTimeout(() => {
      setClockMs(Date.now())
      setRetryDeadlineMs((current) =>
        current !== null && current <= Date.now() ? null : current
      )
      void refetchPasswordChangeStatus()
    }, delayMs)

    return () => window.clearTimeout(timeout)
  }, [refetchPasswordChangeStatus, retryDeadlineMs, statusRetryAtMs])

  useEffect(
    () => () => {
      reset(DEFAULT_VALUES)
    },
    [reset]
  )

  const clearSensitiveForm = () => {
    reset(DEFAULT_VALUES)
    mutation.reset()
  }

  const handleOpenChange = (nextOpen: boolean) => {
    if (nextOpen && !isTriggerAvailable) {
      return
    }

    if (!nextOpen && mutation.isPending) {
      return
    }

    setOpen(nextOpen)

    if (!nextOpen) {
      clearSensitiveForm()
      return
    }

    setClockMs(Date.now())
  }

  const finishWithTerminalSession = (title: string, description: string) => {
    clearSensitiveForm()
    setOpen(false)
    logout()
    queryClient.clear()
    toast({ title, description })
    navigate(AUTH_ROUTES.signInAlias, { replace: true })
  }

  const handleMutationError = (error: unknown) => {
    const presentation = resolveApiError(error, 'auth.password.change')

    applyApiFieldErrors<ChangePasswordFormData>({
      fieldErrors: presentation.fieldErrors,
      fieldMap: {
        currentPassword: 'currentPassword',
        newPassword: 'newPassword',
      },
      setError,
      setFocus,
    })

    if (presentation.code === API_ERROR_CODES.currentPasswordInvalid) {
      setError('currentPassword', {
        type: 'server',
        message: 'A senha atual está incorreta.',
      })
      setFocus('currentPassword')
    }

    if (presentation.code === API_ERROR_CODES.newPasswordMustDiffer) {
      setError('newPassword', {
        type: 'server',
        message: 'Use uma senha diferente da atual.',
      })
      setFocus('newPassword')
    }

    if (presentation.retryAfterSeconds !== null) {
      const deadline = Date.now() + presentation.retryAfterSeconds * 1000
      setRetryDeadlineMs(deadline)
      setClockMs(Date.now())
    }

    if (presentation.code === API_ERROR_CODES.emailVerificationRequired) {
      clearSensitiveForm()
      setOpen(false)
      navigate(AUTH_ROUTES.emailVerificationPending, { replace: true })
      return
    }

    if (
      presentation.code === API_ERROR_CODES.passwordChangeEmailProviderRequired
    ) {
      void queryClient.invalidateQueries({ queryKey: AUTH_QUERY_KEYS.user })
    }

    if (
      TERMINAL_SESSION_ERROR_CODES.has(presentation.code ?? '') ||
      presentation.statusCode === 401
    ) {
      finishWithTerminalSession(
        'Sua sessão terminou',
        'Entre novamente para continuar com segurança.'
      )
    }
  }

  const handleChangePassword = (data: ChangePasswordFormData) => {
    if (mutation.isPending || retrySecondsRemaining > 0) {
      return
    }

    mutation.mutate(buildChangePasswordDto(data), {
      onError: handleMutationError,
      onSuccess: () => {
        finishWithTerminalSession(
          'Senha alterada com sucesso',
          'Todas as sessões foram encerradas. Entre novamente com sua nova senha.'
        )
      },
    })
  }

  const handleCancel = () => {
    handleOpenChange(false)
  }

  const handleInitialFocus = (event: Event) => {
    event.preventDefault()
    setFocus('currentPassword')
  }

  const canSubmit =
    isValid && !mutation.isPending && retrySecondsRemaining === 0

  const isKnownUnavailable = passwordChangeStatus.data?.status === false
  const isCheckingAvailability =
    passwordChangeStatus.isPending || passwordChangeStatus.isFetching
  const hasAvailabilityError = statusErrorPresentation !== null
  const hasLocalRetry = retryDeadlineMs !== null && retryDeadlineMs > clockMs
  const isTriggerAvailable =
    passwordChangeStatus.data?.status === true &&
    !isCheckingAvailability &&
    !hasAvailabilityError &&
    !hasLocalRetry
  const displayedRetryAtMs = getLatestDeadline(
    statusRetryAtMs,
    hasLocalRetry ? retryDeadlineMs : null
  )
  const availabilityMessageId = 'password-change-availability'

  return (
    <div className="space-y-3">
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogTrigger asChild>
          <Button
            type="button"
            variant="outline"
            className="h-11 rounded-xl"
            disabled={!isTriggerAvailable}
            aria-describedby={
              isTriggerAvailable ? undefined : availabilityMessageId
            }
          >
            {isCheckingAvailability ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            ) : (
              <KeyRound className="h-4 w-4" aria-hidden />
            )}
            Alterar senha
          </Button>
        </DialogTrigger>
        <DialogContent
          closeDisabled={mutation.isPending}
          onOpenAutoFocus={handleInitialFocus}
          className="max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-md gap-0 overflow-y-auto rounded-2xl border-app-border bg-app-elevated p-0 text-app-text sm:rounded-2xl"
        >
          <DialogHeader className="space-y-2 px-5 pb-4 pt-5 pr-14 text-left sm:px-6 sm:pt-6">
            <DialogTitle>Alterar senha</DialogTitle>
            <DialogDescription className="leading-6 text-app-muted">
              Ao alterar sua senha, você sairá de todos os dispositivos.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit(handleChangePassword)} noValidate>
            <div className="space-y-4 px-5 pb-5 sm:px-6">
              <FormField
                label="Senha atual"
                type="password"
                autoComplete="current-password"
                required
                disabled={mutation.isPending}
                error={errors.currentPassword?.message}
                prefixIcon={<Lock className="h-4 w-4" />}
                {...register('currentPassword')}
              />
              <FormField
                label="Nova senha"
                type="password"
                autoComplete="new-password"
                required
                disabled={mutation.isPending}
                error={errors.newPassword?.message}
                helperText="Use entre 6 e 50 caracteres."
                prefixIcon={<Lock className="h-4 w-4" />}
                {...register('newPassword')}
              />
              <FormField
                label="Confirmar nova senha"
                type="password"
                autoComplete="new-password"
                required
                disabled={mutation.isPending}
                error={errors.confirmNewPassword?.message}
                prefixIcon={<Lock className="h-4 w-4" />}
                {...register('confirmNewPassword')}
              />

              {shouldShowFormAlert && errorPresentation ? (
                <ApiErrorAlert error={errorPresentation} />
              ) : null}

              {retrySecondsRemaining > 0 ? (
                <p className="rounded-xl border border-app-border bg-app-panel px-4 py-3 text-sm text-app-muted">
                  Tente novamente em{' '}
                  <span className="font-semibold text-app-text">
                    {formatRetryTime(retrySecondsRemaining)}
                  </span>
                  .
                </p>
              ) : null}
            </div>

            <DialogFooter className="sticky bottom-0 gap-2 border-t border-app-border bg-app-elevated px-5 py-4 sm:px-6">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={mutation.isPending}
                className="h-11 rounded-xl"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={!canSubmit}
                aria-live="polite"
                className="h-11 rounded-xl"
              >
                {mutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                ) : null}
                {mutation.isPending ? 'Alterando...' : 'Alterar senha'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {statusErrorPresentation ? (
        <div id={availabilityMessageId}>
          <ApiErrorAlert
            error={statusErrorPresentation}
            onRetry={() => void refetchPasswordChangeStatus()}
          />
        </div>
      ) : null}

      {!statusErrorPresentation &&
      !isCheckingAvailability &&
      (isKnownUnavailable || hasLocalRetry) ? (
        <div
          id={availabilityMessageId}
          role="status"
          className="rounded-xl border border-app-border bg-app-panel px-4 py-3 text-sm text-app-muted"
        >
          <p>Alteração de senha temporariamente indisponível.</p>
          {displayedRetryAtMs ? (
            <p className="mt-1">
              Disponível novamente a partir de{' '}
              <span className="font-semibold text-app-text">
                {formatDateTime(new Date(displayedRetryAtMs))}
              </span>
              , após uma nova verificação.
            </p>
          ) : (
            <Button
              type="button"
              variant="outline"
              className="mt-3 h-9 rounded-xl"
              onClick={() => void refetchPasswordChangeStatus()}
            >
              Verificar disponibilidade
            </Button>
          )}
        </div>
      ) : null}

      {isCheckingAvailability ? (
        <p
          id={availabilityMessageId}
          role="status"
          className="text-sm text-app-muted"
        >
          Verificando a disponibilidade da alteração de senha...
        </p>
      ) : null}
    </div>
  )
}

const getLatestDeadline = (
  first: number | null,
  second: number | null
): number | null => {
  if (first === null) {
    return second
  }

  if (second === null) {
    return first
  }

  return Math.max(first, second)
}

const formatRetryTime = (seconds: number): string => {
  if (seconds < 60) {
    return `${seconds} segundo${seconds === 1 ? '' : 's'}`
  }

  const minutes = Math.ceil(seconds / 60)
  return `${minutes} minuto${minutes === 1 ? '' : 's'}`
}
