import { z } from 'zod'

export const AUTH_PASSWORD_MIN_LENGTH = 6
export const AUTH_PASSWORD_MAX_LENGTH = 50

export const PASSWORD_VALIDATION_MESSAGES = {
  required: 'Senha é obrigatória',
  minLength: `Senha deve ter pelo menos ${AUTH_PASSWORD_MIN_LENGTH} caracteres`,
  maxLength: `Senha deve ter no máximo ${AUTH_PASSWORD_MAX_LENGTH} caracteres`,
  confirmation: 'As senhas devem ser iguais',
  mustDiffer: 'A nova senha deve ser diferente da senha atual',
} as const

export const passwordSchema = z
  .string()
  .min(AUTH_PASSWORD_MIN_LENGTH, PASSWORD_VALIDATION_MESSAGES.minLength)
  .max(AUTH_PASSWORD_MAX_LENGTH, PASSWORD_VALIDATION_MESSAGES.maxLength)
