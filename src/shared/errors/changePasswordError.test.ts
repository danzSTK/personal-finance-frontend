import { describe, expect, it } from 'vitest'
import { API_ERROR_CODES } from './apiErrorCodes'
import { parseRetryAfterSeconds } from './parseApiError'
import { resolveApiError } from './resolveApiError'

const makeApiError = ({
  code = API_ERROR_CODES.passwordChangeBlocked,
  statusCode = 429,
  retryHeader,
  retryBody,
}: {
  code?: string
  statusCode?: number
  retryHeader?: unknown
  retryBody?: unknown
} = {}) => ({
  isAxiosError: true,
  response: {
    status: statusCode,
    headers: retryHeader === undefined ? {} : { 'retry-after': retryHeader },
    data: {
      statusCode,
      code,
      message: 'detalhe técnico que não pode vazar',
      path: '/auth/password/change/internal',
      timestamp: '2026-08-12T12:00:00.000Z',
      details:
        retryBody === undefined ? null : { retryAfterSeconds: retryBody },
    },
  },
})

describe('retry de alteração de senha', () => {
  it('prefere Retry-After válido ao valor do body', () => {
    expect(
      parseRetryAfterSeconds(
        makeApiError({ retryHeader: '120', retryBody: 60 })
      )
    ).toBe(120)
  })

  it('usa o body quando o header é inválido', () => {
    expect(
      parseRetryAfterSeconds(
        makeApiError({ retryHeader: 'tomorrow', retryBody: 45 })
      )
    ).toBe(45)
  })

  it.each([0, -1, 1.5, '0', '-1', '1.5', 'Wed, 12 Aug 2026 12:00:00 GMT'])(
    'rejeita retry malformado %s',
    (retryHeader) => {
      expect(parseRetryAfterSeconds(makeApiError({ retryHeader }))).toBeNull()
    }
  )

  it('mantém null quando não existe retry', () => {
    expect(parseRetryAfterSeconds(makeApiError())).toBeNull()
  })
})

describe('copies de alteração de senha', () => {
  it.each([
    API_ERROR_CODES.currentPasswordInvalid,
    API_ERROR_CODES.newPasswordMustDiffer,
    API_ERROR_CODES.passwordChangeEmailProviderRequired,
    API_ERROR_CODES.passwordChangeBlocked,
    API_ERROR_CODES.passwordChangeCooldownActive,
    API_ERROR_CODES.passwordChangeDailyLimitExceeded,
    API_ERROR_CODES.passwordChangeOperationPending,
    API_ERROR_CODES.passwordChangeCostLimited,
    API_ERROR_CODES.passwordChangeStateUnavailable,
  ])('resolve %s sem expor o backend', (code) => {
    const presentation = resolveApiError(
      makeApiError({ code, retryBody: 30 }),
      'auth.password.change'
    )

    expect(presentation.code).toBe(code)
    expect(presentation.retryAfterSeconds).toBe(30)
    expect(presentation.description).not.toContain('técnico')
    expect(presentation.description).not.toContain('/auth/password')
  })

  it('resolve rede, 401, 500 e unknown com copy segura', () => {
    const network = resolveApiError(
      { isAxiosError: true, message: 'ECONNREFUSED internal' },
      'auth.password.change'
    )
    const unauthorized = resolveApiError(
      makeApiError({ code: 'UNKNOWN', statusCode: 401 }),
      'auth.password.change'
    )
    const server = resolveApiError(
      makeApiError({ code: 'UNKNOWN', statusCode: 500 }),
      'auth.password.change'
    )
    const unknown = resolveApiError(
      new Error('database password detail'),
      'auth.password.change'
    )

    expect(network.isNetworkError).toBe(true)
    expect(unauthorized.recovery).toBe('sign-in')
    expect(server.description).not.toContain('internal')
    expect(unknown.description).not.toContain('database')
  })
})
