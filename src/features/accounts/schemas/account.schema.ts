import { z } from 'zod'

const emptyStringToUndefined = (value: unknown) =>
  value === '' ? undefined : value

const emptyStringToNull = (value: unknown) => (value === '' ? null : value)

const accountNameSchema = z
  .string()
  .trim()
  .min(3, 'Use pelo menos 3 caracteres.')
  .max(255, 'Use no máximo 255 caracteres.')

export const createAccountSchema = z.object({
  name: accountNameSchema,
  type: z.enum(['BANK', 'CREDIT_CARD', 'INVESTMENT']),
  initialBalance: z.preprocess(
    emptyStringToUndefined,
    z.coerce
      .number({
        invalid_type_error: 'Informe um valor válido.',
      })
      .min(0, 'O saldo inicial não pode ser negativo.')
      .optional()
  ),
  color: z.preprocess(
    emptyStringToNull,
    z
      .string()
      .max(20, 'A cor deve ter no máximo 20 caracteres.')
      .nullable()
      .optional()
  ),
  icon: z.preprocess(
    emptyStringToNull,
    z
      .string()
      .max(100, 'O ícone deve ter no máximo 100 caracteres.')
      .nullable()
      .optional()
  ),
  includeInTotal: z.boolean(),
  isDefault: z.boolean(),
})

export const updateAccountSchema = z.object({
  name: accountNameSchema,
  type: z.enum(['CASH', 'BANK', 'CREDIT_CARD', 'INVESTMENT']),
  color: z.preprocess(
    emptyStringToNull,
    z
      .string()
      .max(20, 'A cor deve ter no máximo 20 caracteres.')
      .nullable()
      .optional()
  ),
  icon: z.preprocess(
    emptyStringToNull,
    z
      .string()
      .max(100, 'O ícone deve ter no máximo 100 caracteres.')
      .nullable()
      .optional()
  ),
  includeInTotal: z.boolean(),
})

export type CreateAccountFormValues = z.infer<typeof createAccountSchema>
export type UpdateAccountFormValues = z.infer<typeof updateAccountSchema>
export type AccountFormValues =
  | CreateAccountFormValues
  | UpdateAccountFormValues
