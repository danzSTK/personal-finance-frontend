import { ReactNode, useEffect, useMemo, useState } from 'react'
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
  LogOut,
  Settings,
  X,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { APP_BRAND } from '@/shared/config/brand'
import { Toaster } from '@/shared/components/organisms/Toaster'
import { Button } from '@/shared/lib/button'
import { cn } from '@/shared/lib/utils'
import { useLogout } from '../../api/mutations'
import { useUser } from '../../api/queries'
import {
  AUTH_ROUTES,
  AUTH_UI_STORAGE_KEYS,
} from '../../constants/auth.constants'
import { useAuthStore } from '../../stores/auth.store'

type MainSection = 'dashboard' | 'settings'

interface AuthAppShellProps {
  activeSection: MainSection
  title: string
  subtitle: string
  children: ReactNode
  settingsSidebar?: ReactNode
}

const primaryNavigation: Array<{
  id: 'dashboard'
  label: string
  description: string
  icon: ReactNode
  route: string
}> = [
  {
    id: 'dashboard',
    label: 'Painel',
    description: 'Visão geral',
    icon: <LayoutDashboard className="h-4 w-4" />,
    route: AUTH_ROUTES.dashboard,
  },
]

const getStoredSidebarCollapsedState = (): boolean => {
  if (typeof window === 'undefined') {
    return false
  }

  return (
    window.localStorage.getItem(AUTH_UI_STORAGE_KEYS.sidebarCollapsed) === 'true'
  )
}

export const AuthAppShell = ({
  activeSection,
  title,
  subtitle,
  children,
  settingsSidebar,
}: AuthAppShellProps) => {
  const navigate = useNavigate()
  const logoutMutation = useLogout()
  const { data: userFromApi, isLoading: isLoadingUser } = useUser()
  const userFromStore = useAuthStore((state) => state.user)
  const currentUser = userFromApi ?? userFromStore

  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false)
  const [isDesktopSidebarCollapsed, setIsDesktopSidebarCollapsed] = useState(
    getStoredSidebarCollapsedState
  )

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    window.localStorage.setItem(
      AUTH_UI_STORAGE_KEYS.sidebarCollapsed,
      String(isDesktopSidebarCollapsed)
    )
  }, [isDesktopSidebarCollapsed])

  const fullName = useMemo(() => {
    const firstName = currentUser?.firstName?.trim()
    const lastName = currentUser?.lastName?.trim()

    if (firstName || lastName) {
      return [firstName, lastName].filter(Boolean).join(' ')
    }

    return currentUser?.userName ?? currentUser?.email ?? 'Usuário'
  }, [currentUser])

  const email = currentUser?.email ?? 'Email indisponível'
  const initials = getInitials(fullName)

  const goTo = (route: string) => {
    setIsMobileSidebarOpen(false)
    setIsProfileMenuOpen(false)
    navigate(route)
  }

  const handleToggleDesktopSidebar = () => {
    setIsProfileMenuOpen(false)
    setIsDesktopSidebarCollapsed((state) => !state)
  }

  const handleLogout = () => {
    setIsProfileMenuOpen(false)
    logoutMutation.mutate()
  }

  return (
    <div className="dark min-h-screen overflow-x-hidden bg-app-bg text-app-text">
      <div className="flex min-h-screen">
        <div className="hidden lg:block">
          <aside
            className={cn(
              'fixed inset-y-0 left-0 z-40 flex flex-col border-r border-app-border bg-app-surface transition-[width] duration-200',
              isDesktopSidebarCollapsed ? 'w-22' : 'w-72'
            )}
          >
            <SidebarContent
              activeSection={activeSection}
              fullName={fullName}
              email={email}
              initials={initials}
              isLoadingUser={isLoadingUser}
              isProfileMenuOpen={isProfileMenuOpen}
              isCollapsed={isDesktopSidebarCollapsed}
              showCollapseControl
              onToggleProfileMenu={() =>
                setIsProfileMenuOpen((state) => !state)
              }
              onToggleCollapse={handleToggleDesktopSidebar}
              onNavigate={goTo}
              onLogout={handleLogout}
            />
          </aside>
        </div>

        <MobileSidebar
          isOpen={isMobileSidebarOpen}
          activeSection={activeSection}
          fullName={fullName}
          email={email}
          initials={initials}
          isLoadingUser={isLoadingUser}
          isProfileMenuOpen={isProfileMenuOpen}
          onClose={() => {
            setIsMobileSidebarOpen(false)
            setIsProfileMenuOpen(false)
          }}
          onToggleProfileMenu={() => setIsProfileMenuOpen((state) => !state)}
          onNavigate={goTo}
          onLogout={handleLogout}
        />

        <div
          className={cn(
            'flex min-h-screen flex-1 flex-col transition-[margin] duration-200',
            isDesktopSidebarCollapsed ? 'lg:ml-22' : 'lg:ml-72'
          )}
        >
          <header className="sticky top-0 z-30 border-b border-app-border bg-app-surface/95 backdrop-blur-sm">
            <div className="flex h-16 items-center justify-between gap-3 px-4 sm:px-6">
              <div className="flex items-center gap-3">
                <Button
                  type="button"
                  variant="ghost"
                  className="h-10 w-10 rounded-xl border border-app-border bg-app-panel text-app-text hover:bg-app-elevated lg:hidden"
                  onClick={() => setIsMobileSidebarOpen(true)}
                  aria-label="Abrir menu lateral"
                >
                  <MenuBarsIcon />
                </Button>
                <div>
                  <h1 className="text-sm font-semibold text-app-text sm:text-base">
                    {title}
                  </h1>
                  <p className="text-xs text-app-muted">{subtitle}</p>
                </div>
              </div>
              <span className="hidden text-xs font-medium uppercase tracking-wide text-app-muted sm:block">
                {APP_BRAND.name}
              </span>
            </div>
          </header>

          <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 sm:p-6 lg:p-8">
            {settingsSidebar ? (
              <div className="grid min-w-0 gap-5 lg:grid-cols-[260px_minmax(0,1fr)]">
                <div className="min-w-0">{settingsSidebar}</div>
                <section className="min-w-0 space-y-4">{children}</section>
              </div>
            ) : (
              <section className="min-w-0 space-y-4">{children}</section>
            )}
          </main>
        </div>
      </div>
      <Toaster />
    </div>
  )
}

