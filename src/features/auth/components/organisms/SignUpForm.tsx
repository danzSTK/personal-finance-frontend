import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from 'react-router-dom'
import { Loader2, Lock, Mail, User } from 'lucide-react'
import { useState } from 'react'

import { FormField } from '../molecules/FormField'
import { Button } from '../atoms'
import { PasswordStrength } from '../molecules/PasswordStrength'
import { useSignUp } from '../../api/mutations'
import { signUpSchema, SignUpFormData } from '../../utils/validation'
import { resolveApiErrorMessage } from '../../utils/error.utils'
import { AUTH_ROUTES } from '../../constants/auth.constants'

const inputClassName =
  'h-11 rounded-xl border-app-border bg-app-panel text-app-text placeholder:text-app-muted focus-visible:ring-brand focus-visible:ring-offset-app-panel'

export const SignUpForm = () => {
  const navigate = useNavigate()
  const { mutate: signUp, isPending, error } = useSignUp()
  const [password, setPassword] = useState('')
  const errorMessage = resolveApiErrorMessage(
    error,
    'Não foi possível concluir o cadastro.'
  )

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
    mode: 'onChange',
  })

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
        label="Username"
        {...register('userName')}
        error={errors.userName?.message}
        prefixIcon={<User className="h-4 w-4 text-brand-soft" />}
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
        prefixIcon={<Mail className="h-4 w-4 text-brand-soft" />}
        disabled={isPending}
        required
        autoComplete="email"
        className={inputClassName}
      />

      <div className="grid grid-cols-2 gap-4">
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
          prefixIcon={<Lock className="h-4 w-4 text-brand-soft" />}
          disabled={isPending}
          required
          autoComplete="new-password"
          className={inputClassName}
        />
        <PasswordStrength password={password} />
      </div>

      {error && (
        <div
          role="alert"
          className="rounded-xl border border-state-danger/60 bg-state-danger/10 p-3 text-sm text-state-danger"
        >
          <p className="font-medium">Erro ao criar conta</p>
          <p className="mt-1">{errorMessage}</p>
        </div>
      )}

      <Button
        type="submit"
        disabled={!canSubmit}
        className="h-11 w-full rounded-xl bg-brand text-brand-foreground transition hover:bg-brand-intense"
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
