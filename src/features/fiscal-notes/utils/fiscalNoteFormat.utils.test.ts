import { describe, expect, it } from 'vitest'
import {
  computeFiscalNoteDivergence,
  formatCnpj,
  formatFiscalNoteNumberAndSeries,
  formatFiscalNoteUnitPrice,
  formatItemQuantity,
  getPaymentMethodLabel,
} from './fiscalNoteFormat.utils'

describe('fiscalNoteFormat.utils', () => {
  it('formata CNPJ com 14 dígitos e preserva entradas inválidas limpas', () => {
    expect(formatCnpj('03539462000250')).toBe('03.539.462/0002-50')
    expect(formatCnpj('03.539.462/0002-50')).toBe('03.539.462/0002-50')
    expect(formatCnpj('12345')).toBe('12345')
  })

  it('formata quantidade com até 4 casas decimais e unidade em maiúsculas', () => {
    expect(formatItemQuantity(0.468, 'kg')).toBe('0,468 KG')
    expect(formatItemQuantity(1.2345, 'L')).toBe('1,2345 L')
    expect(formatItemQuantity(2, 'un')).toBe('2 UN')
    expect(formatItemQuantity(1, '')).toBe('1 UN')
  })

  it('formata preço unitário preservando até 4 casas decimais sem arredondamento destrutivo', () => {
    expect(formatFiscalNoteUnitPrice(26.99)).toContain('26,99')
    expect(formatFiscalNoteUnitPrice(4.599)).toContain('4,599')
  })

  it('resolve rótulos de formas de pagamento por código SEFAZ ou texto existente', () => {
    expect(getPaymentMethodLabel('01')).toBe('Dinheiro')
    expect(getPaymentMethodLabel('4')).toBe('Cartão de Débito')
    expect(getPaymentMethodLabel('17')).toBe('PIX')
    expect(getPaymentMethodLabel('Cartão de Crédito')).toBe('Cartão de Crédito')
    expect(getPaymentMethodLabel('   ')).toBe('Outros')
  })

  it('formata número e série da NFC-e', () => {
    expect(formatFiscalNoteNumberAndSeries('76054', '103')).toBe(
      'Nº 76054 · Série 103'
    )
  })

  it('detecta divergência de valor e/ou data entre transação alvo e nota fiscal', () => {
    expect(
      computeFiscalNoteDivergence(
        { amountCents: 3141, date: '2026-10-15' },
        { payableAmountCents: 3141, issuedDate: '2026-10-15' }
      )
    ).toEqual({
      hasDivergence: false,
      amountDiffers: false,
      dateDiffers: false,
      transactionAmountCents: 3141,
      fiscalNoteAmountCents: 3141,
      transactionDate: '2026-10-15',
      fiscalNoteDate: '2026-10-15',
    })

    expect(
      computeFiscalNoteDivergence(
        { amountCents: 3000, date: '2026-10-14' },
        { payableAmountCents: 3141, issuedDate: '2026-10-15' }
      )
    ).toEqual({
      hasDivergence: true,
      amountDiffers: true,
      dateDiffers: true,
      transactionAmountCents: 3000,
      fiscalNoteAmountCents: 3141,
      transactionDate: '2026-10-14',
      fiscalNoteDate: '2026-10-15',
    })
  })
})
