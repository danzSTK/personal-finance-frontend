import type { PropsWithChildren } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import * as fiscalNotesApi from '../../api/fiscal-notes.api'
import type {
  FiscalNoteDetail,
  FiscalNoteListResponse,
  FiscalNoteSummaryItem,
} from '../../types/fiscal-note.types'
import { FiscalNotesPage } from './FiscalNotesPage'

vi.mock('@/shared/hooks/use-mobile', () => ({
  useIsMobile: () => false,
}))

vi.mock('../../api/fiscal-notes.api', () => ({
  listFiscalNotes: vi.fn(),
  getFiscalNoteById: vi.fn(),
  getTransactionFiscalNote: vi.fn(),
  unlinkTransactionFiscalNote: vi.fn(),
  previewFiscalNote: vi.fn(),
  importFiscalNote: vi.fn(),
  linkFiscalNote: vi.fn(),
}))

const sampleSummaryItem: FiscalNoteSummaryItem = {
  object: 'fiscal_note.summary',
  id: 'fn-1',
  transactionId: 'tx-1',
  accessKey: '23261003539462000250651030000760541443208785',
  sourceUf: '23',
  number: '76054',
  series: '103',
  issuedAt: '2026-10-25T14:35:00.000Z',
  issuerName: 'SUPERMERCADO CENTRAL LTDA',
  issuerCnpj: '03539462000250',
  grossAmountCents: 4590,
  discountAmountCents: 500,
  payableAmountCents: 4090,
  taxAmountCents: 612,
  itemsCount: 2,
  createdAt: '2026-10-25T14:40:00.000Z',
  updatedAt: '2026-10-25T14:40:00.000Z',
}

const sampleDetail: FiscalNoteDetail = {
  object: 'fiscal_note.item',
  id: 'fn-1',
  transactionId: 'tx-1',
  accessKey: '23261003539462000250651030000760541443208785',
  sourceUf: '23',
  number: '76054',
  series: '103',
  issuedAt: '2026-10-25T14:35:00.000Z',
  protocol: '223260000123456',
  issuerName: 'SUPERMERCADO CENTRAL LTDA',
  issuerCnpj: '03539462000250',
  issuerAddress: 'Av. Bezerra de Menezes, 1200',
  grossAmountCents: 4590,
  discountAmountCents: 500,
  payableAmountCents: 4090,
  taxAmountCents: 612,
  changeAmountCents: null,
  xmlVersion: '4.00',
  xsltVersion: null,
  parserVersion: '1.0.0',
  items: [
    {
      id: 'item-1',
      position: 1,
      rawDescription: 'Queijo Coalho 500g',
      storeCode: '00111',
      unit: 'UN',
      quantity: 1,
      unitPrice: 25.9,
      totalPriceCents: 2590,
    },
    {
      id: 'item-2',
      position: 2,
      rawDescription: 'Arroz Parboilizado 1kg',
      storeCode: '00222',
      unit: 'UN',
      quantity: 2,
      unitPrice: 10,
      totalPriceCents: 2000,
    },
  ],
  payments: [
    {
      id: 'pay-1',
      position: 1,
      methodLabel: '17',
      amountCents: 4090,
    },
  ],
  createdAt: '2026-10-25T14:40:00.000Z',
  updatedAt: '2026-10-25T14:40:00.000Z',
}

const buildListResponse = (
  overrides: Partial<FiscalNoteListResponse> = {}
): FiscalNoteListResponse => ({
  object: 'fiscal_note.list',
  data: [sampleSummaryItem],
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
    totalGrossAmountCents: 4590,
    totalDiscountAmountCents: 500,
    totalPayableAmountCents: 4090,
    totalTaxAmountCents: 612,
  },
  ...overrides,
})

function LocationProbe() {
  const location = useLocation()
  return <div data-testid="location-search">{location.search}</div>
}

const renderPage = ({
  initialEntries = ['/fiscal-notes'],
  onImportFiscalNote,
  onOpenTransaction,
}: {
  initialEntries?: string[]
  onImportFiscalNote?: () => void
  onOpenTransaction?: (transactionId: string) => void
} = {}) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false, retryDelay: 0 },
      mutations: { retry: false },
    },
  })

  function Wrapper({ children }: PropsWithChildren) {
    return (
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={initialEntries}>
          <Routes>
            <Route
              path="/fiscal-notes"
              element={
                <>
                  {children}
                  <LocationProbe />
                </>
              }
            />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>
    )
  }

  return render(
    <FiscalNotesPage
      onImportFiscalNote={onImportFiscalNote}
      onOpenTransaction={onOpenTransaction}
    />,
    { wrapper: Wrapper }
  )
}

