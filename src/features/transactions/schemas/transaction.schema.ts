import { z } from 'zod'
import { currencyInputToCents } from '@/shared/utils/formatters'
import { isValidDateOnly } from '@/shared/utils/dateOnly'

export const transactionFormSchema = z
  .object({
    type: z.enum(['INCOME', 'EXPENSE', 'TRANSFER', 'ADJUSTMENT']),
    status: z.enum(['PENDING', 'EFFECTIVE']),
    amount: z
      .string()
      .min(1, 'Informe o valor.')
      .refine((value) => {
        const cents = currencyInputToCents(value)
        return cents !== undefined && cents > 0
      }, 'Informe um valor maior que zero.'),
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

export const transactionConfirmSchema = z.object({
  amount: z
    .string()
    .min(1, 'Informe o valor.')
    .refine((value) => {
      const cents = currencyInputToCents(value)
      return cents !== undefined && cents > 0
    }, 'Informe um valor maior que zero.'),
  date: z.string().refine(isValidDateOnly, 'Informe uma data válida.'),
  accountId: z.string().min(1, 'Escolha uma conta.'),
})

export type TransactionFormValues = z.infer<typeof transactionFormSchema>
export type TransactionConfirmValues = z.infer<typeof transactionConfirmSchema>
