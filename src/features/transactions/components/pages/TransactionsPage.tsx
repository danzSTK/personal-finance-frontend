import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { ReactNode, RefObject } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useSearchParams } from 'react-router-dom'
import {
  ChevronFirst,
  ChevronLast,
  ChevronLeft,
  ChevronRight,
  EllipsisVertical,
  ListFilter,
  QrCode,
} from 'lucide-react'
import { AuthAppShell } from '@/features/auth/components/templates/AuthAppShell'
import { useAccountSummary, useAccounts } from '@/features/accounts/api/queries'
import { useCategories } from '@/features/categories/api/queries'
import {
  FiscalNoteDetailsSheet,
  FiscalNoteReaderSheet,
  FiscalNoteUnlinkDialog,
  type FiscalNoteAccountOption,
  type FiscalNoteCategoryOption,
  type FiscalNoteDetail,
  type FiscalNoteImportResponse,
  type FiscalNoteReaderSheetState,
} from '@/features/fiscal-notes'
import { ApiErrorAlert } from '@/shared/components/molecules/ApiErrorAlert'
import { ExpandableSearch } from '@/shared/components/molecules/ExpandableSearch'
import { MonthYearPicker } from '@/shared/components/molecules/MonthYearPicker'
import { resolveApiError, showApiErrorToast } from '@/shared/errors'
import { toast } from '@/shared/hooks/use-toast'
import { Button } from '@/shared/components/ui/button'
import { cn } from '@/shared/lib/utils'
import {
  getCurrentYearMonth,
  getMonthEndDateOnly,
  getMonthStartDateOnly,
  shiftYearMonth,
  type YearMonth,
} from '@/shared/utils/dateOnly'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select'
import { uploadTransactionAttachments } from '../../api/attachment.mutations'
import { getTransactionById, useTransactions } from '../../api/queries'
import {
  TRANSACTION_DEFAULT_LIMIT,
  TRANSACTION_DEFAULT_PAGE,
  TRANSACTION_PAGE_SIZE_OPTIONS,
  TRANSACTION_QUERY_KEYS,
  TRANSACTION_SEARCH_DEBOUNCE_MS,
} from '../../constants/transaction.constants'
import type { Transaction } from '../../types/transaction.types'
import { ATTACHMENT_MAX_FILES } from '../../types/transaction-attachment.types'
import type {
  BalanceAdjustmentSheetState,
  TransactionAdvancedFilters,
  TransactionConfirmSheetState,
  TransactionDeleteDialogState,
  TransactionDetailsSheetState,
  TransactionFormSheetState,
  TransactionView,
} from '../../types/transaction-ui.types'
import { viewToTransactionType } from '../../utils/transaction.utils'
import {
  buildTransactionSearchParams,
  clearTransactionCreateParam,
  parseTransactionUrlState,
  parseTransactionCreateIntent,
  type TransactionUrlPatch,
} from '../../utils/transactionUrl.utils'
import { BalanceAdjustmentSheet } from '../organisms/BalanceAdjustmentSheet'
import { TransactionConfirmSheet } from '../organisms/TransactionConfirmSheet'
import { TransactionAccountSelect } from '../molecules/TransactionAccountSelect'
import { TransactionCategorySelect } from '../molecules/TransactionCategorySelect'
import { TransactionCreateButton } from '../molecules/TransactionCreateButton'
import { TransactionDeleteDialog } from '../organisms/TransactionDeleteDialog'
import { TransactionDetailsSheet } from '../organisms/TransactionDetailsSheet'
import { TransactionFiltersSheet } from '../organisms/TransactionFiltersSheet'
import { TransactionFormSheet } from '../organisms/TransactionFormSheet'
import {
  type StagedTransactionAttachment,
  TransactionStagedAttachmentsField,
} from '../organisms/TransactionStagedAttachmentsField'
import { TransactionTypeSelect } from '../molecules/TransactionTypeSelect'
import {
  TransactionsEmptyState,
  TransactionsErrorState,
} from '../organisms/TransactionsStatePanels'
import { TransactionsKpiGrid } from '../organisms/TransactionsKpiGrid'
import { TransactionsSkeleton } from '../organisms/TransactionsSkeleton'
import { TransactionsTable } from '../organisms/TransactionsTable'

