import { describe, expect, it } from 'vitest'
import { getTodayDateOnly } from '@/shared/utils/dateOnly'
import {
  manualBalanceAdjustmentSchema,
  targetBalanceAdjustmentSchema,
} from '../schemas/balanceAdjustment.schema'
import { transactionFormSchema } from '../schemas/transaction.schema'
import {
  buildCreateBalanceAdjustmentDto,
  buildManualAdjustmentTransactionDto,
  computeManualResultingBalance,
  computeTargetBalanceDelta,
} from './balanceAdjustment.utils'
import {
  formatSignedTransactionAmount,
  getCategoryName,
  getTransactionAmountClassName,
  getTransactionAmountSign,
  getTransactionDirectionLabel,
} from './transaction.utils'
import {
  buildTransactionSearchParams,
  parseTransactionCreateIntent,
  parseTransactionUrlState,
} from './transactionUrl.utils'

describe('balanceAdjustment.utils', () => {
  it('calcula delta em BigInt para positivo -> positivo menor/maior, zero e negativo', () => {
    expect(computeTargetBalanceDelta(100000, 50000)).toEqual({
      kind: 'decrease',
      amountCents: 50000,
    })
    expect(computeTargetBalanceDelta(100000, 150000)).toEqual({
      kind: 'increase',
      amountCents: 50000,
    })
    expect(computeTargetBalanceDelta(100000, 0)).toEqual({
      kind: 'decrease',
      amountCents: 100000,
    })
    expect(computeTargetBalanceDelta(100000, -25000)).toEqual({
      kind: 'decrease',
      amountCents: 125000,
    })
    expect(computeTargetBalanceDelta(-50000, 20000)).toEqual({
      kind: 'increase',
      amountCents: 70000,
    })
  })

  it('retorna no-change quando saldo alvo é igual ao atual e overflow acima de MAX_SAFE_INTEGER', () => {
    expect(computeTargetBalanceDelta(45000, 45000)).toEqual({
      kind: 'no-change',
    })
    expect(computeTargetBalanceDelta(-1000, Number.MAX_SAFE_INTEGER)).toEqual({
      kind: 'overflow',
    })
  })

  it('calcula saldo resultante no modo manual e detecta overflow', () => {
    expect(computeManualResultingBalance(100000, 25000, 'INCREASE')).toEqual({
      ok: true,
      resultingCents: 125000,
    })
    expect(computeManualResultingBalance(10000, 25000, 'DECREASE')).toEqual({
      ok: true,
      resultingCents: -15000,
    })
    expect(
      computeManualResultingBalance(Number.MAX_SAFE_INTEGER, 1, 'INCREASE')
    ).toEqual({
      ok: false,
    })
  })

  it('monta CreateBalanceAdjustmentDto preenchendo date local automaticamente, normalizando descrição vazia para null e sem campos técnicos', () => {
    const dto = buildCreateBalanceAdjustmentDto({
      accountId: 'acc-1',
      targetBalanceCents: -25000,
      description: '   ',
    })

    expect(dto).toEqual({
      accountId: 'acc-1',
      targetBalanceCents: -25000,
      date: getTodayDateOnly(),
      description: null,
    })
    expect(dto).not.toHaveProperty('type')
    expect(dto).not.toHaveProperty('status')
    expect(dto).not.toHaveProperty('categoryId')
    expect(dto).not.toHaveProperty('direction')
  })

  it('monta CreateTransactionDto para ajuste manual com date local automática, sem categoryId nem destinationAccountId', () => {
    const dto = buildManualAdjustmentTransactionDto({
      accountId: 'acc-1',
      direction: 'DECREASE',
      amountCents: 12500,
      status: 'EFFECTIVE',
      description: '  Ajuste de tarifa não lançada  ',
    })

    expect(dto).toEqual({
      accountId: 'acc-1',
      type: 'ADJUSTMENT',
      status: 'EFFECTIVE',
      amountCents: 12500,
      direction: 'DECREASE',
      date: getTodayDateOnly(),
      description: 'Ajuste de tarifa não lançada',
    })
    expect(dto).not.toHaveProperty('categoryId')
    expect(dto).not.toHaveProperty('destinationAccountId')
  })
})

