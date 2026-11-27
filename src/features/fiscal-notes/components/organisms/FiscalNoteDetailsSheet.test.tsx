import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { FiscalNoteDetail } from '../../types/fiscal-note.types'
import { FiscalNoteDetailsSheet } from './FiscalNoteDetailsSheet'

vi.mock('@/shared/hooks/use-mobile', () => ({
  useIsMobile: () => false,
}))

const SAMPLE_ACCESS_KEY = '23261003539462000250651030000760541443208785'

const mockFiscalNote: FiscalNoteDetail = {
  object: 'fiscal_note.item',
  id: 'fn-1',
  transactionId: 'tx-1',
  accessKey: SAMPLE_ACCESS_KEY,
  sourceUf: '23',
  number: '76054',
  series: '103',
  issuedAt: '2026-10-25T14:35:00.000Z',
  protocol: '223260000123456',
  issuerName: 'SUPERMERCADO CENTRAL LTDA',
  issuerCnpj: '03539462000250',
  issuerAddress: 'Av. Bezerra de Menezes, 1200, Fortaleza - CE',
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
      rawDescription: 'Café Torrado e Moído 500g',
      storeCode: '00412',
      unit: 'UN',
      quantity: 2,
      unitPrice: 12.95,
      totalPriceCents: 2590,
    },
    {
      id: 'item-2',
      position: 2,
      rawDescription: 'Açúcar Cristal 1kg',
      storeCode: '00988',
      unit: 'KG',
      quantity: 1.5,
      unitPrice: 4.5,
      totalPriceCents: 675,
    },
    {
      id: 'item-3',
      position: 3,
      rawDescription: 'Maçã Gala Nacional',
      storeCode: null,
      unit: 'KG',
      quantity: 0.85,
      unitPrice: 15.59,
      totalPriceCents: 1325,
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

describe('FiscalNoteDetailsSheet', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('exibe os itens da lista de compras, totais, pagamentos e metadados fiscais', () => {
    render(
      <FiscalNoteDetailsSheet
        open
        fiscalNote={mockFiscalNote}
        onOpenChange={vi.fn()}
        onRequestUnlink={vi.fn()}
      />
    )

    expect(
      screen.getByRole('heading', { name: 'SUPERMERCADO CENTRAL LTDA' })
    ).toBeInTheDocument()
    expect(screen.getByText('Lista de compras (3 itens)')).toBeInTheDocument()
    expect(screen.getByText('Café Torrado e Moído 500g')).toBeInTheDocument()
    expect(screen.getByText('Cód. 00412')).toBeInTheDocument()
    expect(screen.getByText('Açúcar Cristal 1kg')).toBeInTheDocument()
    expect(screen.getByText('Maçã Gala Nacional')).toBeInTheDocument()
    expect(screen.getByText('PIX')).toBeInTheDocument()
    expect(screen.getByText('03.539.462/0002-50')).toBeInTheDocument()
  })

  it('filtra itens por descrição sem diferenciar acentos e por código na loja, com empty state e limpar busca', async () => {
    const user = userEvent.setup()

    render(
      <FiscalNoteDetailsSheet
        open
        fiscalNote={mockFiscalNote}
        onOpenChange={vi.fn()}
        onRequestUnlink={vi.fn()}
      />
    )

    const searchInput = screen.getByRole('searchbox', {
      name: 'Buscar item na lista de compras',
    })

    // Busca sem acento deve encontrar item acentuado
    await user.type(searchInput, 'cafe')
    expect(screen.getByText('Mostrando 1 de 3 itens')).toBeInTheDocument()
    expect(screen.getByText('Café Torrado e Moído 500g')).toBeInTheDocument()
    expect(screen.queryByText('Açúcar Cristal 1kg')).not.toBeInTheDocument()

    // Busca por código na loja
    await user.clear(searchInput)
    await user.type(searchInput, '00988')
    expect(screen.getByText('Mostrando 1 de 3 itens')).toBeInTheDocument()
    expect(screen.getByText('Açúcar Cristal 1kg')).toBeInTheDocument()
    expect(
      screen.queryByText('Café Torrado e Moído 500g')
    ).not.toBeInTheDocument()

    // Estado vazio e botão Limpar busca
    await user.clear(searchInput)
    await user.type(searchInput, 'inexistente')
    expect(
      screen.getByText(/Nenhum item encontrado para/i)
    ).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Limpar busca' }))
    expect(screen.getByText('Café Torrado e Moído 500g')).toBeInTheDocument()
    expect(screen.getByText('Açúcar Cristal 1kg')).toBeInTheDocument()
    expect(screen.getByText('Maçã Gala Nacional')).toBeInTheDocument()
  })

  it('copia a chave de acesso para a área de transferência e dispara onRequestUnlink', async () => {
    const user = userEvent.setup()
    const writeText = vi.fn().mockResolvedValue(undefined)
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText },
      configurable: true,
    })

    const onRequestUnlink = vi.fn()

    render(
      <FiscalNoteDetailsSheet
        open
        fiscalNote={mockFiscalNote}
        onOpenChange={vi.fn()}
        onRequestUnlink={onRequestUnlink}
      />
    )

    await user.click(screen.getByRole('button', { name: 'Copiar chave' }))
    await waitFor(() => {
      expect(writeText).toHaveBeenCalledWith(SAMPLE_ACCESS_KEY)
    })
    expect(screen.getByText('Chave copiada')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Desvincular NFC-e' }))
    expect(onRequestUnlink).toHaveBeenCalledTimes(1)
  })
})
