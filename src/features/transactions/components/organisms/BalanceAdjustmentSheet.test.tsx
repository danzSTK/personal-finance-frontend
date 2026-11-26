import type { PropsWithChildren } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { Account } from '@/features/accounts'
import { ACCOUNT_QUERY_KEYS } from '@/features/accounts/constants/account.constants'
import { api } from '@/features/auth/api/auth.api'
import { getTodayDateOnly } from '@/shared/utils/dateOnly'
import { formatCurrencyFromCents } from '@/shared/utils/formatters'
import { BalanceAdjustmentSheet } from './BalanceAdjustmentSheet'

vi.mock('@/shared/hooks/use-mobile', () => ({
  useIsMobile: () => false,
}))

vi.mock('@/features/auth/api/auth.api', () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}))

const makeAccount = (overrides?: Partial<Account>): Account => ({
  object: 'account.item',
  id: 'acc-1',
  name: 'Conta Principal',
  type: 'BANK',
  color: null,
  icon: null,
  templateId: null,
  template: {
    object: 'account_template.item',
    id: 'tpl-1',
    name: 'Banco',
    type: 'CUSTOM',
    logoUrl: null,
    colorToken: 'emerald',
    iconKey: 'landmark',
    bankCode: null,
    ispb: null,
  },
  initialBalanceCents: 100000,
  balance: {
    currentCents: 100000,
    projectedCents: 100000,
    projectedUntil: getTodayDateOnly(),
  },
  includeInTotal: true,
  isDefault: true,
  isArchived: false,
  createdAt: '2026-11-01T10:00:00.000Z',
  updatedAt: '2026-11-01T10:00:00.000Z',
  ...overrides,
})

const createTestClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })

const renderWithClient = (
  ui: React.ReactElement,
  queryClient = createTestClient()
) => {
  const Wrapper = ({ children }: PropsWithChildren) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )

  return {
    queryClient,
    ...render(ui, { wrapper: Wrapper }),
  }
}

