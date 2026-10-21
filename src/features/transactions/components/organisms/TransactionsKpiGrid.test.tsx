import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import type { TransactionListResponse } from '../../types/transaction.types'
import { TransactionsKpiGrid } from './TransactionsKpiGrid'

const overviewResponse: TransactionListResponse = {
  object: 'transaction.list',
  data: [],
  meta: {
    total: 0,
    page: 1,
    limit: 20,
    totalPages: 1,
    hasNextPage: false,
    hasPreviousPage: false,
  },
  summary: {
    object: 'transaction_summary.overview',
    balance: {
      pendingDeltaCents: 100000,
      expectedBalanceCents: 150000,
      effectiveDeltaCents: 50000,
    },
    income: {
      totalCents: 200000,
      pendingCents: 50000,
      effectiveCents: 150000,
    },
    expense: {
      totalCents: 80000,
      pendingCents: 20000,
      effectiveCents: 60000,
    },
  },
}

const typeExpenseResponse: TransactionListResponse = {
  object: 'transaction.list',
  data: [],
  meta: {
    total: 0,
    page: 1,
    limit: 20,
    totalPages: 1,
    hasNextPage: false,
    hasPreviousPage: false,
  },
  summary: {
    object: 'transaction_summary.type',
    pendingCents: 25000,
    effectiveCents: 75000,
    totalCents: 100000,
  },
}

describe('TransactionsKpiGrid', () => {
  it('renderiza os 4 cards da visão geral em grade responsiva sem trilha horizontal', () => {
    const { container } = render(
      <TransactionsKpiGrid
        response={overviewResponse}
        view="ALL"
        currentBalanceCents={500000}
      />
    )

    expect(screen.getByText('Saldo atual')).toBeInTheDocument()
    expect(screen.getByText('Receitas')).toBeInTheDocument()
    expect(screen.getByText('Despesas')).toBeInTheDocument()
    expect(screen.getByText('Balanço mensal')).toBeInTheDocument()

    const grid = container.firstElementChild
    expect(grid).toHaveClass('grid', 'grid-cols-2')
    expect(container.querySelector('.overflow-x-auto')).toBeNull()
    expect(container.querySelector('.w-max')).toBeNull()
  })

  it('renderiza os 3 cards do resumo de despesas com spans proporcionais', () => {
    const { container } = render(
      <TransactionsKpiGrid
        response={typeExpenseResponse}
        view="EXPENSE"
      />
    )

    expect(screen.getByText('Despesas pendentes')).toBeInTheDocument()
    expect(screen.getByText('Despesas pagas')).toBeInTheDocument()
    expect(screen.getByText('Total')).toBeInTheDocument()

    const grid = container.firstElementChild
    expect(grid).toHaveClass('grid', 'grid-cols-2')
    expect(container.querySelector('.overflow-x-auto')).toBeNull()
  })
})
