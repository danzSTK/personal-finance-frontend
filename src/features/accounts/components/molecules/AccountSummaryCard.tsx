import type { ReactNode } from 'react'
import { Card, CardContent } from '@/shared/lib/card'
import { cn } from '@/shared/lib/utils'

type AccountSummaryTone = 'brand' | 'info' | 'warning'

interface AccountSummaryCardProps {
  icon: ReactNode
  label: string
  value: string
  helper?: string
  tone: AccountSummaryTone
  isNumeric?: boolean
}

const summaryToneClasses: Record<
  AccountSummaryTone,
  { icon: string; value: string }
> = {
  brand: {
    icon: 'bg-primary/15 text-primary',
    value: 'text-foreground',
  },
  info: {
    icon: 'bg-state-info/15 text-state-info',
    value: 'text-state-info',
  },
  warning: {
    icon: 'bg-state-warning/15 text-state-warning',
    value: 'text-state-warning',
  },
}

export function AccountSummaryCard({
  icon,
  label,
  value,
  helper,
  tone,
  isNumeric = true,
}: AccountSummaryCardProps) {
  const classes = summaryToneClasses[tone]

  return (
    <Card className="min-w-0 border-border bg-card shadow-none">
      <CardContent className="relative p-5">
        <div className="min-w-0">
          <p className="pr-12 text-sm font-medium text-muted-foreground">{label}</p>
          <p
            className={cn(
              'mt-3 text-xl font-semibold leading-tight tracking-tight sm:text-2xl',
              isNumeric && 'numeric',
              classes.value
            )}
          >
            {value}
          </p>
        </div>
        <span
          className={cn(
            'absolute right-5 top-5 inline-flex h-9 w-9 items-center justify-center rounded-lg',
            classes.icon
          )}
          aria-hidden
        >
          {icon}
        </span>
        {helper ? (
          <p className="mt-3 text-xs leading-5 text-muted-foreground">
            {helper}
          </p>
        ) : null}
      </CardContent>
    </Card>
  )
}
