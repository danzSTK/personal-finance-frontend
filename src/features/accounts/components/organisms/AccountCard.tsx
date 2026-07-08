import { useState, type KeyboardEvent, type ReactNode } from 'react'
import {
  Archive,
  ArrowDownLeft,
  ArrowUpRight,
  CircleDollarSign,
  Edit3,
  EllipsisVertical,
  Info,
  Landmark,
  ReceiptText,
  RotateCcw,
  SlidersHorizontal,
  Star,
} from 'lucide-react'
import { useIsMobile } from '@/shared/hooks/use-mobile'
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/shared/components/ui/sheet'
import type { Account } from '../../types/account.types'
import {
  canArchiveAccount,
  canSetDefaultAccount,
  getAccountColorOption,
  getAccountIcon,
  getAccountTypeLabel,
} from '../../utils/account.utils'

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
  const isMobile = useIsMobile()
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)

  const handleEditSelect = () => onEdit()
  const handleArchiveSelect = () => onArchive()
  const handleUnarchiveSelect = () => onUnarchive()
  const handleSetDefaultSelect = () => onSetDefault()
  const openDetails = () => setIsDetailsOpen(true)
  const handleCardKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key !== 'Enter' && event.key !== ' ') {
      return
    }

    event.preventDefault()
    openDetails()
  }

  return (
    <article
      role="button"
      tabIndex={0}
      onClick={openDetails}
      onKeyDown={handleCardKeyDown}
      className={cn(
        'group relative flex min-w-0 cursor-pointer flex-col gap-5 overflow-hidden rounded-2xl border border-border bg-secondary p-4 transition hover:-translate-y-0.5 hover:bg-accent focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
        account.isDefault &&
          'bg-gradient-to-t from-primary/25 via-secondary to-secondary',
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
            <div className="flex min-w-0 items-center gap-2">
              <h3 className="truncate text-base font-semibold text-foreground">
                {account.name}
              </h3>
              {account.isDefault ? (
                <Star className="h-3.5 w-3.5 shrink-0 text-primary" />
              ) : null}
              {account.isArchived ? (
                <Archive className="h-3.5 w-3.5 shrink-0 text-state-warning" />
              ) : null}
            </div>
            <p className="mt-1 truncate text-sm text-muted-foreground">
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

      <AccountBalanceRows
        account={account}
        projectedBalanceLabel={projectedBalanceLabel}
      />

      <Sheet
        open={isDetailsOpen && isMobile}
        onOpenChange={setIsDetailsOpen}
      >
        <SheetContent
          side="bottom"
          className="max-h-[90vh] overflow-y-auto rounded-t-3xl border-border bg-card px-4 pb-[max(env(safe-area-inset-bottom),1rem)] pt-5 lg:hidden"
        >
          <SheetHeader className="pr-8 text-left">
            <SheetTitle>{account.name}</SheetTitle>
            <SheetDescription className="sr-only">
              Detalhes desta conta.
            </SheetDescription>
          </SheetHeader>
          <AccountDetailsPanel
            account={account}
            projectedBalanceLabel={projectedBalanceLabel}
          />
        </SheetContent>
      </Sheet>

      <Dialog
        open={isDetailsOpen && !isMobile}
        onOpenChange={setIsDetailsOpen}
      >
        <DialogContent className="max-w-xl rounded-3xl border-border bg-card p-6 text-foreground">
          <DialogHeader className="pr-8">
            <DialogTitle>{account.name}</DialogTitle>
            <DialogDescription className="sr-only">
              Detalhes desta conta.
            </DialogDescription>
          </DialogHeader>
          <AccountDetailsPanel
            account={account}
            projectedBalanceLabel={projectedBalanceLabel}
            onEdit={() => {
              setIsDetailsOpen(false)
              onEdit()
            }}
            showEditAction
          />
        </DialogContent>
      </Dialog>
    </article>
  )
}

interface AccountBalanceRowsProps {
  account: Account
  projectedBalanceLabel: string
}

function AccountBalanceRows({
  account,
  projectedBalanceLabel,
}: AccountBalanceRowsProps) {
  return (
    <div className="space-y-3 p-1">
      <div className="flex items-center justify-between gap-4">
        <span className="text-sm font-semibold text-foreground">
          Saldo atual
        </span>
        <span className="numeric shrink-0 text-sm font-semibold text-foreground">
          {formatCurrencyFromCents(account.balance.currentCents)}
        </span>
      </div>

      <div className="flex items-center justify-between gap-4">
        <span className="inline-flex min-w-0 items-center gap-2 text-sm font-semibold text-foreground">
          <span className="truncate">{projectedBalanceLabel}</span>
          <Info className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
        </span>
        <span className="numeric shrink-0 text-sm font-semibold text-state-info">
          {typeof account.balance.projectedCents === 'number'
            ? formatCurrencyFromCents(account.balance.projectedCents)
            : 'Não calculado'}
        </span>
      </div>
    </div>
  )
}

interface AccountDetailsPanelProps {
  account: Account
  projectedBalanceLabel: string
  onEdit?: () => void
  showEditAction?: boolean
}

function AccountDetailsPanel({
  account,
  projectedBalanceLabel,
  onEdit,
  showEditAction = false,
}: AccountDetailsPanelProps) {
  return (
    <div className="mt-5 space-y-5 lg:mt-0">
      <div>
        <p className="text-sm font-medium text-muted-foreground">Saldo atual</p>
        <p className="numeric mt-2 text-4xl font-semibold tracking-tight text-foreground">
          {formatCurrencyFromCents(account.balance.currentCents)}
        </p>
        <p className="numeric mt-3 text-sm font-semibold text-state-info">
          {projectedBalanceLabel}:{' '}
          {typeof account.balance.projectedCents === 'number'
            ? formatCurrencyFromCents(account.balance.projectedCents)
            : 'Não calculado'}
        </p>
      </div>

      <Button
        type="button"
        variant="outline"
        className="h-11 w-full rounded-xl border-border bg-secondary text-muted-foreground"
        disabled
      >
        <SlidersHorizontal className="h-4 w-4" />
        Reajustar saldo
      </Button>

      {showEditAction && onEdit ? (
        <Button
          type="button"
          className="h-11 w-full rounded-xl bg-primary text-primary-foreground hover:bg-primary/90"
          onClick={onEdit}
        >
          <Edit3 className="h-4 w-4" />
          Editar conta
        </Button>
      ) : null}

      <dl className="grid grid-cols-2 gap-3">
        <AccountDetailItem
          label="Nome"
          icon={<Info className="h-4 w-4" />}
          iconTone="neutral"
        >
          {account.name}
        </AccountDetailItem>
        <AccountDetailItem
          label="Tipo da conta"
          icon={<Landmark className="h-4 w-4" />}
          iconTone="brand"
        >
          {getAccountTypeLabel(account.type)}
        </AccountDetailItem>
        <AccountDetailItem
          label="Saldo inicial"
          icon={<CircleDollarSign className="h-4 w-4" />}
          iconTone="info"
          isNumeric
        >
          {formatCurrencyFromCents(account.initialBalanceCents)}
        </AccountDetailItem>
        <AccountDetailItem
          label="Receitas"
          icon={<ArrowDownLeft className="h-4 w-4" />}
          iconTone="income"
          valueTone="income"
        >
          Em breve
        </AccountDetailItem>
        <AccountDetailItem
          label="Despesas"
          icon={<ArrowUpRight className="h-4 w-4" />}
          iconTone="expense"
          valueTone="expense"
        >
          Em breve
        </AccountDetailItem>
        <AccountDetailItem
          label="Total geral"
          icon={<Star className="h-4 w-4" />}
          iconTone="neutral"
          valueTone={account.includeInTotal ? 'income' : 'expense'}
        >
          {account.includeInTotal ? 'Incluída' : 'Fora do total'}
        </AccountDetailItem>
      </dl>
    </div>
  )
}

interface AccountDetailItemProps {
  label: string
  icon: ReactNode
  children: ReactNode
  iconTone: AccountDetailTone
  valueTone?: AccountDetailTone
  isNumeric?: boolean
}

type AccountDetailTone = 'neutral' | 'brand' | 'info' | 'income' | 'expense'

const accountDetailToneClasses: Record<AccountDetailTone, string> = {
  neutral: 'bg-card text-foreground',
  brand: 'bg-primary/10 text-primary',
  info: 'bg-state-info/10 text-state-info',
  income: 'bg-state-income/10 text-state-income',
  expense: 'bg-state-expense/10 text-state-expense',
}

const accountDetailValueClasses: Record<AccountDetailTone, string> = {
  neutral: 'text-foreground',
  brand: 'text-foreground',
  info: 'text-foreground',
  income: 'text-state-income',
  expense: 'text-state-expense',
}

function AccountDetailItem({
  label,
  icon,
  children,
  iconTone,
  valueTone = 'neutral',
  isNumeric = false,
}: AccountDetailItemProps) {
  return (
    <div className="min-w-0 border-b border-border py-3">
      <dt className="flex items-center gap-2 text-xs font-medium uppercase tracking-normal text-muted-foreground">
        <span
          className={cn(
            'inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg',
            accountDetailToneClasses[iconTone]
          )}
        >
          {icon}
        </span>
        {label}
      </dt>
      <dd
        className={cn(
          'mt-2 min-w-0 truncate text-sm font-medium',
          accountDetailValueClasses[valueTone],
          isNumeric && 'numeric'
        )}
      >
        {children}
      </dd>
    </div>
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
    <div
      onClick={(event) => event.stopPropagation()}
      onKeyDown={(event) => event.stopPropagation()}
    >
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
            <span className="ml-auto text-xs text-muted-foreground">
              Planejado
            </span>
          </DropdownMenuItem>
          <DropdownMenuItem disabled>
            <SlidersHorizontal className="h-4 w-4" />
            Reajuste de saldo
            <span className="ml-auto text-xs text-muted-foreground">
              Planejado
            </span>
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
    </div>
  )
}
