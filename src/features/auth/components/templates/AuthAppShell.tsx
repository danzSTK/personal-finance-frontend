import { ReactNode, useEffect, useMemo, useState } from 'react'
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircleEllipsis,
  Home,
  LayoutDashboard,
  LogOut,
  Plus,
  ReceiptText,
  Settings,
  Tags,
  WalletCards,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { APP_BRAND } from '@/shared/config/brand'
import { BrandLogo } from '@/shared/components/atoms/BrandLogo'
import { Toaster } from '@/shared/components/organisms/Toaster'
import { Button } from '@/shared/lib/button'
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/shared/components/ui/avatar'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/shared/components/ui/sheet'
import { cn } from '@/shared/lib/utils'
import { useLogout } from '../../api/mutations'
import { useUser } from '../../api/queries'
import {
  AUTH_ROUTES,
  AUTH_UI_STORAGE_KEYS,
} from '../../constants/auth.constants'
import { useAuthStore } from '../../stores/auth.store'
import { getUserInitials, resolveUserFullName } from '../../utils/user'

type MainSection =
  | 'dashboard'
  | 'accounts'
  | 'categories'
  | 'transactions'
  | 'settings'

interface AuthAppShellProps {
  activeSection: MainSection
  title: string
  subtitle: string
  children: ReactNode
  settingsSidebar?: ReactNode
}

const primaryNavigation: Array<{
  id: MainSection
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
  {
    id: 'accounts',
    label: 'Contas',
    description: 'Carteiras e bancos',
    icon: <WalletCards className="h-4 w-4" />,
    route: AUTH_ROUTES.accounts,
  },
  {
    id: 'categories',
    label: 'Categorias',
    description: 'Receitas e despesas',
    icon: <Tags className="h-4 w-4" />,
    route: AUTH_ROUTES.categories,
  },
  {
    id: 'transactions',
    label: 'Transações',
    description: 'Lançamentos',
    icon: <ReceiptText className="h-4 w-4" />,
    route: AUTH_ROUTES.transactions,
  },
]

const getStoredSidebarCollapsedState = (): boolean => {
  if (typeof window === 'undefined') {
    return false
  }

  return (
    window.localStorage.getItem(AUTH_UI_STORAGE_KEYS.sidebarCollapsed) ===
    'true'
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

  const [isMobileMoreMenuOpen, setIsMobileMoreMenuOpen] = useState(false)
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false)
  const [isDesktopSidebarCollapsed, setIsDesktopSidebarCollapsed] = useState(
    getStoredSidebarCollapsedState
  )

  useEffect(() => {
    if (activeSection !== 'settings') {
      return
    }

    setIsProfileMenuOpen(false)
    setIsDesktopSidebarCollapsed(true)
  }, [activeSection])

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    window.localStorage.setItem(
      AUTH_UI_STORAGE_KEYS.sidebarCollapsed,
      String(isDesktopSidebarCollapsed)
    )
  }, [isDesktopSidebarCollapsed])

  const fullName = useMemo(
    () => resolveUserFullName(currentUser),
    [currentUser]
  )

  const email = currentUser?.email ?? 'Email indisponível'
  const initials = getUserInitials(fullName)

  const goTo = (route: string) => {
    setIsMobileMoreMenuOpen(false)
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
    <div className="dark min-h-screen overflow-x-hidden bg-background text-foreground">
      <div className="flex min-h-screen">
        <div className="hidden lg:block">
          <aside
            className={cn(
              'fixed inset-y-0 left-0 z-40 flex flex-col border-r border-border bg-card transition-[width] duration-200',
              isDesktopSidebarCollapsed ? 'w-22' : 'w-72'
            )}
          >
            <SidebarContent
              activeSection={activeSection}
              fullName={fullName}
              email={email}
              initials={initials}
              avatarUrl={currentUser?.avatarUrl ?? null}
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

        <MobileBottomNavigation
          activeSection={activeSection}
          isLoadingUser={isLoadingUser}
          isMoreOpen={isMobileMoreMenuOpen}
          onMoreOpenChange={setIsMobileMoreMenuOpen}
          onNavigate={goTo}
          onLogout={handleLogout}
        />

        <div
          className={cn(
            'flex min-h-screen flex-1 flex-col transition-[margin] duration-200',
            isDesktopSidebarCollapsed ? 'lg:ml-22' : 'lg:ml-72'
          )}
        >
          <main
            className="flex-1 overflow-y-auto overflow-x-hidden p-4 pb-28 sm:p-6 sm:pb-28 lg:p-8"
            aria-label={`${title}: ${subtitle}`}
          >
            {settingsSidebar ? (
              <div className="grid min-w-0 gap-5 lg:grid-cols-[260px_minmax(0,1fr)]">
                <div className="hidden min-w-0 lg:block">
                  {settingsSidebar}
                </div>
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
  avatarUrl: string | null
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
  avatarUrl,
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
      <div
        className={cn(
          'border-b border-border px-4 py-3',
          isCollapsed && showCollapseControl && 'px-2'
        )}
      >
        {isCollapsed && showCollapseControl ? (
          <div className="flex flex-col items-center gap-3">
            {!hideBrandButton ? (
              <BrandButton onNavigate={onNavigate} isCollapsed />
            ) : null}
            <SidebarCollapseButton
              isCollapsed={isCollapsed}
              onClick={onToggleCollapse}
            />
          </div>
        ) : (
          <div className="flex items-center justify-between gap-3">
            {!hideBrandButton ? (
              <BrandButton onNavigate={onNavigate} isCollapsed={false} />
            ) : null}
            {showCollapseControl ? (
              <SidebarCollapseButton
                isCollapsed={isCollapsed}
                onClick={onToggleCollapse}
              />
            ) : null}
          </div>
        )}
      </div>
    ) : null}

    <nav className={cn('flex-1 space-y-1.5 p-3', isCollapsed && 'px-2')}>
      {primaryNavigation.map((item) => (
        <button
          key={item.id}
          type="button"
          onClick={() => onNavigate(item.route)}
          className={cn(
            'w-full rounded-xl border transition-all focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card',
            activeSection === item.id
              ? 'border-primary/40 bg-primary/15 text-foreground'
              : 'border-transparent bg-transparent text-muted-foreground hover:border-border hover:bg-secondary hover:text-foreground',
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
            <p
              className={cn(
                'mt-1 text-xs',
                activeSection === item.id
                  ? 'text-primary'
                  : 'text-muted-foreground'
              )}
            >
              {item.description}
            </p>
          )}
        </button>
      ))}
    </nav>

    <div
      className={cn('border-t border-border p-3', isCollapsed && 'px-2')}
    >
      <div className="relative">
        {isProfileMenuOpen ? (
          <div
            className={cn(
              'absolute bottom-full mb-2 rounded-xl border border-border bg-secondary p-1 shadow-lg shadow-background/30',
              isCollapsed ? 'left-0 w-60' : 'w-full'
            )}
          >
            <button
              type="button"
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-foreground transition hover:bg-accent"
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
            'flex w-full items-center rounded-xl border border-border bg-secondary transition hover:bg-accent',
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
            <SidebarAvatar
              avatarUrl={avatarUrl}
              fullName={fullName}
              initials={initials}
            />
          ) : (
            <span className="flex min-w-0 items-center gap-3">
              <SidebarAvatar
                avatarUrl={avatarUrl}
                fullName={fullName}
                initials={initials}
              />
              <span className="min-w-0 text-left">
                <span className="block truncate text-sm font-medium text-foreground">
                  {fullName}
                </span>
                <span className="block truncate text-xs text-muted-foreground">
                  {email}
                </span>
              </span>
            </span>
          )}
          {isCollapsed ? null : (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          )}
        </button>
      </div>
    </div>
  </>
)

