export interface YearMonth {
  year: number
  month: number
}

export type DateOnlyComparison = -1 | 0 | 1

export const MONTH_LABELS = [
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

export const MONTH_SHORT_LABELS = [
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

export const getCurrentYearMonth = (): YearMonth => {
  const now = new Date()

  return {
    year: now.getFullYear(),
    month: now.getMonth() + 1,
  }
}

export const getTodayDateOnly = (): string => {
  const now = new Date()

  return formatDateParts(now.getFullYear(), now.getMonth() + 1, now.getDate())
}

export const getYesterdayDateOnly = (): string => {
  const today = getTodayDateOnly()
  const [year, month, day] = parseDateOnlyParts(today)

  if (day > 1) {
    return formatDateParts(year, month, day - 1)
  }

  const previousMonth = shiftYearMonth({ year, month }, -1)
  return getMonthEndDateOnly(previousMonth)
}

export const getMonthStartDateOnly = (value: YearMonth): string =>
  formatDateParts(value.year, value.month, 1)

export const getMonthEndDateOnly = (value: YearMonth): string =>
  formatDateParts(value.year, value.month, getDaysInMonth(value))

export const shiftYearMonth = (
  value: YearMonth,
  deltaMonths: number
): YearMonth => {
  const zeroBasedMonth = value.month - 1 + deltaMonths
  const year = value.year + Math.floor(zeroBasedMonth / 12)
  const monthIndex = ((zeroBasedMonth % 12) + 12) % 12

  return {
    year,
    month: monthIndex + 1,
  }
}

export const formatMonthLabel = (value: YearMonth): string =>
  MONTH_LABELS[value.month - 1] ?? ''

export const formatMonthYearLabel = (value: YearMonth): string =>
  `${capitalize(formatMonthLabel(value))} ${value.year}`

export const formatDateOnlyForDisplay = (value: string): string => {
  const parsed = parseDateOnly(value)

  if (!parsed) {
    return value
  }

  return `${pad2(parsed.day)}/${pad2(parsed.month)}/${parsed.year}`
}

export const compareDateOnly = (
  a: string,
  b: string
): DateOnlyComparison => {
  if (a === b) return 0
  return a < b ? -1 : 1
}

export const isPastDateOnly = (
  value: string,
  today: string = getTodayDateOnly()
): boolean => compareDateOnly(value, today) === -1

export const isValidDateOnly = (value: string): boolean =>
  parseDateOnly(value) !== null

const parseDateOnly = (
  value: string
): { year: number; month: number; day: number } | null => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return null
  }

  const [year, month, day] = parseDateOnlyParts(value)

  if (month < 1 || month > 12) {
    return null
  }

  if (day < 1 || day > getDaysInMonth({ year, month })) {
    return null
  }

  return { year, month, day }
}

const parseDateOnlyParts = (value: string): [number, number, number] => {
  const [year = '0', month = '0', day = '0'] = value.split('-')

  return [Number(year), Number(month), Number(day)]
}

const getDaysInMonth = ({ year, month }: YearMonth): number => {
  if (month === 2) {
    return isLeapYear(year) ? 29 : 28
  }

  return [4, 6, 9, 11].includes(month) ? 30 : 31
}

const isLeapYear = (year: number): boolean =>
  year % 400 === 0 || (year % 4 === 0 && year % 100 !== 0)

const formatDateParts = (year: number, month: number, day: number): string =>
  `${year}-${pad2(month)}-${pad2(day)}`

const pad2 = (value: number): string => String(value).padStart(2, '0')

const capitalize = (value: string): string =>
  value.length > 0 ? `${value[0]?.toUpperCase() ?? ''}${value.slice(1)}` : value
