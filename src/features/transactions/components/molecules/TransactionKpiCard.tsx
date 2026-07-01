import type { ReactNode } from 'react'
import { cn } from '@/shared/lib/utils'

interface TransactionKpiCardProps {
  label: string
  value: string
  icon: ReactNode
  tone?: 'brand' | 'income' | 'expense' | 'warning' | 'info' | 'neutral'
  className?: string
}

export function TransactionKpiCard({
  label,
  value,
  icon,
  tone = 'neutral',
  className,
}: TransactionKpiCardProps) {
  return (
    <article
      className={cn(
        'rounded-2xl border border-border bg-card p-4',
        className
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-normal text-muted-foreground">
            {label}
          </p>
          <p className="numeric mt-2 truncate text-xl font-semibold text-foreground sm:text-2xl">
            {value}
          </p>
        </div>
        <span
          className={cn(
            'inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl',
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

const toneClassName: Record<NonNullable<TransactionKpiCardProps['tone']>, string> = {
  brand: 'bg-primary/15 text-primary',
  income: 'bg-state-income/10 text-state-income',
  expense: 'bg-state-expense/10 text-state-expense',
  warning: 'bg-state-warning/10 text-state-warning',
  info: 'bg-state-info/10 text-state-info',
  neutral: 'bg-secondary text-muted-foreground',
}
