import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  getCurrentYearMonth,
  getMonthEndDateOnly,
  getMonthStartDateOnly,
} from '@/shared/utils/dateOnly'
import {
  FiscalNotesFiltersSheet,
  type FiscalNotesFiltersDraft,
} from './FiscalNotesFiltersSheet'

vi.mock('@/shared/hooks/use-mobile', () => ({
  useIsMobile: () => false,
}))

const emptyDraft: FiscalNotesFiltersDraft = {
  issuedFrom: null,
  issuedTo: null,
  minAmountCents: null,
  maxAmountCents: null,
  issuerCnpj: null,
  sourceUf: null,
}

describe('FiscalNotesFiltersSheet', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('aplica preset Este mês e envia o intervalo DateOnly correspondente', async () => {
    const user = userEvent.setup()
    const onApply = vi.fn()
    const onOpenChange = vi.fn()
    const currentMonth = getCurrentYearMonth()

    render(
      <FiscalNotesFiltersSheet
        open
        filters={emptyDraft}
        onApply={onApply}
        onOpenChange={onOpenChange}
      />
    )

    await user.click(screen.getByRole('button', { name: 'Este mês' }))
    await user.click(screen.getByRole('button', { name: 'Aplicar filtros' }))

    expect(onApply).toHaveBeenCalledWith({
      ...emptyDraft,
      issuedFrom: getMonthStartDateOnly(currentMonth),
      issuedTo: getMonthEndDateOnly(currentMonth),
    })
    expect(onOpenChange).toHaveBeenCalledWith(false)
  })

  it('exibe erro quando a data inicial é posterior à data final e bloqueia aplicação', async () => {
    const user = userEvent.setup()
    const onApply = vi.fn()

    render(
      <FiscalNotesFiltersSheet
        open
        filters={{
          ...emptyDraft,
          issuedFrom: '2026-10-20',
          issuedTo: '2026-10-10',
        }}
        onApply={onApply}
        onOpenChange={vi.fn()}
      />
    )

    await user.click(screen.getByRole('button', { name: 'Aplicar filtros' }))

    expect(
      screen.getByText('A data inicial precisa ser anterior ou igual à final.')
    ).toBeInTheDocument()
    expect(onApply).not.toHaveBeenCalled()
  })

  it('valida faixa de valor quando mínimo é maior que máximo', async () => {
    const user = userEvent.setup()
    const onApply = vi.fn()

    render(
      <FiscalNotesFiltersSheet
        open
        filters={emptyDraft}
        onApply={onApply}
        onOpenChange={vi.fn()}
      />
    )

    const minInput = screen.getByLabelText('Valor mínimo')
    const maxInput = screen.getByLabelText('Valor máximo')

    await user.type(minInput, '5000')
    await user.type(maxInput, '1000')
    await user.click(screen.getByRole('button', { name: 'Aplicar filtros' }))

    expect(
      screen.getByText('O valor mínimo não pode ser maior que o valor máximo.')
    ).toBeInTheDocument()
    expect(onApply).not.toHaveBeenCalled()
  })

  it('valida CNPJ incompleto e normaliza para 14 dígitos quando válido', async () => {
    const user = userEvent.setup()
    const onApply = vi.fn()

    render(
      <FiscalNotesFiltersSheet
        open
        filters={emptyDraft}
        onApply={onApply}
        onOpenChange={vi.fn()}
      />
    )

    const cnpjField = screen.getByLabelText('CNPJ do emitente')
    await user.type(cnpjField, '035394')
    await user.click(screen.getByRole('button', { name: 'Aplicar filtros' }))

    expect(
      screen.getByText('Informe os 14 dígitos do CNPJ do emitente.')
    ).toBeInTheDocument()
    expect(onApply).not.toHaveBeenCalled()

    await user.clear(cnpjField)
    await user.type(cnpjField, '03539462000250')
    expect(cnpjField).toHaveValue('03.539.462/0002-50')

    await user.click(screen.getByRole('button', { name: 'Aplicar filtros' }))
    expect(onApply).toHaveBeenCalledWith({
      ...emptyDraft,
      issuerCnpj: '03539462000250',
    })
  })

  it('permite limpar todos os filtros aplicados pelo botão Limpar', async () => {
    const user = userEvent.setup()
    const onApply = vi.fn()
    const onOpenChange = vi.fn()

    render(
      <FiscalNotesFiltersSheet
        open
        filters={{
          issuedFrom: '2026-10-01',
          issuedTo: '2026-10-31',
          minAmountCents: 1000,
          maxAmountCents: 5000,
          issuerCnpj: '03539462000250',
          sourceUf: '23',
        }}
        onApply={onApply}
        onOpenChange={onOpenChange}
      />
    )

    await user.click(screen.getByRole('button', { name: 'Limpar' }))

    expect(onApply).toHaveBeenCalledWith(emptyDraft)
    expect(onOpenChange).toHaveBeenCalledWith(false)
  })
})
