import { createElement, type PropsWithChildren } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { api } from '@/shared/config/axios'
import { API_ERROR_CODES } from '@/shared/errors'
import {
  FISCAL_NOTES_API_ENDPOINTS,
  FISCAL_NOTES_EXTERNAL_QUERY_KEY_PREFIXES,
  FISCAL_NOTES_QUERY_KEYS,
} from '../constants/fiscal-notes.constants'
import type {
  FiscalNoteDetail,
  FiscalNoteImportRequest,
  FiscalNoteImportResponse,
  FiscalNoteListResponse,
  FiscalNotePreviewResponse,
} from '../types/fiscal-note.types'
import {
  getFiscalNoteById,
  getTransactionFiscalNote,
  importFiscalNote,
  linkFiscalNote,
  listFiscalNotes,
  previewFiscalNote,
  unlinkTransactionFiscalNote,
} from './fiscal-notes.api'
import {
  useImportFiscalNote,
  useLinkFiscalNote,
  usePreviewFiscalNote,
  useUnlinkFiscalNote,
} from './mutations'
import {
  useFiscalNoteById,
  useFiscalNotesList,
  useTransactionFiscalNote,
} from './queries'

vi.mock('@/shared/config/axios', () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
    delete: vi.fn(),
  },
}))

const mockFiscalNoteDetail: FiscalNoteDetail = {
  object: 'fiscal_note.item',
  id: 'fn-1',
  transactionId: 'tx-1',
  accessKey: '23261003539462000250651030000760541443208780',
  sourceUf: '23',
  number: '76054',
  series: '103',
  issuedAt: '2026-10-15T14:30:00.000Z',
  protocol: '123456789012345',
  issuerName: 'SUPERMERCADO EXEMPLO LTDA',
  issuerCnpj: '03539462000250',
  issuerAddress: 'Av. Bezerra de Menezes, 1000',
  grossAmountCents: 3500,
  discountAmountCents: 359,
  payableAmountCents: 3141,
  taxAmountCents: 420,
  changeAmountCents: null,
  xmlVersion: '4.00',
  xsltVersion: '2.00',
  parserVersion: '1.0.0',
  items: [],
  payments: [],
  createdAt: '2026-10-15T14:35:00.000Z',
  updatedAt: '2026-10-15T14:35:00.000Z',
}

const mockPreviewResponse: FiscalNotePreviewResponse = {
  object: 'fiscal_note.preview',
  alreadyImported: false,
  existingTransactionId: null,
  existingFiscalNoteId: null,
  cacheHit: false,
  suggestedTransaction: {
    type: 'EXPENSE',
    status: 'EFFECTIVE',
    amountCents: 3141,
    date: '2026-10-15',
    description: 'SUPERMERCADO EXEMPLO LTDA',
  },
  fiscalNote: {
    accessKey: mockFiscalNoteDetail.accessKey,
    sourceUf: '23',
    number: '76054',
    series: '103',
    issuedAt: '2026-10-15T14:30:00.000Z',
    issuedDate: '2026-10-15',
    protocol: '123456789012345',
    issuerName: 'SUPERMERCADO EXEMPLO LTDA',
    issuerCnpj: '03539462000250',
    issuerAddress: 'Av. Bezerra de Menezes, 1000',
    grossAmountCents: 3500,
    discountAmountCents: 359,
    payableAmountCents: 3141,
    taxAmountCents: 420,
    changeAmountCents: null,
    xmlVersion: '4.00',
    xsltVersion: '2.00',
    parserVersion: '1.0.0',
    items: [],
    payments: [],
  },
}

const mockImportResponse: FiscalNoteImportResponse = {
  object: 'fiscal_note.import',
  transaction: {
    id: 'tx-1',
    accountId: 'acc-1',
    destinationAccountId: null,
    categoryId: 'cat-1',
    type: 'EXPENSE',
    status: 'EFFECTIVE',
    amountCents: 3141,
    date: '2026-10-15',
    effectiveAt: '2026-10-15T14:35:00.000Z',
    description: 'SUPERMERCADO EXEMPLO LTDA',
    direction: 'DECREASE',
    hasFiscalNote: true,
    attachmentsCount: 0,
    createdAt: '2026-10-15T14:35:00.000Z',
    updatedAt: '2026-10-15T14:35:00.000Z',
  },
  fiscalNote: mockFiscalNoteDetail,
}

