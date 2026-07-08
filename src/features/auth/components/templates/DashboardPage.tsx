import { useMemo } from 'react'
import type { ReactNode } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import {
  ArrowDownLeft,
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  ListChecks,
  WalletCards,
  type LucideIcon,
} from 'lucide-react'
import { useAccountSummary } from '@/features/accounts/api/queries'
import { AUTH_ROUTES } from '@/features/auth/constants/auth.constants'
import { useTransactions } from '@/features/transactions/api/queries'
import {
  TRANSACTION_DEFAULT_LIMIT,
  TRANSACTION_DEFAULT_PAGE,
} from '@/features/transactions/constants/transaction.constants'
import type {
  Transaction,
  TransactionListResponse,
} from '@/features/transactions/types/transaction.types'
import {
  formatSignedTransactionAmount,
  formatTransactionDate,
  getTransactionAmountClassName,
  getTransactionDescription,
  getTransactionTypeIcon,
  getTransactionTypeLabel,
} from '@/features/transactions/utils/transaction.utils'
import {
  buildTransactionsUrl,
  type TransactionUrlState,
} from '@/features/transactions/utils/transactionUrl.utils'
import { ApiErrorAlert } from '@/shared/components/molecules/ApiErrorAlert'
import { MonthYearPicker } from '@/shared/components/molecules/MonthYearPicker'
import { resolveApiError } from '@/shared/errors'
import { Button } from '@/shared/lib/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/lib/card'
import { cn } from '@/shared/lib/utils'
import {
  formatMonthYearLabel,
  getCurrentYearMonth,
  getMonthEndDateOnly,
  getMonthStartDateOnly,
  shiftYearMonth,
  type YearMonth,
} from '@/shared/utils/dateOnly'
import { formatCurrencyFromCents } from '@/shared/utils/formatters'
import { AuthAppShell } from './AuthAppShell'

type MetricTone = 'brand' | 'income' | 'expense'

interface DashboardMetric {
  title: string
  value: string
  helper: string
  icon: LucideIcon
  tone: MetricTone
  to?: string
  isNumeric?: boolean
}

const metricToneClasses: Record<
  MetricTone,
  { icon: string; value: string; badge: string }
> = {
  brand: {
    icon: 'bg-primary/15 text-primary',
    value: 'text-foreground',
    badge: 'bg-primary/15 text-primary',
  },
  income: {
    icon: 'bg-state-income/15 text-state-income',
    value: 'text-state-income',
    badge: 'bg-state-income/15 text-state-income',
  },
  expense: {
    icon: 'bg-state-expense/15 text-state-expense',
    value: 'text-state-expense',
    badge: 'bg-state-expense/15 text-state-expense',
  },
}

