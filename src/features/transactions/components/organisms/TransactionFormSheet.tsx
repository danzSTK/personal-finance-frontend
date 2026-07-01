import { useEffect, useMemo } from 'react'
import type { CSSProperties, ReactNode } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { CheckCircle2, CircleDashed, Clock3 } from 'lucide-react'
import type { Account } from '@/features/accounts/types/account.types'
import type { Category } from '@/features/categories/types/category.types'
import {
  getAccountColorOption,
  getAccountIcon,
} from '@/features/accounts/utils/account.utils'
import {
  getCategoryColorOption,
  getCategoryColorToken,
  getCategoryIconKey,
  getCategoryIconOption,
} from '@/features/categories/utils/category.utils'
import { MaskedInput } from '@/shared/components/atoms/MaskedInput'
import { ApiErrorAlert } from '@/shared/components/molecules/ApiErrorAlert'
import { DateOnlyPicker } from '@/shared/components/molecules/DateOnlyPicker'
import { useIsMobile } from '@/shared/hooks/use-mobile'
import { Button } from '@/shared/lib/button'
import { Input } from '@/shared/lib/input'
import { cn } from '@/shared/lib/utils'
import { applyApiFieldErrors, resolveApiError } from '@/shared/errors'
import { getTodayDateOnly, getYesterdayDateOnly } from '@/shared/utils/dateOnly'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/shared/components/ui/sheet'
import {
  useCreateTransaction,
  useUpdateTransaction,
} from '../../api/mutations'
import {
  type TransactionFormValues,
  transactionFormSchema,
} from '../../schemas/transaction.schema'
import type { TransactionFormSheetState } from '../../types/transaction-ui.types'
import {
  buildCreateTransactionDto,
  buildUpdateTransactionDto,
  getTransactionFormDefaults,
  getTransactionTypeLabel,
} from '../../utils/transaction.utils'

interface TransactionFormSheetProps {
  state: TransactionFormSheetState
  accounts: Account[]
  categories: Category[]
  onOpenChange: (isOpen: boolean) => void
}

const inputClassName =
  'h-11 rounded-xl border-border bg-secondary text-foreground placeholder:text-muted-foreground focus:ring-0 focus:ring-offset-0 focus-visible:ring-0 focus-visible:ring-offset-0'