interface SidebarAvatarProps {
  avatarUrl: string | null
  fullName: string
  initials: string
}

const SidebarAvatar = ({
  avatarUrl,
  fullName,
  initials,
}: SidebarAvatarProps) => (
  <Avatar className="h-10 w-10 rounded-lg border border-border">
    {avatarUrl ? (
      <AvatarImage
        src={avatarUrl}
        alt={`Foto de perfil de ${fullName}`}
        className="rounded-lg object-cover"
      />
    ) : null}
    <AvatarFallback className="rounded-lg bg-primary/20 text-sm font-semibold text-primary">
      {initials}
    </AvatarFallback>
  </Avatar>
)

interface SidebarCollapseButtonProps {
  isCollapsed: boolean
  onClick?: () => void
}

const SidebarCollapseButton = ({
  isCollapsed,
  onClick,
}: SidebarCollapseButtonProps) => (
  <Button
    type="button"
    variant="ghost"
    size="icon"
    className="h-9 w-9 shrink-0 rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground"
    onClick={onClick}
    aria-label={isCollapsed ? 'Expandir menu lateral' : 'Recolher menu lateral'}
    title={isCollapsed ? 'Expandir menu lateral' : 'Recolher menu lateral'}
  >
    {isCollapsed ? (
      <ChevronRight className="h-4 w-4" />
    ) : (
      <ChevronLeft className="h-4 w-4" />
    )}
  </Button>
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
      'group min-w-0 rounded-xl text-left transition focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card',
      isCollapsed
        ? 'inline-flex h-12 w-12 items-center justify-center hover:bg-secondary'
        : 'flex flex-1 items-center py-0.5'
    )}
    aria-label={`Ir para ${APP_BRAND.name}`}
    title={isCollapsed ? APP_BRAND.name : undefined}
  >
    {isCollapsed ? (
      <BrandLogo
        variant="icon"
        className="h-9 w-9"
        decorative
      />
    ) : (
      <span className="min-w-0 text-left">
        <BrandLogo className="w-28" decorative />
      </span>
    )}
  </button>
)

interface MobileBottomNavigationProps {
  activeSection: MainSection
  isLoadingUser: boolean
  isMoreOpen: boolean
  onMoreOpenChange: (open: boolean) => void
  onNavigate: (route: string) => void
  onLogout: () => void
}

