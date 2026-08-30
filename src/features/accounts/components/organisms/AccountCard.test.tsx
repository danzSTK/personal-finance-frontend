import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest'
import type { Account } from '../../types/account.types'
import { AccountCard } from './AccountCard'

const queryState = vi.hoisted(() => ({
  enabledValues: [] as boolean[],
  params: [] as unknown[],
}))

vi.mock('@/features/transactions/api/queries', () => ({
  useTransactions: (params: unknown, options: { enabled?: boolean } = {}) => {
    queryState.params.push(params)
    queryState.enabledValues.push(options.enabled ?? true)

    return {
      data: {
        object: 'transaction.list',
        data: [],
        meta: {
          total: 0,
          page: 1,
          limit: 1,
          totalPages: 0,
          hasNextPage: false,
          hasPreviousPage: false,
        },
        summary: {
          object: 'transaction_summary.overview',
          income: {
            pendingCents: 0,
            effectiveCents: 30000,
            totalCents: 30000,
          },
          expense: {
            pendingCents: 0,
            effectiveCents: 15000,
            totalCents: 15000,
          },
          balance: {
            pendingDeltaCents: 0,
            effectiveDeltaCents: 15000,
            expectedBalanceCents: 15000,
          },
        },
      },
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    }
  },
}))

vi.mock('@/shared/hooks/use-mobile', () => ({ useIsMobile: () => true }))

const account: Account = {
  object: 'account.item',
  id: 'account-id',
  name: 'Conta principal',
  type: 'BANK',
  initialBalanceCents: 100050,
  templateId: null,
  template: null,
  color: 'purple',
  icon: 'bank',
  includeInTotal: true,
  isArchived: false,
  isDefault: true,
  balance: { currentCents: 115050, projectedCents: 120000 },
  createdAt: '2026-07-01T12:00:00.000Z',
  updatedAt: '2026-07-01T12:00:00.000Z',
}

describe('AccountCard details', () => {
  beforeAll(() => {
    vi.stubGlobal(
      'ResizeObserver',
      class ResizeObserverMock {
        observe() {}
        unobserve() {}
        disconnect() {}
      }
    )
  })

  afterAll(() => vi.unstubAllGlobals())

  beforeEach(() => {
    vi.clearAllMocks()
    queryState.enabledValues = []
    queryState.params = []
  })

  it('habilita o resumo somente ao abrir e navega pelo indicador do período', async () => {
    const user = userEvent.setup()
    const onViewPeriodTransactions = vi.fn()

    render(
      <AccountCard
        account={account}
        isMutating={false}
        selectedPeriod={{ year: 2026, month: 7 }}
        projectedBalanceLabel="Saldo no fim do período"
        onEdit={vi.fn()}
        onArchive={vi.fn()}
        onUnarchive={vi.fn()}
        onSetDefault={vi.fn()}
        onViewTransactions={vi.fn()}
        onViewPeriodTransactions={onViewPeriodTransactions}
      />
    )

    expect(queryState.enabledValues.at(-1)).toBe(false)

    const card = screen
      .getByText('Conta principal', { selector: 'h3' })
      .closest('article')
    expect(card).not.toBeNull()
    await user.click(card as HTMLElement)

    await waitFor(() => expect(queryState.enabledValues.at(-1)).toBe(true))
    expect(queryState.params.at(-1)).toMatchObject({
      accountId: 'account-id',
      status: 'EFFECTIVE',
      dateFrom: '2026-07-01',
      dateTo: '2026-07-31',
      limit: 1,
    })
    expect(screen.getByText('R$ 300,00')).toBeInTheDocument()
    expect(screen.getByText('R$ 150,00')).toBeInTheDocument()

    const incomeButton = screen.getByRole('button', {
      name: 'Ver receitas efetivadas de julho de 2026',
    })
    await user.hover(incomeButton)
    expect(await screen.findByRole('tooltip')).toHaveTextContent(
      'Total de receitas efetivadas em julho de 2026.'
    )

    await user.click(incomeButton)
    expect(onViewPeriodTransactions).toHaveBeenCalledWith('INCOME')
  })

  it('habilita a ação geral de ver transações', async () => {
    const user = userEvent.setup()
    const onViewTransactions = vi.fn()

    render(
      <AccountCard
        account={account}
        isMutating={false}
        selectedPeriod={{ year: 2026, month: 7 }}
        projectedBalanceLabel="Saldo no fim do período"
        onEdit={vi.fn()}
        onArchive={vi.fn()}
        onUnarchive={vi.fn()}
        onSetDefault={vi.fn()}
        onViewTransactions={onViewTransactions}
        onViewPeriodTransactions={vi.fn()}
      />
    )

    await user.click(
      screen.getByRole('button', { name: 'Abrir ações de Conta principal' })
    )
    await user.click(screen.getByRole('menuitem', { name: 'Ver transações' }))

    expect(onViewTransactions).toHaveBeenCalledOnce()
  })
})
