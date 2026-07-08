import {
  ArrowLeftRight,
  CircleDollarSign,
  HandCoins,
  ReceiptText,
  Scale,
  WalletCards,
} from 'lucide-react'
import type { ReactNode } from 'react'
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
      <>
        <MobileKpiTrack>
          <TransactionKpiCard
            label="Saldo atual"
            value={formatCurrentBalance(
              currentBalanceCents,
              isCurrentBalanceLoading
            )}
            icon={<WalletCards className="h-4 w-4" />}
            tone="info"
            className="w-52 shrink-0"
            isNumeric={hasCurrentBalance}
          />
          <TransactionKpiCard
            label="Receitas"
            value={formatCurrencyFromCents(summary.income.totalCents)}
            icon={<HandCoins className="h-4 w-4" />}
            tone="income"
            className="w-52 shrink-0"
          />
          <TransactionKpiCard
            label="Despesas"
            value={formatCurrencyFromCents(summary.expense.totalCents)}
            icon={<ReceiptText className="h-4 w-4" />}
            tone="expense"
            className="w-52 shrink-0"
          />
          <TransactionKpiCard
            label="Balanço mensal"
            value={formatCurrencyFromCents(summary.balance.expectedBalanceCents)}
            icon={<Scale className="h-4 w-4" />}
            tone="info"
            className="w-52 shrink-0"
          />
        </MobileKpiTrack>

        <div className="hidden gap-3 sm:grid sm:grid-cols-2 xl:grid-cols-4">
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
      </>
    )
  }

  const summary = response.summary
  const labels = getTypeSummaryLabels(view)
  const EffectiveIcon = labels.Icon

  return (
    <>
      <MobileKpiTrack>
        <TransactionKpiCard
          label={labels.pending}
          value={formatCurrencyFromCents(summary.pendingCents)}
          icon={<CircleDollarSign className="h-4 w-4" />}
          tone={labels.tone}
          className="w-52 shrink-0"
        />
        <TransactionKpiCard
          label={labels.effective}
          value={formatCurrencyFromCents(summary.effectiveCents)}
          icon={<EffectiveIcon className="h-4 w-4" />}
          tone={labels.tone}
          className="w-52 shrink-0"
        />
      </MobileKpiTrack>

      <div className="hidden gap-3 sm:grid sm:grid-cols-2 xl:grid-cols-3">
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
        />
      </div>
    </>
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

function MobileKpiTrack({ children }: { children: ReactNode }) {
  return (
    <div className="block min-w-0 max-w-full overflow-hidden sm:hidden">
      <div className="w-[calc(100vw-2rem)] max-w-full overflow-x-auto overscroll-x-contain pb-2 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        <div className="flex w-max gap-3 pr-4">{children}</div>
      </div>
    </div>
  )
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
