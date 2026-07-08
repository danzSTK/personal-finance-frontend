import { useEffect, useLayoutEffect, useState } from 'react'
import {
  Routes,
  Route,
  Navigate,
  matchPath,
  useLocation,
  useNavigate,
} from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { APP_BRAND } from '@/shared/config/brand'
import {
  AUTH_QUERY_KEYS,
  AUTH_ROUTES,
  AUTH_WINDOW_MESSAGES,
  SETTINGS_SECTION_PATHS,
} from '@/features/auth/constants/auth.constants'
import { useAuthStore } from '@/features/auth/stores/auth.store'
import { fetchCurrentUser } from '@/features/auth/api/queries'
import { isPendingEmailVerification } from '@/features/auth/utils/emailVerification'
import { LoginPage } from '@/features/auth/components/templates/LoginPage'
import { DashboardPage } from '@/features/auth/components/templates/DashboardPage'
import { SettingsLayout } from '@/features/auth/components/templates/SettingsLayout'
import { SettingsOverviewPage } from '@/features/auth/components/pages/SettingsOverviewPage'
import { SettingsAccountPage } from '@/features/auth/components/pages/SettingsAccountPage'
import { SettingsSecurityPage } from '@/features/auth/components/pages/SettingsSecurityPage'
import { SettingsNotificationsPage } from '@/features/auth/components/pages/SettingsNotificationsPage'
import { SettingsPreferencesPage } from '@/features/auth/components/pages/SettingsPreferencesPage'
import { EmailVerificationPage } from '@/features/auth/components/pages/EmailVerificationPage'
import { PendingEmailVerificationPage } from '@/features/auth/components/pages/PendingEmailVerificationPage'
import { AccountsPage } from '@/features/accounts/components/pages/AccountsPage'
import { CategoriesPage } from '@/features/categories/components/pages/CategoriesPage'
import { TransactionsPage } from '@/features/transactions/components/pages/TransactionsPage'
import { AuthCallbackPage } from '@/features/auth/components/templates/AuthCallbackPage'
import { LinkProviderCallbackPage } from '@/features/auth/components/templates/LinkProviderCallbackPage'

const DOCUMENT_TITLE_ROUTES = [
  { path: '/', title: 'Entrar' },
  { path: AUTH_ROUTES.login, title: 'Entrar' },
  { path: AUTH_ROUTES.signInAlias, title: 'Entrar' },
  { path: AUTH_ROUTES.signUp, title: 'Criar conta' },
  { path: AUTH_ROUTES.dashboard, title: 'Dashboard' },
  { path: AUTH_ROUTES.accounts, title: 'Contas' },
  { path: AUTH_ROUTES.categories, title: 'Categorias' },
  { path: AUTH_ROUTES.transactions, title: 'Transações' },
  { path: AUTH_ROUTES.emailVerification, title: 'Confirmar email' },
  { path: AUTH_ROUTES.emailVerificationPending, title: 'Verificação pendente' },
  { path: AUTH_ROUTES.settings, title: 'Configurações' },
  { path: AUTH_ROUTES.settingsAccount, title: 'Conta' },
  { path: AUTH_ROUTES.settingsSecurity, title: 'Segurança' },
  { path: AUTH_ROUTES.settingsNotifications, title: 'Notificações' },
  { path: AUTH_ROUTES.settingsPreferences, title: 'Preferências' },
  { path: AUTH_ROUTES.authCallback, title: 'Conectando' },
  { path: AUTH_ROUTES.linkProviderCallback, title: 'Vincular conta' },
] as const

const formatDocumentTitle = (pageTitle?: string) =>
  pageTitle ? `${APP_BRAND.name} | ${pageTitle}` : APP_BRAND.name

const resolveDocumentPageTitle = (pathname: string) =>
  DOCUMENT_TITLE_ROUTES.find(({ path }) =>
    matchPath({ path, end: true }, pathname)
  )?.title ?? 'Entrar'

function useRouteDocumentTitle() {
  const { pathname } = useLocation()

  useLayoutEffect(() => {
    document.title = formatDocumentTitle(resolveDocumentPageTitle(pathname))
  }, [pathname])
}

function PrivateRoute({
  children,
  isBootstrappingAuth,
  allowPendingEmailVerification = false,
}: {
  children: React.ReactNode
  isBootstrappingAuth: boolean
  allowPendingEmailVerification?: boolean
}) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const user = useAuthStore((state) => state.user)
  const location = useLocation()

  if (isBootstrappingAuth) {
    return null
  }

  if (
    isAuthenticated &&
    isPendingEmailVerification(user) &&
    !allowPendingEmailVerification
  ) {
    return (
      <Navigate
        to={AUTH_ROUTES.emailVerificationPending}
        replace
        state={{ from: location }}
      />
    )
  }

  return isAuthenticated ? (
    <>{children}</>
  ) : (
    <Navigate
      to={AUTH_ROUTES.signInAlias}
      replace
      state={{ from: location }}
    />
  )
}

function PublicRoute({
  children,
  isBootstrappingAuth,
}: {
  children: React.ReactNode
  isBootstrappingAuth: boolean
}) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const user = useAuthStore((state) => state.user)
  if (isBootstrappingAuth) {
    return null
  }

  return !isAuthenticated ? (
    <>{children}</>
  ) : (
    <Navigate
      to={
        isPendingEmailVerification(user)
          ? AUTH_ROUTES.emailVerificationPending
          : AUTH_ROUTES.dashboard
      }
      replace
    />
  )
}