export function DashboardPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const selectedPeriod = useMemo(
    () => parseDashboardPeriod(searchParams.get('period')) ?? getCurrentYearMonth(),
    [searchParams]
  )
  const dateFrom = useMemo(
    () => getMonthStartDateOnly(selectedPeriod),
    [selectedPeriod]
  )
  const dateTo = useMemo(
    () => getMonthEndDateOnly(selectedPeriod),
    [selectedPeriod]
  )
  const transactionLinkState = useMemo(
    () => buildDashboardTransactionState(selectedPeriod, dateFrom, dateTo),
    [dateFrom, dateTo, selectedPeriod]
  )

  const {
    data: accountSummary,
    isLoading: isAccountSummaryLoading,
    isError: isAccountSummaryError,
    error: accountSummaryError,
    refetch: refetchAccountSummary,
  } = useAccountSummary({ includeExcludedFromTotal: true })
  const {
    data: incomeResponse,
    isLoading: isIncomeLoading,
    isError: isIncomeError,
    error: incomeError,
    refetch: refetchIncome,
  } = useTransactions({
    page: 1,
    limit: 1,
    sort: 'date:desc',
    dateFrom,
    dateTo,
    type: 'INCOME',
    status: 'EFFECTIVE',
  })
  const {
    data: expenseResponse,
    isLoading: isExpenseLoading,
    isError: isExpenseError,
    error: expenseError,
    refetch: refetchExpense,
  } = useTransactions({
    page: 1,
    limit: 1,
    sort: 'date:desc',
    dateFrom,
    dateTo,
    type: 'EXPENSE',
    status: 'EFFECTIVE',
  })
  const {
    data: latestTransactionsResponse,
    isLoading: isLatestTransactionsLoading,
    isError: isLatestTransactionsError,
    error: latestTransactionsError,
    refetch: refetchLatestTransactions,
  } = useTransactions({
    page: 1,
    limit: 5,
    sort: 'date:desc',
  })
  const {
    data: pendingExpenseResponse,
    isLoading: isPendingExpenseLoading,
    isError: isPendingExpenseError,
    error: pendingExpenseError,
    refetch: refetchPendingExpense,
  } = useTransactions({
    page: 1,
    limit: 1,
    sort: 'date:desc',
    type: 'EXPENSE',
    status: 'PENDING',
  })
  const {
    data: pendingIncomeResponse,
    isLoading: isPendingIncomeLoading,
    isError: isPendingIncomeError,
    error: pendingIncomeError,
    refetch: refetchPendingIncome,
  } = useTransactions({
    page: 1,
    limit: 1,
    sort: 'date:desc',
    type: 'INCOME',
    status: 'PENDING',
  })

  const incomeCents = getEffectiveSummaryCents(incomeResponse)
  const expenseCents = getEffectiveSummaryCents(expenseResponse)
  const pendingExpenseCents = getPendingSummaryCents(pendingExpenseResponse)
  const pendingIncomeCents = getPendingSummaryCents(pendingIncomeResponse)
  const metrics: DashboardMetric[] = [
    {
      title: 'Saldo atual',
      value: formatMetricValue(accountSummary?.currentCents, isAccountSummaryLoading),
      helper: 'Saldo real das contas ativas.',
      icon: WalletCards,
      tone: 'brand',
      isNumeric: typeof accountSummary?.currentCents === 'number',
    },
    {
      title: 'Entradas do mês',
      value: formatMetricValue(incomeCents, isIncomeLoading, '+ '),
      helper: 'Receitas efetivadas no período selecionado.',
      icon: ArrowDownLeft,
      tone: 'income',
      to: buildTransactionsUrl(AUTH_ROUTES.transactions, transactionLinkState, {
        view: 'INCOME',
        status: 'EFFECTIVE',
        page: TRANSACTION_DEFAULT_PAGE,
      }),
      isNumeric: typeof incomeCents === 'number',
    },
    {
      title: 'Saídas do mês',
      value: formatMetricValue(expenseCents, isExpenseLoading, '- '),
      helper: 'Despesas efetivadas no período selecionado.',
      icon: ArrowUpRight,
      tone: 'expense',
      to: buildTransactionsUrl(AUTH_ROUTES.transactions, transactionLinkState, {
        view: 'EXPENSE',
        status: 'EFFECTIVE',
        page: TRANSACTION_DEFAULT_PAGE,
      }),
      isNumeric: typeof expenseCents === 'number',
    },
  ]

  const changePeriod = (period: YearMonth) => {
    const nextParams = new URLSearchParams()
    const current = getCurrentYearMonth()

    if (period.year !== current.year || period.month !== current.month) {
      nextParams.set(
        'period',
        `${period.year}-${String(period.month).padStart(2, '0')}`
      )
    }

    setSearchParams(nextParams)
  }

  return (
    <AuthAppShell
      activeSection="dashboard"
      title="Dashboard"
      subtitle="Resumo financeiro em construção"
    >
      <div className="min-w-0 max-w-full space-y-5 overflow-x-hidden">
        <section
          className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between"
          aria-labelledby="dashboard-title"
        >
          <div className="hidden min-w-0 md:block">
            <h1
              id="dashboard-title"
              className="text-2xl font-semibold tracking-tight text-foreground"
            >
              Dashboard
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {formatMonthYearLabel(selectedPeriod)}
            </p>
          </div>
          <div className="flex items-center justify-center gap-4 md:justify-end">
            <PeriodButton
              label="Mês anterior"
              onClick={() => changePeriod(shiftYearMonth(selectedPeriod, -1))}
            >
              <ChevronLeft className="h-5 w-5" />
            </PeriodButton>
            <MonthYearPicker
              value={selectedPeriod}
              onChange={changePeriod}
              showCalendarIcon={false}
              triggerClassName="min-w-36"
            />
            <PeriodButton
              label="Próximo mês"
              onClick={() => changePeriod(shiftYearMonth(selectedPeriod, 1))}
            >
              <ChevronRight className="h-5 w-5" />
            </PeriodButton>
          </div>
        </section>

        <MobileSummaryCard
          balanceValue={formatMetricValue(
            accountSummary?.currentCents,
            isAccountSummaryLoading
          )}
          balanceIsNumeric={typeof accountSummary?.currentCents === 'number'}
          incomeValue={formatMetricValue(incomeCents, isIncomeLoading, '+ ')}
          incomeIsNumeric={typeof incomeCents === 'number'}
          incomeTo={buildTransactionsUrl(
            AUTH_ROUTES.transactions,
            transactionLinkState,
            {
              view: 'INCOME',
              status: 'EFFECTIVE',
              page: TRANSACTION_DEFAULT_PAGE,
            }
          )}
          expenseValue={formatMetricValue(expenseCents, isExpenseLoading, '- ')}
          expenseIsNumeric={typeof expenseCents === 'number'}
          expenseTo={buildTransactionsUrl(
            AUTH_ROUTES.transactions,
            transactionLinkState,
            {
              view: 'EXPENSE',
              status: 'EFFECTIVE',
              page: TRANSACTION_DEFAULT_PAGE,
            }
          )}
        />

        <section
          className="hidden gap-3 md:grid md:grid-cols-3"
          aria-label="Resumo financeiro"
        >
          {metrics.map((metric) => (
            <MetricCard key={metric.title} metric={metric} />
          ))}
        </section>

        {isAccountSummaryError ? (
          <ApiErrorAlert
            error={resolveApiError(accountSummaryError, 'accounts.summary')}
            onRetry={() => void refetchAccountSummary()}
          />
        ) : null}

        {isIncomeError ? (
          <ApiErrorAlert
            error={resolveApiError(incomeError, 'transactions.list')}
            onRetry={() => void refetchIncome()}
          />
        ) : null}

        {isExpenseError ? (
          <ApiErrorAlert
            error={resolveApiError(expenseError, 'transactions.list')}
            onRetry={() => void refetchExpense()}
          />
        ) : null}

        <section className="grid gap-5 xl:grid-cols-2">
          <section className="space-y-3 xl:hidden" aria-labelledby="mobile-pending-title">
            <div className="flex items-center gap-3">
              <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent text-primary">
                <ArrowDownLeft className="h-4 w-4" />
              </span>
              <h2
                id="mobile-pending-title"
                className="text-base font-semibold text-foreground"
              >
                Pendências e alertas
              </h2>
            </div>
            <PendingAlertsGrid
              pendingExpenseCount={pendingExpenseResponse?.meta.total ?? null}
              pendingExpenseValue={formatMetricValue(
                pendingExpenseCents,
                isPendingExpenseLoading
              )}
              pendingExpenseIsNumeric={typeof pendingExpenseCents === 'number'}
              pendingExpenseTo={buildTransactionsUrl(
                AUTH_ROUTES.transactions,
                transactionLinkState,
                {
                  view: 'EXPENSE',
                  status: 'PENDING',
                  page: TRANSACTION_DEFAULT_PAGE,
                }
              )}
              pendingIncomeCount={pendingIncomeResponse?.meta.total ?? null}
              pendingIncomeValue={formatMetricValue(
                pendingIncomeCents,
                isPendingIncomeLoading,
                '+ '
              )}
              pendingIncomeIsNumeric={typeof pendingIncomeCents === 'number'}
              pendingIncomeTo={buildTransactionsUrl(
                AUTH_ROUTES.transactions,
                transactionLinkState,
                {
                  view: 'INCOME',
                  status: 'PENDING',
                  page: TRANSACTION_DEFAULT_PAGE,
                }
              )}
            />
          </section>

          <FinancialPanel
            icon={<ArrowDownLeft className="h-4 w-4" />}
            title="Pendências e alertas"
            className="hidden xl:block"
          >
            {isPendingExpenseError ? (
              <ApiErrorAlert
                error={resolveApiError(pendingExpenseError, 'transactions.list')}
                onRetry={() => void refetchPendingExpense()}
                className="mb-3"
              />
            ) : null}

            {isPendingIncomeError ? (
              <ApiErrorAlert
                error={resolveApiError(pendingIncomeError, 'transactions.list')}
                onRetry={() => void refetchPendingIncome()}
                className="mb-3"
              />
            ) : null}

            <PendingAlertsGrid
              pendingExpenseCount={pendingExpenseResponse?.meta.total ?? null}
              pendingExpenseValue={formatMetricValue(
                pendingExpenseCents,
                isPendingExpenseLoading
              )}
              pendingExpenseIsNumeric={typeof pendingExpenseCents === 'number'}
              pendingExpenseTo={buildTransactionsUrl(
                AUTH_ROUTES.transactions,
                transactionLinkState,
                {
                  view: 'EXPENSE',
                  status: 'PENDING',
                  page: TRANSACTION_DEFAULT_PAGE,
                }
              )}
              pendingIncomeCount={pendingIncomeResponse?.meta.total ?? null}
              pendingIncomeValue={formatMetricValue(
                pendingIncomeCents,
                isPendingIncomeLoading,
                '+ '
              )}
              pendingIncomeIsNumeric={typeof pendingIncomeCents === 'number'}
              pendingIncomeTo={buildTransactionsUrl(
                AUTH_ROUTES.transactions,
                transactionLinkState,
                {
                  view: 'INCOME',
                  status: 'PENDING',
                  page: TRANSACTION_DEFAULT_PAGE,
                }
              )}
            />
          </FinancialPanel>

          <FinancialPanel
            icon={<ListChecks className="h-4 w-4" />}
            title="Últimas transações"
          >
            {isLatestTransactionsError ? (
              <ApiErrorAlert
                error={resolveApiError(
                  latestTransactionsError,
                  'transactions.list'
                )}
                onRetry={() => void refetchLatestTransactions()}
              />
            ) : (
              <LatestTransactionsList
                isLoading={isLatestTransactionsLoading}
                transactions={latestTransactionsResponse?.data ?? []}
              />
            )}
          </FinancialPanel>
        </section>
      </div>
    </AuthAppShell>
  )
}

