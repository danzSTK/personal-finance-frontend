import { compareDateOnly, isValidDateOnly } from '@/shared/utils/dateOnly'
import {
  FISCAL_NOTE_LIST_DEFAULT_LIMIT,
  FISCAL_NOTE_LIST_DEFAULT_PAGE,
  FISCAL_NOTE_LIST_DEFAULT_SORT,
  FISCAL_NOTE_LIST_MAX_LIMIT,
  FISCAL_NOTE_LIST_SEARCH_MAX_LENGTH,
  FISCAL_NOTE_LIST_SORTS,
} from '../constants/fiscal-notes.constants'
import type {
  FiscalNoteListQueryParams,
  FiscalNoteListSort,
} from '../types/fiscal-note.types'
import { stripNonDigits } from './fiscalNoteInput.utils'

const CNPJ_DIGIT_LENGTH = 14
const UF_CODE_REGEX = /^\d{2}$/
const NON_NEGATIVE_INTEGER_REGEX = /^\d+$/

export interface FiscalNoteListUrlState {
  search: string
  issuedFrom: string | null
  issuedTo: string | null
  issuerCnpj: string | null
  sourceUf: string | null
  minAmountCents: number | null
  maxAmountCents: number | null
  sort: FiscalNoteListSort
  page: number
  limit: number
}

export type FiscalNoteListUrlPatch = Partial<FiscalNoteListUrlState>

/** Extracts numeric digits from a CNPJ string, capped at 14 digits. */
export const normalizeCnpjDigits = (value: string): string =>
  stripNonDigits(value).slice(0, CNPJ_DIGIT_LENGTH)

