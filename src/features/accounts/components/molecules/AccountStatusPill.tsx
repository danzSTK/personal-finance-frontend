import type { ReactNode } from 'react'
import { cn } from '@/shared/lib/utils'

interface AccountStatusPillProps {
  icon: ReactNode
  label: string
  tone: 'brand' | 'warning'
}

export function AccountStatusPill({
  icon,
  label,
  tone,
}: AccountStatusPillProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium',
        tone === 'brand'
          ? 'bg-brand/15 text-brand-soft'
          : 'bg-state-warning/15 text-state-warning'
      )}
    >
      {icon}
      {label}
    </span>
  )
}
