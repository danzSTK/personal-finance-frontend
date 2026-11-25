import { z } from 'zod'

export const BALANCE_ADJUSTMENT_DESCRIPTION_MAX_LENGTH = 500

const targetBalanceCentsSchema = z
  .number({
    required_error: 'Informe o novo saldo.',
    invalid_type_error: 'Informe um saldo válido.',
  })
  .int('Informe um saldo válido em centavos.')
  .min(
    Number.MIN_SAFE_INTEGER,
    'Informe um saldo dentro do limite suportado.'
  )
  .max(
    Number.MAX_SAFE_INTEGER,
    'Informe um saldo dentro do limite suportado.'
  )

const positiveAdjustmentAmountCentsSchema = z
  .number({
    required_error: 'Informe o valor do ajuste.',
    invalid_type_error: 'Informe um valor válido.',
  })
  .int('Informe um valor válido em centavos.')
  .positive('Informe um valor maior que zero.')
  .max(Number.MAX_SAFE_INTEGER, 'Informe um valor menor.')

export const targetBalanceAdjustmentSchema = z
  .object({
    accountId: z.string().min(1, 'Escolha uma conta.'),
    targetBalanceCents: targetBalanceCentsSchema.optional(),
    description: z
      .string()
      .max(
        BALANCE_ADJUSTMENT_DESCRIPTION_MAX_LENGTH,
        `Use até ${BALANCE_ADJUSTMENT_DESCRIPTION_MAX_LENGTH} caracteres.`
      )
      .nullable(),
  })
  .superRefine((values, context) => {
    if (values.targetBalanceCents === undefined) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['targetBalanceCents'],
        message: 'Informe o novo saldo.',
      })
    }
  })

export const manualBalanceAdjustmentSchema = z
  .object({
    accountId: z.string().min(1, 'Escolha uma conta.'),
    direction: z.enum(['INCREASE', 'DECREASE']).nullable(),
    amountCents: positiveAdjustmentAmountCentsSchema.optional(),
    status: z.enum(['PENDING', 'EFFECTIVE']),
    description: z
      .string()
      .max(
        BALANCE_ADJUSTMENT_DESCRIPTION_MAX_LENGTH,
        `Use até ${BALANCE_ADJUSTMENT_DESCRIPTION_MAX_LENGTH} caracteres.`
      )
      .nullable(),
  })
  .superRefine((values, context) => {
    if (!values.direction) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['direction'],
        message: 'Escolha se o ajuste aumenta ou reduz o saldo.',
      })
    }

    if (values.amountCents === undefined) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['amountCents'],
        message: 'Informe um valor maior que zero.',
      })
    }

    if (!values.description?.trim()) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['description'],
        message: 'Informe o motivo do ajuste.',
      })
    }
  })

export type TargetBalanceAdjustmentFormValues = z.infer<
  typeof targetBalanceAdjustmentSchema
>
export type ManualBalanceAdjustmentFormValues = z.infer<
  typeof manualBalanceAdjustmentSchema
>
