import { createRef, useState } from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { formatCurrencyFromCents } from '@/shared/utils/formatters'
import { CurrencyInput } from './CurrencyInput'

function CurrencyInputHarness({ initialValue }: { initialValue?: number }) {
  const [valueCents, setValueCents] = useState<number | undefined>(initialValue)

  return (
    <CurrencyInput
      aria-label="Valor"
      valueCents={valueCents}
      onValueCentsChange={setValueCents}
    />
  )
}

describe('CurrencyInput', () => {
  it('digita valores começando pelos centavos', async () => {
    const user = userEvent.setup()
    render(<CurrencyInputHarness />)
    const input = screen.getByRole('textbox', { name: 'Valor' })

    await user.click(input)
    await user.keyboard('1')
    expect(input).toHaveValue(formatCurrencyFromCents(1))

    await user.keyboard('2')
    expect(input).toHaveValue(formatCurrencyFromCents(12))

    await user.keyboard('3')
    expect(input).toHaveValue(formatCurrencyFromCents(123))
  })

  it('remove os centavos em ordem inversa com Backspace', async () => {
    const user = userEvent.setup()
    render(<CurrencyInputHarness initialValue={123} />)
    const input = screen.getByRole('textbox', { name: 'Valor' })

    await user.click(input)
    await user.keyboard('{Backspace}')
    expect(input).toHaveValue(formatCurrencyFromCents(12))

    await user.keyboard('{Backspace}')
    expect(input).toHaveValue(formatCurrencyFromCents(1))

    await user.keyboard('{Backspace}')
    expect(input).toHaveValue('')
  })

  it('formata zero e permite voltar ao estado vazio', async () => {
    const user = userEvent.setup()
    render(<CurrencyInputHarness initialValue={0} />)
    const input = screen.getByRole('textbox', { name: 'Valor' })

    expect(input).toHaveValue(formatCurrencyFromCents(0))
    await user.click(input)
    await user.keyboard('{Backspace}')
    expect(input).toHaveValue('')
  })

  it('interpreta paste formatado como inteiro em centavos', async () => {
    const user = userEvent.setup()
    render(<CurrencyInputHarness />)
    const input = screen.getByRole('textbox', { name: 'Valor' })

    await user.click(input)
    await user.paste('123,45')

    expect(input).toHaveValue(formatCurrencyFromCents(12345))
  })

  it('interpreta paste sem formatação e limpa paste sem dígitos', async () => {
    const user = userEvent.setup()
    render(<CurrencyInputHarness initialValue={99} />)
    const input = screen.getByRole('textbox', { name: 'Valor' })

    await user.click(input)
    await user.paste('12345')
    expect(input).toHaveValue(formatCurrencyFromCents(12345))

    await user.paste('sem valor')
    expect(input).toHaveValue('')
  })

  it('preserva o valor anterior ao ultrapassar o limite de inteiro seguro', async () => {
    const user = userEvent.setup()
    const safePrefix = Math.floor(Number.MAX_SAFE_INTEGER / 10)
    render(<CurrencyInputHarness initialValue={safePrefix} />)
    const input = screen.getByRole('textbox', { name: 'Valor' })

    await user.click(input)
    await user.keyboard('9')

    expect(input).toHaveValue(formatCurrencyFromCents(safePrefix))
  })

  it('respeita disabled, estado de erro e encaminha a ref', async () => {
    const user = userEvent.setup()
    const inputRef = createRef<HTMLInputElement>()
    const onValueCentsChange = vi.fn()

    render(
      <CurrencyInput
        ref={inputRef}
        aria-label="Valor"
        aria-invalid
        disabled
        valueCents={1}
        onValueCentsChange={onValueCentsChange}
      />
    )

    const input = screen.getByRole('textbox', { name: 'Valor' })
    expect(inputRef.current).toBe(input)
    expect(input).toBeDisabled()
    expect(input).toHaveAttribute('aria-invalid', 'true')

    await user.click(input)
    await user.keyboard('2')
    expect(onValueCentsChange).not.toHaveBeenCalled()
  })

  it('preserva um valor existente sem perda de precisão', () => {
    render(<CurrencyInputHarness initialValue={123456} />)

    expect(screen.getByRole('textbox', { name: 'Valor' })).toHaveValue(
      formatCurrencyFromCents(123456)
    )
  })
})
