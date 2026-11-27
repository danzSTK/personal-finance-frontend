import type { PropsWithChildren } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { api } from '@/features/auth/api/auth.api'
import { FISCAL_NOTES_QUERY_KEYS } from '@/features/fiscal-notes'
import type { Transaction } from '../../types/transaction.types'
import { TransactionDeleteDialog } from './TransactionDeleteDialog'

vi.mock('@/features/auth/api/auth.api', () => ({
  api: {
    delete: vi.fn(),
  },
}))

const baseExpense: Transaction = {
  id: 'tx-del-1',
  accountId: 'acc-1',
  destinationAccountId: null,
  categoryId: 'cat-1',
  type: 'EXPENSE',
  status: 'EFFECTIVE',
  amountCents: 4500,
  date: '2026-11-26',
  effectiveAt: '2026-11-26T12:00:00.000Z',
  description: 'Supermercado',
  direction: null,
  hasFiscalNote: false,
  createdAt: '2026-11-26T12:00:00.000Z',
  updatedAt: '2026-11-26T12:00:00.000Z',
}

describe('TransactionDeleteDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('exibe aviso de remoção sincronizada da NFC-e quando hasFiscalNote é true', () => {
    const queryClient = new QueryClient()

    render(
      <QueryClientProvider client={queryClient}>
        <TransactionDeleteDialog
          state={{ transaction: { ...baseExpense, hasFiscalNote: true } }}
          onOpenChange={vi.fn()}
        />
      </QueryClientProvider>
    )

    expect(
      screen.getByText(
        /A NFC-e vinculada e sua lista de compras também serão removidas, e a chave de acesso ficará liberada para importação futura\./i
      )
    ).toBeInTheDocument()
  })

  it('não exibe aviso de NFC-e quando hasFiscalNote é false e remove cache da nota ao excluir', async () => {
    const user = userEvent.setup()
    const onOpenChange = vi.fn()
    const queryClient = new QueryClient({
      defaultOptions: { mutations: { retry: false } },
    })
    queryClient.setQueryData(
      FISCAL_NOTES_QUERY_KEYS.byTransaction('tx-del-1'),
      { id: 'fn-1' }
    )
    vi.mocked(api.delete).mockResolvedValueOnce({ data: undefined })

    const Wrapper = ({ children }: PropsWithChildren) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    )

    render(
      <Wrapper>
        <TransactionDeleteDialog
          state={{ transaction: baseExpense }}
          onOpenChange={onOpenChange}
        />
      </Wrapper>
    )

    expect(
      screen.queryByText(/NFC-e vinculada e sua lista de compras/i)
    ).not.toBeInTheDocument()

    await user.click(
      screen.getByRole('button', { name: 'Excluir definitivamente' })
    )

    await waitFor(() => {
      expect(api.delete).toHaveBeenCalledWith('/transactions/tx-del-1')
      expect(onOpenChange).toHaveBeenCalledWith(false)
    })

    expect(
      queryClient.getQueryData(
        FISCAL_NOTES_QUERY_KEYS.byTransaction('tx-del-1')
      )
    ).toBeUndefined()
  })
})
