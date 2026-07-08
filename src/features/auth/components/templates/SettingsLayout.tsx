import { Link, Outlet, useLocation } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'
import { AuthAppShell } from './AuthAppShell'
import { SettingsNav } from '../molecules/SettingsNav'
import { AUTH_ROUTES } from '../../constants/auth.constants'

export const SettingsLayout = () => {
  const { pathname } = useLocation()
  const normalizedPathname = pathname.replace(/\/+$/, '') || AUTH_ROUTES.settings
  const shouldShowMobileBackLink = normalizedPathname !== AUTH_ROUTES.settings

  return (
    <AuthAppShell
      activeSection="settings"
      title="Configurações"
      subtitle="Gerencie conta, segurança e preferências"
      settingsSidebar={<SettingsNav />}
    >
      {shouldShowMobileBackLink ? (
        <Link
          to={AUTH_ROUTES.settings}
          className="inline-flex h-10 w-10 items-center justify-center rounded-full text-foreground transition hover:bg-secondary focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background lg:hidden"
          aria-label="Voltar para o menu de configurações"
        >
          <ChevronLeft className="h-6 w-6" />
        </Link>
      ) : null}

      <Outlet />
    </AuthAppShell>
  )
}
