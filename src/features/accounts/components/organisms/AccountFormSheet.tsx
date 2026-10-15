import { useEffect, useRef, useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { ChevronLeft, Landmark } from 'lucide-react'
import { Controller, useForm } from 'react-hook-form'
import { useCreateAccount, useUpdateAccount } from '../../api/mutations'
import { ACCOUNT_COLOR_OPTIONS } from '../../constants/account.constants'
import {
  accountFormSchema,
  type AccountFormValues,
} from '../../schemas/account.schema'
import type { AccountSheetState } from '../../types/account-ui.types'
import type {
  Account,
  AccountTemplate,
  CreateAccountDto,
  UpdateAccountDto,
} from '../../types/account.types'
import {
  getAccountColorToken,
  getAccountIconOption,
  getAccountTypeLabel,
} from '../../utils/account.utils'
import { CurrencyInput } from '@/shared/components/atoms/CurrencyInput'
import { ApiErrorAlert } from '@/shared/components/molecules/ApiErrorAlert'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/shared/components/ui/sheet'
import { Switch } from '@/shared/components/ui/switch'
import { applyApiFieldErrors, resolveApiError } from '@/shared/errors'
import { useIsMobile } from '@/shared/hooks/use-mobile'
import { Button } from '@/shared/lib/button'
import { Input } from '@/shared/lib/input'
import { cn } from '@/shared/lib/utils'
import { formatCurrencyFromCents } from '@/shared/utils/formatters'
import { AccountFormField } from '../molecules/AccountFormField'
import { AccountFormIdentityHeader } from '../molecules/AccountFormIdentityHeader'
import { AccountTemplatePicker } from './AccountTemplatePicker'
import { CustomAccountIdentityFields } from './CustomAccountIdentityFields'

interface AccountFormSheetProps {
  state: AccountSheetState
  onOpenChange: (isOpen: boolean) => void
}

type AccountFormStep = 'picker' | 'form'

export function AccountFormSheet({
  state,
  onOpenChange,
}: AccountFormSheetProps) {
  const isMobile = useIsMobile()
  const createMutation = useCreateAccount()
  const updateMutation = useUpdateAccount()
  const [step, setStep] = useState<AccountFormStep>('picker')
  const [selectedTemplate, setSelectedTemplate] =
    useState<AccountTemplate | null>(null)
  const pickerTitleRef = useRef<HTMLHeadingElement>(null)
  const formTitleRef = useRef<HTMLHeadingElement>(null)
  const editingAccount = state?.mode === 'edit' ? state.account : null
  const isEditing = editingAccount !== null
  const isInstitutional =
    selectedTemplate?.type === 'INSTITUTIONAL' ||
    editingAccount?.template?.type === 'INSTITUTIONAL'

  const form = useForm<AccountFormValues>({
    resolver: zodResolver(accountFormSchema),
    mode: 'onChange',
    defaultValues: getAccountFormDefaults(state),
  })
  const resetForm = form.reset
  const resetCreateMutation = createMutation.reset
  const resetUpdateMutation = updateMutation.reset

  useEffect(() => {
    if (!state) return

    const accountTemplate =
      state.mode === 'edit' && state.account.template?.type === 'INSTITUTIONAL'
        ? state.account.template
        : null

    setSelectedTemplate(accountTemplate)
    setStep(state.mode === 'create' ? 'picker' : 'form')
    resetForm(getAccountFormDefaults(state))
    resetCreateMutation()
    resetUpdateMutation()
  }, [state, resetCreateMutation, resetForm, resetUpdateMutation])

  useEffect(() => {
    const target =
      step === 'picker' ? pickerTitleRef.current : formTitleRef.current
    target?.focus()
  }, [step])

  const mutation = isEditing ? updateMutation : createMutation
  const errorPresentation = mutation.error
    ? resolveApiError(
        mutation.error,
        isEditing ? 'accounts.update' : 'accounts.create'
      )
    : null

  const handleInstitutionalSelect = (template: AccountTemplate) => {
    setSelectedTemplate(template)
    form.reset({
      creationKind: 'institutional',
      name: template.name,
      type: 'BANK',
      initialBalanceCents: undefined,
      templateId: template.id,
      colorToken: null,
      iconKey: null,
      includeInTotal: true,
      isDefault: false,
    })
    setStep('form')
  }

  const handleCustomSelect = () => {
    setSelectedTemplate(null)
    form.reset(getCreateCustomDefaults())
    setStep('form')
  }

  const handleBack = () => {
    createMutation.reset()
    setStep('picker')
  }

  const applyFieldErrors = (error: unknown) => {
    const presentation = resolveApiError(
      error,
      isEditing ? 'accounts.update' : 'accounts.create'
    )

    applyApiFieldErrors<AccountFormValues>({
      fieldErrors: presentation.fieldErrors,
      fieldMap: {
        name: 'name',
        type: 'type',
        initialBalanceCents: 'initialBalanceCents',
        templateId: 'templateId',
        'template.templateId': 'templateId',
        colorToken: 'colorToken',
        'template.colorToken': 'colorToken',
        iconKey: 'iconKey',
        'template.iconKey': 'iconKey',
        includeInTotal: 'includeInTotal',
        isDefault: 'isDefault',
      },
      setError: form.setError,
      setFocus: form.setFocus,
    })
  }

  const submit = form.handleSubmit((values) => {
    if (state?.mode === 'edit') {
      const dto = buildUpdateAccountDto(state.account, values)

      if (Object.keys(dto).length === 0) return

      updateMutation.mutate(
        { accountId: state.account.id, dto },
        {
          onSuccess: () => onOpenChange(false),
          onError: applyFieldErrors,
        }
      )
      return
    }

    const dto: CreateAccountDto = {
      name: values.name.trim(),
      type: 'BANK',
      initialBalanceCents: values.initialBalanceCents,
      template:
        values.creationKind === 'institutional'
          ? { type: 'institutional', templateId: values.templateId ?? '' }
          : {
              type: 'custom',
              colorToken: values.colorToken ?? null,
              iconKey: values.iconKey ?? null,
            },
      includeInTotal: values.includeInTotal,
      isDefault: false,
    }

    createMutation.mutate(dto, {
      onSuccess: () => onOpenChange(false),
      onError: applyFieldErrors,
    })
  })

  const formTitle = isEditing
    ? isInstitutional
      ? 'Editar conta'
      : 'Conta personalizada'
    : isInstitutional
      ? 'Nova conta'
      : 'Conta personalizada'

  const showCreatePicker = state?.mode === 'create'
  const showForm = state?.mode === 'edit' || step === 'form'

  return (
    <Sheet open={state !== null} onOpenChange={onOpenChange}>
      <SheetContent
        side={isMobile ? 'bottom' : 'right'}
        className={cn(
          'flex overflow-hidden border-app-border bg-app-surface p-0 text-app-text',
          isMobile ? 'h-[92dvh] rounded-t-3xl' : 'h-full w-full sm:max-w-lg'
        )}
      >
        <div className="relative min-h-0 flex-1 overflow-hidden">
          {showCreatePicker ? (
            <section
              className={cn(
                'absolute inset-0 flex min-h-0 flex-col gap-5 px-4 pb-[max(env(safe-area-inset-bottom),1rem)] pt-5 transition duration-200 ease-out motion-reduce:transform-none motion-reduce:transition-none sm:px-6 sm:pb-6 sm:pt-6',
                step === 'picker'
                  ? 'translate-x-0 opacity-100'
                  : 'pointer-events-none -translate-x-8 opacity-0'
              )}
              aria-hidden={step !== 'picker'}
            >
              <SheetHeader className="shrink-0 pr-9 text-left">
                <SheetTitle ref={pickerTitleRef} tabIndex={-1}>
                  Escolha como criar
                </SheetTitle>
                <SheetDescription className="text-app-muted">
                  Use a identidade de uma instituição ou personalize sua conta.
                </SheetDescription>
              </SheetHeader>

              <AccountTemplatePicker
                enabled={state?.mode === 'create'}
                onSelect={handleInstitutionalSelect}
                onSelectCustom={handleCustomSelect}
              />
            </section>
          ) : null}

          <section
            className={cn(
              'absolute inset-0 flex min-h-0 flex-col px-4 pb-[max(env(safe-area-inset-bottom),1rem)] pt-5 transition duration-200 ease-out motion-reduce:transform-none motion-reduce:transition-none sm:px-6 sm:pb-6 sm:pt-6',
              showForm
                ? 'translate-x-0 opacity-100'
                : 'pointer-events-none translate-x-8 opacity-0'
            )}
            aria-hidden={!showForm}
          >
            <SheetHeader className="shrink-0 pr-9 text-left">
              <div className="flex items-center gap-2">
                {!isEditing ? (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-10 w-10 shrink-0 rounded-full text-app-muted hover:bg-app-elevated hover:text-app-text"
                    onClick={handleBack}
                    aria-label="Voltar para escolha de conta"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </Button>
                ) : null}
                <div className="min-w-0">
                  <SheetTitle ref={formTitleRef} tabIndex={-1}>
                    {formTitle}
                  </SheetTitle>
                  <SheetDescription className="sr-only">
                    {isEditing
                      ? 'Atualize os dados desta conta.'
                      : 'Informe os dados para criar sua conta.'}
                  </SheetDescription>
                </div>
              </div>
            </SheetHeader>

            <form
              className="mt-5 flex min-h-0 flex-1 flex-col"
              onSubmit={submit}
            >
              <div className="-mx-1 min-h-0 flex-1 space-y-5 overflow-y-auto overscroll-contain px-1 pb-1">
                <AccountFormIdentityHeader
                  account={editingAccount}
                  template={selectedTemplate}
                  isInstitutional={isInstitutional}
                />

                <AccountFormField
                  label="Nome"
                  htmlFor="account-name"
                  error={form.formState.errors.name?.message}
                >
                  <Input
                    id="account-name"
                    autoComplete="off"
                    placeholder="Minha conta"
                    className="h-12 rounded-xl border-app-border bg-app-panel text-app-text placeholder:text-app-muted"
                    aria-invalid={Boolean(form.formState.errors.name)}
                    {...form.register('name')}
                  />
                </AccountFormField>

                <AccountFormField label="Tipo">
                  <div className="flex min-h-12 items-center gap-3 rounded-xl border border-app-border bg-app-panel px-3 text-sm text-app-text">
                    <Landmark className="h-4 w-4 text-app-muted" />
                    {getAccountTypeLabel(form.watch('type'))}
                  </div>
                </AccountFormField>

                {isEditing && editingAccount ? (
                  <AccountFormField label="Saldo inicial">
                    <div className="numeric flex min-h-12 items-center rounded-xl border border-app-border bg-app-panel px-3 text-sm text-app-muted">
                      {formatCurrencyFromCents(
                        editingAccount.initialBalanceCents
                      )}
                    </div>
                  </AccountFormField>
                ) : (
                  <AccountFormField
                    label="Saldo inicial"
                    htmlFor="account-initial-balance"
                    error={form.formState.errors.initialBalanceCents?.message}
                  >
                    <Controller
                      name="initialBalanceCents"
                      control={form.control}
                      render={({ field }) => (
                        <CurrencyInput
                          id="account-initial-balance"
                          valueCents={field.value}
                          onValueCentsChange={field.onChange}
                          onBlur={field.onBlur}
                          ref={field.ref}
                          className="h-12 rounded-xl border-app-border bg-app-panel text-app-text placeholder:text-app-muted"
                          aria-invalid={Boolean(
                            form.formState.errors.initialBalanceCents
                          )}
                        />
                      )}
                    />
                  </AccountFormField>
                )}

                {!isInstitutional ? (
                  <CustomAccountIdentityFields form={form} />
                ) : null}

                <Controller
                  name="includeInTotal"
                  control={form.control}
                  render={({ field }) => (
                    <div className="flex min-h-20 items-center justify-between gap-4 rounded-2xl border border-app-border bg-app-panel p-4">
                      <label
                        htmlFor="account-include-total"
                        className="min-w-0"
                      >
                        <span className="block text-sm font-medium text-app-text">
                          Incluir nos totais
                        </span>
                        <span className="mt-1 block text-xs leading-5 text-app-muted">
                          Considere esta conta no saldo geral e nos relatórios.
                        </span>
                      </label>
                      <Switch
                        id="account-include-total"
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        onBlur={field.onBlur}
                        ref={field.ref}
                        aria-label="Incluir esta conta nos totais"
                      />
                    </div>
                  )}
                />

                {errorPresentation ? (
                  <ApiErrorAlert error={errorPresentation} />
                ) : null}
              </div>

              <SheetFooter className="mt-4 shrink-0 gap-2 border-t border-app-border pt-4">
                <Button
                  type="button"
                  variant="outline"
                  className="h-11 rounded-xl border-app-border bg-app-panel text-app-text hover:bg-app-elevated hover:text-app-text"
                  onClick={() => onOpenChange(false)}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  className="h-11 rounded-xl bg-brand px-4 text-brand-foreground hover:bg-brand/90"
                  disabled={
                    mutation.isPending ||
                    !form.formState.isValid ||
                    (isEditing && !form.formState.isDirty)
                  }
                >
                  {mutation.isPending
                    ? isEditing
                      ? 'Salvando...'
                      : 'Criando...'
                    : isEditing
                      ? 'Salvar alterações'
                      : 'Criar conta'}
                </Button>
              </SheetFooter>
            </form>
          </section>
        </div>
      </SheetContent>
    </Sheet>
  )
}

const getCreateCustomDefaults = (): AccountFormValues => ({
  creationKind: 'custom',
  name: '',
  type: 'BANK',
  initialBalanceCents: undefined,
  templateId: undefined,
  colorToken: ACCOUNT_COLOR_OPTIONS[0].value,
  iconKey: 'landmark',
  includeInTotal: true,
  isDefault: false,
})

const getAccountFormDefaults = (
  state: AccountSheetState
): AccountFormValues => {
  if (state?.mode !== 'edit') return getCreateCustomDefaults()

  const account = state.account
  const isInstitutional = account.template?.type === 'INSTITUTIONAL'
  const colorToken = getAccountColorToken(account)
  const iconKey = account.template?.iconKey ?? account.icon

  return {
    creationKind: isInstitutional ? 'institutional' : 'custom',
    name: account.name,
    type: account.type,
    initialBalanceCents: undefined,
    templateId: isInstitutional ? (account.templateId ?? undefined) : undefined,
    colorToken:
      ACCOUNT_COLOR_OPTIONS.find((option) => option.value === colorToken)
        ?.value ?? ACCOUNT_COLOR_OPTIONS[0].value,
    iconKey: getAccountIconOption(iconKey)?.value ?? 'wallet',
    includeInTotal: account.includeInTotal,
    isDefault: account.isDefault,
  }
}

const buildUpdateAccountDto = (
  account: Account,
  values: AccountFormValues
): UpdateAccountDto => {
  const dto: UpdateAccountDto = {}
  const nextName = values.name.trim()

  if (nextName !== account.name) dto.name = nextName
  if (values.includeInTotal !== account.includeInTotal) {
    dto.includeInTotal = values.includeInTotal
  }

  if (account.template?.type !== 'INSTITUTIONAL') {
    const currentColor = getAccountColorToken(account)
    const currentIcon = account.template?.iconKey ?? account.icon
    const nextColor = values.colorToken ?? null
    const nextIcon = values.iconKey ?? null

    if (
      account.template === null ||
      currentColor !== nextColor ||
      currentIcon !== nextIcon
    ) {
      dto.template = {
        type: 'custom',
        colorToken: nextColor,
        iconKey: nextIcon,
      }
    }
  }

  return dto
}
