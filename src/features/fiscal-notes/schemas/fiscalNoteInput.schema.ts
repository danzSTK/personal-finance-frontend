import { z } from 'zod'
import { FISCAL_NOTE_INPUT_MAX_LENGTH } from '../constants/fiscal-notes.constants'
import { parseFiscalNoteInput } from '../utils/fiscalNoteInput.utils'

export const fiscalNoteInputSchema = z.object({
  input: z
    .string()
    .trim()
    .min(1, 'Informe a URL do QR Code ou a chave de acesso de 44 dígitos.')
    .max(
      FISCAL_NOTE_INPUT_MAX_LENGTH,
      `Use até ${FISCAL_NOTE_INPUT_MAX_LENGTH} caracteres.`
    )
    .superRefine((value, context) => {
      const result = parseFiscalNoteInput(value)
      if (!result.valid) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          message: result.error,
        })
      }
    }),
})

export type FiscalNoteInputFormValues = z.infer<typeof fiscalNoteInputSchema>
