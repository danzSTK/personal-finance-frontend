import type {
  FiscalNoteListQueryParams,
  FiscalNoteListSort,
} from '../types/fiscal-note.types'

export const FISCAL_NOTES_API_ENDPOINTS = {
  list: '/fiscal-notes',
  byId: (fiscalNoteId: string) => `/fiscal-notes/${fiscalNoteId}`,
  preview: '/fiscal-notes/preview',
  import: '/fiscal-notes/import',
  byTransaction: (transactionId: string) =>
    `/transactions/${transactionId}/fiscal-note`,
} as const

export const FISCAL_NOTES_QUERY_KEYS = {
  all: ['fiscal-notes'] as const,
  lists: () => ['fiscal-notes', 'list'] as const,
  list: (filters: FiscalNoteListQueryParams) =>
    ['fiscal-notes', 'list', filters] as const,
  details: () => ['fiscal-notes', 'detail'] as const,
  detail: (fiscalNoteId: string) =>
    ['fiscal-notes', 'detail', fiscalNoteId] as const,
  byTransaction: (transactionId: string) =>
    ['fiscal-notes', 'transaction', transactionId] as const,
} as const

export const FISCAL_NOTE_LIST_DEFAULT_PAGE = 1
export const FISCAL_NOTE_LIST_DEFAULT_LIMIT = 20
export const FISCAL_NOTE_LIST_MAX_LIMIT = 100
export const FISCAL_NOTE_LIST_PAGE_SIZE_OPTIONS = [10, 20, 50] as const
export const FISCAL_NOTE_LIST_SEARCH_MAX_LENGTH = 120

export const FISCAL_NOTE_LIST_SORTS = [
  'issuedAt:desc',
  'issuedAt:asc',
  'payableAmountCents:desc',
  'payableAmountCents:asc',
  'createdAt:desc',
  'createdAt:asc',
] as const

export const FISCAL_NOTE_LIST_DEFAULT_SORT: FiscalNoteListSort = 'issuedAt:desc'

export const FISCAL_NOTE_LIST_SORT_OPTIONS: readonly {
  value: FiscalNoteListSort
  label: string
}[] = [
  { value: 'issuedAt:desc', label: 'Mais recentes (emissão)' },
  { value: 'issuedAt:asc', label: 'Mais antigas (emissão)' },
  { value: 'payableAmountCents:desc', label: 'Maior valor pago' },
  { value: 'payableAmountCents:asc', label: 'Menor valor pago' },
  { value: 'createdAt:desc', label: 'Importadas recentemente' },
  { value: 'createdAt:asc', label: 'Importadas primeiro' },
] as const

export const FISCAL_NOTE_SUPPORTED_UF_OPTIONS = [
  { code: '23', label: 'Ceará (CE)' },
] as const

/**
 * Cross-module query key prefixes used strictly for TanStack Query invalidation
 * without creating direct feature imports (preserving acyclic boundaries).
 */
export const FISCAL_NOTES_EXTERNAL_QUERY_KEY_PREFIXES = {
  transactions: ['transactions'] as const,
  transactionDetail: (transactionId: string) =>
    ['transactions', 'detail', transactionId] as const,
  accounts: ['accounts'] as const,
  dashboard: ['dashboard'] as const,
} as const

export const FISCAL_NOTE_DETAIL_STALE_TIME_MS = 5 * 60 * 1000

export const FISCAL_NOTE_PAYMENT_METHOD_LABELS: Readonly<Record<string, string>> =
  {
    '01': 'Dinheiro',
    '02': 'Cheque',
    '03': 'Cartão de Crédito',
    '04': 'Cartão de Débito',
    '05': 'Crédito Loja',
    '10': 'Vale Alimentação',
    '11': 'Vale Refeição',
    '12': 'Vale Presente',
    '13': 'Vale Combustível',
    '15': 'Boleto Bancário',
    '16': 'Depósito Bancário',
    '17': 'PIX',
    '18': 'Transferência Bancária / Carteira Digital',
    '19': 'Programa de Fidelidade / Cashback',
    '20': 'PIX Estático',
    '90': 'Sem Pagamento',
    '99': 'Outros',
  }

export const FISCAL_NOTE_PREVIEW_ITEMS_LIMIT = 3

export const FISCAL_NOTE_ALLOWED_IMAGE_TYPES = [
  'image/png',
  'image/jpeg',
  'image/webp',
] as const

export const FISCAL_NOTE_MAX_IMAGE_SIZE_BYTES = 10 * 1024 * 1024

export const FISCAL_NOTE_CE_UF_CODE = '23'
export const FISCAL_NOTE_MODEL_CODE = '65'
export const FISCAL_NOTE_ACCESS_KEY_LENGTH = 44
export const FISCAL_NOTE_INPUT_MAX_LENGTH = 1024
export const FISCAL_NOTE_DESCRIPTION_MAX_LENGTH = 500
export const FISCAL_NOTE_QR_SCANNER_THROTTLE_MS = 250