function IndexRoute({
  isBootstrappingAuth,
}: {
  isBootstrappingAuth: boolean
}) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const user = useAuthStore((state) => state.user)

  if (isBootstrappingAuth) {
    return null
  }

  return (
    <Navigate
      to={
        isAuthenticated
          ? isPendingEmailVerification(user)
            ? AUTH_ROUTES.emailVerificationPending
            : AUTH_ROUTES.dashboard
          : AUTH_ROUTES.signInAlias
      }
      replace
    />
  )
}

export function AppRoutes() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const setAuth = useAuthStore((state) => state.setAuth)
  const clearAuth = useAuthStore((state) => state.clearAuth)
  const [isBootstrappingAuth, setIsBootstrappingAuth] = useState(true)
  useRouteDocumentTitle()

  useEffect(() => {
    const bootstrapAuth = async () => {
      try {
        const user = await fetchCurrentUser()
        setAuth(user)
        queryClient.setQueryData(AUTH_QUERY_KEYS.user, user)
      } catch {
        clearAuth()
      } finally {
        setIsBootstrappingAuth(false)
      }
    }

    void bootstrapAuth()
  }, [clearAuth, queryClient, setAuth])

  useEffect(() => {
    const handleEmailVerificationRequired = () => {
      const syncPendingUser = async () => {
        try {
          const user = await fetchCurrentUser()
          setAuth(user)
          queryClient.setQueryData(AUTH_QUERY_KEYS.user, user)

          if (isPendingEmailVerification(user)) {
            navigate(AUTH_ROUTES.emailVerificationPending, { replace: true })
          }
        } catch {
          clearAuth()
          navigate(AUTH_ROUTES.signInAlias, { replace: true })
        }
      }

      void syncPendingUser()
    }

    window.addEventListener(
      AUTH_WINDOW_MESSAGES.emailVerificationRequired,
      handleEmailVerificationRequired
    )

    return () => {
      window.removeEventListener(
        AUTH_WINDOW_MESSAGES.emailVerificationRequired,
        handleEmailVerificationRequired
      )
    }
  }, [clearAuth, navigate, queryClient, setAuth])

  return (
    <Routes>
      <Route
        path={AUTH_ROUTES.login}
        element={<Navigate to={AUTH_ROUTES.signInAlias} replace />}
      />

      <Route
        path={AUTH_ROUTES.signInAlias}
        element={
          <PublicRoute isBootstrappingAuth={isBootstrappingAuth}>
            <LoginPage mode="sign-in" />
          </PublicRoute>
        }
      />

      <Route
        path={AUTH_ROUTES.signUp}
        element={
          <PublicRoute isBootstrappingAuth={isBootstrappingAuth}>
            <LoginPage mode="sign-up" />
          </PublicRoute>
        }
      />

      <Route
        path={AUTH_ROUTES.dashboard}
        element={
          <PrivateRoute isBootstrappingAuth={isBootstrappingAuth}>
            <DashboardPage />
          </PrivateRoute>
        }
      />

      <Route
        path={AUTH_ROUTES.emailVerification}
        element={<EmailVerificationPage />}
      />

      <Route
        path={AUTH_ROUTES.emailVerificationPending}
        element={
          <PrivateRoute
            isBootstrappingAuth={isBootstrappingAuth}
            allowPendingEmailVerification
          >
            <PendingEmailVerificationPage />
          </PrivateRoute>
        }
      />

      <Route
        path={AUTH_ROUTES.accounts}
        element={
          <PrivateRoute isBootstrappingAuth={isBootstrappingAuth}>
            <AccountsPage />
          </PrivateRoute>
        }
      />

      <Route
        path={AUTH_ROUTES.categories}
        element={
          <PrivateRoute isBootstrappingAuth={isBootstrappingAuth}>
            <CategoriesPage />
          </PrivateRoute>
        }
      />

      <Route
        path={AUTH_ROUTES.transactions}
        element={
          <PrivateRoute isBootstrappingAuth={isBootstrappingAuth}>
            <TransactionsPage />
          </PrivateRoute>
        }
      />

      <Route
        path={AUTH_ROUTES.settings}
        element={
          <PrivateRoute isBootstrappingAuth={isBootstrappingAuth}>
            <SettingsLayout />
          </PrivateRoute>
        }
      >
        <Route index element={<SettingsOverviewPage />} />
        <Route
          path={SETTINGS_SECTION_PATHS.account}
          element={<SettingsAccountPage />}
        />
        <Route
          path={SETTINGS_SECTION_PATHS.security}
          element={<SettingsSecurityPage />}
        />
        <Route
          path={SETTINGS_SECTION_PATHS.notifications}
          element={<SettingsNotificationsPage />}
        />
        <Route
          path={SETTINGS_SECTION_PATHS.preferences}
          element={<SettingsPreferencesPage />}
        />
      </Route>

      <Route path={AUTH_ROUTES.authCallback} element={<AuthCallbackPage />} />
      <Route
        path={AUTH_ROUTES.linkProviderCallback}
        element={<LinkProviderCallbackPage />}
      />
      <Route
        path="/"
        element={<IndexRoute isBootstrappingAuth={isBootstrappingAuth} />}
      />
      <Route
        path="*"
        element={<IndexRoute isBootstrappingAuth={isBootstrappingAuth} />}
      />
    </Routes>
  )
}
