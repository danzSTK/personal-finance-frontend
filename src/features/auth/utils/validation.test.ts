import { describe, expect, it } from 'vitest'
import {
  AUTH_PASSWORD_MAX_LENGTH,
  AUTH_PASSWORD_MIN_LENGTH,
  passwordSchema,
} from '../schemas/password.schema'
import { buildChangePasswordDto, buildSignUpDto } from './formDtos'
import { changePasswordSchema, signInSchema, signUpSchema } from './validation'

describe('política de senha de auth', () => {
  it('aceita somente senhas entre 6 e 50 caracteres', () => {
    expect(
      passwordSchema.safeParse('a'.repeat(AUTH_PASSWORD_MIN_LENGTH - 1)).success
    ).toBe(false)
    expect(
      passwordSchema.safeParse('a'.repeat(AUTH_PASSWORD_MIN_LENGTH)).success
    ).toBe(true)
    expect(
      passwordSchema.safeParse('a'.repeat(AUTH_PASSWORD_MAX_LENGTH)).success
    ).toBe(true)
    expect(
      passwordSchema.safeParse('a'.repeat(AUTH_PASSWORD_MAX_LENGTH + 1)).success
    ).toBe(false)
  })

  it('mantém o sign-in sem validação estrutural da senha', () => {
    expect(
      signInSchema.safeParse({ email: 'user@danfy.test', password: 'x' })
        .success
    ).toBe(true)
    expect(
      signInSchema.safeParse({ email: 'user@danfy.test', password: '' }).success
    ).toBe(false)
  })

  it('associa a divergência do cadastro ao campo de confirmação', () => {
    const result = signUpSchema.safeParse({
      userName: 'danfy_user',
      email: 'user@danfy.test',
      password: 'secret1',
      confirmPassword: 'secret2',
      firstName: '',
      lastName: '',
    })

    expect(result.success).toBe(false)
    expect(result.success ? [] : result.error.issues[0]?.path).toEqual([
      'confirmPassword',
    ])
  })

  it('valida confirmação e diferença na alteração de senha', () => {
    const equalToCurrent = changePasswordSchema.safeParse({
      currentPassword: 'secret1',
      newPassword: 'secret1',
      confirmNewPassword: 'secret1',
    })
    const mismatchedConfirmation = changePasswordSchema.safeParse({
      currentPassword: 'secret1',
      newPassword: 'secret2',
      confirmNewPassword: 'secret3',
    })

    expect(equalToCurrent.success).toBe(false)
    expect(
      equalToCurrent.success ? [] : equalToCurrent.error.issues[0]?.path
    ).toEqual(['newPassword'])
    expect(mismatchedConfirmation.success).toBe(false)
    expect(
      mismatchedConfirmation.success
        ? []
        : mismatchedConfirmation.error.issues[0]?.path
    ).toEqual(['confirmNewPassword'])
  })

  it('remove confirmações ao montar os DTOs', () => {
    expect(
      buildSignUpDto({
        userName: 'danfy_user',
        email: 'user@danfy.test',
        password: 'secret1',
        confirmPassword: 'secret1',
        firstName: '',
        lastName: '',
      })
    ).toEqual({
      userName: 'danfy_user',
      email: 'user@danfy.test',
      password: 'secret1',
      firstName: undefined,
      lastName: undefined,
    })

    expect(
      buildChangePasswordDto({
        currentPassword: 'secret1',
        newPassword: 'secret2',
        confirmNewPassword: 'secret2',
      })
    ).toEqual({ currentPassword: 'secret1', newPassword: 'secret2' })
  })
})
