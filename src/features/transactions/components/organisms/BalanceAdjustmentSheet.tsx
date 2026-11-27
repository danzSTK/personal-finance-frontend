import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import {
  CheckCircle2,
  Clock3,
  TrendingDown,
  TrendingUp,
} from 'lucide-react'
import { AccountIdentity, type Account } from '@/features/accounts'
import { ACCOUNT_QUERY_KEYS } from '@/features/accounts/constants/account.constants'
import { CurrencyInput } from '@/shared/components/atoms/CurrencyInput'
import { ApiErrorAlert } from '@/shared/components/molecules/ApiErrorAlert'
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
import {
  API_ERROR_CODES,
  applyApiFieldErrors,
  resolveApiError,
} from '@/shared/errors'
import { useIsMobile } from '@/shared/hooks/use-mobile'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { cn } from '@/shared/lib/utils'
import { formatCurrencyFromCents } from '@/shared/utils/formatters'
import {
  useCreateBalanceAdjustment,
  useCreateTransaction,
} from '../../api/mutations'
import {
  BALANCE_ADJUSTMENT_DESCRIPTION_MAX_LENGTH,
  manualBalanceAdjustmentSchema,
  targetBalanceAdjustmentSchema,
  type ManualBalanceAdjustmentFormValues,
  type TargetBalanceAdjustmentFormValues,
} from '../../schemas/balanceAdjustment.schema'
import type {
  BalanceAdjustmentMode,
  BalanceAdjustmentSheetState,
} from '../../types/transaction-ui.types'
import {
  buildCreateBalanceAdjustmentDto,
  buildManualAdjustmentTransactionDto,
  computeTargetBalanceDelta,
} from '../../utils/balanceAdjustment.utils'
import { BalanceAdjustmentPreview } from '../molecules/BalanceAdjustmentPreview'
import { AccountSelectLabel } from '../molecules/TransactionAccountSelect'

interface BalanceAdjustmentSheetProps {
  state: BalanceAdjustmentSheetState
  accounts: Account[]
  onOpenChange: (isOpen: boolean) => void
}

const inputClassName =
  'h-11 rounded-xl border-border bg-secondary text-foreground placeholder:text-muted-foreground focus:ring-0 focus:ring-offset-0 focus-visible:ring-0 focus-visible:ring-offset-0'

const getDefaultAccountId = (
  state: BalanceAdjustmentSheetState,
  activeAccounts: Account[]
): string => {
  if (state?.account) {
    return state.account.id
  }

  if (
    state?.initialAccountId &&
    activeAccounts.some((account) => account.id === state.initialAccountId)
  ) {
    return state.initialAccountId
  }

  return ''
}

