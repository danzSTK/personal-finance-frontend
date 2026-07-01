import { cn } from '@/shared/lib/utils'

interface BadgeProps {
  children: React.ReactNode
  variant?: 'default' | 'income' | 'warning' | 'expense' | 'info'
  className?: string
}

const variantClasses = {
  default: 'bg-accent text-foreground',
  income: 'bg-state-income/20 text-state-income',
  warning: 'bg-state-warning/20 text-state-warning',
  expense: 'bg-state-expense/20 text-state-expense',
  info: 'bg-state-info/20 text-state-info',
}

export function Badge({
  children,
  variant = 'default',
  className,
}: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold',
        variantClasses[variant],
        className
      )}
    >
      {children}
    </span>
  )
}
