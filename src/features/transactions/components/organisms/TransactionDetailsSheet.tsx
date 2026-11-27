import { useMemo, type CSSProperties, type ReactNode } from 'react'
import {
  ArrowLeftRight,
  Edit3,
  QrCode,
  SlidersHorizontal,
  Trash2,
  TrendingDown,
  TrendingUp,
} from 'lucide-react'
import { AccountIdentity } from '@/features/accounts'
import type { Account } from '@/features/accounts/types/account.types'
import type { Category } from '@/features/categories/types/category.types'
import {
  getCategoryColorOption,
  getCategoryColorToken,
  getCategoryIconKey,
  getCategoryIconOption,
} from '@/features/categories/utils/category.utils'
import {
  type FiscalNoteDetail,
  FiscalNoteSummaryCard,
  useTransactionFiscalNote,
} from '@/features/fiscal-notes'
import { ApiErrorAlert } from '@/shared/components/molecules/ApiErrorAlert'
import { Button } from '@/shared/components/ui/button'
import { Skeleton } from '@/shared/components/ui/skeleton'
import { resolveApiError } from '@/shared/errors'
import { useIsMobile } from '@/shared/hooks/use-mobile'
import { cn } from '@/shared/lib/utils'
import { formatCurrencyFromCents } from '@/shared/utils/formatters'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/shared/components/ui/sheet'
import type { Transaction } from '../../types/transaction.types'
import type { TransactionDetailsSheetState } from '../../types/transaction-ui.types'
import {
  formatSignedTransactionAmount,
  formatTransactionDate,
  getAccountName,
  getCategoryName,
  getConfirmActionLabel,
  getTransactionAmountClassName,
  getTransactionCreatedDescription,
  getTransactionDateLabel,
  getTransactionDerivedStatus,
  getTransactionDescription,
  getTransactionDirectionLabel,
  getTransactionTypeLabel,
  getTransactionTypeIcon,
} from '../../utils/transaction.utils'
import { TransactionStatusPill } from '../molecules/TransactionStatusPill'
import { TransactionAttachmentsGallery } from './TransactionAttachmentsGallery'

interface TransactionDetailsSheetProps {
  state: TransactionDetailsSheetState
  accounts: Account[]
  categories: Category[]
  onOpenChange: (isOpen: boolean) => void
  onConfirm: () => void
  onDelete: () => void
  onEdit: () => void
  onLinkFiscalNote?: (transaction: Transaction) => void
  onViewFiscalNote?: (fiscalNote: FiscalNoteDetail) => void
  onUnlinkFiscalNote?: (
    transaction: Transaction,
    fiscalNote: FiscalNoteDetail
  ) => void
}

