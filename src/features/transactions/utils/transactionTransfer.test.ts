import { describe, expect, it } from 'vitest'
import {
  transactionConfirmSchema,
  transactionFormSchema,
} from '../schemas/transaction.schema'
import type { Transaction } from '../types/transaction.types'
import {
  buildConfirmTransactionDto,
  buildCreateTransactionDto,
  buildUpdateTransactionDto,
} from './transaction.utils'
import { parseTransactionCreateIntent } from './transactionUrl.utils'

const validTransferValues = {
  type: 'TRANSFER' as const,
  status: 'EFFECTIVE' as const,
  amountCents: 5000,
  date: '2026-07-22',
  description: 'Reserva mensal',
  accountId: 'origin-account-id',
  destinationAccountId: 'destination-account-id',
  categoryId: null,
  direction: null,
}

const existingTransfer: Transaction = {
  id: 'transfer-id',
  accountId: validTransferValues.accountId,
  destinationAccountId: validTransferValues.destinationAccountId,
  categoryId: 'technical-category-id',
  type: 'TRANSFER',
  status: 'PENDING',
  amountCents: validTransferValues.amountCents,
  date: validTransferValues.date,
  effectiveAt: null,
  description: validTransferValues.description,
  direction: null,
  createdAt: '2026-07-22T12:00:00.000Z',
  updatedAt: '2026-07-22T12:00:00.000Z',
}

describe('transfer transaction contract', () => {
  it('aceita uma transferência com contas diferentes', () => {
    expect(transactionFormSchema.safeParse(validTransferValues).success).toBe(
      true
    )
  })

  it('rejeita uma transferência com origem igual ao destino', () => {
    const result = transactionFormSchema.safeParse({
      ...validTransferValues,
      destinationAccountId: validTransferValues.accountId,
    })

    expect(result.success).toBe(false)
    expect(
      result.error?.issues.some(
        (issue) => issue.path.join('.') === 'destinationAccountId'
      )
    ).toBe(true)
  })

  it('exige destino e valor inteiro positivo', () => {
    expect(
      transactionFormSchema.safeParse({
        ...validTransferValues,
        destinationAccountId: null,
      }).success
    ).toBe(false)
    expect(
      transactionFormSchema.safeParse({
        ...validTransferValues,
        amountCents: 0,
      }).success
    ).toBe(false)
    expect(
      transactionFormSchema.safeParse({
        ...validTransferValues,
        amountCents: 1.5,
      }).success
    ).toBe(false)
  })

  it('mantém categoria obrigatória somente para receita e despesa', () => {
    expect(transactionFormSchema.safeParse(validTransferValues).success).toBe(
      true
    )
    expect(
      transactionFormSchema.safeParse({
        ...validTransferValues,
        type: 'INCOME',
        destinationAccountId: null,
      }).success
    ).toBe(false)
  })

  it('monta o payload sem categoria, direção ou usuário', () => {
    const dto = buildCreateTransactionDto(validTransferValues)

    expect(dto).toEqual({
      accountId: 'origin-account-id',
      destinationAccountId: 'destination-account-id',
      type: 'TRANSFER',
      status: 'EFFECTIVE',
      amountCents: 5000,
      date: '2026-07-22',
      description: 'Reserva mensal',
    })
    expect(dto).not.toHaveProperty('categoryId')
    expect(dto).not.toHaveProperty('direction')
    expect(dto).not.toHaveProperty('userId')
  })

  it.each([
    { type: 'INCOME' as const, amountCents: 1 },
    { type: 'EXPENSE' as const, amountCents: 123 },
    { type: 'INCOME' as const, amountCents: 123456 },
  ])('preserva o contrato de $type com $amountCents centavos', (sample) => {
    const dto = buildCreateTransactionDto({
      ...validTransferValues,
      ...sample,
      categoryId: 'category-id',
      destinationAccountId: null,
    })

    expect(dto).toEqual({
      accountId: validTransferValues.accountId,
      categoryId: 'category-id',
      type: sample.type,
      status: 'EFFECTIVE',
      amountCents: sample.amountCents,
      date: validTransferValues.date,
      description: validTransferValues.description,
    })
  })

  it('monta update de destino sem devolver categoria técnica ou direção', () => {
    const dto = buildUpdateTransactionDto(
      {
        ...validTransferValues,
        status: 'PENDING',
        destinationAccountId: 'new-destination-account-id',
      },
      existingTransfer
    )

    expect(dto).toEqual({
      destinationAccountId: 'new-destination-account-id',
    })
    expect(dto).not.toHaveProperty('categoryId')
    expect(dto).not.toHaveProperty('direction')
  })

  it('valida e monta confirmação de transferência sem campos técnicos', () => {
    const confirmValues = {
      type: 'TRANSFER' as const,
      amountCents: 123,
      date: '2026-07-23',
      accountId: 'new-origin-account-id',
      destinationAccountId: 'new-destination-account-id',
    }

    expect(transactionConfirmSchema.safeParse(confirmValues).success).toBe(true)
    expect(buildConfirmTransactionDto(confirmValues)).toEqual({
      amountCents: 123,
      date: '2026-07-23',
      accountId: 'new-origin-account-id',
      destinationAccountId: 'new-destination-account-id',
    })
  })

  it('preserva a confirmação de receita sem enviar destino', () => {
    expect(
      buildConfirmTransactionDto({
        type: 'INCOME',
        amountCents: 123,
        date: '2026-07-23',
        accountId: 'income-account-id',
        destinationAccountId: 'ignored-destination-id',
      })
    ).toEqual({
      amountCents: 123,
      date: '2026-07-23',
      accountId: 'income-account-id',
    })
  })

  it('rejeita confirmação com contas iguais', () => {
    expect(
      transactionConfirmSchema.safeParse({
        type: 'TRANSFER',
        amountCents: 123,
        date: '2026-07-23',
        accountId: 'same-account-id',
        destinationAccountId: 'same-account-id',
      }).success
    ).toBe(false)
  })

  it('aceita somente intents de criação conhecidos', () => {
    expect(
      parseTransactionCreateIntent(
        new URLSearchParams('view=TRANSFER&create=TRANSFER')
      )
    ).toBe('TRANSFER')
    expect(
      parseTransactionCreateIntent(new URLSearchParams('create=UNKNOWN'))
    ).toBeNull()
  })
})