describe('FiscalNotesPage', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    if (!HTMLElement.prototype.hasPointerCapture) {
      HTMLElement.prototype.hasPointerCapture = vi.fn(() => false)
    }
    if (!HTMLElement.prototype.setPointerCapture) {
      HTMLElement.prototype.setPointerCapture = vi.fn()
    }
    if (!HTMLElement.prototype.releasePointerCapture) {
      HTMLElement.prototype.releasePointerCapture = vi.fn()
    }
    if (!HTMLElement.prototype.scrollIntoView) {
      HTMLElement.prototype.scrollIntoView = vi.fn()
    }
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('renderiza KPIs do resumo, listagem de notas e aciona callback onImportFiscalNote', async () => {
    const user = userEvent.setup()
    const onImportFiscalNote = vi.fn()
    vi.mocked(fiscalNotesApi.listFiscalNotes).mockResolvedValue(
      buildListResponse()
    )

    renderPage({ onImportFiscalNote })

    const table = await screen.findByRole('table')
    expect(
      within(table).getByText('SUPERMERCADO CENTRAL LTDA')
    ).toBeInTheDocument()

    expect(
      screen.getByRole('heading', { name: 'Notas fiscais' })
    ).toBeInTheDocument()
    expect(
      screen.queryByText(/Consulte suas NFC-e importadas/i)
    ).not.toBeInTheDocument()

    const kpiSection = screen.getByRole('region', {
      name: 'Indicadores de notas fiscais',
    })
    const kpiTrack = within(kpiSection).getByTestId('fiscal-notes-kpi-track')
    expect(kpiTrack).toHaveClass('overflow-x-auto', 'snap-x', 'xl:grid-cols-4')

    expect(within(kpiSection).getByText('Total pago')).toBeInTheDocument()
    expect(within(kpiSection).getByText('R$ 40,90')).toBeInTheDocument()
    expect(within(kpiSection).getByText('Notas fiscais')).toBeInTheDocument()
    expect(within(kpiSection).getByText('1')).toBeInTheDocument()
    expect(within(kpiSection).getByText('Descontos')).toBeInTheDocument()
    expect(within(kpiSection).getByText('R$ 5,00')).toBeInTheDocument()
    expect(within(kpiSection).getByText('Tributos aprox.')).toBeInTheDocument()
    expect(within(kpiSection).getByText('R$ 6,12')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Ler NFC-e' }))
    expect(onImportFiscalNote).toHaveBeenCalledTimes(1)
  })

  it('atualiza parâmetros de busca na URL após debounce de 350ms e consulta listFiscalNotes', async () => {
    vi.mocked(fiscalNotesApi.listFiscalNotes).mockResolvedValue(
      buildListResponse()
    )

    renderPage()
    await screen.findByRole('table')

    vi.useFakeTimers()
    const searchInput = screen.getByRole('searchbox', {
      name: 'Buscar notas fiscais por loja ou item',
    })

    fireEvent.change(searchInput, { target: { value: 'queijo' } })
    expect(screen.getByTestId('location-search')).toHaveTextContent('')

    await act(async () => {
      await vi.advanceTimersByTimeAsync(350)
    })

    expect(screen.getByTestId('location-search')).toHaveTextContent('?q=queijo')

    vi.useRealTimers()
    await waitFor(() => {
      expect(fiscalNotesApi.listFiscalNotes).toHaveBeenLastCalledWith({
        page: 1,
        limit: 20,
        sort: 'issuedAt:desc',
        search: 'queijo',
      })
    })
  })

  it('altera ordenação resetando página para 1', async () => {
    const user = userEvent.setup()
    vi.mocked(fiscalNotesApi.listFiscalNotes).mockResolvedValue(
      buildListResponse()
    )

    renderPage({ initialEntries: ['/fiscal-notes?page=2'] })
    await screen.findByRole('table')

    const sortTrigger = screen.getByRole('combobox', {
      name: 'Ordenar notas fiscais',
    })
    await user.click(sortTrigger)
    await user.click(screen.getByRole('option', { name: 'Maior valor pago' }))

    await waitFor(() => {
      expect(fiscalNotesApi.listFiscalNotes).toHaveBeenLastCalledWith({
        page: 1,
        limit: 20,
        sort: 'payableAmountCents:desc',
      })
    })
    expect(screen.getByTestId('location-search')).toHaveTextContent(
      '?sort=payableAmountCents%3Adesc'
    )
  })

  it('exibe chips removíveis de filtros ativos e permite remover individualmente', async () => {
    const user = userEvent.setup()
    vi.mocked(fiscalNotesApi.listFiscalNotes).mockResolvedValue(
      buildListResponse()
    )

    renderPage({
      initialEntries: [
        '/fiscal-notes?issuedFrom=2026-10-01&issuedTo=2026-10-31&issuerCnpj=03539462000250&sourceUf=23',
      ],
    })

    await screen.findByRole('table')
    expect(
      screen.getByText('Período: 01/10/2026 até 31/10/2026')
    ).toBeInTheDocument()
    expect(
      screen.getByText('CNPJ: 03.539.462/0002-50')
    ).toBeInTheDocument()
    expect(screen.getByText('UF: Ceará (CE)')).toBeInTheDocument()

    await user.click(
      screen.getByRole('button', { name: 'Remover filtro de CNPJ' })
    )

    await waitFor(() => {
      expect(
        screen.queryByText('CNPJ: 03.539.462/0002-50')
      ).not.toBeInTheDocument()
    })
  })

  it('exibe estados vazios diferenciados sem filtros e com filtros ativos', async () => {
    const user = userEvent.setup()
    const onImportFiscalNote = vi.fn()
    vi.mocked(fiscalNotesApi.listFiscalNotes).mockResolvedValue(
      buildListResponse({
        data: [],
        meta: {
          total: 0,
          page: 1,
          limit: 20,
          totalPages: 1,
          hasNextPage: false,
          hasPreviousPage: false,
        },
        summary: {
          object: 'fiscal_note.summary_totals',
          totalNotes: 0,
          totalGrossAmountCents: 0,
          totalDiscountAmountCents: 0,
          totalPayableAmountCents: 0,
          totalTaxAmountCents: 0,
        },
      })
    )

    const { unmount } = renderPage({ onImportFiscalNote })

    expect(
      await screen.findByRole('heading', {
        name: 'Nenhuma NFC-e importada ainda',
      })
    ).toBeInTheDocument()
    await user.click(
      screen.getByRole('button', { name: 'Ler primeira NFC-e' })
    )
    expect(onImportFiscalNote).toHaveBeenCalledTimes(1)

    unmount()

    renderPage({ initialEntries: ['/fiscal-notes?q=inexistente'] })
    expect(
      await screen.findByRole('heading', {
        name: 'Nenhuma nota fiscal encontrada',
      })
    ).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Limpar filtros' }))
    expect(screen.getByTestId('location-search')).toHaveTextContent('')
  })

  it('exibe ApiErrorAlert quando a listagem falha e permite tentar novamente', async () => {
    const user = userEvent.setup()
    vi.mocked(fiscalNotesApi.listFiscalNotes)
      .mockRejectedValueOnce(new Error('Network error'))
      .mockRejectedValueOnce(new Error('Network error'))
      .mockRejectedValueOnce(new Error('Network error'))
      .mockResolvedValueOnce(buildListResponse())

    renderPage()

    const retryButton = await screen.findByRole('button', {
      name: 'Tentar novamente',
    })
    await user.click(retryButton)

    expect(await screen.findByRole('table')).toBeInTheDocument()
  })

  it('abre detalhe lazy via GET /fiscal-notes/:id e dispara onOpenTransaction', async () => {
    const user = userEvent.setup()
    const onOpenTransaction = vi.fn()
    vi.mocked(fiscalNotesApi.listFiscalNotes).mockResolvedValue(
      buildListResponse()
    )
    vi.mocked(fiscalNotesApi.getFiscalNoteById).mockResolvedValue(sampleDetail)

    renderPage({ onOpenTransaction })

    const table = await screen.findByRole('table')
    const firstRow = within(table).getAllByRole('row')[1]
    if (!firstRow) {
      throw new Error('Expected first note row')
    }

    await user.click(firstRow)

    await waitFor(() => {
      expect(fiscalNotesApi.getFiscalNoteById).toHaveBeenCalledWith('fn-1')
    })

    expect(
      await screen.findByText('Queijo Coalho 500g')
    ).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Ver despesa' }))
    expect(onOpenTransaction).toHaveBeenCalledWith('tx-1')
  })
})
