import { useEffect, useState } from 'react'
import type { ChangeEvent } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Check } from 'lucide-react'
import { Button } from '@/shared/lib/button'
import { Input } from '@/shared/lib/input'
import { cn } from '@/shared/lib/utils'
import { formatCurrency } from '@/shared/utils/formatters'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/shared/components/ui/sheet'
import {
  useCreateAccount,
  useUpdateAccount,
} from '../../api/mutations'
import {
  ACCOUNT_COLOR_OPTIONS,
  ACCOUNT_ICON_OPTIONS,
  USER_CREATABLE_ACCOUNT_TYPES,
} from '../../constants/account.constants'
import {
  type AccountFormValues,
  type CreateAccountFormValues,
  createAccountSchema,
  updateAccountSchema,
} from '../../schemas/account.schema'
import type {
  AccountType,
  CreateAccountDto,
  UpdateAccountDto,
  UserCreatableAccountType,
} from '../../types/account.types'
import type { AccountSheetState } from '../../types/account-ui.types'
import {
  getAccountColorOption,
  getAccountIconOption,
} from '../../utils/account.utils'
import { AccountFormField } from '../molecules/AccountFormField'

interface AccountFormSheetProps {
  state: AccountSheetState
  onOpenChange: (isOpen: boolean) => void
}

const accountInputClassName =
  'h-11 rounded-xl border-app-border bg-app-panel text-app-text placeholder:text-app-muted focus-visible:ring-brand focus-visible:ring-offset-app-panel'

