import type { PropsWithChildren } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { AUTH_API_ENDPOINTS } from '../constants/auth.constants'
import { useAuthStore } from '../stores/auth.store'
import { api } from './auth.api'
import { useEmailVerificationResendStatus } from './queries'

vi.mock('./auth.api', () => ({
  api: {
    get: vi.fn(),
  },
}))

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })

  return ({ children }: PropsWithChildren) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}

describe('useEmailVerificationResendStatus', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.spyOn(Date, 'now').mockReturnValue(
      new Date('2026-08-26T12:00:00.000Z').getTime()
    )
    useAuthStore.setState({ isAuthenticated: true })
  })

  afterEach(() => {
    vi.restoreAllMocks()
    useAuthStore.setState({ isAuthenticated: false })
  })

  it('retorna disponibilidade quando status for AVAILABLE', async () => {
    vi.mocked(api.get).mockResolvedValue({
      data: {
        object: 'email_verification.resend_status.available',
        status: 'AVAILABLE',
        available: true,
        manualResendsUsed: 1,
        manualResendsRemaining: 4,
        manualResendLimit: 5,
        windowSeconds: 86400,
        lastLogicalSendAt: null,
      },
      headers: {},
    })

    const { result } = renderHook(() => useEmailVerificationResendStatus(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(api.get).toHaveBeenCalledWith(
      AUTH_API_ENDPOINTS.emailVerificationResendStatus
    )
    expect(result.current.data).toEqual({
      status: 'AVAILABLE',
      available: true,
      retryAfterSeconds: null,
      retryAtMs: null,
      manualResendsUsed: 1,
      manualResendsRemaining: 4,
      manualResendLimit: 5,
    })
  })

  it('converte Retry-After e status BLOCKED em instante absoluto', async () => {
    vi.mocked(api.get).mockResolvedValue({
      data: {
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
      headers: { 'retry-after': '91' },
    })

    const { result } = renderHook(() => useEmailVerificationResendStatus(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(result.current.data).toEqual({
      status: 'BLOCKED',
      available: false,
      blockedBy: 'COOLDOWN',
      retryAfterSeconds: 91,
      retryAtMs: new Date('2026-08-26T12:01:31.000Z').getTime(),
      manualResendsUsed: 2,
      manualResendsRemaining: 3,
      manualResendLimit: 5,
    })
  })

  it('retorna ALREADY_VERIFIED para conta verificada', async () => {
    vi.mocked(api.get).mockResolvedValue({
      data: {
        object: 'email_verification.resend_status.already_verified',
        status: 'ALREADY_VERIFIED',
        available: false,
      },
      headers: {},
    })

    const { result } = renderHook(() => useEmailVerificationResendStatus(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(result.current.data).toEqual({
      status: 'ALREADY_VERIFIED',
      available: false,
      retryAfterSeconds: null,
      retryAtMs: null,
    })
  })

  it('falha para payload inválido', async () => {
    vi.mocked(api.get).mockResolvedValue({
      data: { invalid: true },
      headers: {},
    })

    const { result } = renderHook(() => useEmailVerificationResendStatus(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isError).toBe(true))
    expect(result.current.data).toBeUndefined()
  })
})
