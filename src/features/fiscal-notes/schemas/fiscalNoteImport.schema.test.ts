import { describe, expect, it } from 'vitest'
import { fiscalNoteImportSchema } from './fiscalNoteImport.schema'
import { fiscalNoteInputSchema } from './fiscalNoteInput.schema'
import { computeMod11CheckDigit } from '../utils/fiscalNoteInput.utils'

const ACCOUNT_UUID = '11111111-1111-4111-8111-111111111111'
const CATEGORY_UUID = '22222222-2222-4222-8222-222222222222'

const buildValidCeAccessKey = (): string => {
  const first43 = '2326100353946200025065103000076054144320878'
  const dv = computeMod11CheckDigit(first43)
  return `${first43}${dv}`
}

describe('fiscalNoteImportSchema', () => {
  it('aceita payload válido completo de importação', () => {
    const result = fiscalNoteImportSchema.safeParse({
      accountId: ACCOUNT_UUID,
      categoryId: CATEGORY_UUID,
      amountCents: 3141,
      date: '2026-10-15',
      description: 'SUPERMERCADO EXEMPLO LTDA',
      status: 'EFFECTIVE',
    })

    expect(result.success).toBe(true)
  })

  it('exige accountId e categoryId UUID válidos', () => {
    const result = fiscalNoteImportSchema.safeParse({
      accountId: 'invalido',
      categoryId: '',
      amountCents: 3141,
      date: '2026-10-15',
      description: 'Compra',
      status: 'EFFECTIVE',
    })

    expect(result.success).toBe(false)
    if (!result.success) {
      const fields = result.error.issues.map((issue) => issue.path[0])
      expect(fields).toContain('accountId')
      expect(fields).toContain('categoryId')
    }
  })

  it('rejeita amountCents <= 0 (incluindo nota com payableAmountCents === 0 sem override)', () => {
    const zeroResult = fiscalNoteImportSchema.safeParse({
      accountId: ACCOUNT_UUID,
      categoryId: CATEGORY_UUID,
      amountCents: 0,
      date: '2026-10-15',
      description: 'Compra',
      status: 'EFFECTIVE',
    })

    const negativeResult = fiscalNoteImportSchema.safeParse({
      accountId: ACCOUNT_UUID,
      categoryId: CATEGORY_UUID,
      amountCents: -100,
      date: '2026-10-15',
      description: 'Compra',
      status: 'PENDING',
    })

    expect(zeroResult.success).toBe(false)
    expect(negativeResult.success).toBe(false)
  })

  it('rejeita data civil inválida, descrição vazia ou descrição acima de 500 caracteres', () => {
    const invalidDate = fiscalNoteImportSchema.safeParse({
      accountId: ACCOUNT_UUID,
      categoryId: CATEGORY_UUID,
      amountCents: 1000,
      date: '2026-02-30',
      description: 'Compra',
      status: 'EFFECTIVE',
    })
    const emptyDescription = fiscalNoteImportSchema.safeParse({
      accountId: ACCOUNT_UUID,
      categoryId: CATEGORY_UUID,
      amountCents: 1000,
      date: '2026-10-15',
      description: '   ',
      status: 'EFFECTIVE',
    })
    const longDescription = fiscalNoteImportSchema.safeParse({
      accountId: ACCOUNT_UUID,
      categoryId: CATEGORY_UUID,
      amountCents: 1000,
      date: '2026-10-15',
      description: 'A'.repeat(501),
      status: 'EFFECTIVE',
    })

    expect(invalidDate.success).toBe(false)
    expect(emptyDescription.success).toBe(false)
    expect(longDescription.success).toBe(false)
  })
})

describe('fiscalNoteInputSchema', () => {
  it('valida entrada de captura usando parseFiscalNoteInput', () => {
    const validKey = buildValidCeAccessKey()

    expect(fiscalNoteInputSchema.safeParse({ input: validKey }).success).toBe(
      true
    )
    expect(fiscalNoteInputSchema.safeParse({ input: '1234' }).success).toBe(
      false
    )
  })
})
