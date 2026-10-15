import type { Account, AccountTemplate } from '../../types/account.types'
import { AccountIdentity } from './AccountIdentity'

interface AccountFormIdentityHeaderProps {
  account: Account | null
  template: AccountTemplate | null
  isInstitutional: boolean
}

export function AccountFormIdentityHeader({
  account,
  template,
  isInstitutional,
}: AccountFormIdentityHeaderProps) {
  if (!isInstitutional) {
    return (
      <div className="rounded-2xl border border-app-border bg-app-panel p-4">
        <p className="text-sm font-semibold text-app-text">
          Identidade personalizada
        </p>
        <p className="mt-1 text-xs leading-5 text-app-muted">
          Escolha uma cor e um ícone para reconhecer esta conta.
        </p>
      </div>
    )
  }

  const institutionalAccount =
    account ??
    (template
      ? {
          name: template.name,
          type: 'BANK' as const,
          color: null,
          icon: null,
          template,
        }
      : null)

  if (!institutionalAccount) return null

  return (
    <div className="flex items-center gap-3 rounded-2xl border border-app-border bg-app-panel p-4">
      <AccountIdentity account={institutionalAccount} size="lg" />
      <div className="min-w-0">
        <p className="truncate text-base font-semibold text-app-text">
          {template?.name ?? account?.template?.name ?? account?.name}
        </p>
        <p className="mt-1 text-xs text-app-muted">Identidade institucional</p>
      </div>
    </div>
  )
}
