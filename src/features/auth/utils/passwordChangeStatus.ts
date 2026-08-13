import type {
  PasswordChangeAvailability,
  PasswordChangeStatusResponse,
} from '../types'

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null

const parsePositiveInteger = (value: unknown): number | null => {
  if (typeof value === 'number') {
    return Number.isSafeInteger(value) && value > 0 ? value : null
  }

  if (typeof value !== 'string' || !/^\d+$/.test(value.trim())) {
    return null
  }

  const parsed = Number(value.trim())
  return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : null
}

export const parsePasswordChangeStatusResponse = (
  value: unknown
): PasswordChangeStatusResponse | null => {
  if (!isRecord(value)) {
    return null
  }

  if (
    value.object !== 'auth.password_change_status' ||
    typeof value.status !== 'boolean'
  ) {
    return null
  }

  return {
    object: value.object,
    status: value.status,
  }
}

export const buildPasswordChangeAvailability = ({
  response,
  retryAfterHeader,
  receivedAtMs = Date.now(),
}: {
  response: PasswordChangeStatusResponse
  retryAfterHeader: unknown
  receivedAtMs?: number
}): PasswordChangeAvailability => {
  if (response.status) {
    return {
      status: true,
      retryAfterSeconds: null,
      retryAtMs: null,
    }
  }

  const retryAfterSeconds = parsePositiveInteger(retryAfterHeader)

  return {
    status: false,
    retryAfterSeconds,
    retryAtMs:
      retryAfterSeconds === null
        ? null
        : receivedAtMs + retryAfterSeconds * 1000,
  }
}
