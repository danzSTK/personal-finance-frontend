import { AlertTriangle } from 'lucide-react'
import { cn } from '@/shared/lib/utils'
import { formatDateOnlyForDisplay } from '@/shared/utils/dateOnly'
import { formatCurrencyFromCents } from '@/shared/utils/formatters'
import type { FiscalNoteDivergenceSummary } from '../../types/fiscal-note-ui.types'

export interface FiscalNoteDivergenceAlertProps {
  divergence: FiscalNoteDivergenceSummary
  className?: string
}

/**
 * Semantic warning comparing expense amount/date with the NFC-e before linking.
 */
export function FiscalNoteDivergenceAlert({
  divergence,
  className,
}: FiscalNoteDivergenceAlertProps) {
  if (!divergence.hasDivergence) {
    return null
  }

  return (
    <div
      role="status"
      className={cn(
        'rounded-2xl border border-state-warning/40 bg-state-warning/10 p-4',
        className
      )}
    >
      <div className="flex items-start gap-3">
        <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-state-warning/15 text-state-warning">
          <AlertTriangle className="h-4 w-4" aria-hidden="true" />
        </span>

        <div className="min-w-0 flex-1 space-y-3">
          <div>
            <p className="text-sm font-semibold text-foreground">
              Diferença entre a despesa e a NFC-e
            </p>
            <p className="mt-1 text-xs leading-5 text-muted-foreground">
              A despesa existente não será alterada ao vincular esta nota.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2 rounded-xl border border-border/70 bg-card/60 p-3 text-xs">
            <div className="space-y-1">
              <p className="font-medium text-muted-foreground">Despesa atual</p>
              {divergence.amountDiffers ? (
                <p className="numeric font-semibold text-foreground">
                  {formatCurrencyFromCents(divergence.transactionAmountCents)}
                </p>
              ) : null}
              {divergence.dateDiffers ? (
                <p className="numeric text-muted-foreground">
                  {formatDateOnlyForDisplay(divergence.transactionDate)}
                </p>
              ) : null}
            </div>

            <div className="space-y-1">
              <p className="font-medium text-muted-foreground">NFC-e</p>
              {divergence.amountDiffers ? (
                <p className="numeric font-semibold text-foreground">
                  {formatCurrencyFromCents(divergence.fiscalNoteAmountCents)}
                </p>
              ) : null}
              {divergence.dateDiffers ? (
                <p className="numeric text-muted-foreground">
                  {formatDateOnlyForDisplay(divergence.fiscalNoteDate)}
                </p>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