export function TransactionFormSheet({
  state,
  accounts,
  categories,
  onOpenChange,
}: TransactionFormSheetProps) {
  const createMutation = useCreateTransaction()
  const updateMutation = useUpdateTransaction()
  const isOpen = state !== null
  const isEditing = state?.mode === 'edit'
  const isPending = createMutation.isPending || updateMutation.isPending
  const isMobile = useIsMobile()
  const mutationError = isEditing ? updateMutation.error : createMutation.error
  const errorPresentation = useMemo(
    () =>
      mutationError
        ? resolveApiError(
            mutationError,
            isEditing ? 'transactions.update' : 'transactions.create'
          )
        : null,
    [isEditing, mutationError]
  )

  const initialType =
    state?.mode === 'create' ? state.type : (state?.transaction.type ?? 'EXPENSE')
  const form = useForm<TransactionFormValues>({
    resolver: zodResolver(transactionFormSchema),
    defaultValues:
      state?.mode === 'edit'
        ? getTransactionFormDefaults(state.transaction.type, state.transaction)
        : getTransactionFormDefaults(initialType),
  })
  const resetForm = form.reset
  const resetCreate = createMutation.reset
  const resetUpdate = updateMutation.reset

  useEffect(() => {
    if (!state) {
      return
    }

    resetCreate()
    resetUpdate()
    resetForm(
      state.mode === 'edit'
        ? getTransactionFormDefaults(state.transaction.type, state.transaction)
        : getTransactionFormDefaults(state.type)
    )
  }, [resetCreate, resetForm, resetUpdate, state])

  useEffect(() => {
    if (!errorPresentation) return

    applyApiFieldErrors<TransactionFormValues>({
      fieldErrors: errorPresentation.fieldErrors,
      fieldMap: {
        amountCents: 'amount',
        amount: 'amount',
        date: 'date',
        accountId: 'accountId',
        destinationAccountId: 'destinationAccountId',
        categoryId: 'categoryId',
        description: 'description',
        type: 'type',
        direction: 'direction',
      },
      setError: form.setError,
      setFocus: form.setFocus,
    })
  }, [errorPresentation, form.setError, form.setFocus])

  const selectedType = form.watch('type')
  const selectedDate = form.watch('date')
  const selectedStatus = form.watch('status')
  const availableCategories = categories.filter(
    (category) =>
      !category.isArchived &&
      (selectedType === 'INCOME' || selectedType === 'EXPENSE') &&
      category.type === selectedType
  )
  const activeAccounts = accounts.filter((account) => !account.isArchived)
  const selectedAccount =
    activeAccounts.find((account) => account.id === form.watch('accountId')) ??
    null
  const selectedDestinationAccount =
    activeAccounts.find(
      (account) => account.id === form.watch('destinationAccountId')
    ) ?? null
  const selectedCategory =
    availableCategories.find(
      (category) => category.id === form.watch('categoryId')
    ) ?? null
  const todayDate = getTodayDateOnly()
  const yesterdayDate = getYesterdayDateOnly()
  const effectiveStatusLabel =
    selectedType === 'INCOME'
      ? 'Foi recebida'
      : selectedType === 'EXPENSE'
        ? 'Foi paga'
        : 'Foi efetivada'
  const submitLabel = isEditing
    ? 'Salvar alterações'
    : selectedType === 'INCOME'
      ? 'Salvar receita'
      : selectedType === 'EXPENSE'
        ? 'Salvar despesa'
        : 'Salvar transação'
  const submitClassName = cn(
    'h-10 rounded-xl px-4 text-primary-foreground',
    selectedType === 'INCOME' && 'bg-state-income hover:bg-state-income/90',
    selectedType === 'EXPENSE' && 'bg-state-expense hover:bg-state-expense/90',
    selectedType !== 'INCOME' &&
      selectedType !== 'EXPENSE' &&
      'bg-primary text-primary-foreground hover:bg-primary/90'
  )

  const setDatePreset = (date: string) => {
    form.setValue('date', date, {
      shouldDirty: true,
      shouldValidate: true,
    })
  }

  const handleSubmit = form.handleSubmit((values) => {
    if (state?.mode === 'edit') {
      const dto = buildUpdateTransactionDto(values, state.transaction)

      if (Object.keys(dto).length === 0) {
        onOpenChange(false)
        return
      }

      updateMutation.mutate(
        {
          transactionId: state.transaction.id,
          dto,
        },
        { onSuccess: () => onOpenChange(false) }
      )
      return
    }

    if (state?.mode === 'create') {
      createMutation.mutate(buildCreateTransactionDto(values), {
        onSuccess: () => onOpenChange(false),
      })
    }
  })

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent
        side={isMobile ? 'bottom' : 'right'}
        className="max-h-[calc(100dvh-1rem)] w-full overflow-y-auto rounded-t-3xl border-border bg-card text-foreground md:h-full md:max-h-none md:rounded-none md:sm:max-w-xl"
      >
        <SheetHeader className="pr-8 text-left">
          <SheetTitle className="text-foreground">
            {isEditing ? 'Editar transação' : `Nova ${getTransactionTypeLabel(initialType).toLowerCase()}`}
          </SheetTitle>
          <SheetDescription className="text-muted-foreground">
            {isEditing
              ? 'Atualize os dados permitidos pelo lançamento.'
              : 'Registre valor, data, categoria e conta do lançamento.'}
          </SheetDescription>
        </SheetHeader>

        <form className="mt-6 space-y-5" onSubmit={handleSubmit} noValidate>
          {isEditing ? (
            <TransactionFormField
              label="Tipo"
              error={form.formState.errors.type?.message}
            >
              <Select
                value={selectedType}
                onValueChange={(value) =>
                  form.setValue(
                    'type',
                    value as TransactionFormValues['type'],
                    { shouldDirty: true, shouldValidate: true }
                  )
                }
              >
                <SelectTrigger className={inputClassName}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="border-border bg-card text-foreground">
                  {(['EXPENSE', 'INCOME', 'TRANSFER'] as const).map((type) => (
                    <SelectItem
                      key={type}
                      value={type}
                      hideIndicator
                      className="focus:bg-accent focus:text-foreground"
                    >
                      {getTransactionTypeLabel(type)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </TransactionFormField>
          ) : null}

          <TransactionFormField
            label="Valor"
            error={form.formState.errors.amount?.message}
          >
            <div className="flex h-11 items-center rounded-xl border border-border bg-secondary focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 focus-within:ring-offset-secondary">
              <span className="pl-3 text-sm font-semibold text-muted-foreground">
                R$
              </span>
              <MaskedInput
                mask={{
                  mask: Number,
                  scale: 2,
                  thousandsSeparator: '.',
                  radix: ',',
                  padFractionalZeros: true,
                  normalizeZeros: true,
                  mapToRadix: ['.'],
                }}
                value={form.watch('amount')}
                onAccept={(value) =>
                  form.setValue('amount', value, {
                    shouldDirty: true,
                    shouldValidate: true,
                  })
                }
                className="numeric h-full min-w-0 flex-1 border-0 bg-transparent px-2 text-base text-foreground placeholder:text-muted-foreground focus-visible:ring-0 focus-visible:ring-offset-0 md:text-sm"
                placeholder="0,00"
                inputMode="decimal"
              />
            </div>
          </TransactionFormField>

          {!isEditing ? (
            <TransactionFormField
              label="Situação"
              error={form.formState.errors.status?.message}
            >
              <button
                type="button"
                role="switch"
                aria-checked={selectedStatus === 'EFFECTIVE'}
                className="flex h-11 w-full items-center justify-between gap-3 rounded-xl border border-border bg-secondary px-3 text-left transition hover:bg-accent focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-secondary"
                onClick={() =>
                  form.setValue(
                    'status',
                    selectedStatus === 'EFFECTIVE' ? 'PENDING' : 'EFFECTIVE',
                    { shouldDirty: true, shouldValidate: true }
                  )
                }
              >
                <span className="flex min-w-0 items-center gap-2 text-sm font-medium text-foreground">
                  {selectedStatus === 'EFFECTIVE' ? (
                    <CheckCircle2
                      className={cn(
                        'h-4 w-4',
                        selectedType === 'EXPENSE'
                          ? 'text-state-expense'
                          : 'text-state-income'
                      )}
                    />
                  ) : (
                    <Clock3 className="h-4 w-4 text-state-info" />
                  )}
                  <span className="truncate">{effectiveStatusLabel}</span>
                </span>
                <span
                  className={cn(
                    'relative h-5 w-9 rounded-full transition',
                    selectedStatus === 'EFFECTIVE'
                      ? selectedType === 'EXPENSE'
                        ? 'bg-state-expense'
                        : 'bg-state-income'
                      : 'bg-accent'
                  )}
                >
                  <span
                    className={cn(
                      'absolute top-0.5 h-4 w-4 rounded-full bg-foreground transition',
                      selectedStatus === 'EFFECTIVE'
                        ? 'translate-x-4'
                        : 'translate-x-0.5'
                    )}
                  />
                </span>
              </button>
            </TransactionFormField>
          ) : null}

          <TransactionFormField
            label="Data"
            error={form.formState.errors.date?.message}
          >
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: 'Hoje', value: todayDate },
                { label: 'Ontem', value: yesterdayDate },
              ].map((preset) => (
                <Button
                  key={preset.label}
                  type="button"
                  variant="outline"
                  className={cn(
                    'h-10 rounded-xl border-border bg-secondary text-foreground hover:bg-accent hover:text-foreground',
                    selectedDate === preset.value &&
                      'border-primary bg-primary/15 text-primary'
                  )}
                  onClick={() => setDatePreset(preset.value)}
                >
                  {preset.label}
                </Button>
              ))}
              <DateOnlyPicker
                value={
                  selectedDate === todayDate || selectedDate === yesterdayDate
                    ? ''
                    : selectedDate
                }
                onChange={(value) => setDatePreset(value)}
                className="h-10"
                placeholder="Outro"
              />
            </div>
          </TransactionFormField>

          <TransactionFormField
            label="Descrição"
            error={form.formState.errors.description?.message}
          >
            <Input
              className={inputClassName}
              placeholder="Ex.: Mercado, salário, pix"
              {...form.register('description')}
              value={form.watch('description') ?? ''}
              onChange={(event) =>
                form.setValue('description', event.target.value, {
                  shouldDirty: true,
                  shouldValidate: true,
                })
              }
            />
          </TransactionFormField>

          <TransactionFormField
            label="Conta"
            error={form.formState.errors.accountId?.message}
          >
            <Select
              value={form.watch('accountId')}
              onValueChange={(value) =>
                form.setValue('accountId', value, {
                  shouldDirty: true,
                  shouldValidate: true,
                })
              }
            >
              <SelectTrigger className={inputClassName}>
                <AccountSelectLabel
                  account={selectedAccount}
                  fallback="Escolha uma conta"
                />
              </SelectTrigger>
              <SelectContent className="border-border bg-card text-foreground">
                {activeAccounts.map((account) => (
                  <SelectItem
                    key={account.id}
                    value={account.id}
                    hideIndicator
                    className="focus:bg-accent focus:text-foreground"
                  >
                    <AccountSelectLabel account={account} />
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </TransactionFormField>

          {selectedType === 'TRANSFER' ? (
            <TransactionFormField
              label="Conta de destino"
              error={form.formState.errors.destinationAccountId?.message}
            >
              <Select
                value={form.watch('destinationAccountId') ?? ''}
                onValueChange={(value) =>
                  form.setValue('destinationAccountId', value, {
                    shouldDirty: true,
                    shouldValidate: true,
                  })
                }
              >
                <SelectTrigger className={inputClassName}>
                  <AccountSelectLabel
                    account={selectedDestinationAccount}
                    fallback="Escolha o destino"
                  />
                </SelectTrigger>
                <SelectContent className="border-border bg-card text-foreground">
                  {activeAccounts.map((account) => (
                    <SelectItem
                      key={account.id}
                      value={account.id}
                      hideIndicator
                      className="focus:bg-accent focus:text-foreground"
                    >
                      <AccountSelectLabel account={account} />
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </TransactionFormField>
          ) : null}

          {selectedType === 'INCOME' || selectedType === 'EXPENSE' ? (
            <TransactionFormField
              label="Categoria"
              error={form.formState.errors.categoryId?.message}
            >
              <Select
                value={form.watch('categoryId') ?? ''}
                onValueChange={(value) =>
                  form.setValue('categoryId', value, {
                    shouldDirty: true,
                    shouldValidate: true,
                  })
                }
              >
                <SelectTrigger className={inputClassName}>
                  <CategorySelectLabel
                    category={selectedCategory}
                    fallback="Escolha uma categoria"
                  />
                </SelectTrigger>
                <SelectContent className="border-border bg-card text-foreground">
                  {availableCategories.map((category) => (
                    <SelectItem
                      key={category.id}
                      value={category.id}
                      hideIndicator
                      className="focus:bg-accent focus:text-foreground"
                    >
                      <CategorySelectLabel category={category} />
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </TransactionFormField>
          ) : null}

          <div className="rounded-2xl border border-dashed border-border bg-secondary p-4 text-sm text-muted-foreground">
            Anexos e mais detalhes: em breve.
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
              className={submitClassName}
              disabled={isPending}
            >
              {isPending ? 'Salvando...' : submitLabel}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  )
}

interface AccountSelectLabelProps {
  account: Account | null
  fallback?: string
}

function AccountSelectLabel({
  account,
  fallback = 'Conta',
}: AccountSelectLabelProps) {
  if (!account) {
    return (
      <div className="flex min-w-0 items-center gap-2">
        <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-state-info/10 text-state-info">
          <CircleDashed className="h-4 w-4" />
        </span>
        <span className="truncate">{fallback}</span>
      </div>
    )
  }

  const Icon = getAccountIcon(account)
  const color = getAccountColorOption(account.color)

  return (
    <div className="flex min-w-0 items-center gap-2">
      <span
        className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-foreground"
        style={{ backgroundColor: color.hex }}
      >
        <Icon className="h-4 w-4" />
      </span>
      <span className="truncate">{account.name}</span>
    </div>
  )
}

interface CategorySelectLabelProps {
  category: Category | null
  fallback?: string
}

function CategorySelectLabel({
  category,
  fallback = 'Categoria',
}: CategorySelectLabelProps) {
  if (!category) {
    return (
      <div className="flex min-w-0 items-center gap-2">
        <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-state-info/10 text-state-info">
          <CircleDashed className="h-4 w-4" />
        </span>
        <span className="truncate">{fallback}</span>
      </div>
    )
  }

  const Icon = getCategoryIconOption(getCategoryIconKey(category)).icon
  const color = getCategoryColorOption(
    getCategoryColorToken(category),
    category.type === 'INCOME' ? 'INCOME' : 'EXPENSE'
  )
  const style: CSSProperties = {
    backgroundColor: color.hex,
  }

  return (
    <div className="flex min-w-0 items-center gap-2">
      <span
        className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-foreground"
        style={style}
      >
        <Icon className="h-4 w-4" />
      </span>
      <span className="truncate">{category.displayName}</span>
    </div>
  )
}

interface TransactionFormFieldProps {
  label: string
  error?: string
  children: ReactNode
}

function TransactionFormField({
  label,
  error,
  children,
}: TransactionFormFieldProps) {
  return (
    <label className="block space-y-2">
      <span className="text-sm font-medium text-foreground">{label}</span>
      {children}
      {error ? (
        <span className="block text-xs font-medium text-destructive">
          {error}
        </span>
      ) : null}
    </label>
  )
}
