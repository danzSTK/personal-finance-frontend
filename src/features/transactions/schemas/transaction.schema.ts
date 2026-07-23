import { z } from 'zod'
import { isValidDateOnly } from '@/shared/utils/dateOnly'

const positiveAmountCentsSchema = z
  .number({
    required_error: 'Informe o valor.',
    invalid_type_error: 'Informe um valor válido.',
  })
  .int('Informe um valor válido em centavos.')
  .positive('Informe um valor maior que zero.')
  .max(Number.MAX_SAFE_INTEGER, 'Informe um valor menor.')

export const transactionFormSchema = z
  .object({
    type: z.enum(['INCOME', 'EXPENSE', 'TRANSFER', 'ADJUSTMENT']),
    status: z.enum(['PENDING', 'EFFECTIVE']),
    amountCents: positiveAmountCentsSchema.optional(),
    date: z
      .string()
      .refine(isValidDateOnly, 'Informe uma data válida.'),
    description: z.string().max(120, 'Use até 120 caracteres.').nullable(),
    accountId: z.string().min(1, 'Escolha uma conta.'),
    destinationAccountId: z.string().nullable(),
    categoryId: z.string().nullable(),
    direction: z.enum(['INCREASE', 'DECREASE']).nullable(),
  })
  .superRefine((values, context) => {
    if (values.amountCents === undefined) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['amountCents'],
        message: 'Informe o valor.',
      })
    }

    if ((values.type === 'INCOME' || values.type === 'EXPENSE') && !values.categoryId) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['categoryId'],
        message: 'Escolha uma categoria.',
      })
    }

    if (values.type === 'TRANSFER') {
      if (!values.destinationAccountId) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['destinationAccountId'],
          message: 'Escolha a conta de destino.',
        })
      }

      if (
        values.destinationAccountId &&
        values.destinationAccountId === values.accountId
      ) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['destinationAccountId'],
          message: 'A conta de destino precisa ser diferente.',
        })
      }
    }

    if (values.type === 'ADJUSTMENT' && !values.direction) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['direction'],
        message: 'Escolha a direção do ajuste.',
      })
    }
  })

export const transactionConfirmSchema = z
  .object({
    type: z.enum(['INCOME', 'EXPENSE', 'TRANSFER', 'ADJUSTMENT']),
    amountCents: positiveAmountCentsSchema.optional(),
    date: z.string().refine(isValidDateOnly, 'Informe uma data válida.'),
    accountId: z.string().min(1, 'Escolha uma conta.'),
    destinationAccountId: z.string().nullable(),
  })
  .superRefine((values, context) => {
    if (values.amountCents === undefined) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['amountCents'],
        message: 'Informe o valor.',
      })
    }

    if (values.type !== 'TRANSFER') {
      return
    }

    if (!values.destinationAccountId) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['destinationAccountId'],
        message: 'Escolha a conta de destino.',
      })
      return
    }

    if (values.destinationAccountId === values.accountId) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['destinationAccountId'],
        message: 'A conta de destino precisa ser diferente.',
      })
    }
  })

export type TransactionFormValues = z.infer<typeof transactionFormSchema>
export type TransactionConfirmValues = z.infer<typeof transactionConfirmSchema>
