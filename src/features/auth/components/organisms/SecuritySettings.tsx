import {
  useEffect,
  useMemo,
  useState,
  type FormEvent,
  type ReactNode,
} from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { CheckCircle2, Link2, Mail, ShieldCheck } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/lib/card'
import { Button } from '@/shared/lib/button'
import { cn } from '@/shared/lib/utils'
import { formatDateTime } from '@/shared/utils/formatters'
import { ApiErrorAlert } from '@/shared/components/molecules/ApiErrorAlert'
import { resolveApiError, showApiErrorToast } from '@/shared/errors'
import { toast } from '@/shared/hooks/use-toast'
import { FormField } from '../molecules'
import { SessionCard } from './SessionCard'
import { GoogleLogo } from '../atoms/GoogleLogo'
import api from '../../api/auth.api'
import { useLinkEmail, useRevokeSession } from '../../api/mutations'
import { useSessions, useUser } from '../../api/queries'
import {
  AUTH_API_ENDPOINTS,
  AUTH_QUERY_KEYS,
  AUTH_WINDOW_MESSAGES,
  GOOGLE_LINK_ERROR_MESSAGES,
} from '../../constants/auth.constants'
import type { AuthProvider, LinkEmailDto } from '../../types'

export const SecuritySettings = () => {
  const queryClient = useQueryClient()
  const { data: user, isLoading: isLoadingUser } = useUser()
  const {
    data: sessions = [],
    isLoading: isLoadingSessions,
    error: sessionsError,
    refetch: refetchSessions,
  } = useSessions()
  const linkEmailMutation = useLinkEmail()
  const revokeSessionMutation = useRevokeSession()

  const [linkEmailForm, setLinkEmailForm] = useState<LinkEmailDto>({
    email: '',
    password: '',
  })
  const [revokingJti, setRevokingJti] = useState<string | null>(null)

  const providers = user?.providers ?? []
  const emailProvider = findProvider(providers, 'EMAIL')
  const googleProvider = findProvider(providers, 'GOOGLE')

  const linkEmailError = useMemo(
    () =>
      linkEmailMutation.error
        ? resolveApiError(linkEmailMutation.error, 'auth.link-email')
        : null,
    [linkEmailMutation.error]
  )
  const sessionsErrorPresentation = useMemo(
    () =>
      sessionsError
        ? resolveApiError(sessionsError, 'auth.sessions.list')
        : null,
    [sessionsError]
  )
  const orderedSessions = useMemo(
    () =>
      [...sessions].sort(
        (first, second) =>
          Number(Boolean(second.isCurrent)) - Number(Boolean(first.isCurrent))
      ),
    [sessions]
  )

  useEffect(() => {
    if (emailProvider || linkEmailForm.email.trim() !== '' || !user?.email) {
      return
    }

    setLinkEmailForm((currentForm) => ({ ...currentForm, email: user.email }))
  }, [emailProvider, linkEmailForm.email, user?.email])

  useEffect(() => {
    const handleMessage = (event: MessageEvent<unknown>) => {
      if (event.origin !== window.location.origin) {
        return
      }

      if (!isGoogleLinkMessage(event.data)) {
        return
      }

      if (event.data.type === AUTH_WINDOW_MESSAGES.googleLinkSuccess) {
        void queryClient.invalidateQueries({ queryKey: AUTH_QUERY_KEYS.user })
        toast({
          title: 'Conta Google vinculada',
          description: 'O método Google já está disponível para login.',
        })
        return
      }

      if (event.data.type === AUTH_WINDOW_MESSAGES.googleLinkError) {
        toast({
          variant: 'destructive',
          title: 'Falha ao vincular Google',
          description: resolveGoogleLinkError(event.data.error),
        })
      }
    }

    window.addEventListener('message', handleMessage)

    return () => {
      window.removeEventListener('message', handleMessage)
    }
  }, [queryClient])

  const handleLinkGoogle = () => {
    const linkUrl = `${api.defaults.baseURL ?? ''}${AUTH_API_ENDPOINTS.linkGoogle}`
    window.location.assign(linkUrl)
  }

  const handleLinkEmail = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    linkEmailMutation.mutate(linkEmailForm, {
      onSuccess: () => {
        setLinkEmailForm({ email: '', password: '' })
        toast({
          title: 'Método por email vinculado',
          description: 'Agora você pode acessar também com email e senha.',
        })
      },
    })
  }

  const handleRevokeSession = (jti: string) => {
    setRevokingJti(jti)
    revokeSessionMutation.mutate(jti, {
      onError: (error) => showApiErrorToast(error, 'auth.sessions.revoke'),
      onSettled: () => {
        setRevokingJti((current) => (current === jti ? null : current))
      },
    })
  }

  return (
    <>
      <Card className="min-w-0 overflow-hidden border-0 bg-transparent shadow-none sm:border sm:border-border sm:bg-card sm:shadow-xs">
        <CardHeader className="px-0 pt-0 sm:p-6">
          <CardTitle className="flex items-center gap-2 text-base text-foreground">
            <ShieldCheck className="h-4 w-4 text-primary" />
            Métodos de login
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 px-0 pb-0 sm:p-6 sm:pt-0">
          <ProviderStatusRow
            title="Google"
            description={
              googleProvider
                ? `Vinculado em ${formatDateTime(googleProvider.linkedAt)}`
                : 'Conecte sua conta Google para login social.'
            }
            isLinked={Boolean(googleProvider)}
            icon={<GoogleLogo />}
            action={
              googleProvider ? null : (
                <Button
                  type="button"
                  onClick={handleLinkGoogle}
                  className="h-10 rounded-xl bg-primary px-4 text-primary-foreground hover:bg-primary/90"
                >
                  <Link2 className="mr-2 h-4 w-4" />
                  Vincular Google
                </Button>
              )
            }
          />

          <ProviderStatusRow
            title="Email e senha"
            description={
              emailProvider
                ? `Vinculado em ${formatDateTime(emailProvider.linkedAt)}`
                : 'Adicione email e senha para ter um método alternativo de acesso.'
            }
            isLinked={Boolean(emailProvider)}
            icon={<Mail className="h-5 w-5 text-primary" />}
            isPrimary
            action={
              emailProvider ? null : (
                <form onSubmit={handleLinkEmail} className="space-y-3">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <FormField
                      label="Email"
                      type="email"
                      autoComplete="email"
                      value={linkEmailForm.email}
                      onChange={(event) =>
                        setLinkEmailForm((currentForm) => ({
                          ...currentForm,
                          email: event.target.value,
                        }))
                      }
                    />
                    <FormField
                      label="Senha"
                      type="password"
                      autoComplete="new-password"
                      value={linkEmailForm.password}
                      onChange={(event) =>
                        setLinkEmailForm((currentForm) => ({
                          ...currentForm,
                          password: event.target.value,
                        }))
                      }
                    />
                  </div>
                  <Button
                    type="submit"
                    disabled={
                      linkEmailMutation.isPending ||
                      linkEmailForm.email.trim() === '' ||
                      linkEmailForm.password.trim() === ''
                    }
                    className="h-10 rounded-xl bg-primary px-4 text-primary-foreground hover:bg-primary/90"
                  >
                    <Mail className="mr-2 h-4 w-4" />
                    {linkEmailMutation.isPending
                      ? 'Vinculando...'
                      : 'Vincular email'}
                  </Button>
                  {linkEmailError ? (
                    <ApiErrorAlert error={linkEmailError} />
                  ) : null}
                </form>
              )
            }
          />

          {isLoadingUser ? (
            <p className="text-sm text-muted-foreground">Sincronizando métodos...</p>
          ) : null}
        </CardContent>
      </Card>

      <Card className="min-w-0 border-0 bg-transparent shadow-none sm:border sm:border-border sm:bg-card sm:shadow-xs">
        <CardHeader className="px-0 pt-0 sm:p-6">
          <CardTitle className="flex items-center gap-2 text-base text-foreground">
            <ShieldCheck className="h-4 w-4 text-primary" />
            Sessões ativas
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 px-0 pb-0 sm:p-6 sm:pt-0">
          {sessionsErrorPresentation ? (
            <ApiErrorAlert
              error={sessionsErrorPresentation}
              onRetry={() => void refetchSessions()}
            />
          ) : null}
          {isLoadingSessions ? (
            <p className="text-sm text-muted-foreground">Carregando sessões...</p>
          ) : null}

          {!isLoadingSessions && orderedSessions.length === 0 ? (
            <p className="rounded-xl border border-border bg-secondary px-3 py-4 text-sm text-muted-foreground">
              Nenhuma sessão foi encontrada além da atual.
            </p>
          ) : null}

          {orderedSessions.length > 0 ? (
            <div className="max-h-[min(56vh,28rem)] space-y-2 overflow-y-auto rounded-xl border border-border bg-background p-2 pr-1 lg:max-h-none lg:overflow-visible lg:pr-2">
              {orderedSessions.map((session) => (
                <SessionCard
                  key={session.jti}
                  session={session}
                  onRevoke={handleRevokeSession}
                  isRevoking={revokingJti === session.jti}
                />
              ))}
            </div>
          ) : null}
        </CardContent>
      </Card>
    </>
  )
}

