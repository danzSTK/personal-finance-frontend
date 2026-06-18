import { isAxiosError } from 'axios'
import { API_ERROR_CODE_VALUES, type ApiErrorCode } from './apiErrorCodes'
import type { ApiFieldError, PlatformErrorResponse } from './apiError.types'

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null

const isStringArray = (value: unknown): value is string[] =>
  Array.isArray(value) && value.every((item) => typeof item === 'string')

export const parsePlatformError = (
  error: unknown
): PlatformErrorResponse | null => {
  if (!isAxiosError(error) || !isRecord(error.response?.data)) {
    return null
  }

  const data = error.response.data

  if (
    typeof data.statusCode !== 'number' ||
    typeof data.code !== 'string' ||
    typeof data.message !== 'string' ||
    typeof data.path !== 'string' ||
    typeof data.timestamp !== 'string' ||
    (data.details !== undefined &&
      data.details !== null &&
      !isRecord(data.details))
  ) {
    return null
  }

  return {
    statusCode: data.statusCode,
    code: data.code,
    message: data.message,
    path: data.path,
    timestamp: data.timestamp,
    details: data.details ?? null,
  }
}

export const parseApiFieldErrors = (
  platformError: PlatformErrorResponse | null
): ApiFieldError[] => {
  const fields = platformError?.details?.fields

  if (!Array.isArray(fields)) {
    return []
  }

  return fields.flatMap((field): ApiFieldError[] => {
    if (
      !isRecord(field) ||
      typeof field.field !== 'string' ||
      !isStringArray(field.messages)
    ) {
      return []
    }

    return [{ field: field.field, messages: field.messages }]
  })
}

export const getApiErrorStatus = (error: unknown): number | null => {
  const platformError = parsePlatformError(error)

  if (platformError) {
    return platformError.statusCode
  }

  return isAxiosError(error) && typeof error.response?.status === 'number'
    ? error.response.status
    : null
}

export const getApiErrorCode = (error: unknown): ApiErrorCode | string | null =>
  parsePlatformError(error)?.code ?? null

export const isApiErrorCode = (error: unknown, code: ApiErrorCode): boolean =>
  getApiErrorCode(error) === code

export const isKnownApiErrorCode = (code: string): code is ApiErrorCode =>
  API_ERROR_CODE_VALUES.has(code)

export const isApiNetworkError = (error: unknown): boolean =>
  isAxiosError(error) && !error.response
