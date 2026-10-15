import type { PropsWithChildren } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { AUTH_API_ENDPOINTS } from '../constants/auth.constants'
import { api } from './auth.api'
import { useChangePassword } from './mutations'

vi.mock('./auth.api', () => ({
  api: {
    post: vi.fn(),
  },
}))

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { mutations: { retry: false } },
  })

  return ({ children }: PropsWithChildren) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}

describe('useChangePassword', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('envia somente o DTO documentado e aceita CHANGED', async () => {
    vi.mocked(api.post).mockResolvedValue({
      data: { object: 'auth.password_change', status: 'CHANGED' },
    })
    const { result } = renderHook(() => useChangePassword(), {
      wrapper: createWrapper(),
    })

    await act(async () => {
      await result.current.mutateAsync({
        currentPassword: 'secret1',
        newPassword: 'secret2',
      })
    })

    expect(api.post).toHaveBeenCalledTimes(1)
    expect(api.post).toHaveBeenCalledWith(AUTH_API_ENDPOINTS.passwordChange, {
      currentPassword: 'secret1',
      newPassword: 'secret2',
    })
  })

  it('não trata payload inesperado como sucesso', async () => {
    vi.mocked(api.post).mockResolvedValue({ data: { status: 'CHANGED' } })
    const { result } = renderHook(() => useChangePassword(), {
      wrapper: createWrapper(),
    })

    await expect(
      act(async () =>
        result.current.mutateAsync({
          currentPassword: 'secret1',
          newPassword: 'secret2',
        })
      )
    ).rejects.toThrow('Invalid change password response')
  })
})