interface ProviderStatusRowProps {
  title: string
  description: string
  isLinked: boolean
  icon?: ReactNode
  isPrimary?: boolean
  action?: ReactNode
}

const ProviderStatusRow = ({
  title,
  description,
  isLinked,
  icon,
  isPrimary = false,
  action,
}: ProviderStatusRowProps) => (
  <div
    className={cn(
      'relative rounded-xl border border-border bg-secondary p-4',
      isPrimary && 'border-primary/40'
    )}
  >
    {isPrimary ? (
      <span
        className="absolute bottom-3 left-0 top-3 w-0.5 rounded-r bg-primary"
        aria-hidden
      />
    ) : null}
    <div className="flex flex-wrap items-center justify-between gap-2">
      <div className="flex items-center gap-2">
        {icon ? (
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border bg-background">
            {icon}
          </span>
        ) : null}
        <p className="text-sm font-semibold text-foreground">{title}</p>
      </div>
      <span
        className={cn(
          'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
          isLinked
            ? 'bg-primary/15 text-primary'
            : 'bg-accent text-muted-foreground'
        )}
      >
        {isLinked ? (
          <>
            <CheckCircle2 className="mr-1 h-3.5 w-3.5" />
            Vinculado
          </>
        ) : (
          'Não vinculado'
        )}
      </span>
    </div>
    <p className="mt-1 text-sm text-muted-foreground">{description}</p>
    {action ? <div className="mt-3">{action}</div> : null}
  </div>
)

const findProvider = (
  providers: AuthProvider[],
  providerType: AuthProvider['provider']
): AuthProvider | undefined =>
  providers.find((provider) => provider.provider === providerType)

interface GoogleLinkMessage {
  type: string
  error?: string
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null

const isGoogleLinkMessage = (value: unknown): value is GoogleLinkMessage => {
  if (!isRecord(value)) {
    return false
  }

  if (typeof value.type !== 'string') {
    return false
  }

  if ('error' in value && typeof value.error !== 'string') {
    return false
  }

  return true
}

const isGoogleLinkErrorCode = (
  value: string
): value is keyof typeof GOOGLE_LINK_ERROR_MESSAGES =>
  value in GOOGLE_LINK_ERROR_MESSAGES

const resolveGoogleLinkError = (errorCode: string | undefined): string => {
  if (!errorCode) {
    return 'Não foi possível concluir o vínculo da conta Google.'
  }

  if (isGoogleLinkErrorCode(errorCode)) {
    return GOOGLE_LINK_ERROR_MESSAGES[errorCode]
  }

  return 'Não foi possível concluir o vínculo da conta Google.'
}
