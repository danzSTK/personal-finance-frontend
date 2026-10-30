import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { TransactionAttachmentBadge } from './TransactionAttachmentBadge'

describe('TransactionAttachmentBadge', () => {
  it('renders nothing when count is 0 or negative', () => {
    const { container: c0 } = render(<TransactionAttachmentBadge count={0} />)
    expect(c0).toBeEmptyDOMElement()

    const { container: cNeg } = render(<TransactionAttachmentBadge count={-1} />)
    expect(cNeg).toBeEmptyDOMElement()
  })

  it('renders singular text when count is 1', () => {
    render(<TransactionAttachmentBadge count={1} />)
    expect(screen.getByText('1 anexo')).toBeInTheDocument()
  })

  it('renders plural text when count is greater than 1', () => {
    render(<TransactionAttachmentBadge count={3} />)
    expect(screen.getByText('3 anexos')).toBeInTheDocument()
  })

  it('renders compact mode with numeric count and aria-label', () => {
    render(<TransactionAttachmentBadge count={2} compact />)
    expect(screen.getByLabelText('2 anexos')).toBeInTheDocument()
    expect(screen.getByText('2')).toBeInTheDocument()
  })
})