export function TransactionDetailsSheet({
  state,
  accounts,
  categories,
  onOpenChange,
  onConfirm,
  onDelete,
  onEdit,
  onLinkFiscalNote,
  onViewFiscalNote,
  onUnlinkFiscalNote,
}: TransactionDetailsSheetProps) {
  const transaction = state?.transaction ?? null
  const isMobile = useIsMobile()
  const isExpense = transaction?.type === 'EXPENSE'
  const fiscalNoteQuery = useTransactionFiscalNote(transaction?.id, {
    enabled: Boolean(transaction && isExpense && transaction.hasFiscalNote),
  })
  const fiscalNoteErrorPresentation = useMemo(
    () =>
      fiscalNoteQuery.error
        ? resolveApiError(fiscalNoteQuery.error, 'fiscal-notes.get')
        : null,
    [fiscalNoteQuery.error]
  )
  const derivedStatus = transaction
    ? getTransactionDerivedStatus(transaction)
    : 'PENDING'

  return (
    <Sheet open={transaction !== null} onOpenChange={onOpenChange}>
      <SheetContent
        side={isMobile ? 'bottom' : 'right'}
        className="flex max-h-[calc(100dvh-1rem)] w-full flex-col overflow-hidden rounded-t-3xl border-border bg-card p-0 text-foreground md:h-full md:max-h-none md:rounded-none md:sm:max-w-lg"
      >
        {transaction ? (
          <>
            <div className="overflow-y-auto p-6">
              <SheetHeader className="p-0 pr-8 text-left">
                <SheetTitle className="text-foreground">
                  {getTransactionDescription(transaction)}
                </SheetTitle>
                <SheetDescription className="text-muted-foreground">
                  {getTransactionCreatedDescription(transaction)}
                </SheetDescription>
              </SheetHeader>

              <div className="mt-6 rounded-2xl border border-border bg-secondary p-4">
                <p
                  className={cn(
                    'numeric text-2xl font-semibold',
                    getTransactionAmountClassName(
                      transaction.type,
                      transaction.direction
                    )
                  )}
                >
                  {formatSignedTransactionAmount(
                    transaction,
                    formatCurrencyFromCents
                  )}
                </p>
              </div>

              <dl className="mt-5 grid grid-cols-2 gap-3">
                <DetailItem label="Tipo">
                  <TransactionTypeDetail transaction={transaction} />
                </DetailItem>
                <DetailItem label="Situação">
                  <TransactionStatusPill status={derivedStatus} />
                </DetailItem>
                {transaction.type === 'ADJUSTMENT' ? (
                  <DetailItem label="Direção">
                    <span className="inline-flex min-w-0 items-center gap-2">
                      <span
                        className={cn(
                          'inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg',
                          transaction.direction === 'INCREASE'
                            ? 'bg-state-income/10 text-state-income'
                            : transaction.direction === 'DECREASE'
                              ? 'bg-state-expense/10 text-state-expense'
                              : 'bg-state-info/10 text-state-info'
                        )}
                      >
                        {transaction.direction === 'DECREASE' ? (
                          <TrendingDown className="h-4 w-4" />
                        ) : (
                          <TrendingUp className="h-4 w-4" />
                        )}
                      </span>
                      <span className="truncate">
                        {getTransactionDirectionLabel(
                          transaction.direction,
                          'full'
                        )}
                      </span>
                    </span>
                  </DetailItem>
                ) : null}
                <DetailItem label={getTransactionDateLabel(transaction.type)}>
                  <span className="numeric">
                    {formatTransactionDate(transaction.date)}
                  </span>
                </DetailItem>
                <DetailItem label="Categoria">
                  <TransactionCategoryDetail
                    transaction={transaction}
                    categories={categories}
                  />
                </DetailItem>
                <DetailItem
                  label={
                    transaction.type === 'TRANSFER'
                      ? 'Conta de origem'
                      : 'Conta'
                  }
                >
                  <TransactionAccountDetail
                    account={accounts.find(
                      (account) => account.id === transaction.accountId
                    )}
                    fallback={getAccountName(accounts, transaction.accountId)}
                  />
                </DetailItem>
                {transaction.type === 'TRANSFER' ? (
                  <DetailItem label="Conta de destino">
                    <TransactionAccountDetail
                      account={accounts.find(
                        (account) =>
                          account.id === transaction.destinationAccountId
                      )}
                      fallback={getAccountName(
                        accounts,
                        transaction.destinationAccountId
                      )}
                    />
                  </DetailItem>
                ) : null}
              </dl>

              {transaction.type === 'INCOME' || transaction.type === 'EXPENSE' ? (
                <div className="mt-6">
                  <h4 className="mb-2 text-sm font-medium text-foreground">
                    Comprovantes
                  </h4>
                  <TransactionAttachmentsGallery transaction={transaction} />
                </div>
              ) : null}

              {transaction.type === 'EXPENSE' ? (
                <div className="mt-6">
                  <h4 className="mb-2 text-sm font-medium text-foreground">
                    Nota fiscal
                  </h4>
                  {transaction.hasFiscalNote ? (
                    fiscalNoteQuery.isLoading ? (
                      <div
                        role="status"
                        aria-label="Carregando nota fiscal"
                        className="space-y-3 rounded-2xl border border-border bg-secondary p-4"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="space-y-2">
                            <Skeleton className="h-5 w-24 rounded-full bg-card" />
                            <Skeleton className="h-4 w-44 rounded-lg bg-card" />
                            <Skeleton className="h-3 w-32 rounded-lg bg-card" />
                          </div>
                          <Skeleton className="h-8 w-20 rounded-lg bg-card" />
                        </div>
                        <Skeleton className="h-20 w-full rounded-xl bg-card" />
                        <Skeleton className="h-10 w-full rounded-xl bg-card" />
                      </div>
                    ) : fiscalNoteErrorPresentation ? (
                      <ApiErrorAlert
                        error={fiscalNoteErrorPresentation}
                        onRetry={() => void fiscalNoteQuery.refetch()}
                      />
                    ) : fiscalNoteQuery.data ? (
                      <FiscalNoteSummaryCard
                        fiscalNote={fiscalNoteQuery.data}
                        onViewFullList={() =>
                          onViewFiscalNote?.(fiscalNoteQuery.data)
                        }
                        onUnlink={() =>
                          onUnlinkFiscalNote?.(
                            transaction,
                            fiscalNoteQuery.data
                          )
                        }
                      />
                    ) : null
                  ) : (
                    <div className="flex flex-col gap-3 rounded-2xl border border-border bg-secondary p-4 sm:flex-row sm:items-center sm:justify-between">
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-foreground">
                          Nenhuma NFC-e vinculada
                        </p>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          Leia o QR Code do cupom fiscal para anexar a lista de
                          compras.
                        </p>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        className="h-10 shrink-0 rounded-xl border-border bg-card text-foreground hover:bg-accent hover:text-foreground"
                        onClick={() => onLinkFiscalNote?.(transaction)}
                      >
                        <QrCode
                          className="h-4 w-4 text-brand"
                          aria-hidden="true"
                        />
                        Vincular NFC-e
                      </Button>
                    </div>
                  )}
                </div>
              ) : null}
            </div>

            <SheetFooter className="mt-auto gap-2 border-t border-border bg-card p-4">
              {transaction.type === 'TRANSFER' ? (
                <p className="w-full rounded-xl border border-state-info/35 bg-state-info/10 px-3 py-2 text-xs leading-5 text-foreground sm:mr-auto sm:max-w-64">
                  Para corrigir, faça uma nova transferência no sentido
                  contrário.
                </p>
              ) : (
                <Button
                  type="button"
                  variant="outline"
                  className="h-10 rounded-xl border-destructive/60 bg-destructive/10 text-destructive hover:bg-destructive/15 hover:text-destructive"
                  onClick={onDelete}
                >
                  <Trash2 className="h-4 w-4" />
                  Excluir
                </Button>
              )}
              <Button
                type="button"
                variant="outline"
                className="h-10 rounded-xl border-border bg-secondary text-foreground hover:bg-accent hover:text-foreground"
                onClick={onEdit}
              >
                <Edit3 className="h-4 w-4" />
                Editar
              </Button>
              {transaction.status === 'PENDING' ? (
                <Button
                  type="button"
                  className="h-10 rounded-xl bg-primary px-4 text-primary-foreground hover:bg-primary/90"
                  onClick={onConfirm}
                >
                  <ArrowLeftRight className="h-4 w-4" />
                  {getConfirmActionLabel(transaction.type)}
                </Button>
              ) : null}
            </SheetFooter>
          </>
        ) : null}
      </SheetContent>
    </Sheet>
  )
}

