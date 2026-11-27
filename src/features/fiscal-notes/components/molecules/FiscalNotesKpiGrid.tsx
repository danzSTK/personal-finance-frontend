import type { ReactNode } from 'react'
import { BadgePercent, QrCode, ReceiptText, Scale } from 'lucide-react'
import { cn } from '@/shared/lib/utils'
import { formatCurrencyFromCents } from '@/shared/utils/formatters'
import type { FiscalNoteListSummaryTotals } from '../../types/fiscal-note.types'

export interface FiscalNotesKpiGridProps {
  summary: FiscalNoteListSummaryTotals
}

interface KpiItem {
  label: string
  value: string
  icon: ReactNode
  iconToneClass: string
}

/**
 * Responsive 4-card KPI strip summarizing the active fiscal-note filter slice.
 */
export function FiscalNotesKpiGrid({ summary }: FiscalNotesKpiGridProps) {
  const items: KpiItem[] = [
    {
      label: 'Total pago',
      value: formatCurrencyFromCents(summary.totalPayableAmountCents),
      icon: <ReceiptText className="h-4 w-4" />,
      iconToneClass: 'bg-state-expense/15 text-state-expense',
    },
    {
      label: 'Notas fiscais',
      value: String(summary.totalNotes),
      icon: <QrCode className="h-4 w-4" />,
      iconToneClass: 'bg-brand/15 text-brand',
    },
    {
      label: 'Descontos',
      value: formatCurrencyFromCents(summary.totalDiscountAmountCents),
      icon: <BadgePercent className="h-4 w-4" />,
      iconToneClass: 'bg-state-income/15 text-state-income',
    },
    {
      label: 'Tributos aprox.',
      value: formatCurrencyFromCents(summary.totalTaxAmountCents),
      icon: <Scale className="h-4 w-4" />,
      iconToneClass: 'bg-state-info/15 text-state-info',
    },
  ]

  return (
    <section
      aria-label="Indicadores de notas fiscais"
      className="grid grid-cols-2 gap-3 xl:grid-cols-4"
    >
      {items.map((item) => (
        <article
          key={item.label}
          className="rounded-2xl border border-border bg-card p-4"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-medium uppercase tracking-normal text-muted-foreground">
                {item.label}
              </p>
              <p className="numeric mt-2 truncate text-xl font-semibold text-foreground sm:text-2xl">
                {item.value}
              </p>
            </div>
            <span
              className={cn(
                'inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl sm:h-10 sm:w-10',
                item.iconToneClass
              )}
              aria-hidden="true"
            >
              {item.icon}
            </span>
          </div>
        </article>
      ))}
    </section>
  )
}
