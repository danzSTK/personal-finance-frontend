import { describe, expect, it } from 'vitest'
import {
  buildEmailVerificationResendAvailability,
  parseEmailVerificationResendStatusResponse,
} from './emailVerificationStatus'

describe('email verification resend status contract', () => {
  it('faz parse do status AVAILABLE corretamente', () => {
    const raw = {
      object: 'email_verification.resend_status.available',
      status: 'AVAILABLE',
      available: true,
      manualResendsUsed: 2,
      manualResendsRemaining: 3,
      manualResendLimit: 5,
      windowSeconds: 86400,
      lastLogicalSendAt: '2026-08-26T03:00:00.000Z',
    }

    expect(parseEmailVerificationResendStatusResponse(raw)).toEqual(raw)
  })

  it('faz parse do status BLOCKED corretamente', () => {
    const raw = {
      object: 'email_verification.resend_status.blocked',
      status: 'BLOCKED',
      available: false,
      blockedBy: 'COOLDOWN',
      retryAfterSeconds: 91,
      manualResendsUsed: 2,
      manualResendsRemaining: 3,
      manualResendLimit: 5,
      windowSeconds: 86400,
      lastLogicalSendAt: '2026-08-26T03:00:00.000Z',
    }

    expect(parseEmailVerificationResendStatusResponse(raw)).toEqual(raw)
  })

  it('faz parse do status ALREADY_VERIFIED corretamente', () => {
    const raw = {
      object: 'email_verification.resend_status.already_verified',
      status: 'ALREADY_VERIFIED',
      available: false,
    }

    expect(parseEmailVerificationResendStatusResponse(raw)).toEqual(raw)
  })

  it('rejeita payloads inválidos ou desconhecidos', () => {
    expect(parseEmailVerificationResendStatusResponse(null)).toBeNull()
    expect(parseEmailVerificationResendStatusResponse({})).toBeNull()
    expect(
      parseEmailVerificationResendStatusResponse({
        object: 'email_verification.resend_status.unknown',
        status: 'AVAILABLE',
      })
    ).toBeNull()
    expect(
      parseEmailVerificationResendStatusResponse({
        object: 'email_verification.resend_status.available',
        status: 'AVAILABLE',
        available: false,
      })
    ).toBeNull()
  })

  it('constrói disponibilidade para status AVAILABLE sem prazo', () => {
    const availability = buildEmailVerificationResendAvailability({
      response: {
        object: 'email_verification.resend_status.available',
        status: 'AVAILABLE',
        available: true,
        manualResendsUsed: 1,
        manualResendsRemaining: 4,
        manualResendLimit: 5,
        windowSeconds: 86400,
        lastLogicalSendAt: null,
      },
      retryAfterHeader: '120',
      receivedAtMs: 1000,
    })

    expect(availability).toEqual({
      status: 'AVAILABLE',
      available: true,
      retryAfterSeconds: null,
      retryAtMs: null,
      manualResendsUsed: 1,
      manualResendsRemaining: 4,
      manualResendLimit: 5,
    })
  })

  it('constrói disponibilidade para status ALREADY_VERIFIED sem prazo', () => {
    const availability = buildEmailVerificationResendAvailability({
      response: {
        object: 'email_verification.resend_status.already_verified',
        status: 'ALREADY_VERIFIED',
        available: false,
      },
      retryAfterHeader: null,
    })

    expect(availability).toEqual({
      status: 'ALREADY_VERIFIED',
      available: false,
      retryAfterSeconds: null,
      retryAtMs: null,
    })
  })

  it('calcula retryAtMs para status BLOCKED a partir do header Retry-After', () => {
    const availability = buildEmailVerificationResendAvailability({
      response: {
        object: 'email_verification.resend_status.blocked',
        status: 'BLOCKED',
        available: false,
        blockedBy: 'COOLDOWN',
        retryAfterSeconds: 91,
        manualResendsUsed: 2,
        manualResendsRemaining: 3,
        manualResendLimit: 5,
        windowSeconds: 86400,
        lastLogicalSendAt: null,
      },
      retryAfterHeader: '91',
      receivedAtMs: 10_000,
    })

    expect(availability).toEqual({
      status: 'BLOCKED',
      available: false,
      blockedBy: 'COOLDOWN',
      retryAfterSeconds: 91,
      retryAtMs: 101_000,
      manualResendsUsed: 2,
      manualResendsRemaining: 3,
      manualResendLimit: 5,
    })
  })

  it('usa retryAfterSeconds do body caso o header esteja ausente ou inválido', () => {
    const availability = buildEmailVerificationResendAvailability({
      response: {
        object: 'email_verification.resend_status.blocked',
        status: 'BLOCKED',
        available: false,
        blockedBy: 'DAILY_LIMIT',
        retryAfterSeconds: 3600,
        manualResendsUsed: 5,
        manualResendsRemaining: 0,
        manualResendLimit: 5,
        windowSeconds: 86400,
        lastLogicalSendAt: null,
      },
      retryAfterHeader: 'invalid',
      receivedAtMs: 5_000,
    })

    expect(availability).toEqual({
      status: 'BLOCKED',
      available: false,
      blockedBy: 'DAILY_LIMIT',
      retryAfterSeconds: 3600,
      retryAtMs: 3_605_000,
      manualResendsUsed: 5,
      manualResendsRemaining: 0,
      manualResendLimit: 5,
    })
  })
})
