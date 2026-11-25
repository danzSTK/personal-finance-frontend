import type { PropsWithChildren } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import type { Transaction } from '../../types/transaction.types'
import { TransactionDetailsSheet } from './TransactionDetailsSheet'

vi.mock('@/shared/hooks/use-mobile', () => ({
  useIsMobile: () => false,
}))

vi.mock('@/features/auth/api/auth.api', () => ({
  api: {
    get: vi.fn().mockResolvedValue({ data: [] }),
    post: vi.fn(),
    delete: vi.fn(),
    patch: vi.fn(),
  },
}))

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })

  return ({ children }: PropsWithChildren) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}

const mockExpense: Transaction = {
  id: 'tx-1',
  accountId: 'acc-1',
  destinationAccountId: null,
  categoryId: 'cat-1',
  type: 'EXPENSE',
  status: 'EFFECTIVE',
  amountCents: 28000,
  date: '2026-10-25',
  effectiveAt: '2026-10-26T15:30:00.000Z',
  description: 'Jantar comemorativo',
  direction: null,
  attachmentsCount: 0,
  createdAt: '2026-10-20T12:15:00.000Z',
  updatedAt: '2026-10-26T15:30:00.000Z',
}

describe('TransactionDetailsSheet', () => {
  it('exibe data de criação no cabeçalho e data do pagamento nos detalhes sem repetir Paga em', () => {
    render(
      <TransactionDetailsSheet
        state={{ transaction: mockExpense }}
        accounts={[]}
        categories={[]}
        onOpenChange={vi.fn()}
        onConfirm={vi.fn()}
        onDelete={vi.fn()}
        onEdit={vi.fn()}
      />,
      { wrapper: createWrapper() }
    )

    expect(screen.getByText(/Despesa criada em/i)).toBeInTheDocument()
    expect(screen.getByText('Data do pagamento')).toBeInTheDocument()
    expect(screen.getByText('25/10/2026')).toBeInTheDocument()
    expect(screen.queryByText('Paga em')).not.toBeInTheDocument()
  })

  it('exibe direção, oculta comprovantes e habilita ações corretas para ADJUSTMENT pendente', () => {
    const mockPendingAdjustment: Transaction = {
      id: 'adj-1',
      accountId: 'acc-1',
      destinationAccountId: null,
      categoryId: 'tech-adj',
      type: 'ADJUSTMENT',
      status: 'PENDING',
      amountCents: 45000,
      date: '2026-11-25',
      effectiveAt: null,
      description: 'Ajuste previsto',
      direction: 'DECREASE',
      attachmentsCount: 0,
      createdAt: '2026-11-25T12:00:00.000Z',
      updatedAt: '2026-11-25T12:00:00.000Z',
    }

    render(
      <TransactionDetailsSheet
        state={{ transaction: mockPendingAdjustment }}
        accounts={[]}
        categories={[]}
        onOpenChange={vi.fn()}
        onConfirm={vi.fn()}
        onDelete={vi.fn()}
        onEdit={vi.fn()}
      />,
      { wrapper: createWrapper() }
    )

    expect(screen.getByText('Direção')).toBeInTheDocument()
    expect(screen.getByText('Redução no saldo')).toBeInTheDocument()
    expect(screen.getByText('− R$ 450,00')).toHaveClass('text-state-expense')
    expect(screen.queryByText('Comprovantes')).not.toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Confirmar ajuste' })
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Editar' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Excluir' })).toBeInTheDocument()
  })
})
