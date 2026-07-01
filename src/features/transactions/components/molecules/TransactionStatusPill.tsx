import { CheckCircle2, CircleAlert, Clock3 } from 'lucide-react'
import { cn } from '@/shared/lib/utils'
import type { TransactionDerivedStatus } from '../../utils/transaction.utils'
import { getTransactionStatusLabel } from '../../utils/transaction.utils'

interface TransactionStatusPillProps {
  status: TransactionDerivedStatus
  compact?: boolean
}

export function TransactionStatusPill({
  status,
  compact = false,
}: TransactionStatusPillProps) {
  const Icon =
    status === 'EFFECTIVE'
      ? CheckCircle2
      : status === 'OVERDUE'
        ? CircleAlert
        : Clock3

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium',
        statusTone[status]
      )}
    >
      <Icon className="h-3.5 w-3.5" />
      {compact && status !== 'OVERDUE' ? (
        <span className="sr-only">{getTransactionStatusLabel(status)}</span>
      ) : (
        getTransactionStatusLabel(status)
      )}
    </span>
  )
}

const statusTone: Record<TransactionDerivedStatus, string> = {
  EFFECTIVE: 'bg-state-income/10 text-state-income',
  PENDING: 'bg-state-info/10 text-state-info',
  OVERDUE: 'bg-destructive/10 text-destructive',
}
