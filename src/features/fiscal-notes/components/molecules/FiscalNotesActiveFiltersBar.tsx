import { X } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { formatDateOnlyForDisplay } from '@/shared/utils/dateOnly'
import { formatCurrencyFromCents } from '@/shared/utils/formatters'
import { FISCAL_NOTE_SUPPORTED_UF_OPTIONS } from '../../constants/fiscal-notes.constants'
import { formatCnpj } from '../../utils/fiscalNoteFormat.utils'
import {
  countActiveFiscalNoteFilters,
  type FiscalNoteListUrlState,
} from '../../utils/fiscalNoteListUrl.utils'

export interface FiscalNotesActiveFiltersBarProps {
  state: FiscalNoteListUrlState
  onRemovePeriod: () => void
  onRemoveAmountRange: () => void
  onRemoveCnpj: () => void
  onRemoveUf: () => void
  onClearAll: () => void
}

interface FilterChip {
  key: string
  label: string
  ariaLabel: string
  onRemove: () => void
}

/**
 * Displays removable pills for active advanced fiscal-note filters and a clear-all action.
 */
export function FiscalNotesActiveFiltersBar({
  state,
  onRemovePeriod,
  onRemoveAmountRange,
  onRemoveCnpj,
  onRemoveUf,
  onClearAll,
}: FiscalNotesActiveFiltersBarProps) {
  if (countActiveFiscalNoteFilters(state) === 0) {
    return null
  }

  const chips: FilterChip[] = []

  const periodLabel = buildPeriodLabel(state.issuedFrom, state.issuedTo)
  if (periodLabel) {
    chips.push({
      key: 'period',
      label: periodLabel,
      ariaLabel: 'Remover filtro de período',
      onRemove: onRemovePeriod,
    })
  }

  const amountLabel = buildAmountLabel(
    state.minAmountCents,
    state.maxAmountCents
  )
  if (amountLabel) {
    chips.push({
      key: 'amount',
      label: amountLabel,
      ariaLabel: 'Remover filtro de faixa de valor',
      onRemove: onRemoveAmountRange,
    })
  }

  if (state.issuerCnpj) {
    chips.push({
      key: 'cnpj',
      label: `CNPJ: ${formatCnpj(state.issuerCnpj)}`,
      ariaLabel: 'Remover filtro de CNPJ',
      onRemove: onRemoveCnpj,
    })
  }

  if (state.sourceUf) {
    chips.push({
      key: 'uf',
      label: `UF: ${resolveUfLabel(state.sourceUf)}`,
      ariaLabel: 'Remover filtro de UF',
      onRemove: onRemoveUf,
    })
  }

  return (
    <div
      aria-label="Filtros ativos"
      className="flex flex-wrap items-center gap-2"
    >
      {chips.map((chip) => (
        <button
          key={chip.key}
          type="button"
          aria-label={chip.ariaLabel}
          onClick={chip.onRemove}
          className="numeric inline-flex min-h-8 items-center gap-1.5 rounded-full border border-border bg-secondary px-3 py-1 text-xs font-medium text-foreground transition hover:bg-accent focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          <span>{chip.label}</span>
          <X className="h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />
        </button>
      ))}

      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="h-8 rounded-full px-3 text-xs text-muted-foreground hover:bg-secondary hover:text-foreground"
        onClick={onClearAll}
      >
        Limpar filtros
      </Button>
    </div>
  )
}

const buildPeriodLabel = (
  issuedFrom: string | null,
  issuedTo: string | null
): string | null => {
  if (issuedFrom && issuedTo) {
    return `Período: ${formatDateOnlyForDisplay(issuedFrom)} até ${formatDateOnlyForDisplay(issuedTo)}`
  }

  if (issuedFrom) {
    return `Período: A partir de ${formatDateOnlyForDisplay(issuedFrom)}`
  }

  if (issuedTo) {
    return `Período: Até ${formatDateOnlyForDisplay(issuedTo)}`
  }

  return null
}

const buildAmountLabel = (
  minAmountCents: number | null,
  maxAmountCents: number | null
): string | null => {
  if (minAmountCents !== null && maxAmountCents !== null) {
    return `Valor: ${formatCurrencyFromCents(minAmountCents)} – ${formatCurrencyFromCents(maxAmountCents)}`
  }

  if (minAmountCents !== null) {
    return `Valor: A partir de ${formatCurrencyFromCents(minAmountCents)}`
  }

  if (maxAmountCents !== null) {
    return `Valor: Até ${formatCurrencyFromCents(maxAmountCents)}`
  }

  return null
}

const resolveUfLabel = (code: string): string =>
  FISCAL_NOTE_SUPPORTED_UF_OPTIONS.find((option) => option.code === code)
    ?.label ?? code
