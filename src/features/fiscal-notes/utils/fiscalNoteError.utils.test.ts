import { describe, expect, it } from 'vitest'
import { API_ERROR_CODES } from '@/shared/errors'
import {
  getFiscalNoteRetryAfterSeconds,
  parseFiscalNoteAlreadyImportedDetails,
  parseTransactionAlreadyHasFiscalNoteDetails,
} from './fiscalNoteError.utils'

const makeAxiosError = (
  code: string,
  statusCode: number,
  details: Record<string, unknown> | null = null,
  headers?: Record<string, string>
) => ({
  isAxiosError: true,
  response: {
    status: statusCode,
    headers,
    data: {
      statusCode,
      code,
      message: 'technical message',
      path: '/fiscal-notes/preview',
      timestamp: '2026-11-27T12:00:00.000Z',
      details,
    },
  },
})

describe('fiscalNoteError.utils', () => {
  it('extrai existingTransactionId e existingFiscalNoteId em FISCAL_NOTE_ALREADY_IMPORTED', () => {
    const error = makeAxiosError(API_ERROR_CODES.fiscalNoteAlreadyImported, 409, {
      existingTransactionId: 'tx-123',
      existingFiscalNoteId: 'fn-456',
    })

    expect(parseFiscalNoteAlreadyImportedDetails(error)).toEqual({
      existingTransactionId: 'tx-123',
      existingFiscalNoteId: 'fn-456',
    })
  })

  it('retorna null quando detalhes de duplicata estão ausentes ou outro código ocorre', () => {
    expect(
      parseFiscalNoteAlreadyImportedDetails(
        makeAxiosError(API_ERROR_CODES.fiscalNoteAlreadyImported, 409, null)
      )
    ).toBeNull()

    expect(
      parseFiscalNoteAlreadyImportedDetails(
        makeAxiosError(API_ERROR_CODES.fiscalNoteInvalidInput, 400, {
          existingTransactionId: 'tx-123',
          existingFiscalNoteId: 'fn-456',
        })
      )
    ).toBeNull()
  })

  it('extrai existingFiscalNoteId em TRANSACTION_ALREADY_HAS_FISCAL_NOTE', () => {
    const error = makeAxiosError(
      API_ERROR_CODES.transactionAlreadyHasFiscalNote,
      409,
      { existingFiscalNoteId: 'fn-999' }
    )

    expect(parseTransactionAlreadyHasFiscalNoteDetails(error)).toEqual({
      existingFiscalNoteId: 'fn-999',
    })
  })

  it('extrai retryAfterSeconds em erros de rate limit e SEFAZ indisponível', () => {
    const rateLimitError = makeAxiosError(
      API_ERROR_CODES.fiscalNoteRateLimitExceeded,
      429,
      { retryAfterSeconds: 30 }
    )
    const sefazUnavailable = makeAxiosError(
      API_ERROR_CODES.sefazTemporarilyUnavailable,
      503,
      null,
      { 'retry-after': '15' }
    )
    const otherError = makeAxiosError(
      API_ERROR_CODES.sefazTimeout,
      504,
      { retryAfterSeconds: 10 }
    )

    expect(getFiscalNoteRetryAfterSeconds(rateLimitError)).toBe(30)
    expect(getFiscalNoteRetryAfterSeconds(sefazUnavailable)).toBe(15)
    expect(getFiscalNoteRetryAfterSeconds(otherError)).toBeNull()
  })
})
