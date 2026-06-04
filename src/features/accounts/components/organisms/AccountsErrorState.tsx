import { Archive } from 'lucide-react'
import { Button } from '@/shared/lib/button'

interface AccountsErrorStateProps {
  onRetry: () => void
}

export function AccountsErrorState({ onRetry }: AccountsErrorStateProps) {
  return (
    <div className="flex min-h-56 flex-col items-center justify-center rounded-2xl border border-destructive/40 bg-destructive/10 p-6 text-center">
      <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-destructive/15 text-destructive">
        <Archive className="h-6 w-6" />
      </span>
      <h3 className="mt-4 text-base font-semibold text-app-text">
        Não foi possível carregar suas contas
      </h3>
      <p className="mt-2 max-w-md text-sm leading-6 text-app-muted">
        Verifique sua sessão ou tente novamente. Se o problema continuar,
        nenhuma ação financeira será perdida.
      </p>
      <Button
        type="button"
        className="mt-4 h-10 rounded-xl bg-brand px-4 text-brand-foreground hover:bg-brand-intense"
        onClick={onRetry}
      >
        Tentar novamente
      </Button>
    </div>
  )
}
