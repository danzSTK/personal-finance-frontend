export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

export const formatCurrencyFromCents = (
  cents: number | null | undefined
): string => formatCurrency((cents ?? 0) / 100)

export const currencyInputToCents = (value: string): number | undefined => {
  const digits = value.replace(/\D/g, '')

  if (!digits) {
    return undefined
  }

  return Number(digits)
}

export const centsToCurrencyInput = (
  cents: number | null | undefined
): string => {
  if (cents === null || cents === undefined) {
    return ''
  }

  return formatCurrencyFromCents(cents)
}

export const formatDate = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat('pt-BR').format(dateObj)
}

export const formatDateTime = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(dateObj)
}

export const parseCurrency = (value: string): number => {
  return Number(value.replace(/[^\d,]/g, '').replace(',', '.')) || 0
}