interface MobileSummaryCardProps {
  balanceValue: string
  balanceIsNumeric: boolean
  incomeValue: string
  incomeIsNumeric: boolean
  incomeTo: string
  expenseValue: string
  expenseIsNumeric: boolean
  expenseTo: string
}

function MobileSummaryCard({
  balanceValue,
  balanceIsNumeric,
  incomeValue,
  incomeIsNumeric,
  incomeTo,
  expenseValue,
  expenseIsNumeric,
  expenseTo,
}: MobileSummaryCardProps) {
  return (
    <section
      className="rounded-[2rem] border border-border bg-card px-5 py-7 shadow-lg shadow-background/20 md:hidden"
      aria-label="Resumo financeiro"
    >
      <div className="text-center">
        <p className="text-sm font-medium text-muted-foreground">
          Saldo atual em contas
        </p>
        <p
          className={cn(
            'mt-3 text-4xl font-semibold tracking-tight text-foreground',
            balanceIsNumeric && 'numeric'
          )}
        >
          {balanceValue}
        </p>
      </div>

      <div className="mt-8 grid grid-cols-2 items-start gap-4">
        <MobileMovementLink
          to={incomeTo}
          label="Receitas"
          value={incomeValue}
          isNumeric={incomeIsNumeric}
          tone="income"
          icon={<ArrowDownLeft className="h-6 w-6 rotate-180" />}
        />
        <MobileMovementLink
          to={expenseTo}
          label="Despesas"
          value={expenseValue}
          isNumeric={expenseIsNumeric}
          tone="expense"
          icon={<ArrowUpRight className="h-6 w-6 rotate-180" />}
        />
      </div>
    </section>
  )
}

