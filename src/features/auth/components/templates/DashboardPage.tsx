import { type ReactNode } from 'react'
import {
  ArrowDownLeft,
  ArrowUpRight,
  BarChart3,
  CalendarClock,
  ListChecks,
  PieChart,
  PiggyBank,
  Plus,
  ReceiptText,
  Target,
  WalletCards,
  type LucideIcon,
} from 'lucide-react'
import { APP_BRAND } from '@/shared/config/brand'
import { Button } from '@/shared/lib/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/lib/card'
import { cn } from '@/shared/lib/utils'
import { AuthAppShell } from './AuthAppShell'

type MetricTone = 'brand' | 'income' | 'expense' | 'info'

interface OverviewMetric {
  title: string
  value: string
  label: string
  helper: string
  icon: LucideIcon
  tone: MetricTone
}

const overviewMetrics: OverviewMetric[] = [
  {
    title: 'Saldo total',
    value: 'R$ 0,00',
    label: 'Saldo',
    helper: 'Conecte contas ou registre transações para preencher este resumo.',
    icon: WalletCards,
    tone: 'brand',
  },
  {
    title: 'Entradas do mês',
    value: '+ R$ 0,00',
    label: 'Entrada',
    helper: 'Nenhuma entrada registrada neste mês.',
    icon: ArrowDownLeft,
    tone: 'income',
  },
  {
    title: 'Saídas do mês',
    value: '- R$ 0,00',
    label: 'Saída',
    helper: 'Nenhuma saída registrada neste mês.',
    icon: ArrowUpRight,
    tone: 'expense',
  },
  {
    title: 'Restante planejado',
    value: 'R$ 0,00',
    label: 'Orçamento',
    helper: 'Crie um orçamento para acompanhar o restante disponível.',
    icon: Target,
    tone: 'info',
  },
]

const metricToneClasses: Record<
  MetricTone,
  { icon: string; value: string; badge: string }
