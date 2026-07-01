import { useEffect, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate, useLocation } from 'react-router-dom'
import { Loader2, Lock, Mail } from 'lucide-react'
import { ApiErrorAlert } from '@/shared/components/molecules/ApiErrorAlert'
import { applyApiFieldErrors, resolveApiError } from '@/shared/errors'

import { FormField } from '../molecules/FormField'
import { Button } from '../atoms'
import { useSignIn } from '../../api/mutations'
import { signInSchema, SignInFormData } from '../../utils/validation'
import { AUTH_ROUTES } from '../../constants/auth.constants'
import { resolvePostAuthRoute } from '../../utils/emailVerification'

const inputClassName =
  'h-11 rounded-lg border-border bg-background text-foreground placeholder:text-muted-foreground focus-visible:border-primary focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-secondary'

export const SignInForm = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { mutate: signIn, isPending, error } = useSignIn()
  const from = resolveRedirectPath(location.state)
  const errorPresentation = useMemo(
    () => (error ? resolveApiError(error, 'auth.sign-in') : null),
    [error]
  )

  const {
    register,
    handleSubmit,
    setError,
    setFocus,
    formState: { errors, isValid },
  } = useForm<SignInFormData>({
    resolver: zodResolver(signInSchema),
    mode: 'onChange',
  })

  useEffect(() => {
    if (!errorPresentation) return

    applyApiFieldErrors<SignInFormData>({
      fieldErrors: errorPresentation.fieldErrors,
      fieldMap: { email: 'email', password: 'password' },
      setError,
      setFocus,
    })
  }, [errorPresentation, setError, setFocus])

  const canSubmit = !isPending && isValid

  const onSubmit = (data: SignInFormData) => {
    signIn(data, {
      onSuccess: (user) => {
        navigate(resolvePostAuthRoute(user, from), { replace: true })
      },
    })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <FormField
        label="Email"
        type="email"
        {...register('email')}
        error={errors.email?.message}
        prefixIcon={<Mail className="h-4 w-4 text-muted-foreground" />}
        disabled={isPending}
        required
        autoComplete="email"
        className={inputClassName}
      />

      <FormField
        label="Senha"
        type="password"
        {...register('password')}
        error={errors.password?.message}
        prefixIcon={<Lock className="h-4 w-4 text-muted-foreground" />}
        disabled={isPending}
        required
        autoComplete="current-password"
        className={inputClassName}
      />

      {errorPresentation ? <ApiErrorAlert error={errorPresentation} /> : null}

      <Button
        type="submit"
        disabled={!canSubmit}
        className="h-11 w-full rounded-lg bg-primary text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-secondary"
      >
        {isPending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Entrando...
          </>
        ) : (
          'Entrar'
        )}
      </Button>
    </form>
  )
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null

const resolveRedirectPath = (state: unknown): string => {
  if (!isRecord(state)) {
    return AUTH_ROUTES.dashboard
  }

  const from = state.from

  if (!isRecord(from)) {
    return AUTH_ROUTES.dashboard
  }

  const pathname = from.pathname

  if (typeof pathname === 'string' && pathname.startsWith('/')) {
    return pathname
  }

  return AUTH_ROUTES.dashboard
}