interface MobileMovementLinkProps {
  to: string
  label: string
  value: string
  isNumeric: boolean
  tone: Extract<MetricTone, 'income' | 'expense'>
  icon: ReactNode
}

function MobileMovementLink({
  to,
  label,
  value,
  isNumeric,
  tone,
  icon,
}: MobileMovementLinkProps) {
  const classes = metricToneClasses[tone]

  return (
    <Link
      to={to}
      className="flex min-w-0 flex-col items-center rounded-2xl p-2 text-center transition-colors hover:bg-accent/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
    >
      <div
        className={cn(
          'inline-flex h-14 w-14 items-center justify-center rounded-full',
          classes.icon
        )}
        aria-hidden
      >
        {icon}
      </div>
      <p className="mt-3 text-sm font-medium text-muted-foreground">{label}</p>
      <p
        className={cn(
          'mt-1 truncate text-lg font-semibold',
          isNumeric && 'numeric',
          classes.value
        )}
      >
        {value}
      </p>
    </Link>
  )
}

interface MetricCardProps {
  metric: DashboardMetric
}

function MetricCard({ metric }: MetricCardProps) {
  const Icon = metric.icon
  const tone = metricToneClasses[metric.tone]
  const content = (
    <>
      <CardHeader className="space-y-0 pb-3">
        <div className="flex items-start justify-between gap-3">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {metric.title}
          </CardTitle>
          <span
            className={cn(
              'inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg',
              tone.icon
            )}
            aria-hidden
          >
            <Icon className="h-4 w-4" />
          </span>
        </div>
      </CardHeader>
      <CardContent>
        <p
          className={cn(
            'text-2xl font-semibold tracking-tight',
            metric.isNumeric && 'numeric',
            tone.value
          )}
        >
          {metric.value}
        </p>
        <div className="mt-3 space-y-2">
          <span
            className={cn(
              'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
              tone.badge
            )}
          >
            {metric.tone === 'income'
              ? 'Receita'
              : metric.tone === 'expense'
                ? 'Despesa'
                : 'Saldo'}
          </span>
          <p className="text-xs leading-5 text-muted-foreground">
            {metric.helper}
          </p>
        </div>
      </CardContent>
    </>
  )

  if (metric.to) {
    return (
      <Card className="min-w-0 border-border bg-card transition-colors hover:bg-accent/60">
        <Link
          to={metric.to}
          className="block rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          aria-label={`Abrir ${metric.title.toLowerCase()} em transações`}
        >
          {content}
        </Link>
      </Card>
    )
  }

  return <Card className="min-w-0 border-border bg-card">{content}</Card>
}

