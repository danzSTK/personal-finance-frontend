import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { CSSProperties, ReactNode } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useQueryClient } from '@tanstack/react-query'
import { useForm, type UseFormReturn } from 'react-hook-form'
import {
  CheckCircle2,
  CircleDashed,
  Clock3,
  TrendingDown,
  TrendingUp,
} from 'lucide-react'
import { AccountIdentity } from '@/features/accounts'
import type { Account } from '@/features/accounts/types/account.types'
import type { Category } from '@/features/categories/types/category.types'
import {
  getCategoryColorOption,
  getCategoryColorToken,
  getCategoryIconKey,
  getCategoryIconOption,
} from '@/features/categories/utils/category.utils'
import { CurrencyInput } from '@/shared/components/atoms/CurrencyInput'
import { ApiErrorAlert } from '@/shared/components/molecules/ApiErrorAlert'
import { DateOnlyPicker } from '@/shared/components/molecules/DateOnlyPicker'
import { useIsMobile } from '@/shared/hooks/use-mobile'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { cn } from '@/shared/lib/utils'
import {
  applyApiFieldErrors,
  resolveApiError,
  showApiErrorToast,
} from '@/shared/errors'
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
import { uploadTransactionAttachments } from '../../api/attachment.mutations'
import {
  useCreateTransaction,
  useUpdateTransaction,
} from '../../api/mutations'
import { TRANSACTION_QUERY_KEYS } from '../../constants/transaction.constants'
import {
  type TransactionFormValues,
  transactionFormSchema,
} from '../../schemas/transaction.schema'
import { ATTACHMENT_MAX_FILES } from '../../types/transaction-attachment.types'
import type { TransactionFormSheetState } from '../../types/transaction-ui.types'
import {
  buildCreateTransactionDto,
  buildUpdateTransactionDto,
  getTransactionFormDefaults,
  getTransactionTypeLabel,
} from '../../utils/transaction.utils'
import { TransactionAttachmentsGallery } from './TransactionAttachmentsGallery'
import {
  type StagedTransactionAttachment,
  TransactionStagedAttachmentsField,
} from './TransactionStagedAttachmentsField'

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
  const queryClient = useQueryClient()
  const createMutation = useCreateTransaction()
  const updateMutation = useUpdateTransaction()
  const [stagedAttachments, setStagedAttachments] = useState<
    StagedTransactionAttachment[]
  >([])
  const [isUploadingStaged, setIsUploadingStaged] = useState(false)
  const stagedAttachmentsRef = useRef<StagedTransactionAttachment[]>([])
  stagedAttachmentsRef.current = stagedAttachments
  const isOpen = state !== null
  const isEditing = state?.mode === 'edit'
  const isPending =
    createMutation.isPending || updateMutation.isPending || isUploadingStaged
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

  const clearStagedAttachments = useCallback(() => {
    stagedAttachmentsRef.current.forEach((item) => {
      URL.revokeObjectURL(item.previewUrl)
    })
    setStagedAttachments([])
  }, [])

  useEffect(() => {
    return () => {
      stagedAttachmentsRef.current.forEach((item) => {
        URL.revokeObjectURL(item.previewUrl)
      })
    }
  }, [])

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
    clearStagedAttachments()
    setIsUploadingStaged(false)

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
  }, [clearStagedAttachments, resetCreate, resetForm, resetUpdate, state])

  useEffect(() => {
    if (!errorPresentation) return

    applyApiFieldErrors<TransactionFormValues>({
      fieldErrors: errorPresentation.fieldErrors,
      fieldMap: {
        amountCents: 'amountCents',
        amount: 'amountCents',
        date: 'date',
        accountId: 'accountId',
        destinationAccountId: 'destinationAccountId',
        categoryId: 'categoryId',
        description: 'description',
        type: 'type',
        status: 'status',
        direction: 'direction',
      },
      setError: form.setError,
      setFocus: form.setFocus,
    })
  }, [errorPresentation, form.setError, form.setFocus])

  const selectedType = form.watch('type')
  const isEditingAdjustment =
    state?.mode === 'edit' && state.transaction.type === 'ADJUSTMENT'
  const effectiveType: TransactionFormValues['type'] = isEditingAdjustment
    ? 'ADJUSTMENT'
    : state?.mode === 'edit' && selectedType === 'ADJUSTMENT'
      ? state.transaction.type
      : state?.mode === 'create' && selectedType === 'ADJUSTMENT'
        ? state.type
        : selectedType
  const selectedDate = form.watch('date')
  const selectedStatus = form.watch('status')
  const supportsAttachments =
    effectiveType === 'INCOME' || effectiveType === 'EXPENSE'
  const availableCategories = categories.filter(
    (category) =>
      !category.isArchived &&
      (effectiveType === 'INCOME' || effectiveType === 'EXPENSE') &&
      category.type === effectiveType
  )
  const activeAccounts = accounts.filter((account) => !account.isArchived)
  const destinationAccounts = activeAccounts.filter(
    (account) => account.id !== form.watch('accountId')
  )
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
    effectiveType === 'INCOME'
      ? 'Foi recebida'
      : effectiveType === 'EXPENSE'
        ? 'Foi paga'
        : effectiveType === 'TRANSFER'
          ? 'Foi transferida'
          : 'Foi efetivada'
  const submitLabel = isEditing
    ? 'Salvar alterações'
    : effectiveType === 'INCOME'
      ? 'Salvar receita'
      : effectiveType === 'EXPENSE'
        ? 'Salvar despesa'
        : effectiveType === 'TRANSFER'
          ? 'Salvar transferência'
          : 'Salvar transação'
  const submitClassName = cn(
    'h-10 rounded-xl px-4 text-primary-foreground',
    effectiveType === 'INCOME' && 'bg-state-income hover:bg-state-income/90',
    effectiveType === 'EXPENSE' && 'bg-state-expense hover:bg-state-expense/90',
    effectiveType !== 'INCOME' &&
      effectiveType !== 'EXPENSE' &&
      'bg-primary text-primary-foreground hover:bg-primary/90'
  )

  const handleAddStagedFiles = (files: File[]) => {
    setStagedAttachments((current) => {
      const remaining = Math.max(ATTACHMENT_MAX_FILES - current.length, 0)
      const accepted = files.slice(0, remaining)
      const nextItems = accepted.map((file, idx) => ({
        id: `staged-${Date.now()}-${idx}-${Math.random().toString(36).slice(2, 8)}`,
        file,
        previewUrl: URL.createObjectURL(file),
      }))
      return [...current, ...nextItems]
    })
  }

  const handleRemoveStagedFile = (id: string) => {
    setStagedAttachments((current) => {
      const target = current.find((item) => item.id === id)
      if (target) {
        URL.revokeObjectURL(target.previewUrl)
      }
      return current.filter((item) => item.id !== id)
    })
  }

  const setDatePreset = (date: string) => {
    form.setValue('date', date, {
      shouldDirty: true,
      shouldValidate: true,
    })
  }

  const setOriginAccount = (accountId: string) => {
    form.setValue('accountId', accountId, {
      shouldDirty: true,
      shouldValidate: true,
    })

    if (form.getValues('destinationAccountId') === accountId) {
      form.setValue('destinationAccountId', null, {
        shouldDirty: true,
        shouldValidate: true,
      })
    }
  }

  const handleSubmit = form.handleSubmit(async (values) => {
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
      try {
        const created = await createMutation.mutateAsync(
          buildCreateTransactionDto(values)
        )

        if (
          stagedAttachments.length > 0 &&
          (created.type === 'INCOME' || created.type === 'EXPENSE')
        ) {
          setIsUploadingStaged(true)
          try {
            await uploadTransactionAttachments(
              created.id,
              stagedAttachments.map((item) => item.file)
            )
            void queryClient.invalidateQueries({
              queryKey: TRANSACTION_QUERY_KEYS.attachments(created.id),
            })
            void queryClient.invalidateQueries({
              queryKey: TRANSACTION_QUERY_KEYS.transactions,
              exact: false,
            })
          } catch (uploadError) {
            showApiErrorToast(uploadError, 'transactions.attachments.add')
          } finally {
            setIsUploadingStaged(false)
          }
        }

        clearStagedAttachments()
        onOpenChange(false)
      } catch {
        // Error presentation is handled via createMutation.error
      }
    }
  })

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent
        side={isMobile ? 'bottom' : 'right'}
        className="max-h-[calc(100dvh-1rem)] w-full overflow-y-auto rounded-t-3xl border-border bg-card p-6 text-foreground md:h-full md:max-h-none md:rounded-none md:sm:max-w-xl"
      >
        <SheetHeader className="p-0 pr-8 text-left">
          <SheetTitle className="text-foreground">
            {isEditing
              ? effectiveType === 'TRANSFER'
                ? 'Editar transferência'
                : effectiveType === 'ADJUSTMENT'
                  ? 'Editar ajuste'
                  : 'Editar transação'
              : `Nova ${getTransactionTypeLabel(initialType).toLowerCase()}`}
          </SheetTitle>
          <SheetDescription className="text-muted-foreground">
            {effectiveType === 'TRANSFER'
              ? 'Mova dinheiro entre suas contas sem registrar receita ou despesa.'
              : effectiveType === 'ADJUSTMENT'
                ? 'Atualize valor, direção, data, conta ou motivo do ajuste.'
                : isEditing
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
              {isEditingAdjustment ? (
                <Select key="adjustment-type" value="ADJUSTMENT" disabled>
                  <SelectTrigger className={inputClassName}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="border-border bg-card text-foreground">
                    <SelectItem
                      value="ADJUSTMENT"
                      hideIndicator
                      className="focus:bg-accent focus:text-foreground"
                    >
                      {getTransactionTypeLabel('ADJUSTMENT')}
                    </SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <Select
                  key="standard-type"
                  value={effectiveType}
                  onValueChange={(value) => {
                    if (!value) return

                    form.setValue(
                      'type',
                      value as TransactionFormValues['type'],
                      { shouldDirty: true, shouldValidate: true }
                    )
                  }}
                >
                  <SelectTrigger className={inputClassName}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="border-border bg-card text-foreground">
                    {(['EXPENSE', 'INCOME', 'TRANSFER'] as const).map(
                      (type) => (
                        <SelectItem
                          key={type}
                          value={type}
                          hideIndicator
                          className="focus:bg-accent focus:text-foreground"
                        >
                          {getTransactionTypeLabel(type)}
                        </SelectItem>
                      )
                    )}
                  </SelectContent>
                </Select>
              )}
            </TransactionFormField>
          ) : null}

          <TransactionFormField
            label="Valor"
            error={form.formState.errors.amountCents?.message}
          >
            <CurrencyInput
              valueCents={form.watch('amountCents')}
              onValueCentsChange={(value) =>
                form.setValue('amountCents', value, {
                  shouldDirty: true,
                  shouldValidate: true,
                })
              }
              className={inputClassName}
              aria-label="Valor"
              aria-invalid={Boolean(form.formState.errors.amountCents)}
            />
          </TransactionFormField>

          {effectiveType === 'ADJUSTMENT' ? (
            <div className="space-y-2">
              <span className="block text-sm font-medium text-foreground">
                Direção
              </span>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  type="button"
                  variant="outline"
                  aria-pressed={form.watch('direction') === 'INCREASE'}
                  className={cn(
                    'min-h-11 gap-2 rounded-xl border-border bg-secondary text-foreground hover:bg-accent hover:text-foreground',
                    form.watch('direction') === 'INCREASE' &&
                      'border-state-income/50 bg-state-income/10 text-state-income hover:bg-state-income/15 hover:text-state-income'
                  )}
                  onClick={() =>
                    form.setValue('direction', 'INCREASE', {
                      shouldDirty: true,
                      shouldValidate: true,
                    })
                  }
                >
                  <TrendingUp className="h-4 w-4" />
                  <span>Acréscimo (+)</span>
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  aria-pressed={form.watch('direction') === 'DECREASE'}
                  className={cn(
                    'min-h-11 gap-2 rounded-xl border-border bg-secondary text-foreground hover:bg-accent hover:text-foreground',
                    form.watch('direction') === 'DECREASE' &&
                      'border-state-expense/50 bg-state-expense/10 text-state-expense hover:bg-state-expense/15 hover:text-state-expense'
                  )}
                  onClick={() =>
                    form.setValue('direction', 'DECREASE', {
                      shouldDirty: true,
                      shouldValidate: true,
                    })
                  }
                >
                  <TrendingDown className="h-4 w-4" />
                  <span>Redução (−)</span>
                </Button>
              </div>
              {form.formState.errors.direction?.message ? (
                <span className="block text-xs font-medium text-destructive">
                  {form.formState.errors.direction.message}
                </span>
              ) : null}
            </div>
          ) : null}

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
                        effectiveType === 'EXPENSE'
                          ? 'text-state-expense'
                          : effectiveType === 'TRANSFER'
                            ? 'text-state-info'
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
                      ? effectiveType === 'EXPENSE'
                        ? 'bg-state-expense'
                        : effectiveType === 'TRANSFER'
                          ? 'bg-state-info'
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

          {effectiveType !== 'TRANSFER' ? (
            <TransactionDescriptionField
              form={form}
              label={effectiveType === 'ADJUSTMENT' ? 'Motivo' : 'Descrição'}
              placeholder={
                effectiveType === 'ADJUSTMENT'
                  ? 'Ex.: Conferência com extrato bancário'
                  : undefined
              }
              maxLength={500}
            />
          ) : null}

          <TransactionFormField
            label={effectiveType === 'TRANSFER' ? 'Conta de origem' : 'Conta'}
            error={form.formState.errors.accountId?.message}
          >
            <Select
              value={form.watch('accountId')}
              onValueChange={setOriginAccount}
            >
              <SelectTrigger className={inputClassName}>
                <AccountSelectLabel
                  account={selectedAccount}
                  fallback={
                    effectiveType === 'TRANSFER'
                      ? 'Escolha a origem'
                      : 'Escolha uma conta'
                  }
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

          {effectiveType === 'TRANSFER' ? (
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
                  {destinationAccounts.map((account) => (
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

          {effectiveType === 'TRANSFER' ? (
            <>
              {activeAccounts.length < 2 ? (
                <div
                  className="rounded-2xl border border-state-info/35 bg-state-info/10 p-4 text-sm leading-6 text-foreground"
                  role="status"
                >
                  Você precisa de pelo menos duas contas ativas para registrar
                  uma transferência.
                </div>
              ) : null}
              <TransactionDescriptionField
                form={form}
                placeholder="Ex.: Reserva mensal"
              />
            </>
          ) : null}

          {effectiveType === 'INCOME' || effectiveType === 'EXPENSE' ? (
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

          {supportsAttachments ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-medium text-foreground">
                  Comprovantes
                </span>
                <span className="text-xs text-muted-foreground">
                  PNG, JPEG ou WebP (até 5 MB)
                </span>
              </div>

              {state?.mode === 'edit' ? (
                <TransactionAttachmentsGallery
                  transaction={{
                    ...state.transaction,
                    type: effectiveType,
                  }}
                />
              ) : (
                <TransactionStagedAttachmentsField
                  items={stagedAttachments}
                  disabled={isPending}
                  isUploading={isUploadingStaged}
                  onAddFiles={handleAddStagedFiles}
                  onRemove={handleRemoveStagedFile}
                  onReorder={setStagedAttachments}
                />
              )}
            </div>
          ) : null}

          {errorPresentation ? (
            <ApiErrorAlert error={errorPresentation} />
          ) : null}

          <SheetFooter className="gap-2 px-0 pb-0 pt-2">
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
              disabled={
                isPending ||
                (effectiveType === 'TRANSFER' && activeAccounts.length < 2)
              }
            >
              {isUploadingStaged
                ? 'Enviando comprovantes...'
                : isPending
                  ? 'Salvando...'
                  : submitLabel}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  )
}

interface TransactionDescriptionFieldProps {
  form: UseFormReturn<TransactionFormValues>
  label?: string
  placeholder?: string
  maxLength?: number
}

function TransactionDescriptionField({
  form,
  label = 'Descrição',
  placeholder = 'Ex.: Mercado, salário, pix',
  maxLength = 500,
}: TransactionDescriptionFieldProps) {
  return (
    <TransactionFormField
      label={label}
      error={form.formState.errors.description?.message}
    >
      <Input
        className={inputClassName}
        maxLength={maxLength}
        placeholder={placeholder}
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

  return (
    <div className="flex min-w-0 items-center gap-2">
      <AccountIdentity account={account} size="sm" />
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
