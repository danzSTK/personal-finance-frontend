import { createRef, useState } from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { formatCurrencyFromCents } from '@/shared/utils/formatters'
import { CurrencyInput } from './CurrencyInput'

function CurrencyInputHarness({
  initialValue,
  allowNegative = false,
}: {
  initialValue?: number
  allowNegative?: boolean
}) {
  const [valueCents, setValueCents] = useState<number | undefined>(initialValue)

  return (
    <CurrencyInput
      aria-label="Valor"
      allowNegative={allowNegative}
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

  it('ignora sinal negativo quando allowNegative é false', async () => {
    const user = userEvent.setup()
    render(<CurrencyInputHarness />)
    const input = screen.getByRole('textbox', { name: 'Valor' })

    await user.click(input)
    await user.keyboard('-123')

    expect(input).toHaveValue(formatCurrencyFromCents(123))
  })

  it('suporta digitação de -, + e dígitos negativos quando allowNegative é true', async () => {
    const user = userEvent.setup()
    render(<CurrencyInputHarness allowNegative />)
    const input = screen.getByRole('textbox', { name: 'Valor' })

    await user.click(input)
    await user.keyboard('-')
    expect(input).toHaveValue('-')

    await user.keyboard('150')
    expect(input).toHaveValue(formatCurrencyFromCents(-150))

    await user.keyboard('+')
    expect(input).toHaveValue(formatCurrencyFromCents(150))

    await user.keyboard('-')
    expect(input).toHaveValue(formatCurrencyFromCents(-150))
  })

  it('remove dígitos negativos com Backspace até limpar e evita -0', async () => {
    const user = userEvent.setup()
    const onValueCentsChange = vi.fn()
    render(
      <CurrencyInput
        aria-label="Valor"
        allowNegative
        valueCents={undefined}
        onValueCentsChange={onValueCentsChange}
      />
    )
    const input = screen.getByRole('textbox', { name: 'Valor' })

    await user.click(input)
    await user.keyboard('-0')
    expect(onValueCentsChange).toHaveBeenCalledWith(0)
    expect(Object.is(onValueCentsChange.mock.calls[0]?.[0], -0)).toBe(false)
  })

  it('preserva sinal negativo no Backspace e limpa ao apagar último dígito', async () => {
    const user = userEvent.setup()
    render(<CurrencyInputHarness allowNegative initialValue={-12} />)
    const input = screen.getByRole('textbox', { name: 'Valor' })

    expect(input).toHaveValue(formatCurrencyFromCents(-12))

    await user.click(input)
    await user.keyboard('{Backspace}')
    expect(input).toHaveValue(formatCurrencyFromCents(-1))

    await user.keyboard('{Backspace}')
    expect(input).toHaveValue('')
  })

  it('interpreta paste com sinal negativo quando allowNegative é true', async () => {
    const user = userEvent.setup()
    render(<CurrencyInputHarness allowNegative />)
    const input = screen.getByRole('textbox', { name: 'Valor' })

    await user.click(input)
    await user.paste('-R$ 150,00')
    expect(input).toHaveValue(formatCurrencyFromCents(-15000))

    await user.paste('-250,50')
    expect(input).toHaveValue(formatCurrencyFromCents(-25050))
  })
})
