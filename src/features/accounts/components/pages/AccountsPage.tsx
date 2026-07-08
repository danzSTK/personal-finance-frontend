import { useEffect, useMemo, useState } from 'react'
import {
  ChevronLeft,
  ChevronRight,
  CircleDollarSign,
  Clock3,
  EllipsisVertical,
} from 'lucide-react'
import { AuthAppShell } from '@/features/auth/components/templates/AuthAppShell'
import { useCategoryMetadata } from '@/features/categories/api/queries'
import { ApiErrorAlert } from '@/shared/components/molecules/ApiErrorAlert'
import { resolveApiError } from '@/shared/errors'
import { Button } from '@/shared/lib/button'
import { cn } from '@/shared/lib/utils'
import { formatCurrencyFromCents } from '@/shared/utils/formatters'
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/shared/components/ui/alert-dialog'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu'
import { useAccountSummary, useAccounts } from '../../api/queries'
import {
  useArchiveAccount,
  useSetDefaultAccount,
  useUnarchiveAccount,
} from '../../api/mutations'
import { mergeAccountColorMetadata } from '../../constants/account.constants'
import type { Account } from '../../types/account.types'
import type { AccountSheetState } from '../../types/account-ui.types'
import {
  compareYearMonth,
  formatAccountMonthYearLabel,
  getCurrentYearMonth,
  getMonthEndDateOnly,
} from '../../utils/accountPeriod.utils'
import { AddAccountButton } from '../molecules/AddAccountButton'
import { AccountSummaryCard } from '../molecules/AccountSummaryCard'
import { AccountsPeriodPicker } from '../molecules/AccountsPeriodPicker'
import { CreateAccountCard } from '../molecules/CreateAccountCard'
import { AccountCard } from '../organisms/AccountCard'
import { AccountFormSheet } from '../organisms/AccountFormSheet'
import { AccountsEmptyState } from '../organisms/AccountsEmptyState'
import { AccountsErrorState } from '../organisms/AccountsErrorState'
import { AccountsProvisioningState } from '../organisms/AccountsProvisioningState'
import { AccountsSkeleton } from '../organisms/AccountsSkeleton'

const DEFAULT_ACCOUNT_PROVISION_MAX_ATTEMPTS = 4
const DEFAULT_ACCOUNT_PROVISION_RETRY_MS = 1800

