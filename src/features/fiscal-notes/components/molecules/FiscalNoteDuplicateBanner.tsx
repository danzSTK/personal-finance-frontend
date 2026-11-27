import { AlertTriangle, ExternalLink, Loader2 } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { cn } from '@/shared/lib/utils'

export interface FiscalNoteDuplicateBannerProps {
  existingTransactionId?: string | null
  onOpenExistingTransaction?: (transactionId: string) => void
  onReadAnotherNote?: () => void
  isOpeningTransaction?: boolean
  className?: string
}

/**
 * Proactive warning banner shown when an NFC-e is already linked to an active expense.
 */
export function FiscalNoteDuplicateBanner({
  existingTransactionId,
  onOpenExistingTransaction,
  onReadAnotherNote,
  isOpeningTransaction = false,
  className,
}: FiscalNoteDuplicateBannerProps) {
  const canOpenExisting = Boolean(
    existingTransactionId && onOpenExistingTransaction
  )

  return (
    <div
      role="alert"
      className={cn(
        'rounded-2xl border border-state-warning/40 bg-state-warning/10 p-4',
        className
      )}
    >
      <div className="flex items-start gap-3">
        <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-state-warning/15 text-state-warning">
          <AlertTriangle className="h-4 w-4" aria-hidden="true" />
        </span>

        <div className="min-w-0 flex-1 space-y-2">
          <div>
            <p className="text-sm font-semibold text-foreground">
              Esta NFC-e já foi importada
            </p>
            <p className="mt-1 text-xs leading-5 text-muted-foreground">
              Esta nota fiscal já está vinculada a outra despesa ativa na sua conta e não pode ser duplicada.
            </p>
          </div>

          <div className="flex flex-wrap gap-2 pt-1">
            {canOpenExisting && existingTransactionId && onOpenExistingTransaction ? (
              <Button
                type="button"
                disabled={isOpeningTransaction}
                className="h-10 rounded-xl bg-primary px-4 text-primary-foreground hover:bg-primary/90"
                onClick={() => onOpenExistingTransaction(existingTransactionId)}
              >
                {isOpeningTransaction ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Abrindo despesa...
                  </>
                ) : (
                  <>
                    <ExternalLink className="h-4 w-4" />
                    Ver despesa existente
                  </>
                )}
              </Button>
            ) : null}

            {onReadAnotherNote ? (
              <Button
                type="button"
                variant="outline"
                className="h-10 rounded-xl border-border bg-secondary text-foreground hover:bg-accent"
                onClick={onReadAnotherNote}
              >
                Ler outra nota
              </Button>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  )
}
