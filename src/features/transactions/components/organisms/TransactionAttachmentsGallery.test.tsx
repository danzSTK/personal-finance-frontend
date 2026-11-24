import type { PropsWithChildren } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { api } from '@/features/auth/api/auth.api'
import type { Transaction } from '../../types/transaction.types'
import { TransactionAttachmentsGallery } from './TransactionAttachmentsGallery'

vi.mock('@/features/auth/api/auth.api', () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
    delete: vi.fn(),
    patch: vi.fn(),
  },
}))

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

const mockExpenseTransaction: Transaction = {
  id: 'tx-123',
  accountId: 'acc-1',
  destinationAccountId: null,
  categoryId: 'cat-1',
  type: 'EXPENSE',
  status: 'EFFECTIVE',
  amountCents: 5000,
  date: '2026-10-30',
  effectiveAt: '2026-10-30T10:00:00.000Z',
  description: 'Almoço Executivo',
  direction: null,
  attachmentsCount: 1,
  createdAt: '2026-10-30T10:00:00.000Z',
  updatedAt: '2026-10-30T10:00:00.000Z',
}

const mockTransferTransaction: Transaction = {
  ...mockExpenseTransaction,
  type: 'TRANSFER',
  destinationAccountId: 'acc-2',
}

describe('TransactionAttachmentsGallery', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders informative message when transaction type is TRANSFER', () => {
    render(<TransactionAttachmentsGallery transaction={mockTransferTransaction} />, {
      wrapper: createWrapper(),
    })

    expect(
      screen.getByText('Comprovantes só estão disponíveis para receitas e despesas.')
    ).toBeInTheDocument()
  })

  it('renders attachments and upload card when count is less than 3', async () => {
    vi.mocked(api.get).mockResolvedValueOnce({
      data: [
        {
          id: 'att-1',
          assetId: 'asset-1',
          position: 0,
          contentType: 'image/png',
          sizeBytes: 1024,
          url: 'https://storage.danfy.test/image1.png',
          expiresAt: '2026-10-30T15:00:00.000Z',
          cacheMaxAgeSeconds: 240,
        },
      ],
    })

    render(<TransactionAttachmentsGallery transaction={mockExpenseTransaction} />, {
      wrapper: createWrapper(),
    })

    expect(await screen.findByAltText('Comprovante 1')).toBeInTheDocument()
    expect(screen.getByText('2 vagas restantes')).toBeInTheDocument()
    expect(screen.getByText('Adicionar')).toBeInTheDocument()
  })

  it('does not render upload card when there are already 3 attachments', async () => {
    vi.mocked(api.get).mockResolvedValueOnce({
      data: [
        {
          id: 'att-1',
          assetId: 'asset-1',
          position: 0,
          contentType: 'image/png',
          sizeBytes: 1024,
          url: 'https://storage.danfy.test/image1.png',
          expiresAt: '2026-10-30T15:00:00.000Z',
          cacheMaxAgeSeconds: 240,
        },
        {
          id: 'att-2',
          assetId: 'asset-2',
          position: 1,
          contentType: 'image/jpeg',
          sizeBytes: 2048,
          url: 'https://storage.danfy.test/image2.jpg',
          expiresAt: '2026-10-30T15:00:00.000Z',
          cacheMaxAgeSeconds: 240,
        },
        {
          id: 'att-3',
          assetId: 'asset-3',
          position: 2,
          contentType: 'image/webp',
          sizeBytes: 4096,
          url: 'https://storage.danfy.test/image3.webp',
          expiresAt: '2026-10-30T15:00:00.000Z',
          cacheMaxAgeSeconds: 240,
        },
      ],
    })

    render(<TransactionAttachmentsGallery transaction={mockExpenseTransaction} />, {
      wrapper: createWrapper(),
    })

    expect(await screen.findByAltText('Comprovante 1')).toBeInTheDocument()
    expect(screen.getByAltText('Comprovante 2')).toBeInTheDocument()
    expect(screen.getByAltText('Comprovante 3')).toBeInTheDocument()
    expect(screen.queryByText('Adicionar')).not.toBeInTheDocument()
  })
})
