import { Paperclip } from 'lucide-react'
import { cn } from '@/shared/lib/utils'

interface TransactionAttachmentBadgeProps {
  count: number
  compact?: boolean
  className?: string
}

export function TransactionAttachmentBadge({
  count,
  compact = false,
  className,
}: TransactionAttachmentBadgeProps) {
  if (count <= 0) {
    return null
  }

  const label = count === 1 ? '1 anexo' : `${count} anexos`

  if (compact) {
    return (
      <span
        className={cn(
          'inline-flex items-center gap-1 rounded-md border border-border/50 bg-secondary/70 px-1.5 py-0.5 text-[11px] font-medium text-muted-foreground',
          className
        )}
        title={label}
        aria-label={label}
      >
        <Paperclip className="h-3 w-3 shrink-0" aria-hidden />
        <span className="numeric">{count}</span>
      </span>
    )
  }

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-secondary/80 px-2.5 py-0.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground',
        className
      )}
      title={label}
      aria-label={label}
    >
      <Paperclip className="h-3.5 w-3.5 shrink-0" aria-hidden />
      <span>{label}</span>
    </span>
  )
}
