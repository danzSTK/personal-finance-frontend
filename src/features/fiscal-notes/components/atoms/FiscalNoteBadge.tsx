import { ReceiptText } from 'lucide-react'
import { cn } from '@/shared/lib/utils'

export interface FiscalNoteBadgeProps {
  variant?: 'default' | 'compact'
  label?: string
  className?: string
}

/**
 * Discreet accessible badge indicating a linked NFC-e fiscal note.
 */
export function FiscalNoteBadge({
  variant = 'default',
  label = 'NFC-e',
  className,
}: FiscalNoteBadgeProps) {
  const isCompact = variant === 'compact'

  return (
    <span
      title="Nota fiscal vinculada (NFC-e)"
      aria-label="Nota fiscal vinculada (NFC-e)"
      className={cn(
        'inline-flex shrink-0 items-center rounded-full border border-app-border bg-app-elevated font-medium whitespace-nowrap text-app-muted',
        isCompact
          ? 'gap-1 px-2 py-0.5 text-[11px] leading-4'
          : 'gap-1.5 px-2.5 py-1 text-xs leading-4',
        className
      )}
    >
      <ReceiptText
        className={cn('shrink-0 text-brand', isCompact ? 'h-3 w-3' : 'h-3.5 w-3.5')}
        aria-hidden="true"
      />
      <span>{label}</span>
    </span>
  )
}
