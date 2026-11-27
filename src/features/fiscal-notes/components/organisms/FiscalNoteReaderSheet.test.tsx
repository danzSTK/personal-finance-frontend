import type { PropsWithChildren } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AxiosError, AxiosHeaders } from 'axios'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useIsMobile } from '@/shared/hooks/use-mobile'
import * as fiscalNotesApi from '../../api/fiscal-notes.api'
import type {
  FiscalNoteDetail,
  FiscalNoteImportResponse,
  FiscalNotePreviewResponse,
} from '../../types/fiscal-note.types'
import { computeMod11CheckDigit } from '../../utils/fiscalNoteInput.utils'
import { FiscalNoteReaderSheet } from './FiscalNoteReaderSheet'

vi.mock('@/shared/hooks/use-mobile', () => ({
  useIsMobile: vi.fn(() => false),
}))

vi.mock('../../api/fiscal-notes.api', () => ({
  previewFiscalNote: vi.fn(),
  importFiscalNote: vi.fn(),
  linkFiscalNote: vi.fn(),
  getTransactionFiscalNote: vi.fn(),
  unlinkTransactionFiscalNote: vi.fn(),
}))

const makeAccessKey = (uf = '23', model = '65'): string => {
  const first43 = `${uf}261003539462000250${model}103000076054144320878`
  const checkDigit = computeMod11CheckDigit(first43)
  if (checkDigit === null) {
    throw new Error('Failed to build test key')
  }
  return `${first43}${checkDigit}`
}

const VALID_CE_ACCESS_KEY = makeAccessKey('23', '65')
const INVALID_UF_ACCESS_KEY = makeAccessKey('35', '65')
const INVALID_MODEL_ACCESS_KEY = makeAccessKey('23', '55')

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })

  return ({ children }: PropsWithChildren) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}

const mockAccounts = [
  {
    id: '11111111-1111-4111-8111-111111111111',
    name: 'Conta Corrente',
    isArchived: false,
    isDefault: true,
  },
]

const mockCategories = [
  {
    id: '22222222-2222-4222-8222-222222222222',
    displayName: 'Mercado',
    type: 'EXPENSE',
    isArchived: false,
  },
  {
    id: '33333333-3333-4333-8333-333333333333',
    displayName: 'Salário',
    type: 'INCOME',
    isArchived: false,
  },
]

const buildPreviewResponse = (
  overrides: Partial<FiscalNotePreviewResponse> = {}
): FiscalNotePreviewResponse => ({
  object: 'fiscal_note.preview',
  alreadyImported: false,
  existingTransactionId: null,
  existingFiscalNoteId: null,
  cacheHit: false,
  suggestedTransaction: {
    type: 'EXPENSE',
    status: 'EFFECTIVE',
    amountCents: 4090,
    date: '2026-10-25',
    description: 'SUPERMERCADO CENTRAL LTDA',
  },
  fiscalNote: {
    accessKey: VALID_CE_ACCESS_KEY,
    sourceUf: '23',
    number: '76054',
    series: '103',
    issuedAt: '2026-10-25T14:35:00.000Z',
    issuedDate: '2026-10-25',
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
        position: 1,
        rawDescription: 'Café Torrado 500g',
        storeCode: '00412',
        unit: 'UN',
        quantity: 2,
        unitPrice: 20.45,
        totalPriceCents: 4090,
      },
    ],
    payments: [
      {
        position: 1,
        methodLabel: '17',
        amountCents: 4090,
      },
    ],
  },
  ...overrides,
})

const buildFiscalNoteDetail = (): FiscalNoteDetail => ({
  object: 'fiscal_note.item',
  id: 'fn-100',
  transactionId: 'tx-999',
  accessKey: VALID_CE_ACCESS_KEY,
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
      rawDescription: 'Café Torrado 500g',
      storeCode: '00412',
      unit: 'UN',
      quantity: 2,
      unitPrice: 20.45,
      totalPriceCents: 4090,
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
})

const createAxiosApiError = (
  status: number,
  code: string,
  details?: Record<string, unknown>
) =>
  new AxiosError(
    code,
    undefined,
    undefined,
    undefined,
    {
      status,
      statusText: 'Error',
      headers: new AxiosHeaders(),
      config: { headers: new AxiosHeaders() },
      data: {
        statusCode: status,
        code,
        message: code,
        path: '/fiscal-notes/preview',
        timestamp: '2026-10-25T14:40:00.000Z',
        ...(details ? { details } : {}),
      },
    }
  )

