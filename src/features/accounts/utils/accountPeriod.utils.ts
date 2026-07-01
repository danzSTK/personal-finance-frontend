export interface AccountYearMonth {
  year: number
  month: number
}

export type AccountPeriodRelation = 'past' | 'current' | 'future'

export const ACCOUNT_MONTH_LABELS = [
  'janeiro',
  'fevereiro',
  'março',
  'abril',
  'maio',
  'junho',
  'julho',
  'agosto',
  'setembro',
  'outubro',
  'novembro',
  'dezembro',
] as const

export const ACCOUNT_MONTH_SHORT_LABELS = [
  'JAN',
  'FEV',
  'MAR',
  'ABR',
  'MAI',
  'JUN',
  'JUL',
  'AGO',
  'SET',
  'OUT',
  'NOV',
  'DEZ',
] as const

export const getCurrentYearMonth = (): AccountYearMonth => {
  const now = new Date()

  return {
    year: now.getFullYear(),
    month: now.getMonth() + 1,
  }
}

export const compareYearMonth = (
  value: AccountYearMonth,
  current: AccountYearMonth = getCurrentYearMonth()
): AccountPeriodRelation => {
  if (value.year < current.year) return 'past'
  if (value.year > current.year) return 'future'
  if (value.month < current.month) return 'past'
  if (value.month > current.month) return 'future'
  return 'current'
}

export const formatAccountMonthLabel = (value: AccountYearMonth): string =>
  ACCOUNT_MONTH_LABELS[value.month - 1] ?? ''

export const formatAccountMonthYearLabel = (
  value: AccountYearMonth
): string => `${formatAccountMonthLabel(value)} de ${value.year}`

export const getMonthEndDateOnly = (value: AccountYearMonth): string => {
  const lastDay = getDaysInMonth(value.year, value.month)

  return `${value.year}-${pad2(value.month)}-${pad2(lastDay)}`
}

const getDaysInMonth = (year: number, month: number): number => {
  if (month === 2) {
    return isLeapYear(year) ? 29 : 28
  }

  return [4, 6, 9, 11].includes(month) ? 30 : 31
}

const isLeapYear = (year: number): boolean =>
  year % 400 === 0 || (year % 4 === 0 && year % 100 !== 0)

const pad2 = (value: number): string => String(value).padStart(2, '0')
