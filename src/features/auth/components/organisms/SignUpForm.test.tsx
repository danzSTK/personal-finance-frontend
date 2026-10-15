import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { SignUpForm } from './SignUpForm'

const mutationState = vi.hoisted(() => ({
  mutate: vi.fn(),
}))

vi.mock('../../api/mutations', () => ({
  useSignUp: () => ({
    mutate: mutationState.mutate,
    isPending: false,
    error: null,
  }),
}))

describe('SignUpForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('exige confirmação idêntica e não a envia no DTO', async () => {
    const user = userEvent.setup()
    render(
      <MemoryRouter>
        <SignUpForm />
      </MemoryRouter>
    )

    await user.type(screen.getByLabelText(/Usuário/), 'danfy_user')
    await user.type(screen.getByLabelText(/Email/), 'user@danfy.test')
    await user.type(screen.getByLabelText(/^Senha/), 'secret1')
    await user.type(screen.getByLabelText(/Confirmar senha/), 'secret2')

    expect(screen.getByText('As senhas devem ser iguais')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Criar conta' })).toBeDisabled()

    await user.clear(screen.getByLabelText(/Confirmar senha/))
    await user.type(screen.getByLabelText(/Confirmar senha/), 'secret1')
    await user.click(screen.getByRole('button', { name: 'Criar conta' }))

    expect(mutationState.mutate).toHaveBeenCalledWith(
      {
        userName: 'danfy_user',
        email: 'user@danfy.test',
        password: 'secret1',
        firstName: undefined,
        lastName: undefined,
      },
      expect.objectContaining({ onSuccess: expect.any(Function) })
    )
  })
})