> = {
  brand: {
    icon: 'bg-brand/15 text-brand-soft',
    value: 'text-app-text',
    badge: 'bg-brand/15 text-brand-soft',
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
  info: {
    icon: 'bg-state-info/15 text-state-info',
    value: 'text-state-info',
    badge: 'bg-state-info/15 text-state-info',
  },
}

export function DashboardPage() {
  return (
    <AuthAppShell
      activeSection="dashboard"
      title="Painel financeiro"
      subtitle={`Visão essencial do ${APP_BRAND.name}`}
    >
      <section className="rounded-2xl border border-app-border bg-app-surface p-5 shadow-lg shadow-app-bg/20 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="max-w-2xl space-y-2">
            <span className="inline-flex items-center rounded-full border border-brand/30 bg-brand/10 px-3 py-1 text-xs font-medium uppercase tracking-wide text-brand-soft">
              Danfy Dark
            </span>
            <div>
              <h2 className="text-2xl font-semibold tracking-tight text-app-text">
                Seu dinheiro, em uma visão limpa
              </h2>
              <p className="mt-2 text-sm leading-6 text-app-muted">
                Comece pelos sinais principais: saldo, entradas, saídas,
                orçamento, categorias e próximos vencimentos.
              </p>
            </div>
          </div>
          <Button
            type="button"
            disabled
            className="h-10 shrink-0 rounded-xl bg-brand px-4 text-brand-foreground hover:bg-brand-intense disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Plus className="mr-2 h-4 w-4" />
            Nova transação
          </Button>
        </div>
      </section>

      <section
        className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4"
        aria-label="Resumo financeiro"
      >
        {overviewMetrics.map((metric) => (
          <MetricCard key={metric.title} metric={metric} />
        ))}
      </section>

      <section className="grid gap-5 xl:grid-cols-[minmax(0,1.4fr)_minmax(18rem,0.6fr)]">
        <FinancialPanel
          icon={<BarChart3 className="h-4 w-4" />}
          title="Fluxo de caixa"
          description="Comparação mensal de entradas e saídas"
        >
          <EmptyChartState />
        </FinancialPanel>

        <FinancialPanel
          icon={<PieChart className="h-4 w-4" />}
          title="Categorias"
          description="Distribuição de gastos por categoria"
        >
          <EmptyState
            icon={<PieChart className="h-8 w-8" />}
            title="Sem categorias ainda"
            description="As categorias aparecem quando houver saídas classificadas."
          />
        </FinancialPanel>
      </section>

      <section className="grid gap-5 xl:grid-cols-2">
        <FinancialPanel
          icon={<ReceiptText className="h-4 w-4" />}
          title="Últimas transações"
          description="Movimentações mais recentes"
        >
          <EmptyState
            icon={<ListChecks className="h-8 w-8" />}
            title="Nenhuma transação registrada"
            description="Quando você registrar entradas ou saídas, elas entram aqui com sinal, tipo e categoria."
          />
        </FinancialPanel>

        <FinancialPanel
          icon={<CalendarClock className="h-4 w-4" />}
          title="Próximos vencimentos"
          description="Contas, cartões e compromissos financeiros"
        >
          <EmptyState
            icon={<CalendarClock className="h-8 w-8" />}
            title="Nenhum vencimento próximo"
            description="Adicione contas recorrentes para acompanhar datas e evitar atrasos."
          />
        </FinancialPanel>
      </section>

      <section className="grid gap-5 xl:grid-cols-[minmax(18rem,0.7fr)_minmax(0,1.3fr)]">
        <FinancialPanel
          icon={<WalletCards className="h-4 w-4" />}
          title="Contas e cartões"
          description="Saldos agrupados por origem"
        >
          <EmptyState
            icon={<WalletCards className="h-8 w-8" />}
            title="Nenhuma conta conectada"
            description="Os saldos por conta ficam disponíveis quando a integração financeira for ativada."
          />
        </FinancialPanel>

        <FinancialPanel
          icon={<PiggyBank className="h-4 w-4" />}
          title="Insights"
          description="Alertas simples e acionáveis"
        >
          <EmptyState
            icon={<PiggyBank className="h-8 w-8" />}
            title="Sem insights por enquanto"
            description="Os alertas aparecem quando houver histórico suficiente para comparar padrões de consumo."
          />
        </FinancialPanel>
      </section>
    </AuthAppShell>
  )
}

interface MetricCardProps {
  metric: OverviewMetric
}

const MetricCard = ({ metric }: MetricCardProps) => {
  const Icon = metric.icon
  const tone = metricToneClasses[metric.tone]

  return (
    <Card className="min-w-0 border-app-border bg-app-surface">
      <CardHeader className="space-y-0 pb-3">
        <div className="flex items-start justify-between gap-3">
          <CardTitle className="text-sm font-medium text-app-muted">
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
            'numeric text-2xl font-semibold tracking-tight',
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
            {metric.label}
          </span>
          <p className="text-xs leading-5 text-app-muted">{metric.helper}</p>
        </div>
      </CardContent>
    </Card>
  )
}

interface FinancialPanelProps {
  icon: ReactNode
  title: string
  description: string
  children: ReactNode
}

const FinancialPanel = ({
  icon,
  title,
  description,
  children,
}: FinancialPanelProps) => (
  <section className="min-w-0 rounded-2xl border border-app-border bg-app-surface p-5 shadow-lg shadow-app-bg/20">
    <div className="flex items-start gap-3">
      <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-app-elevated text-brand-soft">
        {icon}
      </span>
      <div className="min-w-0">
        <h3 className="text-base font-semibold text-app-text">{title}</h3>
        <p className="mt-1 text-sm text-app-muted">{description}</p>
      </div>
    </div>
    <div className="mt-5">{children}</div>
  </section>
)

const EmptyChartState = () => (
  <div className="relative min-h-72 overflow-hidden rounded-xl border border-dashed border-app-border bg-app-panel">
    <div className="absolute inset-5 grid grid-rows-4" aria-hidden>
      <span className="border-t border-app-border/70" />
      <span className="border-t border-app-border/70" />
      <span className="border-t border-app-border/70" />
      <span className="border-t border-app-border/70" />
    </div>
    <div className="absolute inset-0 flex items-center justify-center p-6">
      <div className="max-w-sm text-center">
        <span className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-xl bg-brand/15 text-brand-soft">
          <BarChart3 className="h-6 w-6" />
        </span>
        <p className="mt-4 text-sm font-semibold text-app-text">
          Fluxo aguardando dados
        </p>
        <p className="mt-2 text-sm leading-6 text-app-muted">
          O gráfico será preenchido quando houver movimentações reais de
          entrada e saída.
        </p>
      </div>
    </div>
  </div>
)

interface EmptyStateProps {
  icon: ReactNode
  title: string
  description: string
}

const EmptyState = ({ icon, title, description }: EmptyStateProps) => (
  <div className="flex min-h-56 items-center justify-center rounded-xl border border-dashed border-app-border bg-app-panel p-6 text-center">
    <div className="max-w-sm">
      <span className="mx-auto inline-flex h-14 w-14 items-center justify-center rounded-xl bg-app-elevated text-brand-soft">
        {icon}
      </span>
      <p className="mt-4 text-sm font-semibold text-app-text">{title}</p>
      <p className="mt-2 text-sm leading-6 text-app-muted">{description}</p>
    </div>
  </div>
)
