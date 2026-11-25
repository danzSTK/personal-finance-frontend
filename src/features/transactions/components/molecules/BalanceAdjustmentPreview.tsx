import { AlertCircle, Info, TrendingDown, TrendingUp } from 'lucide-react'
import { cn } from '@/shared/lib/utils'
import { formatCurrencyFromCents } from '@/shared/utils/formatters'
import type {
  TransactionDirection,
  TransactionStatus,
} from '../../types/transaction.types'
import {
  computeManualResultingBalance,
  computeTargetBalanceDelta,
} from '../../utils/balanceAdjustment.utils'

type BalanceAdjustmentPreviewProps =
  | {
      mode: 'target'
      currentCents: number
      targetBalanceCents: number | undefined
    }
  | {
      mode: 'manual'
      currentCents: number
      amountCents: number | undefined
      direction: TransactionDirection | null
      status: TransactionStatus
    }

export function BalanceAdjustmentPreview(props: BalanceAdjustmentPreviewProps) {
  if (props.mode === 'target') {
    if (props.targetBalanceCents === undefined) {
      return (
        <div
          className="rounded-2xl border border-border bg-secondary/70 p-4 text-sm text-muted-foreground"
          role="status"
          aria-live="polite"
        >
          Informe o novo saldo para visualizar a diferença que será registrada.
        </div>
      )
    }

    const delta = computeTargetBalanceDelta(
      props.currentCents,
      props.targetBalanceCents
    )

    if (delta.kind === 'no-change') {
      return (
        <div
          className="flex items-start gap-3 rounded-2xl border border-state-warning/40 bg-state-warning/10 p-4"
          role="status"
          aria-live="polite"
        >
          <Info className="mt-0.5 h-5 w-5 shrink-0 text-state-warning" />
          <div className="space-y-1 text-sm">
            <p className="font-semibold text-foreground">
              Sem diferença no saldo
            </p>
            <p className="text-muted-foreground">
              O saldo informado já é igual ao saldo atual. Informe outro valor
              para aplicar o reajuste.
            </p>
          </div>
        </div>
      )
    }

    if (delta.kind === 'overflow') {
      return (
        <div
          className="flex items-start gap-3 rounded-2xl border border-destructive/40 bg-destructive/10 p-4"
          role="status"
          aria-live="polite"
        >
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-destructive" />
          <div className="space-y-1 text-sm">
            <p className="font-semibold text-foreground">Limite excedido</p>
            <p className="text-muted-foreground">
              A diferença entre o saldo atual e o informado ultrapassa o limite
              suportado.
            </p>
          </div>
        </div>
      )
    }

    const isIncrease = delta.kind === 'increase'
    const DirectionIcon = isIncrease ? TrendingUp : TrendingDown

    return (
      <div
        className={cn(
          'rounded-2xl border p-4',
          isIncrease
            ? 'border-state-income/35 bg-state-income/10'
            : 'border-state-expense/35 bg-state-expense/10'
        )}
        role="status"
        aria-live="polite"
      >
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <DirectionIcon
              className={cn(
                'h-4 w-4 shrink-0',
                isIncrease ? 'text-state-income' : 'text-state-expense'
              )}
            />
            <span className="text-sm font-semibold text-foreground">
              {isIncrease ? 'Acréscimo' : 'Redução'}
            </span>
          </div>
          <span
            className={cn(
              'numeric text-base font-semibold',
              isIncrease ? 'text-state-income' : 'text-state-expense'
            )}
          >
            {isIncrease ? '+' : '−'} {formatCurrencyFromCents(delta.amountCents)}
          </span>
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          Saldo após o ajuste:{' '}
          <span className="numeric font-medium text-foreground">
            {formatCurrencyFromCents(props.targetBalanceCents)}
          </span>
        </p>
      </div>
    )
  }

  if (!props.direction || !props.amountCents || props.amountCents <= 0) {
    return (
      <div
        className="rounded-2xl border border-border bg-secondary/70 p-4 text-sm text-muted-foreground"
        role="status"
        aria-live="polite"
      >
        Escolha a direção e informe o valor para visualizar o impacto no saldo.
      </div>
    )
  }

  const resulting = computeManualResultingBalance(
    props.currentCents,
    props.amountCents,
    props.direction
  )

  if (!resulting.ok) {
    return (
      <div
        className="flex items-start gap-3 rounded-2xl border border-destructive/40 bg-destructive/10 p-4"
        role="status"
        aria-live="polite"
      >
        <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-destructive" />
        <div className="space-y-1 text-sm">
          <p className="font-semibold text-foreground">Limite excedido</p>
          <p className="text-muted-foreground">
            O saldo resultante ultrapassa o limite suportado.
          </p>
        </div>
      </div>
    )
  }

  const isIncrease = props.direction === 'INCREASE'
  const DirectionIcon = isIncrease ? TrendingUp : TrendingDown
  const resultLabel =
    props.status === 'PENDING'
      ? 'Saldo previsto após efetivação'
      : 'Saldo após o ajuste'

  return (
    <div
      className={cn(
        'rounded-2xl border p-4',
        isIncrease
          ? 'border-state-income/35 bg-state-income/10'
          : 'border-state-expense/35 bg-state-expense/10'
      )}
      role="status"
      aria-live="polite"
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <DirectionIcon
            className={cn(
              'h-4 w-4 shrink-0',
              isIncrease ? 'text-state-income' : 'text-state-expense'
            )}
          />
          <span className="text-sm font-semibold text-foreground">
            {isIncrease ? 'Acréscimo' : 'Redução'}
          </span>
        </div>
        <span
          className={cn(
            'numeric text-base font-semibold',
            isIncrease ? 'text-state-income' : 'text-state-expense'
          )}
        >
          {isIncrease ? '+' : '−'} {formatCurrencyFromCents(props.amountCents)}
        </span>
      </div>
      <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
        <span>
          Atual:{' '}
          <span className="numeric font-medium text-foreground">
            {formatCurrencyFromCents(props.currentCents)}
          </span>
        </span>
        <span>
          {resultLabel}:{' '}
          <span className="numeric font-semibold text-foreground">
            {formatCurrencyFromCents(resulting.resultingCents)}
          </span>
        </span>
      </div>
    </div>
  )
}
