import type { ChangePasswordDto, SignUpDto } from '../types'
import type { ChangePasswordFormData, SignUpFormData } from './validation'

export const buildSignUpDto = (data: SignUpFormData): SignUpDto => ({
  userName: data.userName,
  email: data.email,
  password: data.password,
  firstName: data.firstName || undefined,
  lastName: data.lastName || undefined,
})

export const buildChangePasswordDto = (
  data: ChangePasswordFormData
): ChangePasswordDto => ({
  currentPassword: data.currentPassword,
  newPassword: data.newPassword,
})
