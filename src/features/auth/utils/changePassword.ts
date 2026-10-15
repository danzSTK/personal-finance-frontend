import type { ChangePasswordResponse } from '../types'

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null

export const parseChangePasswordResponse = (
  value: unknown
): ChangePasswordResponse | null => {
  if (!isRecord(value)) {
    return null
  }

  if (value.object !== 'auth.password_change' || value.status !== 'CHANGED') {
    return null
  }

  return {
    object: value.object,
    status: value.status,
  }
}