interface DetailItemProps {
  label: string
  children: ReactNode
}

function DetailItem({ label, children }: DetailItemProps) {
  return (
    <div className="min-w-0 border-b border-border py-3">
      <dt className="text-xs font-medium uppercase tracking-normal text-muted-foreground">
        {label}
      </dt>
      <dd className="mt-1 text-sm font-medium text-foreground">{children}</dd>
    </div>
  )
}

function TransactionTypeDetail({
  transaction,
}: {
  transaction: { type: Parameters<typeof getTransactionTypeLabel>[0] }
}) {
  const Icon = getTransactionTypeIcon(transaction.type)

  return (
    <span className="inline-flex min-w-0 items-center gap-2">
      <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-state-info/10 text-state-info">
        <Icon className="h-4 w-4" />
      </span>
      <span className="truncate">{getTransactionTypeLabel(transaction.type)}</span>
    </span>
  )
}

function TransactionCategoryDetail({
  transaction,
  categories,
}: {
  transaction: Parameters<typeof getCategoryName>[1]
  categories: Category[]
}) {
  if (transaction.type === 'TRANSFER') {
    return (
      <span className="inline-flex min-w-0 items-center gap-2">
        <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-state-info/10 text-state-info">
          <ArrowLeftRight className="h-4 w-4" />
        </span>
        <span className="truncate">Transferência</span>
      </span>
    )
  }

  if (transaction.type === 'ADJUSTMENT') {
    return (
      <span className="inline-flex min-w-0 items-center gap-2">
        <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-state-info/10 text-state-info">
          <SlidersHorizontal className="h-4 w-4" />
        </span>
        <span className="truncate">
          {getCategoryName(categories, transaction)}
        </span>
      </span>
    )
  }

  const category = categories.find((item) => item.id === transaction.categoryId)

  if (!category) {
    return <span>{getCategoryName(categories, transaction)}</span>
  }

  const Icon = getCategoryIconOption(getCategoryIconKey(category)).icon
  const style: CSSProperties = {
    backgroundColor: getCategoryColorOption(
      getCategoryColorToken(category),
      category.type === 'INCOME' ? 'INCOME' : 'EXPENSE'
    ).hex,
  }

  return (
    <span className="inline-flex min-w-0 items-center gap-2">
      <span
        className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-foreground"
        style={style}
      >
        <Icon className="h-4 w-4" />
      </span>
      <span className="truncate">{category.displayName}</span>
    </span>
  )
}

function TransactionAccountDetail({
  account,
  fallback,
}: {
  account: Account | undefined
  fallback: string
}) {
  if (!account) {
    return <span>{fallback}</span>
  }

  return (
    <span className="inline-flex min-w-0 items-center gap-2">
      <AccountIdentity account={account} size="sm" />
      <span className="truncate">{account.name}</span>
    </span>
  )
}
