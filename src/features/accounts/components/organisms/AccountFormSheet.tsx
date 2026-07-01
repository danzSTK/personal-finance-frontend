import { useEffect, useMemo, useState } from 'react'
import type { ChangeEvent } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Check, Ellipsis } from 'lucide-react'
import { useCategoryMetadata } from '@/features/categories/api/queries'
import { Button } from '@/shared/lib/button'
import { Input } from '@/shared/lib/input'
import { cn } from '@/shared/lib/utils'
import {
  centsToCurrencyInput,
  currencyInputToCents,
  formatCurrencyFromCents,
} from '@/shared/utils/formatters'
import { ApiErrorAlert } from '@/shared/components/molecules/ApiErrorAlert'
import { applyApiFieldErrors, resolveApiError } from '@/shared/errors'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/shared/components/ui/sheet'
import { useCreateAccount, useUpdateAccount } from '../../api/mutations'
import {
  ACCOUNT_COLOR_OPTIONS,
  mergeAccountColorMetadata,
  mergeAccountIconMetadata,
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
  'h-11 rounded-xl border-border bg-secondary text-foreground placeholder:text-muted-foreground focus-visible:ring-ring focus-visible:ring-offset-secondary'

const VISIBLE_METADATA_OPTIONS = 5

export function AccountFormSheet({
  state,
  onOpenChange,
}: AccountFormSheetProps) {
  const createAccountMutation = useCreateAccount()
  const updateAccountMutation = useUpdateAccount()
  const { data: visualMetadata } = useCategoryMetadata()
  const isOpen = state !== null
  const isEditing = state?.mode === 'edit'
  const editingAccount = state?.mode === 'edit' ? state.account : null
  const isCashAccount = editingAccount?.type === 'CASH'
  const isPending =
    createAccountMutation.isPending || updateAccountMutation.isPending
  const mutationError = isEditing
    ? updateAccountMutation.error
    : createAccountMutation.error
  const errorPresentation = useMemo(
    () =>
      mutationError
        ? resolveApiError(
            mutationError,
            isEditing ? 'accounts.update' : 'accounts.create'
          )
        : null,
    [isEditing, mutationError]
  )

  const form = useForm<AccountFormValues>({
    resolver: zodResolver(
      isEditing ? updateAccountSchema : createAccountSchema
    ),
    defaultValues: getAccountFormDefaults(state),
  })
  const resetAccountForm = form.reset
  const resetCreateAccount = createAccountMutation.reset
  const resetUpdateAccount = updateAccountMutation.reset
  const [initialBalanceDisplay, setInitialBalanceDisplay] = useState('')

  useEffect(() => {
    if (!state) {
      return
    }

    const defaults = getAccountFormDefaults(state)
    resetCreateAccount()
    resetUpdateAccount()
    resetAccountForm(defaults)
    setInitialBalanceDisplay(
      'initialBalanceCents' in defaults && defaults.initialBalanceCents
        ? centsToCurrencyInput(defaults.initialBalanceCents)
        : ''
    )
  }, [resetAccountForm, resetCreateAccount, resetUpdateAccount, state])

  useEffect(() => {
    if (!errorPresentation) return

    applyApiFieldErrors<AccountFormValues>({
      fieldErrors: errorPresentation.fieldErrors,
      fieldMap: {
        name: 'name',
        type: 'type',
        initialBalanceCents: 'initialBalanceCents',
        color: 'color',
        icon: 'icon',
        includeInTotal: 'includeInTotal',
        isDefault: 'isDefault',
      },
      setError: form.setError,
      setFocus: form.setFocus,
    })
  }, [errorPresentation, form.setError, form.setFocus])

  const selectedColor = form.watch('color')
  const selectedIcon = form.watch('icon')
  const selectedType = form.watch('type')
  const colorOptions = mergeAccountColorMetadata(visualMetadata?.colors)
  const iconOptions = mergeAccountIconMetadata(visualMetadata?.icons)
  const visibleColorOptions = colorOptions.slice(0, VISIBLE_METADATA_OPTIONS)
  const overflowColorOptions = colorOptions.slice(VISIBLE_METADATA_OPTIONS)
  const visibleIconOptions = iconOptions.slice(0, VISIBLE_METADATA_OPTIONS)
  const overflowIconOptions = iconOptions.slice(VISIBLE_METADATA_OPTIONS)
  const isSelectedColorInOverflow = overflowColorOptions.some(
    (option) => option.value === selectedColor
  )
  const isSelectedIconInOverflow = overflowIconOptions.some(
    (option) => option.value === selectedIcon
  )

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
      type: 'BANK',
      initialBalanceCents: createValues.initialBalanceCents ?? 0,
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
      form.setValue('initialBalanceCents', undefined, {
        shouldDirty: true,
        shouldValidate: true,
      })
      return
    }

    const value = currencyInputToCents(event.currentTarget.value) ?? 0
    setInitialBalanceDisplay(formatCurrencyFromCents(value))
    form.setValue('initialBalanceCents', value, {
      shouldDirty: true,
      shouldValidate: true,
    })
  }

  const setColor = (value: string) =>
    form.setValue('color', value, {
      shouldDirty: true,
      shouldValidate: true,
    })

  const setIcon = (value: string) =>
    form.setValue('icon', value, {
      shouldDirty: true,
      shouldValidate: true,
    })

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="w-full overflow-y-auto border-border bg-card text-foreground sm:max-w-xl">
        <SheetHeader className="pr-8 text-left">
          <SheetTitle className="text-foreground">
            {isEditing ? 'Editar conta' : 'Nova conta'}
          </SheetTitle>
          <SheetDescription className="text-muted-foreground">
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
              <div className="rounded-2xl border border-border bg-secondary p-4">
                <p className="text-sm font-semibold text-foreground">Carteira</p>
                <p className="mt-1 text-xs leading-5 text-muted-foreground">
                  Você pode ajustar nome, cor e ícone dessa conta inicial.
                </p>
              </div>
            ) : (
              <div className="rounded-2xl border border-border bg-secondary p-4">
                <p className="text-sm font-semibold text-foreground">
                  Conta bancária
                </p>
                <p className="mt-1 text-xs leading-5 text-muted-foreground">
                  Use para conta corrente, poupança ou conta digital.
                </p>
              </div>
            )}
          </AccountFormField>

          <input
            type="hidden"
            value={selectedType}
            {...form.register('type')}
          />

          {!isEditing ? (
            <AccountFormField
              label="Saldo inicial"
              error={
                'initialBalanceCents' in form.formState.errors
                  ? form.formState.errors.initialBalanceCents?.message
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
              <p className="text-xs leading-5 text-muted-foreground">
                Informe o valor que essa conta já tem hoje. Deixe em branco se
                quiser começar do zero.
              </p>
            </AccountFormField>
          ) : (
            <div className="rounded-2xl border border-border bg-secondary p-4">
              <p className="text-xs font-medium uppercase text-muted-foreground">
                Saldo inicial
              </p>
              <p className="numeric mt-1 text-sm font-semibold text-foreground">
                {editingAccount
                  ? formatCurrencyFromCents(editingAccount.initialBalanceCents)
                  : '-'}
              </p>
              <p className="mt-1 text-xs leading-5 text-muted-foreground">
                Para corrigir esse valor depois, use o reajuste de saldo.
              </p>
            </div>
          )}

          <AccountFormField label="Cor">
            <div className="grid grid-cols-6 gap-2">
              {visibleColorOptions.map((option) => {
                const isSelected = selectedColor === option.value

                return (
                  <button
                    key={option.value}
                    type="button"
                    className={cn(
                      'flex h-12 items-center justify-center rounded-2xl border transition focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-secondary',
                      isSelected
                        ? 'border-primary bg-primary/15'
                        : 'border-border bg-secondary hover:border-primary/60 hover:bg-accent'
                    )}
                    onClick={() => setColor(option.value)}
                    aria-label={`Cor ${option.label}`}
                    aria-pressed={isSelected}
                    title={option.label}
                  >
                    <span
                      className="inline-flex h-6 w-6 items-center justify-center rounded-full"
                      style={{ backgroundColor: option.hex }}
                      aria-hidden
                    >
                      {isSelected ? (
                        <Check className="h-3.5 w-3.5 text-foreground" />
                      ) : null}
                    </span>
                  </button>
                )
              })}

              {overflowColorOptions.length > 0 ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className={cn(
                        'h-12 w-full rounded-2xl border-border bg-secondary text-muted-foreground hover:border-primary/60 hover:bg-accent hover:text-foreground',
                        isSelectedColorInOverflow &&
                          'border-primary bg-primary/15 text-foreground'
                      )}
                      aria-label="Mais cores"
                      title="Mais cores"
                    >
                      <Ellipsis className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    className="w-64 rounded-2xl border-border bg-card p-2 text-foreground"
                  >
                    <DropdownMenuLabel className="text-xs text-muted-foreground">
                      Outras cores
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator className="bg-border" />
                    <div className="grid grid-cols-2 gap-1">
                      {overflowColorOptions.map((option) => {
                        const isSelected = selectedColor === option.value

                        return (
                          <DropdownMenuItem
                            key={option.value}
                            className="rounded-xl focus:bg-accent focus:text-foreground"
                            onSelect={() => setColor(option.value)}
                            title={option.label}
                          >
                            <span
                              className="h-4 w-4 rounded-full"
                              style={{ backgroundColor: option.hex }}
                              aria-hidden
                            />
                            <span className="min-w-0 truncate">
                              {option.label}
                            </span>
                            {isSelected ? (
                              <Check className="ml-auto h-3.5 w-3.5" />
                            ) : null}
                          </DropdownMenuItem>
                        )
                      })}
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : null}
            </div>
          </AccountFormField>

          <AccountFormField label="Ícone">
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {visibleIconOptions.map((option) => {
                const Icon = option.icon
                const isSelected = selectedIcon === option.value

                return (
                  <button
                    key={option.value}
                    type="button"
                    className={cn(
                      'flex min-h-11 items-center gap-2 rounded-2xl border px-3 py-2 text-left text-sm transition focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-secondary',
                      isSelected
                        ? 'border-primary bg-primary/15 text-foreground'
                        : 'border-border bg-secondary text-muted-foreground hover:border-primary/60 hover:bg-accent hover:text-foreground'
                    )}
                    onClick={() => setIcon(option.value)}
                    aria-pressed={isSelected}
                    title={option.label}
                  >
                    <Icon className="h-4 w-4" />
                    {option.label}
                  </button>
                )
              })}

              {overflowIconOptions.length > 0 ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      className={cn(
                        'flex min-h-11 w-full justify-center rounded-2xl border-border bg-secondary px-3 py-2 text-muted-foreground hover:border-primary/60 hover:bg-accent hover:text-foreground',
                        isSelectedIconInOverflow &&
                          'border-primary bg-primary/15 text-foreground'
                      )}
                      aria-label="Mais ícones"
                      title="Mais ícones"
                    >
                      <Ellipsis className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    className="w-72 rounded-2xl border-border bg-card p-2 text-foreground"
                  >
                    <DropdownMenuLabel className="text-xs text-muted-foreground">
                      Outros ícones
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator className="bg-border" />
                    <div className="grid max-h-72 grid-cols-1 gap-1 overflow-y-auto sm:grid-cols-2">
                      {overflowIconOptions.map((option) => {
                        const Icon = option.icon
                        const isSelected = selectedIcon === option.value

                        return (
                          <DropdownMenuItem
                            key={option.value}
                            className="rounded-xl focus:bg-accent focus:text-foreground"
                            onSelect={() => setIcon(option.value)}
                            title={option.label}
                          >
                            <Icon className="h-4 w-4" />
                            <span className="min-w-0 truncate">
                              {option.label}
                            </span>
                            {isSelected ? (
                              <Check className="ml-auto h-3.5 w-3.5" />
                            ) : null}
                          </DropdownMenuItem>
                        )
                      })}
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : null}
            </div>
          </AccountFormField>

          <div className="space-y-3">
            <label className="group flex min-h-20 items-center justify-between gap-4 rounded-2xl border border-border bg-secondary p-4 transition hover:border-state-income/50 hover:bg-accent has-[:checked]:border-state-income has-[:checked]:bg-state-income/10">
              <input
                type="checkbox"
                className="peer sr-only"
                {...form.register('includeInTotal')}
              />
              <span className="min-w-0">
                <span className="block text-sm font-medium text-foreground">
                  Incluir nos totais
                </span>
                <span className="block text-xs leading-5 text-muted-foreground">
                  Considere esta conta no saldo geral e nos relatórios.
                </span>
              </span>
              <span
                className="relative inline-flex h-7 w-12 shrink-0 rounded-full border border-border bg-card transition after:absolute after:left-1 after:top-1 after:h-5 after:w-5 after:rounded-full after:bg-muted-foreground after:transition peer-checked:border-state-income peer-checked:bg-state-income peer-checked:after:translate-x-5 peer-checked:after:bg-foreground"
                aria-hidden
              />
            </label>

            {!isEditing ? (
              <label className="group flex min-h-20 items-center justify-between gap-4 rounded-2xl border border-border bg-secondary p-4 transition hover:border-state-info/50 hover:bg-accent has-[:checked]:border-state-info has-[:checked]:bg-state-info/10">
                <input
                  type="checkbox"
                  className="peer sr-only"
                  {...form.register('isDefault')}
                />
                <span className="min-w-0">
                  <span className="block text-sm font-medium text-foreground">
                    Tornar padrão
                  </span>
                  <span className="block text-xs leading-5 text-muted-foreground">
                    Use esta conta como primeira opção em novos lançamentos.
                  </span>
                </span>
                <span
                  className="relative inline-flex h-7 w-12 shrink-0 rounded-full border border-border bg-card transition after:absolute after:left-1 after:top-1 after:h-5 after:w-5 after:rounded-full after:bg-muted-foreground after:transition peer-checked:border-state-info peer-checked:bg-state-info peer-checked:after:translate-x-5 peer-checked:after:bg-foreground"
                  aria-hidden
                />
              </label>
            ) : null}
          </div>

          {errorPresentation ? (
            <ApiErrorAlert error={errorPresentation} />
          ) : null}

          <SheetFooter className="gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              className="h-10 rounded-xl border-border bg-secondary text-foreground hover:bg-accent hover:text-foreground"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="h-10 rounded-xl bg-primary px-4 text-primary-foreground hover:bg-primary/90"
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
    initialBalanceCents: undefined,
    color: ACCOUNT_COLOR_OPTIONS[0].value,
    icon: 'landmark',
    includeInTotal: true,
    isDefault: false,
  }
}