export function AccountsPage() {
  const [includeArchived, setIncludeArchived] = useState(false)
  const [selectedPeriod, setSelectedPeriod] = useState(getCurrentYearMonth)
  const [sheetState, setSheetState] = useState<AccountSheetState>(null)
  const [archiveTarget, setArchiveTarget] = useState<Account | null>(null)
  const [defaultProvisionAttempts, setDefaultProvisionAttempts] = useState(0)
  const { data: visualMetadata } = useCategoryMetadata()
  const accountColorOptions = useMemo(
    () => mergeAccountColorMetadata(visualMetadata?.colors),
    [visualMetadata?.colors]
  )
  const projectedUntil = useMemo(
    () => getMonthEndDateOnly(selectedPeriod),
    [selectedPeriod]
  )
  const periodRelation = useMemo(
    () => compareYearMonth(selectedPeriod),
    [selectedPeriod]
  )
  const projectedSummaryLabel =
    periodRelation === 'past'
      ? `Saldo no fim de ${formatAccountMonthYearLabel(selectedPeriod)}`
      : 'Saldo previsto'
  const projectedAccountLabel =
    periodRelation === 'past' ? 'Saldo no fim do período' : 'Saldo previsto'

  const {
    data: accounts = [],
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useAccounts({
    includeArchived,
    projectedUntil,
  })
  const {
    data: accountSummary,
    isLoading: isAccountSummaryLoading,
    isError: isAccountSummaryError,
    error: accountSummaryError,
    refetch: refetchAccountSummary,
  } = useAccountSummary({ projectedUntil })
  const archiveMutation = useArchiveAccount()
  const unarchiveMutation = useUnarchiveAccount()
  const setDefaultMutation = useSetDefaultAccount()

  const visibleAccounts = useMemo(
    () =>
      includeArchived
        ? accounts
        : accounts.filter((account) => !account.isArchived),
    [accounts, includeArchived]
  )
  const hasProjectedBalance =
    typeof accountSummary?.projectedCents === 'number'
  const hasAccounts = accounts.length > 0
  const hasVisibleAccounts = visibleAccounts.length > 0
  const isWaitingForDefaultProvisioning =
    !includeArchived &&
    !isLoading &&
    !isError &&
    !hasAccounts &&
    defaultProvisionAttempts < DEFAULT_ACCOUNT_PROVISION_MAX_ATTEMPTS
  const isMutatingAccount =
    archiveMutation.isPending ||
    unarchiveMutation.isPending ||
    setDefaultMutation.isPending

  useEffect(() => {
    setDefaultProvisionAttempts(0)
  }, [includeArchived])

  useEffect(() => {
    if (hasAccounts) {
      setDefaultProvisionAttempts(0)
    }
  }, [hasAccounts])

  useEffect(() => {
    if (!isWaitingForDefaultProvisioning || isFetching) {
      return
    }

    const retryId = window.setTimeout(() => {
      setDefaultProvisionAttempts((attempts) => attempts + 1)
      void refetch()
    }, DEFAULT_ACCOUNT_PROVISION_RETRY_MS)

    return () => window.clearTimeout(retryId)
  }, [isFetching, isWaitingForDefaultProvisioning, refetch])

  const handleArchive = () => {
    if (!archiveTarget) {
      return
    }

    archiveMutation.mutate(archiveTarget.id, {
      onSuccess: () => setArchiveTarget(null),
    })
  }

  const closeArchiveDialog = () => {
    archiveMutation.reset()
    setArchiveTarget(null)
  }

  const openCreateSheet = () => setSheetState({ mode: 'create' })
  const changePeriodByMonths = (delta: number) =>
    setSelectedPeriod((period) => shiftAccountPeriod(period, delta))

  return (
    <AuthAppShell
      activeSection="accounts"
      title="Contas"
      subtitle="Contas bancárias e saldos"
    >
      <div className="space-y-5">
        <section className="space-y-4" aria-labelledby="accounts-title">
          <div className="flex items-start justify-between gap-3 sm:items-center">
            <div className="min-w-0">
              <h1
                id="accounts-title"
                className="text-2xl font-semibold tracking-tight text-foreground"
              >
                Contas
              </h1>
            </div>

            <div className="flex shrink-0 items-center gap-2">
              <AddAccountButton onClick={openCreateSheet} />

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className={cn(
                      'h-11 w-11 rounded-xl border-border bg-secondary text-foreground hover:bg-accent hover:text-foreground',
                      includeArchived &&
                        'border-primary bg-primary/15 text-primary hover:text-primary'
                    )}
                    aria-label="Mais opções de contas"
                    title="Mais opções"
                  >
                    <EllipsisVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-64 rounded-2xl border-border bg-card p-2 text-foreground"
                >
                  <DropdownMenuLabel className="text-xs text-muted-foreground">
                    Visualização
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-border" />
                  <DropdownMenuCheckboxItem
                    checked={includeArchived}
                    className="rounded-xl focus:bg-accent focus:text-foreground"
                    onCheckedChange={(checked) =>
                      setIncludeArchived(checked === true)
                    }
                  >
                    Mostrar contas arquivadas
                  </DropdownMenuCheckboxItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </section>

        <section className="space-y-3" aria-label="Resumo de saldos">
          <div className="flex justify-center sm:justify-end">
            <div className="flex items-center justify-center gap-4 sm:justify-end">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-10 w-10 rounded-full text-muted-foreground hover:bg-secondary hover:text-foreground"
                onClick={() => changePeriodByMonths(-1)}
                aria-label="Mês anterior"
                title="Mês anterior"
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <AccountsPeriodPicker
                value={selectedPeriod}
                onChange={setSelectedPeriod}
                triggerClassName="min-w-36"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-10 w-10 rounded-full text-muted-foreground hover:bg-secondary hover:text-foreground"
                onClick={() => changePeriodByMonths(1)}
                aria-label="Próximo mês"
                title="Próximo mês"
              >
                <ChevronRight className="h-5 w-5" />
              </Button>
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <AccountSummaryCard
              icon={<CircleDollarSign className="h-4 w-4" />}
              label="Saldo atual"
              value={
                accountSummary
                  ? formatCurrencyFromCents(accountSummary.currentCents)
                  : isAccountSummaryLoading
                    ? 'Carregando'
                    : 'Não carregado'
              }
              tone="brand"
              isNumeric={Boolean(accountSummary)}
            />
            <AccountSummaryCard
              icon={<Clock3 className="h-4 w-4" />}
              label={projectedSummaryLabel}
              value={
                hasProjectedBalance
                  ? formatCurrencyFromCents(accountSummary.projectedCents)
                  : isAccountSummaryLoading
                    ? 'Carregando'
                    : 'Não calculado'
              }
              tone="info"
              isNumeric={hasProjectedBalance}
            />
          </div>

          {isAccountSummaryError ? (
            <ApiErrorAlert
              error={resolveApiError(accountSummaryError, 'accounts.summary')}
              onRetry={() => void refetchAccountSummary()}
            />
          ) : null}
        </section>

        <section className="space-y-4" aria-label="Lista de contas">

          {isFetching && !isLoading ? (
            <span className="block text-xs font-medium text-muted-foreground">
              Atualizando contas...
            </span>
          ) : null}

          {isLoading ? <AccountsSkeleton /> : null}

          {!isLoading && isError ? (
            <AccountsErrorState error={error} onRetry={() => void refetch()} />
          ) : null}

          {!isLoading &&
          !isError &&
          !hasAccounts &&
          isWaitingForDefaultProvisioning ? (
            <AccountsProvisioningState isRefreshing={isFetching} />
          ) : null}

          {!isLoading && !isError && !isWaitingForDefaultProvisioning ? (
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              <CreateAccountCard onCreate={openCreateSheet} />
              {hasVisibleAccounts ? (
                visibleAccounts.map((account) => (
                  <AccountCard
                    key={account.id}
                    account={account}
                    isMutating={isMutatingAccount}
                    projectedBalanceLabel={projectedAccountLabel}
                    colorOptions={accountColorOptions}
                    onEdit={() => setSheetState({ mode: 'edit', account })}
                    onArchive={() => setArchiveTarget(account)}
                    onUnarchive={() => unarchiveMutation.mutate(account.id)}
                    onSetDefault={() => setDefaultMutation.mutate(account.id)}
                  />
                ))
              ) : (
                <div className="min-w-0 sm:col-span-1 xl:col-span-2">
                  <AccountsEmptyState />
                </div>
              )}
            </div>
          ) : null}
        </section>
      </div>

      <AccountFormSheet
        state={sheetState}
        onOpenChange={(isOpen) => {
          if (!isOpen) {
            setSheetState(null)
          }
        }}
      />

      <AlertDialog
        open={archiveTarget !== null}
        onOpenChange={(isOpen) => {
          if (!isOpen) {
            closeArchiveDialog()
          }
        }}
      >
        <AlertDialogContent className="border-border bg-card text-foreground">
          <AlertDialogHeader>
            <AlertDialogTitle>Arquivar conta?</AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              {archiveTarget
                ? `${archiveTarget.name} deixará de aparecer na lista principal, mas o histórico permanece preservado.`
                : 'A conta deixará de aparecer na lista principal.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          {archiveMutation.error ? (
            <ApiErrorAlert
              error={resolveApiError(archiveMutation.error, 'accounts.archive')}
            />
          ) : null}
          <AlertDialogFooter>
            <AlertDialogCancel className="border-border bg-secondary text-foreground hover:bg-accent hover:text-foreground">
              Cancelar
            </AlertDialogCancel>
            <Button
              type="button"
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleArchive}
              disabled={archiveMutation.isPending}
            >
              {archiveMutation.isPending ? 'Arquivando...' : 'Arquivar'}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AuthAppShell>
  )
}

const shiftAccountPeriod = (
  period: { year: number; month: number },
  delta: number
) => {
  const monthIndex = period.year * 12 + (period.month - 1) + delta

  return {
    year: Math.floor(monthIndex / 12),
    month: (monthIndex % 12) + 1,
  }
}
