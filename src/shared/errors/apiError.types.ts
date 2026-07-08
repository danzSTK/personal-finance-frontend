import type { ApiErrorCode } from './apiErrorCodes'

export interface ApiFieldError {
  field: string
  messages: string[]
}

export interface PlatformErrorResponse {
  statusCode: number
  code: string
  message: string
  path: string
  timestamp: string
  details: Record<string, unknown> | null
}

export type ApiErrorRecovery =
  | 'retry'
  | 'sign-in'
  | 'correct-fields'
  | 'choose-target'
  | 'none'

export type ApiErrorContext =
  | 'auth.sign-in'
  | 'auth.sign-up'
  | 'auth.email-verification.confirm'
  | 'auth.email-verification.resend'
  | 'auth.link-email'
  | 'auth.link-google'
  | 'auth.sessions.list'
  | 'auth.sessions.revoke'
  | 'user.avatar.remove'
  | 'user.avatar.update'
  | 'user.profile.update'
  | 'user.username.availability'
  | 'user.username.update'
  | 'accounts.list'
  | 'accounts.summary'
  | 'accounts.create'
  | 'accounts.update'
  | 'accounts.archive'
  | 'accounts.unarchive'
  | 'accounts.set-default'
  | 'categories.list'
  | 'categories.metadata'
  | 'categories.create'
  | 'categories.update'
  | 'categories.archive'
  | 'categories.unarchive'
  | 'categories.delete'
  | 'categories.merge-delete'
  | 'transactions.list'
  | 'transactions.detail'
  | 'transactions.create'
  | 'transactions.update'
  | 'transactions.confirm'
  | 'transactions.delete'
  | 'generic'

export interface ApiErrorPresentation {
  code: ApiErrorCode | string | null
  statusCode: number | null
  title: string
  description: string
  recovery: ApiErrorRecovery
  fieldErrors: ApiFieldError[]
  isNetworkError: boolean
}