/** Formats partial or full CNPJ digits using the `00.000.000/0000-00` mask. */
export const formatCnpjMask = (value: string): string => {
  const digits = normalizeCnpjDigits(value)

  if (digits.length <= 2) return digits
  if (digits.length <= 5) return `${digits.slice(0, 2)}.${digits.slice(2)}`
  if (digits.length <= 8) {
    return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5)}`
  }
  if (digits.length <= 12) {
    return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8)}`
  }

  return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8, 12)}-${digits.slice(12)}`
}

/** Parses and validates fiscal-note listing parameters from URL query params. */
export const parseFiscalNoteListUrlState = (
  searchParams: URLSearchParams
): FiscalNoteListUrlState => {
  const rawSearch = searchParams.get('q')?.trim() ?? ''
  const search = rawSearch.slice(0, FISCAL_NOTE_LIST_SEARCH_MAX_LENGTH)

  let issuedFrom = parseDateOnlyParam(searchParams.get('issuedFrom'))
  let issuedTo = parseDateOnlyParam(searchParams.get('issuedTo'))
  if (issuedFrom && issuedTo && compareDateOnly(issuedFrom, issuedTo) > 0) {
    issuedFrom = null
    issuedTo = null
  }

  let minAmountCents = parseNonNegativeInteger(
    searchParams.get('minAmountCents')
  )
  let maxAmountCents = parseNonNegativeInteger(
    searchParams.get('maxAmountCents')
  )
  if (
    minAmountCents !== null &&
    maxAmountCents !== null &&
    minAmountCents > maxAmountCents
  ) {
    minAmountCents = null
    maxAmountCents = null
  }

  return {
    search,
    issuedFrom,
    issuedTo,
    issuerCnpj: parseValidCnpjParam(searchParams.get('issuerCnpj')),
    sourceUf: parseUfParam(searchParams.get('sourceUf')),
    minAmountCents,
    maxAmountCents,
    sort: parseSortParam(searchParams.get('sort')),
    page:
      parsePositiveInteger(searchParams.get('page')) ??
      FISCAL_NOTE_LIST_DEFAULT_PAGE,
    limit: parseLimitParam(searchParams.get('limit')),
  }
}

/** Serializes a fiscal-note list state with an optional patch, omitting empty and default values. */
export const buildFiscalNoteListSearchParams = (
  state: FiscalNoteListUrlState,
  patch: FiscalNoteListUrlPatch = {}
): URLSearchParams => {
  const nextSearch = (
    hasPatchKey(patch, 'search') ? (patch.search ?? '') : state.search
  )
    .trim()
    .slice(0, FISCAL_NOTE_LIST_SEARCH_MAX_LENGTH)

  let nextIssuedFrom = parseDateOnlyParam(
    hasPatchKey(patch, 'issuedFrom') ? patch.issuedFrom : state.issuedFrom
  )
  let nextIssuedTo = parseDateOnlyParam(
    hasPatchKey(patch, 'issuedTo') ? patch.issuedTo : state.issuedTo
  )
  if (
    nextIssuedFrom &&
    nextIssuedTo &&
    compareDateOnly(nextIssuedFrom, nextIssuedTo) > 0
  ) {
    nextIssuedFrom = null
    nextIssuedTo = null
  }

  const nextIssuerCnpj = parseValidCnpjParam(
    hasPatchKey(patch, 'issuerCnpj') ? patch.issuerCnpj : state.issuerCnpj
  )
  const nextSourceUf = parseUfParam(
    hasPatchKey(patch, 'sourceUf') ? patch.sourceUf : state.sourceUf
  )

  let nextMinAmountCents = parseNonNegativeAmount(
    hasPatchKey(patch, 'minAmountCents')
      ? patch.minAmountCents
      : state.minAmountCents
  )
  let nextMaxAmountCents = parseNonNegativeAmount(
    hasPatchKey(patch, 'maxAmountCents')
      ? patch.maxAmountCents
      : state.maxAmountCents
  )
  if (
    nextMinAmountCents !== null &&
    nextMaxAmountCents !== null &&
    nextMinAmountCents > nextMaxAmountCents
  ) {
    nextMinAmountCents = null
    nextMaxAmountCents = null
  }

  const nextSort =
    hasPatchKey(patch, 'sort') && patch.sort && isFiscalNoteListSort(patch.sort)
      ? patch.sort
      : state.sort

  const nextPage =
    hasPatchKey(patch, 'page') &&
    typeof patch.page === 'number' &&
    Number.isSafeInteger(patch.page) &&
    patch.page >= 1
      ? patch.page
      : state.page

  const nextLimit =
    hasPatchKey(patch, 'limit') &&
    typeof patch.limit === 'number' &&
    isValidLimit(patch.limit)
      ? patch.limit
      : state.limit

  const params = new URLSearchParams()

  if (nextSearch) params.set('q', nextSearch)
  if (nextIssuedFrom) params.set('issuedFrom', nextIssuedFrom)
  if (nextIssuedTo) params.set('issuedTo', nextIssuedTo)
  if (nextIssuerCnpj) params.set('issuerCnpj', nextIssuerCnpj)
  if (nextSourceUf) params.set('sourceUf', nextSourceUf)
  if (nextMinAmountCents !== null) {
    params.set('minAmountCents', String(nextMinAmountCents))
  }
  if (nextMaxAmountCents !== null) {
    params.set('maxAmountCents', String(nextMaxAmountCents))
  }
  if (nextSort !== FISCAL_NOTE_LIST_DEFAULT_SORT) {
    params.set('sort', nextSort)
  }
  if (nextPage !== FISCAL_NOTE_LIST_DEFAULT_PAGE) {
    params.set('page', String(nextPage))
  }
  if (nextLimit !== FISCAL_NOTE_LIST_DEFAULT_LIMIT) {
    params.set('limit', String(nextLimit))
  }

  return params
}

/** Converts parsed URL state into the query payload expected by `listFiscalNotes`. */
export const toFiscalNoteListQueryParams = (
  state: FiscalNoteListUrlState
): FiscalNoteListQueryParams => {
  const params: FiscalNoteListQueryParams = {
    page: state.page,
    limit: state.limit,
    sort: state.sort,
  }

  const trimmedSearch = state.search.trim()
  if (trimmedSearch) {
    params.search = trimmedSearch.slice(0, FISCAL_NOTE_LIST_SEARCH_MAX_LENGTH)
  }
  if (state.issuedFrom) params.issuedFrom = state.issuedFrom
  if (state.issuedTo) params.issuedTo = state.issuedTo
  if (state.issuerCnpj) params.issuerCnpj = state.issuerCnpj
  if (state.sourceUf) params.sourceUf = state.sourceUf
  if (state.minAmountCents !== null) {
    params.minAmountCents = state.minAmountCents
  }
  if (state.maxAmountCents !== null) {
    params.maxAmountCents = state.maxAmountCents
  }

  return params
}

/** Counts active advanced filter groups managed inside the filters drawer. */
export const countActiveFiscalNoteFilters = (
  state: FiscalNoteListUrlState
): number => {
  let count = 0

  if (state.issuedFrom || state.issuedTo) count += 1
  if (state.minAmountCents !== null || state.maxAmountCents !== null) {
    count += 1
  }
  if (state.issuerCnpj) count += 1
  if (state.sourceUf) count += 1

  return count
}

const parseDateOnlyParam = (value: string | null | undefined): string | null => {
  const trimmed = value?.trim()
  return trimmed && isValidDateOnly(trimmed) ? trimmed : null
}

const parseValidCnpjParam = (value: string | null | undefined): string | null => {
  if (!value) return null
  const digits = stripNonDigits(value)
  return digits.length === CNPJ_DIGIT_LENGTH ? digits : null
}

const parseUfParam = (value: string | null | undefined): string | null => {
  const trimmed = value?.trim()
  return trimmed && UF_CODE_REGEX.test(trimmed) ? trimmed : null
}

const parseNonNegativeInteger = (
  value: string | null | undefined
): number | null => {
  const trimmed = value?.trim()
  if (!trimmed || !NON_NEGATIVE_INTEGER_REGEX.test(trimmed)) return null
  const parsed = Number(trimmed)
  return Number.isSafeInteger(parsed) && parsed >= 0 ? parsed : null
}

const parseNonNegativeAmount = (
  value: number | null | undefined
): number | null =>
  typeof value === 'number' && Number.isSafeInteger(value) && value >= 0
    ? value
    : null

const parsePositiveInteger = (value: string | null | undefined): number | null => {
  const parsed = parseNonNegativeInteger(value)
  return parsed !== null && parsed >= 1 ? parsed : null
}

const parseLimitParam = (value: string | null | undefined): number => {
  const parsed = parsePositiveInteger(value)
  return parsed !== null && isValidLimit(parsed)
    ? parsed
    : FISCAL_NOTE_LIST_DEFAULT_LIMIT
}

const isValidLimit = (value: number): boolean =>
  Number.isSafeInteger(value) &&
  value >= 1 &&
  value <= FISCAL_NOTE_LIST_MAX_LIMIT

const parseSortParam = (value: string | null | undefined): FiscalNoteListSort =>
  value && isFiscalNoteListSort(value)
    ? value
    : FISCAL_NOTE_LIST_DEFAULT_SORT

const isFiscalNoteListSort = (value: string): value is FiscalNoteListSort =>
  FISCAL_NOTE_LIST_SORTS.some((option) => option === value)

const hasPatchKey = (
  patch: FiscalNoteListUrlPatch,
  key: keyof FiscalNoteListUrlPatch
): boolean => Object.prototype.hasOwnProperty.call(patch, key)
