import { describe, expect, it } from 'vitest'
import { API_ERROR_CODES } from './apiErrorCodes'
import { resolveApiError } from './resolveApiError'

const makeApiError = (
  code: string,
  statusCode: number,
  details: Record<string, unknown> | null = null
) => ({
  isAxiosError: true,
  response: {
    status: statusCode,
    data: {
      statusCode,
      code,
      message: 'mensagem técnica que não pode vazar',
      path: '/transactions/technical-id',
      timestamp: '2026-07-22T12:00:00.000Z',
      details,
    },
  },
})

describe('resolveApiError em transactions', () => {
  it.each([
    API_ERROR_CODES.invalidTransaction,
    API_ERROR_CODES.transactionAccountUnavailable,
    API_ERROR_CODES.transactionNotFound,
    API_ERROR_CODES.transactionUpdateEmpty,
    API_ERROR_CODES.transactionAlreadyEffective,
  ])('resolve %s com copy segura e recuperação conhecida', (code) => {
    const error = resolveApiError(
      makeApiError(
        code,
        code === API_ERROR_CODES.transactionNotFound ? 404 : 409
      ),
      'transactions.confirm'
    )

    expect(error.code).toBe(code)
    expect(error.title).not.toContain('técnica')
    expect(error.description).not.toContain('/transactions/')
    expect(['retry', 'correct-fields', 'choose-target', 'none']).toContain(
      error.recovery
    )
  })

  it('preserva os field errors documentados sem expor a mensagem bruta', () => {
    const error = resolveApiError(
      makeApiError(API_ERROR_CODES.validation, 400, {
        fields: [
          { field: 'amountCents', messages: ['Informe um valor válido.'] },
          {
            field: 'destinationAccountId',
            messages: ['Escolha outra conta.'],
          },
        ],
      }),
      'transactions.create'
    )

    expect(error.fieldErrors).toEqual([
      { field: 'amountCents', messages: ['Informe um valor válido.'] },
      {
        field: 'destinationAccountId',
        messages: ['Escolha outra conta.'],
      },
    ])
    expect(error.description).not.toContain('mensagem técnica')
  })

  it('trata rede, unknown, 401 e 5xx com mensagens acionáveis seguras', () => {
    const network = resolveApiError(
      { isAxiosError: true, message: 'ECONNREFUSED technical' },
      'transactions.create'
    )
    const unknown = resolveApiError(
      new Error('database technical failure'),
      'transactions.create'
    )
    const unauthorized = resolveApiError(
      makeApiError('UNKNOWN_AUTH_CODE', 401),
      'transactions.create'
    )
    const server = resolveApiError(
      makeApiError('UNKNOWN_SERVER_CODE', 503),
      'transactions.create'
    )

    expect(network.isNetworkError).toBe(true)
    expect(network.recovery).toBe('retry')
    expect(unknown.description).not.toContain('database')
    expect(unauthorized.recovery).toBe('sign-in')
    expect(server.recovery).toBe('retry')
    expect(server.description).not.toContain('technical')
  })

  it('resolve EMAIL_VERIFICATION_STATE_UNAVAILABLE de forma segura', () => {
    const error = resolveApiError(
      makeApiError(API_ERROR_CODES.emailVerificationStateUnavailable, 503),
      'auth.email-verification.resend'
    )

    expect(error.code).toBe(API_ERROR_CODES.emailVerificationStateUnavailable)
    expect(error.title).toBe('Serviço indisponível no momento')
    expect(error.recovery).toBe('retry')
  })

  it.each([
    API_ERROR_CODES.accountTemplateNotFound,
    API_ERROR_CODES.accountTemplateInputConflict,
    API_ERROR_CODES.invalidAccountTemplate,
  ])('resolve %s sem expor detalhes técnicos', (code) => {
    const error = resolveApiError(
      makeApiError(
        code,
        code === API_ERROR_CODES.accountTemplateNotFound ? 404 : 400
      ),
      'accounts.create'
    )

    expect(error.title).not.toContain('técnica')
    expect(error.description).not.toContain('/transactions/')
    expect(['choose-target', 'correct-fields']).toContain(error.recovery)
  })
})

