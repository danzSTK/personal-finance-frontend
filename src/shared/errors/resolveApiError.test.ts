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
      makeApiError(code, code === API_ERROR_CODES.transactionNotFound ? 404 : 409),
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
})
