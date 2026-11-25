import { getTodayDateOnly } from '@/shared/utils/dateOnly'
import type {
  ManualBalanceAdjustmentFormValues,
  TargetBalanceAdjustmentFormValues,
} from '../schemas/balanceAdjustment.schema'
import type {
  CreateBalanceAdjustmentDto,
  CreateTransactionDto,
  TransactionDirection,
} from '../types/transaction.types'
import { normalizeOptionalText } from './transaction.utils'

const MAX_SAFE_BIGINT = BigInt(Number.MAX_SAFE_INTEGER)

export type TargetBalanceDelta =
  | { kind: 'no-change' }
  | { kind: 'overflow' }
  | { kind: 'increase' | 'decrease'; amountCents: number }

export type ManualResultingBalance =
  | { ok: true; resultingCents: number }
  | { ok: false }

export const computeTargetBalanceDelta = (
  currentCents: number,
  targetBalanceCents: number
): TargetBalanceDelta => {
  const delta = BigInt(targetBalanceCents) - BigInt(currentCents)

  if (delta === 0n) {
    return { kind: 'no-change' }
  }

  const absDelta = delta < 0n ? -delta : delta

  if (absDelta > MAX_SAFE_BIGINT) {
    return { kind: 'overflow' }
  }

  return {
    kind: delta > 0n ? 'increase' : 'decrease',
    amountCents: Number(absDelta),
  }
}

export const computeManualResultingBalance = (
  currentCents: number,
  amountCents: number,
  direction: TransactionDirection
): ManualResultingBalance => {
  const delta =
    direction === 'INCREASE' ? BigInt(amountCents) : -BigInt(amountCents)
  const resulting = BigInt(currentCents) + delta
  const absResulting = resulting < 0n ? -resulting : resulting

  if (absResulting > MAX_SAFE_BIGINT) {
    return { ok: false }
  }

  return {
    ok: true,
    resultingCents: Number(resulting),
  }
}

export const buildCreateBalanceAdjustmentDto = (
  values: TargetBalanceAdjustmentFormValues
): CreateBalanceAdjustmentDto => ({
  accountId: values.accountId,
  targetBalanceCents: values.targetBalanceCents ?? 0,
  date: getTodayDateOnly(),
  description: normalizeOptionalText(values.description),
})

export const buildManualAdjustmentTransactionDto = (
  values: ManualBalanceAdjustmentFormValues
): CreateTransactionDto => ({
  accountId: values.accountId,
  type: 'ADJUSTMENT',
  status: values.status,
  amountCents: values.amountCents ?? 0,
  direction: values.direction ?? 'INCREASE',
  date: getTodayDateOnly(),
  description: normalizeOptionalText(values.description),
})
