import { AUTH_ROUTES, AUTH_USER_STATUS } from '../constants/auth.constants'
import type { User } from '../types'

export const isPendingEmailVerification = (
  user: Pick<User, 'status'> | null | undefined
): boolean => user?.status === AUTH_USER_STATUS.pendingEmailVerification

export const resolvePostAuthRoute = (
  user: Pick<User, 'status'> | null | undefined,
  fallbackRoute: string = AUTH_ROUTES.dashboard
): string =>
  isPendingEmailVerification(user)
    ? AUTH_ROUTES.emailVerificationPending
    : fallbackRoute
