import { ReceiptText, Unlink } from 'lucide-react'
import { ApiErrorAlert } from '@/shared/components/molecules/ApiErrorAlert'
import { Button } from '@/shared/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/shared/components/ui/sheet'
import { Skeleton } from '@/shared/components/ui/skeleton'
import { resolveApiError } from '@/shared/errors'
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
  isLoading?: boolean
  error?: unknown
  onRetry?: () => void
  onOpenChange: (open: boolean) => void
  onViewTransaction?: (transactionId: string) => void
  onRequestUnlink?: () => void
  isUnlinking?: boolean
}

/**
 * Full responsive sheet for inspecting a persisted NFC-e shopping list, totals, payments, and fiscal metadata.
 */
export function FiscalNoteDetailsSheet({
  open,
  fiscalNote,
  isLoading = false,
  error,
  onRetry,
  onOpenChange,
  onViewTransaction,
  onRequestUnlink,
  isUnlinking = false,
}: FiscalNoteDetailsSheetProps) {
  const isMobile = useIsMobile()
  const showLoading = isLoading && !fiscalNote
  const showError = !isLoading && !fiscalNote && Boolean(error)

  return (
    <Sheet
      open={open && (fiscalNote !== null || showLoading || showError)}
      onOpenChange={onOpenChange}
    >
      <SheetContent
        side={isMobile ? 'bottom' : 'right'}
        className="flex max-h-[calc(100dvh-1rem)] w-full flex-col overflow-hidden rounded-t-3xl border-border bg-card p-0 text-foreground md:h-full md:max-h-none md:rounded-none md:sm:max-w-lg"
      >
        {showLoading ? (
          <>
            <div
              role="status"
              aria-busy="true"
              aria-label="Carregando detalhes da nota fiscal"
              className="flex-1 overflow-y-auto p-6"
            >
              <SheetHeader className="p-0 pr-8 text-left">
                <SheetTitle className="sr-only">
                  Carregando nota fiscal
                </SheetTitle>
                <SheetDescription className="sr-only">
                  Aguarde enquanto os itens e dados fiscais da NFC-e são carregados.
                </SheetDescription>
                <div className="mb-2 flex items-center gap-2">
                  <Skeleton className="h-5 w-16 rounded-full bg-secondary" />
                  <Skeleton className="h-4 w-28 rounded-lg bg-secondary" />
                </div>
                <Skeleton className="h-6 w-3/4 rounded-lg bg-secondary" />
                <Skeleton className="mt-2 h-4 w-2/3 rounded-lg bg-secondary" />
              </SheetHeader>

              <Skeleton className="mt-5 h-16 w-full rounded-2xl bg-secondary" />

              <div className="mt-6 space-y-3">
                <Skeleton className="h-4 w-40 rounded-lg bg-secondary" />
                <Skeleton className="h-10 w-full rounded-xl bg-secondary" />
                <Skeleton className="h-16 w-full rounded-2xl bg-secondary" />
                <Skeleton className="h-16 w-full rounded-2xl bg-secondary" />
                <Skeleton className="h-16 w-full rounded-2xl bg-secondary" />
              </div>

              <Skeleton className="mt-6 h-32 w-full rounded-2xl bg-secondary" />
            </div>

            <SheetFooter className="mt-auto flex-row items-center justify-end gap-2 border-t border-border bg-card p-4">
              <Button
                type="button"
                variant="outline"
                className="h-10 rounded-xl border-border bg-secondary text-foreground hover:bg-accent hover:text-foreground"
                onClick={() => onOpenChange(false)}
              >
                Fechar
              </Button>
            </SheetFooter>
          </>
        ) : showError ? (
          <>
            <div className="flex-1 overflow-y-auto p-6">
              <SheetHeader className="p-0 pr-8 text-left">
                <SheetTitle className="text-foreground">
                  Detalhes da NFC-e
                </SheetTitle>
                <SheetDescription className="text-muted-foreground">
                  Não foi possível carregar os itens e dados desta nota fiscal.
                </SheetDescription>
              </SheetHeader>

              <div className="mt-5">
                <ApiErrorAlert
                  error={resolveApiError(error, 'fiscal-notes.get')}
                  onRetry={onRetry}
                />
              </div>
            </div>

            <SheetFooter className="mt-auto flex-row items-center justify-end gap-2 border-t border-border bg-card p-4">
              <Button
                type="button"
                variant="outline"
                className="h-10 rounded-xl border-border bg-secondary text-foreground hover:bg-accent hover:text-foreground"
                onClick={() => onOpenChange(false)}
              >
                Fechar
              </Button>
            </SheetFooter>
          </>
        ) : fiscalNote ? (
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

              {onViewTransaction ? (
                <Button
                  type="button"
                  variant="outline"
                  className="h-10 rounded-xl border-border bg-secondary text-foreground hover:bg-accent hover:text-foreground"
                  onClick={() => onViewTransaction(fiscalNote.transactionId)}
                >
                  <ReceiptText className="h-4 w-4" />
                  Ver despesa
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
