import { TriangleAlert } from 'lucide-react'
import type { ApiErrorPresentation } from '@/shared/errors'
import { Button } from '@/shared/lib/button'
import { cn } from '@/shared/lib/utils'

interface ApiErrorAlertProps {
  error: ApiErrorPresentation
  onRetry?: () => void
  className?: string
}

export function ApiErrorAlert({
  error,
  onRetry,
  className,
}: ApiErrorAlertProps) {
  const showRetry = error.recovery === 'retry' && onRetry

  return (
    <div
      role="alert"
      className={cn(
        'rounded-xl border border-destructive/40 bg-destructive/10 p-4',
        className
      )}
    >
      <div className="flex items-start gap-3">
        <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-destructive/15 text-destructive">
          <TriangleAlert className="h-4 w-4" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-app-text">{error.title}</p>
          <p className="mt-1 text-sm leading-6 text-app-muted">
            {error.description}
          </p>
          {showRetry ? (
            <Button
              type="button"
              variant="outline"
              className="mt-3 h-9 rounded-xl border-app-border bg-app-panel text-app-text hover:bg-app-elevated hover:text-app-text"
              onClick={onRetry}
            >
              Tentar novamente
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  )
}
