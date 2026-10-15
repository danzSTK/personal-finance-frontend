import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { PendingEmailVerificationPanel } from './PendingEmailVerificationPanel'

describe('PendingEmailVerificationPanel', () => {
  it('renderiza o título, o email do usuário e a informação de reenvio protegido', () => {
    render(
      <PendingEmailVerificationPanel
        email="test@danfy.com"
        isResending={false}
        isLoggingOut={false}
        cooldownSeconds={null}
        resendQueued={false}
        error={null}
        onResend={vi.fn()}
        onLogout={vi.fn()}
      />
    )

    expect(
      screen.getByRole('heading', {
        name: 'Confirme sua identidade pelo email',
      })
    ).toBeInTheDocument()

    expect(screen.getByText('test@danfy.com')).toBeInTheDocument()
    expect(screen.getByText('Reenvio protegido')).toBeInTheDocument()
    expect(
      screen.getByText(
        'Você pode solicitar um novo email respeitando o intervalo de segurança e o limite diário.'
      )
    ).toBeInTheDocument()

    expect(
      screen.queryByText('Confira sua caixa de entrada')
    ).not.toBeInTheDocument()

    expect(
      screen.getByRole('button', { name: /reenviar email/i })
    ).toBeEnabled()
  })

  it('desabilita o botão de reenvio e exibe tempo de espera durante o cooldown', () => {
    const { rerender } = render(
      <PendingEmailVerificationPanel
        email="test@danfy.com"
        isResending={false}
        isLoggingOut={false}
        cooldownSeconds={90}
        resendQueued={false}
        error={null}
        onResend={vi.fn()}
        onLogout={vi.fn()}
      />
    )

    const resendButton = screen.getByRole('button', {
      name: /aguarde 2 min/i,
    })
    expect(resendButton).toBeDisabled()

    rerender(
      <PendingEmailVerificationPanel
        email="test@danfy.com"
        isResending={false}
        isLoggingOut={false}
        cooldownSeconds={45}
        resendQueued={false}
        error={null}
        onResend={vi.fn()}
        onLogout={vi.fn()}
      />
    )

    expect(
      screen.getByRole('button', {
        name: /aguarde 45s/i,
      })
    ).toBeDisabled()
  })

  it('dispara onResend e onLogout ao clicar nos botões', async () => {
    const user = userEvent.setup()
    const handleResend = vi.fn()
    const handleLogout = vi.fn()

    render(
      <PendingEmailVerificationPanel
        email="test@danfy.com"
        isResending={false}
        isLoggingOut={false}
        cooldownSeconds={null}
        resendQueued={false}
        error={null}
        onResend={handleResend}
        onLogout={handleLogout}
      />
    )

    await user.click(screen.getByRole('button', { name: /reenviar email/i }))
    expect(handleResend).toHaveBeenCalledTimes(1)

    await user.click(screen.getByRole('button', { name: /sair da conta/i }))
    expect(handleLogout).toHaveBeenCalledTimes(1)
  })

  it('exibe estado de fila quando resendQueued for true', () => {
    render(
      <PendingEmailVerificationPanel
        email="test@danfy.com"
        isResending={false}
        isLoggingOut={false}
        cooldownSeconds={null}
        resendQueued={true}
        error={null}
        onResend={vi.fn()}
        onLogout={vi.fn()}
      />
    )

    expect(screen.getByText('Novo email enfileirado')).toBeInTheDocument()
  })
})
