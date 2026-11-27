import type { PropsWithChildren } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import userEvent from '@testing-library/user-event'
import { render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { api } from '@/features/auth/api/auth.api'
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

  it('permite editar ADJUSTMENT com seletor de direção, motivo obrigatório e envio diff-only', async () => {
    const user = userEvent.setup()
    const onOpenChange = vi.fn()
    const mockAdjustment: Transaction = {
      id: 'adj-edit-1',
      accountId: 'acc-1',
      destinationAccountId: null,
      categoryId: 'tech-adj',
      type: 'ADJUSTMENT',
      status: 'EFFECTIVE',
      amountCents: 15000,
      date: '2026-11-25',
      effectiveAt: '2026-11-25T12:00:00.000Z',
      description: 'Reajuste inicial',
      direction: 'INCREASE',
      attachmentsCount: 0,
      createdAt: '2026-11-25T12:00:00.000Z',
      updatedAt: '2026-11-25T12:00:00.000Z',
    }

    vi.mocked(api.patch).mockResolvedValueOnce({
      data: {
        ...mockAdjustment,
        direction: 'DECREASE',
        description: 'Motivo atualizado',
      },
    })

    render(
      <TransactionFormSheet
        state={{ mode: 'edit', transaction: mockAdjustment }}
        accounts={[
          {
            object: 'account.item',
            id: 'acc-1',
            name: 'Conta principal',
            type: 'BANK',
            initialBalanceCents: 100000,
            templateId: null,
            template: null,
            color: null,
            icon: null,
            includeInTotal: true,
            isDefault: true,
            isArchived: false,
            balance: { currentCents: 100000 },
            createdAt: '2026-11-01T10:00:00.000Z',
            updatedAt: '2026-11-01T10:00:00.000Z',
          },
        ]}
        categories={[]}
        onOpenChange={onOpenChange}
      />,
      { wrapper: createWrapper() }
    )

    expect(screen.getByText('Editar ajuste')).toBeInTheDocument()
    expect(screen.queryByText('Categoria')).not.toBeInTheDocument()
    expect(screen.queryByText('Comprovantes')).not.toBeInTheDocument()

    const reasonInput = screen.getByLabelText('Motivo')
    await user.clear(reasonInput)
    await user.click(screen.getByRole('button', { name: 'Salvar alterações' }))
    expect(
      await screen.findByText('Informe o motivo do ajuste.')
    ).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Redução (−)' }))
    await user.type(reasonInput, 'Motivo atualizado')
    await user.click(screen.getByRole('button', { name: 'Salvar alterações' }))

    await waitFor(() => {
      expect(api.patch).toHaveBeenCalledWith('/transactions/adj-edit-1', {
        direction: 'DECREASE',
        description: 'Motivo atualizado',
      })
      expect(onOpenChange).toHaveBeenCalledWith(false)
    })
  })

  it('preserva tipo Ajuste, título e seletor de direção na transição real de state null para edit de ADJUSTMENT', async () => {
    const user = userEvent.setup()
    const onOpenChange = vi.fn()
    const mockAdjustment: Transaction = {
      id: 'adj-reg-1',
      accountId: 'acc-1',
      destinationAccountId: null,
      categoryId: 'tech-adj',
      type: 'ADJUSTMENT',
      status: 'EFFECTIVE',
      amountCents: 20000,
      date: '2026-11-25',
      effectiveAt: '2026-11-25T12:00:00.000Z',
      description: 'Ajuste conferido',
      direction: 'INCREASE',
      attachmentsCount: 0,
      createdAt: '2026-11-25T12:00:00.000Z',
      updatedAt: '2026-11-25T12:00:00.000Z',
    }
    const accounts = [
      {
        object: 'account.item' as const,
        id: 'acc-1',
        name: 'Conta principal',
        type: 'BANK' as const,
        initialBalanceCents: 100000,
        templateId: null,
        template: null,
        color: null,
        icon: null,
        includeInTotal: true,
        isDefault: true,
        isArchived: false,
        balance: { currentCents: 100000 },
        createdAt: '2026-11-01T10:00:00.000Z',
        updatedAt: '2026-11-01T10:00:00.000Z',
      },
    ]

    vi.mocked(api.patch).mockResolvedValueOnce({
      data: {
        ...mockAdjustment,
        direction: 'DECREASE',
      },
    })

    const { rerender } = render(
      <TransactionFormSheet
        state={null}
        accounts={accounts}
        categories={[]}
        onOpenChange={onOpenChange}
      />,
      { wrapper: createWrapper() }
    )

    rerender(
      <TransactionFormSheet
        state={{ mode: 'edit', transaction: mockAdjustment }}
        accounts={accounts}
        categories={[]}
        onOpenChange={onOpenChange}
      />
    )

    expect(await screen.findByText('Editar ajuste')).toBeInTheDocument()
    expect(screen.getAllByRole('combobox')[0]).toHaveTextContent('Ajuste')
    expect(screen.getAllByRole('combobox')[0]).toBeDisabled()
    expect(screen.queryByText(/Invalid enum value/i)).not.toBeInTheDocument()
    expect(screen.queryByText('Categoria')).not.toBeInTheDocument()
    expect(screen.queryByText('Comprovantes')).not.toBeInTheDocument()

    const increaseButton = screen.getByRole('button', { name: 'Acréscimo (+)' })
    const decreaseButton = screen.getByRole('button', { name: 'Redução (−)' })
    expect(increaseButton).toHaveAttribute('aria-pressed', 'true')
    expect(decreaseButton).toHaveAttribute('aria-pressed', 'false')

    await user.click(decreaseButton)
    expect(decreaseButton).toHaveAttribute('aria-pressed', 'true')

    await user.click(screen.getByRole('button', { name: 'Salvar alterações' }))

    await waitFor(() => {
      expect(api.patch).toHaveBeenCalledWith('/transactions/adj-reg-1', {
        direction: 'DECREASE',
      })
      expect(onOpenChange).toHaveBeenCalledWith(false)
    })
  })

  it('exibe atalho Importar via NFC-e na criação de EXPENSE e fecha o formulário ao acionar', async () => {
    const user = userEvent.setup()
    const onOpenChange = vi.fn()
    const onImportFiscalNote = vi.fn()

    render(
      <TransactionFormSheet
        state={{ mode: 'create', type: 'EXPENSE' }}
        accounts={[]}
        categories={[]}
        onOpenChange={onOpenChange}
        onImportFiscalNote={onImportFiscalNote}
      />,
      { wrapper: createWrapper() }
    )

    const importButton = screen.getByRole('button', {
      name: 'Importar via NFC-e',
    })
    expect(importButton).toBeInTheDocument()

    await user.click(importButton)
    expect(onOpenChange).toHaveBeenCalledWith(false)
    expect(onImportFiscalNote).toHaveBeenCalledTimes(1)
  })

  it('não exibe atalho Importar via NFC-e para INCOME', () => {
    render(
      <TransactionFormSheet
        state={{ mode: 'create', type: 'INCOME' }}
        accounts={[]}
        categories={[]}
        onOpenChange={vi.fn()}
        onImportFiscalNote={vi.fn()}
      />,
      { wrapper: createWrapper() }
    )

    expect(
      screen.queryByRole('button', { name: 'Importar via NFC-e' })
    ).not.toBeInTheDocument()
  })

  it('bloqueia troca de type e exibe nota explicativa ao editar EXPENSE com hasFiscalNote true', () => {
    render(
      <TransactionFormSheet
        state={{
          mode: 'edit',
          transaction: { ...mockExpense, hasFiscalNote: true },
        }}
        accounts={[]}
        categories={[]}
        onOpenChange={vi.fn()}
      />,
      { wrapper: createWrapper() }
    )

    expect(screen.getAllByRole('combobox')[0]).toBeDisabled()
    expect(screen.getAllByRole('combobox')[0]).toHaveTextContent('Despesa')
    expect(
      screen.getByText(
        'Esta despesa possui NFC-e vinculada. Desvincule a nota antes de alterar o tipo.'
      )
    ).toBeInTheDocument()
  })
})
