import type { PropsWithChildren } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { FiscalNoteDetail } from '@/features/fiscal-notes'
import { api as axiosApi } from '@/shared/config/axios'
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

vi.mock('@/shared/config/axios', () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
    delete: vi.fn(),
    patch: vi.fn(),
  },
}))

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false, retryDelay: 0 },
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

const mockFiscalNote: FiscalNoteDetail = {
  object: 'fiscal_note.item',
  id: 'fn-1',
  transactionId: 'tx-1',
  accessKey: '23261003539462000250651030000760541443208785',
  sourceUf: '23',
  number: '76054',
  series: '103',
  issuedAt: '2026-10-25T14:35:00.000Z',
  protocol: '223260000123456',
  issuerName: 'SUPERMERCADO CENTRAL LTDA',
  issuerCnpj: '03539462000250',
  issuerAddress: 'Av. Bezerra de Menezes, 1200, Fortaleza - CE',
  grossAmountCents: 4590,
  discountAmountCents: 500,
  payableAmountCents: 4090,
  taxAmountCents: 612,
  changeAmountCents: null,
  xmlVersion: '4.00',
  xsltVersion: null,
  parserVersion: '1.0.0',
  items: [
    {
      id: 'item-1',
      position: 1,
      rawDescription: 'Café Torrado 500g',
      storeCode: '00412',
      unit: 'UN',
      quantity: 2,
      unitPrice: 12.95,
      totalPriceCents: 2590,
    },
  ],
  payments: [
    {
      id: 'pay-1',
      position: 1,
      methodLabel: '17',
      amountCents: 4090,
    },
  ],
  createdAt: '2026-10-25T14:40:00.000Z',
  updatedAt: '2026-10-25T14:40:00.000Z',
}

describe('TransactionDetailsSheet', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

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

  it('busca a nota fiscal sob demanda quando hasFiscalNote é true e renderiza FiscalNoteSummaryCard', async () => {
    const user = userEvent.setup()
    const onViewFiscalNote = vi.fn()
    const onUnlinkFiscalNote = vi.fn()
    vi.mocked(axiosApi.get).mockResolvedValueOnce({ data: mockFiscalNote })

    const expenseWithNote: Transaction = {
      ...mockExpense,
      hasFiscalNote: true,
    }

    render(
      <TransactionDetailsSheet
        state={{ transaction: expenseWithNote }}
        accounts={[]}
        categories={[]}
        onOpenChange={vi.fn()}
        onConfirm={vi.fn()}
        onDelete={vi.fn()}
        onEdit={vi.fn()}
        onViewFiscalNote={onViewFiscalNote}
        onUnlinkFiscalNote={onUnlinkFiscalNote}
      />,
      { wrapper: createWrapper() }
    )

    expect(screen.getByText('Nota fiscal')).toBeInTheDocument()
    await waitFor(() => {
      expect(axiosApi.get).toHaveBeenCalledWith('/transactions/tx-1/fiscal-note')
    })

    expect(
      await screen.findByText('SUPERMERCADO CENTRAL LTDA')
    ).toBeInTheDocument()
    expect(screen.getByText('Café Torrado 500g')).toBeInTheDocument()

    await user.click(
      screen.getByRole('button', { name: /Ver lista completa \(1 item\)/i })
    )
    expect(onViewFiscalNote).toHaveBeenCalledWith(mockFiscalNote)

    await user.click(screen.getByRole('button', { name: 'Desvincular' }))
    expect(onUnlinkFiscalNote).toHaveBeenCalledWith(
      expenseWithNote,
      mockFiscalNote
    )
  })

  it('exibe ApiErrorAlert com Tentar novamente quando a busca da nota fiscal falha', async () => {
    const user = userEvent.setup()
    vi.mocked(axiosApi.get)
      .mockRejectedValueOnce(new Error('Network error'))
      .mockRejectedValueOnce(new Error('Network error'))
      .mockRejectedValueOnce(new Error('Network error'))
      .mockResolvedValueOnce({ data: mockFiscalNote })

    render(
      <TransactionDetailsSheet
        state={{ transaction: { ...mockExpense, hasFiscalNote: true } }}
        accounts={[]}
        categories={[]}
        onOpenChange={vi.fn()}
        onConfirm={vi.fn()}
        onDelete={vi.fn()}
        onEdit={vi.fn()}
      />,
      { wrapper: createWrapper() }
    )

    const retryButton = await screen.findByRole('button', {
      name: 'Tentar novamente',
    })
    await user.click(retryButton)

    expect(
      await screen.findByText('SUPERMERCADO CENTRAL LTDA')
    ).toBeInTheDocument()
  })

  it('exibe ação Vincular NFC-e para EXPENSE sem nota sem disparar busca da nota', async () => {
    const user = userEvent.setup()
    const onLinkFiscalNote = vi.fn()
    const expenseWithoutNote: Transaction = {
      ...mockExpense,
      hasFiscalNote: false,
    }

    render(
      <TransactionDetailsSheet
        state={{ transaction: expenseWithoutNote }}
        accounts={[]}
        categories={[]}
        onOpenChange={vi.fn()}
        onConfirm={vi.fn()}
        onDelete={vi.fn()}
        onEdit={vi.fn()}
        onLinkFiscalNote={onLinkFiscalNote}
      />,
      { wrapper: createWrapper() }
    )

    expect(screen.getByText('Nota fiscal')).toBeInTheDocument()
    expect(screen.getByText('Nenhuma NFC-e vinculada')).toBeInTheDocument()
    expect(axiosApi.get).not.toHaveBeenCalled()

    await user.click(screen.getByRole('button', { name: 'Vincular NFC-e' }))
    expect(onLinkFiscalNote).toHaveBeenCalledWith(expenseWithoutNote)
  })

  it('não exibe seção Nota fiscal para transações INCOME', () => {
    const mockIncome: Transaction = {
      ...mockExpense,
      id: 'inc-1',
      type: 'INCOME',
      description: 'Salário',
      hasFiscalNote: false,
    }

    render(
      <TransactionDetailsSheet
        state={{ transaction: mockIncome }}
        accounts={[]}
        categories={[]}
        onOpenChange={vi.fn()}
        onConfirm={vi.fn()}
        onDelete={vi.fn()}
        onEdit={vi.fn()}
      />,
      { wrapper: createWrapper() }
    )

    expect(screen.queryByText('Nota fiscal')).not.toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: 'Vincular NFC-e' })
    ).not.toBeInTheDocument()
  })
})
