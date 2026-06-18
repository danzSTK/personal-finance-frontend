import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from 'react-router-dom'
import { Loader2, Lock, Mail, User } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { ApiErrorAlert } from '@/shared/components/molecules/ApiErrorAlert'
import { applyApiFieldErrors, resolveApiError } from '@/shared/errors'

import { FormField } from '../molecules/FormField'
import { Button } from '../atoms'
import { PasswordStrength } from '../molecules/PasswordStrength'
import { useSignUp } from '../../api/mutations'
import { signUpSchema, SignUpFormData } from '../../utils/validation'
import { AUTH_ROUTES } from '../../constants/auth.constants'

const inputClassName =
  'h-11 rounded-lg border-app-border bg-app-bg text-app-text placeholder:text-app-muted focus-visible:border-brand focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-app-panel'

export const SignUpForm = () => {
  const navigate = useNavigate()
  const { mutate: signUp, isPending, error } = useSignUp()
  const [password, setPassword] = useState('')
  const errorPresentation = useMemo(
    () => (error ? resolveApiError(error, 'auth.sign-up') : null),
    [error]
  )

  const {
    register,
    handleSubmit,
    setError,
    setFocus,
    formState: { errors, isValid },
  } = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
    mode: 'onChange',
  })

  useEffect(() => {
    if (!errorPresentation) return

    applyApiFieldErrors<SignUpFormData>({
      fieldErrors: errorPresentation.fieldErrors,
      fieldMap: {
        userName: 'userName',
        username: 'userName',
        email: 'email',
        password: 'password',
        firstName: 'firstName',
        lastName: 'lastName',
      },
      setError,
      setFocus,
    })
  }, [errorPresentation, setError, setFocus])

  const canSubmit = !isPending && isValid

  const onSubmit = (data: SignUpFormData) => {
    signUp(
      {
        ...data,
        firstName: data.firstName || undefined,
        lastName: data.lastName || undefined,
      },
      {
        onSuccess: () => {
          navigate(AUTH_ROUTES.dashboard)
        },
      }
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <FormField
        label="Usuário"
        {...register('userName')}
        error={errors.userName?.message}
        prefixIcon={<User className="h-4 w-4 text-app-muted" />}
        disabled={isPending}
        required
        autoComplete="username"
        className={inputClassName}
      />

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

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FormField
          label="Nome"
          {...register('firstName')}
          error={errors.firstName?.message}
          disabled={isPending}
          autoComplete="given-name"
          className={inputClassName}
        />
        <FormField
          label="Sobrenome"
          {...register('lastName')}
          error={errors.lastName?.message}
          disabled={isPending}
          autoComplete="family-name"
          className={inputClassName}
        />
      </div>

      <div className="space-y-2">
        <FormField
          label="Senha"
          type="password"
          {...register('password', {
            onChange: (e) => setPassword(e.target.value),
          })}
          error={errors.password?.message}
          prefixIcon={<Lock className="h-4 w-4 text-app-muted" />}
          disabled={isPending}
          required
          autoComplete="new-password"
          className={inputClassName}
        />
        <PasswordStrength password={password} />
      </div>

      {errorPresentation ? <ApiErrorAlert error={errorPresentation} /> : null}

      <Button
        type="submit"
        disabled={!canSubmit}
        className="h-11 w-full rounded-lg bg-brand text-brand-foreground transition-colors hover:bg-brand-intense focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-app-panel"
      >
        {isPending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Criando conta...
          </>
        ) : (
          'Criar conta'
        )}
      </Button>
    </form>
  )
}
