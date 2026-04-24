import { cn } from '@/shared/lib/utils'

interface GoogleLogoProps {
  className?: string
}

export const GoogleLogo = ({ className }: GoogleLogoProps) => (
  <img
    src="/brand/google.svg"
    alt=""
    aria-hidden
    className={cn('h-5 w-5', className)}
  />
)
