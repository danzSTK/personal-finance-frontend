import { Unlink } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/shared/components/ui/sheet'
import { useIsMobile } from '@/shared/hooks/use-mobile'
import { formatCurrencyFromCents, formatDateTime } from '@/shared/utils/formatters'
import type { FiscalNoteDetail } from '../../types/fiscal-note.types'
import {
  formatCnpj,
  formatFiscalNoteNumberAndSeries,
} from '../../utils/fiscalNoteFormat.utils'
import { FiscalNoteBadge } from '../atoms/FiscalNoteBadge'
import { FiscalNoteMetadataBlock } from '../molecules/FiscalNoteMetadataBlock'
import { FiscalNotePaymentsList } from '../molecules/FiscalNotePaymentsList'
import { FiscalNoteTotalsCard } from '../molecules/FiscalNoteTotalsCard'
import { FiscalNoteItemsList } from './FiscalNoteItemsList'

export interface FiscalNoteDetailsSheetProps {
  open: boolean
  fiscalNote: FiscalNoteDetail | null
  onOpenChange: (open: boolean) => void
  onRequestUnlink?: () => void
  isUnlinking?: boolean
}

/**
 * Full responsive sheet for inspecting a persisted NFC-e shopping list, totals, payments, and fiscal metadata.
 */
export function FiscalNoteDetailsSheet({
  open,
  fiscalNote,
  onOpenChange,
  onRequestUnlink,
  isUnlinking = false,
}: FiscalNoteDetailsSheetProps) {
  const isMobile = useIsMobile()

  return (
    <Sheet open={open && fiscalNote !== null} onOpenChange={onOpenChange}>
      <SheetContent
        side={isMobile ? 'bottom' : 'right'}
        className="flex max-h-[calc(100dvh-1rem)] w-full flex-col overflow-hidden rounded-t-3xl border-border bg-card p-0 text-foreground md:h-full md:max-h-none md:rounded-none md:sm:max-w-lg"
      >
        {fiscalNote ? (
          <>
            <div className="overflow-y-auto p-6">
              <SheetHeader className="p-0 pr-8 text-left">
                <div className="mb-1.5 flex flex-wrap items-center gap-2">
                  <FiscalNoteBadge variant="compact" />
                  <span className="numeric text-xs text-muted-foreground">
                    {formatFiscalNoteNumberAndSeries(
                      fiscalNote.number,
                      fiscalNote.series
                    )}
                  </span>
                </div>
                <SheetTitle className="text-foreground">
                  {fiscalNote.issuerName}
                </SheetTitle>
                <SheetDescription className="numeric text-muted-foreground">
                  CNPJ {formatCnpj(fiscalNote.issuerCnpj)} ·{' '}
                  {formatDateTime(fiscalNote.issuedAt)}
                </SheetDescription>
              </SheetHeader>

              <div className="mt-5 flex items-baseline justify-between gap-3 rounded-2xl border border-border bg-secondary p-4">
                <span className="text-xs font-medium uppercase tracking-normal text-muted-foreground">
                  Total pago na nota
                </span>
                <span className="numeric text-xl font-semibold text-foreground">
                  {formatCurrencyFromCents(fiscalNote.payableAmountCents)}
                </span>
              </div>

              <div className="mt-6 space-y-6">
                <FiscalNoteItemsList items={fiscalNote.items} />

                <FiscalNoteTotalsCard
                  grossAmountCents={fiscalNote.grossAmountCents}
                  discountAmountCents={fiscalNote.discountAmountCents}
                  taxAmountCents={fiscalNote.taxAmountCents}
                  changeAmountCents={fiscalNote.changeAmountCents}
                  payableAmountCents={fiscalNote.payableAmountCents}
                />

                <FiscalNotePaymentsList payments={fiscalNote.payments} />

                <FiscalNoteMetadataBlock fiscalNote={fiscalNote} defaultOpen />
              </div>
            </div>

            <SheetFooter className="mt-auto flex-row flex-wrap items-center justify-between gap-2 border-t border-border bg-card p-4">
              {onRequestUnlink ? (
                <Button
                  type="button"
                  variant="outline"
                  disabled={isUnlinking}
                  className="h-10 rounded-xl border-destructive/60 bg-destructive/10 text-destructive hover:bg-destructive/15 hover:text-destructive"
                  onClick={onRequestUnlink}
                >
                  <Unlink className="h-4 w-4" />
                  Desvincular NFC-e
                </Button>
              ) : null}

              <Button
                type="button"
                variant="outline"
                className="ml-auto h-10 rounded-xl border-border bg-secondary text-foreground hover:bg-accent hover:text-foreground"
                onClick={() => onOpenChange(false)}
              >
                Fechar
              </Button>
            </SheetFooter>
          </>
        ) : null}
      </SheetContent>
    </Sheet>
  )
}
