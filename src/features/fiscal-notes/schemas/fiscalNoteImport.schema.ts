import { z } from 'zod'
import { isValidDateOnly } from '@/shared/utils/dateOnly'
import { FISCAL_NOTE_DESCRIPTION_MAX_LENGTH } from '../constants/fiscal-notes.constants'

export const fiscalNoteImportSchema = z.object({
  accountId: z.string().uuid('Escolha uma conta válida.'),
  categoryId: z.string().uuid('Escolha uma categoria válida.'),
  amountCents: z
    .number({
      required_error: 'Informe o valor.',
      invalid_type_error: 'Informe um valor válido.',
    })
    .int('Informe um valor válido em centavos.')
    .positive('Informe um valor maior que zero.')
    .max(Number.MAX_SAFE_INTEGER, 'Informe um valor menor.'),
  date: z.string().refine(isValidDateOnly, 'Informe uma data válida.'),
  description: z
    .string()
    .trim()
    .min(1, 'Informe a descrição da despesa.')
    .max(
      FISCAL_NOTE_DESCRIPTION_MAX_LENGTH,
      `Use até ${FISCAL_NOTE_DESCRIPTION_MAX_LENGTH} caracteres.`
    ),
  status: z.enum(['EFFECTIVE', 'PENDING']),
})

export type FiscalNoteImportFormValues = z.infer<typeof fiscalNoteImportSchema>
