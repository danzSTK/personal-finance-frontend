import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate, useLocation } from 'react-router-dom'
import { Loader2, Lock, Mail } from 'lucide-react'

import { FormField } from '../molecules/FormField'
import { Button } from '../atoms'
import { useSignIn } from '../../api/mutations'
import { signInSchema, SignInFormData } from '../../utils/validation'
import { resolveApiErrorMessage } from '../../utils/error.utils'
import { AUTH_ROUTES } from '../../constants/auth.constants'

const inputClassName =
  'h-11 rounded-lg border-app-border bg-app-bg text-app-text placeholder:text-app-muted focus-visible:border-brand focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-app-panel'

export const SignInForm = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { mutate: signIn, isPending, error } = useSignIn()
  const from = resolveRedirectPath(location.state)
  const errorMessage = resolveApiErrorMessage(error, 'Email ou senha incorretos')

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<SignInFormData>({
    resolver: zodResolver(signInSchema),
    mode: 'onChange',
  })

  const canSubmit = !isPending && isValid

  const onSubmit = (data: SignInFormData) => {
    signIn(data, {
      onSuccess: () => {
        navigate(from, { replace: true })
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
        prefixIcon={<Mail className="h-4 w-4 text-app-muted" />}
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
        prefixIcon={<Lock className="h-4 w-4 text-app-muted" />}
        disabled={isPending}
        required
        autoComplete="current-password"
        className={inputClassName}
      />

      {error && (
        <div
          role="alert"
          className="rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive"
        >
          <p className="font-medium">Erro ao fazer login</p>
          <p className="mt-1">{errorMessage}</p>
        </div>
      )}

      <Button
        type="submit"
        disabled={!canSubmit}
        className="h-11 w-full rounded-lg bg-brand text-brand-foreground transition-colors hover:bg-brand-intense focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-app-panel"
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
