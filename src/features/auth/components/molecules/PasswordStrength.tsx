import { Check, X } from 'lucide-react'
import { cn } from '@/shared/lib/utils'

interface PasswordStrengthProps {
  password: string
  className?: string
}

interface StrengthCheck {
  id: string
  label: string
  test: (pwd: string) => boolean
}

const checks: StrengthCheck[] = [
  {
    id: 'min-length',
    label: 'Pelo menos 8 caracteres',
    test: (pwd) => pwd.length >= 8,
  },
  {
    id: 'uppercase',
    label: 'Uma letra maiúscula',
    test: (pwd) => /[A-Z]/.test(pwd),
  },
  {
    id: 'lowercase',
    label: 'Uma letra minúscula',
    test: (pwd) => /[a-z]/.test(pwd),
  },
  {
    id: 'number',
    label: 'Um número',
    test: (pwd) => /[0-9]/.test(pwd),
  },
]

const strengthTone = {
  weak: {
    bar: 'bg-destructive',
    text: 'text-destructive',
  },
  medium: {
    bar: 'bg-state-warning',
    text: 'text-state-warning',
  },
  strong: {
    bar: 'bg-state-income',
    text: 'text-state-income',
  },
} as const

export const PasswordStrength = ({ password, className }: PasswordStrengthProps) => {
  if (!password) return null

  const passedChecks = checks.filter((check) => check.test(password)).length
  const strength = (passedChecks / checks.length) * 100

  const tone = strength < 50 ? strengthTone.weak : strength < 75 ? strengthTone.medium : strengthTone.strong

  const label = strength < 50 ? 'Fraca' : strength < 75 ? 'Média' : 'Forte'

  return (
    <div className={cn('space-y-2', className)}>
      <div className="space-y-1">
        <div className="flex items-center justify-between text-sm">
          <span className="text-app-muted">Força da senha</span>
          <span className={cn('font-medium', tone.text)}>{label}</span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-app-border/40">
          <div
            className={cn('h-full transition-all duration-300', tone.bar)}
            style={{ width: `${strength}%` }}
          />
        </div>
      </div>

      <ul className="space-y-1">
        {checks.map((check) => {
          const passed = check.test(password)
          return (
            <li
              key={check.id}
              className={cn('flex items-center gap-2 text-sm', {
                'text-state-income': passed,
                'text-app-muted': !passed,
              })}
            >
              {passed ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
              <span>{check.label}</span>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
