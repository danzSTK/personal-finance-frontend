import { FormEvent, ReactNode, useEffect, useMemo, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import {
  Bell,
  CheckCircle2,
  Link2,
  Lock,
  Mail,
  ShieldCheck,
  SlidersHorizontal,
  UserRound,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/lib/card'
import { Input } from '@/shared/lib/input'
import { Button } from '@/shared/lib/button'
import { toast } from '@/shared/hooks/use-toast'
import { cn } from '@/shared/lib/utils'
import api from '../../api/auth.api'
import { useLinkEmail, useRevokeSession } from '../../api/mutations'
import { useSessions, useUser } from '../../api/queries'
import {
  AUTH_API_ENDPOINTS,
  AUTH_QUERY_KEYS,
  AUTH_WINDOW_MESSAGES,
  GOOGLE_LINK_ERROR_MESSAGES,
} from '../../constants/auth.constants'
import type { AuthProvider, LinkEmailDto, Session, User } from '../../types'
import { resolveApiErrorMessage } from '../../utils/error.utils'
import { SessionCard } from '../organisms/SessionCard'
import { GoogleLogo } from '../atoms/GoogleLogo'
import { AuthAppShell } from './AuthAppShell'

type SettingsSectionId = 'account' | 'security' | 'notifications' | 'preferences'

const settingsSections: Array<{
  id: SettingsSectionId
  title: string
  description: string
  icon: ReactNode
}> = [
  {
    id: 'account',
    title: 'Conta',
    description: 'Dados básicos e identidade da sua conta',
    icon: <UserRound className="h-4 w-4" />,
  },
  {
    id: 'security',
    title: 'Segurança',
    description: 'Métodos de login e sessões ativas',
    icon: <Lock className="h-4 w-4" />,
  },
  {
    id: 'notifications',
    title: 'Notificações',
    description: 'Como você quer receber alertas',
    icon: <Bell className="h-4 w-4" />,
  },
  {
    id: 'preferences',
    title: 'Preferências',
    description: 'Idioma, formato e experiência',
    icon: <SlidersHorizontal className="h-4 w-4" />,
  },
]

const inputClassName =
  'h-11 rounded-xl border-app-border bg-app-panel text-app-text placeholder:text-app-muted focus-visible:ring-brand focus-visible:ring-offset-app-panel'

export function SettingsPage() {
  const queryClient = useQueryClient()
  const [activeSection, setActiveSection] = useState<SettingsSectionId>('account')
  const [linkEmailForm, setLinkEmailForm] = useState<LinkEmailDto>({
    email: '',
    password: '',
  })
  const [revokingJti, setRevokingJti] = useState<string | null>(null)

  const { data: user, isLoading: isLoadingUser } = useUser()
  const { data: sessions = [], isLoading: isLoadingSessions } = useSessions()
  const linkEmailMutation = useLinkEmail()
  const revokeSessionMutation = useRevokeSession()

  const providers = user?.providers ?? []
  const emailProvider = findProvider(providers, 'EMAIL')
  const googleProvider = findProvider(providers, 'GOOGLE')
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

    setLinkEmailForm((currentForm) => ({
      ...currentForm,
      email: user.email,
    }))
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
      onError: (error) => {
        toast({
          variant: 'destructive',
          title: 'Falha ao vincular email',
          description: resolveApiErrorMessage(error, 'Confira os dados e tente novamente.'),
        })
      },
    })
  }

  const handleRevokeSession = (jti: string) => {
    setRevokingJti(jti)
    revokeSessionMutation.mutate(jti, {
      onError: (error) => {
        toast({
          variant: 'destructive',
          title: 'Falha ao revogar sessão',
          description: resolveApiErrorMessage(
            error,
            'Não foi possível revogar esta sessão agora.'
          ),
        })
      },
      onSettled: () => {
        setRevokingJti((current) => (current === jti ? null : current))
      },
    })
  }

  return (
    <AuthAppShell
      activeSection="settings"
      title="Configurações"
      subtitle="Gerencie conta, segurança e preferências"
      settingsSidebar={
        <SettingsSubSidebar
          activeSection={activeSection}
          onChangeSection={setActiveSection}
        />
      }
    >
      {activeSection === 'account' ? (
        <AccountSection user={user} isLoading={isLoadingUser} />
      ) : null}

      {activeSection === 'security' ? (
        <SecuritySection
          emailProvider={emailProvider}
          googleProvider={googleProvider}
          sessions={orderedSessions}
          isLoadingUser={isLoadingUser}
          isLoadingSessions={isLoadingSessions}
          linkEmailForm={linkEmailForm}
          isLinkingEmail={linkEmailMutation.isPending}
          revokingJti={revokingJti}
          onLinkGoogle={handleLinkGoogle}
          onLinkEmail={handleLinkEmail}
          onChangeLinkEmailForm={setLinkEmailForm}
          onRevokeSession={handleRevokeSession}
        />
      ) : null}

      {activeSection === 'notifications' ? (
        <PlaceholderSection
          title="Notificações"
          description="Centralize alertas importantes para atividade de conta, segurança e movimentações críticas."
          items={[
            'Alertas de segurança por email',
            'Resumo semanal de atividade da conta',
            'Confirmações de ações sensíveis',
          ]}
        />
      ) : null}

      {activeSection === 'preferences' ? (
        <PlaceholderSection
          title="Preferências"
          description="Defina a experiência padrão da aplicação para o seu uso diário."
          items={[
            'Formato de data e horário',
            'Idioma da interface',
            'Comportamento inicial do painel',
          ]}
        />
      ) : null}
    </AuthAppShell>
  )
}

