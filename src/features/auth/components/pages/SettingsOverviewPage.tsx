import { useEffect, type ComponentType } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Bell,
  ChevronRight,
  LockKeyhole,
  SlidersHorizontal,
  UserRound,
} from 'lucide-react'
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/shared/components/ui/avatar'
import { AUTH_ROUTES } from '../../constants/auth.constants'
import { useAuthStore } from '../../stores/auth.store'
import { useUser } from '../../api/queries'
import { getUserInitials, resolveUserFullName } from '../../utils/user'

interface SettingsOverviewOption {
  title: string
  value?: string
  to: string
  icon: ComponentType<{ className?: string }>
}

interface SettingsOverviewGroup {
  title: string
  options: SettingsOverviewOption[]
}

const settingsOverviewGroups: SettingsOverviewGroup[] = [
  {
    title: 'Conta',
    options: [
      {
        title: 'Gerenciar perfil',
        to: AUTH_ROUTES.settingsAccount,
        icon: UserRound,
      },
      {
        title: 'Senha e segurança',
        to: AUTH_ROUTES.settingsSecurity,
        icon: LockKeyhole,
      },
      {
        title: 'Notificações',
        to: AUTH_ROUTES.settingsNotifications,
        icon: Bell,
      },
    ],
  },
  {
    title: 'Preferências',
    options: [
      {
        title: 'Preferências do app',
        value: 'Padrão',
        to: AUTH_ROUTES.settingsPreferences,
        icon: SlidersHorizontal,
      },
    ],
  },
]

export const SettingsOverviewPage = () => {
  const navigate = useNavigate()
  const { data: userFromApi } = useUser()
  const userFromStore = useAuthStore((state) => state.user)
  const currentUser = userFromApi ?? userFromStore
  const fullName = resolveUserFullName(currentUser)
  const email = currentUser?.email ?? 'Email indisponível'
  const initials = getUserInitials(fullName)

  useEffect(() => {
    const desktopQuery = window.matchMedia('(min-width: 1024px)')

    if (desktopQuery.matches) {
      navigate(AUTH_ROUTES.settingsAccount, { replace: true })
    }
  }, [navigate])

  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-6 pb-4 lg:hidden">
      <header className="text-center">
        <h1 className="text-lg font-semibold text-foreground">
          Configurações
        </h1>
      </header>

      <div className="flex min-w-0 items-center gap-4 rounded-2xl border border-border bg-card p-4 shadow-sm">
        <Avatar className="h-16 w-16 rounded-2xl border border-border">
          {currentUser?.avatarUrl ? (
            <AvatarImage
              src={currentUser.avatarUrl}
              alt={`Foto de perfil de ${fullName}`}
              className="rounded-2xl object-cover"
            />
          ) : null}
          <AvatarFallback className="rounded-2xl bg-primary/20 text-base font-semibold text-primary">
            {initials}
          </AvatarFallback>
        </Avatar>

        <span className="min-w-0 flex-1 text-left">
          <span className="block truncate text-base font-semibold text-foreground">
            {fullName}
          </span>
          <span className="block truncate text-sm text-muted-foreground">
            {email}
          </span>
        </span>
      </div>

      <div className="space-y-6">
        {settingsOverviewGroups.map((group) => (
          <section key={group.title} className="space-y-2">
            <h2 className="px-1 text-sm font-medium text-muted-foreground">
              {group.title}
            </h2>

            <div className="overflow-hidden rounded-2xl border border-border bg-card">
              {group.options.map((option) => (
                <SettingsOverviewLink key={option.to} option={option} />
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  )
}

interface SettingsOverviewLinkProps {
  option: SettingsOverviewOption
}

const SettingsOverviewLink = ({ option }: SettingsOverviewLinkProps) => {
  const Icon = option.icon

  return (
    <Link
      to={option.to}
      className="flex min-h-14 items-center gap-3 border-b border-border px-4 py-3 text-foreground transition last:border-b-0 hover:bg-secondary focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
    >
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-secondary text-foreground">
        <Icon className="h-4 w-4" />
      </span>

      <span className="min-w-0 flex-1 truncate text-sm font-medium">
        {option.title}
      </span>

      {option.value ? (
        <span className="shrink-0 text-sm text-muted-foreground">
          {option.value}
        </span>
      ) : null}

      <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
    </Link>
  )
}
