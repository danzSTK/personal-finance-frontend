import type { PropsWithChildren } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { api } from '@/features/auth/api/auth.api'
import { useTransactionAttachments } from './attachment.queries'
import type { TransactionAttachment } from '../types/transaction-attachment.types'

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
    defaultOptions: { queries: { retry: false } },
  })

  return ({ children }: PropsWithChildren) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}

describe('attachment queries', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('fetches attachments for a transaction when enabled', async () => {
    const mockAttachments: TransactionAttachment[] = [
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
    ]

    vi.mocked(api.get).mockResolvedValueOnce({ data: mockAttachments })

    const { result } = renderHook(
      () => useTransactionAttachments('tx-1', { enabled: true }),
      { wrapper: createWrapper() }
    )

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(result.current.data).toEqual(mockAttachments)
    expect(api.get).toHaveBeenCalledWith('/transactions/tx-1/attachments')
  })

  it('does not fetch attachments when disabled', async () => {
    const { result } = renderHook(
      () => useTransactionAttachments('tx-1', { enabled: false }),
      { wrapper: createWrapper() }
    )

    expect(result.current.fetchStatus).toBe('idle')
    expect(api.get).not.toHaveBeenCalled()
  })
})
