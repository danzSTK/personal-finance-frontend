const SETTINGS_BASE_ROUTE = '/settings'

export const SETTINGS_SECTION_PATHS = {
  account: 'account',
  security: 'security',
  notifications: 'notifications',
  preferences: 'preferences',
} as const

export const AUTH_ROUTES = {
  login: '/login',
  signUp: '/sign-up',
  dashboard: '/dashboard',
  accounts: '/accounts',
  categories: '/categories',
  transactions: '/transactions',
  emailVerification: '/verification-email',
  emailVerificationPending: '/email-verification-pending',
  settings: SETTINGS_BASE_ROUTE,
  settingsAccount: `${SETTINGS_BASE_ROUTE}/${SETTINGS_SECTION_PATHS.account}`,
  settingsSecurity: `${SETTINGS_BASE_ROUTE}/${SETTINGS_SECTION_PATHS.security}`,
  settingsNotifications: `${SETTINGS_BASE_ROUTE}/${SETTINGS_SECTION_PATHS.notifications}`,
  settingsPreferences: `${SETTINGS_BASE_ROUTE}/${SETTINGS_SECTION_PATHS.preferences}`,
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
  emailVerificationConfirm: '/auth/email-verification/confirm',
  emailVerificationResend: '/auth/email-verification/resend',
  sessions: '/auth/sessions',
  userAvatar: '/users/me/avatar',
  username: '/users/me/username',
  usernameAvailability: (username: string) =>
    `/users/usernames/${encodeURIComponent(username)}/availability`,
  linkEmail: '/auth/providers/link/email',
  loginGoogle: '/auth/google',
  linkGoogle: '/auth/providers/link/google',
} as const

export const AUTH_QUERY_KEYS = {
  user: ['user'] as const,
  sessions: ['sessions'] as const,
  usernameAvailability: (username: string) =>
    ['user', 'username-availability', username] as const,
}

export const AUTH_USER_STATUS = {
  active: 'ACTIVE',
  pendingEmailVerification: 'PENDING_EMAIL_VERIFICATION',
  blocked: 'BLOCKED',
  pendingProfile: 'PENDING_PROFILE',
} as const

export const AUTH_WINDOW_MESSAGES = {
  googleLinkSuccess: 'auth:google-link-success',
  googleLinkError: 'auth:google-link-error',
  emailVerificationRequired: 'auth:email-verification-required',
} as const

export const AUTH_UI_STORAGE_KEYS = {
  sidebarCollapsed: 'auth:sidebar-collapsed',
} as const

export const GOOGLE_LINK_ERROR_MESSAGES = {
  missing_state: 'Sessão de vínculo inválida. Tente novamente.',
  invalid_state: 'Sessão de vínculo expirada. Tente novamente.',
  google_provider_conflict:
    'Esta conta Google já está vinculada a outro usuário.',
} as const

export const DEFAULT_API_BASE_URL = 'http://localhost:3000'
