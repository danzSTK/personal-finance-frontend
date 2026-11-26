import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from './card'

describe('Card', () => {
  it('renderiza CardTitle como heading nível 3, CardDescription como <p> e CardAction com data-slot="card-action"', () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>Resumo financeiro</CardTitle>
          <CardDescription>Movimentações do período atual.</CardDescription>
          <CardAction>
            <button type="button">Detalhes</button>
          </CardAction>
        </CardHeader>
        <CardContent>Conteúdo</CardContent>
      </Card>
    )

    const title = screen.getByRole('heading', {
      level: 3,
      name: 'Resumo financeiro',
    })
    expect(title).toBeInTheDocument()
    expect(title).toHaveAttribute('data-slot', 'card-title')

    const description = screen.getByText('Movimentações do período atual.')
    expect(description.tagName).toBe('P')
    expect(description).toHaveAttribute('data-slot', 'card-description')

    const actionButton = screen.getByRole('button', { name: 'Detalhes' })
    const actionWrapper = actionButton.closest('[data-slot="card-action"]')
    expect(actionWrapper).not.toBeNull()
  })
})
