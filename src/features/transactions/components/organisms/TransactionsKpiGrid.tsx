import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import {
  ArrowLeftRight,
  ChevronLeft,
  ChevronRight,
  CircleDollarSign,
  HandCoins,
  ReceiptText,
  Scale,
  SlidersHorizontal,
  WalletCards,
} from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { cn } from '@/shared/lib/utils'
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
    const cardClassName = 'w-[224px] shrink-0 snap-start xl:w-auto xl:min-w-0 xl:shrink'

    return (
      <KpiScrollTrack columns={4}>
        <TransactionKpiCard
          label="Saldo atual"
          value={formatCurrentBalance(
            currentBalanceCents,
            isCurrentBalanceLoading
          )}
          icon={<WalletCards className="h-4 w-4" />}
          tone="info"
          isNumeric={hasCurrentBalance}
          className={cardClassName}
        />
        <TransactionKpiCard
          label="Receitas"
          value={formatCurrencyFromCents(summary.income.totalCents)}
          icon={<HandCoins className="h-4 w-4" />}
          tone="income"
          className={cardClassName}
        />
        <TransactionKpiCard
          label="Despesas"
          value={formatCurrencyFromCents(summary.expense.totalCents)}
          icon={<ReceiptText className="h-4 w-4" />}
          tone="expense"
          className={cardClassName}
        />
        <TransactionKpiCard
          label="Balanço mensal"
          value={formatCurrencyFromCents(summary.balance.expectedBalanceCents)}
          icon={<Scale className="h-4 w-4" />}
          tone="info"
          className={cardClassName}
        />
      </KpiScrollTrack>
    )
  }

  const summary = response.summary
  const labels = getTypeSummaryLabels(view)
  const EffectiveIcon = labels.Icon
  const cardClassName = 'w-[224px] shrink-0 snap-start md:w-auto md:min-w-0 md:shrink'

  return (
    <KpiScrollTrack columns={3}>
      <TransactionKpiCard
        label={labels.pending}
        value={formatCurrencyFromCents(summary.pendingCents)}
        icon={<CircleDollarSign className="h-4 w-4" />}
        tone={labels.tone}
        className={cardClassName}
      />
      <TransactionKpiCard
        label={labels.effective}
        value={formatCurrencyFromCents(summary.effectiveCents)}
        icon={<EffectiveIcon className="h-4 w-4" />}
        tone={labels.tone}
        className={cardClassName}
      />
      <TransactionKpiCard
        label={labels.total}
        value={formatCurrencyFromCents(summary.totalCents)}
        icon={<Scale className="h-4 w-4" />}
        tone="neutral"
        className={cardClassName}
      />
    </KpiScrollTrack>
  )
}

interface KpiScrollTrackProps {
  columns: 3 | 4
  children: ReactNode
}

function KpiScrollTrack({ columns, children }: KpiScrollTrackProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)

  const checkScroll = useCallback(() => {
    const el = scrollContainerRef.current
    if (!el) return
    const { scrollLeft, scrollWidth, clientWidth } = el
    setCanScrollLeft(scrollLeft > 4)
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 4)
  }, [])

  useEffect(() => {
    checkScroll()
    const el = scrollContainerRef.current
    if (!el) return

    el.addEventListener('scroll', checkScroll, { passive: true })
    window.addEventListener('resize', checkScroll)

    return () => {
      el.removeEventListener('scroll', checkScroll)
      window.removeEventListener('resize', checkScroll)
    }
  }, [checkScroll, columns])

  const scrollByAmount = (amount: number) => {
    scrollContainerRef.current?.scrollBy({ left: amount, behavior: 'smooth' })
  }

  const hideControlsAtDesktop = columns === 4 ? 'xl:hidden' : 'md:hidden'

  return (
    <div className="relative w-full min-w-0 max-w-full overflow-hidden">
      {canScrollLeft ? (
        <div
          className={cn(
            'pointer-events-none absolute top-0 bottom-0 left-0 z-10 hidden w-12 items-center justify-start bg-gradient-to-r from-background via-background/85 to-transparent sm:flex',
            hideControlsAtDesktop
          )}
        >
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => scrollByAmount(-240)}
            className="pointer-events-auto ml-1 h-8 w-8 rounded-full border border-border bg-card/95 text-foreground shadow-sm hover:bg-secondary"
            aria-label="Rolar indicadores para a esquerda"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </div>
      ) : null}

      <div
        ref={scrollContainerRef}
        data-testid="transactions-kpi-track"
        className={cn(
          'flex w-full min-w-0 max-w-full flex-nowrap snap-x snap-mandatory gap-3 overflow-x-auto overscroll-x-contain pb-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden',
          columns === 4
            ? 'xl:grid xl:grid-cols-4 xl:overflow-visible xl:pb-0'
            : 'md:grid md:grid-cols-3 md:overflow-visible md:pb-0'
        )}
      >
        {children}
      </div>

      {canScrollRight ? (
        <div
          className={cn(
            'pointer-events-none absolute top-0 right-0 bottom-0 z-10 hidden w-12 items-center justify-end bg-gradient-to-l from-background via-background/85 to-transparent sm:flex',
            hideControlsAtDesktop
          )}
        >
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => scrollByAmount(240)}
            className="pointer-events-auto mr-1 h-8 w-8 rounded-full border border-border bg-card/95 text-foreground shadow-sm hover:bg-secondary"
            aria-label="Rolar indicadores para a direita"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      ) : null}
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

  if (view === 'ADJUSTMENT') {
    return {
      pending: 'Ajustes pendentes',
      effective: 'Ajustes efetivados',
      total: 'Total ajustado',
      tone: 'info' as const,
      Icon: SlidersHorizontal,
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