describe('FiscalNoteReaderSheet', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(useIsMobile).mockReturnValue(false)
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
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      configurable: true,
      value: vi.fn().mockImplementation((query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    })
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('inicia na aba Manual no desktop e na aba Câmera no mobile', () => {
    const { rerender } = render(
      <FiscalNoteReaderSheet
        open
        mode="import"
        accounts={mockAccounts}
        categories={mockCategories}
        onOpenChange={vi.fn()}
      />,
      { wrapper: createWrapper() }
    )

    expect(screen.getByRole('tab', { name: 'Manual' })).toHaveAttribute(
      'aria-selected',
      'true'
    )
    expect(screen.getByRole('tab', { name: 'Câmera' })).toHaveAttribute(
      'aria-selected',
      'false'
    )

    vi.mocked(useIsMobile).mockReturnValue(true)

    rerender(
      <FiscalNoteReaderSheet
        open={false}
        mode="import"
        accounts={mockAccounts}
        categories={mockCategories}
        onOpenChange={vi.fn()}
      />
    )
    rerender(
      <FiscalNoteReaderSheet
        open
        mode="import"
        accounts={mockAccounts}
        categories={mockCategories}
        onOpenChange={vi.fn()}
      />
    )

    expect(screen.getByRole('tab', { name: 'Câmera' })).toHaveAttribute(
      'aria-selected',
      'true'
    )
  })

  it('bloqueia chamada de API na validação local quando UF ou modelo são inválidos', async () => {
    const user = userEvent.setup()

    render(
      <FiscalNoteReaderSheet
        open
        mode="import"
        accounts={mockAccounts}
        categories={mockCategories}
        onOpenChange={vi.fn()}
      />,
      { wrapper: createWrapper() }
    )

    const keyInput = screen.getByLabelText('URL do QR Code ou chave de acesso')
    await user.type(keyInput, INVALID_UF_ACCESS_KEY)
    await user.click(screen.getByRole('button', { name: 'Consultar nota' }))

    expect(await screen.findByRole('alert')).toHaveTextContent(/Ceará/i)
    expect(fiscalNotesApi.previewFiscalNote).not.toHaveBeenCalled()

    await user.click(
      screen.getByRole('button', { name: 'Limpar código da NFC-e' })
    )
    await user.type(keyInput, INVALID_MODEL_ACCESS_KEY)
    await user.click(screen.getByRole('button', { name: 'Consultar nota' }))

    expect(await screen.findByRole('alert')).toHaveTextContent(/modelo 65/i)
    expect(fiscalNotesApi.previewFiscalNote).not.toHaveBeenCalled()
  })

  it('executa fluxo manual → preview → importação com preenchimento sugerido, slot de anexos e onAfterImport', async () => {
    const user = userEvent.setup()
    const onOpenChange = vi.fn()
    const onAfterImport = vi.fn().mockResolvedValue(undefined)
    const previewResponse = buildPreviewResponse()
    const importResponse: FiscalNoteImportResponse = {
      object: 'fiscal_note.import',
      transaction: {
        id: 'tx-imported-1',
        accountId: mockAccounts[0].id,
        destinationAccountId: null,
        categoryId: mockCategories[0].id,
        type: 'EXPENSE',
        status: 'EFFECTIVE',
        amountCents: 4090,
        date: '2026-10-25',
        effectiveAt: '2026-10-25T14:35:00.000Z',
        description: 'SUPERMERCADO CENTRAL LTDA',
        direction: null,
        hasFiscalNote: true,
        attachmentsCount: 0,
        createdAt: '2026-10-25T14:40:00.000Z',
        updatedAt: '2026-10-25T14:40:00.000Z',
      },
      fiscalNote: buildFiscalNoteDetail(),
    }

    vi.mocked(fiscalNotesApi.previewFiscalNote).mockResolvedValueOnce(
      previewResponse
    )
    vi.mocked(fiscalNotesApi.importFiscalNote).mockResolvedValueOnce(
      importResponse
    )

    render(
      <FiscalNoteReaderSheet
        open
        mode="import"
        accounts={mockAccounts}
        categories={mockCategories}
        renderAttachmentsField={() => (
          <div data-testid="staged-attachments-slot">Anexos em staging</div>
        )}
        onAfterImport={onAfterImport}
        onOpenChange={onOpenChange}
      />,
      { wrapper: createWrapper() }
    )

    await user.type(
      screen.getByLabelText('URL do QR Code ou chave de acesso'),
      VALID_CE_ACCESS_KEY
    )
    await user.click(screen.getByRole('button', { name: 'Consultar nota' }))

    await waitFor(() => {
      expect(fiscalNotesApi.previewFiscalNote).toHaveBeenCalledWith(
        {
          input: VALID_CE_ACCESS_KEY,
        },
        expect.anything()
      )
    })

    expect(
      await screen.findByText('SUPERMERCADO CENTRAL LTDA')
    ).toBeInTheDocument()
    expect(screen.getByTestId('staged-attachments-slot')).toBeInTheDocument()
    expect(screen.getByLabelText('Valor')).toHaveValue('R$\u00a040,90')

    // Seleciona categoria de despesa (conta padrão já vem pré-selecionada)
    const categoryTrigger = screen.getByRole('combobox', { name: 'Categoria' })
    await user.click(categoryTrigger)
    await user.click(await screen.findByRole('option', { name: 'Mercado' }))

    await user.click(
      screen.getByRole('button', { name: 'Confirmar importação' })
    )

    await waitFor(() => {
      expect(fiscalNotesApi.importFiscalNote).toHaveBeenCalledWith(
        {
          input: VALID_CE_ACCESS_KEY,
          accountId: mockAccounts[0].id,
          categoryId: mockCategories[0].id,
          amountCents: 4090,
          date: '2026-10-25',
          description: 'SUPERMERCADO CENTRAL LTDA',
          status: 'EFFECTIVE',
        },
        expect.anything()
      )
      expect(onAfterImport).toHaveBeenCalledWith(importResponse)
      expect(onOpenChange).toHaveBeenCalledWith(false)
    })
  })

  it('exibe FiscalNoteDuplicateBanner quando alreadyImported=true, bloqueia envio e navega para despesa existente', async () => {
    const user = userEvent.setup()
    const onOpenExistingTransaction = vi.fn()

    vi.mocked(fiscalNotesApi.previewFiscalNote).mockResolvedValueOnce(
      buildPreviewResponse({
        alreadyImported: true,
        existingTransactionId: 'tx-existing-42',
        existingFiscalNoteId: 'fn-existing-42',
      })
    )

    render(
      <FiscalNoteReaderSheet
        open
        mode="import"
        accounts={mockAccounts}
        categories={mockCategories}
        onOpenExistingTransaction={onOpenExistingTransaction}
        onOpenChange={vi.fn()}
      />,
      { wrapper: createWrapper() }
    )

    await user.type(
      screen.getByLabelText('URL do QR Code ou chave de acesso'),
      VALID_CE_ACCESS_KEY
    )
    await user.click(screen.getByRole('button', { name: 'Consultar nota' }))

    expect(
      await screen.findByText('Esta NFC-e já foi importada')
    ).toBeInTheDocument()

    expect(
      screen.getByRole('button', { name: 'Confirmar importação' })
    ).toBeDisabled()

    await user.click(
      screen.getByRole('button', { name: 'Ver despesa existente' })
    )
    expect(onOpenExistingTransaction).toHaveBeenCalledWith('tx-existing-42')
  })

  it('exibe FiscalNoteDivergenceAlert no modo link quando valor ou data divergem e confirma vínculo', async () => {
    const user = userEvent.setup()
    const onLinked = vi.fn()
    const onOpenChange = vi.fn()
    const linkedDetail = buildFiscalNoteDetail()

    vi.mocked(fiscalNotesApi.previewFiscalNote).mockResolvedValueOnce(
      buildPreviewResponse()
    )
    vi.mocked(fiscalNotesApi.linkFiscalNote).mockResolvedValueOnce(linkedDetail)

    render(
      <FiscalNoteReaderSheet
        open
        mode="link"
        linkTarget={{
          id: 'tx-target-1',
          amountCents: 5000,
          date: '2026-10-20',
          description: 'Compras do mês',
        }}
        onLinked={onLinked}
        onOpenChange={onOpenChange}
      />,
      { wrapper: createWrapper() }
    )

    await user.type(
      screen.getByLabelText('URL do QR Code ou chave de acesso'),
      VALID_CE_ACCESS_KEY
    )
    await user.click(screen.getByRole('button', { name: 'Consultar nota' }))

    expect(
      await screen.findByText('Diferença entre a despesa e a NFC-e')
    ).toBeInTheDocument()
    expect(
      screen.getByText(
        'A despesa existente não será alterada ao vincular esta nota.'
      )
    ).toBeInTheDocument()
    expect(screen.getByText('20/10/2026')).toBeInTheDocument()
    expect(screen.getByText('25/10/2026')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Confirmar vínculo' }))

    await waitFor(() => {
      expect(fiscalNotesApi.linkFiscalNote).toHaveBeenCalledWith(
        'tx-target-1',
        { input: VALID_CE_ACCESS_KEY }
      )
      expect(onLinked).toHaveBeenCalledWith(linkedDetail)
      expect(onOpenChange).toHaveBeenCalledWith(false)
    })
  })

  it('exibe countdown de retry em erro 429 FISCAL_NOTE_RATE_LIMIT_EXCEEDED e reabilita ao expirar', async () => {
    vi.useFakeTimers()

    vi.mocked(fiscalNotesApi.previewFiscalNote).mockRejectedValueOnce(
      createAxiosApiError(429, 'FISCAL_NOTE_RATE_LIMIT_EXCEEDED', {
        retryAfterSeconds: 3,
      })
    )

    render(
      <FiscalNoteReaderSheet
        open
        mode="import"
        accounts={mockAccounts}
        categories={mockCategories}
        onOpenChange={vi.fn()}
      />,
      { wrapper: createWrapper() }
    )

    const keyInput = screen.getByLabelText('URL do QR Code ou chave de acesso')
    fireEvent.change(keyInput, { target: { value: VALID_CE_ACCESS_KEY } })

    fireEvent.click(screen.getByRole('button', { name: 'Consultar nota' }))

    await act(async () => {
      await vi.advanceTimersByTimeAsync(10)
    })

    expect(screen.getByText('Muitas consultas em sequência')).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Tente novamente em 3s' })
    ).toBeDisabled()

    await act(async () => {
      await vi.advanceTimersByTimeAsync(1000)
    })
    expect(
      screen.getByRole('button', { name: 'Tente novamente em 2s' })
    ).toBeDisabled()

    await act(async () => {
      await vi.advanceTimersByTimeAsync(2000)
    })
    expect(
      screen.getByRole('button', { name: 'Consultar nota' })
    ).toBeEnabled()
  })

  it('ao reabrir após fechar na etapa 2, inicia limpo na etapa 1', async () => {
    const user = userEvent.setup()

    vi.mocked(fiscalNotesApi.previewFiscalNote).mockResolvedValueOnce(
      buildPreviewResponse()
    )

    const { rerender } = render(
      <FiscalNoteReaderSheet
        open
        mode="link"
        linkTarget={{
          id: 'tx-target-reopen',
          amountCents: 4090,
          date: '2026-10-25',
          description: 'Compras',
        }}
        onOpenChange={vi.fn()}
      />,
      { wrapper: createWrapper() }
    )

    await user.type(
      screen.getByLabelText('URL do QR Code ou chave de acesso'),
      VALID_CE_ACCESS_KEY
    )
    await user.click(screen.getByRole('button', { name: 'Consultar nota' }))

    expect(
      await screen.findByText('Etapa 2 de 2 · Revisão')
    ).toBeInTheDocument()

    rerender(
      <FiscalNoteReaderSheet
        open={false}
        mode="link"
        linkTarget={{
          id: 'tx-target-reopen',
          amountCents: 4090,
          date: '2026-10-25',
          description: 'Compras',
        }}
        onOpenChange={vi.fn()}
      />
    )

    rerender(
      <FiscalNoteReaderSheet
        open
        mode="link"
        linkTarget={{
          id: 'tx-target-reopen',
          amountCents: 4090,
          date: '2026-10-25',
          description: 'Compras',
        }}
        onOpenChange={vi.fn()}
      />
    )

    expect(screen.getByText('Etapa 1 de 2 · Captura')).toBeInTheDocument()
    expect(
      screen.getByLabelText('URL do QR Code ou chave de acesso')
    ).toHaveValue('')
  })
})
