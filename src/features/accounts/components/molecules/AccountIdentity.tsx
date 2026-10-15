import { useEffect, useState } from 'react'
import type { Account } from '../../types/account.types'
import { resolveAccountVisual } from '../../utils/account.utils'
import { cn } from '@/shared/lib/utils'

interface AccountIdentityProps {
  account: Pick<Account, 'color' | 'icon' | 'name' | 'template' | 'type'>
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const sizeClasses = {
  sm: { frame: 'h-7 w-7 rounded-lg', icon: 'h-4 w-4', image: 'p-1' },
  md: { frame: 'h-11 w-11 rounded-xl', icon: 'h-5 w-5', image: 'p-1.5' },
  lg: { frame: 'h-16 w-16 rounded-2xl', icon: 'h-7 w-7', image: 'p-2' },
} as const

export function AccountIdentity({
  account,
  size = 'md',
  className,
}: AccountIdentityProps) {
  const visual = resolveAccountVisual(account)
  const [logoFailed, setLogoFailed] = useState(false)
  const classes = sizeClasses[size]
  const logoUrl = visual.kind === 'logo' ? visual.logoUrl : null

  useEffect(() => {
    setLogoFailed(false)
  }, [logoUrl])

  if (visual.kind === 'logo' && !logoFailed) {
    return (
      <span
        className={cn(
          'inline-flex shrink-0 items-center justify-center overflow-hidden bg-app-text',
          classes.frame,
          className
        )}
        aria-hidden="true"
      >
        <img
          src={visual.logoUrl}
          alt=""
          className={cn('h-full w-full object-contain', classes.image)}
          onError={() => setLogoFailed(true)}
        />
      </span>
    )
  }

  const Icon = visual.kind === 'logo' ? visual.fallbackIcon : visual.icon

  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center justify-center',
        classes.frame,
        visual.tone.backgroundClass,
        visual.tone.foregroundClass,
        className
      )}
      aria-hidden="true"
    >
      <Icon className={classes.icon} />
    </span>
  )
}
