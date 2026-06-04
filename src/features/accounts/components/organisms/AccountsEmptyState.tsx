import { FolderOpen } from 'lucide-react'

export function AccountsEmptyState() {
  return (
    <div className="flex min-h-56 flex-col items-center justify-center rounded-2xl border border-dashed border-app-border bg-app-panel p-6 text-center">
      <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-brand/15 text-brand-soft">
        <FolderOpen className="h-6 w-6" />
      </span>
      <h3 className="mt-4 text-base font-semibold text-app-text">
        Nenhuma conta disponível ainda
      </h3>
      <p className="mt-2 max-w-md text-sm leading-6 text-app-muted">
        Sua carteira inicial pode levar alguns instantes para aparecer. Você
        também pode cadastrar uma conta bancária.
      </p>
    </div>
  )
}
