import { RotateCcw } from 'lucide-react'
import { ApiErrorAlert } from '@/shared/components/molecules/ApiErrorAlert'
import { Button } from '@/shared/lib/button'
import { cn } from '@/shared/lib/utils'
import { resolveApiError } from '@/shared/errors'
import { TransactionCreateButton } from '../molecules/TransactionCreateButton'
import type { TransactionView } from '../../types/transaction-ui.types'
import {
  getTransactionViewOption,
  getTransactionViewToneClassName,
} from '../../utils/transaction.utils'

interface TransactionsErrorStateProps {
  error: unknown
  onRetry: () => void
}

export function TransactionsErrorState({
  error,
  onRetry,
}: TransactionsErrorStateProps) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <ApiErrorAlert error={resolveApiError(error, 'transactions.list')} />
      <Button
        type="button"
        variant="outline"
        className="mt-4 h-10 rounded-xl border-border bg-secondary text-foreground hover:bg-accent hover:text-foreground"
        onClick={onRetry}
      >
        <RotateCcw className="h-4 w-4" />
        Tentar novamente
      </Button>
    </div>
  )
}

interface TransactionsEmptyStateProps {
  view: TransactionView
  hasFilters: boolean
  onClearFilters: () => void
  onCreate?: () => void
}

export function TransactionsEmptyState({
  view,
  hasFilters,
  onClearFilters,
  onCreate,
}: TransactionsEmptyStateProps) {
  const title = hasFilters
    ? 'Nenhuma transação encontrada'
    : getEmptyTitle(view)
  const description = hasFilters
    ? 'Ajuste os filtros para ampliar a busca neste período.'
    : getEmptyDescription(view)
  const option = getTransactionViewOption(view)
  const Icon = option.icon

  return (
    <div
      className={cn(
        'rounded-2xl border p-6 text-center',
        getTransactionViewToneClassName(view, 'border'),
        getTransactionViewToneClassName(view, 'softBg')
      )}
    >
      <span
        className={cn(
          'mx-auto inline-flex h-12 w-12 items-center justify-center rounded-2xl',
          getTransactionViewToneClassName(view, 'softBg'),
          getTransactionViewToneClassName(view)
        )}
        aria-hidden
      >
        <Icon className="h-5 w-5" />
      </span>
      <h2 className="mt-4 text-base font-semibold text-foreground">{title}</h2>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">
        {description}
      </p>
      <div className="mt-5 flex flex-wrap justify-center gap-2">
        {hasFilters ? (
          <Button
            type="button"
            variant="outline"
            className="h-10 rounded-xl border-border bg-secondary text-foreground hover:bg-accent hover:text-foreground"
            onClick={onClearFilters}
          >
            Limpar filtros
          </Button>
        ) : null}
        {onCreate && (view === 'EXPENSE' || view === 'INCOME') ? (
          <TransactionCreateButton view={view} onClick={onCreate} />
        ) : null}
      </div>
    </div>
  )
}

const getEmptyTitle = (view: TransactionView): string => {
  if (view === 'EXPENSE') return 'Nenhuma despesa no período'
  if (view === 'INCOME') return 'Nenhuma receita no período'
  if (view === 'TRANSFER') return 'Nenhuma transferência no período'
  return 'Nenhuma transação no período'
}

const getEmptyDescription = (view: TransactionView): string => {
  if (view === 'TRANSFER') {
    return 'Transferências entre suas contas aparecem aqui quando forem cadastradas.'
  }

  if (view === 'EXPENSE') {
    return 'Cadastre despesas pagas ou previstas para acompanhar saídas do mês.'
  }

  if (view === 'INCOME') {
    return 'Cadastre receitas recebidas ou previstas para acompanhar entradas do mês.'
  }

  return 'Receitas e despesas do mês aparecerão aqui quando forem registradas.'
}
