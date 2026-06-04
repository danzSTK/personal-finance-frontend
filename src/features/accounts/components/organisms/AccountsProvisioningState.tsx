import { LoaderCircle } from 'lucide-react'
import { cn } from '@/shared/lib/utils'

interface AccountsProvisioningStateProps {
  isRefreshing: boolean
}

export function AccountsProvisioningState({
  isRefreshing,
}: AccountsProvisioningStateProps) {
  return (
    <div className="flex min-h-56 flex-col items-center justify-center rounded-2xl border border-dashed border-brand/30 bg-brand/10 p-6 text-center">
      <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-brand/15 text-brand-soft">
        <LoaderCircle
          className={cn('h-6 w-6', isRefreshing && 'animate-spin')}
          aria-hidden
        />
      </span>
      <h3 className="mt-4 text-base font-semibold text-app-text">
        Preparando sua carteira inicial
      </h3>
      <p className="mt-2 max-w-md text-sm leading-6 text-app-muted">
        Estamos organizando sua primeira conta. Isso costuma levar poucos
        segundos.
      </p>
    </div>
  )
}