interface FinancialPanelProps {
  icon: ReactNode
  title: string
  children: ReactNode
  className?: string
}

function FinancialPanel({
  icon,
  title,
  children,
  className,
}: FinancialPanelProps) {
  return (
    <section
      className={cn(
        'min-w-0 rounded-2xl border border-border bg-card p-5 shadow-lg shadow-background/20',
        className
      )}
    >
      <div className="flex items-start gap-3">
        <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent text-primary">
          {icon}
        </span>
        <div className="min-w-0">
          <h2 className="text-base font-semibold text-foreground">{title}</h2>
        </div>
      </div>
      <div className="mt-5">{children}</div>
    </section>
  )
}

interface PendingAlertsGridProps {
  pendingExpenseCount: number | null
  pendingExpenseValue: string
  pendingExpenseIsNumeric: boolean
  pendingExpenseTo: string
  pendingIncomeCount: number | null
  pendingIncomeValue: string
  pendingIncomeIsNumeric: boolean
  pendingIncomeTo: string
}

function PendingAlertsGrid({
  pendingExpenseCount,
  pendingExpenseValue,
  pendingExpenseIsNumeric,
  pendingExpenseTo,
  pendingIncomeCount,
  pendingIncomeValue,
  pendingIncomeIsNumeric,
  pendingIncomeTo,
}: PendingAlertsGridProps) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <PendingAlertCard
        title="Despesas pendentes"
        value={pendingExpenseValue}
        count={pendingExpenseCount}
        isNumeric={pendingExpenseIsNumeric}
        tone="expense"
        to={pendingExpenseTo}
        icon={<ArrowUpRight className="h-6 w-6 rotate-180" />}
      />
      <PendingAlertCard
        title="Receitas pendentes"
        value={pendingIncomeValue}
        count={pendingIncomeCount}
        isNumeric={pendingIncomeIsNumeric}
        tone="income"
        to={pendingIncomeTo}
        icon={<ArrowDownLeft className="h-6 w-6 rotate-180" />}
      />
    </div>
  )
}

interface PendingAlertCardProps {
  title: string
  value: string
  count: number | null
  isNumeric: boolean
  tone: Extract<MetricTone, 'income' | 'expense'>
  icon: ReactNode
  to: string
}

function PendingAlertCard({
  title,
  value,
  count,
  isNumeric,
  tone,
  icon,
  to,
}: PendingAlertCardProps) {
  const classes = metricToneClasses[tone]

  return (
    <Link
      to={to}
      className="block min-w-0 rounded-2xl border border-border bg-secondary p-4 transition-colors hover:bg-accent/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      aria-label={`Abrir ${title.toLowerCase()} em transações`}
    >
      <div className="flex items-start justify-between gap-3">
        <span
          className={cn(
            'inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl',
            classes.icon
          )}
          aria-hidden
        >
          {icon}
        </span>
        <span
          className={cn(
            'inline-flex min-w-8 items-center justify-center rounded-full px-2 py-1 text-xs font-semibold',
            classes.badge
          )}
        >
          {count ?? '-'}
        </span>
      </div>
      <h3 className="mt-5 text-sm font-medium text-muted-foreground">{title}</h3>
      <p
        className={cn(
          'mt-2 truncate text-xl font-semibold',
          isNumeric && 'numeric',
          classes.value
        )}
      >
        {value}
      </p>
    </Link>
  )
}

