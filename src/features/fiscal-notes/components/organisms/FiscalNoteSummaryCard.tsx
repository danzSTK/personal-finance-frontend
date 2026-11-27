import { ListOrdered, Unlink } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { cn } from '@/shared/lib/utils'
import { formatCurrencyFromCents, formatDateTime } from '@/shared/utils/formatters'
import { FISCAL_NOTE_PREVIEW_ITEMS_LIMIT } from '../../constants/fiscal-notes.constants'
import type { FiscalNoteDetail } from '../../types/fiscal-note.types'
import { formatFiscalNoteNumberAndSeries } from '../../utils/fiscalNoteFormat.utils'
import { FiscalNoteBadge } from '../atoms/FiscalNoteBadge'
import { FiscalNoteItemRow } from '../atoms/FiscalNoteItemRow'

export interface FiscalNoteSummaryCardProps {
  fiscalNote: Pick<
    FiscalNoteDetail,
    | 'issuerName'
    | 'number'
    | 'series'
    | 'issuedAt'
    | 'payableAmountCents'
    | 'discountAmountCents'
    | 'items'
  >
  onViewFullList: () => void
  onUnlink: () => void
  isUnlinking?: boolean
  className?: string
}

/**
 * Compact NFC-e summary card for TransactionDetailsSheet with preview of the first 3 items.
 */
export function FiscalNoteSummaryCard({
  fiscalNote,
  onViewFullList,
  onUnlink,
  isUnlinking = false,
  className,
}: FiscalNoteSummaryCardProps) {
  const orderedItems = [...fiscalNote.items].sort(
    (a, b) => a.position - b.position
  )
  const previewItems = orderedItems.slice(0, FISCAL_NOTE_PREVIEW_ITEMS_LIMIT)
  const remainingCount = Math.max(orderedItems.length - previewItems.length, 0)
  const totalItemsCount = orderedItems.length

  return (
    <div
      className={cn(
        'space-y-3 rounded-2xl border border-border bg-secondary p-4',
        className
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <FiscalNoteBadge variant="compact" />
            <span className="numeric text-xs text-muted-foreground">
              {formatFiscalNoteNumberAndSeries(
                fiscalNote.number,
                fiscalNote.series
              )}
            </span>
          </div>
          <p className="truncate text-sm font-semibold text-foreground">
            {fiscalNote.issuerName}
          </p>
          <p className="numeric text-xs text-muted-foreground">
            Emitida em {formatDateTime(fiscalNote.issuedAt)}
          </p>
        </div>

        <div className="shrink-0 text-right">
          <p className="text-[11px] font-medium text-muted-foreground">
            Total da nota
          </p>
          <p className="numeric text-sm font-semibold text-foreground">
            {formatCurrencyFromCents(fiscalNote.payableAmountCents)}
          </p>
          {fiscalNote.discountAmountCents > 0 ? (
            <p className="numeric text-[11px] text-state-income">
              Desc. {formatCurrencyFromCents(fiscalNote.discountAmountCents)}
            </p>
          ) : null}
        </div>
      </div>

      {previewItems.length > 0 ? (
        <div className="divide-y divide-border rounded-xl border border-border bg-card/60 px-3">
          {previewItems.map((item) => (
            <FiscalNoteItemRow
              key={`${item.position}-${item.storeCode ?? item.rawDescription}`}
              item={item}
              showPosition={false}
              className="py-2"
            />
          ))}
          {remainingCount > 0 ? (
            <p className="numeric py-2 text-center text-xs text-muted-foreground">
              + {remainingCount}{' '}
              {remainingCount === 1
                ? 'item na lista completa'
                : 'itens na lista completa'}
            </p>
          ) : null}
        </div>
      ) : null}

      <div className="flex flex-wrap items-center gap-2 pt-1">
        <Button
          type="button"
          variant="secondary"
          className="h-10 flex-1 rounded-xl border border-border bg-card text-foreground hover:bg-accent"
          onClick={onViewFullList}
        >
          <ListOrdered className="h-4 w-4" />
          <span>
            Ver lista completa ({totalItemsCount}{' '}
            {totalItemsCount === 1 ? 'item' : 'itens'})
          </span>
        </Button>

        <Button
          type="button"
          variant="outline"
          disabled={isUnlinking}
          className="h-10 rounded-xl border-destructive/50 bg-destructive/10 px-3 text-destructive hover:bg-destructive/15 hover:text-destructive"
          onClick={onUnlink}
        >
          <Unlink className="h-4 w-4" />
          <span>Desvincular</span>
        </Button>
      </div>
    </div>
  )
}