describe('resolveApiError em transactions.balance-adjustment', () => {
  it('resolve BALANCE_ADJUSTMENT_NO_DIFFERENCE (409) com copy segura e recovery correct-fields', () => {
    const error = resolveApiError(
      makeApiError(API_ERROR_CODES.balanceAdjustmentNoDifference, 409),
      'transactions.balance-adjustment'
    )

    expect(error.code).toBe(API_ERROR_CODES.balanceAdjustmentNoDifference)
    expect(error.title).toBe('O saldo já está atualizado')
    expect(error.description).not.toContain('técnica')
    expect(error.recovery).toBe('correct-fields')
  })

  it('usa copy contextualizada para TRANSACTION_CATEGORY_UNAVAILABLE em transactions.balance-adjustment', () => {
    const error = resolveApiError(
      makeApiError(API_ERROR_CODES.transactionCategoryUnavailable, 409),
      'transactions.balance-adjustment'
    )

    expect(error.title).toBe('Não foi possível registrar o reajuste')
    expect(error.description).not.toContain('Escolha uma categoria')
    expect(error.recovery).toBe('retry')
  })

  it.each([
    { code: API_ERROR_CODES.transactionAccountUnavailable, status: 409, expectedRecovery: 'correct-fields' },
    { code: API_ERROR_CODES.invalidTransaction, status: 400, expectedRecovery: 'correct-fields' },
    { code: API_ERROR_CODES.validation, status: 400, expectedRecovery: 'correct-fields' },
  ])('resolve %s no contexto de reajuste', ({ code, status, expectedRecovery }) => {
    const error = resolveApiError(
      makeApiError(code, status),
      'transactions.balance-adjustment'
    )

    expect(error.code).toBe(code)
    expect(error.recovery).toBe(expectedRecovery)
    expect(error.title).not.toContain('técnica')
  })

  it('resolve erro de rede, 500 e fallback de contexto em transactions.balance-adjustment', () => {
    const network = resolveApiError(
      { isAxiosError: true, message: 'Network Error' },
      'transactions.balance-adjustment'
    )
    const server = resolveApiError(
      makeApiError('INTERNAL_SERVER_ERROR', 500),
      'transactions.balance-adjustment'
    )
    const fallback = resolveApiError(
      makeApiError('UNKNOWN_ADJUSTMENT_CODE', 422),
      'transactions.balance-adjustment'
    )

    expect(network.isNetworkError).toBe(true)
    expect(network.recovery).toBe('retry')
    expect(server.title).toBe('Serviço indisponível no momento')
    expect(server.recovery).toBe('retry')
    expect(fallback.title).toBe('Não foi possível aplicar o reajuste')
    expect(fallback.recovery).toBe('retry')
  })
})