describe('BalanceAdjustmentSheet', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('calcula prévia de redução no modo target, envia POST /transactions/balance-adjustments e fecha o sheet', async () => {
    const user = userEvent.setup()
    const onOpenChange = vi.fn()
    const account = makeAccount()

    vi.mocked(api.post).mockResolvedValueOnce({
      data: {
        id: 'adj-1',
        accountId: account.id,
        destinationAccountId: null,
        categoryId: 'tech-adj',
        type: 'ADJUSTMENT',
        status: 'EFFECTIVE',
        amountCents: 50000,
        date: getTodayDateOnly(),
        effectiveAt: '2026-11-25T12:00:00.000Z',
        description: 'Reajuste de saldo',
        direction: 'DECREASE',
        createdAt: '2026-11-25T12:00:00.000Z',
        updatedAt: '2026-11-25T12:00:00.000Z',
      },
    })

    renderWithClient(
      <BalanceAdjustmentSheet
        state={{ account }}
        accounts={[account]}
        onOpenChange={onOpenChange}
      />
    )

    const input = screen.getByRole('textbox', { name: 'Novo saldo' })
    expect(screen.queryByText('Data')).not.toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: 'Hoje' })
    ).not.toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: 'Ontem' })
    ).not.toBeInTheDocument()

    await user.click(input)
    await user.keyboard('50000')

    expect(screen.getByText('Redução')).toBeInTheDocument()
    expect(screen.getByText('− R$ 500,00')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Aplicar reajuste' }))

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith(
        '/transactions/balance-adjustments',
        {
          accountId: 'acc-1',
          targetBalanceCents: 50000,
          date: getTodayDateOnly(),
          description: null,
        }
      )
      expect(onOpenChange).toHaveBeenCalledWith(false)
    })
  })

  it('aceita zero e valores negativos via botão inline +/− e teclas −/+ no modo target', async () => {
    const user = userEvent.setup()
    const account = makeAccount()

    vi.mocked(api.post).mockResolvedValue({
      data: {
        id: 'adj-2',
        accountId: account.id,
        destinationAccountId: null,
        categoryId: 'tech-adj',
        type: 'ADJUSTMENT',
        status: 'EFFECTIVE',
        amountCents: 125000,
        date: getTodayDateOnly(),
        effectiveAt: '2026-11-25T12:00:00.000Z',
        description: 'Reajuste de saldo',
        direction: 'DECREASE',
        createdAt: '2026-11-25T12:00:00.000Z',
        updatedAt: '2026-11-25T12:00:00.000Z',
      },
    })

    renderWithClient(
      <BalanceAdjustmentSheet
        state={{ account }}
        accounts={[account]}
        onOpenChange={vi.fn()}
      />
    )

    const input = screen.getByRole('textbox', { name: 'Novo saldo' })
    const toggleSignButton = screen.getByRole('button', {
      name: 'Alternar sinal do novo saldo',
    })

    expect(toggleSignButton).toHaveAttribute('aria-pressed', 'false')
    expect(input).toHaveAttribute('placeholder', 'R$ 0,00')

    await user.click(toggleSignButton)
    expect(toggleSignButton).toHaveAttribute('aria-pressed', 'true')
    expect(input).toHaveAttribute('placeholder', '-R$ 0,00')
    expect(input).toHaveFocus()

    await user.keyboard('25000')
    expect(input).toHaveValue(formatCurrencyFromCents(-25000))
    expect(screen.getByText('− R$ 1.250,00')).toBeInTheDocument()

    await user.click(toggleSignButton)
    expect(toggleSignButton).toHaveAttribute('aria-pressed', 'false')
    expect(input).toHaveValue(formatCurrencyFromCents(25000))
    expect(input).toHaveFocus()

    await user.keyboard('{Backspace}{Backspace}{Backspace}{Backspace}{Backspace}0')
    expect(input).toHaveValue(formatCurrencyFromCents(0))
    expect(screen.getByText('− R$ 1.000,00')).toBeInTheDocument()

    await user.keyboard('-25000')
    expect(toggleSignButton).toHaveAttribute('aria-pressed', 'true')
    expect(input).toHaveValue(formatCurrencyFromCents(-25000))
    expect(screen.getByText('− R$ 1.250,00')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Aplicar reajuste' }))

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith(
        '/transactions/balance-adjustments',
        expect.objectContaining({
          targetBalanceCents: -25000,
          date: getTodayDateOnly(),
        })
      )
    })
  })

  it('bloqueia envio quando saldo informado é igual ao atual e trata 409 BALANCE_ADJUSTMENT_NO_DIFFERENCE invalidando accounts', async () => {
    const user = userEvent.setup()
    const queryClient = createTestClient()
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')
    const account = makeAccount({
      balance: {
        currentCents: 100000,
        projectedCents: 120000,
        projectedUntil: getTodayDateOnly(),
      },
    })

    renderWithClient(
      <BalanceAdjustmentSheet
        state={{ account }}
        accounts={[account]}
        onOpenChange={vi.fn()}
      />,
      queryClient
    )

    expect(
      screen.queryByText(
        /Baseado no saldo atual efetivado\. Lançamentos pendentes não são alterados\./
      )
    ).not.toBeInTheDocument()

    const input = screen.getByRole('textbox', { name: 'Novo saldo' })
    await user.click(input)
    await user.keyboard('100000')

    expect(screen.getByText('Sem diferença no saldo')).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Aplicar reajuste' })
    ).toBeDisabled()

    await user.keyboard('0')
    vi.mocked(api.post).mockRejectedValueOnce({
      isAxiosError: true,
      response: {
        status: 409,
        data: {
          statusCode: 409,
          code: 'BALANCE_ADJUSTMENT_NO_DIFFERENCE',
          message: 'raw conflict message',
          path: '/transactions/balance-adjustments',
          timestamp: '2026-11-25T12:00:00.000Z',
          details: null,
        },
      },
    })

    await user.click(screen.getByRole('button', { name: 'Aplicar reajuste' }))

    expect(
      await screen.findByText('O saldo já está atualizado')
    ).toBeInTheDocument()
    expect(screen.queryByText('raw conflict message')).not.toBeInTheDocument()
    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: ACCOUNT_QUERY_KEYS.accounts,
      exact: false,
    })
  })

  it('alterna para modo manual, exige motivo e envia POST /transactions com type ADJUSTMENT sem categoryId', async () => {
    const user = userEvent.setup()
    const onOpenChange = vi.fn()
    const account = makeAccount()

    vi.mocked(api.post).mockResolvedValueOnce({
      data: {
        id: 'adj-manual-1',
        accountId: account.id,
        destinationAccountId: null,
        categoryId: 'tech-adj',
        type: 'ADJUSTMENT',
        status: 'EFFECTIVE',
        amountCents: 15000,
        date: getTodayDateOnly(),
        effectiveAt: '2026-11-25T12:00:00.000Z',
        description: 'Tarifa bancária retroativa',
        direction: 'DECREASE',
        createdAt: '2026-11-25T12:00:00.000Z',
        updatedAt: '2026-11-25T12:00:00.000Z',
      },
    })

    renderWithClient(
      <BalanceAdjustmentSheet
        state={{ account }}
        accounts={[account]}
        onOpenChange={onOpenChange}
      />
    )

    await user.click(
      screen.getByRole('tab', { name: 'Informar valor do ajuste' })
    )

    expect(screen.queryByText('Data')).not.toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: 'Hoje' })
    ).not.toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: 'Ontem' })
    ).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /Reduzir saldo/ }))
    const amountInput = screen.getByRole('textbox', {
      name: 'Valor do ajuste',
    })
    await user.click(amountInput)
    await user.keyboard('15000')

    expect(screen.getByText('R$ 850,00')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Registrar ajuste' }))
    expect(
      await screen.findByText('Informe o motivo do ajuste.')
    ).toBeInTheDocument()
    expect(api.post).not.toHaveBeenCalled()

    await user.type(
      screen.getByLabelText('Motivo'),
      'Tarifa bancária retroativa'
    )
    await user.click(screen.getByRole('button', { name: 'Registrar ajuste' }))

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith('/transactions', {
        accountId: 'acc-1',
        type: 'ADJUSTMENT',
        status: 'EFFECTIVE',
        amountCents: 15000,
        direction: 'DECREASE',
        date: getTodayDateOnly(),
        description: 'Tarifa bancária retroativa',
      })
      expect(onOpenChange).toHaveBeenCalledWith(false)
    })
  })

  it('aplica erros de campo (VALIDATION_ERROR) e preserva os dados digitados em falha de rede', async () => {
    const user = userEvent.setup()
    const account = makeAccount()

    vi.mocked(api.post).mockRejectedValueOnce({
      isAxiosError: true,
      response: {
        status: 400,
        data: {
          statusCode: 400,
          code: 'VALIDATION_ERROR',
          message: 'validation error',
          path: '/transactions/balance-adjustments',
          timestamp: '2026-11-25T12:00:00.000Z',
          details: {
            fields: [
              {
                field: 'targetBalanceCents',
                messages: ['Informe um novo saldo válido.'],
              },
            ],
          },
        },
      },
    })

    renderWithClient(
      <BalanceAdjustmentSheet
        state={{ account }}
        accounts={[account]}
        onOpenChange={vi.fn()}
      />
    )

    const input = screen.getByRole('textbox', { name: 'Novo saldo' })
    await user.click(input)
    await user.keyboard('75000')
    await user.type(
      screen.getByLabelText('Motivo (opcional)'),
      'Conferência mensal'
    )

    await user.click(screen.getByRole('button', { name: 'Aplicar reajuste' }))

    expect(
      await screen.findByText('Informe um novo saldo válido.')
    ).toBeInTheDocument()
    expect(input).toHaveValue(formatCurrencyFromCents(75000))
    expect(screen.getByLabelText('Motivo (opcional)')).toHaveValue(
      'Conferência mensal'
    )
  })

  it('mantém conta bloqueada e prévia estáveis durante a animação de fechamento após submit em /accounts', async () => {
    const user = userEvent.setup()
    const account = makeAccount()
    const updatedAccount = makeAccount({
      balance: {
        currentCents: 50000,
        projectedCents: 50000,
        projectedUntil: getTodayDateOnly(),
      },
    })
    const originalGetComputedStyle = window.getComputedStyle
    const getComputedStyleSpy = vi
      .spyOn(window, 'getComputedStyle')
      .mockImplementation((element, pseudoElt) => {
        const computed = originalGetComputedStyle(element, pseudoElt)
        return new Proxy(computed, {
          get(target, prop) {
            if (prop === 'animationName') {
              const stateAttr =
                element instanceof Element
                  ? element.getAttribute('data-state')
                  : null
              return stateAttr === 'closed' ? 'sheet-exit' : 'sheet-enter'
            }
            const value = Reflect.get(target, prop)
            return typeof value === 'function' ? value.bind(target) : value
          },
        })
      })

    try {
      const queryClient = createTestClient()
      const Wrapper = ({ children }: PropsWithChildren) => (
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      )

      const { rerender } = render(
        <BalanceAdjustmentSheet
          state={{ account }}
          accounts={[account]}
          onOpenChange={vi.fn()}
        />,
        { wrapper: Wrapper }
      )

      const input = screen.getByRole('textbox', { name: 'Novo saldo' })
      await user.click(input)
      await user.keyboard('50000')
      expect(screen.getByText('− R$ 500,00')).toBeInTheDocument()

      rerender(
        <BalanceAdjustmentSheet
          state={null}
          accounts={[updatedAccount]}
          onOpenChange={vi.fn()}
        />
      )

      expect(screen.getByText('Conta selecionada')).toBeInTheDocument()
      expect(screen.getByText('Conta Principal')).toBeInTheDocument()
      expect(
        screen.queryByText('Escolha uma conta')
      ).not.toBeInTheDocument()
      expect(
        screen.queryByText('Sem diferença no saldo')
      ).not.toBeInTheDocument()
      expect(screen.getByText('− R$ 500,00')).toBeInTheDocument()
    } finally {
      getComputedStyleSpy.mockRestore()
    }
  })
})
