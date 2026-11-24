import type { PropsWithChildren } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import type { Transaction } from '../../types/transaction.types'
import { TransactionFormSheet } from './TransactionFormSheet'

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
  effectiveAt: '2026-10-25T12:00:00.000Z',
  description: 'Jantar',
  direction: null,
  attachmentsCount: 0,
  createdAt: '2026-10-25T12:00:00.000Z',
  updatedAt: '2026-10-25T12:00:00.000Z',
}

describe('TransactionFormSheet', () => {
  it('renderiza seção de comprovantes na criação de despesa sem placeholder em breve', () => {
    render(
      <TransactionFormSheet
        state={{ mode: 'create', type: 'EXPENSE' }}
        accounts={[]}
        categories={[]}
        onOpenChange={vi.fn()}
      />,
      { wrapper: createWrapper() }
    )

    expect(screen.getByText('Comprovantes')).toBeInTheDocument()
    expect(screen.getByText('Adicionar')).toBeInTheDocument()
    expect(screen.queryByText(/em breve/i)).not.toBeInTheDocument()
  })

  it('renderiza galeria de comprovantes na edição de despesa sem placeholder em breve', async () => {
    render(
      <TransactionFormSheet
        state={{ mode: 'edit', transaction: mockExpense }}
        accounts={[]}
        categories={[]}
        onOpenChange={vi.fn()}
      />,
      { wrapper: createWrapper() }
    )

    expect(screen.getByText('Comprovantes')).toBeInTheDocument()
    expect(await screen.findByText('Adicionar')).toBeInTheDocument()
    expect(screen.queryByText(/em breve/i)).not.toBeInTheDocument()
  })

  it('não exibe comprovantes nem placeholder em breve para transferências', () => {
    render(
      <TransactionFormSheet
        state={{ mode: 'create', type: 'TRANSFER' }}
        accounts={[]}
        categories={[]}
        onOpenChange={vi.fn()}
      />,
      { wrapper: createWrapper() }
    )

    expect(screen.queryByText('Comprovantes')).not.toBeInTheDocument()
    expect(screen.queryByText(/em breve/i)).not.toBeInTheDocument()
  })
})
