import { Plus, WalletCards } from 'lucide-react'

interface CreateAccountCardProps {
  onCreate: () => void
}

export function CreateAccountCard({ onCreate }: CreateAccountCardProps) {
  return (
    <button
      type="button"
      className="group flex min-h-56 min-w-0 flex-col justify-between rounded-2xl border border-dashed border-brand/40 bg-brand/10 p-4 text-left transition hover:border-brand hover:bg-brand/15 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-app-bg"
      onClick={onCreate}
      aria-label="Criar nova conta"
    >
      <span className="flex items-center justify-between gap-3">
        <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-brand text-brand-foreground transition group-hover:bg-brand-intense">
          <Plus className="h-5 w-5" />
        </span>
        <WalletCards className="h-5 w-5 text-brand-soft" aria-hidden />
      </span>

      <span className="block space-y-2">
        <span className="block text-base font-semibold text-app-text">
          Nova conta
        </span>
        <span className="block text-sm leading-6 text-app-muted">
          Cadastre banco, cartão ou investimento para organizar suas ações
          financeiras.
        </span>
      </span>
    </button>
  )
}
