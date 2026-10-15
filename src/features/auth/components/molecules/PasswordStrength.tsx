import { Check, X } from 'lucide-react'
import {
  AUTH_PASSWORD_MAX_LENGTH,
  AUTH_PASSWORD_MIN_LENGTH,
} from '../../schemas/password.schema'
import { cn } from '@/shared/lib/utils'

interface PasswordStrengthProps {
  password: string
  className?: string
}

export const PasswordStrength = ({
  password,
  className,
}: PasswordStrengthProps) => {
  if (!password) {
    return null
  }

  const meetsPolicy =
    password.length >= AUTH_PASSWORD_MIN_LENGTH &&
    password.length <= AUTH_PASSWORD_MAX_LENGTH

  return (
    <p
      className={cn(
        'flex items-center gap-2 text-sm',
        meetsPolicy ? 'text-state-income' : 'text-muted-foreground',
        className
      )}
    >
      {meetsPolicy ? (
        <Check className="h-4 w-4" aria-hidden />
      ) : (
        <X className="h-4 w-4" aria-hidden />
      )}
      <span>
        Use entre {AUTH_PASSWORD_MIN_LENGTH} e {AUTH_PASSWORD_MAX_LENGTH}{' '}
        caracteres.
      </span>
    </p>
  )
}
