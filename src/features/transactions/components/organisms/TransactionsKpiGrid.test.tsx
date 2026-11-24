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
  it('renderiza os 4 cards da visão geral em trilha horizontal limitada sem w-max', () => {
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

    const track = screen.getByTestId('transactions-kpi-track')
    expect(track).toHaveClass('flex', 'w-full', 'min-w-0', 'max-w-full', 'overflow-x-auto')
    expect(track).not.toHaveClass('grid-cols-2')
    expect(container.querySelector('.w-max')).toBeNull()
  })

  it.each([
    ['EXPENSE', 'Despesas pendentes', 'Despesas pagas', 'Total'],
    ['INCOME', 'Receitas pendentes', 'Receitas recebidas', 'Total'],
    [
      'TRANSFER',
      'Transferências pendentes',
      'Transferências efetivadas',
      'Total movimentado',
    ],
  ] as const)(
    'renderiza os 3 cards do resumo de %s em trilha horizontal limitada',
    (view, pendingLabel, effectiveLabel, totalLabel) => {
      const { container } = render(
        <TransactionsKpiGrid response={typeExpenseResponse} view={view} />
      )

      expect(screen.getByText(pendingLabel)).toBeInTheDocument()
      expect(screen.getByText(effectiveLabel)).toBeInTheDocument()
      expect(screen.getByText(totalLabel)).toBeInTheDocument()

      const track = screen.getByTestId('transactions-kpi-track')
      expect(track).toHaveClass(
        'flex',
        'w-full',
        'min-w-0',
        'max-w-full',
        'overflow-x-auto'
      )
      expect(track).not.toHaveClass('grid-cols-2')
      expect(container.querySelector('.w-max')).toBeNull()
    }
  )
})
