import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest'
import type { Account, AccountTemplate } from '../../types/account.types'
import { AccountFormSheet } from './AccountFormSheet'

const mutationState = vi.hoisted(() => ({
  create: vi.fn(),
  update: vi.fn(),
  resetCreate: vi.fn(),
  resetUpdate: vi.fn(),
}))

const templateState = vi.hoisted(() => ({
  templates: [] as AccountTemplate[],
}))

vi.mock('../../api/mutations', () => ({
  useCreateAccount: () => ({
    mutate: mutationState.create,
    reset: mutationState.resetCreate,
    error: null,
    isPending: false,
  }),
  useUpdateAccount: () => ({
    mutate: mutationState.update,
    reset: mutationState.resetUpdate,
    error: null,
    isPending: false,
  }),
}))

vi.mock('../../api/queries', () => ({
  useAccountTemplates: () => ({
    data: templateState.templates,
    error: null,
    isError: false,
    isLoading: false,
    isFetching: false,
    refetch: vi.fn(),
  }),
}))

vi.mock('@/shared/hooks/use-mobile', () => ({ useIsMobile: () => true }))

const nubankTemplate: AccountTemplate = {
  object: 'account_template.item',
  id: '54066cca-075e-4300-923b-f5b36462aa1f',
  type: 'INSTITUTIONAL',
  name: 'Nubank',
  colorToken: 'nubank',
  iconKey: null,
  logoUrl: 'https://public.example/nubank.svg',
  bankCode: 260,
  ispb: '18236120',
}

const customAccount: Account = {
  object: 'account.item',
  id: 'account-id',
  name: 'Conta viagem',
  type: 'BANK',
  initialBalanceCents: 12345,
  templateId: 'custom-template-id',
  template: {
    object: 'account_template.item',
    id: 'custom-template-id',
    type: 'CUSTOM',
    name: 'Conta viagem',
    colorToken: 'blue',
    iconKey: 'wallet',
    logoUrl: null,
    bankCode: null,
    ispb: null,
  },
  color: 'blue',
  icon: 'wallet',
  includeInTotal: true,
  isArchived: false,
  isDefault: false,
  balance: { currentCents: 12345 },
  createdAt: '2026-08-29T12:00:00.000Z',
  updatedAt: '2026-08-29T12:00:00.000Z',
}

describe('AccountFormSheet create', () => {
  beforeAll(() => {
    vi.stubGlobal(
      'ResizeObserver',
      class ResizeObserverMock {
        observe() {}
        unobserve() {}
        disconnect() {}
      }
    )
  })

  afterAll(() => vi.unstubAllGlobals())

  beforeEach(() => {
    vi.clearAllMocks()
    templateState.templates = [nubankTemplate]
  })

  it('avança pelo template, preenche o nome e envia o branch institucional', async () => {
    const user = userEvent.setup()
    render(
      <AccountFormSheet state={{ mode: 'create' }} onOpenChange={vi.fn()} />
    )

    const dialog = screen.getByRole('dialog')
    expect(within(dialog).getByText('Escolha como criar')).toBeInTheDocument()

    await user.click(
      within(dialog).getByRole('button', { name: 'Criar conta com Nubank' })
    )

    expect(within(dialog).getByLabelText('Nome')).toHaveValue('Nubank')
    await waitFor(() =>
      expect(
        within(dialog).getByRole('button', { name: 'Criar conta' })
      ).toBeEnabled()
    )
    await user.click(
      within(dialog).getByRole('button', { name: 'Criar conta' })
    )

    expect(mutationState.create).toHaveBeenCalledWith(
      {
        name: 'Nubank',
        type: 'BANK',
        initialBalanceCents: undefined,
        template: {
          type: 'institutional',
          templateId: nubankTemplate.id,
        },
        includeInTotal: true,
        isDefault: false,
      },
      expect.objectContaining({
        onError: expect.any(Function),
        onSuccess: expect.any(Function),
      })
    )
  })

  it('cria uma conta personalizada com os defaults visuais', async () => {
    const user = userEvent.setup()
    render(
      <AccountFormSheet state={{ mode: 'create' }} onOpenChange={vi.fn()} />
    )

    const dialog = screen.getByRole('dialog')
    await user.click(
      within(dialog).getByRole('button', { name: 'Criar personalizada' })
    )
    await user.type(within(dialog).getByLabelText('Nome'), 'Conta viagem')

    await waitFor(() =>
      expect(
        within(dialog).getByRole('button', { name: 'Criar conta' })
      ).toBeEnabled()
    )
    await user.click(
      within(dialog).getByRole('button', { name: 'Criar conta' })
    )

    expect(mutationState.create).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Conta viagem',
        template: {
          type: 'custom',
          colorToken: 'blue',
          iconKey: 'landmark',
        },
      }),
      expect.any(Object)
    )
  })

  it('atualiza a identidade customizada pelo branch template', async () => {
    const user = userEvent.setup()
    render(
      <AccountFormSheet
        state={{ mode: 'edit', account: customAccount }}
        onOpenChange={vi.fn()}
      />
    )

    const dialog = screen.getByRole('dialog')
    expect(within(dialog).getByText('R$ 123,45')).toBeInTheDocument()
    await user.click(within(dialog).getByRole('button', { name: 'Roxo' }))
    await user.click(
      within(dialog).getByRole('button', { name: 'Salvar alterações' })
    )

    expect(mutationState.update).toHaveBeenCalledWith(
      {
        accountId: customAccount.id,
        dto: {
          template: {
            type: 'custom',
            colorToken: 'purple',
            iconKey: 'wallet',
          },
        },
      },
      expect.objectContaining({
        onError: expect.any(Function),
        onSuccess: expect.any(Function),
      })
    )
  })
})
