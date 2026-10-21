import {
  ArrowLeftRight,
  CircleDollarSign,
  HandCoins,
  ReceiptText,
  Scale,
  WalletCards,
} from 'lucide-react'
import { formatCurrencyFromCents } from '@/shared/utils/formatters'
import type { TransactionListResponse } from '../../types/transaction.types'
import type { TransactionView } from '../../types/transaction-ui.types'
import { TransactionKpiCard } from '../molecules/TransactionKpiCard'

interface TransactionsKpiGridProps {
  response: TransactionListResponse | undefined
  view: TransactionView
  currentBalanceCents?: number
  isCurrentBalanceLoading?: boolean
}

export function TransactionsKpiGrid({
  response,
  view,
  currentBalanceCents,
  isCurrentBalanceLoading = false,
}: TransactionsKpiGridProps) {
  if (!response) {
    return null
  }

  if (response.summary.object === 'transaction_summary.overview') {
    const summary = response.summary
    const hasCurrentBalance = typeof currentBalanceCents === 'number'

    return (
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <TransactionKpiCard
          label="Saldo atual"
          value={formatCurrentBalance(
            currentBalanceCents,
            isCurrentBalanceLoading
          )}
          icon={<WalletCards className="h-4 w-4" />}
          tone="info"
          isNumeric={hasCurrentBalance}
        />
        <TransactionKpiCard
          label="Receitas"
          value={formatCurrencyFromCents(summary.income.totalCents)}
          icon={<HandCoins className="h-4 w-4" />}
          tone="income"
        />
        <TransactionKpiCard
          label="Despesas"
          value={formatCurrencyFromCents(summary.expense.totalCents)}
          icon={<ReceiptText className="h-4 w-4" />}
          tone="expense"
        />
        <TransactionKpiCard
          label="Balanço mensal"
          value={formatCurrencyFromCents(summary.balance.expectedBalanceCents)}
          icon={<Scale className="h-4 w-4" />}
          tone="info"
        />
      </div>
    )
  }

  const summary = response.summary
  const labels = getTypeSummaryLabels(view)
  const EffectiveIcon = labels.Icon

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      <TransactionKpiCard
        label={labels.pending}
        value={formatCurrencyFromCents(summary.pendingCents)}
        icon={<CircleDollarSign className="h-4 w-4" />}
        tone={labels.tone}
      />
      <TransactionKpiCard
        label={labels.effective}
        value={formatCurrencyFromCents(summary.effectiveCents)}
        icon={<EffectiveIcon className="h-4 w-4" />}
        tone={labels.tone}
      />
      <TransactionKpiCard
        label={labels.total}
        value={formatCurrencyFromCents(summary.totalCents)}
        icon={<Scale className="h-4 w-4" />}
        tone="neutral"
        className="col-span-2 sm:col-span-1"
      />
    </div>
  )
}

const formatCurrentBalance = (
  currentBalanceCents: number | undefined,
  isLoading: boolean
): string => {
  if (typeof currentBalanceCents === 'number') {
    return formatCurrencyFromCents(currentBalanceCents)
  }

  return isLoading ? 'Carregando' : 'Não carregado'
}

const getTypeSummaryLabels = (view: TransactionView) => {
  if (view === 'INCOME') {
    return {
      pending: 'Receitas pendentes',
      effective: 'Receitas recebidas',
      total: 'Total',
      tone: 'income' as const,
      Icon: HandCoins,
    }
  }

  if (view === 'EXPENSE') {
    return {
      pending: 'Despesas pendentes',
      effective: 'Despesas pagas',
      total: 'Total',
      tone: 'expense' as const,
      Icon: ReceiptText,
    }
  }

  return {
    pending: 'Transferências pendentes',
    effective: 'Transferências efetivadas',
    total: 'Total movimentado',
    tone: 'neutral' as const,
    Icon: ArrowLeftRight,
  }
}
