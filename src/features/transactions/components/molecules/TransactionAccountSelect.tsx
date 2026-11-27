import type { ReactNode } from 'react'
import { CircleDashed } from 'lucide-react'
import { AccountIdentity } from '@/features/accounts'
import type { Account } from '@/features/accounts/types/account.types'
import { cn } from '@/shared/lib/utils'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from '@/shared/components/ui/select'

const DEFAULT_TRIGGER_CLASS_NAME =
  'h-11 w-full min-w-0 rounded-xl border-border bg-secondary text-foreground focus:ring-0 focus:ring-offset-0 focus-visible:ring-0 focus-visible:ring-offset-0'

export interface AccountSelectLabelProps {
  account: Account | null
  fallback?: string
  trailing?: ReactNode
}

/** Displays an account's visual identity and truncated name inside select triggers and options. */
export function AccountSelectLabel({
  account,
  fallback = 'Conta',
  trailing,
}: AccountSelectLabelProps) {
  if (!account) {
    return (
      <div className="flex min-w-0 items-center gap-2">
        <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-state-info/10 text-state-info">
          <CircleDashed className="h-4 w-4" />
        </span>
        <span className="truncate">{fallback}</span>
      </div>
    )
  }

  if (trailing) {
    return (
      <div className="flex min-w-0 flex-1 items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <AccountIdentity account={account} size="sm" />
          <span className="truncate">{account.name}</span>
        </div>
        {trailing}
      </div>
    )
  }

  return (
    <div className="flex min-w-0 items-center gap-2">
      <AccountIdentity account={account} size="sm" />
      <span className="truncate">{account.name}</span>
    </div>
  )
}

export interface TransactionAccountSelectProps {
  accounts: Account[]
  value: string
  onValueChange: (value: string) => void
  placeholder?: string
  ariaLabel?: string
  invalid?: boolean
  disabled?: boolean
  triggerClassName?: string
}

/** Reusable account selector displaying each account's visual identity. */
export function TransactionAccountSelect({
  accounts,
  value,
  onValueChange,
  placeholder = 'Escolha uma conta',
  ariaLabel = 'Conta',
  invalid = false,
  disabled = false,
  triggerClassName,
}: TransactionAccountSelectProps) {
  const selectedAccount =
    accounts.find((account) => account.id === value) ?? null

  return (
    <Select value={value} onValueChange={onValueChange} disabled={disabled}>
      <SelectTrigger
        aria-label={ariaLabel}
        aria-invalid={invalid}
        className={cn(DEFAULT_TRIGGER_CLASS_NAME, triggerClassName)}
      >
        <AccountSelectLabel account={selectedAccount} fallback={placeholder} />
      </SelectTrigger>
      <SelectContent className="border-border bg-card text-foreground">
        {accounts.map((account) => (
          <SelectItem
            key={account.id}
            value={account.id}
            hideIndicator
            className="focus:bg-accent focus:text-foreground"
          >
            <AccountSelectLabel account={account} />
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
