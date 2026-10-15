import { z } from 'zod'

const emptyStringToUndefined = (value: unknown) =>
  value === '' ? undefined : value

const emptyStringToNull = (value: unknown) => (value === '' ? null : value)

const accountNameSchema = z
  .string()
  .trim()
  .min(3, 'Use pelo menos 3 caracteres.')
  .max(255, 'Use no máximo 255 caracteres.')

const initialBalanceCentsSchema = z.preprocess(
  emptyStringToUndefined,
  z
    .number({ invalid_type_error: 'Informe um valor válido.' })
    .int('Informe um valor válido em centavos.')
    .min(0, 'O saldo inicial não pode ser negativo.')
    .max(Number.MAX_SAFE_INTEGER, 'Informe um valor menor.')
    .optional()
)

const colorTokenSchema = z.preprocess(
  emptyStringToNull,
  z
    .string()
    .max(30, 'A cor deve ter no máximo 30 caracteres.')
    .nullable()
    .optional()
)

const iconKeySchema = z.preprocess(
  emptyStringToNull,
  z
    .string()
    .max(100, 'O ícone deve ter no máximo 100 caracteres.')
    .nullable()
    .optional()
)

export const createInstitutionalAccountSchema = z.object({
  name: accountNameSchema,
  type: z.literal('BANK'),
  initialBalanceCents: initialBalanceCentsSchema,
  templateId: z.string().min(1, 'Escolha uma instituição.'),
  includeInTotal: z.boolean(),
  isDefault: z.boolean(),
})

export const createCustomAccountSchema = z.object({
  name: accountNameSchema,
  type: z.literal('BANK'),
  initialBalanceCents: initialBalanceCentsSchema,
  colorToken: colorTokenSchema,
  iconKey: iconKeySchema,
  includeInTotal: z.boolean(),
  isDefault: z.boolean(),
})

export const updateAccountSchema = z.object({
  name: accountNameSchema,
  type: z.enum(['CASH', 'BANK', 'CREDIT_CARD', 'INVESTMENT']),
  colorToken: colorTokenSchema,
  iconKey: iconKeySchema,
  includeInTotal: z.boolean(),
})

export const accountFormSchema = z
  .object({
    creationKind: z.enum(['institutional', 'custom']),
    name: accountNameSchema,
    type: z.enum(['CASH', 'BANK', 'CREDIT_CARD', 'INVESTMENT']),
    initialBalanceCents: initialBalanceCentsSchema,
    templateId: z.string().optional(),
    colorToken: colorTokenSchema,
    iconKey: iconKeySchema,
    includeInTotal: z.boolean(),
    isDefault: z.boolean(),
  })
  .superRefine((values, context) => {
    if (values.creationKind === 'institutional' && !values.templateId) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['templateId'],
        message: 'Escolha uma instituição.',
      })
    }
  })

export type CreateInstitutionalAccountFormValues = z.infer<
  typeof createInstitutionalAccountSchema
>
export type CreateCustomAccountFormValues = z.infer<
  typeof createCustomAccountSchema
>
export type UpdateAccountFormValues = z.infer<typeof updateAccountSchema>
export type AccountFormValues = z.infer<typeof accountFormSchema>
