import { z } from 'zod'

const emptyStringToNull = (value: unknown) => (value === '' ? null : value)

const displayNameSchema = z
  .string()
  .trim()
  .min(2, 'Use pelo menos 2 caracteres.')
  .max(120, 'Use no máximo 120 caracteres.')

export const categoryFormSchema = z.object({
  displayName: displayNameSchema,
  description: z.preprocess(
    emptyStringToNull,
    z.string().max(255, 'Use no máximo 255 caracteres.').nullable().optional()
  ),
  color: z.preprocess(
    emptyStringToNull,
    z.string().max(20, 'A cor deve ter no máximo 20 caracteres.').nullable()
  ),
  icon: z.preprocess(
    emptyStringToNull,
    z.string().max(100, 'O ícone deve ter no máximo 100 caracteres.').nullable()
  ),
  includeInReports: z.boolean(),
  sortOrder: z.coerce
    .number({
      invalid_type_error: 'Informe um número válido.',
    })
    .int('Use um número inteiro.')
    .min(0, 'Use zero ou um número maior.'),
})

export type CategoryFormValues = z.infer<typeof categoryFormSchema>
