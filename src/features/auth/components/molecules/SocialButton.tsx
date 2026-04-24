import { cn } from '@/shared/lib/utils'
import { AUTH_API_ENDPOINTS, DEFAULT_API_BASE_URL } from '../../constants/auth.constants'
import { Button } from '../atoms'
import { GoogleLogo } from '../atoms/GoogleLogo'

interface SocialButtonProps {
  provider: 'google'
  onClick?: () => void
  disabled?: boolean
  className?: string
}

const providerConfig = {
  google: {
    label: 'Continuar com Google',
    icon: <GoogleLogo />,
  },
} as const

export const SocialButton = ({ provider, onClick, disabled, className }: SocialButtonProps) => {
  const config = providerConfig[provider]

  const handleClick = () => {
    if (onClick) {
      onClick()
    } else {
      const apiUrl =
        import.meta.env.VITE_API_URL ||
        import.meta.env.VITE_API_BASE_URL ||
        DEFAULT_API_BASE_URL

      window.location.href = `${apiUrl}${AUTH_API_ENDPOINTS.loginGoogle}`
    }
  }

  return (
    <Button
      type="button"
      variant="outline"
      onClick={handleClick}
      disabled={disabled}
      className={cn(
        'h-11 w-full rounded-lg border-app-border bg-app-bg text-app-text transition-colors hover:bg-app-elevated hover:text-app-text focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-app-panel',
        className
      )}
      aria-label={config.label}
    >
      {config.icon}
      <span className="text-sm font-medium">{config.label}</span>
    </Button>
  )
}
