import type { PropsWithChildren } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { api } from '../../api/auth.api'
import { AUTH_API_ENDPOINTS, AUTH_USER_STATUS } from '../../constants/auth.constants'
import { useAuthStore } from '../../stores/auth.store'
import type { User } from '../../types'
import { PendingEmailVerificationPage } from './PendingEmailVerificationPage'

vi.mock('../../api/auth.api', () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
  },
}))

const mockPendingUser: User = {
  id: 'user-123',
  email: 'pending@danfy.com',
  userName: 'pendinguser',
  avatarUrl: null,
  firstName: 'Pending',
  lastName: 'User',
  status: AUTH_USER_STATUS.pendingEmailVerification,
  createdAt: '2026-08-26T00:00:00.000Z',
  updatedAt: '2026-08-26T00:00:00.000Z',
  providers: [{ provider: 'EMAIL', linkedAt: '2026-08-26T00:00:00.000Z' }],
}

const mockActiveUser: User = {
  ...mockPendingUser,
  status: AUTH_USER_STATUS.active,
}

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })

  return ({ children }: PropsWithChildren) => (
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={['/email-verification-pending']}>
        <Routes>
          <Route
            path="/email-verification-pending"
            element={children}
          />
          <Route path="/dashboard" element={<div>Dashboard Page</div>} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>
  )
}

describe('PendingEmailVerificationPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.spyOn(Date, 'now').mockReturnValue(
      new Date('2026-08-26T12:00:00.000Z').getTime()
    )
    useAuthStore.setState({
      user: mockPendingUser,
      isAuthenticated: true,
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
    useAuthStore.setState({ user: null, isAuthenticated: false })
  })

  it('inicia o contador a partir do Retry-After quando status for BLOCKED na entrada', async () => {
    vi.mocked(api.get).mockImplementation((url) => {
      if (url === AUTH_API_ENDPOINTS.emailVerificationResendStatus) {
        return Promise.resolve({
          data: {
            object: 'email_verification.resend_status.blocked',
            status: 'BLOCKED',
            available: false,
            blockedBy: 'COOLDOWN',
            retryAfterSeconds: 90,
            manualResendsUsed: 1,
            manualResendsRemaining: 4,
            manualResendLimit: 5,
            windowSeconds: 86400,
            lastLogicalSendAt: null,
          },
          headers: { 'retry-after': '90' },
        })
      }
      return Promise.reject(new Error(`Unhandled URL: ${url}`))
    })

    const Wrapper = createWrapper()
    render(
      <Wrapper>
        <PendingEmailVerificationPage />
      </Wrapper>
    )

    expect(
      screen.getByRole('heading', {
        name: 'Confirme sua identidade pelo email',
      })
    ).toBeInTheDocument()

    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: /aguarde 2 min/i })
      ).toBeDisabled()
    })
  })

  it('redireciona automaticamente para o dashboard quando status for ALREADY_VERIFIED', async () => {
    vi.mocked(api.get).mockImplementation((url) => {
      if (url === AUTH_API_ENDPOINTS.emailVerificationResendStatus) {
        return Promise.resolve({
          data: {
            object: 'email_verification.resend_status.already_verified',
            status: 'ALREADY_VERIFIED',
            available: false,
          },
          headers: {},
        })
      }
      if (url === AUTH_API_ENDPOINTS.me) {
        return Promise.resolve({
          data: mockActiveUser,
          headers: {},
        })
      }
      return Promise.reject(new Error(`Unhandled URL: ${url}`))
    })

    const Wrapper = createWrapper()
    render(
      <Wrapper>
        <PendingEmailVerificationPage />
      </Wrapper>
    )

    await waitFor(() => {
      expect(screen.getByText('Dashboard Page')).toBeInTheDocument()
    })
  })

  it('permite reenvio quando AVAILABLE e atualiza estado para enfileirado', async () => {
    const user = userEvent.setup()

    vi.mocked(api.get).mockImplementation((url) => {
      if (url === AUTH_API_ENDPOINTS.emailVerificationResendStatus) {
        return Promise.resolve({
          data: {
            object: 'email_verification.resend_status.available',
            status: 'AVAILABLE',
            available: true,
            manualResendsUsed: 0,
            manualResendsRemaining: 5,
            manualResendLimit: 5,
            windowSeconds: 86400,
            lastLogicalSendAt: null,
          },
          headers: {},
        })
      }
      return Promise.reject(new Error(`Unhandled URL: ${url}`))
    })

    vi.mocked(api.post).mockImplementation((url) => {
      if (url === AUTH_API_ENDPOINTS.emailVerificationResend) {
        return Promise.resolve({
          data: {
            object: 'email_verification.resend',
            status: 'QUEUED',
          },
          headers: {},
        })
      }
      return Promise.reject(new Error(`Unhandled URL: ${url}`))
    })

    const Wrapper = createWrapper()
    render(
      <Wrapper>
        <PendingEmailVerificationPage />
      </Wrapper>
    )

    const resendButton = screen.getByRole('button', {
      name: /reenviar email/i,
    })
    expect(resendButton).toBeEnabled()

    await user.click(resendButton)

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith(
        AUTH_API_ENDPOINTS.emailVerificationResend,
        {}
      )
      expect(screen.getByText('Novo email enfileirado')).toBeInTheDocument()
    })
  })
})
