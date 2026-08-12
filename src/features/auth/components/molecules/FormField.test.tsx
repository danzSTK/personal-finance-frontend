import { createRef } from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { FormField } from './FormField'

describe('FormField de senha', () => {
  it('alterna a visibilidade sem alterar valor, ref ou nome acessível', async () => {
    const user = userEvent.setup()
    const inputRef = createRef<HTMLInputElement>()

    render(<FormField ref={inputRef} label="Senha" type="password" />)

    const input = screen.getByLabelText('Senha')
    const showButton = screen.getByRole('button', { name: 'Mostrar senha' })

    await user.type(input, 'secret1')
    expect(input).toHaveAttribute('type', 'password')
    expect(inputRef.current).toBe(input)

    await user.click(showButton)
    expect(input).toHaveAttribute('type', 'text')
    expect(input).toHaveValue('secret1')
    expect(
      screen.getByRole('button', { name: 'Ocultar senha' })
    ).toHaveAttribute('aria-pressed', 'true')

    await user.tab()
    await user.keyboard('{Enter}')
    expect(input).toHaveAttribute('type', 'password')
    expect(input).toHaveValue('secret1')
  })

  it('mantém o toggle indisponível quando o campo está desabilitado', () => {
    render(<FormField label="Senha" type="password" disabled />)

    expect(screen.getByLabelText('Senha')).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Mostrar senha' })).toBeDisabled()
  })

  it('não adiciona toggle a campos comuns', () => {
    render(<FormField label="Email" type="email" />)

    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })
})