interface SidebarContentProps {
  activeSection: MainSection
  fullName: string
  email: string
  initials: string
  isLoadingUser: boolean
  isProfileMenuOpen: boolean
  isCollapsed: boolean
  showCollapseControl: boolean
  hideBrandButton?: boolean
  onToggleProfileMenu: () => void
  onToggleCollapse?: () => void
  onNavigate: (route: string) => void
  onLogout: () => void
}

const SidebarContent = ({
  activeSection,
  fullName,
  email,
  initials,
  isLoadingUser,
  isProfileMenuOpen,
  isCollapsed,
  showCollapseControl,
  hideBrandButton = false,
  onToggleProfileMenu,
  onToggleCollapse,
  onNavigate,
  onLogout,
}: SidebarContentProps) => (
  <>
    {!hideBrandButton || showCollapseControl ? (
      <div className={cn('border-b border-app-border', isCollapsed ? 'p-3' : 'p-5')}>
        {isCollapsed && showCollapseControl ? (
          <div className="flex flex-col items-center gap-2">
            {!hideBrandButton ? <BrandButton onNavigate={onNavigate} isCollapsed /> : null}
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-9 w-9 rounded-lg border border-app-border bg-app-panel text-app-muted hover:bg-app-elevated hover:text-app-text"
              onClick={onToggleCollapse}
              aria-label="Expandir menu lateral"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div className="flex items-center justify-between gap-2">
            {!hideBrandButton ? <BrandButton onNavigate={onNavigate} isCollapsed={false} /> : null}
            {showCollapseControl ? (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-9 w-9 rounded-lg border border-app-border bg-app-panel text-app-muted hover:bg-app-elevated hover:text-app-text"
                onClick={onToggleCollapse}
                aria-label="Recolher menu lateral"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
            ) : null}
          </div>
        )}
      </div>
    ) : null}

    <nav className={cn('flex-1 space-y-2 p-3', isCollapsed && 'px-2')}>
      {primaryNavigation.map((item) => (
        <button
          key={item.id}
          type="button"
          onClick={() => onNavigate(item.route)}
          className={cn(
            'w-full rounded-xl border transition-all',
            activeSection === item.id
              ? 'border-brand bg-brand/15 text-app-text'
              : 'border-transparent bg-transparent text-app-muted hover:border-app-border hover:bg-app-panel hover:text-app-text',
            isCollapsed
              ? 'flex items-center justify-center px-2 py-3'
              : 'px-3 py-2 text-left'
          )}
          title={isCollapsed ? item.label : undefined}
          aria-label={item.label}
        >
          <span
            className={cn(
              'inline-flex items-center gap-2 text-sm font-medium',
              isCollapsed && 'justify-center'
            )}
          >
            {item.icon}
            {isCollapsed ? null : item.label}
          </span>
          {isCollapsed ? null : (
            <p className="mt-1 text-xs text-app-muted">{item.description}</p>
          )}
        </button>
      ))}
    </nav>

    <div className={cn('border-t border-app-border p-3', isCollapsed && 'px-2')}>
      <div className="relative">
        {isProfileMenuOpen ? (
          <div
            className={cn(
              'absolute bottom-full mb-2 rounded-xl border border-app-border bg-app-panel p-1 shadow-lg shadow-app-bg/30',
              isCollapsed ? 'left-0 w-60' : 'w-full'
            )}
          >
            <button
              type="button"
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-app-text transition hover:bg-app-elevated"
              onClick={() => onNavigate(AUTH_ROUTES.settings)}
            >
              <Settings className="h-4 w-4" />
              Configurações
            </button>
            <button
              type="button"
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-destructive transition hover:bg-destructive/10"
              onClick={onLogout}
              disabled={isLoadingUser}
            >
              <LogOut className="h-4 w-4" />
              Sair
            </button>
          </div>
        ) : null}

        <button
          type="button"
          className={cn(
            'flex w-full items-center rounded-xl border border-app-border bg-app-panel transition hover:bg-app-elevated',
            isCollapsed
              ? 'justify-center px-2 py-2'
              : 'justify-between gap-3 px-3 py-2'
          )}
          onClick={onToggleProfileMenu}
          aria-haspopup="menu"
          aria-expanded={isProfileMenuOpen}
          aria-label={`Abrir menu de perfil de ${fullName}`}
          >
            {isCollapsed ? (
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-brand/20 text-sm font-semibold text-brand-soft">
                {initials}
            </span>
          ) : (
            <span className="flex min-w-0 items-center gap-3">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-brand/20 text-sm font-semibold text-brand-soft">
                {initials}
              </span>
              <span className="min-w-0 text-left">
                <span className="block truncate text-sm font-medium text-app-text">
                  {fullName}
                </span>
                <span className="block truncate text-xs text-app-muted">
                  {email}
                </span>
              </span>
            </span>
          )}
          {isCollapsed ? null : <ChevronDown className="h-4 w-4 text-app-muted" />}
        </button>
      </div>
    </div>
  </>
)

