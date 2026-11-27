import { FISCAL_NOTE_PAYMENT_METHOD_LABELS } from '../constants/fiscal-notes.constants'
import type { FiscalNotePreviewDetail } from '../types/fiscal-note.types'
import type {
  FiscalNoteDivergenceSummary,
  FiscalNoteLinkTarget,
} from '../types/fiscal-note-ui.types'
import { stripNonDigits } from './fiscalNoteInput.utils'

const QUANTITY_FORMATTER = new Intl.NumberFormat('pt-BR', {
  minimumFractionDigits: 0,
  maximumFractionDigits: 4,
})

const UNIT_PRICE_FORMATTER = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
  minimumFractionDigits: 2,
  maximumFractionDigits: 4,
})

export const formatCnpj = (cnpj: string): string => {
  const digits = stripNonDigits(cnpj)

  if (digits.length !== 14) {
    return cnpj.trim()
  }

  return digits.replace(
    /^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/,
    '$1.$2.$3/$4-$5'
  )
}

export const formatItemQuantity = (quantity: number, unit: string): string => {
  const formattedQuantity = Number.isFinite(quantity)
    ? QUANTITY_FORMATTER.format(quantity)
    : '0'
  const normalizedUnit = unit.trim().toUpperCase() || 'UN'

  return `${formattedQuantity} ${normalizedUnit}`
}

export const formatFiscalNoteUnitPrice = (unitPrice: number): string =>
  UNIT_PRICE_FORMATTER.format(Number.isFinite(unitPrice) ? unitPrice : 0)

export const getPaymentMethodLabel = (methodLabelOrCode: string): string => {
  const trimmed = methodLabelOrCode.trim()
  if (!trimmed) {
    return FISCAL_NOTE_PAYMENT_METHOD_LABELS['99']
  }

  const normalizedCode = /^\d{1,2}$/.test(trimmed)
    ? trimmed.padStart(2, '0')
    : trimmed

  return FISCAL_NOTE_PAYMENT_METHOD_LABELS[normalizedCode] ?? trimmed
}

export const formatFiscalNoteNumberAndSeries = (
  number: string,
  series: string
): string => `Nº ${number.trim()} · Série ${series.trim()}`

export const computeFiscalNoteDivergence = (
  target: Pick<FiscalNoteLinkTarget, 'amountCents' | 'date'>,
  fiscalNote: Pick<FiscalNotePreviewDetail, 'payableAmountCents' | 'issuedDate'>
): FiscalNoteDivergenceSummary => {
  const amountDiffers = target.amountCents !== fiscalNote.payableAmountCents
  const dateDiffers = target.date !== fiscalNote.issuedDate

  return {
    hasDivergence: amountDiffers || dateDiffers,
    amountDiffers,
    dateDiffers,
    transactionAmountCents: target.amountCents,
    fiscalNoteAmountCents: fiscalNote.payableAmountCents,
    transactionDate: target.date,
    fiscalNoteDate: fiscalNote.issuedDate,
  }
}
