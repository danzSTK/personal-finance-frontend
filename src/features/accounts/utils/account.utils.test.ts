import { describe, expect, it } from 'vitest'
import { DEFAULT_ACCOUNT_VISUAL_TONE } from '../constants/account.constants'
import type { Account } from '../types/account.types'
import { getAccountColorToken, resolveAccountVisual } from './account.utils'

const baseAccount: Account = {
  object: 'account.item',
  id: 'account-id',
  name: 'Minha conta',
  type: 'BANK',
  initialBalanceCents: 0,
  templateId: null,
  template: null,
  color: null,
  icon: null,
  includeInTotal: true,
  isArchived: false,
  isDefault: false,
  balance: { currentCents: 0 },
  createdAt: '2026-08-29T12:00:00.000Z',
  updatedAt: '2026-08-29T12:00:00.000Z',
}

describe('resolveAccountVisual', () => {
  it('prioriza logo e colorToken do template institucional', () => {
    const account: Account = {
      ...baseAccount,
      templateId: 'template-id',
      template: {
        object: 'account_template.item',
        id: 'template-id',
        type: 'INSTITUTIONAL',
        name: 'Nubank',
        colorToken: 'nubank',
        iconKey: null,
        logoUrl: 'https://public.example/nubank.svg',
        bankCode: 260,
        ispb: '18236120',
      },
      color: 'blue',
      icon: 'wallet',
    }

    const visual = resolveAccountVisual(account)

    expect(visual.kind).toBe('logo')
    expect(getAccountColorToken(account)).toBe('nubank')
    expect(visual.tone.backgroundClass).toBe('bg-account-nubank')
  })

  it('usa template customizado antes do fallback legado', () => {
    const account: Account = {
      ...baseAccount,
      templateId: 'template-id',
      template: {
        object: 'account_template.item',
        id: 'template-id',
        type: 'CUSTOM',
        name: 'Reserva',
        colorToken: 'emerald',
        iconKey: 'piggy-bank',
        logoUrl: null,
        bankCode: null,
        ispb: null,
      },
      color: 'red',
      icon: 'wallet',
    }

    const visual = resolveAccountVisual(account)

    expect(visual.kind).toBe('icon')
    expect(getAccountColorToken(account)).toBe('emerald')
    expect(visual.tone.backgroundClass).toBe('bg-account-emerald')
  })

  it('tolera conta legada e token desconhecido', () => {
    const visual = resolveAccountVisual({
      ...baseAccount,
      color: 'future-token',
      icon: 'unknown-icon',
    })

    expect(visual.kind).toBe('icon')
    expect(visual.tone).toEqual(DEFAULT_ACCOUNT_VISUAL_TONE)
  })
})
