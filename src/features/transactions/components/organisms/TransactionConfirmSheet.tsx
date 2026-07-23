import { useEffect, useMemo } from 'react'
import type { ReactNode } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { CircleDashed } from 'lucide-react'
import type { Account } from '@/features/accounts/types/account.types'
import {
  getAccountColorOption,
  getAccountIcon,
} from '@/features/accounts/utils/account.utils'
import { CurrencyInput } from '@/shared/components/atoms/CurrencyInput'
import { ApiErrorAlert } from '@/shared/components/molecules/ApiErrorAlert'
import { DateOnlyPicker } from '@/shared/components/molecules/DateOnlyPicker'
import { useIsMobile } from '@/shared/hooks/use-mobile'
import { Button } from '@/shared/lib/button'
import { cn } from '@/shared/lib/utils'
import { applyApiFieldErrors, resolveApiError } from '@/shared/errors'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from '@/shared/components/ui/select'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/shared/components/ui/sheet'
import { useConfirmTransaction } from '../../api/mutations'
import {
  type TransactionConfirmValues,
  transactionConfirmSchema,
} from '../../schemas/transaction.schema'
import type { TransactionConfirmSheetState } from '../../types/transaction-ui.types'
import {
  buildConfirmTransactionDto,
  getConfirmActionLabel,
  getTransactionTypeLabel,
} from '../../utils/transaction.utils'

interface TransactionConfirmSheetProps {
  state: TransactionConfirmSheetState
  accounts: Account[]
  onOpenChange: (isOpen: boolean) => void
}

const inputClassName =
  'h-11 rounded-xl border-border bg-secondary text-foreground placeholder:text-muted-foreground focus:ring-0 focus:ring-offset-0 focus-visible:ring-0 focus-visible:ring-offset-0'

export function TransactionConfirmSheet({
  state,
  accounts,
  onOpenChange,
}: TransactionConfirmSheetProps) {
  const confirmMutation = useConfirmTransaction()
  const transaction = state?.transaction ?? null
  const isMobile = useIsMobile()
  const errorPresentation = useMemo(
    () =>
      confirmMutation.error
        ? resolveApiError(confirmMutation.error, 'transactions.confirm')
        : null,
    [confirmMutation.error]
  )
  const form = useForm<TransactionConfirmValues>({
    resolver: zodResolver(transactionConfirmSchema),
    defaultValues: {
      type: transaction?.type ?? 'EXPENSE',
      amountCents: transaction?.amountCents,
      date: transaction?.date ?? '',
      accountId: transaction?.accountId ?? '',
      destinationAccountId: transaction?.destinationAccountId ?? null,
    },
  })
  const resetForm = form.reset
  const resetMutation = confirmMutation.reset

  useEffect(() => {
    if (!transaction) return

    resetMutation()
    resetForm({
      type: transaction.type,
      amountCents: transaction.amountCents,
      date: transaction.date,
      accountId: transaction.accountId,
      destinationAccountId: transaction.destinationAccountId,
    })
  }, [resetForm, resetMutation, transaction])

  useEffect(() => {
    if (!errorPresentation) return

    applyApiFieldErrors<TransactionConfirmValues>({
      fieldErrors: errorPresentation.fieldErrors,
      fieldMap: {
        amountCents: 'amountCents',
        amount: 'amountCents',
        date: 'date',
        accountId: 'accountId',
        destinationAccountId: 'destinationAccountId',
      },
      setError: form.setError,
      setFocus: form.setFocus,
    })
  }, [errorPresentation, form.setError, form.setFocus])

  const handleSubmit = form.handleSubmit((values) => {
    if (!transaction) return

    const dto = buildConfirmTransactionDto(values)

    confirmMutation.mutate(
      {
        transactionId: transaction.id,
        dto,
      },
      { onSuccess: () => onOpenChange(false) }
    )
  })
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
  const isTransfer = transaction?.type === 'TRANSFER'

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
  const submitClassName = cn(
    'h-10 rounded-xl px-4 text-primary-foreground',
    transaction?.type === 'INCOME' && 'bg-state-income hover:bg-state-income/90',
    transaction?.type === 'EXPENSE' &&
      'bg-state-expense hover:bg-state-expense/90',
    transaction?.type !== 'INCOME' &&
      transaction?.type !== 'EXPENSE' &&
      'bg-primary text-primary-foreground hover:bg-primary/90'
  )

  return (
    <Sheet open={transaction !== null} onOpenChange={onOpenChange}>
      <SheetContent
        side={isMobile ? 'bottom' : 'right'}
        className="max-h-[calc(100dvh-1rem)] w-full overflow-y-auto rounded-t-3xl border-border bg-card text-foreground md:h-full md:max-h-none md:rounded-none md:sm:max-w-lg"
      >
        <SheetHeader className="pr-8 text-left">
          <SheetTitle className="text-foreground">
            {transaction ? getConfirmActionLabel(transaction.type) : 'Confirmar'}
          </SheetTitle>
          <SheetDescription className="text-muted-foreground">
            {isTransfer
              ? 'Confira valor, data, origem e destino antes de efetivar a transferência.'
              : 'Ajuste valor, data e conta antes de efetivar o lançamento.'}
          </SheetDescription>
        </SheetHeader>

        {transaction ? (
          <form className="mt-6 space-y-5" onSubmit={handleSubmit} noValidate>
            <div className="rounded-2xl border border-border bg-secondary p-4">
              <p className="text-xs font-medium uppercase tracking-normal text-muted-foreground">
                Tipo
              </p>
              <p className="mt-1 text-sm font-semibold text-foreground">
                {getTransactionTypeLabel(transaction.type)}
              </p>
            </div>

            <ConfirmField
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
            </ConfirmField>

            <ConfirmField
              label="Data"
              error={form.formState.errors.date?.message}
            >
              <DateOnlyPicker
                value={form.watch('date')}
                onChange={(value) =>
                  form.setValue('date', value, {
                    shouldDirty: true,
                    shouldValidate: true,
                  })
                }
              />
            </ConfirmField>

            <ConfirmField
              label={isTransfer ? 'Conta de origem' : 'Conta'}
              error={form.formState.errors.accountId?.message}
            >
              <Select
                value={form.watch('accountId')}
                onValueChange={setOriginAccount}
              >
                <SelectTrigger className={inputClassName}>
                  <AccountSelectLabel
                    account={selectedAccount}
                    fallback={isTransfer ? 'Escolha a origem' : 'Escolha uma conta'}
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
            </ConfirmField>

            {isTransfer ? (
              <ConfirmField
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
              </ConfirmField>
            ) : null}

            {isTransfer && activeAccounts.length < 2 ? (
              <div
                className="rounded-2xl border border-state-info/35 bg-state-info/10 p-4 text-sm leading-6 text-foreground"
                role="status"
              >
                Você precisa de pelo menos duas contas ativas para confirmar a
                transferência.
              </div>
            ) : null}

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
                disabled={
                  confirmMutation.isPending ||
                  (isTransfer && activeAccounts.length < 2)
                }
              >
                {confirmMutation.isPending ? 'Confirmando...' : 'Confirmar'}
              </Button>
            </SheetFooter>
          </form>
        ) : null}
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

interface ConfirmFieldProps {
  label: string
  error?: string
  children: ReactNode
}

function ConfirmField({ label, error, children }: ConfirmFieldProps) {
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
