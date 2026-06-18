import { useEffect, useMemo, useState } from 'react'
import { CircleDollarSign, Clock3, EllipsisVertical } from 'lucide-react'
import { AuthAppShell } from '@/features/auth/components/templates/AuthAppShell'
import { ApiErrorAlert } from '@/shared/components/molecules/ApiErrorAlert'
import { resolveApiError } from '@/shared/errors'
import { Button } from '@/shared/lib/button'
import { cn } from '@/shared/lib/utils'
import { formatCurrency } from '@/shared/utils/formatters'
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
import { useAccounts } from '../../api/queries'
import {
  useArchiveAccount,
  useSetDefaultAccount,
  useUnarchiveAccount,
} from '../../api/mutations'
import type { Account } from '../../types/account.types'
import type { AccountSheetState } from '../../types/account-ui.types'
import { buildAccountSummary } from '../../utils/account.utils'
import { AddAccountButton } from '../molecules/AddAccountButton'
import { AccountSummaryCard } from '../molecules/AccountSummaryCard'
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
  const [sheetState, setSheetState] = useState<AccountSheetState>(null)
  const [archiveTarget, setArchiveTarget] = useState<Account | null>(null)
  const [defaultProvisionAttempts, setDefaultProvisionAttempts] = useState(0)

  const {
    data: accounts = [],
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useAccounts({
    includeArchived,
  })
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
  const summary = useMemo(() => buildAccountSummary(accounts), [accounts])
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

  return (
    <AuthAppShell
      activeSection="accounts"
      title="Contas"
      subtitle="Ações de contas, cartões e investimentos"
    >
      <div className="space-y-5">
        <section
          className="grid gap-3 md:grid-cols-2"
          aria-label="Resumo de saldos"
        >
          <AccountSummaryCard
            icon={<CircleDollarSign className="h-4 w-4" />}
            label="Saldo atual"
            value={formatCurrency(summary.totalInitialBalance)}
            helper="Soma dos saldos iniciais das contas incluídas no total."
            tone="brand"
          />
          <AccountSummaryCard
            icon={<Clock3 className="h-4 w-4" />}
            label="Saldo previsto"
            value="A calcular"
            helper="Será calculado quando houver lançamentos futuros."
            tone="info"
            isNumeric={false}
          />
        </section>

        <section className="space-y-4" aria-labelledby="accounts-title">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <h1
                id="accounts-title"
                className="text-2xl font-semibold tracking-tight text-app-text"
              >
                Contas
              </h1>
              <p className="mt-1 max-w-2xl text-sm leading-6 text-app-muted">
                Gerencie contas e use o menu de cada card para ações rápidas.
              </p>
            </div>

            <div className="flex items-center gap-2 self-start">
              <AddAccountButton onClick={openCreateSheet} />

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className={cn(
                      'h-11 w-11 rounded-xl border-app-border bg-app-panel text-app-text hover:bg-app-elevated hover:text-app-text',
                      includeArchived &&
                        'border-brand bg-brand/15 text-brand-soft hover:text-brand-soft'
                    )}
                    aria-label="Mais opções de contas"
                    title="Mais opções"
                  >
                    <EllipsisVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-64 rounded-2xl border-app-border bg-app-surface p-2 text-app-text"
                >
                  <DropdownMenuLabel className="text-xs text-app-muted">
                    Visualização
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-app-border" />
                  <DropdownMenuCheckboxItem
                    checked={includeArchived}
                    className="rounded-xl focus:bg-app-elevated focus:text-app-text"
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

          {isFetching && !isLoading ? (
            <span className="block text-xs font-medium text-app-muted">
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
        <AlertDialogContent className="border-app-border bg-app-surface text-app-text">
          <AlertDialogHeader>
            <AlertDialogTitle>Arquivar conta?</AlertDialogTitle>
            <AlertDialogDescription className="text-app-muted">
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
            <AlertDialogCancel className="border-app-border bg-app-panel text-app-text hover:bg-app-elevated hover:text-app-text">
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
