import { Fragment, type CSSProperties } from 'react'
import {
  ArrowLeftRight,
  CheckCircle2,
  Edit3,
  EllipsisVertical,
  Eye,
  QrCode,
  Trash2,
} from 'lucide-react'
import type { Account } from '@/features/accounts/types/account.types'
import type { Category } from '@/features/categories/types/category.types'
import { FiscalNoteBadge } from '@/features/fiscal-notes'
import {
  getCategoryColorOption,
  getCategoryColorToken,
  getCategoryIconKey,
  getCategoryIconOption,
} from '@/features/categories/utils/category.utils'
import { Button } from '@/shared/components/ui/button'
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/ui/table'
import type { Transaction } from '../../types/transaction.types'
import {
  formatSignedTransactionAmount,
  formatTransactionDate,
  getAccountName,
  getCategoryName,
  getConfirmActionLabel,
  getTransactionAmountClassName,
  getTransactionDerivedStatus,
  getTransactionDescription,
  getTransactionTypeIcon,
  groupTransactionsByDate,
} from '../../utils/transaction.utils'
import { TransactionStatusPill } from '../molecules/TransactionStatusPill'
import { TransactionAttachmentBadge } from '../atoms/TransactionAttachmentBadge'

interface TransactionsTableProps {
  transactions: Transaction[]
  accounts: Account[]
  categories: Category[]
  isMutating: boolean
  onConfirm: (transaction: Transaction) => void
  onDelete: (transaction: Transaction) => void
  onEdit: (transaction: Transaction) => void
  onOpenDetails: (transaction: Transaction) => void
  onLinkFiscalNote?: (transaction: Transaction) => void
}

