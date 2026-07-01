import {
  Archive,
  CheckCircle2,
  Edit3,
  EllipsisVertical,
  EyeOff,
  ReceiptText,
  RotateCcw,
  SlidersHorizontal,
  Star,
} from 'lucide-react'
import { Button } from '@/shared/lib/button'
import { cn } from '@/shared/lib/utils'
import { formatCurrencyFromCents } from '@/shared/utils/formatters'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu'
import type { Account } from '../../types/account.types'
import {
  canArchiveAccount,
  canSetDefaultAccount,
  getAccountColorOption,
  getAccountIcon,
  getAccountTypeLabel,
} from '../../utils/account.utils'
import { AccountStatusPill } from '../molecules/AccountStatusPill'

interface AccountCardProps {
  account: Account
  isMutating: boolean
  projectedBalanceLabel: string
  colorOptions?: Parameters<typeof getAccountColorOption>[1]
  onEdit: () => void
  onArchive: () => void
  onUnarchive: () => void
  onSetDefault: () => void
}

export function AccountCard({
  account,
  isMutating,
  projectedBalanceLabel,
  colorOptions,
  onEdit,
  onArchive,
  onUnarchive,
  onSetDefault,
}: AccountCardProps) {
  const Icon = getAccountIcon(account)
  const colorOption = getAccountColorOption(account.color, colorOptions)
  const canArchive = canArchiveAccount(account)
  const canDefault = canSetDefaultAccount(account)

  const handleEditSelect = () => onEdit()
  const handleArchiveSelect = () => onArchive()
  const handleUnarchiveSelect = () => onUnarchive()
  const handleSetDefaultSelect = () => onSetDefault()

  return (
    <article
      className={cn(
        'group relative flex min-h-56 min-w-0 flex-col justify-between overflow-hidden rounded-2xl border border-border bg-secondary p-4 transition hover:-translate-y-0.5 hover:bg-accent',
        account.isArchived && 'opacity-75'
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <span
            className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-foreground"
            style={{ backgroundColor: colorOption.hex }}
            aria-hidden
          >
            <Icon className="h-5 w-5" />
          </span>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="truncate text-base font-semibold text-foreground">
                {account.name}
              </h3>
              {account.isDefault ? (
                <AccountStatusPill
                  icon={<Star className="h-3 w-3" />}
                  label="Padrão"
                  tone="brand"
                />
              ) : null}
              {account.isArchived ? (
                <AccountStatusPill
                  icon={<Archive className="h-3 w-3" />}
                  label="Arquivada"
                  tone="warning"
                />
              ) : null}
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              {getAccountTypeLabel(account.type)}
            </p>
          </div>
        </div>

        <AccountActionsMenu
          accountName={account.name}
          canArchive={canArchive}
          canDefault={canDefault}
          isArchived={account.isArchived}
          isMutating={isMutating}
          onArchive={handleArchiveSelect}
          onEdit={handleEditSelect}
          onSetDefault={handleSetDefaultSelect}
          onUnarchive={handleUnarchiveSelect}
        />
      </div>

      <div className="space-y-4">
        <div className="grid gap-3">
          <div>
            <p className="text-xs font-medium uppercase text-muted-foreground">
              Saldo atual
            </p>
            <p className="numeric mt-1 text-2xl font-semibold tracking-tight text-foreground">
              {formatCurrencyFromCents(account.balance.currentCents)}
            </p>
          </div>

          <div className="rounded-xl border border-border bg-card px-3 py-2">
            <p className="text-xs font-medium text-muted-foreground">
              {projectedBalanceLabel}
            </p>
            <p className="numeric mt-1 text-sm font-semibold text-state-info">
              {typeof account.balance.projectedCents === 'number'
                ? formatCurrencyFromCents(account.balance.projectedCents)
                : 'Não calculado'}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-2 rounded-lg bg-card px-3 py-2">
            {account.includeInTotal ? (
              <CheckCircle2 className="h-3.5 w-3.5 text-state-income" />
            ) : (
              <EyeOff className="h-3.5 w-3.5 text-muted-foreground" />
            )}
            {account.includeInTotal ? 'Entra no total' : 'Fora do total'}
          </span>
        </div>
      </div>
    </article>
  )
}

interface AccountActionsMenuProps {
  accountName: string
  canArchive: boolean
  canDefault: boolean
  isArchived: boolean
  isMutating: boolean
  onEdit: () => void
  onArchive: () => void
  onUnarchive: () => void
  onSetDefault: () => void
}

function AccountActionsMenu({
  accountName,
  canArchive,
  canDefault,
  isArchived,
  isMutating,
  onEdit,
  onArchive,
  onUnarchive,
  onSetDefault,
}: AccountActionsMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-9 w-9 shrink-0 rounded-lg text-muted-foreground hover:bg-card hover:text-foreground"
          aria-label={`Abrir ações de ${accountName}`}
        >
          <EllipsisVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-60 border-border bg-card text-foreground"
      >
        <DropdownMenuLabel className="text-xs text-muted-foreground">
          Ações da conta
        </DropdownMenuLabel>

        {!isArchived ? (
          <DropdownMenuItem
            className="focus:bg-accent focus:text-foreground"
            onSelect={onEdit}
          >
            <Edit3 className="h-4 w-4" />
            Editar
          </DropdownMenuItem>
        ) : null}

        {canDefault ? (
          <DropdownMenuItem
            className="focus:bg-accent focus:text-foreground"
            disabled={isMutating}
            onSelect={onSetDefault}
          >
            <Star className="h-4 w-4" />
            Tornar padrão
          </DropdownMenuItem>
        ) : null}

        <DropdownMenuSeparator className="bg-border" />

        <DropdownMenuItem disabled>
          <ReceiptText className="h-4 w-4" />
          Ver transações
          <span className="ml-auto text-xs text-muted-foreground">Planejado</span>
        </DropdownMenuItem>
        <DropdownMenuItem disabled>
          <SlidersHorizontal className="h-4 w-4" />
          Reajuste de saldo
          <span className="ml-auto text-xs text-muted-foreground">Planejado</span>
        </DropdownMenuItem>

        <DropdownMenuSeparator className="bg-border" />

        {isArchived ? (
          <DropdownMenuItem
            className="focus:bg-accent focus:text-foreground"
            disabled={isMutating}
            onSelect={onUnarchive}
          >
            <RotateCcw className="h-4 w-4" />
            Restaurar
          </DropdownMenuItem>
        ) : (
          <DropdownMenuItem
            className="text-destructive focus:bg-destructive/10 focus:text-destructive"
            disabled={!canArchive || isMutating}
            onSelect={onArchive}
          >
            <Archive className="h-4 w-4" />
            Arquivar
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