interface LatestTransactionsListProps {
  isLoading: boolean
  transactions: Transaction[]
}

function LatestTransactionsList({
  isLoading,
  transactions,
}: LatestTransactionsListProps) {
  if (isLoading) {
    return (
      <div className="rounded-xl border border-border bg-secondary p-4 text-sm text-muted-foreground">
        Carregando últimas transações...
      </div>
    )
  }

  if (transactions.length === 0) {
    return (
      <div className="flex min-h-44 items-center justify-center rounded-xl border border-dashed border-border bg-secondary p-6 text-center">
        <div className="max-w-sm">
          <span className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-xl bg-accent text-primary">
            <ListChecks className="h-6 w-6" />
          </span>
          <p className="mt-4 text-sm font-semibold text-foreground">
            Nenhuma transação registrada
          </p>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            As movimentações mais recentes aparecem aqui quando forem criadas.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="divide-y divide-border rounded-xl border border-border bg-secondary">
      {transactions.map((transaction) => (
        <LatestTransactionItem
          key={transaction.id}
          transaction={transaction}
        />
      ))}
    </div>
  )
}

interface LatestTransactionItemProps {
  transaction: Transaction
}

function LatestTransactionItem({ transaction }: LatestTransactionItemProps) {
  const Icon = getTransactionTypeIcon(transaction.type)

  return (
    <article className="flex min-w-0 items-center gap-3 px-4 py-3">
      <span
        className={cn(
          'inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl',
          transaction.type === 'INCOME' && 'bg-state-income/10 text-state-income',
          transaction.type === 'EXPENSE' &&
            'bg-state-expense/10 text-state-expense',
          transaction.type !== 'INCOME' &&
            transaction.type !== 'EXPENSE' &&
            'bg-state-info/10 text-state-info'
        )}
        aria-hidden
      >
        <Icon className="h-4 w-4" />
      </span>
      <div className="min-w-0 flex-1">
        <h3 className="truncate text-sm font-medium text-foreground">
          {getTransactionDescription(transaction)}
        </h3>
        <p className="mt-1 truncate text-xs text-muted-foreground">
          {getTransactionTypeLabel(transaction.type)} ·{' '}
          {formatTransactionDate(transaction.date)}
        </p>
      </div>
      <p
        className={cn(
          'numeric shrink-0 text-sm font-semibold',
          getTransactionAmountClassName(transaction.type)
        )}
      >
        {formatSignedTransactionAmount(transaction, formatCurrencyFromCents)}
      </p>
    </article>
  )
}

interface PeriodButtonProps {
  label: string
  onClick: () => void
  children: ReactNode
}

function PeriodButton({ label, onClick, children }: PeriodButtonProps) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className="h-11 w-11 rounded-full text-primary hover:bg-primary/10 hover:text-primary"
      onClick={onClick}
      aria-label={label}
      title={label}
    >
      {children}
    </Button>
  )
}

const buildDashboardTransactionState = (
  period: YearMonth,
  dateFrom: string,
  dateTo: string
): TransactionUrlState => ({
  view: 'ALL',
  period,
  page: TRANSACTION_DEFAULT_PAGE,
  limit: TRANSACTION_DEFAULT_LIMIT,
  search: '',
  filters: {
    accountId: null,
    categoryId: null,
    status: null,
    dateFrom,
    dateTo,
  },
})

const getEffectiveSummaryCents = (
  response: TransactionListResponse | undefined
): number | null =>
  response?.summary.object === 'transaction_summary.type'
    ? response.summary.effectiveCents
    : null

const getPendingSummaryCents = (
  response: TransactionListResponse | undefined
): number | null =>
  response?.summary.object === 'transaction_summary.type'
    ? response.summary.pendingCents
    : null

const formatMetricValue = (
  cents: number | null | undefined,
  isLoading: boolean,
  prefix: string = ''
): string => {
  if (typeof cents === 'number') {
    return `${prefix}${formatCurrencyFromCents(cents)}`
  }

  return isLoading ? 'Carregando' : 'Não carregado'
}

const parseDashboardPeriod = (value: string | null): YearMonth | null => {
  if (!value || !/^\d{4}-\d{2}$/.test(value)) return null

  const [yearValue = '', monthValue = ''] = value.split('-')
  const year = Number(yearValue)
  const month = Number(monthValue)

  if (!Number.isInteger(year) || month < 1 || month > 12) {
    return null
  }

  return { year, month }
}
