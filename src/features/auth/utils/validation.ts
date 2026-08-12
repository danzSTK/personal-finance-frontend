import { z } from 'zod'
import {
  PASSWORD_VALIDATION_MESSAGES,
  passwordSchema,
} from '../schemas/password.schema'

export const signUpSchema = z
  .object({
    userName: z
      .string()
      .min(3, 'Username deve ter pelo menos 3 caracteres')
      .max(100, 'Username deve ter no máximo 100 caracteres')
      .regex(
        /^[a-zA-Z0-9_]+$/,
        'Username pode conter apenas letras, números e _'
      ),
    email: z.string().min(1, 'Email é obrigatório').email('Email inválido'),
    password: passwordSchema,
    confirmPassword: passwordSchema,
    firstName: z
      .string()
      .min(2, 'Nome deve ter pelo menos 2 caracteres')
      .max(255, 'Nome deve ter no máximo 255 caracteres')
      .optional()
      .or(z.literal('')),
    lastName: z
      .string()
      .min(2, 'Sobrenome deve ter pelo menos 2 caracteres')
      .max(255, 'Sobrenome deve ter no máximo 255 caracteres')
      .optional()
      .or(z.literal('')),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: PASSWORD_VALIDATION_MESSAGES.confirmation,
    path: ['confirmPassword'],
  })

export const signInSchema = z.object({
  email: z.string().min(1, 'Email é obrigatório').email('Email inválido'),
  password: z.string().min(1, PASSWORD_VALIDATION_MESSAGES.required),
})

export const linkEmailSchema = z.object({
  email: z.string().min(1, 'Email é obrigatório').email('Email inválido'),
  password: passwordSchema,
})

export const changePasswordSchema = z
  .object({
    currentPassword: passwordSchema,
    newPassword: passwordSchema,
    confirmNewPassword: passwordSchema,
  })
  .superRefine((data, context) => {
    if (data.newPassword === data.currentPassword) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: PASSWORD_VALIDATION_MESSAGES.mustDiffer,
        path: ['newPassword'],
      })
    }

    if (data.confirmNewPassword !== data.newPassword) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: PASSWORD_VALIDATION_MESSAGES.confirmation,
        path: ['confirmNewPassword'],
      })
    }
  })

const PROFILE_NAME_MIN_LENGTH = 2
const PROFILE_NAME_MAX_LENGTH = 255
const USERNAME_MIN_LENGTH = 3
const USERNAME_MAX_LENGTH = 50

const optionalProfileName = (label: string) =>
  z
    .string()
    .trim()
    .max(
      PROFILE_NAME_MAX_LENGTH,
      `${label} deve ter no máximo ${PROFILE_NAME_MAX_LENGTH} caracteres`
    )
    .refine(
      (value) => value.length === 0 || value.length >= PROFILE_NAME_MIN_LENGTH,
      `${label} deve ter pelo menos ${PROFILE_NAME_MIN_LENGTH} caracteres`
    )

export const updateProfileSchema = z.object({
  firstName: optionalProfileName('Nome'),
  lastName: optionalProfileName('Sobrenome'),
})

export const updateUsernameSchema = z.object({
  username: z
    .string()
    .trim()
    .min(
      USERNAME_MIN_LENGTH,
      `Usuário deve ter pelo menos ${USERNAME_MIN_LENGTH} caracteres`
    )
    .max(
      USERNAME_MAX_LENGTH,
      `Usuário deve ter no máximo ${USERNAME_MAX_LENGTH} caracteres`
    )
    .regex(/^[A-Za-z0-9_-]+$/, 'Use apenas letras, números, _ ou -'),
})

export type SignUpFormData = z.infer<typeof signUpSchema>
export type SignInFormData = z.infer<typeof signInSchema>
export type LinkEmailFormData = z.infer<typeof linkEmailSchema>
export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>
export type UpdateProfileFormData = z.infer<typeof updateProfileSchema>
export type UpdateUsernameFormData = z.infer<typeof updateUsernameSchema>