export function AccountFormSheet({
  state,
  onOpenChange,
}: AccountFormSheetProps) {
  const createAccountMutation = useCreateAccount()
  const updateAccountMutation = useUpdateAccount()
  const isOpen = state !== null
  const isEditing = state?.mode === 'edit'
  const editingAccount = state?.mode === 'edit' ? state.account : null
  const isCashAccount = editingAccount?.type === 'CASH'
  const isPending =
    createAccountMutation.isPending || updateAccountMutation.isPending

  const form = useForm<AccountFormValues>({
    resolver: zodResolver(
      isEditing ? updateAccountSchema : createAccountSchema
    ),
    defaultValues: getAccountFormDefaults(state),
  })
  const [initialBalanceDisplay, setInitialBalanceDisplay] = useState('')

  useEffect(() => {
    if (!state) {
      return
    }

    const defaults = getAccountFormDefaults(state)
    form.reset(defaults)
    setInitialBalanceDisplay(
      'initialBalance' in defaults && defaults.initialBalance
        ? formatCurrency(defaults.initialBalance)
        : ''
    )
  }, [form, state])

  const selectedColor = form.watch('color')
  const selectedIcon = form.watch('icon')
  const selectedType = form.watch('type')

  const handleSubmit = form.handleSubmit((values) => {
    if (state?.mode === 'edit') {
      const dto: UpdateAccountDto = {
        name: values.name,
        color: values.color ?? null,
        icon: values.icon ?? null,
        includeInTotal: values.includeInTotal,
      }

      if (state.account.type !== 'CASH' && 'type' in values) {
        dto.type = values.type as AccountType
      }

      updateAccountMutation.mutate(
        { accountId: state.account.id, dto },
        { onSuccess: () => onOpenChange(false) }
      )
      return
    }

    const createValues = values as CreateAccountFormValues
    const dto: CreateAccountDto = {
      name: createValues.name,
      type: createValues.type,
      initialBalance: createValues.initialBalance ?? 0,
      color: createValues.color ?? null,
      icon: createValues.icon ?? null,
      includeInTotal: createValues.includeInTotal,
      isDefault: createValues.isDefault,
    }

    createAccountMutation.mutate(dto, { onSuccess: () => onOpenChange(false) })
  })

  const handleInitialBalanceChange = (event: ChangeEvent<HTMLInputElement>) => {
    const digits = event.currentTarget.value.replace(/\D/g, '')

    if (!digits) {
      setInitialBalanceDisplay('')
      form.setValue('initialBalance', undefined, {
        shouldDirty: true,
        shouldValidate: true,
      })
      return
    }

    const value = Number(digits) / 100
    setInitialBalanceDisplay(formatCurrency(value))
    form.setValue('initialBalance', value, {
      shouldDirty: true,
      shouldValidate: true,
    })
  }

  const selectType = (type: UserCreatableAccountType) => {
    form.setValue('type', type, {
      shouldDirty: true,
      shouldValidate: true,
    })
  }

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="w-full overflow-y-auto border-app-border bg-app-surface text-app-text sm:max-w-xl">
        <SheetHeader className="pr-8 text-left">
          <SheetTitle className="text-app-text">
            {isEditing ? 'Editar conta' : 'Nova conta'}
          </SheetTitle>
          <SheetDescription className="text-app-muted">
            {isEditing
              ? 'Atualize como esta conta aparece e se ela entra no saldo total.'
              : 'Cadastre uma origem para movimentações, saldos e relatórios.'}
          </SheetDescription>
        </SheetHeader>

        <form className="mt-6 space-y-5" onSubmit={handleSubmit} noValidate>
          <AccountFormField
            label="Nome"
            error={form.formState.errors.name?.message}
          >
            <Input
              className={accountInputClassName}
              placeholder="Ex.: Nubank, Reserva, Banco principal"
              {...form.register('name')}
            />
          </AccountFormField>

          <AccountFormField
            label="Tipo"
            error={form.formState.errors.type?.message}
          >
            {isCashAccount ? (
              <div className="rounded-2xl border border-app-border bg-app-panel p-4">
                <p className="text-sm font-semibold text-app-text">
                  Carteira
                </p>
                <p className="mt-1 text-xs leading-5 text-app-muted">
                  Você pode ajustar nome, cor e ícone dessa conta inicial.
                </p>
              </div>
            ) : (
              <div className="grid gap-2">
                {USER_CREATABLE_ACCOUNT_TYPES.map((type) => {
                  const isSelected = selectedType === type.value

                  return (
                    <button
                      key={type.value}
                      type="button"
                      className={cn(
                        'flex min-h-16 items-center justify-between gap-3 rounded-2xl border px-4 py-3 text-left transition focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-app-panel',
                        isSelected
                          ? 'border-brand bg-brand/15 text-app-text'
                          : 'border-app-border bg-app-panel text-app-muted hover:border-brand/60 hover:bg-app-elevated hover:text-app-text'
                      )}
                      aria-pressed={isSelected}
                      onClick={() => selectType(type.value)}
                    >
                      <span>
                        <span className="block text-sm font-semibold">
                          {type.label}
                        </span>
                        <span className="mt-1 block text-xs leading-5 text-app-muted">
                          {type.description}
                        </span>
                      </span>
                      <span
                        className={cn(
                          'inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full border',
                          isSelected
                            ? 'border-brand bg-brand text-brand-foreground'
                            : 'border-app-border bg-app-surface text-app-muted'
                        )}
                        aria-hidden
                      >
                        {isSelected ? <Check className="h-4 w-4" /> : null}
                      </span>
                    </button>
                  )
                })}
              </div>
            )}
          </AccountFormField>

          <input type="hidden" value={selectedType} {...form.register('type')} />

          {!isEditing ? (
            <AccountFormField
              label="Saldo inicial"
              error={
                'initialBalance' in form.formState.errors
                  ? form.formState.errors.initialBalance?.message
                  : undefined
              }
            >
              <Input
                className={cn(accountInputClassName, 'numeric text-base')}
                inputMode="decimal"
                placeholder="R$ 0,00"
                value={initialBalanceDisplay}
                onChange={handleInitialBalanceChange}
                aria-label="Saldo inicial"
              />
              <p className="text-xs leading-5 text-app-muted">
                Informe o valor que essa conta já tem hoje. Deixe em branco se
                quiser começar do zero.
              </p>
            </AccountFormField>
          ) : (
            <div className="rounded-2xl border border-app-border bg-app-panel p-4">
              <p className="text-xs font-medium uppercase text-app-muted">
                Saldo inicial
              </p>
              <p className="numeric mt-1 text-sm font-semibold text-app-text">
                {editingAccount
                  ? formatCurrency(editingAccount.initialBalance)
                  : '-'}
              </p>
              <p className="mt-1 text-xs leading-5 text-app-muted">
                Para corrigir esse valor depois, use o reajuste de saldo.
              </p>
            </div>
          )}

          <AccountFormField label="Cor">
            <div className="grid grid-cols-5 gap-2">
              {ACCOUNT_COLOR_OPTIONS.map((option) => {
                const isSelected = selectedColor === option.value

                return (
                  <button
                    key={option.value}
                    type="button"
                    className={cn(
                      'flex h-12 items-center justify-center rounded-2xl border transition focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-app-panel',
                      isSelected
                        ? 'border-brand bg-brand/15'
                        : 'border-app-border bg-app-panel hover:border-brand/60 hover:bg-app-elevated'
                    )}
                    onClick={() =>
                      form.setValue('color', option.value, {
                        shouldDirty: true,
                      })
                    }
                    aria-label={`Cor ${option.label}`}
                    aria-pressed={isSelected}
                    title={option.label}
                  >
                    <span
                      className={cn(
                        'inline-flex h-6 w-6 items-center justify-center rounded-full',
                        option.swatchClassName
                      )}
                      aria-hidden
                    >
                      {isSelected ? (
                        <Check className="h-3.5 w-3.5 text-brand-foreground" />
                      ) : null}
                    </span>
                  </button>
                )
              })}
            </div>
          </AccountFormField>

          <AccountFormField label="Ícone">
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {ACCOUNT_ICON_OPTIONS.map((option) => {
                const Icon = option.icon
                const isSelected = selectedIcon === option.value

                return (
                  <button
                    key={option.value}
                    type="button"
                    className={cn(
                      'flex min-h-11 items-center gap-2 rounded-2xl border px-3 py-2 text-left text-sm transition focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-app-panel',
                      isSelected
                        ? 'border-brand bg-brand/15 text-app-text'
                        : 'border-app-border bg-app-panel text-app-muted hover:border-brand/60 hover:bg-app-elevated hover:text-app-text'
                    )}
                    onClick={() =>
                      form.setValue('icon', option.value, { shouldDirty: true })
                    }
                    aria-pressed={isSelected}
                  >
                    <Icon className="h-4 w-4" />
                    {option.label}
                  </button>
                )
              })}
            </div>
          </AccountFormField>

          <div className="space-y-3">
            <label className="group flex min-h-20 items-center justify-between gap-4 rounded-2xl border border-app-border bg-app-panel p-4 transition hover:border-state-income/50 hover:bg-app-elevated has-[:checked]:border-state-income has-[:checked]:bg-state-income/10">
              <input
                type="checkbox"
                className="peer sr-only"
                {...form.register('includeInTotal')}
              />
              <span className="min-w-0">
                <span className="block text-sm font-medium text-app-text">
                  Incluir nos totais
                </span>
                <span className="block text-xs leading-5 text-app-muted">
                  Considere esta conta no saldo geral e nos relatórios.
                </span>
              </span>
              <span
                className="relative inline-flex h-7 w-12 shrink-0 rounded-full border border-app-border bg-app-surface transition after:absolute after:left-1 after:top-1 after:h-5 after:w-5 after:rounded-full after:bg-app-muted after:transition peer-checked:border-state-income peer-checked:bg-state-income peer-checked:after:translate-x-5 peer-checked:after:bg-app-text"
                aria-hidden
              />
            </label>

            {!isEditing ? (
              <label className="group flex min-h-20 items-center justify-between gap-4 rounded-2xl border border-app-border bg-app-panel p-4 transition hover:border-state-info/50 hover:bg-app-elevated has-[:checked]:border-state-info has-[:checked]:bg-state-info/10">
                <input
                  type="checkbox"
                  className="peer sr-only"
                  {...form.register('isDefault')}
                />
                <span className="min-w-0">
                  <span className="block text-sm font-medium text-app-text">
                    Tornar padrão
                  </span>
                  <span className="block text-xs leading-5 text-app-muted">
                    Use esta conta como primeira opção em novos lançamentos.
                  </span>
                </span>
                <span
                  className="relative inline-flex h-7 w-12 shrink-0 rounded-full border border-app-border bg-app-surface transition after:absolute after:left-1 after:top-1 after:h-5 after:w-5 after:rounded-full after:bg-app-muted after:transition peer-checked:border-state-info peer-checked:bg-state-info peer-checked:after:translate-x-5 peer-checked:after:bg-app-text"
                  aria-hidden
                />
              </label>
            ) : null}
          </div>

          <SheetFooter className="gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              className="h-10 rounded-xl border-app-border bg-app-panel text-app-text hover:bg-app-elevated hover:text-app-text"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="h-10 rounded-xl bg-brand px-4 text-brand-foreground hover:bg-brand-intense"
              disabled={isPending}
            >
              {isPending ? 'Salvando...' : 'Salvar conta'}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  )
}

const getAccountFormDefaults = (
  state: AccountSheetState
): AccountFormValues => {
  if (state?.mode === 'edit') {
    const colorOption = getAccountColorOption(state.account.color)
    const iconOption = getAccountIconOption(state.account.icon)

    return {
      name: state.account.name,
      type: state.account.type,
      color: colorOption.value,
      icon: iconOption?.value ?? 'wallet',
      includeInTotal: state.account.includeInTotal,
    }
  }

  return {
    name: '',
    type: 'BANK',
    initialBalance: undefined,
    color: ACCOUNT_COLOR_OPTIONS[0].value,
    icon: 'landmark',
    includeInTotal: true,
    isDefault: false,
  }
}
