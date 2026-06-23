import type { User } from '../types'

type DisplayableUser = Pick<
  User,
  'firstName' | 'lastName' | 'userName' | 'email'
>

const FULL_NAME_FALLBACK = 'Usuário'

/**
 * Resolve a human-friendly display name for a user, preferring the full name
 * and falling back to username, email, then a neutral label. Centralized so the
 * sidebar, profile menu, and settings stay consistent.
 */
export const resolveUserFullName = (
  user: DisplayableUser | null | undefined,
  fallback: string = FULL_NAME_FALLBACK
): string => {
  const firstName = user?.firstName?.trim()
  const lastName = user?.lastName?.trim()

  if (firstName || lastName) {
    return [firstName, lastName].filter(Boolean).join(' ')
  }

  return user?.userName ?? user?.email ?? fallback
}

/** Two-letter initials from a display name, used for avatar fallbacks. */
export const getUserInitials = (name: string): string => {
  const words = name.trim().split(/\s+/).filter(Boolean)

  if (words.length === 0) {
    return ''
  }

  const first = words[0]?.[0] ?? ''
  const second = words[1]?.[0] ?? ''

  return `${first}${second}`.toUpperCase()
}
