import { Separator } from '@/shared/components/ui/separator'
import { cn } from '@/shared/lib/utils'
import { formatCurrencyFromCents } from '@/shared/utils/formatters'

export interface FiscalNoteTotalsCardProps {
  grossAmountCents: number
  discountAmountCents: number
  taxAmountCents: number
  changeAmountCents: number | null
  payableAmountCents: number
  className?: string
}

/**
 * Financial breakdown card for a fiscal note (gross, discounts, taxes, change, and payable total).
 */
export function FiscalNoteTotalsCard({
  grossAmountCents,
  discountAmountCents,
  taxAmountCents,
  changeAmountCents,
  payableAmountCents,
  className,
}: FiscalNoteTotalsCardProps) {
  return (
    <section
      aria-label="Totais da nota fiscal"
      className={cn(
        'space-y-2.5 rounded-2xl border border-border bg-secondary p-4',
        className
      )}
    >
      <div className="flex items-center justify-between gap-3 text-sm">
        <span className="text-muted-foreground">Total bruto</span>
        <span className="numeric font-medium text-foreground">
          {formatCurrencyFromCents(grossAmountCents)}
        </span>
      </div>

      {discountAmountCents > 0 ? (
        <div className="flex items-center justify-between gap-3 text-sm">
          <span className="text-muted-foreground">Descontos</span>
          <span className="numeric font-medium text-state-income">
            − {formatCurrencyFromCents(discountAmountCents)}
          </span>
        </div>
      ) : null}

      {taxAmountCents > 0 ? (
        <div className="flex items-center justify-between gap-3 text-sm">
          <span className="text-muted-foreground">
            Tributos aproximados
          </span>
          <span className="numeric text-muted-foreground">
            {formatCurrencyFromCents(taxAmountCents)}
          </span>
        </div>
      ) : null}

      {changeAmountCents !== null && changeAmountCents > 0 ? (
        <div className="flex items-center justify-between gap-3 text-sm">
          <span className="text-muted-foreground">Troco</span>
          <span className="numeric font-medium text-foreground">
            {formatCurrencyFromCents(changeAmountCents)}
          </span>
        </div>
      ) : null}

      <Separator className="my-1" />

      <div className="flex items-center justify-between gap-3">
        <span className="text-sm font-semibold text-foreground">Total pago</span>
        <span className="numeric text-base font-semibold text-foreground">
          {formatCurrencyFromCents(payableAmountCents)}
        </span>
      </div>
    </section>
  )
}