export function BalanceAdjustmentSheet({
  state,
  accounts,
  onOpenChange,
}: BalanceAdjustmentSheetProps) {
  const queryClient = useQueryClient()
  const isMobile = useIsMobile()
  const isOpen = state !== null
  const [cachedState, setCachedState] =
    useState<BalanceAdjustmentSheetState>(state)

  if (state !== null && state !== cachedState) {
    setCachedState(state)
  }

  const effectiveState = state ?? cachedState
  const isAccountLocked = Boolean(effectiveState?.account)

  const activeAccounts = useMemo(
    () => accounts.filter((account) => !account.isArchived),
    [accounts]
  )

  const [mode, setMode] = useState<BalanceAdjustmentMode>('target')
  const [targetSign, setTargetSign] = useState<'positive' | 'negative'>(
    'positive'
  )
  const targetInputRef = useRef<HTMLInputElement>(null)
  const isTargetNegative = targetSign === 'negative'

  const createBalanceAdjustmentMutation = useCreateBalanceAdjustment()
  const createManualMutation = useCreateTransaction()

  const targetForm = useForm<TargetBalanceAdjustmentFormValues>({
    resolver: zodResolver(targetBalanceAdjustmentSchema),
    defaultValues: {
      accountId: '',
      targetBalanceCents: undefined,
      description: null,
    },
  })

  const manualForm = useForm<ManualBalanceAdjustmentFormValues>({
    resolver: zodResolver(manualBalanceAdjustmentSchema),
    defaultValues: {
      accountId: '',
      direction: 'INCREASE',
      amountCents: undefined,
      status: 'EFFECTIVE',
      description: '',
    },
  })

  const resetTargetForm = targetForm.reset
  const resetManualForm = manualForm.reset
  const resetTargetMutation = createBalanceAdjustmentMutation.reset
  const resetManualMutation = createManualMutation.reset
  const activeAccountsRef = useRef(activeAccounts)
  activeAccountsRef.current = activeAccounts

  useEffect(() => {
    if (!state) {
      return
    }

    const defaultAccountId = getDefaultAccountId(
      state,
      activeAccountsRef.current
    )

    setMode(state.initialMode ?? 'target')
    setTargetSign('positive')
    resetTargetMutation()
    resetManualMutation()

    resetTargetForm({
      accountId: defaultAccountId,
      targetBalanceCents: undefined,
      description: null,
    })

    resetManualForm({
      accountId: defaultAccountId,
      direction: 'INCREASE',
      amountCents: undefined,
      status: 'EFFECTIVE',
      description: '',
    })
  }, [
    resetManualForm,
    resetManualMutation,
    resetTargetForm,
    resetTargetMutation,
    state,
  ])

  const activeMutationError =
    mode === 'target'
      ? createBalanceAdjustmentMutation.error
      : createManualMutation.error

  const errorPresentation = useMemo(
    () =>
      activeMutationError
        ? resolveApiError(
            activeMutationError,
            'transactions.balance-adjustment'
          )
        : null,
    [activeMutationError]
  )

  const setTargetError = targetForm.setError
  const setTargetFocus = targetForm.setFocus
  const setManualError = manualForm.setError
  const setManualFocus = manualForm.setFocus

  useEffect(() => {
    if (!errorPresentation) return

    if (mode === 'target') {
      applyApiFieldErrors<TargetBalanceAdjustmentFormValues>({
        fieldErrors: errorPresentation.fieldErrors,
        fieldMap: {
          accountId: 'accountId',
          targetBalanceCents: 'targetBalanceCents',
          description: 'description',
        },
        setError: setTargetError,
        setFocus: setTargetFocus,
      })
      return
    }

    applyApiFieldErrors<ManualBalanceAdjustmentFormValues>({
      fieldErrors: errorPresentation.fieldErrors,
      fieldMap: {
        accountId: 'accountId',
        direction: 'direction',
        amountCents: 'amountCents',
        amount: 'amountCents',
        status: 'status',
        description: 'description',
      },
      setError: setManualError,
      setFocus: setManualFocus,
    })
  }, [
    errorPresentation,
    mode,
    setManualError,
    setManualFocus,
    setTargetError,
    setTargetFocus,
  ])

  const targetDescriptionRef = targetForm.register('description').ref
  const manualDescriptionRef = manualForm.register('description').ref

  const targetAccountId = targetForm.watch('accountId')
  const manualAccountId = manualForm.watch('accountId')
  const currentAccountId = mode === 'target' ? targetAccountId : manualAccountId

  const liveSelectedAccount = useMemo(() => {
    if (effectiveState?.account) {
      return (
        accounts.find(
          (account) => account.id === effectiveState.account?.id
        ) ?? effectiveState.account
      )
    }

    return (
      activeAccounts.find((account) => account.id === currentAccountId) ?? null
    )
  }, [accounts, activeAccounts, currentAccountId, effectiveState?.account])

  const [cachedSelectedAccount, setCachedSelectedAccount] =
    useState<Account | null>(liveSelectedAccount)

  if (isOpen && liveSelectedAccount !== cachedSelectedAccount) {
    setCachedSelectedAccount(liveSelectedAccount)
  }

  const selectedAccount = isOpen ? liveSelectedAccount : cachedSelectedAccount

  const targetBalanceCents = targetForm.watch('targetBalanceCents')
  const manualDirection = manualForm.watch('direction')
  const manualAmountCents = manualForm.watch('amountCents')
  const manualStatus = manualForm.watch('status')

  const targetDelta =
    selectedAccount && targetBalanceCents !== undefined
      ? computeTargetBalanceDelta(
          selectedAccount.balance.currentCents,
          targetBalanceCents
        )
      : null

  const isTargetSubmitBlocked =
    activeAccounts.length === 0 ||
    createBalanceAdjustmentMutation.isPending ||
    targetDelta?.kind === 'no-change' ||
    targetDelta?.kind === 'overflow'

  const isManualSubmitBlocked =
    activeAccounts.length === 0 || createManualMutation.isPending

  const handleModeChange = (nextMode: BalanceAdjustmentMode) => {
    if (nextMode === mode) {
      return
    }

    resetTargetMutation()
    resetManualMutation()

    if (nextMode === 'manual') {
      const { accountId, description } = targetForm.getValues()
      manualForm.setValue('accountId', accountId)
      manualForm.setValue('description', description ?? '')
      manualForm.clearErrors()
    } else {
      const { accountId, description } = manualForm.getValues()
      targetForm.setValue('accountId', accountId)
      targetForm.setValue('description', description ?? null)
      targetForm.clearErrors()
    }

    setMode(nextMode)
  }

  const handleToggleTargetSign = () => {
    const nextSign = targetSign === 'negative' ? 'positive' : 'negative'
    setTargetSign(nextSign)

    const currentValue = targetForm.getValues('targetBalanceCents')
    if (currentValue !== undefined && currentValue !== 0) {
      const updatedValue =
        nextSign === 'negative'
          ? -Math.abs(currentValue)
          : Math.abs(currentValue)

      if (updatedValue !== currentValue) {
        targetForm.setValue('targetBalanceCents', updatedValue, {
          shouldDirty: true,
          shouldValidate: true,
        })
      }
    }

    targetInputRef.current?.focus()
  }

  const handleTargetValueChange = (nextValue: number | undefined) => {
    const previousValue = targetForm.getValues('targetBalanceCents')

    if (nextValue === undefined) {
      targetForm.setValue('targetBalanceCents', undefined, {
        shouldDirty: true,
        shouldValidate: true,
      })
      return
    }

    if (nextValue < 0) {
      setTargetSign('negative')
      targetForm.setValue('targetBalanceCents', nextValue, {
        shouldDirty: true,
        shouldValidate: true,
      })
      return
    }

    if (
      nextValue > 0 &&
      (previousValue === undefined || previousValue === 0) &&
      targetSign === 'negative'
    ) {
      targetForm.setValue('targetBalanceCents', -nextValue, {
        shouldDirty: true,
        shouldValidate: true,
      })
      return
    }

    if (nextValue > 0) {
      setTargetSign('positive')
    }

    targetForm.setValue('targetBalanceCents', nextValue, {
      shouldDirty: true,
      shouldValidate: true,
    })
  }

  const handleTargetSubmit = targetForm.handleSubmit((values) => {
    if (selectedAccount && values.targetBalanceCents !== undefined) {
      const delta = computeTargetBalanceDelta(
        selectedAccount.balance.currentCents,
        values.targetBalanceCents
      )
      if (delta.kind === 'no-change' || delta.kind === 'overflow') {
        return
      }
    }

    createBalanceAdjustmentMutation.mutate(
      buildCreateBalanceAdjustmentDto(values),
      {
        onSuccess: () => onOpenChange(false),
        onError: (error) => {
          const resolved = resolveApiError(
            error,
            'transactions.balance-adjustment'
          )
          if (resolved.code === API_ERROR_CODES.balanceAdjustmentNoDifference) {
            void queryClient.invalidateQueries({
              queryKey: ACCOUNT_QUERY_KEYS.accounts,
              exact: false,
            })
          }
        },
      }
    )
  })

  const handleManualSubmit = manualForm.handleSubmit((values) => {
    createManualMutation.mutate(buildManualAdjustmentTransactionDto(values), {
      onSuccess: () => onOpenChange(false),
    })
  })

  const activeSubmitHandler =
    mode === 'target' ? handleTargetSubmit : handleManualSubmit

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent
        side={isMobile ? 'bottom' : 'right'}
        className={cn(
          'flex max-h-[calc(100dvh-1rem)] w-full flex-col overflow-hidden border-border bg-card p-0 text-foreground md:h-full md:max-h-none md:rounded-none md:sm:max-w-lg',
          isMobile && 'rounded-t-3xl'
        )}
      >
        <SheetHeader className="border-b border-border px-6 py-5 pr-12 text-left">
          <SheetTitle className="text-foreground">Reajustar saldo</SheetTitle>
          <SheetDescription className="text-muted-foreground">
            Corrija o saldo da conta registrando um lançamento técnico de ajuste.
          </SheetDescription>
        </SheetHeader>

        <form
          className="flex min-h-0 flex-1 flex-col"
          onSubmit={activeSubmitHandler}
          noValidate
        >
          <div className="flex-1 space-y-5 overflow-y-auto px-6 py-5">
          {activeAccounts.length === 0 ? (
            <div
              className="rounded-2xl border border-state-info/35 bg-state-info/10 p-4 text-sm leading-6 text-foreground"
              role="status"
            >
              Ative ou crie pelo menos uma conta antes de registrar um reajuste
              de saldo.
            </div>
          ) : null}

          {isAccountLocked && selectedAccount ? (
            <div className="flex items-center justify-between gap-3 rounded-2xl border border-border bg-secondary p-4">
              <div className="flex min-w-0 items-center gap-3">
                <AccountIdentity account={selectedAccount} size="sm" />
                <div className="min-w-0">
                  <p className="text-xs font-medium text-muted-foreground">
                    Conta selecionada
                  </p>
                  <p className="truncate text-sm font-semibold text-foreground">
                    {selectedAccount.name}
                  </p>
                </div>
              </div>
              <div className="shrink-0 text-right">
                <p className="text-xs font-medium text-muted-foreground">
                  Saldo atual
                </p>
                <p className="numeric text-base font-semibold text-foreground">
                  {formatCurrencyFromCents(
                    selectedAccount.balance.currentCents
                  )}
                </p>
              </div>
            </div>
          ) : (
            <AdjustmentField
              label="Conta"
              error={
                mode === 'target'
                  ? targetForm.formState.errors.accountId?.message
                  : manualForm.formState.errors.accountId?.message
              }
            >
              <Select
                value={currentAccountId}
                onValueChange={(value) => {
                  if (mode === 'target') {
                    targetForm.setValue('accountId', value, {
                      shouldDirty: true,
                      shouldValidate: true,
                    })
                  } else {
                    manualForm.setValue('accountId', value, {
                      shouldDirty: true,
                      shouldValidate: true,
                    })
                  }
                }}
              >
                <SelectTrigger className={inputClassName}>
                  <AccountSelectLabel
                    account={selectedAccount}
                    fallback="Escolha uma conta"
                    trailing={
                      selectedAccount ? (
                        <span className="numeric shrink-0 text-xs text-muted-foreground">
                          {formatCurrencyFromCents(
                            selectedAccount.balance.currentCents
                          )}
                        </span>
                      ) : undefined
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
                      <AccountSelectLabel
                        account={account}
                        trailing={
                          <span className="numeric shrink-0 text-xs text-muted-foreground">
                            {formatCurrencyFromCents(
                              account.balance.currentCents
                            )}
                          </span>
                        }
                      />
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </AdjustmentField>
          )}

          {!isAccountLocked && selectedAccount ? (
            <div className="flex items-center justify-between rounded-xl border border-border bg-secondary/60 px-4 py-3 text-sm">
              <span className="text-muted-foreground">Saldo atual</span>
              <span className="numeric font-semibold text-foreground">
                {formatCurrencyFromCents(selectedAccount.balance.currentCents)}
              </span>
            </div>
          ) : null}

          <div
            role="tablist"
            aria-label="Modo de reajuste de saldo"
            className="grid grid-cols-2 gap-1.5 rounded-xl border border-border bg-secondary p-1"
          >
            <button
              type="button"
              role="tab"
              aria-selected={mode === 'target'}
              className={cn(
                'min-h-11 rounded-lg px-3 py-2 text-xs font-medium transition focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring sm:text-sm',
                mode === 'target'
                  ? 'bg-card text-foreground shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              )}
              onClick={() => handleModeChange('target')}
            >
              Informar novo saldo
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={mode === 'manual'}
              className={cn(
                'min-h-11 rounded-lg px-3 py-2 text-xs font-medium transition focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring sm:text-sm',
                mode === 'manual'
                  ? 'bg-card text-foreground shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              )}
              onClick={() => handleModeChange('manual')}
            >
              Informar valor do ajuste
            </button>
          </div>

          {mode === 'target' ? (
            <div className="space-y-5">
              <AdjustmentField
                label="Novo saldo"
                htmlFor="balance-adjustment-target-amount"
                helper="Digite − ou toque em +/− para saldo negativo."
                error={targetForm.formState.errors.targetBalanceCents?.message}
              >
                <div className="relative flex items-center">
                  <CurrencyInput
                    id="balance-adjustment-target-amount"
                    ref={targetInputRef}
                    allowNegative
                    valueCents={targetBalanceCents}
                    onValueCentsChange={handleTargetValueChange}
                    onKeyDown={(event) => {
                      if (event.key === '-') {
                        setTargetSign('negative')
                      } else if (event.key === '+') {
                        setTargetSign('positive')
                      }
                    }}
                    placeholder={isTargetNegative ? '-R$ 0,00' : 'R$ 0,00'}
                    className={cn(
                      inputClassName,
                      'pr-16 text-base font-medium',
                      isTargetNegative && 'text-state-expense'
                    )}
                    aria-label="Novo saldo"
                    aria-invalid={Boolean(
                      targetForm.formState.errors.targetBalanceCents
                    )}
                  />
                  <button
                    type="button"
                    aria-label="Alternar sinal do novo saldo"
                    aria-pressed={isTargetNegative}
                    title="Alternar entre positivo e negativo (teclas − ou +)"
                    className={cn(
                      'absolute right-2 inline-flex h-8 min-w-10 items-center justify-center rounded-lg border px-2.5 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                      isTargetNegative
                        ? 'border-state-expense/40 bg-state-expense/10 text-state-expense hover:bg-state-expense/15'
                        : 'border-border/80 bg-card/80 text-muted-foreground hover:bg-accent hover:text-foreground'
                    )}
                    onClick={handleToggleTargetSign}
                  >
                    +/−
                  </button>
                </div>
              </AdjustmentField>

              {selectedAccount ? (
                <BalanceAdjustmentPreview
                  mode="target"
                  currentCents={selectedAccount.balance.currentCents}
                  targetBalanceCents={targetBalanceCents}
                />
              ) : null}

              <AdjustmentField
                label="Motivo (opcional)"
                htmlFor="balance-adjustment-target-reason"
                error={targetForm.formState.errors.description?.message}
                helper='Se ficar em branco, será salvo como "Reajuste de saldo".'
              >
                <Input
                  id="balance-adjustment-target-reason"
                  ref={targetDescriptionRef}
                  className={inputClassName}
                  maxLength={BALANCE_ADJUSTMENT_DESCRIPTION_MAX_LENGTH}
                  placeholder="Ex.: Conferência com extrato bancário"
                  value={targetForm.watch('description') ?? ''}
                  onChange={(event) =>
                    targetForm.setValue('description', event.target.value, {
                      shouldDirty: true,
                      shouldValidate: true,
                    })
                  }
                />
              </AdjustmentField>

              {errorPresentation ? (
                <ApiErrorAlert error={errorPresentation} />
              ) : null}
            </div>
          ) : (
            <div className="space-y-5">
              <AdjustmentField
                label="Direção"
                error={manualForm.formState.errors.direction?.message}
              >
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    aria-pressed={manualDirection === 'INCREASE'}
                    className={cn(
                      'min-h-11 gap-2 rounded-xl border-border bg-secondary text-foreground hover:bg-accent hover:text-foreground',
                      manualDirection === 'INCREASE' &&
                        'border-state-income/50 bg-state-income/10 text-state-income hover:bg-state-income/15 hover:text-state-income'
                    )}
                    onClick={() =>
                      manualForm.setValue('direction', 'INCREASE', {
                        shouldDirty: true,
                        shouldValidate: true,
                      })
                    }
                  >
                    <TrendingUp className="h-4 w-4" />
                    <span>Aumentar saldo (+)</span>
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    aria-pressed={manualDirection === 'DECREASE'}
                    className={cn(
                      'min-h-11 gap-2 rounded-xl border-border bg-secondary text-foreground hover:bg-accent hover:text-foreground',
                      manualDirection === 'DECREASE' &&
                        'border-state-expense/50 bg-state-expense/10 text-state-expense hover:bg-state-expense/15 hover:text-state-expense'
                    )}
                    onClick={() =>
                      manualForm.setValue('direction', 'DECREASE', {
                        shouldDirty: true,
                        shouldValidate: true,
                      })
                    }
                  >
                    <TrendingDown className="h-4 w-4" />
                    <span>Reduzir saldo (−)</span>
                  </Button>
                </div>
              </AdjustmentField>

              <AdjustmentField
                label="Valor do ajuste"
                htmlFor="balance-adjustment-manual-amount"
                error={manualForm.formState.errors.amountCents?.message}
              >
                <CurrencyInput
                  id="balance-adjustment-manual-amount"
                  valueCents={manualAmountCents}
                  onValueCentsChange={(value) =>
                    manualForm.setValue('amountCents', value, {
                      shouldDirty: true,
                      shouldValidate: true,
                    })
                  }
                  className={inputClassName}
                  aria-label="Valor do ajuste"
                  aria-invalid={Boolean(
                    manualForm.formState.errors.amountCents
                  )}
                />
              </AdjustmentField>

              {selectedAccount ? (
                <BalanceAdjustmentPreview
                  mode="manual"
                  currentCents={selectedAccount.balance.currentCents}
                  amountCents={manualAmountCents}
                  direction={manualDirection}
                  status={manualStatus}
                />
              ) : null}

              <AdjustmentField
                label="Situação"
                error={manualForm.formState.errors.status?.message}
              >
                <button
                  type="button"
                  role="switch"
                  aria-checked={manualStatus === 'EFFECTIVE'}
                  className="flex min-h-11 w-full items-center justify-between gap-3 rounded-xl border border-border bg-secondary px-3 text-left transition hover:bg-accent focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-secondary"
                  onClick={() =>
                    manualForm.setValue(
                      'status',
                      manualStatus === 'EFFECTIVE' ? 'PENDING' : 'EFFECTIVE',
                      { shouldDirty: true, shouldValidate: true }
                    )
                  }
                >
                  <span className="flex min-w-0 items-center gap-2 text-sm font-medium text-foreground">
                    {manualStatus === 'EFFECTIVE' ? (
                      <CheckCircle2 className="h-4 w-4 text-state-info" />
                    ) : (
                      <Clock3 className="h-4 w-4 text-state-info" />
                    )}
                    <span className="truncate">
                      {manualStatus === 'EFFECTIVE'
                        ? 'Efetivar agora'
                        : 'Pendente'}
                    </span>
                  </span>
                  <span
                    className={cn(
                      'relative h-5 w-9 rounded-full transition',
                      manualStatus === 'EFFECTIVE'
                        ? 'bg-state-info'
                        : 'bg-accent'
                    )}
                  >
                    <span
                      className={cn(
                        'absolute top-0.5 h-4 w-4 rounded-full bg-foreground transition',
                        manualStatus === 'EFFECTIVE'
                          ? 'translate-x-4'
                          : 'translate-x-0.5'
                      )}
                    />
                  </span>
                </button>
              </AdjustmentField>

              <AdjustmentField
                label="Motivo"
                htmlFor="balance-adjustment-manual-reason"
                error={manualForm.formState.errors.description?.message}
              >
                <Input
                  id="balance-adjustment-manual-reason"
                  ref={manualDescriptionRef}
                  className={inputClassName}
                  maxLength={BALANCE_ADJUSTMENT_DESCRIPTION_MAX_LENGTH}
                  placeholder="Ex.: Ajuste de tarifa ou diferença de extrato"
                  aria-invalid={Boolean(
                    manualForm.formState.errors.description
                  )}
                  value={manualForm.watch('description') ?? ''}
                  onChange={(event) =>
                    manualForm.setValue('description', event.target.value, {
                      shouldDirty: true,
                      shouldValidate: true,
                    })
                  }
                />
              </AdjustmentField>

              {errorPresentation ? (
                <ApiErrorAlert error={errorPresentation} />
              ) : null}
            </div>
          )}
        </div>

        <SheetFooter
          className={cn(
            'gap-2 border-t border-border px-6 py-4',
            isMobile && 'pb-[max(env(safe-area-inset-bottom),1rem)]'
          )}
        >
          <Button
            type="button"
            variant="outline"
            className="min-h-11 rounded-xl border-border bg-secondary text-foreground hover:bg-accent hover:text-foreground"
            onClick={() => onOpenChange(false)}
          >
            Cancelar
          </Button>
          {mode === 'target' ? (
            <Button
              type="submit"
              className="min-h-11 rounded-xl bg-brand px-4 text-brand-foreground hover:bg-brand/90"
              disabled={isTargetSubmitBlocked}
            >
              {createBalanceAdjustmentMutation.isPending
                ? 'Aplicando reajuste...'
                : 'Aplicar reajuste'}
            </Button>
          ) : (
            <Button
              type="submit"
              className="min-h-11 rounded-xl bg-brand px-4 text-brand-foreground hover:bg-brand/90"
              disabled={isManualSubmitBlocked}
            >
              {createManualMutation.isPending
                ? 'Registrando ajuste...'
                : 'Registrar ajuste'}
            </Button>
          )}
        </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  )
}

interface AdjustmentFieldProps {
  label: string
  htmlFor?: string
  error?: string
  helper?: string
  children: ReactNode
}

function AdjustmentField({
  label,
  htmlFor,
  error,
  helper,
  children,
}: AdjustmentFieldProps) {
  return (
    <div className="space-y-2">
      {htmlFor ? (
        <label
          htmlFor={htmlFor}
          className="block text-sm font-medium text-foreground"
        >
          {label}
        </label>
      ) : (
        <span className="block text-sm font-medium text-foreground">
          {label}
        </span>
      )}
      {children}
      {helper && !error ? (
        <span className="block text-xs text-muted-foreground">{helper}</span>
      ) : null}
      {error ? (
        <span className="block text-xs font-medium text-destructive">
          {error}
        </span>
      ) : null}
    </div>
  )
}
