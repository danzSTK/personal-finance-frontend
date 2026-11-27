import { describe, expect, it } from 'vitest'
import {
  FISCAL_NOTE_LIST_DEFAULT_LIMIT,
  FISCAL_NOTE_LIST_DEFAULT_PAGE,
  FISCAL_NOTE_LIST_DEFAULT_SORT,
  FISCAL_NOTE_LIST_SEARCH_MAX_LENGTH,
} from '../constants/fiscal-notes.constants'
import {
  buildFiscalNoteListSearchParams,
  countActiveFiscalNoteFilters,
  formatCnpjMask,
  normalizeCnpjDigits,
  parseFiscalNoteListUrlState,
  toFiscalNoteListQueryParams,
} from './fiscalNoteListUrl.utils'

describe('fiscalNoteListUrl.utils', () => {
  it('retorna estado padrão (todo o histórico) quando a URL está vazia', () => {
    const state = parseFiscalNoteListUrlState(new URLSearchParams())

    expect(state).toEqual({
      search: '',
      issuedFrom: null,
      issuedTo: null,
      issuerCnpj: null,
      sourceUf: null,
      minAmountCents: null,
      maxAmountCents: null,
      sort: FISCAL_NOTE_LIST_DEFAULT_SORT,
      page: FISCAL_NOTE_LIST_DEFAULT_PAGE,
      limit: FISCAL_NOTE_LIST_DEFAULT_LIMIT,
    })
  })

  it('lê e normaliza todos os parâmetros válidos da URL', () => {
    const params = new URLSearchParams({
      q: '  Supermercado São Luís  ',
      issuedFrom: '2026-10-01',
      issuedTo: '2026-10-31',
      issuerCnpj: '03.539.462/0002-50',
      sourceUf: '23',
      minAmountCents: '0',
      maxAmountCents: '15000',
      sort: 'payableAmountCents:desc',
      page: '3',
      limit: '50',
    })

    const state = parseFiscalNoteListUrlState(params)

    expect(state).toEqual({
      search: 'Supermercado São Luís',
      issuedFrom: '2026-10-01',
      issuedTo: '2026-10-31',
      issuerCnpj: '03539462000250',
      sourceUf: '23',
      minAmountCents: 0,
      maxAmountCents: 15000,
      sort: 'payableAmountCents:desc',
      page: 3,
      limit: 50,
    })
  })

  it('trunca search em 120 caracteres e descarta datas, valores, CNPJ, UF, sort, page e limit inválidos', () => {
    const longSearch = 'a'.repeat(150)
    const params = new URLSearchParams({
      q: longSearch,
      issuedFrom: '2026-02-30',
      issuedTo: 'invalido',
      issuerCnpj: '12345',
      sourceUf: 'CE',
      minAmountCents: '-10',
      maxAmountCents: 'abc',
      sort: 'unknown:asc',
      page: '0',
      limit: '250',
    })

    const state = parseFiscalNoteListUrlState(params)

    expect(state.search).toHaveLength(FISCAL_NOTE_LIST_SEARCH_MAX_LENGTH)
    expect(state.issuedFrom).toBeNull()
    expect(state.issuedTo).toBeNull()
    expect(state.issuerCnpj).toBeNull()
    expect(state.sourceUf).toBeNull()
    expect(state.minAmountCents).toBeNull()
    expect(state.maxAmountCents).toBeNull()
    expect(state.sort).toBe(FISCAL_NOTE_LIST_DEFAULT_SORT)
    expect(state.page).toBe(FISCAL_NOTE_LIST_DEFAULT_PAGE)
    expect(state.limit).toBe(FISCAL_NOTE_LIST_DEFAULT_LIMIT)
  })

  it('descarta CNPJ com mais de 14 dígitos e faixas invertidas de data ou valor', () => {
    const params = new URLSearchParams({
      issuedFrom: '2026-11-20',
      issuedTo: '2026-11-01',
      minAmountCents: '5000',
      maxAmountCents: '1000',
      issuerCnpj: '035394620002509',
    })

    const state = parseFiscalNoteListUrlState(params)

    expect(state.issuedFrom).toBeNull()
    expect(state.issuedTo).toBeNull()
    expect(state.minAmountCents).toBeNull()
    expect(state.maxAmountCents).toBeNull()
    expect(state.issuerCnpj).toBeNull()
  })

  it('aceita limit dentro de 1..100 incluindo 10, 20 e 50', () => {
    expect(
      parseFiscalNoteListUrlState(new URLSearchParams({ limit: '10' })).limit
    ).toBe(10)
    expect(
      parseFiscalNoteListUrlState(new URLSearchParams({ limit: '25' })).limit
    ).toBe(25)
    expect(
      parseFiscalNoteListUrlState(new URLSearchParams({ limit: '100' })).limit
    ).toBe(100)
    expect(
      parseFiscalNoteListUrlState(new URLSearchParams({ limit: '101' })).limit
    ).toBe(20)
  })

  it('constrói URLSearchParams omitindo vazios e valores padrão mas preservando 0 em min/max', () => {
    const baseState = parseFiscalNoteListUrlState(new URLSearchParams())
    const params = buildFiscalNoteListSearchParams(baseState, {
      search: 'Arroz',
      issuedFrom: '2026-10-01',
      minAmountCents: 0,
      sort: 'issuedAt:desc',
      page: 1,
      limit: 20,
    })

    expect(params.toString()).toBe(
      'q=Arroz&issuedFrom=2026-10-01&minAmountCents=0'
    )

    const updated = buildFiscalNoteListSearchParams(
      parseFiscalNoteListUrlState(params),
      {
        search: '',
        issuedFrom: null,
        minAmountCents: null,
        page: 2,
        limit: 10,
        sort: 'createdAt:asc',
      }
    )

    expect(updated.toString()).toBe('sort=createdAt%3Aasc&page=2&limit=10')
  })

  it('converte estado para FiscalNoteListQueryParams incluindo minAmountCents 0', () => {
    const state = parseFiscalNoteListUrlState(
      new URLSearchParams({
        q: 'Leite',
        issuedFrom: '2026-11-01',
        issuedTo: '2026-11-27',
        issuerCnpj: '03539462000250',
        sourceUf: '23',
        minAmountCents: '0',
        maxAmountCents: '9900',
        sort: 'payableAmountCents:asc',
        page: '2',
        limit: '10',
      })
    )

    expect(toFiscalNoteListQueryParams(state)).toEqual({
      page: 2,
      limit: 10,
      sort: 'payableAmountCents:asc',
      search: 'Leite',
      issuedFrom: '2026-11-01',
      issuedTo: '2026-11-27',
      issuerCnpj: '03539462000250',
      sourceUf: '23',
      minAmountCents: 0,
      maxAmountCents: 9900,
    })
  })

  it('conta corretamente grupos de filtros avançados ativos', () => {
    const empty = parseFiscalNoteListUrlState(new URLSearchParams())
    expect(countActiveFiscalNoteFilters(empty)).toBe(0)

    const withSearchAndSortOnly = parseFiscalNoteListUrlState(
      new URLSearchParams({ q: 'Café', sort: 'createdAt:desc', page: '2' })
    )
    expect(countActiveFiscalNoteFilters(withSearchAndSortOnly)).toBe(0)

    const withPartialRange = parseFiscalNoteListUrlState(
      new URLSearchParams({ issuedFrom: '2026-10-01', maxAmountCents: '1000' })
    )
    expect(countActiveFiscalNoteFilters(withPartialRange)).toBe(2)

    const withAllGroups = parseFiscalNoteListUrlState(
      new URLSearchParams({
        issuedFrom: '2026-10-01',
        issuedTo: '2026-10-31',
        minAmountCents: '0',
        maxAmountCents: '5000',
        issuerCnpj: '03539462000250',
        sourceUf: '23',
      })
    )
    expect(countActiveFiscalNoteFilters(withAllGroups)).toBe(4)
  })

  it('normaliza dígitos e aplica máscara de CNPJ progressivamente', () => {
    expect(normalizeCnpjDigits('03.539.462/0002-5099')).toBe('03539462000250')
    expect(formatCnpjMask('')).toBe('')
    expect(formatCnpjMask('03')).toBe('03')
    expect(formatCnpjMask('03539')).toBe('03.539')
    expect(formatCnpjMask('03539462')).toBe('03.539.462')
    expect(formatCnpjMask('035394620002')).toBe('03.539.462/0002')
    expect(formatCnpjMask('03539462000250')).toBe('03.539.462/0002-50')
  })
})
