import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import {
  AlertTriangle,
  ArrowLeft,
  Camera,
  CheckCircle2,
  ChevronDown,
  Clock3,
  ImagePlus,
  Keyboard,
  Loader2,
  QrCode,
  RefreshCw,
} from 'lucide-react'
import { CurrencyInput } from '@/shared/components/atoms/CurrencyInput'
import { ApiErrorAlert } from '@/shared/components/molecules/ApiErrorAlert'
import { DateOnlyPicker } from '@/shared/components/molecules/DateOnlyPicker'
import { Button } from '@/shared/components/ui/button'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/shared/components/ui/collapsible'
import { Input } from '@/shared/components/ui/input'
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
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/shared/components/ui/tabs'
import { applyApiFieldErrors, resolveApiError } from '@/shared/errors'
import { useIsMobile } from '@/shared/hooks/use-mobile'
import { toast } from '@/shared/hooks/use-toast'
import { cn } from '@/shared/lib/utils'
import {
  formatDateOnlyForDisplay,
  getTodayDateOnly,
  getYesterdayDateOnly,
} from '@/shared/utils/dateOnly'
import {
  formatCurrencyFromCents,
  formatDateTime,
} from '@/shared/utils/formatters'
import {
  useImportFiscalNote,
  useLinkFiscalNote,
  usePreviewFiscalNote,
} from '../../api/mutations'
import { FISCAL_NOTE_DESCRIPTION_MAX_LENGTH } from '../../constants/fiscal-notes.constants'
import { useRetryCountdown } from '../../hooks/useRetryCountdown'
import {
  type FiscalNoteImportFormValues,
  fiscalNoteImportSchema,
} from '../../schemas/fiscalNoteImport.schema'
import type {
  FiscalNoteAlreadyImportedDetails,
  FiscalNoteDetail,
  FiscalNoteImportResponse,
  FiscalNotePreviewResponse,
} from '../../types/fiscal-note.types'
import type {
  FiscalNoteAccountOption,
  FiscalNoteAttachmentsFieldRenderer,
  FiscalNoteCaptureTab,
  FiscalNoteCategoryOption,
  FiscalNoteLinkTarget,
  FiscalNoteReaderStep,
} from '../../types/fiscal-note-ui.types'
import {
  getFiscalNoteRetryAfterSeconds,
  parseFiscalNoteAlreadyImportedDetails,
} from '../../utils/fiscalNoteError.utils'
import {
  computeFiscalNoteDivergence,
  formatCnpj,
  formatFiscalNoteNumberAndSeries,
} from '../../utils/fiscalNoteFormat.utils'
import { parseFiscalNoteInput } from '../../utils/fiscalNoteInput.utils'
import { FiscalNoteBadge } from '../atoms/FiscalNoteBadge'
import { FiscalNoteAccessKeyField } from '../molecules/FiscalNoteAccessKeyField'
import { FiscalNoteDivergenceAlert } from '../molecules/FiscalNoteDivergenceAlert'
import { FiscalNoteDuplicateBanner } from '../molecules/FiscalNoteDuplicateBanner'
import { FiscalNoteImageUploadPane } from '../molecules/FiscalNoteImageUploadPane'
import { FiscalNotePaymentsList } from '../molecules/FiscalNotePaymentsList'
import { FiscalNoteTotalsCard } from '../molecules/FiscalNoteTotalsCard'
import { FiscalNoteItemsList } from './FiscalNoteItemsList'
import { FiscalNoteQrScannerPane } from './FiscalNoteQrScannerPane'

interface FiscalNoteReaderSheetBaseProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onOpenExistingTransaction?: (transactionId: string) => void
  isOpeningExistingTransaction?: boolean
}

export interface FiscalNoteReaderImportProps
  extends FiscalNoteReaderSheetBaseProps {
  mode: 'import'
  accounts: FiscalNoteAccountOption[]
  categories: FiscalNoteCategoryOption[]
  renderAttachmentsField?: FiscalNoteAttachmentsFieldRenderer
  onAfterImport?: (result: FiscalNoteImportResponse) => Promise<void> | void
}

export interface FiscalNoteReaderLinkProps
  extends FiscalNoteReaderSheetBaseProps {
  mode: 'link'
  linkTarget: FiscalNoteLinkTarget
  onLinked?: (fiscalNote: FiscalNoteDetail) => void
}

