import { cn } from '@/shared/lib/utils'
import { formatCurrencyFromCents } from '@/shared/utils/formatters'
import type { FiscalNotePreviewItem } from '../../types/fiscal-note.types'
import {
  formatFiscalNoteUnitPrice,
  formatItemQuantity,
} from '../../utils/fiscalNoteFormat.utils'

export interface FiscalNoteItemRowProps {
  item: FiscalNotePreviewItem
  showPosition?: boolean
  className?: string
}

/**
 * Read-only shopping list row displaying item description, optional store code,
 * quantity x unit price, and right-aligned tabular total.
 */
export function FiscalNoteItemRow({
  item,
  showPosition = true,
  className,
}: FiscalNoteItemRowProps) {
  return (
    <div className={cn('flex items-start justify-between gap-3 py-2.5', className)}>
      <div className="flex min-w-0 flex-1 items-start gap-2.5">
        {showPosition ? (
          <span className="numeric mt-0.5 inline-flex h-5 min-w-5 shrink-0 items-center justify-center rounded-md bg-app-panel px-1 text-[11px] font-medium text-app-muted">
            {item.position}
          </span>
        ) : null}
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium leading-snug break-words text-app-text">
            {item.rawDescription}
          </p>
          <p className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-app-muted">
            <span className="numeric">
              {formatItemQuantity(item.quantity, item.unit)} ×{' '}
              {formatFiscalNoteUnitPrice(item.unitPrice)}
            </span>
            {item.storeCode ? (
              <span className="numeric">Cód. {item.storeCode}</span>
            ) : null}
          </p>
        </div>
      </div>

      <span className="numeric shrink-0 text-sm font-semibold text-app-text">
        {formatCurrencyFromCents(item.totalPriceCents)}
      </span>
    </div>
  )
}
