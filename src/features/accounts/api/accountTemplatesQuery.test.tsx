import type { PropsWithChildren } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { api } from '@/features/auth/api/auth.api'
import { ACCOUNT_API_ENDPOINTS } from '../constants/account.constants'
import type { AccountTemplate } from '../types/account.types'
import { useAccountTemplates } from './queries'

vi.mock('@/features/auth/api/auth.api', () => ({
  api: { get: vi.fn() },
}))

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })

  return ({ children }: PropsWithChildren) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}

const nubankTemplate: AccountTemplate = {
  object: 'account_template.item',
  id: '54066cca-075e-4300-923b-f5b36462aa1f',
  type: 'INSTITUTIONAL',
  name: 'Nubank',
  colorToken: 'nubank',
  iconKey: null,
  logoUrl: 'https://public.example/nubank.svg',
  bankCode: 260,
  ispb: '18236120',
}

describe('useAccountTemplates', () => {
  beforeEach(() => vi.clearAllMocks())

  it('consulta o catálogo institucional pelo endpoint dedicado', async () => {
    vi.mocked(api.get).mockResolvedValue({ data: [nubankTemplate] })

    const { result } = renderHook(() => useAccountTemplates(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(api.get).toHaveBeenCalledWith(ACCOUNT_API_ENDPOINTS.templates)
    expect(result.current.data).toEqual([nubankTemplate])
  })

  it('preserva catálogo vazio como estado válido', async () => {
    vi.mocked(api.get).mockResolvedValue({ data: [] })

    const { result } = renderHook(() => useAccountTemplates(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual([])
  })
})