describe('resolveApiError em fiscal-notes', () => {
  it.each([
    {
      code: API_ERROR_CODES.fiscalNoteInvalidInput,
      status: 400,
      expectedRecovery: 'correct-fields',
    },
    {
      code: API_ERROR_CODES.invalidFiscalNote,
      status: 400,
      expectedRecovery: 'none',
    },
    {
      code: API_ERROR_CODES.fiscalNoteNotFound,
      status: 404,
      expectedRecovery: 'none',
    },
    {
      code: API_ERROR_CODES.fiscalNoteSefazNotFound,
      status: 404,
      expectedRecovery: 'correct-fields',
    },
    {
      code: API_ERROR_CODES.fiscalNoteAlreadyImported,
      status: 409,
      expectedRecovery: 'none',
    },
    {
      code: API_ERROR_CODES.transactionAlreadyHasFiscalNote,
      status: 409,
      expectedRecovery: 'none',
    },
    {
      code: API_ERROR_CODES.transactionTypeDoesNotSupportFiscalNote,
      status: 409,
      expectedRecovery: 'none',
    },
    {
      code: API_ERROR_CODES.fiscalNoteUnsupportedUf,
      status: 422,
      expectedRecovery: 'none',
    },
    {
      code: API_ERROR_CODES.fiscalNoteHomologationNotAllowed,
      status: 422,
      expectedRecovery: 'none',
    },
    {
      code: API_ERROR_CODES.fiscalNoteCancelledOrDenied,
      status: 422,
      expectedRecovery: 'none',
    },
    {
      code: API_ERROR_CODES.fiscalNoteRateLimitExceeded,
      status: 429,
      expectedRecovery: 'retry',
    },
    {
      code: API_ERROR_CODES.fiscalNoteParseFailed,
      status: 502,
      expectedRecovery: 'retry',
    },
    {
      code: API_ERROR_CODES.fiscalNoteResponseTooLarge,
      status: 502,
      expectedRecovery: 'retry',
    },
    {
      code: API_ERROR_CODES.sefazTemporarilyUnavailable,
      status: 503,
      expectedRecovery: 'retry',
    },
    {
      code: API_ERROR_CODES.sefazTimeout,
      status: 504,
      expectedRecovery: 'retry',
    },
  ])('resolve %s com copy segura e recovery esperado', ({ code, status, expectedRecovery }) => {
    const error = resolveApiError(
      makeApiError(code, status),
      'fiscal-notes.preview'
    )

    expect(error.code).toBe(code)
    expect(error.statusCode).toBe(status)
    expect(error.recovery).toBe(expectedRecovery)
    expect(error.title.length).toBeGreaterThan(0)
    expect(error.description).not.toContain('técnica')
    expect(error.description).not.toContain('/transactions/')
  })

  it('inclui retryAfterSeconds na descrição de FISCAL_NOTE_RATE_LIMIT_EXCEEDED e SEFAZ_TEMPORARILY_UNAVAILABLE', () => {
    const rateLimited = resolveApiError(
      makeApiError(API_ERROR_CODES.fiscalNoteRateLimitExceeded, 429, {
        retryAfterSeconds: 45,
      }),
      'fiscal-notes.preview'
    )
    const unavailable = resolveApiError(
      makeApiError(API_ERROR_CODES.sefazTemporarilyUnavailable, 503, {
        retryAfterSeconds: 1,
      }),
      'fiscal-notes.import'
    )

    expect(rateLimited.retryAfterSeconds).toBe(45)
    expect(rateLimited.description).toContain('45 segundos')
    expect(rateLimited.recovery).toBe('retry')

    expect(unavailable.retryAfterSeconds).toBe(1)
    expect(unavailable.description).toContain('1 segundo')
    expect(unavailable.recovery).toBe('retry')
  })

  it('contextualiza TRANSACTION_TYPE_DOES_NOT_SUPPORT_FISCAL_NOTE para edição e confirmação', () => {
    const linkError = resolveApiError(
      makeApiError(API_ERROR_CODES.transactionTypeDoesNotSupportFiscalNote, 409),
      'fiscal-notes.link'
    )
    const updateError = resolveApiError(
      makeApiError(API_ERROR_CODES.transactionTypeDoesNotSupportFiscalNote, 409),
      'transactions.update'
    )

    expect(linkError.description).toContain('despesa')
    expect(updateError.description).toContain('Desvincule a nota fiscal')
  })

  it.each([
    'fiscal-notes.preview',
    'fiscal-notes.import',
    'fiscal-notes.link',
    'fiscal-notes.get',
    'fiscal-notes.unlink',
  ] as const)('aplica fallback seguro para o contexto %s', (context) => {
    const error = resolveApiError(
      makeApiError('UNKNOWN_FISCAL_NOTE_ERROR', 422),
      context
    )

    expect(error.recovery).toBe('retry')
    expect(error.title.length).toBeGreaterThan(0)
    expect(error.description).not.toContain('técnica')
  })
})
