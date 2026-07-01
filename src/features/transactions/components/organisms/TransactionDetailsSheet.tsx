import type { CSSProperties, ReactNode } from 'react'
import { ArrowLeftRight, Edit3, Paperclip, Trash2 } from 'lucide-react'
import type { Account } from '@/features/accounts/types/account.types'
import type { Category } from '@/features/categories/types/category.types'
import {
  getAccountColorOption,
  getAccountIcon,
} from '@/features/accounts/utils/account.utils'
import {
  getCategoryColorOption,
  getCategoryColorToken,
  getCategoryIconKey,
  getCategoryIconOption,
} from '@/features/categories/utils/category.utils'
import { useIsMobile } from '@/shared/hooks/use-mobile'
import { Button } from '@/shared/lib/button'
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
import type { TransactionDetailsSheetState } from '../../types/transaction-ui.types'
import {
  formatSignedTransactionAmount,
  formatTransactionDate,
  getAccountName,
  getCategoryName,
  getConfirmActionLabel,
  getTransactionAmountClassName,
  getTransactionDerivedStatus,
  getTransactionDescription,
  getTransactionTypeLabel,
  getTransactionTypeIcon,
} from '../../utils/transaction.utils'
import { TransactionStatusPill } from '../molecules/TransactionStatusPill'

interface TransactionDetailsSheetProps {
  state: TransactionDetailsSheetState
  accounts: Account[]
  categories: Category[]
  onOpenChange: (isOpen: boolean) => void
  onConfirm: () => void
  onDelete: () => void
  onEdit: () => void
}

export function TransactionDetailsSheet({
  state,
  accounts,
  categories,
  onOpenChange,
  onConfirm,
  onDelete,
  onEdit,
}: TransactionDetailsSheetProps) {
  const transaction = state?.transaction ?? null
  const isMobile = useIsMobile()
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
              <SheetHeader className="pr-8 text-left">
                <SheetTitle className="text-foreground">
                  {getTransactionDescription(transaction)}
                </SheetTitle>
                <SheetDescription className="text-muted-foreground">
                  {getTransactionTypeLabel(transaction.type)} registrada em{' '}
                  {formatTransactionDate(transaction.date)}.
                </SheetDescription>
              </SheetHeader>

              <div className="mt-6 rounded-2xl border border-border bg-secondary p-4">
                <p
                  className={cn(
                    'numeric text-2xl font-semibold',
                    getTransactionAmountClassName(transaction.type)
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
                <DetailItem label="Data">
                  {formatTransactionDate(transaction.date)}
                </DetailItem>
                <DetailItem label="Categoria">
                  <TransactionCategoryDetail
                    transaction={transaction}
                    categories={categories}
                  />
                </DetailItem>
                <DetailItem label="Conta">
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
                <DetailItem label="Anexos">
                  <span className="inline-flex items-center gap-2 text-muted-foreground">
                    <Paperclip className="h-4 w-4" />
                    Em breve
                  </span>
                </DetailItem>
                <DetailItem label="Mais detalhes">
                  <span className="text-muted-foreground">Em breve</span>
                </DetailItem>
              </dl>
            </div>

            <SheetFooter className="mt-auto gap-2 border-t border-border bg-card p-4">
              <Button
                type="button"
                variant="outline"
                className="h-10 rounded-xl border-destructive/60 bg-destructive/10 text-destructive hover:bg-destructive/15 hover:text-destructive"
                onClick={onDelete}
                disabled={transaction.type === 'TRANSFER'}
              >
                <Trash2 className="h-4 w-4" />
                Excluir
              </Button>
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

  const Icon = getAccountIcon(account)
  const style: CSSProperties = {
    backgroundColor: getAccountColorOption(account.color).hex,
  }

  return (
    <span className="inline-flex min-w-0 items-center gap-2">
      <span
        className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-foreground"
        style={style}
      >
        <Icon className="h-4 w-4" />
      </span>
      <span className="truncate">{account.name}</span>
    </span>
  )
}
