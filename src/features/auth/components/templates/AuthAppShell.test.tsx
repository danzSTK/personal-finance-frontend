import type { PropsWithChildren } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { api } from '../../api/auth.api'
import { AUTH_ROUTES, AUTH_USER_STATUS } from '../../constants/auth.constants'
import { useAuthStore } from '../../stores/auth.store'
import type { User } from '../../types'
import { AuthAppShell } from './AuthAppShell'

vi.mock('../../api/auth.api', () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
  },
}))

const mockUser: User = {
  id: 'user-1',
  email: 'user@danfy.com',
  userName: 'danfyuser',
  avatarUrl: null,
  firstName: 'Danfy',
  lastName: 'User',
  status: AUTH_USER_STATUS.active,
  createdAt: '2026-08-26T00:00:00.000Z',
  updatedAt: '2026-08-26T00:00:00.000Z',
  providers: [{ provider: 'EMAIL', linkedAt: '2026-08-26T00:00:00.000Z' }],
}

function LocationPathname() {
  const location = useLocation()
  return <div data-testid="location-pathname">{location.pathname}</div>
}

const renderShell = (
  activeSection: 'dashboard' | 'fiscal-notes' = 'dashboard',
  initialEntry = '/dashboard'
) => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })

  function Wrapper({ children }: PropsWithChildren) {
    return (
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={[initialEntry]}>
          <Routes>
            <Route
              path="*"
              element={
                <>
                  {children}
                  <LocationPathname />
                </>
              }
            />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>
    )
  }

  return render(
    <AuthAppShell
      activeSection={activeSection}
      title="Notas fiscais"
      subtitle="NFC-e e histórico de compras"
    >
      <div>Conteúdo da página</div>
    </AuthAppShell>,
    { wrapper: Wrapper }
  )
}

describe('AuthAppShell', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(api.get).mockResolvedValue({ data: mockUser })
    useAuthStore.setState({ user: mockUser, isAuthenticated: true })

    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      configurable: true,
      value: vi.fn().mockImplementation((query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    })
  })

  afterEach(() => {
    useAuthStore.setState({ user: null, isAuthenticated: false })
  })

  it('renderiza o item Notas fiscais na sidebar desktop e navega para /fiscal-notes', async () => {
    const user = userEvent.setup()
    renderShell('dashboard', AUTH_ROUTES.dashboard)

    const sidebarButton = screen.getByRole('button', { name: 'Notas fiscais' })
    expect(sidebarButton).toBeInTheDocument()
    expect(screen.getByText('NFC-e e compras')).toBeInTheDocument()

    await user.click(sidebarButton)

    expect(screen.getByTestId('location-pathname')).toHaveTextContent(
      AUTH_ROUTES.fiscalNotes
    )
  })

  it('mantém os 5 slots na barra mobile, destaca Mais quando activeSection é fiscal-notes e exibe Notas fiscais no topo do sheet Mais', async () => {
    const user = userEvent.setup()
    renderShell('fiscal-notes', AUTH_ROUTES.fiscalNotes)

    const mobileNav = screen.getByRole('navigation', {
      name: 'Navegação principal',
    })
    expect(
      within(mobileNav).getByRole('button', { name: 'Principal' })
    ).toBeInTheDocument()
    expect(
      within(mobileNav).getByRole('button', { name: 'Transações' })
    ).toBeInTheDocument()
    expect(
      within(mobileNav).getByRole('button', { name: 'Contas' })
    ).toBeInTheDocument()

    const moreButton = within(mobileNav).getByRole('button', { name: 'Mais' })
    expect(moreButton).toHaveAttribute('aria-current', 'page')

    await user.click(moreButton)

    const dialog = await screen.findByRole('dialog')
    const menuButtons = within(dialog).getAllByRole('button')
    const fiscalNotesMenuItem = within(dialog).getByRole('button', {
      name: /Notas fiscais/i,
    })
    const categoriesMenuItem = within(dialog).getByRole('button', {
      name: /Categorias/i,
    })

    expect(fiscalNotesMenuItem).toBeInTheDocument()
    expect(menuButtons.indexOf(fiscalNotesMenuItem)).toBeLessThan(
      menuButtons.indexOf(categoriesMenuItem)
    )
    expect(
      within(dialog).getByText('NFC-e e histórico de compras')
    ).toBeInTheDocument()
  })
})