describe('balanceAdjustment.schema & transaction.schema (ADJUSTMENT)', () => {
  it('aceita targetBalanceCents negativo, zero e positivo sem campo date e com descrição opcional até 500 chars', () => {
    for (const targetBalanceCents of [-25000, 0, 50000]) {
      expect(
        targetBalanceAdjustmentSchema.safeParse({
          accountId: 'acc-1',
          targetBalanceCents,
          description: null,
        }).success
      ).toBe(true)
    }

    expect(
      targetBalanceAdjustmentSchema.safeParse({
        accountId: 'acc-1',
        targetBalanceCents: 0,
        description: 'a'.repeat(501),
      }).success
    ).toBe(false)
  })

  it('exige direction, amountCents > 0 e motivo não vazio no modo manual sem campo date', () => {
    const emptyReason = manualBalanceAdjustmentSchema.safeParse({
      accountId: 'acc-1',
      direction: 'INCREASE',
      amountCents: 1000,
      status: 'EFFECTIVE',
      description: '   ',
    })

    expect(emptyReason.success).toBe(false)
    expect(
      emptyReason.error?.issues.some((issue) => issue.path[0] === 'description')
    ).toBe(true)

    expect(
      manualBalanceAdjustmentSchema.safeParse({
        accountId: 'acc-1',
        direction: 'DECREASE',
        amountCents: 0,
        status: 'PENDING',
        description: 'Motivo válido',
      }).success
    ).toBe(false)
  })

  it('exige description obrigatória até 500 caracteres ao validar ADJUSTMENT em transactionFormSchema', () => {
    const missingDesc = transactionFormSchema.safeParse({
      type: 'ADJUSTMENT',
      status: 'EFFECTIVE',
      amountCents: 1000,
      date: '2026-11-25',
      description: '  ',
      accountId: 'acc-1',
      destinationAccountId: null,
      categoryId: null,
      direction: 'INCREASE',
    })

    expect(missingDesc.success).toBe(false)
    expect(
      missingDesc.error?.issues.some((issue) => issue.path[0] === 'description')
    ).toBe(true)

    expect(
      transactionFormSchema.safeParse({
        type: 'ADJUSTMENT',
        status: 'EFFECTIVE',
        amountCents: 1000,
        date: '2026-11-25',
        description: 'a'.repeat(500),
        accountId: 'acc-1',
        destinationAccountId: null,
        categoryId: null,
        direction: 'DECREASE',
      }).success
    ).toBe(true)
  })
})

describe('transaction.utils & transactionUrl.utils (ADJUSTMENT)', () => {
  it('formata sinal, cor e rótulo de direção para ADJUSTMENT', () => {
    expect(getTransactionAmountSign('ADJUSTMENT', 'INCREASE')).toBe('+')
    expect(getTransactionAmountSign('ADJUSTMENT', 'DECREASE')).toBe('−')
    expect(getTransactionAmountClassName('ADJUSTMENT', 'INCREASE')).toBe(
      'text-state-income'
    )
    expect(getTransactionAmountClassName('ADJUSTMENT', 'DECREASE')).toBe(
      'text-state-expense'
    )
    expect(getTransactionDirectionLabel('INCREASE')).toBe('Acréscimo')
    expect(getTransactionDirectionLabel('DECREASE', 'full')).toBe(
      'Redução no saldo'
    )
    expect(
      formatSignedTransactionAmount(
        { type: 'ADJUSTMENT', direction: 'DECREASE', amountCents: 5000 },
        (cents) => `R$ ${(cents / 100).toFixed(2).replace('.', ',')}`
      )
    ).toBe('− R$ 50,00')
    expect(
      getCategoryName([], {
        categoryId: 'tech',
        type: 'ADJUSTMENT',
        direction: 'INCREASE',
      })
    ).toBe('Ajuste · Acréscimo')
  })

  it('suporta view=ADJUSTMENT e create=ADJUSTMENT limpando categoryId na URL', () => {
    const parsed = parseTransactionUrlState(
      new URLSearchParams('view=ADJUSTMENT&categoryId=cat-1&accountId=acc-1')
    )

    expect(parsed.view).toBe('ADJUSTMENT')
    expect(parsed.filters.categoryId).toBeNull()
    expect(parsed.filters.accountId).toBe('acc-1')

    const built = buildTransactionSearchParams(parsed, {
      categoryId: 'cat-2',
    })
    expect(built.get('view')).toBe('ADJUSTMENT')
    expect(built.get('categoryId')).toBeNull()

    expect(
      parseTransactionCreateIntent(new URLSearchParams('create=ADJUSTMENT'))
    ).toBe('ADJUSTMENT')
  })
})
