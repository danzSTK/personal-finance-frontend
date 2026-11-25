import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import type { Account } from '@/features/accounts/types/account.types'
import type { Category } from '@/features/categories/types/category.types'
import type { Transaction } from '../../types/transaction.types'
import { TransactionsTable } from './TransactionsTable'

const accounts: Account[] = [
  {
    object: 'account.item',
    id: 'acc-1',
    name: 'Conta principal',
    type: 'BANK',
    initialBalanceCents: 100000,
    templateId: null,
    template: null,
    color: '#2563EB',
    icon: 'wallet',
    includeInTotal: true,
    isDefault: true,
    isArchived: false,
    balance: { currentCents: 100000 },
    createdAt: '2026-10-01T10:00:00.000Z',
    updatedAt: '2026-10-01T10:00:00.000Z',
  },
  {
    object: 'account.item',
    id: 'acc-2',
    name: 'Reserva',
    type: 'INVESTMENT',
    initialBalanceCents: 50000,
    templateId: null,
    template: null,
    color: '#16A34A',
    icon: 'piggy-bank',
    includeInTotal: true,
    isDefault: false,
    isArchived: false,
    balance: { currentCents: 50000 },
    createdAt: '2026-10-01T10:00:00.000Z',
    updatedAt: '2026-10-01T10:00:00.000Z',
  },
]

const categories: Category[] = [
  {
    id: 'cat-1',
    name: 'Restaurante',
    displayName: 'Restaurante',
    description: null,
    type: 'EXPENSE',
    colorToken: 'amber',
    iconKey: 'utensils',
    isSystem: false,
    includeInReports: true,
    isArchived: false,
    archivedAt: null,
    sortOrder: 1,
    isEditable: true,
    isVisibleInManagement: true,
    createdAt: '2026-10-01T10:00:00.000Z',
    updatedAt: '2026-10-01T10:00:00.000Z',
  },
]

const transactions: Transaction[] = [
  {
    id: 'tx-1',
    accountId: 'acc-1',
    destinationAccountId: null,
    categoryId: 'cat-1',
    type: 'EXPENSE',
    status: 'PENDING',
    amountCents: 28000,
    date: '2026-11-29',
    effectiveAt: null,
    description: 'Jantar de aniversário',
    direction: null,
    attachmentsCount: 2,
    createdAt: '2026-11-20T12:00:00.000Z',
    updatedAt: '2026-11-20T12:00:00.000Z',
  },
  {
    id: 'tx-2',
    accountId: 'acc-1',
    destinationAccountId: 'acc-2',
    categoryId: '',
    type: 'TRANSFER',
    status: 'EFFECTIVE',
    amountCents: 50000,
    date: '2026-11-29',
    effectiveAt: '2026-11-29T14:00:00.000Z',
    description: 'Reserva mensal',
    direction: null,
    attachmentsCount: 0,
    createdAt: '2026-11-29T14:00:00.000Z',
    updatedAt: '2026-11-29T14:00:00.000Z',
  },
  {
    id: 'tx-3',
    accountId: 'acc-1',
    destinationAccountId: null,
    categoryId: 'cat-1',
    type: 'INCOME',
    status: 'EFFECTIVE',
    amountCents: 120000,
    date: '2026-11-25',
    effectiveAt: '2026-11-25T09:30:00.000Z',
    description: 'Freelance',
    direction: null,
    attachmentsCount: 0,
    createdAt: '2026-11-25T09:30:00.000Z',
    updatedAt: '2026-11-25T09:30:00.000Z',
  },
]

describe('TransactionsTable', () => {
  it('agrupa transações por dia com divisores padronizados em desktop e mobile', () => {
    render(
      <TransactionsTable
        transactions={transactions}
        accounts={accounts}
        categories={categories}
        isMutating={false}
        onConfirm={vi.fn()}
        onDelete={vi.fn()}
        onEdit={vi.fn()}
        onOpenDetails={vi.fn()}
      />
    )

    const nov29Dividers = screen.getAllByRole('separator', {
      name: 'Lançamentos de 29/11/2026',
    })
    const nov25Dividers = screen.getAllByRole('separator', {
      name: 'Lançamentos de 25/11/2026',
    })

    // 1 divisor no desktop + 1 divisor no mobile por dia único
    expect(nov29Dividers).toHaveLength(2)
    expect(nov25Dividers).toHaveLength(2)
  })

  it('exibe direção, sinal e cor corretos para transações ADJUSTMENT', () => {
    const adjustmentTransactions: Transaction[] = [
      {
        id: 'adj-inc',
        accountId: 'acc-1',
        destinationAccountId: null,
        categoryId: 'tech-adj',
        type: 'ADJUSTMENT',
        status: 'EFFECTIVE',
        amountCents: 25000,
        date: '2026-11-26',
        effectiveAt: '2026-11-26T10:00:00.000Z',
        description: 'Correção de saldo a maior',
        direction: 'INCREASE',
        attachmentsCount: 0,
        createdAt: '2026-11-26T10:00:00.000Z',
        updatedAt: '2026-11-26T10:00:00.000Z',
      },
      {
        id: 'adj-dec',
        accountId: 'acc-1',
        destinationAccountId: null,
        categoryId: 'tech-adj',
        type: 'ADJUSTMENT',
        status: 'EFFECTIVE',
        amountCents: 15000,
        date: '2026-11-26',
        effectiveAt: '2026-11-26T11:00:00.000Z',
        description: 'Tarifa esquecida',
        direction: 'DECREASE',
        attachmentsCount: 0,
        createdAt: '2026-11-26T11:00:00.000Z',
        updatedAt: '2026-11-26T11:00:00.000Z',
      },
    ]

    render(
      <TransactionsTable
        transactions={adjustmentTransactions}
        accounts={accounts}
        categories={categories}
        isMutating={false}
        onConfirm={vi.fn()}
        onDelete={vi.fn()}
        onEdit={vi.fn()}
        onOpenDetails={vi.fn()}
      />
    )

    expect(screen.getAllByText('Ajuste · Acréscimo').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Ajuste · Redução').length).toBeGreaterThan(0)
    expect(
      screen.getAllByText('+ R$ 250,00').every((el) =>
        el.className.includes('text-state-income')
      )
    ).toBe(true)
    expect(
      screen.getAllByText('− R$ 150,00').every((el) =>
        el.className.includes('text-state-expense')
      )
    ).toBe(true)
  })
})