interface SettingsSubSidebarProps {
  activeSection: SettingsSectionId
  onChangeSection: (section: SettingsSectionId) => void
}

const SettingsSubSidebar = ({
  activeSection,
  onChangeSection,
}: SettingsSubSidebarProps) => (
  <aside className="rounded-2xl border border-app-border bg-app-surface p-3">
    <p className="hidden px-2 pb-3 text-xs font-semibold uppercase tracking-wide text-app-muted lg:block">
      Configurações
    </p>

    <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden lg:mx-0 lg:block lg:space-y-2 lg:overflow-visible lg:px-0 lg:pb-0">
      {settingsSections.map((section) => (
        <button
          key={section.id}
          type="button"
          onClick={() => onChangeSection(section.id)}
          className={cn(
            'min-w-[10.5rem] shrink-0 rounded-xl border px-3 py-2 text-left transition lg:min-w-0',
            activeSection === section.id
              ? 'border-brand bg-brand/15 text-app-text'
              : 'border-transparent bg-transparent text-app-muted hover:border-app-border hover:bg-app-panel hover:text-app-text'
          )}
        >
          <span className="inline-flex items-center gap-2 whitespace-nowrap">
            <span className="shrink-0">{section.icon}</span>
            <span className="block text-sm font-medium">{section.title}</span>
          </span>
          <span className="mt-1 hidden text-xs text-app-muted lg:block">{section.description}</span>
        </button>
      ))}
    </div>
  </aside>
)

interface AccountSectionProps {
  user: User | undefined
  isLoading: boolean
}

const AccountSection = ({ user, isLoading }: AccountSectionProps) => {
  const fullName = resolveFullName(user)

  return (
    <Card className="border-app-border bg-app-surface">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base text-app-text">
          <UserRound className="h-4 w-4 text-brand-soft" />
          Dados da conta
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <p className="text-sm text-app-muted">Carregando seus dados...</p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            <InfoField label="Nome completo" value={fullName} />
            <InfoField label="Email" value={user?.email ?? '—'} />
            <InfoField label="Usuário" value={user?.userName ?? '—'} />
            <InfoField label="Status" value={user?.status ?? '—'} />
            <InfoField
              label="Criada em"
              value={formatDateTime(user?.createdAt)}
            />
            <InfoField
              label="Última atualização"
              value={formatDateTime(user?.updatedAt)}
            />
          </div>
        )}
      </CardContent>
    </Card>
  )
}

interface SecuritySectionProps {
  emailProvider: AuthProvider | undefined
  googleProvider: AuthProvider | undefined
  sessions: Session[]
  isLoadingUser: boolean
  isLoadingSessions: boolean
  linkEmailForm: LinkEmailDto
  isLinkingEmail: boolean
  revokingJti: string | null
  onLinkGoogle: () => void
  onLinkEmail: (event: FormEvent<HTMLFormElement>) => void
  onChangeLinkEmailForm: (value: LinkEmailDto) => void
  onRevokeSession: (jti: string) => void
}