export type FiscalNoteReaderSheetProps =
  | FiscalNoteReaderImportProps
  | FiscalNoteReaderLinkProps

const inputClassName =
  'h-11 rounded-xl border-border bg-secondary text-foreground placeholder:text-muted-foreground focus:ring-0 focus:ring-offset-0 focus-visible:ring-0 focus-visible:ring-offset-0'

const prefersCameraViewport = (isMobileHook: boolean): boolean => {
  if (isMobileHook) {
    return true
  }

  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return false
  }

  return (
    window.matchMedia('(max-width: 767px)').matches ||
    window.matchMedia('(pointer: coarse)').matches
  )
}

/**
 * Responsive two-step sheet for capturing an NFC-e (camera, image, or manual),
 * inspecting SEFAZ-CE preview data, and importing or linking to an expense.
 */
export function FiscalNoteReaderSheet(props: FiscalNoteReaderSheetProps) {
  const {
    open,
    onOpenChange,
    onOpenExistingTransaction,
    isOpeningExistingTransaction = false,
  } = props

  const isMobile = useIsMobile()
  const previewMutation = usePreviewFiscalNote()
  const importMutation = useImportFiscalNote()
  const linkMutation = useLinkFiscalNote()
  const retryCountdown = useRetryCountdown()

  const resetPreview = previewMutation.reset
  const resetImport = importMutation.reset
  const resetLink = linkMutation.reset
  const resetCountdown = retryCountdown.reset
  const startCountdown = retryCountdown.start

  const hasUserSelectedTabRef = useRef(false)
  const wasOpenRef = useRef(false)

  const [activeTab, setActiveTab] = useState<FiscalNoteCaptureTab>(() =>
    prefersCameraViewport(isMobile) ? 'camera' : 'manual'
  )
  const [step, setStep] = useState<FiscalNoteReaderStep>('capture')
  const [manualInput, setManualInput] = useState('')
  const [localInputError, setLocalInputError] = useState<string | null>(null)
  const [submittedInput, setSubmittedInput] = useState('')
  const [previewData, setPreviewData] =
    useState<FiscalNotePreviewResponse | null>(null)
  const [concurrentDuplicate, setConcurrentDuplicate] =
    useState<FiscalNoteAlreadyImportedDetails | null>(null)
  const [isRunningAfterImport, setIsRunningAfterImport] = useState(false)
  const [itemsOpen, setItemsOpen] = useState(false)

  const rawAccounts = props.mode === 'import' ? props.accounts : null
  const rawCategories = props.mode === 'import' ? props.categories : null

  const activeAccounts = useMemo(
    () =>
      rawAccounts ? rawAccounts.filter((account) => !account.isArchived) : [],
    [rawAccounts]
  )

  const expenseCategories = useMemo(
    () =>
      rawCategories
        ? rawCategories.filter(
            (category) => !category.isArchived && category.type === 'EXPENSE'
          )
        : [],
    [rawCategories]
  )

  const defaultAccountId = useMemo(
    () => activeAccounts.find((account) => account.isDefault)?.id ?? '',
    [activeAccounts]
  )

  const form = useForm<FiscalNoteImportFormValues>({
    resolver: zodResolver(fiscalNoteImportSchema),
    defaultValues: {
      accountId: '',
      categoryId: '',
      amountCents: 0,
      date: getTodayDateOnly(),
      description: '',
      status: 'EFFECTIVE',
    },
  })
  const resetForm = form.reset
  const setFormError = form.setError
  const setFormFocus = form.setFocus

  useLayoutEffect(() => {
    const justOpened = open && !wasOpenRef.current
    wasOpenRef.current = open

    if (!justOpened) {
      return
    }

    hasUserSelectedTabRef.current = false
    setActiveTab(prefersCameraViewport(isMobile) ? 'camera' : 'manual')
    setStep('capture')
    setManualInput('')
    setLocalInputError(null)
    setSubmittedInput('')
    setPreviewData(null)
    setConcurrentDuplicate(null)
    setIsRunningAfterImport(false)
    setItemsOpen(false)
    resetPreview()
    resetImport()
    resetLink()
    resetCountdown()
  }, [
    isMobile,
    open,
    resetCountdown,
    resetImport,
    resetLink,
    resetPreview,
  ])

  useEffect(() => {
    if (open && !hasUserSelectedTabRef.current) {
      setActiveTab(prefersCameraViewport(isMobile) ? 'camera' : 'manual')
    }
  }, [isMobile, open])

  useEffect(() => {
    if (!previewData || props.mode !== 'import') {
      return
    }

    resetForm({
      accountId: defaultAccountId,
      categoryId: '',
      amountCents: previewData.suggestedTransaction.amountCents,
      date: previewData.suggestedTransaction.date,
      description: previewData.suggestedTransaction.description,
      status: previewData.suggestedTransaction.status,
    })
  }, [defaultAccountId, previewData, props.mode, resetForm])

  const previewError = previewMutation.error
  useEffect(() => {
    if (!previewError) {
      return
    }

    const retrySeconds = getFiscalNoteRetryAfterSeconds(previewError)
    if (retrySeconds !== null && retrySeconds > 0) {
      startCountdown(retrySeconds)
    }

    const duplicate = parseFiscalNoteAlreadyImportedDetails(previewError)
    if (duplicate) {
      setConcurrentDuplicate(duplicate)
    }
  }, [previewError, startCountdown])

  const importError = importMutation.error
  const importErrorPresentation = useMemo(
    () =>
      importError ? resolveApiError(importError, 'fiscal-notes.import') : null,
    [importError]
  )

  useEffect(() => {
    if (!importError) {
      return
    }

    const duplicate = parseFiscalNoteAlreadyImportedDetails(importError)
    if (duplicate) {
      setConcurrentDuplicate(duplicate)
      return
    }

    if (importErrorPresentation) {
      applyApiFieldErrors<FiscalNoteImportFormValues>({
        fieldErrors: importErrorPresentation.fieldErrors,
        fieldMap: {
          accountId: 'accountId',
          categoryId: 'categoryId',
          amountCents: 'amountCents',
          date: 'date',
          description: 'description',
          status: 'status',
        },
        setError: setFormError,
        setFocus: setFormFocus,
      })
    }
  }, [importError, importErrorPresentation, setFormError, setFormFocus])

  const linkError = linkMutation.error
  useEffect(() => {
    if (!linkError) {
      return
    }

    const duplicate = parseFiscalNoteAlreadyImportedDetails(linkError)
    if (duplicate) {
      setConcurrentDuplicate(duplicate)
    }
  }, [linkError])

  const previewErrorPresentation = useMemo(
    () =>
      previewError
        ? resolveApiError(previewError, 'fiscal-notes.preview')
        : null,
    [previewError]
  )

  const linkErrorPresentation = useMemo(
    () => (linkError ? resolveApiError(linkError, 'fiscal-notes.link') : null),
    [linkError]
  )

  const handleSelectTab = useCallback((nextTab: string) => {
    if (nextTab !== 'camera' && nextTab !== 'image' && nextTab !== 'manual') {
      return
    }

    hasUserSelectedTabRef.current = true
    setActiveTab(nextTab)
    setLocalInputError(null)
  }, [])

  const submitPreviewInput = useCallback(
    async (rawInput: string) => {
      if (previewMutation.isPending || retryCountdown.isCountingDown) {
        return
      }

      const parsed = parseFiscalNoteInput(rawInput)
      if (!parsed.valid) {
        setLocalInputError(parsed.error)
        return
      }

      setLocalInputError(null)
      setConcurrentDuplicate(null)
      resetPreview()

      try {
        const response = await previewMutation.mutateAsync({
          input: parsed.data.normalizedInput,
        })
        setSubmittedInput(parsed.data.normalizedInput)
        setPreviewData(response)
        setItemsOpen(false)
        setStep('preview')
      } catch {
        setSubmittedInput(parsed.data.normalizedInput)
      }
    },
    [previewMutation, resetPreview, retryCountdown.isCountingDown]
  )

  const handleManualSubmit = () => {
    void submitPreviewInput(manualInput)
  }

  const handleRetryPreview = () => {
    if (!submittedInput || retryCountdown.isCountingDown) {
      return
    }
    void submitPreviewInput(submittedInput)
  }

  const handleReturnToCapture = () => {
    setStep('capture')
    setPreviewData(null)
    setConcurrentDuplicate(null)
    setLocalInputError(null)
    resetPreview()
    resetImport()
    resetLink()
  }

  const isDuplicateBlocked = Boolean(
    previewData?.alreadyImported || concurrentDuplicate
  )
  const duplicateTransactionId =
    concurrentDuplicate?.existingTransactionId ??
    previewData?.existingTransactionId ??
    null

  const isSubmittingImport =
    importMutation.isPending || isRunningAfterImport

  const handleImportSubmit = form.handleSubmit(async (values) => {
    if (props.mode !== 'import' || isDuplicateBlocked || isSubmittingImport) {
      return
    }

    try {
      const response = await importMutation.mutateAsync({
        input: submittedInput,
        accountId: values.accountId,
        categoryId: values.categoryId,
        amountCents: values.amountCents,
        date: values.date,
        description: values.description,
        status: values.status,
      })

      if (props.onAfterImport) {
        setIsRunningAfterImport(true)
        try {
          await props.onAfterImport(response)
        } finally {
          setIsRunningAfterImport(false)
        }
      }

      toast({
        title: 'NFC-e importada',
        description: 'A despesa e a lista de compras foram salvas.',
      })
      onOpenChange(false)
    } catch {
      // Handled via importMutation.error & concurrentDuplicate effect.
    }
  })

  const handleConfirmLink = async () => {
    if (
      props.mode !== 'link' ||
      isDuplicateBlocked ||
      linkMutation.isPending ||
      !submittedInput
    ) {
      return
    }

    try {
      const linked = await linkMutation.mutateAsync({
        transactionId: props.linkTarget.id,
        input: submittedInput,
      })
      toast({
        title: 'NFC-e vinculada',
        description: 'A nota fiscal foi associada à despesa.',
      })
      props.onLinked?.(linked)
      onOpenChange(false)
    } catch {
      // Handled via linkMutation.error & concurrentDuplicate effect.
    }
  }

  const divergence = useMemo(() => {
    if (props.mode !== 'link' || !previewData) {
      return null
    }
    return computeFiscalNoteDivergence(
      props.linkTarget,
      previewData.fiscalNote
    )
  }, [previewData, props])

  const selectedDate = form.watch('date')
  const selectedStatus = form.watch('status')
  const todayDate = getTodayDateOnly()
  const yesterdayDate = getYesterdayDateOnly()

  const selectedAccountName =
    activeAccounts.find((account) => account.id === form.watch('accountId'))
      ?.name ?? null
  const selectedCategoryName =
    expenseCategories.find(
      (category) => category.id === form.watch('categoryId')
    )?.displayName ?? null

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side={isMobile ? 'bottom' : 'right'}
        className="flex max-h-[calc(100dvh-1rem)] w-full flex-col overflow-hidden rounded-t-3xl border-border bg-card p-0 text-foreground md:h-full md:max-h-none md:rounded-none md:sm:max-w-xl"
      >
        <div className="overflow-y-auto p-6">
          <SheetHeader className="p-0 pr-8 text-left">
            <div className="mb-1 flex items-center gap-2">
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-brand/15 text-brand">
                <QrCode className="h-4 w-4" aria-hidden="true" />
              </span>
              <span className="text-xs font-medium text-brand">
                {step === 'capture'
                  ? 'Etapa 1 de 2 · Captura'
                  : 'Etapa 2 de 2 · Revisão'}
              </span>
            </div>
            <SheetTitle className="text-foreground">
              {props.mode === 'import'
                ? 'Importar despesa via NFC-e'
                : 'Vincular NFC-e à despesa'}
            </SheetTitle>
            <SheetDescription className="text-muted-foreground">
              {step === 'capture'
                ? 'Leia o QR Code ou informe a chave de 44 dígitos de uma NFC-e do Ceará (SEFAZ-CE).'
                : props.mode === 'import'
                  ? 'Confira os itens da nota e ajuste os dados antes de salvar a despesa.'
                  : 'Confira os dados da nota antes de confirmar o vínculo com a despesa.'}
            </SheetDescription>
          </SheetHeader>

          {step === 'capture' ? (
            <div className="mt-6 space-y-5">
              <Tabs value={activeTab} onValueChange={handleSelectTab}>
                <TabsList className="grid h-11 w-full grid-cols-3 rounded-xl bg-secondary p-1">
                  <TabsTrigger
                    value="camera"
                    className="gap-1.5 rounded-lg text-xs sm:text-sm"
                  >
                    <Camera className="h-4 w-4" aria-hidden="true" />
                    Câmera
                  </TabsTrigger>
                  <TabsTrigger
                    value="image"
                    className="gap-1.5 rounded-lg text-xs sm:text-sm"
                  >
                    <ImagePlus className="h-4 w-4" aria-hidden="true" />
                    Foto
                  </TabsTrigger>
                  <TabsTrigger
                    value="manual"
                    className="gap-1.5 rounded-lg text-xs sm:text-sm"
                  >
                    <Keyboard className="h-4 w-4" aria-hidden="true" />
                    Manual
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="camera" className="mt-4 space-y-4">
                  <FiscalNoteQrScannerPane
                    active={
                      open &&
                      step === 'capture' &&
                      activeTab === 'camera' &&
                      !previewMutation.isPending &&
                      !retryCountdown.isCountingDown &&
                      !localInputError
                    }
                    onDetect={(raw) => void submitPreviewInput(raw)}
                    onSwitchToImage={() => handleSelectTab('image')}
                    onSwitchToManual={() => handleSelectTab('manual')}
                  />
                </TabsContent>

                <TabsContent value="image" className="mt-4 space-y-4">
                  <FiscalNoteImageUploadPane
                    disabled={
                      previewMutation.isPending || retryCountdown.isCountingDown
                    }
                    onDecoded={(raw) => void submitPreviewInput(raw)}
                    onSwitchToManual={() => handleSelectTab('manual')}
                  />
                </TabsContent>

                <TabsContent value="manual" className="mt-4 space-y-4">
                  <FiscalNoteAccessKeyField
                    value={manualInput}
                    onChange={(nextValue) => {
                      setManualInput(nextValue)
                      if (localInputError) {
                        setLocalInputError(null)
                      }
                    }}
                    onSubmit={handleManualSubmit}
                    error={localInputError}
                    disabled={previewMutation.isPending}
                  />

                  <Button
                    type="button"
                    disabled={
                      previewMutation.isPending ||
                      retryCountdown.isCountingDown
                    }
                    className="h-11 w-full rounded-xl bg-primary text-primary-foreground hover:bg-primary/90"
                    onClick={handleManualSubmit}
                  >
                    {previewMutation.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Consultando NFC-e na SEFAZ-CE...
                      </>
                    ) : retryCountdown.isCountingDown ? (
                      <span className="numeric">
                        Tente novamente em {retryCountdown.remainingSeconds}s
                      </span>
                    ) : (
                      'Consultar nota'
                    )}
                  </Button>
                </TabsContent>
              </Tabs>

              {localInputError && activeTab !== 'manual' ? (
                <div
                  role="alert"
                  className="rounded-2xl border border-destructive/40 bg-destructive/10 p-4"
                >
                  <p className="text-sm font-semibold text-foreground">
                    Código da NFC-e inválido
                  </p>
                  <p className="mt-1 text-xs leading-5 text-muted-foreground">
                    {localInputError}
                  </p>
                  {activeTab === 'camera' ? (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="mt-3 h-9 rounded-xl border-border bg-secondary text-foreground hover:bg-accent"
                      onClick={() => setLocalInputError(null)}
                    >
                      <RefreshCw className="h-3.5 w-3.5" />
                      Escanear novamente
                    </Button>
                  ) : null}
                </div>
              ) : null}

              {previewMutation.isPending ? (
                <div
                  role="status"
                  aria-live="polite"
                  className="flex items-center gap-3 rounded-2xl border border-border bg-secondary p-4"
                >
                  <Loader2
                    className="h-5 w-5 shrink-0 animate-spin text-brand"
                    aria-hidden="true"
                  />
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      Consultando NFC-e na SEFAZ-CE...
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Buscando emitente, itens e formas de pagamento da nota.
                    </p>
                  </div>
                </div>
              ) : null}

              {concurrentDuplicate ? (
                <FiscalNoteDuplicateBanner
                  existingTransactionId={
                    concurrentDuplicate.existingTransactionId
                  }
                  onOpenExistingTransaction={onOpenExistingTransaction}
                  onReadAnotherNote={handleReturnToCapture}
                  isOpeningTransaction={isOpeningExistingTransaction}
                />
              ) : previewErrorPresentation ? (
                <div className="space-y-2">
                  <ApiErrorAlert
                    error={previewErrorPresentation}
                    onRetry={
                      previewErrorPresentation.recovery === 'retry' &&
                      !retryCountdown.isCountingDown
                        ? handleRetryPreview
                        : undefined
                    }
                  />
                  {retryCountdown.isCountingDown ? (
                    <p
                      aria-live="polite"
                      className="numeric text-xs font-medium text-muted-foreground"
                    >
                      Aguarde {retryCountdown.remainingSeconds}s para tentar
                      novamente.
                    </p>
                  ) : null}
                </div>
              ) : null}
            </div>
          ) : previewData ? (
            <div className="mt-6 space-y-5">
              <div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-9 rounded-xl px-2.5 text-muted-foreground hover:bg-secondary hover:text-foreground"
                  onClick={handleReturnToCapture}
                >
                  <ArrowLeft className="h-4 w-4" />
                  Ler outra nota
                </Button>
              </div>

              {isDuplicateBlocked ? (
                <FiscalNoteDuplicateBanner
                  existingTransactionId={duplicateTransactionId}
                  onOpenExistingTransaction={onOpenExistingTransaction}
                  onReadAnotherNote={handleReturnToCapture}
                  isOpeningTransaction={isOpeningExistingTransaction}
                />
              ) : null}

              {/* Preview header */}
              <div className="rounded-2xl border border-border bg-secondary p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <FiscalNoteBadge variant="compact" />
                      <span className="numeric text-xs text-muted-foreground">
                        {formatFiscalNoteNumberAndSeries(
                          previewData.fiscalNote.number,
                          previewData.fiscalNote.series
                        )}
                      </span>
                    </div>
                    <p className="text-sm font-semibold text-foreground">
                      {previewData.fiscalNote.issuerName}
                    </p>
                    <p className="numeric text-xs text-muted-foreground">
                      CNPJ {formatCnpj(previewData.fiscalNote.issuerCnpj)} ·{' '}
                      {formatDateTime(previewData.fiscalNote.issuedAt)}
                    </p>
                  </div>

                  <div className="shrink-0 text-right">
                    <p className="text-[11px] font-medium text-muted-foreground">
                      Total pago
                    </p>
                    <p className="numeric text-base font-semibold text-foreground">
                      {formatCurrencyFromCents(
                        previewData.fiscalNote.payableAmountCents
                      )}
                    </p>
                  </div>
                </div>
              </div>

              <Collapsible
                open={itemsOpen}
                onOpenChange={setItemsOpen}
                className="rounded-2xl border border-border bg-secondary"
              >
                <CollapsibleTrigger asChild>
                  <button
                    type="button"
                    className="flex w-full items-center justify-between gap-2 px-4 py-3 text-left text-sm font-medium text-foreground transition hover:bg-accent/50"
                  >
                    <span className="numeric">
                      Itens da nota ({previewData.fiscalNote.items.length})
                    </span>
                    <ChevronDown
                      className={cn(
                        'h-4 w-4 text-muted-foreground transition-transform duration-200',
                        itemsOpen && 'rotate-180'
                      )}
                      aria-hidden="true"
                    />
                  </button>
                </CollapsibleTrigger>
                <CollapsibleContent className="border-t border-border p-4">
                  <FiscalNoteItemsList items={previewData.fiscalNote.items} />
                </CollapsibleContent>
              </Collapsible>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <FiscalNoteTotalsCard
                  grossAmountCents={previewData.fiscalNote.grossAmountCents}
                  discountAmountCents={
                    previewData.fiscalNote.discountAmountCents
                  }
                  taxAmountCents={previewData.fiscalNote.taxAmountCents}
                  changeAmountCents={previewData.fiscalNote.changeAmountCents}
                  payableAmountCents={previewData.fiscalNote.payableAmountCents}
                />
                <FiscalNotePaymentsList
                  payments={previewData.fiscalNote.payments}
                />
              </div>

              {props.mode === 'import' && !isDuplicateBlocked ? (
                <form
                  id="fiscal-note-import-form"
                  className="space-y-5 border-t border-border pt-5"
                  onSubmit={handleImportSubmit}
                  noValidate
                >
                  {previewData.fiscalNote.payableAmountCents === 0 ? (
                    <div
                      role="status"
                      className="flex items-start gap-3 rounded-2xl border border-state-warning/40 bg-state-warning/10 p-3.5 text-xs leading-5 text-foreground"
                    >
                      <AlertTriangle
                        className="mt-0.5 h-4 w-4 shrink-0 text-state-warning"
                        aria-hidden="true"
                      />
                      <span>
                        Esta NFC-e retornou valor a pagar zerado. Informe um
                        valor maior que zero antes de importar a despesa.
                      </span>
                    </div>
                  ) : null}

                  <div className="space-y-2">
                    <label className="block space-y-2">
                      <span className="text-sm font-medium text-foreground">
                        Valor
                      </span>
                      <CurrencyInput
                        valueCents={form.watch('amountCents')}
                        onValueCentsChange={(value) =>
                          form.setValue('amountCents', value ?? 0, {
                            shouldDirty: true,
                            shouldValidate: true,
                          })
                        }
                        className={inputClassName}
                        aria-label="Valor"
                        aria-invalid={Boolean(form.formState.errors.amountCents)}
                      />
                    </label>
                    {form.formState.errors.amountCents?.message ? (
                      <p className="text-xs font-medium text-destructive">
                        {form.formState.errors.amountCents.message}
                      </p>
                    ) : null}
                  </div>

                  <div className="space-y-2">
                    <span className="block text-sm font-medium text-foreground">
                      Data
                    </span>
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
                          onClick={() =>
                            form.setValue('date', preset.value, {
                              shouldDirty: true,
                              shouldValidate: true,
                            })
                          }
                        >
                          {preset.label}
                        </Button>
                      ))}
                      <DateOnlyPicker
                        value={
                          selectedDate === todayDate ||
                          selectedDate === yesterdayDate
                            ? ''
                            : selectedDate
                        }
                        onChange={(value) =>
                          form.setValue('date', value, {
                            shouldDirty: true,
                            shouldValidate: true,
                          })
                        }
                        className="h-10"
                        placeholder="Outro"
                      />
                    </div>
                    {form.formState.errors.date?.message ? (
                      <p className="text-xs font-medium text-destructive">
                        {form.formState.errors.date.message}
                      </p>
                    ) : null}
                  </div>

                  <div className="space-y-2">
                    <label className="block space-y-2">
                      <span className="text-sm font-medium text-foreground">
                        Descrição
                      </span>
                      <Input
                        className={inputClassName}
                        maxLength={FISCAL_NOTE_DESCRIPTION_MAX_LENGTH}
                        placeholder="Ex.: Compras no supermercado"
                        aria-invalid={Boolean(form.formState.errors.description)}
                        value={form.watch('description')}
                        onChange={(event) =>
                          form.setValue('description', event.target.value, {
                            shouldDirty: true,
                            shouldValidate: true,
                          })
                        }
                      />
                    </label>
                    {form.formState.errors.description?.message ? (
                      <p className="text-xs font-medium text-destructive">
                        {form.formState.errors.description.message}
                      </p>
                    ) : null}
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <span className="block text-sm font-medium text-foreground">
                        Conta
                      </span>
                      <Select
                        value={form.watch('accountId')}
                        onValueChange={(value) =>
                          form.setValue('accountId', value, {
                            shouldDirty: true,
                            shouldValidate: true,
                          })
                        }
                      >
                        <SelectTrigger
                          aria-label="Conta"
                          aria-invalid={Boolean(form.formState.errors.accountId)}
                          className={inputClassName}
                        >
                          <SelectValue placeholder="Escolha uma conta">
                            {selectedAccountName ?? 'Escolha uma conta'}
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent className="border-border bg-card text-foreground">
                          {activeAccounts.map((account) => (
                            <SelectItem
                              key={account.id}
                              value={account.id}
                              hideIndicator
                              className="focus:bg-accent focus:text-foreground"
                            >
                              {account.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {form.formState.errors.accountId?.message ? (
                        <p className="text-xs font-medium text-destructive">
                          {form.formState.errors.accountId.message}
                        </p>
                      ) : null}
                    </div>

                    <div className="space-y-2">
                      <span className="block text-sm font-medium text-foreground">
                        Categoria
                      </span>
                      <Select
                        value={form.watch('categoryId')}
                        onValueChange={(value) =>
                          form.setValue('categoryId', value, {
                            shouldDirty: true,
                            shouldValidate: true,
                          })
                        }
                      >
                        <SelectTrigger
                          aria-label="Categoria"
                          aria-invalid={Boolean(
                            form.formState.errors.categoryId
                          )}
                          className={inputClassName}
                        >
                          <SelectValue placeholder="Escolha uma categoria">
                            {selectedCategoryName ?? 'Escolha uma categoria'}
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent className="border-border bg-card text-foreground">
                          {expenseCategories.map((category) => (
                            <SelectItem
                              key={category.id}
                              value={category.id}
                              hideIndicator
                              className="focus:bg-accent focus:text-foreground"
                            >
                              {category.displayName}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {form.formState.errors.categoryId?.message ? (
                        <p className="text-xs font-medium text-destructive">
                          {form.formState.errors.categoryId.message}
                        </p>
                      ) : null}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <span className="block text-sm font-medium text-foreground">
                      Situação
                    </span>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={selectedStatus === 'EFFECTIVE'}
                      className="flex h-11 w-full items-center justify-between gap-3 rounded-xl border border-border bg-secondary px-3 text-left transition hover:bg-accent focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring"
                      onClick={() =>
                        form.setValue(
                          'status',
                          selectedStatus === 'EFFECTIVE'
                            ? 'PENDING'
                            : 'EFFECTIVE',
                          { shouldDirty: true, shouldValidate: true }
                        )
                      }
                    >
                      <span className="flex min-w-0 items-center gap-2 text-sm font-medium text-foreground">
                        {selectedStatus === 'EFFECTIVE' ? (
                          <CheckCircle2 className="h-4 w-4 text-state-expense" />
                        ) : (
                          <Clock3 className="h-4 w-4 text-state-info" />
                        )}
                        <span className="truncate">
                          {selectedStatus === 'EFFECTIVE'
                            ? 'Foi paga'
                            : 'Pendente'}
                        </span>
                      </span>
                      <span
                        className={cn(
                          'relative h-5 w-9 rounded-full transition',
                          selectedStatus === 'EFFECTIVE'
                            ? 'bg-state-expense'
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
                  </div>

                  {props.renderAttachmentsField ? (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-medium text-foreground">
                          Comprovantes / Anexos (opcional)
                        </span>
                        <span className="text-xs text-muted-foreground">
                          PNG, JPEG ou WebP (até 5 MB)
                        </span>
                      </div>
                      {props.renderAttachmentsField({
                        disabled: isSubmittingImport,
                        isUploading: isRunningAfterImport,
                      })}
                    </div>
                  ) : null}

                  {importErrorPresentation && !concurrentDuplicate ? (
                    <ApiErrorAlert error={importErrorPresentation} />
                  ) : null}
                </form>
              ) : null}

              {props.mode === 'link' && !isDuplicateBlocked ? (
                <div className="space-y-4 border-t border-border pt-5">
                  <div className="rounded-2xl border border-border bg-secondary p-4">
                    <p className="text-xs font-medium uppercase tracking-normal text-muted-foreground">
                      Despesa selecionada
                    </p>
                    <p className="mt-1 text-sm font-semibold text-foreground">
                      {props.linkTarget.description?.trim() ||
                        'Despesa sem descrição'}
                    </p>
                    <p className="numeric mt-1 text-xs text-muted-foreground">
                      {formatCurrencyFromCents(props.linkTarget.amountCents)} ·{' '}
                      {formatDateOnlyForDisplay(props.linkTarget.date)}
                    </p>
                  </div>

                  {divergence ? (
                    <FiscalNoteDivergenceAlert divergence={divergence} />
                  ) : null}

                  {linkErrorPresentation && !concurrentDuplicate ? (
                    <ApiErrorAlert error={linkErrorPresentation} />
                  ) : null}
                </div>
              ) : null}
            </div>
          ) : null}
        </div>

        <SheetFooter className="mt-auto flex-row flex-wrap items-center justify-end gap-2 border-t border-border bg-card p-4">
          <Button
            type="button"
            variant="outline"
            className="h-10 rounded-xl border-border bg-secondary text-foreground hover:bg-accent hover:text-foreground"
            onClick={() => onOpenChange(false)}
          >
            Cancelar
          </Button>

          {step === 'preview' && props.mode === 'import' ? (
            <Button
              type="submit"
              form="fiscal-note-import-form"
              disabled={isDuplicateBlocked || isSubmittingImport}
              className="h-10 rounded-xl bg-state-expense px-4 text-primary-foreground hover:bg-state-expense/90"
            >
              {isRunningAfterImport
                ? 'Enviando comprovantes...'
                : importMutation.isPending
                  ? 'Importando...'
                  : 'Confirmar importação'}
            </Button>
          ) : null}

          {step === 'preview' && props.mode === 'link' ? (
            <Button
              type="button"
              disabled={isDuplicateBlocked || linkMutation.isPending}
              className="h-10 rounded-xl bg-primary px-4 text-primary-foreground hover:bg-primary/90"
              onClick={() => void handleConfirmLink()}
            >
              {linkMutation.isPending ? 'Vinculando...' : 'Confirmar vínculo'}
            </Button>
          ) : null}
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
