import type { PropsWithChildren } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { AUTH_API_ENDPOINTS } from '../constants/auth.constants'
import { useAuthStore } from '../stores/auth.store'
import { api } from './auth.api'
import { usePasswordChangeStatus } from './queries'

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

describe('usePasswordChangeStatus', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.spyOn(Date, 'now').mockReturnValue(
      new Date('2026-08-13T12:00:00.000Z').getTime()
    )
    useAuthStore.setState({ isAuthenticated: true })
  })

  afterEach(() => {
    vi.restoreAllMocks()
    useAuthStore.setState({ isAuthenticated: false })
  })

  it('retorna disponibilidade sem prazo', async () => {
    vi.mocked(api.get).mockResolvedValue({
      data: { object: 'auth.password_change_status', status: true },
      headers: {},
    })
    const { result } = renderHook(() => usePasswordChangeStatus(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(api.get).toHaveBeenCalledWith(
      AUTH_API_ENDPOINTS.passwordChangeStatus
    )
    expect(result.current.data).toEqual({
      status: true,
      retryAfterSeconds: null,
      retryAtMs: null,
    })
  })

  it('converte Retry-After em instante absoluto', async () => {
    vi.mocked(api.get).mockResolvedValue({
      data: { object: 'auth.password_change_status', status: false },
      headers: { 'retry-after': '60' },
    })
    const { result } = renderHook(() => usePasswordChangeStatus(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(result.current.data).toEqual({
      status: false,
      retryAfterSeconds: 60,
      retryAtMs: new Date('2026-08-13T12:01:00.000Z').getTime(),
    })
  })

  it('falha de forma fechada para payload inválido', async () => {
    vi.mocked(api.get).mockResolvedValue({
      data: { status: true },
      headers: {},
    })
    const { result } = renderHook(() => usePasswordChangeStatus(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isError).toBe(true))
    expect(result.current.data).toBeUndefined()
  })
})
