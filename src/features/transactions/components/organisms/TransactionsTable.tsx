import type { CSSProperties } from 'react'
import {
  ArrowLeftRight,
  CheckCircle2,
  Edit3,
  EllipsisVertical,
  Trash2,
} from 'lucide-react'
import type { Account } from '@/features/accounts/types/account.types'
import type { Category } from '@/features/categories/types/category.types'
import {
  getCategoryColorOption,
  getCategoryColorToken,
  getCategoryIconKey,
  getCategoryIconOption,
} from '@/features/categories/utils/category.utils'
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
} from '../../utils/transaction.utils'
import { TransactionStatusPill } from '../molecules/TransactionStatusPill'

interface TransactionsTableProps {
  transactions: Transaction[]
  accounts: Account[]
  categories: Category[]
  isMutating: boolean
  onConfirm: (transaction: Transaction) => void
  onDelete: (transaction: Transaction) => void
  onEdit: (transaction: Transaction) => void
  onOpenDetails: (transaction: Transaction) => void
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
}: TransactionsTableProps) {
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
            {transactions.map((transaction) => (
              <TransactionRow
                key={transaction.id}
                transaction={transaction}
                accounts={accounts}
                categories={categories}
                isMutating={isMutating}
                onConfirm={onConfirm}
                onDelete={onDelete}
                onEdit={onEdit}
              />
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="grid gap-3 md:hidden">
        {transactions.map((transaction) => (
          <TransactionMobileItem
            key={transaction.id}
            transaction={transaction}
            accounts={accounts}
            categories={categories}
            onOpenDetails={onOpenDetails}
          />
        ))}
      </div>
    </>
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
}

function TransactionRow({
  transaction,
  accounts,
  categories,
  isMutating,
  onConfirm,
  onDelete,
  onEdit,
}: TransactionRowProps) {
  const derivedStatus = getTransactionDerivedStatus(transaction)
  const accountLabel = getAccountLabel(transaction, accounts)

  return (
    <TableRow className="border-border hover:bg-secondary">
      <TableCell>
        <TransactionStatusPill status={derivedStatus} />
      </TableCell>
      <TableCell className="numeric text-muted-foreground">
        {formatTransactionDate(transaction.date)}
      </TableCell>
      <TableCell className="max-w-72">
        <span className="block truncate font-medium text-foreground">
          {getTransactionDescription(transaction)}
        </span>
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
          getTransactionAmountClassName(transaction.type)
        )}
      >
        {formatSignedTransactionAmount(transaction, formatCurrencyFromCents)}
      </TableCell>
      <TableCell>
        <TransactionActionsMenu
          transaction={transaction}
          isMutating={isMutating}
          onConfirm={() => onConfirm(transaction)}
          onDelete={() => onDelete(transaction)}
          onEdit={() => onEdit(transaction)}
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
      className="flex min-h-20 w-full items-center gap-3 border-b border-border py-3 text-left transition hover:bg-secondary focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      onClick={() => onOpenDetails(transaction)}
    >
      <span
        className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-secondary text-foreground"
        style={categoryStyle}
        aria-hidden
      >
        <CategoryIcon className="h-4 w-4" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-semibold text-foreground">
          {getTransactionDescription(transaction)}
        </span>
        <span className="mt-0.5 block truncate text-xs text-muted-foreground">
          {getCategoryName(categories, transaction)} |{' '}
          {getAccountName(accounts, transaction.accountId)}
        </span>
      </span>
      <span className="flex shrink-0 flex-col items-end gap-2">
        <span
          className={cn(
            'numeric text-sm font-semibold',
            getTransactionAmountClassName(transaction.type)
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
}

function TransactionActionsMenu({
  transaction,
  isMutating,
  onConfirm,
  onDelete,
  onEdit,
}: TransactionActionsMenuProps) {
  const canConfirm = transaction.status === 'PENDING'

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-9 w-9 rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground"
          aria-label={`Abrir ações de ${getTransactionDescription(transaction)}`}
          title="Ações"
        >
          <EllipsisVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-64 rounded-2xl border-border bg-card p-2 text-foreground"
      >
        <DropdownMenuLabel className="text-xs text-muted-foreground">
          Ações da transação
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-border" />
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
