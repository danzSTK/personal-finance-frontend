import { useEffect, useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import api from '@/features/auth/api/auth.api'
import { AUTH_API_ENDPOINTS, AUTH_ROUTES } from '@/features/auth/constants/auth.constants'
import { useAuthStore } from '@/features/auth/stores/auth.store'
import type { User } from '@/features/auth/types'
import { LoginPage } from '@/features/auth/components/templates/LoginPage'
import { DashboardPage } from '@/features/auth/components/templates/DashboardPage'
import { SettingsPage } from '@/features/auth/components/templates/SettingsPage'
import { AuthCallbackPage } from '@/features/auth/components/templates/AuthCallbackPage'
import { LinkProviderCallbackPage } from '@/features/auth/components/templates/LinkProviderCallbackPage'

function PrivateRoute({
  children,
  isBootstrappingAuth,
}: {
  children: React.ReactNode
  isBootstrappingAuth: boolean
}) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  if (isBootstrappingAuth) {
    return null
  }

  return isAuthenticated ? <>{children}</> : <Navigate to={AUTH_ROUTES.login} replace />
}

function PublicRoute({
  children,
  isBootstrappingAuth,
}: {
  children: React.ReactNode
  isBootstrappingAuth: boolean
}) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  if (isBootstrappingAuth) {
    return null
  }

  return !isAuthenticated ? (
    <>{children}</>
  ) : (
    <Navigate to={AUTH_ROUTES.dashboard} replace />
  )
}

export function AppRoutes() {
  const setAuth = useAuthStore((state) => state.setAuth)
  const clearAuth = useAuthStore((state) => state.clearAuth)
  const [isBootstrappingAuth, setIsBootstrappingAuth] = useState(true)

  useEffect(() => {
    const bootstrapAuth = async () => {
      try {
        const { data } = await api.get<User>(AUTH_API_ENDPOINTS.me)
        setAuth(data)
      } catch {
        clearAuth()
      } finally {
        setIsBootstrappingAuth(false)
      }
    }

    void bootstrapAuth()
  }, [clearAuth, setAuth])

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
        path={AUTH_ROUTES.settings}
        element={
          <PrivateRoute isBootstrappingAuth={isBootstrappingAuth}>
            <SettingsPage />
          </PrivateRoute>
        }
      />

      <Route path={AUTH_ROUTES.authCallback} element={<AuthCallbackPage />} />
      <Route
        path={AUTH_ROUTES.linkProviderCallback}
        element={<LinkProviderCallbackPage />}
      />
      <Route path="/" element={<Navigate to={AUTH_ROUTES.dashboard} replace />} />
      <Route path="*" element={<Navigate to={AUTH_ROUTES.dashboard} replace />} />
    </Routes>
  )
}