const mockFiscalNoteListResponse: FiscalNoteListResponse = {
  object: 'fiscal_note.list',
  data: [
    {
      object: 'fiscal_note.summary',
      id: 'fn-1',
      transactionId: 'tx-1',
      accessKey: mockFiscalNoteDetail.accessKey,
      sourceUf: '23',
      number: '76054',
      series: '103',
      issuedAt: '2026-10-15T14:30:00.000Z',
      issuerName: 'SUPERMERCADO EXEMPLO LTDA',
      issuerCnpj: '03539462000250',
      grossAmountCents: 3500,
      discountAmountCents: 359,
      payableAmountCents: 3141,
      taxAmountCents: 420,
      itemsCount: 8,
      createdAt: '2026-10-15T14:35:00.000Z',
      updatedAt: '2026-10-15T14:35:00.000Z',
    },
  ],
  meta: {
    total: 1,
    page: 1,
    limit: 20,
    totalPages: 1,
    hasNextPage: false,
    hasPreviousPage: false,
  },
  summary: {
    object: 'fiscal_note.summary_totals',
    totalNotes: 1,
    totalGrossAmountCents: 3500,
    totalDiscountAmountCents: 359,
    totalPayableAmountCents: 3141,
    totalTaxAmountCents: 420,
  },
}

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })

const createWrapper = (queryClient: QueryClient) => {
  return ({ children }: PropsWithChildren) =>
    createElement(QueryClientProvider, { client: queryClient }, children)
}

describe('fiscal-notes API client', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('envia preview, import, link, get e unlink para os endpoints corretos', async () => {
    vi.mocked(api.post)
      .mockResolvedValueOnce({ data: mockPreviewResponse })
      .mockResolvedValueOnce({ data: mockImportResponse })
      .mockResolvedValueOnce({ data: mockFiscalNoteDetail })
    vi.mocked(api.get).mockResolvedValueOnce({ data: mockFiscalNoteDetail })
    vi.mocked(api.delete).mockResolvedValueOnce({ data: undefined })

    const previewResult = await previewFiscalNote({
      input: mockFiscalNoteDetail.accessKey,
    })
    expect(api.post).toHaveBeenNthCalledWith(
      1,
      FISCAL_NOTES_API_ENDPOINTS.preview,
      { input: mockFiscalNoteDetail.accessKey }
    )
    expect(previewResult).toEqual(mockPreviewResponse)

    const importPayload: FiscalNoteImportRequest = {
      input: mockFiscalNoteDetail.accessKey,
      accountId: 'acc-1',
      categoryId: 'cat-1',
      amountCents: 3141,
      date: '2026-10-15',
      description: 'SUPERMERCADO EXEMPLO LTDA',
      status: 'EFFECTIVE',
    }
    const importResult = await importFiscalNote(importPayload)
    expect(api.post).toHaveBeenNthCalledWith(
      2,
      FISCAL_NOTES_API_ENDPOINTS.import,
      importPayload
    )
    expect(importResult).toEqual(mockImportResponse)

    const linkResult = await linkFiscalNote('tx-1', {
      input: mockFiscalNoteDetail.accessKey,
    })
    expect(api.post).toHaveBeenNthCalledWith(
      3,
      FISCAL_NOTES_API_ENDPOINTS.byTransaction('tx-1'),
      { input: mockFiscalNoteDetail.accessKey }
    )
    expect(linkResult).toEqual(mockFiscalNoteDetail)

    const getResult = await getTransactionFiscalNote('tx-1')
    expect(api.get).toHaveBeenCalledWith(
      FISCAL_NOTES_API_ENDPOINTS.byTransaction('tx-1')
    )
    expect(getResult).toEqual(mockFiscalNoteDetail)

    await unlinkTransactionFiscalNote('tx-1')
    expect(api.delete).toHaveBeenCalledWith(
      FISCAL_NOTES_API_ENDPOINTS.byTransaction('tx-1')
    )
  })

  it('envia listFiscalNotes omitindo parâmetros vazios e preservando 0, e busca getFiscalNoteById', async () => {
    vi.mocked(api.get)
      .mockResolvedValueOnce({ data: mockFiscalNoteListResponse })
      .mockResolvedValueOnce({ data: mockFiscalNoteDetail })

    const listResult = await listFiscalNotes({
      search: '   ',
      issuedFrom: '',
      issuedTo: undefined,
      issuerCnpj: '03539462000250',
      minAmountCents: 0,
      maxAmountCents: 5000,
      page: 1,
      limit: 20,
      sort: 'issuedAt:desc',
    })

    expect(api.get).toHaveBeenNthCalledWith(1, FISCAL_NOTES_API_ENDPOINTS.list, {
      params: {
        issuerCnpj: '03539462000250',
        minAmountCents: 0,
        maxAmountCents: 5000,
        page: 1,
        limit: 20,
        sort: 'issuedAt:desc',
      },
    })
    expect(listResult).toEqual(mockFiscalNoteListResponse)

    const byIdResult = await getFiscalNoteById('fn-1')
    expect(api.get).toHaveBeenNthCalledWith(
      2,
      FISCAL_NOTES_API_ENDPOINTS.byId('fn-1')
    )
    expect(byIdResult).toEqual(mockFiscalNoteDetail)
  })
})

