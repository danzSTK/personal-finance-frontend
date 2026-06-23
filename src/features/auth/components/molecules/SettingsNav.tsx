import type { ReactNode } from 'react'
import { NavLink } from 'react-router-dom'
import { Bell, Lock, SlidersHorizontal, UserRound } from 'lucide-react'
import { cn } from '@/shared/lib/utils'
import { AUTH_ROUTES } from '../../constants/auth.constants'

interface SettingsNavItem {
  to: string
  title: string
  description: string
  icon: ReactNode
}

const settingsNavItems: SettingsNavItem[] = [
  {
    to: AUTH_ROUTES.settingsAccount,
    title: 'Conta',
    description: 'Perfil e identidade',
    icon: <UserRound className="h-4 w-4" />,
  },
  {
    to: AUTH_ROUTES.settingsSecurity,
    title: 'Segurança',
    description: 'Login e sessões ativas',
    icon: <Lock className="h-4 w-4" />,
  },
  {
    to: AUTH_ROUTES.settingsNotifications,
    title: 'Notificações',
    description: 'Alertas e avisos',
    icon: <Bell className="h-4 w-4" />,
  },
  {
    to: AUTH_ROUTES.settingsPreferences,
    title: 'Preferências',
    description: 'Idioma e formato',
    icon: <SlidersHorizontal className="h-4 w-4" />,
  },
]

export const SettingsNav = () => (
  <aside className="rounded-2xl border border-app-border bg-app-surface p-3">
    <p className="hidden px-2 pb-3 text-xs font-semibold uppercase tracking-wide text-app-muted lg:block">
      Configurações
    </p>

    <nav className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 scrollbar-none [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden lg:mx-0 lg:block lg:space-y-2 lg:overflow-visible lg:px-0 lg:pb-0">
      {settingsNavItems.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          className={({ isActive }) =>
            cn(
              'block min-w-42 shrink-0 rounded-xl border px-3 py-2 text-left transition focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-app-surface lg:w-full lg:min-w-0',
              isActive
                ? 'border-brand bg-brand/15 text-app-text'
                : 'border-transparent bg-transparent text-app-muted hover:border-app-border hover:bg-app-panel hover:text-app-text'
            )
          }
        >
          <span className="inline-flex items-center gap-2 whitespace-nowrap">
            <span className="shrink-0">{item.icon}</span>
            <span className="block text-sm font-medium">{item.title}</span>
          </span>
          <span className="mt-1 hidden text-xs text-app-muted lg:block">
            {item.description}
          </span>
        </NavLink>
      ))}
    </nav>
  </aside>
)
