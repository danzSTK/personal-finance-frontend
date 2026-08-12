import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { SecuritySettings } from './SecuritySettings'

const authState = vi.hoisted(() => ({
  isLoading: false,
  providers: [] as Array<{
    provider: 'EMAIL' | 'GOOGLE' | 'APPLE'
    linkedAt: string
  }>,
}))

const mutationState = vi.hoisted(() => ({
  mutate: vi.fn(),
  reset: vi.fn(),
}))

vi.mock('../../api/queries', () => ({
  useUser: () => ({
    data: authState.isLoading
      ? undefined
      : {
          id: 'user-id',
          email: 'user@danfy.test',
          providers: authState.providers,
        },
    isLoading: authState.isLoading,
    error: null,
    refetch: vi.fn(),
  }),
  useSessions: () => ({
    data: [],
    isLoading: false,
    error: null,
    refetch: vi.fn(),
  }),
}))

vi.mock('../../api/mutations', () => ({
  useChangePassword: () => ({
    mutate: mutationState.mutate,
    reset: mutationState.reset,
    error: null,
    isPending: false,
  }),
  useLinkEmail: () => ({
    mutate: mutationState.mutate,
    error: null,
    isPending: false,
  }),
  useRevokeSession: () => ({
    mutate: mutationState.mutate,
  }),
}))

vi.mock('../../api/auth.api', () => ({
  api: { defaults: { baseURL: 'http://localhost:3000' } },
}))

const renderSecuritySettings = () => {
  const queryClient = new QueryClient()

  return render(
    <MemoryRouter>
      <QueryClientProvider client={queryClient}>
        <SecuritySettings />
      </QueryClientProvider>
    </MemoryRouter>
  )
}

describe('disponibilidade de alteração de senha', () => {
  beforeEach(() => {
    authState.isLoading = false
    authState.providers = []
    vi.clearAllMocks()
  })

  it('mostra a ação para provider EMAIL', () => {
    authState.providers = [
      { provider: 'EMAIL', linkedAt: '2026-08-12T12:00:00.000Z' },
    ]

    renderSecuritySettings()

    expect(
      screen.getByRole('button', { name: 'Alterar senha' })
    ).toBeInTheDocument()
  })

  it('mostra a ação para EMAIL e GOOGLE vinculados', () => {
    authState.providers = [
      { provider: 'EMAIL', linkedAt: '2026-08-12T12:00:00.000Z' },
      { provider: 'GOOGLE', linkedAt: '2026-08-12T12:00:00.000Z' },
    ]

    renderSecuritySettings()

    expect(
      screen.getByRole('button', { name: 'Alterar senha' })
    ).toBeInTheDocument()
  })

  it('não mostra a ação para conta somente GOOGLE', () => {
    authState.providers = [
      { provider: 'GOOGLE', linkedAt: '2026-08-12T12:00:00.000Z' },
    ]

    renderSecuritySettings()

    expect(
      screen.queryByRole('button', { name: 'Alterar senha' })
    ).not.toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Vincular email' })
    ).toBeInTheDocument()
  })

  it('não exibe ações de provider durante o carregamento', () => {
    authState.isLoading = true

    renderSecuritySettings()

    expect(screen.getByText('Sincronizando métodos...')).toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: 'Alterar senha' })
    ).not.toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: 'Vincular email' })
    ).not.toBeInTheDocument()
  })
})
