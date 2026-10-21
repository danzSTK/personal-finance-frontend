import type { ReactNode } from 'react'
import { cn } from '@/shared/lib/utils'

interface TransactionKpiCardProps {
  label: string
  value: string
  icon: ReactNode
  tone?: 'brand' | 'income' | 'expense' | 'warning' | 'info' | 'neutral'
  className?: string
  isNumeric?: boolean
}

export function TransactionKpiCard({
  label,
  value,
  icon,
  tone = 'neutral',
  className,
  isNumeric = true,
}: TransactionKpiCardProps) {
  return (
    <article
      className={cn(
        'rounded-2xl border border-border bg-card p-3.5 sm:p-4',
        className
      )}
    >
      <div className="flex items-start justify-between gap-2 sm:gap-3">
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs font-medium uppercase tracking-normal text-muted-foreground">
            {label}
          </p>
          <p
            className={cn(
              'mt-1.5 truncate text-base font-semibold text-foreground sm:mt-2 sm:text-2xl',
              isNumeric && 'numeric'
            )}
          >
            {value}
          </p>
        </div>
        <span
          className={cn(
            'inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-xl sm:h-10 sm:w-10',
            toneClassName[tone]
          )}
          aria-hidden
        >
          {icon}
        </span>
      </div>
    </article>
  )
}

const toneClassName: Record<
  NonNullable<TransactionKpiCardProps['tone']>,
  string
> = {
  brand: 'bg-primary/15 text-primary',
  income: 'bg-state-income/10 text-state-income',
  expense: 'bg-state-expense/10 text-state-expense',
  warning: 'bg-state-warning/10 text-state-warning',
  info: 'bg-state-info/10 text-state-info',
  neutral: 'bg-secondary text-muted-foreground',
}
