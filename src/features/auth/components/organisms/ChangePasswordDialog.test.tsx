import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { AUTH_QUERY_KEYS, AUTH_ROUTES } from '../../constants/auth.constants'
import type { PasswordChangeAvailability } from '../../types'
import { ChangePasswordDialog } from './ChangePasswordDialog'

const mutationState = vi.hoisted(() => ({
  mutate: vi.fn(),
  reset: vi.fn(),
}))

const statusState = vi.hoisted(() => ({
  data: undefined as PasswordChangeAvailability | undefined,
  error: null as unknown,
  isPending: false,
  isFetching: false,
  refetch: vi.fn(),
}))

vi.mock('../../api/mutations', () => ({
  useChangePassword: () => ({
    mutate: mutationState.mutate,
    reset: mutationState.reset,
    error: null,
    isPending: false,
  }),
}))

vi.mock('../../api/queries', () => ({
  usePasswordChangeStatus: () => statusState,
}))

const renderDialog = () => {
  const queryClient = new QueryClient()
  queryClient.setQueryData(AUTH_QUERY_KEYS.user, { id: 'sensitive-user' })

  render(
    <MemoryRouter initialEntries={['/settings/security']}>
      <QueryClientProvider client={queryClient}>
        <Routes>
          <Route path="/settings/security" element={<ChangePasswordDialog />} />
          <Route
            path={AUTH_ROUTES.signInAlias}
            element={<p>Entre novamente</p>}
          />
        </Routes>
      </QueryClientProvider>
    </MemoryRouter>
  )

  return queryClient
}

const fillValidForm = async () => {
  const user = userEvent.setup()
  const dialog = screen.getByRole('dialog')

  await user.type(within(dialog).getByLabelText(/Senha atual/), 'secret1')
  await user.type(within(dialog).getByLabelText(/^Nova senha/), 'secret2')
  await user.type(
    within(dialog).getByLabelText(/Confirmar nova senha/),
    'secret2'
  )

  return { user, dialog }
}

describe('ChangePasswordDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    statusState.data = {
      status: true,
      retryAfterSeconds: null,
      retryAtMs: null,
    }
    statusState.error = null
    statusState.isPending = false
    statusState.isFetching = false
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('mantém o trigger desabilitado enquanto consulta a disponibilidade', () => {
    statusState.data = undefined
    statusState.isPending = true

    renderDialog()

    expect(screen.getByRole('button', { name: 'Alterar senha' })).toBeDisabled()
    expect(
      screen.getByText('Verificando a disponibilidade da alteração de senha...')
    ).toBeInTheDocument()
  })

  it('mantém o trigger bloqueado e mostra a data local do Retry-After', () => {
    statusState.data = {
      status: false,
      retryAfterSeconds: 527,
      retryAtMs: new Date('2026-08-13T12:08:47.000Z').getTime(),
    }

    renderDialog()

    expect(screen.getByRole('button', { name: 'Alterar senha' })).toBeDisabled()
    expect(
      screen.getByText('Alteração de senha temporariamente indisponível.')
    ).toBeInTheDocument()
    expect(
      screen.getByText(/Disponível novamente a partir de/)
    ).toBeInTheDocument()
  })

  it('mantém o trigger bloqueado e permite repetir a consulta após erro', async () => {
    const user = userEvent.setup()
    statusState.data = undefined
    statusState.error = new Error('network')

    renderDialog()

    expect(screen.getByRole('button', { name: 'Alterar senha' })).toBeDisabled()
    await user.click(screen.getByRole('button', { name: 'Tentar novamente' }))
    expect(statusState.refetch).toHaveBeenCalledTimes(1)
  })

  it('reconsulta o backend no deadline sem liberar pelo relógio local', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-08-13T12:00:00.000Z'))
    statusState.data = {
      status: false,
      retryAfterSeconds: 1,
      retryAtMs: new Date('2026-08-13T12:00:01.000Z').getTime(),
    }

    renderDialog()
    const trigger = screen.getByRole('button', { name: 'Alterar senha' })

    act(() => {
      vi.advanceTimersByTime(1_000)
    })

    expect(statusState.refetch).toHaveBeenCalledTimes(1)
    expect(trigger).toBeDisabled()
  })

  it('abre com foco inicial e limpa os valores ao cancelar', async () => {
    const user = userEvent.setup()
    renderDialog()

    const trigger = screen.getByRole('button', { name: 'Alterar senha' })
    await user.click(trigger)
    const dialog = screen.getByRole('dialog')
    const currentPassword = within(dialog).getByLabelText(/Senha atual/)

    expect(currentPassword).toHaveFocus()
    await user.type(currentPassword, 'secret1')
    await user.click(within(dialog).getByRole('button', { name: 'Cancelar' }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()

    await user.click(trigger)
    expect(
      within(screen.getByRole('dialog')).getByLabelText(/Senha atual/)
    ).toHaveValue('')
  })

  it('fecha com Escape e limpa os valores quando não há request', async () => {
    const user = userEvent.setup()
    renderDialog()

    const trigger = screen.getByRole('button', { name: 'Alterar senha' })
    await user.click(trigger)
    await user.type(
      within(screen.getByRole('dialog')).getByLabelText(/Senha atual/),
      'secret1'
    )
    await user.keyboard('{Escape}')

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(trigger).toHaveFocus()

    await user.click(trigger)
    expect(
      within(screen.getByRole('dialog')).getByLabelText(/Senha atual/)
    ).toHaveValue('')
  })

  it('envia somente as senhas e encerra o estado local no sucesso', async () => {
    mutationState.mutate.mockImplementation((_dto, options) => {
      options.onSuccess()
    })
    const queryClient = renderDialog()
    const user = userEvent.setup()

    await user.click(screen.getByRole('button', { name: 'Alterar senha' }))
    const filled = await fillValidForm()
    await filled.user.click(
      within(filled.dialog).getByRole('button', { name: 'Alterar senha' })
    )

    expect(mutationState.mutate).toHaveBeenCalledWith(
      { currentPassword: 'secret1', newPassword: 'secret2' },
      expect.objectContaining({
        onError: expect.any(Function),
        onSuccess: expect.any(Function),
      })
    )
    expect(queryClient.getQueryData(AUTH_QUERY_KEYS.user)).toBeUndefined()
    expect(screen.getByText('Entre novamente')).toBeInTheDocument()
  })

  it('preserva valores e bloqueia novo envio durante Retry-After', async () => {
    mutationState.mutate.mockImplementation((_dto, options) => {
      options.onError({
        isAxiosError: true,
        response: {
          status: 429,
          headers: { 'retry-after': '120' },
          data: {
            statusCode: 429,
            code: 'PASSWORD_CHANGE_BLOCKED',
            message: 'technical',
            path: '/auth/password/change',
            timestamp: '2026-08-12T12:00:00.000Z',
            details: null,
          },
        },
      })
    })
    renderDialog()
    const user = userEvent.setup()

    await user.click(screen.getByRole('button', { name: 'Alterar senha' }))
    const filled = await fillValidForm()
    const submit = within(filled.dialog).getByRole('button', {
      name: 'Alterar senha',
    })
    await filled.user.click(submit)

    expect(within(filled.dialog).getByLabelText(/Senha atual/)).toHaveValue(
      'secret1'
    )
    expect(within(filled.dialog).getByText('2 minutos')).toBeInTheDocument()
    expect(submit).toBeDisabled()
  })
})
