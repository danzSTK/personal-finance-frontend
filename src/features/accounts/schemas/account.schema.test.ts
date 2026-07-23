import { describe, expect, it } from 'vitest'
import { createAccountSchema } from './account.schema'

const validAccount = {
  name: 'Conta principal',
  type: 'BANK' as const,
  color: null,
  icon: null,
  includeInTotal: true,
  isDefault: false,
}

describe('createAccountSchema initialBalanceCents', () => {
  it.each([1, 123, 123456])('aceita %i centavos sem conversão decimal', (value) => {
    const result = createAccountSchema.safeParse({
      ...validAccount,
      initialBalanceCents: value,
    })

    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.initialBalanceCents).toBe(value)
    }
  })

  it('aceita zero e campo vazio', () => {
    expect(
      createAccountSchema.safeParse({
        ...validAccount,
        initialBalanceCents: 0,
      }).success
    ).toBe(true)
    expect(
      createAccountSchema.safeParse({
        ...validAccount,
        initialBalanceCents: '',
      }).success
    ).toBe(true)
  })

  it('rejeita fração de centavo e inteiro inseguro', () => {
    expect(
      createAccountSchema.safeParse({
        ...validAccount,
        initialBalanceCents: 1.5,
      }).success
    ).toBe(false)
    expect(
      createAccountSchema.safeParse({
        ...validAccount,
        initialBalanceCents: Number.MAX_SAFE_INTEGER + 1,
      }).success
    ).toBe(false)
  })
})