const MobileBottomNavigation = ({
  activeSection,
  isLoadingUser,
  isMoreOpen,
  onMoreOpenChange,
  onNavigate,
  onLogout,
}: MobileBottomNavigationProps) => {
  const isMoreActive = ['categories', 'settings'].includes(
    activeSection
  )

  return (
    <>
      <nav
        className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/95 px-4 pb-[max(env(safe-area-inset-bottom),0.75rem)] pt-2 shadow-lg shadow-background/40 backdrop-blur-xl lg:hidden"
        aria-label="Navegação principal"
      >
        <div className="mx-auto grid max-w-md grid-cols-5 items-end gap-1">
          <MobileNavButton
            label="Principal"
            icon={<Home className="h-5 w-5" />}
            isActive={activeSection === 'dashboard'}
            onClick={() => onNavigate(AUTH_ROUTES.dashboard)}
          />
          <MobileNavButton
            label="Transações"
            icon={<ReceiptText className="h-5 w-5" />}
            isActive={activeSection === 'transactions'}
            onClick={() => onNavigate(AUTH_ROUTES.transactions)}
          />

          <button
            type="button"
            className="mx-auto -mt-8 flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/25 transition hover:bg-primary/90 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card"
            aria-label="Adicionar"
          >
            <Plus className="h-9 w-9" />
          </button>

          <MobileNavButton
            label="Contas"
            icon={<WalletCards className="h-5 w-5" />}
            isActive={activeSection === 'accounts'}
            onClick={() => onNavigate(AUTH_ROUTES.accounts)}
          />
          <MobileNavButton
            label="Mais"
            icon={<CircleEllipsis className="h-5 w-5" />}
            isActive={isMoreActive || isMoreOpen}
            onClick={() => onMoreOpenChange(true)}
          />
        </div>
      </nav>

      <Sheet open={isMoreOpen} onOpenChange={onMoreOpenChange}>
        <SheetContent
          side="bottom"
          className="max-h-[82vh] overflow-y-auto rounded-t-3xl border-border bg-card px-4 pb-[max(env(safe-area-inset-bottom),1rem)] pt-5 lg:hidden"
        >
          <SheetHeader className="pr-8 text-left">
            <SheetTitle>Mais</SheetTitle>
            <SheetDescription>
              Acesse outras áreas e configurações da sua conta.
            </SheetDescription>
          </SheetHeader>

          <div className="mt-5">
            <div className="overflow-hidden rounded-2xl border border-border bg-background">
              <MobileMoreMenuItem
                label="Categorias"
                description="Receitas e despesas"
                icon={<Tags className="h-4 w-4" />}
                isActive={activeSection === 'categories'}
                onClick={() => onNavigate(AUTH_ROUTES.categories)}
              />
              <MobileMoreMenuItem
                label="Configurações"
                description="Perfil, segurança e preferências"
                icon={<Settings className="h-4 w-4" />}
                isActive={activeSection === 'settings'}
                onClick={() => onNavigate(AUTH_ROUTES.settings)}
              />
              <MobileMoreMenuItem
                label="Sair"
                description="Encerrar sessão neste dispositivo"
                icon={<LogOut className="h-4 w-4" />}
                onClick={() => {
                  onMoreOpenChange(false)
                  onLogout()
                }}
                disabled={isLoadingUser}
                isDestructive
              />
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  )
}

interface MobileNavButtonProps {
  label: string
  icon: ReactNode
  isActive?: boolean
  onClick: () => void
}

const MobileNavButton = ({
  label,
  icon,
  isActive = false,
  onClick,
}: MobileNavButtonProps) => (
  <button
    type="button"
    onClick={onClick}
    className={cn(
      'flex min-w-0 flex-col items-center gap-1 rounded-2xl px-1 py-2 text-xs font-medium transition focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card',
      isActive
        ? 'bg-primary/15 text-primary'
        : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
    )}
    aria-current={isActive ? 'page' : undefined}
  >
    <span aria-hidden>{icon}</span>
    <span className="w-full truncate text-center">{label}</span>
  </button>
)

interface MobileMoreMenuItemProps {
  label: string
  description: string
  icon: ReactNode
  isActive?: boolean
  isDestructive?: boolean
  disabled?: boolean
  onClick: () => void
}

const MobileMoreMenuItem = ({
  label,
  description,
  icon,
  isActive = false,
  isDestructive = false,
  disabled = false,
  onClick,
}: MobileMoreMenuItemProps) => (
  <button
    type="button"
    className={cn(
      'flex w-full items-center gap-3 border-b border-border px-4 py-3 text-left transition last:border-b-0 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-60',
      isActive && 'bg-primary/15',
      isDestructive
        ? 'text-destructive hover:bg-destructive/10'
        : 'text-foreground hover:bg-secondary'
    )}
    disabled={disabled}
    onClick={onClick}
  >
    <span
      className={cn(
        'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-secondary',
        isActive && 'bg-primary/20 text-primary',
        isDestructive && 'bg-destructive/10 text-destructive'
      )}
    >
      {icon}
    </span>
    <span className="min-w-0 flex-1">
      <span className="block truncate text-sm font-medium">{label}</span>
      <span className="block truncate text-xs text-muted-foreground">
        {description}
      </span>
    </span>
    <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
  </button>
)
