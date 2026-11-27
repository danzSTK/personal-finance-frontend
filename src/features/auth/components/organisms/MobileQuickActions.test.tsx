import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { AUTH_QUICK_ACTION_ROUTES } from '../../constants/auth.constants'
import { MobileQuickActions } from './MobileQuickActions'

describe('MobileQuickActions', () => {
  beforeEach(() => {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      configurable: true,
      value: vi.fn().mockImplementation((query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    })
  })

  it('define rota de atalho para leitor de NFC-e', () => {
    expect(AUTH_QUICK_ACTION_ROUTES.fiscalNote).toBe(
      '/transactions?view=EXPENSE&create=FISCAL_NOTE'
    )
  })

  it('exibe o botão Ler NFC-e no centro da 2ª linha e dispara onImportFiscalNote fechando o menu', async () => {
    const user = userEvent.setup()
    const onOpenChange = vi.fn()
    const onImportFiscalNote = vi.fn()

    render(
      <MobileQuickActions
        open
        onOpenChange={onOpenChange}
        onCreateIncome={vi.fn()}
        onCreateExpense={vi.fn()}
        onCreateTransfer={vi.fn()}
        onImportFiscalNote={onImportFiscalNote}
        onCreateCategory={vi.fn()}
      />
    )

    const fiscalNoteButton = screen.getByRole('menuitem', {
      name: 'Ler NFC-e',
    })
    expect(fiscalNoteButton).toBeInTheDocument()
    expect(fiscalNoteButton).toHaveClass(
      'col-span-2',
      'col-start-3',
      'row-start-2'
    )

    await user.click(fiscalNoteButton)

    expect(onOpenChange).toHaveBeenCalledWith(false)
    expect(onImportFiscalNote).toHaveBeenCalledTimes(1)
  })
})
