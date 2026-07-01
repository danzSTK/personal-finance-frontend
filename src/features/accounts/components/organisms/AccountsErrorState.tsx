import { ApiErrorAlert } from '@/shared/components/molecules/ApiErrorAlert'
import { resolveApiError } from '@/shared/errors'

interface AccountsErrorStateProps {
  error: unknown
  onRetry: () => void
}

export function AccountsErrorState({
  error,
  onRetry,
}: AccountsErrorStateProps) {
  return (
    <div className="min-h-56 rounded-2xl border border-border bg-card p-6">
      <ApiErrorAlert
        error={resolveApiError(error, 'accounts.list')}
        onRetry={onRetry}
      />
    </div>
  )
}
