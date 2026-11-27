import { CreditCard } from 'lucide-react'
import { cn } from '@/shared/lib/utils'
import { formatCurrencyFromCents } from '@/shared/utils/formatters'
import type { FiscalNotePreviewPayment } from '../../types/fiscal-note.types'
import { getPaymentMethodLabel } from '../../utils/fiscalNoteFormat.utils'

export interface FiscalNotePaymentsListProps {
  payments: FiscalNotePreviewPayment[]
  className?: string
}

/**
 * Informational list of payment methods recorded on the fiscal note.
 */
export function FiscalNotePaymentsList({
  payments,
  className,
}: FiscalNotePaymentsListProps) {
  const orderedPayments = [...payments].sort((a, b) => a.position - b.position)

  return (
    <section
      aria-label="Formas de pagamento da nota fiscal"
      className={cn(
        'rounded-2xl border border-border bg-secondary p-4',
        className
      )}
    >
      <h4 className="mb-2.5 text-xs font-medium uppercase tracking-normal text-muted-foreground">
        Pagamentos registrados na nota
      </h4>

      {orderedPayments.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Nenhuma forma de pagamento detalhada na nota.
        </p>
      ) : (
        <ul className="space-y-2">
          {orderedPayments.map((payment) => (
            <li
              key={`${payment.position}-${payment.methodLabel}`}
              className="flex items-center justify-between gap-3 text-sm"
            >
              <span className="flex min-w-0 items-center gap-2 text-foreground">
                <CreditCard
                  className="h-4 w-4 shrink-0 text-muted-foreground"
                  aria-hidden="true"
                />
                <span className="truncate">
                  {getPaymentMethodLabel(payment.methodLabel)}
                </span>
              </span>
              <span className="numeric shrink-0 font-medium text-foreground">
                {formatCurrencyFromCents(payment.amountCents)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
