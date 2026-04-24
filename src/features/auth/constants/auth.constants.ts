export const AUTH_ROUTES = {
  login: '/login',
  signUp: '/sign-up',
  dashboard: '/dashboard',
  settings: '/settings',
  authCallback: '/auth/callback',
  linkProviderCallback: '/auth/link',
  signInAlias: '/sign-in',
} as const

export const AUTH_API_ENDPOINTS = {
  signUp: '/auth/sign-up',
  signIn: '/auth/sign-in',
  me: '/users/me',
  refresh: '/auth/refresh',
  logout: '/auth/logout',
  sessions: '/auth/sessions',
  linkEmail: '/auth/providers/link/email',
  loginGoogle: '/auth/google',
  linkGoogle: '/auth/providers/link/google',
} as const

export const AUTH_QUERY_KEYS = {
  user: ['user'] as const,
  sessions: ['sessions'] as const,
}

export const AUTH_WINDOW_MESSAGES = {
  googleLinkSuccess: 'auth:google-link-success',
  googleLinkError: 'auth:google-link-error',
} as const

export const AUTH_UI_STORAGE_KEYS = {
  sidebarCollapsed: 'auth:sidebar-collapsed',
} as const

export const GOOGLE_LINK_ERROR_MESSAGES = {
  missing_state: 'Sessão de vínculo inválida. Tente novamente.',
  invalid_state: 'Sessão de vínculo expirada. Tente novamente.',
  google_provider_conflict: 'Esta conta Google já está vinculada a outro usuário.',
} as const

export const DEFAULT_API_BASE_URL = 'http://localhost:3000'
