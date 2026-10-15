import { useEffect, useMemo } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, Lock, Mail } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { ApiErrorAlert } from '@/shared/components/molecules/ApiErrorAlert'
import { applyApiFieldErrors, resolveApiError } from '@/shared/errors'
import { toast } from '@/shared/hooks/use-toast'
import { Button } from '@/shared/lib/button'
import { useLinkEmail } from '../../api/mutations'
import { linkEmailSchema, type LinkEmailFormData } from '../../utils/validation'
import { FormField } from '../molecules'

interface LinkEmailProviderFormProps {
  defaultEmail: string
}

export const LinkEmailProviderForm = ({
  defaultEmail,
}: LinkEmailProviderFormProps) => {
  const mutation = useLinkEmail()
  const errorPresentation = useMemo(
    () =>
      mutation.error
        ? resolveApiError(mutation.error, 'auth.link-email')
        : null,
    [mutation.error]
  )
  const {
    register,
    handleSubmit,
    reset,
    setError,
    setFocus,
    formState: { errors, isValid, isDirty },
  } = useForm<LinkEmailFormData>({
    resolver: zodResolver(linkEmailSchema),
    mode: 'onChange',
    defaultValues: {
      email: defaultEmail,
      password: '',
    },
  })

  useEffect(() => {
    if (!isDirty) {
      reset({ email: defaultEmail, password: '' })
    }
  }, [defaultEmail, isDirty, reset])

  useEffect(() => {
    if (!errorPresentation) {
      return
    }

    applyApiFieldErrors<LinkEmailFormData>({
      fieldErrors: errorPresentation.fieldErrors,
      fieldMap: { email: 'email', password: 'password' },
      setError,
      setFocus,
    })
  }, [errorPresentation, setError, setFocus])

  const handleLinkEmail = (data: LinkEmailFormData) => {
    mutation.mutate(data, {
      onSuccess: () => {
        reset({ email: defaultEmail, password: '' })
        toast({
          title: 'Método por email vinculado',
          description: 'Agora você pode acessar também com email e senha.',
        })
      },
    })
  }

  return (
    <form
      onSubmit={handleSubmit(handleLinkEmail)}
      className="space-y-3"
      noValidate
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <FormField
          label="Email"
          type="email"
          autoComplete="email"
          error={errors.email?.message}
          disabled={mutation.isPending}
          prefixIcon={<Mail className="h-4 w-4" />}
          {...register('email')}
        />
        <FormField
          label="Senha"
          type="password"
          autoComplete="new-password"
          error={errors.password?.message}
          disabled={mutation.isPending}
          prefixIcon={<Lock className="h-4 w-4" />}
          {...register('password')}
        />
      </div>
      <Button
        type="submit"
        disabled={mutation.isPending || !isValid}
        className="h-11 rounded-xl bg-primary px-4 text-primary-foreground hover:bg-primary/90"
      >
        {mutation.isPending ? (
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
        ) : (
          <Mail className="h-4 w-4" aria-hidden />
        )}
        {mutation.isPending ? 'Vinculando...' : 'Vincular email'}
      </Button>
      {errorPresentation ? <ApiErrorAlert error={errorPresentation} /> : null}
    </form>
  )
}