describe('useFiscalNotesList e useFiscalNoteById', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('useFiscalNotesList consulta a listagem com query key filtrada e respeita enabled', async () => {
    const queryClient = createTestQueryClient()
    renderHook(() => useFiscalNotesList({ page: 1 }, { enabled: false }), {
      wrapper: createWrapper(queryClient),
    })
    expect(api.get).not.toHaveBeenCalled()

    vi.mocked(api.get).mockResolvedValueOnce({
      data: mockFiscalNoteListResponse,
    })
    const params = { page: 1, limit: 20, sort: 'issuedAt:desc' as const }
    const { result } = renderHook(() => useFiscalNotesList(params), {
      wrapper: createWrapper(queryClient),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(api.get).toHaveBeenCalledWith(FISCAL_NOTES_API_ENDPOINTS.list, {
      params,
    })
    expect(
      queryClient.getQueryData(FISCAL_NOTES_QUERY_KEYS.list(params))
    ).toEqual(mockFiscalNoteListResponse)
  })

  it('useFiscalNoteById busca por ID e não faz retry em 404 FISCAL_NOTE_NOT_FOUND', async () => {
    const queryClient = createTestQueryClient()
    renderHook(() => useFiscalNoteById(null), {
      wrapper: createWrapper(queryClient),
    })
    expect(api.get).not.toHaveBeenCalled()

    vi.mocked(api.get).mockResolvedValueOnce({ data: mockFiscalNoteDetail })
    const { result } = renderHook(() => useFiscalNoteById('fn-1'), {
      wrapper: createWrapper(queryClient),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(api.get).toHaveBeenCalledWith(FISCAL_NOTES_API_ENDPOINTS.byId('fn-1'))
    expect(
      queryClient.getQueryData(FISCAL_NOTES_QUERY_KEYS.detail('fn-1'))
    ).toEqual(mockFiscalNoteDetail)

    vi.clearAllMocks()
    vi.mocked(api.get).mockRejectedValue({
      isAxiosError: true,
      response: {
        status: 404,
        data: {
          statusCode: 404,
          code: API_ERROR_CODES.fiscalNoteNotFound,
          message: 'Fiscal note not found',
          path: '/fiscal-notes/fn-missing',
          timestamp: '2026-10-15T14:35:00.000Z',
          details: null,
        },
      },
    })

    const retryClient = new QueryClient()
    const { result: missingResult } = renderHook(
      () => useFiscalNoteById('fn-missing'),
      { wrapper: createWrapper(retryClient) }
    )

    await waitFor(() => expect(missingResult.current.isError).toBe(true))
    expect(api.get).toHaveBeenCalledTimes(1)
  })
})

describe('useTransactionFiscalNote', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('não busca quando transactionId é nulo ou enabled é false', () => {
    const queryClient = createTestQueryClient()

    renderHook(() => useTransactionFiscalNote(null), {
      wrapper: createWrapper(queryClient),
    })
    renderHook(() => useTransactionFiscalNote('tx-1', { enabled: false }), {
      wrapper: createWrapper(queryClient),
    })

    expect(api.get).not.toHaveBeenCalled()
  })

  it('busca a nota fiscal da transação quando habilitada', async () => {
    vi.mocked(api.get).mockResolvedValueOnce({ data: mockFiscalNoteDetail })
    const queryClient = createTestQueryClient()

    const { result } = renderHook(() => useTransactionFiscalNote('tx-1'), {
      wrapper: createWrapper(queryClient),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(api.get).toHaveBeenCalledWith(
      FISCAL_NOTES_API_ENDPOINTS.byTransaction('tx-1')
    )
    expect(result.current.data).toEqual(mockFiscalNoteDetail)
    expect(
      queryClient.getQueryData(FISCAL_NOTES_QUERY_KEYS.byTransaction('tx-1'))
    ).toEqual(mockFiscalNoteDetail)
  })

  it('não faz retry quando o backend responde 404 FISCAL_NOTE_NOT_FOUND', async () => {
    const notFoundError = {
      isAxiosError: true,
      response: {
        status: 404,
        data: {
          statusCode: 404,
          code: API_ERROR_CODES.fiscalNoteNotFound,
          message: 'Fiscal note not found',
          path: '/transactions/tx-1/fiscal-note',
          timestamp: '2026-10-15T14:35:00.000Z',
          details: null,
        },
      },
    }
    vi.mocked(api.get).mockRejectedValue(notFoundError)

    const queryClient = new QueryClient()
    const { result } = renderHook(() => useTransactionFiscalNote('tx-1'), {
      wrapper: createWrapper(queryClient),
    })

    await waitFor(() => expect(result.current.isError).toBe(true))
    expect(api.get).toHaveBeenCalledTimes(1)
  })
})

describe('fiscal-notes mutations', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('usePreviewFiscalNote executa POST /fiscal-notes/preview sem invalidar caches', async () => {
    vi.mocked(api.post).mockResolvedValueOnce({ data: mockPreviewResponse })
    const queryClient = createTestQueryClient()
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')

    const { result } = renderHook(() => usePreviewFiscalNote(), {
      wrapper: createWrapper(queryClient),
    })

    await act(async () => {
      await result.current.mutateAsync({ input: mockFiscalNoteDetail.accessKey })
    })

    expect(api.post).toHaveBeenCalledWith(FISCAL_NOTES_API_ENDPOINTS.preview, {
      input: mockFiscalNoteDetail.accessKey,
    })
    expect(invalidateSpy).not.toHaveBeenCalled()
  })

  it('useImportFiscalNote atualiza cache da nota e invalida transactions, accounts e dashboard', async () => {
    vi.mocked(api.post).mockResolvedValueOnce({ data: mockImportResponse })
    const queryClient = createTestQueryClient()
    const setQueryDataSpy = vi.spyOn(queryClient, 'setQueryData')
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')

    const { result } = renderHook(() => useImportFiscalNote(), {
      wrapper: createWrapper(queryClient),
    })

    const payload: FiscalNoteImportRequest = {
      input: mockFiscalNoteDetail.accessKey,
      accountId: 'acc-1',
      categoryId: 'cat-1',
      amountCents: 3141,
      date: '2026-10-15',
      description: 'SUPERMERCADO EXEMPLO LTDA',
      status: 'EFFECTIVE',
    }

    await act(async () => {
      await result.current.mutateAsync(payload)
    })

    expect(setQueryDataSpy).toHaveBeenCalledWith(
      FISCAL_NOTES_QUERY_KEYS.byTransaction('tx-1'),
      mockFiscalNoteDetail
    )
    expect(setQueryDataSpy).toHaveBeenCalledWith(
      FISCAL_NOTES_QUERY_KEYS.detail('fn-1'),
      mockFiscalNoteDetail
    )
    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: FISCAL_NOTES_QUERY_KEYS.lists(),
      exact: false,
    })
    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: FISCAL_NOTES_EXTERNAL_QUERY_KEY_PREFIXES.transactions,
      exact: false,
    })
    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: FISCAL_NOTES_EXTERNAL_QUERY_KEY_PREFIXES.accounts,
      exact: false,
    })
    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: FISCAL_NOTES_EXTERNAL_QUERY_KEY_PREFIXES.dashboard,
      exact: false,
    })
  })

  it('useLinkFiscalNote atualiza cache da nota e invalida transactions e detalhe', async () => {
    vi.mocked(api.post).mockResolvedValueOnce({ data: mockFiscalNoteDetail })
    const queryClient = createTestQueryClient()
    const setQueryDataSpy = vi.spyOn(queryClient, 'setQueryData')
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')

    const { result } = renderHook(() => useLinkFiscalNote(), {
      wrapper: createWrapper(queryClient),
    })

    await act(async () => {
      await result.current.mutateAsync({
        transactionId: 'tx-1',
        input: mockFiscalNoteDetail.accessKey,
      })
    })

    expect(api.post).toHaveBeenCalledWith(
      FISCAL_NOTES_API_ENDPOINTS.byTransaction('tx-1'),
      { input: mockFiscalNoteDetail.accessKey }
    )
    expect(setQueryDataSpy).toHaveBeenCalledWith(
      FISCAL_NOTES_QUERY_KEYS.byTransaction('tx-1'),
      mockFiscalNoteDetail
    )
    expect(setQueryDataSpy).toHaveBeenCalledWith(
      FISCAL_NOTES_QUERY_KEYS.detail('fn-1'),
      mockFiscalNoteDetail
    )
    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: FISCAL_NOTES_QUERY_KEYS.lists(),
      exact: false,
    })
    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: FISCAL_NOTES_EXTERNAL_QUERY_KEY_PREFIXES.transactions,
      exact: false,
    })
    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey:
        FISCAL_NOTES_EXTERNAL_QUERY_KEY_PREFIXES.transactionDetail('tx-1'),
    })
  })

  it('useUnlinkFiscalNote remove cache da nota e invalida lists, details, transactions e detalhe', async () => {
    vi.mocked(api.delete).mockResolvedValueOnce({ data: undefined })
    const queryClient = createTestQueryClient()
    queryClient.setQueryData(
      FISCAL_NOTES_QUERY_KEYS.byTransaction('tx-1'),
      mockFiscalNoteDetail
    )
    const removeQueriesSpy = vi.spyOn(queryClient, 'removeQueries')
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')

    const { result } = renderHook(() => useUnlinkFiscalNote(), {
      wrapper: createWrapper(queryClient),
    })

    await act(async () => {
      await result.current.mutateAsync('tx-1')
    })

    expect(api.delete).toHaveBeenCalledWith(
      FISCAL_NOTES_API_ENDPOINTS.byTransaction('tx-1')
    )
    expect(removeQueriesSpy).toHaveBeenCalledWith({
      queryKey: FISCAL_NOTES_QUERY_KEYS.byTransaction('tx-1'),
    })
    expect(
      queryClient.getQueryData(FISCAL_NOTES_QUERY_KEYS.byTransaction('tx-1'))
    ).toBeUndefined()
    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: FISCAL_NOTES_QUERY_KEYS.lists(),
      exact: false,
    })
    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: FISCAL_NOTES_QUERY_KEYS.details(),
      exact: false,
    })
    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: FISCAL_NOTES_EXTERNAL_QUERY_KEY_PREFIXES.transactions,
      exact: false,
    })
    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey:
        FISCAL_NOTES_EXTERNAL_QUERY_KEY_PREFIXES.transactionDetail('tx-1'),
    })
  })
})