export function TransactionsPage() {
  const queryClient = useQueryClient()
  const [searchParams, setSearchParams] = useSearchParams()
  const transactionUrlState = useMemo(
    () => parseTransactionUrlState(searchParams),
    [searchParams]
  )
  const createIntent = useMemo(
    () => parseTransactionCreateIntent(searchParams),
    [searchParams]
  )
  const { view, period, page, limit, search, filters } = transactionUrlState
  const currentPeriod = useMemo(() => getCurrentYearMonth(), [])
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [searchDraft, setSearchDraft] = useState(search)
  const [isFiltersOpen, setIsFiltersOpen] = useState(false)
  const [formSheetState, setFormSheetState] =
    useState<TransactionFormSheetState>(null)
  const [balanceAdjustmentSheetState, setBalanceAdjustmentSheetState] =
    useState<BalanceAdjustmentSheetState>(null)
  const [confirmSheetState, setConfirmSheetState] =
    useState<TransactionConfirmSheetState>(null)
  const [detailsSheetState, setDetailsSheetState] =
    useState<TransactionDetailsSheetState>(null)
  const [deleteDialogState, setDeleteDialogState] =
    useState<TransactionDeleteDialogState>(null)
  const [readerSheetState, setReaderSheetState] =
    useState<FiscalNoteReaderSheetState>({ open: false, mode: 'import' })
  const [fiscalNoteDetailsState, setFiscalNoteDetailsState] =
    useState<FiscalNoteDetail | null>(null)
  const [unlinkDialogState, setUnlinkDialogState] = useState<{
    transactionId: string
    fiscalNote: FiscalNoteDetail
  } | null>(null)
  const [stagedFiscalNoteAttachments, setStagedFiscalNoteAttachments] =
    useState<StagedTransactionAttachment[]>([])
  const stagedFiscalNoteAttachmentsRef = useRef<StagedTransactionAttachment[]>(
    []
  )
  stagedFiscalNoteAttachmentsRef.current = stagedFiscalNoteAttachments
  const [isOpeningExistingTransaction, setIsOpeningExistingTransaction] =
    useState(false)
  const searchInputRef = useRef<HTMLInputElement>(null)

  const clearStagedFiscalNoteAttachments = useCallback(() => {
    stagedFiscalNoteAttachmentsRef.current.forEach((item) => {
      URL.revokeObjectURL(item.previewUrl)
    })
    setStagedFiscalNoteAttachments([])
  }, [])

  useEffect(() => {
    return () => {
      stagedFiscalNoteAttachmentsRef.current.forEach((item) => {
        URL.revokeObjectURL(item.previewUrl)
      })
    }
  }, [])

  const openFiscalNoteImport = useCallback(() => {
    clearStagedFiscalNoteAttachments()
    setReaderSheetState({ open: true, mode: 'import' })
  }, [clearStagedFiscalNoteAttachments])

  const closeFiscalNoteReader = useCallback(() => {
    clearStagedFiscalNoteAttachments()
    setReaderSheetState((current) => ({ ...current, open: false }))
  }, [clearStagedFiscalNoteAttachments])

  const openFiscalNoteLink = useCallback(
    (transaction: Transaction) => {
      clearStagedFiscalNoteAttachments()
      setReaderSheetState({
        open: true,
        mode: 'link',
        targetTransaction: {
          id: transaction.id,
          amountCents: transaction.amountCents,
          date: transaction.date,
          description: transaction.description,
        },
      })
    },
    [clearStagedFiscalNoteAttachments]
  )

  const updateUrlState = useCallback(
    (patch: TransactionUrlPatch, replace = false) => {
      setSearchParams(
        buildTransactionSearchParams(transactionUrlState, patch),
        { replace }
      )
    },
    [setSearchParams, transactionUrlState]
  )

  useEffect(() => {
    if (!createIntent) {
      return
    }

    if (createIntent === 'FISCAL_NOTE') {
      openFiscalNoteImport()
    } else if (createIntent === 'ADJUSTMENT') {
      setBalanceAdjustmentSheetState({
        initialAccountId: filters.accountId,
      })
    } else {
      setFormSheetState({ mode: 'create', type: createIntent })
    }

    setSearchParams(clearTransactionCreateParam(searchParams), {
      replace: true,
    })
  }, [
    createIntent,
    filters.accountId,
    openFiscalNoteImport,
    searchParams,
    setSearchParams,
  ])

  useEffect(() => {
    setSearchDraft(search)
  }, [search])

  useEffect(() => {
    if (searchDraft === search) {
      return
    }

    const debounceId = window.setTimeout(() => {
      updateUrlState(
        { search: searchDraft, page: TRANSACTION_DEFAULT_PAGE },
        true
      )
    }, TRANSACTION_SEARCH_DEBOUNCE_MS)

    return () => window.clearTimeout(debounceId)
  }, [search, searchDraft, updateUrlState])

  useEffect(() => {
    if (isSearchOpen) {
      searchInputRef.current?.focus()
    }
  }, [isSearchOpen])

  const defaultFilters = useMemo(
    () => buildDefaultFilters(period),
    [period]
  )
  const listParams = useMemo(
    () => ({
      page,
      limit,
      sort: 'date:desc' as const,
      dateFrom: filters.dateFrom,
      dateTo: filters.dateTo,
      type: viewToTransactionType(view),
      status: filters.status ?? undefined,
      accountId: filters.accountId ?? undefined,
      categoryId:
        view === 'TRANSFER' || view === 'ADJUSTMENT'
          ? undefined
          : (filters.categoryId ?? undefined),
    }),
    [filters, limit, page, view]
  )

  const {
    data: transactionsResponse,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useTransactions(listParams)
  const { data: accounts = [] } = useAccounts()
  const {
    data: accountSummary,
    isLoading: isAccountSummaryLoading,
    isError: isAccountSummaryError,
    error: accountSummaryError,
    refetch: refetchAccountSummary,
  } = useAccountSummary()
  const { data: expenseCategoriesResponse } = useCategories({
    page: 1,
    limit: 100,
    type: 'EXPENSE',
    search: '',
    includeArchived: false,
  })
  const { data: incomeCategoriesResponse } = useCategories({
    page: 1,
    limit: 100,
    type: 'INCOME',
    search: '',
    includeArchived: false,
  })
  const categories = useMemo(
    () => [
      ...(expenseCategoriesResponse?.data ?? []),
      ...(incomeCategoriesResponse?.data ?? []),
    ],
    [expenseCategoriesResponse?.data, incomeCategoriesResponse?.data]
  )
  const activeAccounts = useMemo(
    () => accounts.filter((account) => !account.isArchived),
    [accounts]
  )
  const expenseCategories = useMemo(
    () =>
      categories.filter(
        (category) => !category.isArchived && category.type === 'EXPENSE'
      ),
    [categories]
  )
  const fiscalNoteAccounts = useMemo<FiscalNoteAccountOption[]>(
    () =>
      accounts
        .filter((account) => !account.isArchived)
        .map((account) => ({
          id: account.id,
          name: account.name,
          isArchived: account.isArchived,
          isDefault: account.isDefault,
        })),
    [accounts]
  )
  const fiscalNoteCategories = useMemo<FiscalNoteCategoryOption[]>(
    () =>
      (expenseCategoriesResponse?.data ?? [])
        .filter((category) => !category.isArchived && category.type === 'EXPENSE')
        .map((category) => ({
          id: category.id,
          displayName: category.displayName,
          type: category.type,
          isArchived: category.isArchived,
        })),
    [expenseCategoriesResponse?.data]
  )
  const transactions = useMemo(() => {
    const data = transactionsResponse?.data ?? []
    const normalizedSearch = search.trim().toLowerCase()

    if (!normalizedSearch) {
      return data
    }

    return data.filter((transaction) =>
      (transaction.description ?? '').toLowerCase().includes(normalizedSearch)
    )
  }, [search, transactionsResponse?.data])
  const meta = transactionsResponse?.meta
  const totalPages = Math.max(meta?.totalPages ?? 1, 1)
  const isMutating = false
  const hasAdvancedFilters =
    filters.accountId !== null ||
    filters.categoryId !== null ||
    filters.status !== null ||
    filters.dateFrom !== defaultFilters.dateFrom ||
    filters.dateTo !== defaultFilters.dateTo
  const hasFilters =
    hasAdvancedFilters ||
    search.trim() !== '' ||
    limit !== TRANSACTION_DEFAULT_LIMIT ||
    period.year !== currentPeriod.year ||
    period.month !== currentPeriod.month

  const changePeriod = (nextPeriod: YearMonth) => {
    updateUrlState({
      period: nextPeriod,
      dateFrom: getMonthStartDateOnly(nextPeriod),
      dateTo: getMonthEndDateOnly(nextPeriod),
      page: TRANSACTION_DEFAULT_PAGE,
    })
  }

  const changeView = (nextView: TransactionView) => {
    updateUrlState({
      view: nextView,
      categoryId:
        nextView === 'TRANSFER' || nextView === 'ADJUSTMENT'
          ? null
          : filters.categoryId,
      page: TRANSACTION_DEFAULT_PAGE,
    })
  }

  const openCreateSheet = () => {
    if (view === 'ADJUSTMENT') {
      setBalanceAdjustmentSheetState({
        initialAccountId: filters.accountId,
      })
      return
    }

    if (view === 'EXPENSE' || view === 'INCOME' || view === 'TRANSFER') {
      setFormSheetState({ mode: 'create', type: view })
    }
  }

  const openEditSheet = (transaction: Transaction) => {
    setDetailsSheetState(null)
    setFormSheetState({ mode: 'edit', transaction })
  }

  const openConfirmSheet = (transaction: Transaction) => {
    setDetailsSheetState(null)
    setConfirmSheetState({ transaction })
  }

  const openDeleteDialog = (transaction: Transaction) => {
    setDetailsSheetState(null)
    setDeleteDialogState({ transaction })
  }

  const handleAddStagedFiscalNoteFiles = (files: File[]) => {
    setStagedFiscalNoteAttachments((current) => {
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

  const handleRemoveStagedFiscalNoteFile = (id: string) => {
    setStagedFiscalNoteAttachments((current) => {
      const target = current.find((item) => item.id === id)
      if (target) {
        URL.revokeObjectURL(target.previewUrl)
      }
      return current.filter((item) => item.id !== id)
    })
  }

  const handleAfterFiscalNoteImport = async (
    result: FiscalNoteImportResponse
  ) => {
    const filesToUpload = stagedFiscalNoteAttachmentsRef.current.map(
      (item) => item.file
    )
    if (filesToUpload.length === 0) {
      return
    }

    try {
      await uploadTransactionAttachments(result.transaction.id, filesToUpload)
      void queryClient.invalidateQueries({
        queryKey: TRANSACTION_QUERY_KEYS.attachments(result.transaction.id),
      })
      void queryClient.invalidateQueries({
        queryKey: TRANSACTION_QUERY_KEYS.transactions,
        exact: false,
      })
    } catch {
      toast({
        variant: 'destructive',
        title: 'NFC-e importada, mas o comprovante falhou',
        description:
          'A despesa e a nota fiscal foram salvas. Você pode enviar os comprovantes nos detalhes da despesa.',
      })
    } finally {
      clearStagedFiscalNoteAttachments()
    }
  }

  const handleOpenExistingTransaction = async (
    existingTransactionId: string
  ) => {
    setIsOpeningExistingTransaction(true)
    try {
      const existingTransaction = await queryClient.fetchQuery({
        queryKey: TRANSACTION_QUERY_KEYS.detail(existingTransactionId),
        queryFn: () => getTransactionById(existingTransactionId),
      })
      closeFiscalNoteReader()
      setDetailsSheetState({ transaction: existingTransaction })
    } catch (fetchError) {
      showApiErrorToast(fetchError, 'transactions.detail')
    } finally {
      setIsOpeningExistingTransaction(false)
    }
  }

  const showFiscalNoteAction = view === 'ALL' || view === 'EXPENSE'

  const clearSearch = () => {
    setSearchDraft('')
    updateUrlState({ search: '', page: TRANSACTION_DEFAULT_PAGE }, true)
    setIsSearchOpen(false)
  }

  const clearFilters = () => {
    const resetDateFrom = getMonthStartDateOnly(currentPeriod)
    const resetDateTo = getMonthEndDateOnly(currentPeriod)

    setSearchDraft('')
    updateUrlState(
      {
        view: 'ALL',
        period: currentPeriod,
        limit: TRANSACTION_DEFAULT_LIMIT,
        accountId: null,
        categoryId: null,
        status: null,
        dateFrom: resetDateFrom,
        dateTo: resetDateTo,
        search: '',
        page: TRANSACTION_DEFAULT_PAGE,
      },
      true
    )
    setIsSearchOpen(false)
  }

  return (
    <AuthAppShell
      activeSection="transactions"
      title="Transações"
      subtitle="Lançamentos do mês"
    >
      <div className="min-w-0 max-w-full space-y-5 overflow-x-hidden">
        <section className="space-y-4" aria-labelledby="transactions-title">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="min-w-0">
              <h1
                id="transactions-title"
                className="text-2xl font-semibold tracking-tight text-foreground"
              >
                Transações
              </h1>
            </div>
            <div className="flex items-center justify-center gap-4">
              <PeriodButton
                label="Mês anterior"
                onClick={() => changePeriod(shiftYearMonth(period, -1))}
              >
                <ChevronLeft className="h-5 w-5" />
              </PeriodButton>
              <MonthYearPicker
                value={period}
                onChange={changePeriod}
                showCalendarIcon={false}
                triggerClassName="min-w-36"
              />
              <PeriodButton
                label="Próximo mês"
                onClick={() => changePeriod(shiftYearMonth(period, 1))}
              >
                <ChevronRight className="h-5 w-5" />
              </PeriodButton>
            </div>
          </div>

          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2 md:flex md:justify-between">
            <TransactionTypeSelect
              value={view}
              onChange={changeView}
              className="h-11 min-w-0 rounded-xl border-border bg-secondary text-foreground md:w-64 md:flex-none"
            />

            <div className="flex min-w-0 shrink-0 items-center justify-end gap-2">
              <ExpandableSearch
                isOpen={isSearchOpen}
                value={searchDraft}
                inputRef={searchInputRef}
                placeholder="Buscar transação"
                closedLabel="Pesquisar transações"
                activeLabel="Pesquisa ativa em transações"
                onOpen={() => setIsSearchOpen(true)}
                onChange={setSearchDraft}
                onClear={clearSearch}
                onBlur={() => setIsSearchOpen(false)}
                className="hidden md:flex"
              />

              {showFiscalNoteAction ? (
                <Button
                  type="button"
                  variant="outline"
                  className="hidden h-11 gap-2 rounded-xl border-border bg-secondary px-3.5 text-foreground hover:bg-accent hover:text-foreground md:inline-flex"
                  onClick={openFiscalNoteImport}
                >
                  <QrCode className="h-4 w-4 text-brand" aria-hidden="true" />
                  <span>Ler NFC-e</span>
                </Button>
              ) : null}

              {view === 'EXPENSE' ||
              view === 'INCOME' ||
              view === 'TRANSFER' ||
              view === 'ADJUSTMENT' ? (
                <TransactionCreateButton view={view} onClick={openCreateSheet} />
              ) : null}

              <Button
                type="button"
                variant="outline"
                size="icon"
                className={cn(
                  'hidden h-11 w-11 rounded-xl border-border bg-secondary text-foreground hover:bg-accent hover:text-foreground md:inline-flex',
                  hasAdvancedFilters &&
                    'border-primary bg-primary/15 text-primary hover:text-primary'
                )}
                onClick={() => setIsFiltersOpen(true)}
                aria-label="Abrir filtros"
                title="Filtros"
              >
                <ListFilter className="h-4 w-4" />
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className={cn(
                      'h-11 w-11 rounded-xl border-border bg-secondary text-foreground hover:bg-accent hover:text-foreground md:hidden',
                      hasAdvancedFilters &&
                        'border-primary bg-primary/15 text-primary hover:text-primary'
                    )}
                    aria-label="Mais opções"
                    title="Mais opções"
                  >
                    <EllipsisVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-56 rounded-2xl border-border bg-card p-2 text-foreground"
                >
                  <DropdownMenuLabel className="text-xs text-muted-foreground">
                    Opções
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-border" />
                  {showFiscalNoteAction ? (
                    <DropdownMenuItem
                      className="rounded-xl focus:bg-accent focus:text-foreground"
                      onSelect={openFiscalNoteImport}
                    >
                      <QrCode
                        className="h-4 w-4 text-brand"
                        aria-hidden="true"
                      />
                      Ler NFC-e
                    </DropdownMenuItem>
                  ) : null}
                  <DropdownMenuItem
                    className="rounded-xl focus:bg-accent focus:text-foreground"
                    onSelect={() => setIsFiltersOpen(true)}
                  >
                    <ListFilter className="h-4 w-4" />
                    Filtros
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </section>

        {isFetching && !isLoading ? (
          <span className="block text-xs font-medium text-muted-foreground">
            Atualizando transações...
          </span>
        ) : null}

        {isLoading ? <TransactionsSkeleton /> : null}

        {!isLoading && isError ? (
          <TransactionsErrorState error={error} onRetry={() => void refetch()} />
        ) : null}

        {!isLoading && !isError ? (
          <section className="space-y-4" aria-label="Lista de transações">
            <TransactionsKpiGrid
              response={transactionsResponse}
              view={view}
              currentBalanceCents={accountSummary?.currentCents}
              isCurrentBalanceLoading={isAccountSummaryLoading}
            />

            {view === 'ALL' && isAccountSummaryError ? (
              <ApiErrorAlert
                error={resolveApiError(accountSummaryError, 'accounts.summary')}
                onRetry={() => void refetchAccountSummary()}
              />
            ) : null}

            <MobileTransactionsSearchHeader
              isSearchOpen={isSearchOpen}
              searchDraft={searchDraft}
              searchInputRef={searchInputRef}
              onOpenSearch={() => setIsSearchOpen(true)}
              onSearchChange={setSearchDraft}
              onClearSearch={clearSearch}
              onBlurSearch={() => setIsSearchOpen(false)}
            />

            {transactions.length > 0 ? (
              <div className="w-full min-w-0 max-w-full space-y-4">
                <TransactionsTable
                  transactions={transactions}
                  accounts={accounts}
                  categories={categories}
                  isMutating={isMutating}
                  onConfirm={openConfirmSheet}
                  onDelete={openDeleteDialog}
                  onEdit={openEditSheet}
                  onOpenDetails={(transaction) =>
                    setDetailsSheetState({ transaction })
                  }
                  onLinkFiscalNote={openFiscalNoteLink}
                />

                <TransactionsPagination
                  page={page}
                  limit={limit}
                  totalPages={totalPages}
                  hasNextPage={meta?.hasNextPage ?? page < totalPages}
                  hasPreviousPage={meta?.hasPreviousPage ?? page > 1}
                  onLimitChange={(nextLimit) => {
                    updateUrlState({
                      limit: nextLimit,
                      page: TRANSACTION_DEFAULT_PAGE,
                    })
                  }}
                  onPageChange={(nextPage) => updateUrlState({ page: nextPage })}
                />
              </div>
            ) : (
              <TransactionsEmptyState
                view={view}
                hasFilters={hasFilters}
                onClearFilters={clearFilters}
                onCreate={
                  view === 'EXPENSE' ||
                  view === 'INCOME' ||
                  view === 'TRANSFER' ||
                  view === 'ADJUSTMENT'
                    ? openCreateSheet
                    : undefined
                }
              />
            )}
          </section>
        ) : null}
      </div>

      <TransactionFiltersSheet
        open={isFiltersOpen}
        view={view}
        filters={filters}
        accounts={accounts}
        categories={categories}
        onApply={(nextFilters) => {
          updateUrlState({
            accountId: nextFilters.accountId,
            categoryId: nextFilters.categoryId,
            status: nextFilters.status,
            dateFrom: nextFilters.dateFrom,
            dateTo: nextFilters.dateTo,
            page: TRANSACTION_DEFAULT_PAGE,
          })
        }}
        onOpenChange={setIsFiltersOpen}
      />

      <TransactionFormSheet
        state={formSheetState}
        accounts={accounts}
        categories={categories}
        onImportFiscalNote={openFiscalNoteImport}
        onOpenChange={(isOpen) => {
          if (!isOpen) {
            setFormSheetState(null)
          }
        }}
      />

      <BalanceAdjustmentSheet
        state={balanceAdjustmentSheetState}
        accounts={accounts}
        onOpenChange={(isOpen) => {
          if (!isOpen) {
            setBalanceAdjustmentSheetState(null)
          }
        }}
      />

      <TransactionConfirmSheet
        state={confirmSheetState}
        accounts={accounts}
        onOpenChange={(isOpen) => {
          if (!isOpen) {
            setConfirmSheetState(null)
          }
        }}
      />

      <TransactionDetailsSheet
        state={detailsSheetState}
        accounts={accounts}
        categories={categories}
        onConfirm={() => {
          if (detailsSheetState?.transaction) {
            openConfirmSheet(detailsSheetState.transaction)
          }
        }}
        onDelete={() => {
          if (detailsSheetState?.transaction) {
            openDeleteDialog(detailsSheetState.transaction)
          }
        }}
        onEdit={() => {
          if (detailsSheetState?.transaction) {
            openEditSheet(detailsSheetState.transaction)
          }
        }}
        onLinkFiscalNote={openFiscalNoteLink}
        onViewFiscalNote={(fiscalNote) => setFiscalNoteDetailsState(fiscalNote)}
        onUnlinkFiscalNote={(transaction, fiscalNote) =>
          setUnlinkDialogState({
            transactionId: transaction.id,
            fiscalNote,
          })
        }
        onOpenChange={(isOpen) => {
          if (!isOpen) {
            setDetailsSheetState(null)
          }
        }}
      />

      <TransactionDeleteDialog
        state={deleteDialogState}
        onOpenChange={(isOpen) => {
          if (!isOpen) {
            setDeleteDialogState(null)
          }
        }}
      />

      {readerSheetState.mode === 'link' &&
      readerSheetState.targetTransaction !== null ? (
        <FiscalNoteReaderSheet
          open={readerSheetState.open}
          mode="link"
          linkTarget={readerSheetState.targetTransaction}
          onOpenChange={(isOpen) => {
            if (!isOpen) {
              closeFiscalNoteReader()
            }
          }}
          onLinked={() => {
            const linkedTransactionId =
              readerSheetState.targetTransaction?.id ?? null
            if (!linkedTransactionId) {
              return
            }
            setDetailsSheetState((current) =>
              current && current.transaction.id === linkedTransactionId
                ? {
                    transaction: {
                      ...current.transaction,
                      hasFiscalNote: true,
                    },
                  }
                : current
            )
          }}
          onOpenExistingTransaction={(existingId) =>
            void handleOpenExistingTransaction(existingId)
          }
          isOpeningExistingTransaction={isOpeningExistingTransaction}
        />
      ) : (
        <FiscalNoteReaderSheet
          open={readerSheetState.open && readerSheetState.mode === 'import'}
          mode="import"
          accounts={fiscalNoteAccounts}
          categories={fiscalNoteCategories}
          renderAccountField={({ value, onChange, disabled, invalid }) => (
            <TransactionAccountSelect
              accounts={activeAccounts}
              value={value}
              onValueChange={onChange}
              disabled={disabled}
              invalid={invalid}
              ariaLabel="Conta"
            />
          )}
          renderCategoryField={({ value, onChange, disabled, invalid }) => (
            <TransactionCategorySelect
              categories={expenseCategories}
              value={value}
              onValueChange={onChange}
              disabled={disabled}
              invalid={invalid}
              ariaLabel="Categoria"
            />
          )}
          renderAttachmentsField={({ disabled, isUploading }) => (
            <TransactionStagedAttachmentsField
              items={stagedFiscalNoteAttachments}
              disabled={disabled}
              isUploading={isUploading}
              onAddFiles={handleAddStagedFiscalNoteFiles}
              onRemove={handleRemoveStagedFiscalNoteFile}
              onReorder={setStagedFiscalNoteAttachments}
            />
          )}
          onAfterImport={handleAfterFiscalNoteImport}
          onOpenChange={(isOpen) => {
            if (!isOpen) {
              closeFiscalNoteReader()
            }
          }}
          onOpenExistingTransaction={(existingId) =>
            void handleOpenExistingTransaction(existingId)
          }
          isOpeningExistingTransaction={isOpeningExistingTransaction}
        />
      )}

      <FiscalNoteDetailsSheet
        open={fiscalNoteDetailsState !== null}
        fiscalNote={fiscalNoteDetailsState}
        onOpenChange={(isOpen) => {
          if (!isOpen) {
            setFiscalNoteDetailsState(null)
          }
        }}
        onRequestUnlink={
          fiscalNoteDetailsState
            ? () =>
                setUnlinkDialogState({
                  transactionId: fiscalNoteDetailsState.transactionId,
                  fiscalNote: fiscalNoteDetailsState,
                })
            : undefined
        }
      />

      <FiscalNoteUnlinkDialog
        open={unlinkDialogState !== null}
        transactionId={unlinkDialogState?.transactionId ?? null}
        fiscalNote={unlinkDialogState?.fiscalNote ?? null}
        onOpenChange={(isOpen) => {
          if (!isOpen) {
            setUnlinkDialogState(null)
          }
        }}
        onUnlinked={() => {
          const unlinkedTransactionId =
            unlinkDialogState?.transactionId ?? null
          setFiscalNoteDetailsState(null)
          if (unlinkedTransactionId) {
            setDetailsSheetState((current) =>
              current && current.transaction.id === unlinkedTransactionId
                ? {
                    transaction: {
                      ...current.transaction,
                      hasFiscalNote: false,
                    },
                  }
                : current
            )
          }
        }}
      />
    </AuthAppShell>
  )
}

const buildDefaultFilters = (period: YearMonth): TransactionAdvancedFilters => ({
  accountId: null,
  categoryId: null,
  status: null,
  dateFrom: getMonthStartDateOnly(period),
  dateTo: getMonthEndDateOnly(period),
})

interface PeriodButtonProps {
  label: string
  onClick: () => void
  children: ReactNode
}

function PeriodButton({ label, onClick, children }: PeriodButtonProps) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className="h-11 w-11 rounded-full text-primary hover:bg-primary/10 hover:text-primary"
      onClick={onClick}
      aria-label={label}
      title={label}
    >
      {children}
    </Button>
  )
}

interface MobileTransactionsSearchHeaderProps {
  isSearchOpen: boolean
  searchDraft: string
  searchInputRef: RefObject<HTMLInputElement | null>
  onOpenSearch: () => void
  onSearchChange: (value: string) => void
  onClearSearch: () => void
  onBlurSearch: () => void
}

function MobileTransactionsSearchHeader({
  isSearchOpen,
  searchDraft,
  searchInputRef,
  onOpenSearch,
  onSearchChange,
  onClearSearch,
  onBlurSearch,
}: MobileTransactionsSearchHeaderProps) {
  return (
    <div className="space-y-3 border-t border-border pt-4 md:hidden">
      <div className="flex min-w-0 items-center justify-between gap-3">
        <h2 className="text-sm font-semibold text-foreground">Lançamentos</h2>
        {!isSearchOpen ? (
          <ExpandableSearch
            isOpen={false}
            value={searchDraft}
            inputRef={searchInputRef}
            placeholder="Buscar transação"
            closedLabel="Pesquisar transações"
            activeLabel="Pesquisa ativa em transações"
            onOpen={onOpenSearch}
            onChange={onSearchChange}
            onClear={onClearSearch}
            onBlur={onBlurSearch}
          />
        ) : null}
      </div>

      {isSearchOpen ? (
        <ExpandableSearch
          isOpen
          value={searchDraft}
          inputRef={searchInputRef}
          placeholder="Buscar transação"
          closedLabel="Pesquisar transações"
          activeLabel="Pesquisa ativa em transações"
          onOpen={onOpenSearch}
          onChange={onSearchChange}
          onClear={onClearSearch}
          onBlur={onBlurSearch}
          className="w-full"
          openClassName="w-full"
        />
      ) : null}
    </div>
  )
}

interface TransactionsPaginationProps {
  page: number
  limit: number
  totalPages: number
  hasNextPage: boolean
  hasPreviousPage: boolean
  onLimitChange: (limit: number) => void
  onPageChange: (page: number) => void
}

function TransactionsPagination({
  page,
  limit,
  totalPages,
  hasNextPage,
  hasPreviousPage,
  onLimitChange,
  onPageChange,
}: TransactionsPaginationProps) {
  return (
    <div className="flex w-full min-w-0 max-w-full flex-col gap-3 rounded-2xl border border-border bg-card p-3 md:flex-row md:items-center md:justify-between">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <span>Linhas por página</span>
        <Select
          value={String(limit)}
          onValueChange={(value) => onLimitChange(Number(value))}
        >
          <SelectTrigger className="h-9 w-24 rounded-xl border-border bg-secondary text-foreground focus:ring-ring">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="border-border bg-card text-foreground">
            {TRANSACTION_PAGE_SIZE_OPTIONS.map((option) => (
              <SelectItem
                key={option}
                value={String(option)}
                className="focus:bg-accent focus:text-foreground"
              >
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <span className="mr-1 text-sm text-muted-foreground">
          Página {page} de {totalPages}
        </span>
        <PageButton
          label="Primeira página"
          disabled={!hasPreviousPage}
          onClick={() => onPageChange(1)}
        >
          <ChevronFirst className="h-4 w-4" />
        </PageButton>
        <PageButton
          label="Página anterior"
          disabled={!hasPreviousPage}
          onClick={() => onPageChange(Math.max(page - 1, 1))}
        >
          <ChevronLeft className="h-4 w-4" />
        </PageButton>
        <PageButton
          label="Próxima página"
          disabled={!hasNextPage}
          onClick={() => onPageChange(Math.min(page + 1, totalPages))}
        >
          <ChevronRight className="h-4 w-4" />
        </PageButton>
        <PageButton
          label="Última página"
          disabled={!hasNextPage}
          onClick={() => onPageChange(totalPages)}
        >
          <ChevronLast className="h-4 w-4" />
        </PageButton>
      </div>
    </div>
  )
}

interface PageButtonProps {
  label: string
  disabled: boolean
  onClick: () => void
  children: ReactNode
}

function PageButton({ label, disabled, onClick, children }: PageButtonProps) {
  return (
    <Button
      type="button"
      variant="outline"
      size="icon"
      className="h-9 w-9 rounded-xl border-border bg-secondary text-foreground hover:bg-accent hover:text-foreground"
      disabled={disabled}
      onClick={onClick}
      aria-label={label}
      title={label}
    >
      {children}
    </Button>
  )
}