interface BrandButtonProps {
  isCollapsed: boolean
  onNavigate: (route: string) => void
}

const BrandButton = ({ isCollapsed, onNavigate }: BrandButtonProps) => (
  <button
    type="button"
    onClick={() => onNavigate(AUTH_ROUTES.dashboard)}
    className={cn(
      'group rounded-xl border border-transparent transition hover:border-app-border hover:bg-app-panel',
      isCollapsed ? 'h-12 w-12' : 'flex items-center gap-3 px-2 py-1'
    )}
    aria-label={`Ir para ${APP_BRAND.name}`}
  >
    <span
      className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-app-border bg-app-panel"
      aria-hidden
    >
      <span className="h-2.5 w-2.5 rounded-full bg-brand" />
    </span>
    {isCollapsed ? null : (
      <span className="text-left">
        <span className="block text-sm font-semibold text-app-text">
          {APP_BRAND.name}
        </span>
        <span className="block text-xs text-app-muted">Painel privado</span>
      </span>
    )}
  </button>
)

interface MobileSidebarProps
  extends Omit<SidebarContentProps, 'isCollapsed' | 'showCollapseControl'> {
  isOpen: boolean
  onClose: () => void
}

const MobileSidebar = ({
  isOpen,
  onClose,
  ...sidebarProps
}: MobileSidebarProps) => (
  <>
    <div
      className={cn(
        'fixed inset-0 z-40 bg-app-bg/70 backdrop-blur-xs transition-opacity lg:hidden',
        isOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
      )}
      onClick={onClose}
      aria-hidden
    />
    <aside
      className={cn(
        'fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-app-border bg-app-surface transition-transform lg:hidden',
        isOpen ? 'translate-x-0' : '-translate-x-full'
      )}
    >
      <div className="flex items-center justify-between border-b border-app-border p-4">
        <p className="text-sm font-semibold text-app-text">{APP_BRAND.name}</p>
        <Button
          type="button"
          variant="ghost"
          className="h-9 w-9 rounded-lg border border-app-border bg-app-panel text-app-text hover:bg-app-elevated"
          onClick={onClose}
          aria-label="Fechar menu lateral"
        >
          <X className="h-5 w-5" />
        </Button>
      </div>
      <SidebarContent
        {...sidebarProps}
        isCollapsed={false}
        showCollapseControl={false}
        hideBrandButton
      />
    </aside>
  </>
)

const MenuBarsIcon = () => (
  <span className="inline-flex h-4 w-4 flex-col justify-center gap-1" aria-hidden>
    <span className="h-0.5 w-4 rounded-full bg-current" />
    <span className="h-0.5 w-4 rounded-full bg-current" />
    <span className="h-0.5 w-4 rounded-full bg-current" />
  </span>
)

const getInitials = (name: string): string => {
  const words = name
    .trim()
    .split(' ')
    .filter(Boolean)

  if (words.length === 0) {
    return 'DF'
  }

  const first = words[0]?.[0] ?? ''
  const second = words[1]?.[0] ?? ''

  return `${first}${second}`.toUpperCase()
}
