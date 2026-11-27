import { render, screen, within } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { CategoryFormSheet } from './CategoryFormSheet'

const mutationState = vi.hoisted(() => ({
  create: vi.fn(),
  update: vi.fn(),
  resetCreate: vi.fn(),
  resetUpdate: vi.fn(),
}))

vi.mock('../../api/mutations', () => ({
  useCreateCategory: () => ({
    mutate: mutationState.create,
    reset: mutationState.resetCreate,
    error: null,
    isPending: false,
  }),
  useUpdateCategory: () => ({
    mutate: mutationState.update,
    reset: mutationState.resetUpdate,
    error: null,
    isPending: false,
  }),
}))

vi.mock('../../api/queries', () => ({
  useCategoryMetadata: () => ({
    data: undefined,
  }),
}))

describe('CategoryFormSheet', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('mantém largura total no mobile/sm:max-w-xl e proporções uniformes no seletor de ícones', () => {
    render(
      <CategoryFormSheet
        state={{ mode: 'create', type: 'EXPENSE' }}
        onOpenChange={vi.fn()}
      />
    )

    const dialog = screen.getByRole('dialog')
    expect(dialog).toHaveAttribute('data-side', 'right')
    expect(dialog).toHaveClass('w-full', 'sm:max-w-xl')
    expect(dialog).not.toHaveClass('w-3/4', 'sm:max-w-sm')

    const creditCardButton = within(dialog).getByRole('button', {
      name: 'Cartão de crédito',
    })
    expect(creditCardButton).toHaveClass('h-11', 'w-full', 'min-w-0')
    expect(creditCardButton).not.toHaveClass('min-h-11')

    const labelSpan = within(creditCardButton).getByText('Cartão de crédito')
    expect(labelSpan).toHaveClass('min-w-0', 'truncate')

    const iconSvg = creditCardButton.querySelector('svg')
    expect(iconSvg).toHaveClass('h-4', 'w-4', 'shrink-0')

    const moreIconsButton = within(dialog).getByRole('button', {
      name: 'Mais ícones',
    })
    expect(moreIconsButton).toHaveClass('h-11', 'w-full')
    expect(moreIconsButton).not.toHaveClass('h-8', 'min-h-11')
  })
})
