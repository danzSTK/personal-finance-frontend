import { describe, expect, it } from 'vitest'
import {
  createCustomAccountSchema,
  createInstitutionalAccountSchema,
} from './account.schema'

const validAccount = {
  name: 'Conta principal',
  type: 'BANK' as const,
  colorToken: null,
  iconKey: null,
  includeInTotal: true,
  isDefault: false,
}

describe('createCustomAccountSchema initialBalanceCents', () => {
  it.each([1, 123, 123456])(
    'aceita %i centavos sem conversão decimal',
    (value) => {
      const result = createCustomAccountSchema.safeParse({
        ...validAccount,
        initialBalanceCents: value,
      })

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.initialBalanceCents).toBe(value)
      }
    }
  )

  it('aceita zero e campo vazio', () => {
    expect(
      createCustomAccountSchema.safeParse({
        ...validAccount,
        initialBalanceCents: 0,
      }).success
    ).toBe(true)
    expect(
      createCustomAccountSchema.safeParse({
        ...validAccount,
        initialBalanceCents: '',
      }).success
    ).toBe(true)
  })

  it('rejeita fração de centavo e inteiro inseguro', () => {
    expect(
      createCustomAccountSchema.safeParse({
        ...validAccount,
        initialBalanceCents: 1.5,
      }).success
    ).toBe(false)
    expect(
      createCustomAccountSchema.safeParse({
        ...validAccount,
        initialBalanceCents: Number.MAX_SAFE_INTEGER + 1,
      }).success
    ).toBe(false)
  })
})

describe('createInstitutionalAccountSchema', () => {
  it('exige um template institucional selecionado', () => {
    expect(
      createInstitutionalAccountSchema.safeParse({
        name: 'Nubank',
        type: 'BANK',
        templateId: '',
        includeInTotal: true,
        isDefault: false,
      }).success
    ).toBe(false)

    expect(
      createInstitutionalAccountSchema.safeParse({
        name: 'Nubank',
        type: 'BANK',
        templateId: '54066cca-075e-4300-923b-f5b36462aa1f',
        includeInTotal: true,
        isDefault: false,
      }).success
    ).toBe(true)
  })
})
