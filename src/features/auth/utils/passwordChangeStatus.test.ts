import { describe, expect, it } from 'vitest'
import {
  buildPasswordChangeAvailability,
  parsePasswordChangeStatusResponse,
} from './passwordChangeStatus'

describe('password change status contract', () => {
  it('aceita somente o objeto e status documentados', () => {
    expect(
      parsePasswordChangeStatusResponse({
        object: 'auth.password_change_status',
        status: true,
      })
    ).toEqual({ object: 'auth.password_change_status', status: true })

    expect(
      parsePasswordChangeStatusResponse({ object: 'unexpected', status: true })
    ).toBeNull()
    expect(
      parsePasswordChangeStatusResponse({
        object: 'auth.password_change_status',
        status: 'false',
      })
    ).toBeNull()
  })

  it('não cria prazo quando a alteração está disponível', () => {
    expect(
      buildPasswordChangeAvailability({
        response: {
          object: 'auth.password_change_status',
          status: true,
        },
        retryAfterHeader: '527',
        receivedAtMs: 1_000,
      })
    ).toEqual({
      status: true,
      retryAfterSeconds: null,
      retryAtMs: null,
    })
  })

  it('calcula deadline absoluto a partir de Retry-After inteiro', () => {
    expect(
      buildPasswordChangeAvailability({
        response: {
          object: 'auth.password_change_status',
          status: false,
        },
        retryAfterHeader: '527',
        receivedAtMs: 1_000,
      })
    ).toEqual({
      status: false,
      retryAfterSeconds: 527,
      retryAtMs: 528_000,
    })
  })

  it.each(['0', '-1', '1.5', 'tomorrow', null])(
    'mantém bloqueado sem inventar prazo para header inválido: %s',
    (retryAfterHeader) => {
      expect(
        buildPasswordChangeAvailability({
          response: {
            object: 'auth.password_change_status',
            status: false,
          },
          retryAfterHeader,
          receivedAtMs: 1_000,
        })
      ).toEqual({
        status: false,
        retryAfterSeconds: null,
        retryAtMs: null,
      })
    }
  )
})
