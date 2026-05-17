import { type ReactNode } from 'react'
import { cn } from '@/shared/lib/utils'

interface ErrorMessageProps {
  children: ReactNode
  id?: string
  className?: string
}

export const ErrorMessage = ({ children, id, className }: ErrorMessageProps) => (
  <p
    id={id}
    role="alert"
    className={cn(
      'animate-in slide-in-from-top-1 text-sm font-medium text-destructive',
      className
    )}
  >
    {children}
  </p>
)
