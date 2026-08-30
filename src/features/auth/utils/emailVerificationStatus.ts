import type {
  EmailVerificationResendAvailability,
  EmailVerificationResendStatusResponse,
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

const parseNullableString = (value: unknown): string | null =>
  typeof value === 'string' ? value : null

export const parseEmailVerificationResendStatusResponse = (
  value: unknown
): EmailVerificationResendStatusResponse | null => {
  if (!isRecord(value)) {
    return null
  }

  if (
    value.object === 'email_verification.resend_status.available' &&
    value.status === 'AVAILABLE' &&
    value.available === true
  ) {
    if (
      typeof value.manualResendsUsed !== 'number' ||
      typeof value.manualResendsRemaining !== 'number' ||
      typeof value.manualResendLimit !== 'number' ||
      typeof value.windowSeconds !== 'number'
    ) {
      return null
    }

    return {
      object: 'email_verification.resend_status.available',
      status: 'AVAILABLE',
      available: true,
      manualResendsUsed: value.manualResendsUsed,
      manualResendsRemaining: value.manualResendsRemaining,
      manualResendLimit: value.manualResendLimit,
      windowSeconds: value.windowSeconds,
      lastLogicalSendAt: parseNullableString(value.lastLogicalSendAt),
    }
  }

  if (
    value.object === 'email_verification.resend_status.blocked' &&
    value.status === 'BLOCKED' &&
    value.available === false
  ) {
    return {
      object: 'email_verification.resend_status.blocked',
      status: 'BLOCKED',
      available: false,
      blockedBy:
        typeof value.blockedBy === 'string' ? value.blockedBy : undefined,
      retryAfterSeconds:
        typeof value.retryAfterSeconds === 'number'
          ? value.retryAfterSeconds
          : (parsePositiveInteger(value.retryAfterSeconds) ?? undefined),
      manualResendsUsed:
        typeof value.manualResendsUsed === 'number'
          ? value.manualResendsUsed
          : 0,
      manualResendsRemaining:
        typeof value.manualResendsRemaining === 'number'
          ? value.manualResendsRemaining
          : 0,
      manualResendLimit:
        typeof value.manualResendLimit === 'number'
          ? value.manualResendLimit
          : 0,
      windowSeconds:
        typeof value.windowSeconds === 'number' ? value.windowSeconds : 0,
      lastLogicalSendAt: parseNullableString(value.lastLogicalSendAt),
    }
  }

  if (
    value.object === 'email_verification.resend_status.already_verified' &&
    value.status === 'ALREADY_VERIFIED' &&
    value.available === false
  ) {
    return {
      object: 'email_verification.resend_status.already_verified',
      status: 'ALREADY_VERIFIED',
      available: false,
    }
  }

  return null
}

export const buildEmailVerificationResendAvailability = ({
  response,
  retryAfterHeader,
  receivedAtMs = Date.now(),
}: {
  response: EmailVerificationResendStatusResponse
  retryAfterHeader: unknown
  receivedAtMs?: number
}): EmailVerificationResendAvailability => {
  if (response.status === 'AVAILABLE') {
    return {
      status: 'AVAILABLE',
      available: true,
      retryAfterSeconds: null,
      retryAtMs: null,
      manualResendsUsed: response.manualResendsUsed,
      manualResendsRemaining: response.manualResendsRemaining,
      manualResendLimit: response.manualResendLimit,
    }
  }

  if (response.status === 'ALREADY_VERIFIED') {
    return {
      status: 'ALREADY_VERIFIED',
      available: false,
      retryAfterSeconds: null,
      retryAtMs: null,
    }
  }

  const headerSeconds = parsePositiveInteger(retryAfterHeader)
  const bodySeconds = parsePositiveInteger(response.retryAfterSeconds)
  const retryAfterSeconds = headerSeconds ?? bodySeconds

  return {
    status: 'BLOCKED',
    available: false,
    blockedBy: response.blockedBy ?? null,
    retryAfterSeconds,
    retryAtMs:
      retryAfterSeconds === null
        ? null
        : receivedAtMs + retryAfterSeconds * 1000,
    manualResendsUsed: response.manualResendsUsed ?? null,
    manualResendsRemaining: response.manualResendsRemaining ?? null,
    manualResendLimit: response.manualResendLimit ?? null,
  }
}
