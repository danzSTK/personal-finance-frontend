import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import type { FiscalNoteSummaryItem } from '../../types/fiscal-note.types'
import { FiscalNotesTable } from './FiscalNotesTable'

const sampleNotes: FiscalNoteSummaryItem[] = [
  {
    object: 'fiscal_note.summary',
    id: 'fn-1',
    transactionId: 'tx-1',
    accessKey: '23261003539462000250651030000760541443208785',
    sourceUf: '23',
    number: '76054',
    series: '103',
    issuedAt: '2026-10-25T14:35:00.000Z',
    issuerName: 'SUPERMERCADO CENTRAL LTDA',
    issuerCnpj: '03539462000250',
    grossAmountCents: 4590,
    discountAmountCents: 500,
    payableAmountCents: 4090,
    taxAmountCents: 612,
    itemsCount: 6,
    createdAt: '2026-10-25T14:40:00.000Z',
    updatedAt: '2026-10-25T14:40:00.000Z',
  },
  {
    object: 'fiscal_note.summary',
    id: 'fn-2',
    transactionId: 'tx-2',
    accessKey: '23261011222333000144650010000123451000012345',
    sourceUf: '23',
    number: '12345',
    series: '1',
    issuedAt: '2026-10-24T10:15:00.000Z',
    issuerName: 'PADARIA BOM DIA',
    issuerCnpj: '11222333000144',
    grossAmountCents: 1850,
    discountAmountCents: 0,
    payableAmountCents: 1850,
    taxAmountCents: 210,
    itemsCount: 1,
    createdAt: '2026-10-24T10:20:00.000Z',
    updatedAt: '2026-10-24T10:20:00.000Z',
  },
]

describe('FiscalNotesTable', () => {
  it('renderiza dados das notas e chama onSelectNote ao clicar na linha desktop', async () => {
    const user = userEvent.setup()
    const onSelectNote = vi.fn()

    render(
      <FiscalNotesTable
        notes={sampleNotes}
        onSelectNote={onSelectNote}
        onUnlinkNote={vi.fn()}
      />
    )

    const table = screen.getByRole('table')
    expect(
      within(table).getByText('SUPERMERCADO CENTRAL LTDA')
    ).toBeInTheDocument()
    expect(within(table).getByText('6 itens')).toBeInTheDocument()
    expect(within(table).getByText('1 item')).toBeInTheDocument()
    expect(
      within(table).getByText(/CNPJ 03\.539\.462\/0002-50/)
    ).toBeInTheDocument()

    const firstRow = within(table).getAllByRole('row')[1]
    if (!firstRow) {
      throw new Error('Expected first note row')
    }
    await user.click(firstRow)

    expect(onSelectNote).toHaveBeenCalledTimes(1)
    expect(onSelectNote).toHaveBeenCalledWith(sampleNotes[0])
  })

  it('bloqueia bubbling ao abrir menu de ações e dispara Ver despesa vinculada e Desvincular NFC-e', async () => {
    const user = userEvent.setup()
    const onSelectNote = vi.fn()
    const onOpenTransaction = vi.fn()
    const onUnlinkNote = vi.fn()

    render(
      <FiscalNotesTable
        notes={sampleNotes}
        onSelectNote={onSelectNote}
        onOpenTransaction={onOpenTransaction}
        onUnlinkNote={onUnlinkNote}
      />
    )

    const actionButtons = screen.getAllByRole('button', {
      name: 'Abrir ações de SUPERMERCADO CENTRAL LTDA',
    })
    const desktopActionButton = actionButtons[0]
    if (!desktopActionButton) {
      throw new Error('Expected action menu button')
    }

    await user.click(desktopActionButton)
    expect(onSelectNote).not.toHaveBeenCalled()

    await user.click(
      screen.getByRole('menuitem', { name: 'Ver despesa vinculada' })
    )
    expect(onOpenTransaction).toHaveBeenCalledWith('tx-1')
    expect(onSelectNote).not.toHaveBeenCalled()

    await user.click(desktopActionButton)
    await user.click(
      screen.getByRole('menuitem', { name: 'Desvincular NFC-e' })
    )
    expect(onUnlinkNote).toHaveBeenCalledWith(sampleNotes[0])
    expect(onSelectNote).not.toHaveBeenCalled()
  })
})