export function TransactionsTable({
  transactions,
  accounts,
  categories,
  isMutating,
  onConfirm,
  onDelete,
  onEdit,
  onOpenDetails,
  onLinkFiscalNote,
}: TransactionsTableProps) {
  const dayGroups = groupTransactionsByDate(transactions)

  return (
    <>
      <div className="hidden max-w-full overflow-hidden rounded-2xl border border-border bg-card md:block">
        <Table className="min-w-[900px]">
          <TableHeader>
            <TableRow className="border-border hover:bg-transparent">
              <TableHead className="text-muted-foreground">Status</TableHead>
              <TableHead className="text-muted-foreground">Data</TableHead>
              <TableHead className="text-muted-foreground">Descrição</TableHead>
              <TableHead className="text-muted-foreground">Categoria</TableHead>
              <TableHead className="text-muted-foreground">Conta</TableHead>
              <TableHead className="text-right text-muted-foreground">Valor</TableHead>
              <TableHead className="w-12 text-muted-foreground">
                <span className="sr-only">Ações</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {dayGroups.map((group) => (
              <Fragment key={group.date}>
                <TableRow className="border-border/70 bg-secondary/30 hover:bg-secondary/30">
                  <TableCell colSpan={7} className="py-2">
                    <TransactionDayDivider label={group.label} />
                  </TableCell>
                </TableRow>
                {group.transactions.map((transaction) => (
                  <TransactionRow
                    key={transaction.id}
                    transaction={transaction}
                    accounts={accounts}
                    categories={categories}
                    isMutating={isMutating}
                    onConfirm={onConfirm}
                    onDelete={onDelete}
                    onEdit={onEdit}
                    onOpenDetails={onOpenDetails}
                    onLinkFiscalNote={onLinkFiscalNote}
                  />
                ))}
              </Fragment>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="grid w-full min-w-0 max-w-full gap-4 md:hidden">
        {dayGroups.map((group) => (
          <div key={group.date} className="min-w-0 max-w-full space-y-1">
            <TransactionDayDivider label={group.label} />
            <div className="grid w-full min-w-0 max-w-full">
              {group.transactions.map((transaction) => (
                <TransactionMobileItem
                  key={transaction.id}
                  transaction={transaction}
                  accounts={accounts}
                  categories={categories}
                  onOpenDetails={onOpenDetails}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </>
  )
}

interface TransactionDayDividerProps {
  label: string
}

function TransactionDayDivider({ label }: TransactionDayDividerProps) {
  return (
    <div
      className="flex w-full min-w-0 items-center gap-3 py-1"
      role="separator"
      aria-label={`Lançamentos de ${label}`}
    >
      <span className="h-px flex-1 bg-border" aria-hidden />
      <span className="numeric shrink-0 text-xs font-medium tracking-wide text-muted-foreground">
        {label}
      </span>
      <span className="h-px flex-1 bg-border" aria-hidden />
    </div>
  )
}

interface TransactionItemProps {
  transaction: Transaction
  accounts: Account[]
  categories: Category[]
}

interface TransactionRowProps extends TransactionItemProps {
  isMutating: boolean
  onConfirm: (transaction: Transaction) => void
  onDelete: (transaction: Transaction) => void
  onEdit: (transaction: Transaction) => void
  onOpenDetails: (transaction: Transaction) => void
  onLinkFiscalNote?: (transaction: Transaction) => void
}

function TransactionRow({
  transaction,
  accounts,
  categories,
  isMutating,
  onConfirm,
  onDelete,
  onEdit,
  onOpenDetails,
  onLinkFiscalNote,
}: TransactionRowProps) {
  const derivedStatus = getTransactionDerivedStatus(transaction)
  const accountLabel = getAccountLabel(transaction, accounts)

  return (
    <TableRow
      className="cursor-pointer border-border hover:bg-secondary/70"
      onClick={() => onOpenDetails(transaction)}
    >
      <TableCell>
        <TransactionStatusPill status={derivedStatus} />
      </TableCell>
      <TableCell className="numeric text-muted-foreground">
        {formatTransactionDate(transaction.date)}
      </TableCell>
      <TableCell className="max-w-72">
        <div className="flex items-center gap-2">
          <span className="truncate font-medium text-foreground">
            {getTransactionDescription(transaction)}
          </span>
          {transaction.attachmentsCount ? (
            <TransactionAttachmentBadge count={transaction.attachmentsCount} />
          ) : null}
          {transaction.hasFiscalNote ? (
            <FiscalNoteBadge variant="compact" />
          ) : null}
        </div>
      </TableCell>
      <TableCell>
        <TransactionCategory
          transaction={transaction}
          categories={categories}
        />
      </TableCell>
      <TableCell className="max-w-52">
        <span className="block truncate text-sm text-foreground">
          {accountLabel}
        </span>
      </TableCell>
      <TableCell
        className={cn(
          'numeric text-right font-semibold',
          getTransactionAmountClassName(transaction.type, transaction.direction)
        )}
      >
        {formatSignedTransactionAmount(transaction, formatCurrencyFromCents)}
      </TableCell>
      <TableCell onClick={(event) => event.stopPropagation()}>
        <TransactionActionsMenu
          transaction={transaction}
          isMutating={isMutating}
          onConfirm={() => onConfirm(transaction)}
          onDelete={() => onDelete(transaction)}
          onEdit={() => onEdit(transaction)}
          onOpenDetails={() => onOpenDetails(transaction)}
          onLinkFiscalNote={
            onLinkFiscalNote ? () => onLinkFiscalNote(transaction) : undefined
          }
        />
      </TableCell>
    </TableRow>
  )
}

interface TransactionMobileItemProps extends TransactionItemProps {
  onOpenDetails: (transaction: Transaction) => void
}

function TransactionMobileItem({
  transaction,
  accounts,
  categories,
  onOpenDetails,
}: TransactionMobileItemProps) {
  const derivedStatus = getTransactionDerivedStatus(transaction)
  const CategoryIcon = resolveTransactionCategoryIcon(transaction, categories)
  const categoryStyle = getTransactionCategoryStyle(transaction, categories)

  return (
    <button
      type="button"
      className="flex min-h-20 w-full min-w-0 max-w-full items-center gap-3 overflow-hidden border-b border-border py-3 text-left transition hover:bg-secondary focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      onClick={() => onOpenDetails(transaction)}
    >
      <span
        className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-secondary text-foreground"
        style={categoryStyle}
        aria-hidden
      >
        <CategoryIcon className="h-4 w-4" />
      </span>
      <span className="min-w-0 flex-1 overflow-hidden">
        <span className="block truncate text-sm font-semibold text-foreground">
          {getTransactionDescription(transaction)}
        </span>
        <span className="mt-0.5 flex items-center gap-2 truncate text-xs text-muted-foreground">
          <span className="truncate">
            {getCategoryName(categories, transaction)} |{' '}
            {getAccountName(accounts, transaction.accountId)}
          </span>
          {transaction.attachmentsCount ? (
            <TransactionAttachmentBadge
              count={transaction.attachmentsCount}
              compact
            />
          ) : null}
          {transaction.hasFiscalNote ? (
            <FiscalNoteBadge variant="compact" />
          ) : null}
        </span>
      </span>
      <span className="flex shrink-0 flex-col items-end gap-2">
        <span
          className={cn(
            'numeric text-sm font-semibold whitespace-nowrap',
            getTransactionAmountClassName(transaction.type, transaction.direction)
          )}
        >
          {formatSignedTransactionAmount(transaction, formatCurrencyFromCents)}
        </span>
        <TransactionStatusPill status={derivedStatus} compact />
      </span>
    </button>
  )
}

interface TransactionCategoryProps {
  transaction: Transaction
  categories: Category[]
}

function TransactionCategory({
  transaction,
  categories,
}: TransactionCategoryProps) {
  const Icon = resolveTransactionCategoryIcon(transaction, categories)
  const style = getTransactionCategoryStyle(transaction, categories)

  return (
    <span className="flex min-w-0 items-center gap-2">
      <span
        className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-secondary text-foreground"
        style={style}
        aria-hidden
      >
        <Icon className="h-4 w-4" />
      </span>
      <span className="min-w-0 truncate text-sm text-foreground">
        {getCategoryName(categories, transaction)}
      </span>
    </span>
  )
}

interface TransactionActionsMenuProps {
  transaction: Transaction
  isMutating: boolean
  onConfirm: () => void
  onDelete: () => void
  onEdit: () => void
  onOpenDetails: () => void
  onLinkFiscalNote?: () => void
}

function TransactionActionsMenu({
  transaction,
  isMutating,
  onConfirm,
  onDelete,
  onEdit,
  onOpenDetails,
  onLinkFiscalNote,
}: TransactionActionsMenuProps) {
  const canConfirm = transaction.status === 'PENDING'
  const canLinkFiscalNote =
    transaction.type === 'EXPENSE' && !transaction.hasFiscalNote

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={(e) => e.stopPropagation()}
          className="h-9 w-9 rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground"
          aria-label={`Abrir ações de ${getTransactionDescription(transaction)}`}
          title="Ações"
        >
          <EllipsisVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        onClick={(event) => event.stopPropagation()}
        className="w-64 rounded-2xl border-border bg-card p-2 text-foreground"
      >
        <DropdownMenuLabel className="text-xs text-muted-foreground">
          Ações da transação
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-border" />
        <DropdownMenuItem
          className="cursor-pointer rounded-xl focus:bg-accent focus:text-foreground"
          onSelect={onOpenDetails}
        >
          <Eye className="h-4 w-4" />
          Ver detalhes
        </DropdownMenuItem>
        {canConfirm ? (
          <DropdownMenuItem
            className="rounded-xl focus:bg-accent focus:text-foreground"
            disabled={isMutating}
            onSelect={onConfirm}
          >
            <CheckCircle2 className="h-4 w-4" />
            {getConfirmActionLabel(transaction.type)}
          </DropdownMenuItem>
        ) : null}
        <DropdownMenuItem
          className="rounded-xl focus:bg-accent focus:text-foreground"
          disabled={isMutating}
          onSelect={onEdit}
        >
          <Edit3 className="h-4 w-4" />
          Editar
        </DropdownMenuItem>
        {canLinkFiscalNote ? (
          <DropdownMenuItem
            className="rounded-xl focus:bg-accent focus:text-foreground"
            disabled={isMutating}
            onSelect={() => onLinkFiscalNote?.()}
          >
            <QrCode className="h-4 w-4" />
            Vincular NFC-e
          </DropdownMenuItem>
        ) : null}
        <DropdownMenuSeparator className="bg-border" />
        {transaction.type === 'TRANSFER' ? (
          <DropdownMenuLabel className="whitespace-normal rounded-xl bg-state-info/10 text-xs font-normal leading-5 text-foreground">
            Para corrigir, faça uma transferência no sentido contrário.
          </DropdownMenuLabel>
        ) : (
          <DropdownMenuItem
            className="rounded-xl text-destructive focus:bg-destructive/10 focus:text-destructive"
            disabled={isMutating}
            onSelect={onDelete}
          >
            <Trash2 className="h-4 w-4" />
            Excluir
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

const getAccountLabel = (transaction: Transaction, accounts: Account[]) => {
  if (transaction.type === 'TRANSFER') {
    return `${getAccountName(accounts, transaction.accountId)} -> ${getAccountName(
      accounts,
      transaction.destinationAccountId
    )}`
  }

  return getAccountName(accounts, transaction.accountId)
}

const resolveTransactionCategoryIcon = (
  transaction: Transaction,
  categories: Category[]
) => {
  if (transaction.type === 'TRANSFER') {
    return ArrowLeftRight
  }

  const category = categories.find((item) => item.id === transaction.categoryId)

  if (!category) {
    return getTransactionTypeIcon(transaction.type)
  }

  return getCategoryIconOption(getCategoryIconKey(category)).icon
}

const getTransactionCategoryStyle = (
  transaction: Transaction,
  categories: Category[]
): CSSProperties | undefined => {
  if (transaction.type !== 'INCOME' && transaction.type !== 'EXPENSE') {
    return undefined
  }

  const category = categories.find((item) => item.id === transaction.categoryId)

  if (!category) {
    return undefined
  }

  return {
    backgroundColor: getCategoryColorOption(
      getCategoryColorToken(category),
      transaction.type
    ).hex,
  }
}
