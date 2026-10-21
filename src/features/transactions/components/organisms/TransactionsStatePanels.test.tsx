import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { TransactionsEmptyState } from './TransactionsStatePanels'

describe('TransactionsEmptyState', () => {
  it('mantém o tom no ícone e remove fundo e borda do contêiner', () => {
    const { container } = render(
      <TransactionsEmptyState
        view="EXPENSE"
        hasFilters={false}
        onClearFilters={() => undefined}
      />
    )

    const panel = container.firstElementChild
    const icon = panel?.querySelector('span')

    expect(
      screen.getByRole('heading', { name: 'Nenhuma despesa no período' })
    ).toBeInTheDocument()
    expect(panel).not.toHaveClass('border')
    expect(panel).not.toHaveClass('border-state-expense')
    expect(panel).not.toHaveClass('bg-state-expense/10')
    expect(icon).toHaveClass('bg-state-expense/10', 'text-state-expense')
  })
})