const SecuritySection = ({
  emailProvider,
  googleProvider,
  sessions,
  isLoadingUser,
  isLoadingSessions,
  linkEmailForm,
  isLinkingEmail,
  revokingJti,
  onLinkGoogle,
  onLinkEmail,
  onChangeLinkEmailForm,
  onRevokeSession,
}: SecuritySectionProps) => (
  <>
    <Card className="relative min-w-0 overflow-hidden border-app-border bg-app-surface">
      <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-brand/10 blur-3xl" />
      <CardHeader className="relative z-10">
        <CardTitle className="flex items-center gap-2 text-base text-app-text">
          <ShieldCheck className="h-4 w-4 text-brand-soft" />
          Métodos de login
        </CardTitle>
      </CardHeader>
      <CardContent className="relative z-10 space-y-4">
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
                onClick={onLinkGoogle}
                className="h-10 rounded-xl bg-brand px-4 text-brand-foreground hover:bg-brand-intense"
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
          icon={<Mail className="h-5 w-5 text-brand" />}
          isPrimary
          action={
            emailProvider ? null : (
              <form onSubmit={onLinkEmail} className="grid gap-2 sm:grid-cols-3">
                <Input
                  type="email"
                  placeholder="Email"
                  autoComplete="email"
                  value={linkEmailForm.email}
                  onChange={(event) =>
                    onChangeLinkEmailForm({
                      ...linkEmailForm,
                      email: event.target.value,
                    })
                  }
                  className={inputClassName}
                />
                <Input
                  type="password"
                  placeholder="Senha"
                  autoComplete="new-password"
                  value={linkEmailForm.password}
                  onChange={(event) =>
                    onChangeLinkEmailForm({
                      ...linkEmailForm,
                      password: event.target.value,
                    })
                  }
                  className={inputClassName}
                />
                <Button
                  type="submit"
                  disabled={
                    isLinkingEmail ||
                    linkEmailForm.email.trim() === '' ||
                    linkEmailForm.password.trim() === ''
                  }
                  className="h-10 rounded-xl bg-brand text-brand-foreground hover:bg-brand-intense"
                >
                  <Mail className="mr-2 h-4 w-4" />
                  {isLinkingEmail ? 'Vinculando...' : 'Vincular email'}
                </Button>
              </form>
            )
          }
        />

        {isLoadingUser ? (
          <p className="text-sm text-app-muted">Sincronizando métodos...</p>
        ) : null}
      </CardContent>
    </Card>

    <Card className="min-w-0 border-app-border bg-app-surface">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base text-app-text">
          <ShieldCheck className="h-4 w-4 text-brand-soft" />
          Sessões ativas
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {isLoadingSessions ? (
          <p className="text-sm text-app-muted">Carregando sessões...</p>
        ) : null}

        {!isLoadingSessions && sessions.length === 0 ? (
          <p className="rounded-xl border border-app-border bg-app-panel px-3 py-4 text-sm text-app-muted">
            Nenhuma sessão foi encontrada além da atual.
          </p>
        ) : null}

        {sessions.length > 0 ? (
          <div className="space-y-2 rounded-xl border border-app-border bg-app-bg p-2">
            {sessions.map((session) => (
              <SessionCard
                key={session.jti}
                session={session}
                onRevoke={onRevokeSession}
                isRevoking={revokingJti === session.jti}
              />
            ))}
          </div>
        ) : null}
      </CardContent>
    </Card>
  </>
)

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
      'relative rounded-xl border border-app-border bg-app-panel p-4',
      isPrimary && 'border-brand/40'
    )}
  >
    {isPrimary ? (
      <span className="absolute bottom-3 left-0 top-3 w-0.5 rounded-r bg-brand" aria-hidden />
    ) : null}
    <div className="flex flex-wrap items-center justify-between gap-2">
      <div className="flex items-center gap-2">
        {icon ? (
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-app-border bg-app-bg">
            {icon}
          </span>
        ) : null}
        <p className="text-sm font-semibold text-app-text">{title}</p>
      </div>
      <span
        className={cn(
          'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
          isLinked
            ? 'bg-state-success/20 text-state-success'
            : 'bg-app-elevated text-app-muted'
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
    <p className="mt-1 text-sm text-app-muted">{description}</p>
    {action ? <div className="mt-3">{action}</div> : null}
  </div>
)

interface PlaceholderSectionProps {
  title: string
  description: string
  items: string[]
}

const PlaceholderSection = ({
  title,
  description,
  items,
}: PlaceholderSectionProps) => (
  <Card className="border-app-border bg-app-surface">
    <CardHeader>
      <CardTitle className="text-base text-app-text">{title}</CardTitle>
    </CardHeader>
    <CardContent className="space-y-3">
      <p className="text-sm text-app-muted">{description}</p>
      <div className="space-y-2">
        {items.map((item) => (
          <div
            key={item}
            className="rounded-xl border border-app-border bg-app-panel px-3 py-2 text-sm text-app-text"
          >
            {item}
          </div>
        ))}
      </div>
    </CardContent>
  </Card>
)

interface InfoFieldProps {
  label: string
  value: string
}

const InfoField = ({ label, value }: InfoFieldProps) => (
  <div className="rounded-xl border border-app-border bg-app-panel p-3">
    <p className="text-xs uppercase tracking-wide text-app-muted">{label}</p>
    <p className="mt-1 text-sm font-medium text-app-text">{value}</p>
  </div>
)

const findProvider = (
  providers: AuthProvider[],
  providerType: AuthProvider['provider']
): AuthProvider | undefined => providers.find((provider) => provider.provider === providerType)

const resolveFullName = (user: User | undefined): string => {
  const firstName = user?.firstName?.trim()
  const lastName = user?.lastName?.trim()

  if (firstName || lastName) {
    return [firstName, lastName].filter(Boolean).join(' ')
  }

  return user?.userName ?? user?.email ?? '—'
}

const formatDateTime = (value: string | undefined): string => {
  if (!value) {
    return '—'
  }

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return '—'
  }

  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date)
}

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

  return errorCode
}
