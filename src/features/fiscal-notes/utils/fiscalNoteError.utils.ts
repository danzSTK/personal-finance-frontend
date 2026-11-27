import {
  API_ERROR_CODES,
  isApiErrorCode,
  parsePlatformError,
  parseRetryAfterSeconds,
} from '@/shared/errors'
import type {
  FiscalNoteAlreadyImportedDetails,
  TransactionAlreadyHasFiscalNoteDetails,
} from '../types/fiscal-note.types'

const readNonEmptyString = (value: unknown): string | null =>
  typeof value === 'string' && value.trim().length > 0 ? value.trim() : null

export const parseFiscalNoteAlreadyImportedDetails = (
  error: unknown
): FiscalNoteAlreadyImportedDetails | null => {
  if (!isApiErrorCode(error, API_ERROR_CODES.fiscalNoteAlreadyImported)) {
    return null
  }

  const details = parsePlatformError(error)?.details
  const existingTransactionId = readNonEmptyString(
    details?.existingTransactionId
  )
  const existingFiscalNoteId = readNonEmptyString(
    details?.existingFiscalNoteId
  )

  if (!existingTransactionId || !existingFiscalNoteId) {
    return null
  }

  return {
    existingTransactionId,
    existingFiscalNoteId,
  }
}

export const parseTransactionAlreadyHasFiscalNoteDetails = (
  error: unknown
): TransactionAlreadyHasFiscalNoteDetails | null => {
  if (!isApiErrorCode(error, API_ERROR_CODES.transactionAlreadyHasFiscalNote)) {
    return null
  }

  const details = parsePlatformError(error)?.details
  const existingFiscalNoteId = readNonEmptyString(
    details?.existingFiscalNoteId
  )

  if (!existingFiscalNoteId) {
    return null
  }

  return {
    existingFiscalNoteId,
  }
}

export const getFiscalNoteRetryAfterSeconds = (error: unknown): number | null => {
  const isRetryableFiscalNoteError =
    isApiErrorCode(error, API_ERROR_CODES.fiscalNoteRateLimitExceeded) ||
    isApiErrorCode(error, API_ERROR_CODES.sefazTemporarilyUnavailable) ||
    isApiErrorCode(error, API_ERROR_CODES.tooManyRequests)

  if (!isRetryableFiscalNoteError) {
    return null
  }

  return parseRetryAfterSeconds(error)
}
