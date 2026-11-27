import { useCallback, useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { QrCode, Search, SlidersHorizontal, X } from 'lucide-react'
import { ApiErrorAlert } from '@/shared/components/molecules/ApiErrorAlert'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select'
import { resolveApiError } from '@/shared/errors'
import { useFiscalNoteById, useFiscalNotesList } from '../../api/queries'
import {
  FISCAL_NOTE_LIST_DEFAULT_PAGE,
  FISCAL_NOTE_LIST_SEARCH_MAX_LENGTH,
  FISCAL_NOTE_LIST_SORT_OPTIONS,
} from '../../constants/fiscal-notes.constants'
import type {
  FiscalNoteListSort,
  FiscalNoteSummaryItem,
} from '../../types/fiscal-note.types'
import {
  buildFiscalNoteListSearchParams,
  countActiveFiscalNoteFilters,
  parseFiscalNoteListUrlState,
  toFiscalNoteListQueryParams,
  type FiscalNoteListUrlPatch,
} from '../../utils/fiscalNoteListUrl.utils'
import { FiscalNotesActiveFiltersBar } from '../molecules/FiscalNotesActiveFiltersBar'
import { FiscalNotesEmptyState } from '../molecules/FiscalNotesEmptyState'
import { FiscalNotesKpiGrid } from '../molecules/FiscalNotesKpiGrid'
import { FiscalNotesPagination } from '../molecules/FiscalNotesPagination'
import { FiscalNotesSkeleton } from '../molecules/FiscalNotesSkeleton'
import { FiscalNoteDetailsSheet } from '../organisms/FiscalNoteDetailsSheet'
import {
  FiscalNotesFiltersSheet,
  type FiscalNotesFiltersDraft,
} from '../organisms/FiscalNotesFiltersSheet'
import { FiscalNotesTable } from '../organisms/FiscalNotesTable'
import { FiscalNoteUnlinkDialog } from '../organisms/FiscalNoteUnlinkDialog'

export interface FiscalNotesPageProps {
  onImportFiscalNote?: () => void
  onOpenTransaction?: (transactionId: string) => void
}

type FiscalNoteUnlinkTarget = Pick<
  FiscalNoteSummaryItem,
  'id' | 'transactionId' | 'issuerName' | 'number' | 'series'
>

const SEARCH_DEBOUNCE_MS = 350

/**
 * Domain page for listing, filtering, searching, and inspecting persisted NFC-e notes and shopping lists.
 */
export function FiscalNotesPage({
  onImportFiscalNote,
  onOpenTransaction,
}: FiscalNotesPageProps) {
  const [searchParams, setSearchParams] = useSearchParams()
  const urlState = useMemo(
    () => parseFiscalNoteListUrlState(searchParams),
    [searchParams]
  )
  const queryParams = useMemo(
    () => toFiscalNoteListQueryParams(urlState),
    [urlState]
  )
  const activeFilterCount = useMemo(
    () => countActiveFiscalNoteFilters(urlState),
    [urlState]
  )

  const [searchDraft, setSearchDraft] = useState(urlState.search)
  const [filtersSheetOpen, setFiltersSheetOpen] = useState(false)
  const [selectedNoteSummary, setSelectedNoteSummary] =
    useState<FiscalNoteSummaryItem | null>(null)
  const [unlinkTarget, setUnlinkTarget] =
    useState<FiscalNoteUnlinkTarget | null>(null)

  const updateUrlState = useCallback(
    (patch: FiscalNoteListUrlPatch, replace = false) => {
      const nextParams = buildFiscalNoteListSearchParams(urlState, patch)
      setSearchParams(nextParams, { replace })
    },
    [setSearchParams, urlState]
  )

  useEffect(() => {
    setSearchDraft(urlState.search)
  }, [urlState.search])

  useEffect(() => {
    const normalizedDraft = searchDraft
      .trim()
      .slice(0, FISCAL_NOTE_LIST_SEARCH_MAX_LENGTH)
    if (normalizedDraft === urlState.search) {
      return
    }

    const timeoutId = window.setTimeout(() => {
      updateUrlState(
        {
          search: normalizedDraft,
          page: FISCAL_NOTE_LIST_DEFAULT_PAGE,
        },
        true
      )
    }, SEARCH_DEBOUNCE_MS)

    return () => window.clearTimeout(timeoutId)
  }, [searchDraft, updateUrlState, urlState.search])

  const { data, isLoading, isFetching, isError, error, refetch } =
    useFiscalNotesList(queryParams)

  const detailQuery = useFiscalNoteById(selectedNoteSummary?.id, {
    enabled: selectedNoteSummary !== null,
  })

  const filtersDraft: FiscalNotesFiltersDraft = useMemo(
    () => ({
      issuedFrom: urlState.issuedFrom,
      issuedTo: urlState.issuedTo,
      minAmountCents: urlState.minAmountCents,
      maxAmountCents: urlState.maxAmountCents,
      issuerCnpj: urlState.issuerCnpj,
      sourceUf: urlState.sourceUf,
    }),
    [
      urlState.issuedFrom,
      urlState.issuedTo,
      urlState.issuerCnpj,
      urlState.maxAmountCents,
      urlState.minAmountCents,
      urlState.sourceUf,
    ]
  )

  const hasAnyFilter = activeFilterCount > 0 || urlState.search.length > 0

  const handleApplyFilters = (nextFilters: FiscalNotesFiltersDraft) => {
    updateUrlState({
      ...nextFilters,
      page: FISCAL_NOTE_LIST_DEFAULT_PAGE,
    })
  }

  const clearAdvancedFilters = () => {
    updateUrlState({
      issuedFrom: null,
      issuedTo: null,
      minAmountCents: null,
      maxAmountCents: null,
      issuerCnpj: null,
      sourceUf: null,
      page: FISCAL_NOTE_LIST_DEFAULT_PAGE,
    })
  }

  const clearAllFiltersAndSearch = () => {
    setSearchDraft('')
    updateUrlState({
      search: '',
      issuedFrom: null,
      issuedTo: null,
      minAmountCents: null,
      maxAmountCents: null,
      issuerCnpj: null,
      sourceUf: null,
      page: FISCAL_NOTE_LIST_DEFAULT_PAGE,
    })
  }

  const handleClearSearch = () => {
    setSearchDraft('')
    if (urlState.search) {
      updateUrlState(
        {
          search: '',
          page: FISCAL_NOTE_LIST_DEFAULT_PAGE,
        },
        true
      )
    }
  }

  const listErrorPresentation = useMemo(
    () => (isError ? resolveApiError(error, 'fiscal-notes.list') : null),
    [error, isError]
  )

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Notas fiscais
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Consulte suas NFC-e importadas, busque itens comprados e acesse as
            despesas vinculadas.
          </p>
        </div>

        {onImportFiscalNote ? (
          <Button
            type="button"
            className="h-10 shrink-0 rounded-xl bg-brand px-4 text-brand-foreground hover:bg-brand/90"
            onClick={onImportFiscalNote}
          >
            <QrCode className="h-4 w-4" aria-hidden="true" />
            Ler NFC-e
          </Button>
        ) : null}
      </header>

      <section aria-label="Busca e filtros de notas fiscais" className="space-y-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative min-w-0 flex-1">
            <Search
              className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              type="search"
              value={searchDraft}
              maxLength={FISCAL_NOTE_LIST_SEARCH_MAX_LENGTH}
              onChange={(event) => setSearchDraft(event.target.value)}
              placeholder="Buscar por loja ou item (ex.: queijo, arroz)..."
              aria-label="Buscar notas fiscais por loja ou item"
              className="h-10 rounded-xl border-border bg-secondary pr-9 pl-9 text-sm text-foreground placeholder:text-muted-foreground"
            />
            {searchDraft ? (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label="Limpar busca"
                title="Limpar busca"
                className="absolute top-1/2 right-1 h-8 w-8 -translate-y-1/2 rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground"
                onClick={handleClearSearch}
              >
                <X className="h-4 w-4" />
              </Button>
            ) : null}
          </div>

          <div className="flex items-center gap-2">
            <Select
              value={urlState.sort}
              onValueChange={(value) =>
                updateUrlState({
                  sort: value as FiscalNoteListSort,
                  page: FISCAL_NOTE_LIST_DEFAULT_PAGE,
                })
              }
            >
              <SelectTrigger
                aria-label="Ordenar notas fiscais"
                className="h-10 w-full rounded-xl border-border bg-secondary text-foreground focus:ring-ring sm:w-56"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="border-border bg-card text-foreground">
                {FISCAL_NOTE_LIST_SORT_OPTIONS.map((option) => (
                  <SelectItem
                    key={option.value}
                    value={option.value}
                    className="focus:bg-accent focus:text-foreground"
                  >
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button
              type="button"
              variant="outline"
              onClick={() => setFiltersSheetOpen(true)}
              className="h-10 shrink-0 rounded-xl border-border bg-secondary px-3.5 text-foreground hover:bg-accent hover:text-foreground"
            >
              <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
              <span>Filtros</span>
              {activeFilterCount > 0 ? (
                <span className="numeric inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-brand px-1.5 text-xs font-semibold text-brand-foreground">
                  {activeFilterCount}
                </span>
              ) : null}
            </Button>
          </div>
        </div>

        <FiscalNotesActiveFiltersBar
          state={urlState}
          onRemovePeriod={() =>
            updateUrlState({
              issuedFrom: null,
              issuedTo: null,
              page: FISCAL_NOTE_LIST_DEFAULT_PAGE,
            })
          }
          onRemoveAmountRange={() =>
            updateUrlState({
              minAmountCents: null,
              maxAmountCents: null,
              page: FISCAL_NOTE_LIST_DEFAULT_PAGE,
            })
          }
          onRemoveCnpj={() =>
            updateUrlState({
              issuerCnpj: null,
              page: FISCAL_NOTE_LIST_DEFAULT_PAGE,
            })
          }
          onRemoveUf={() =>
            updateUrlState({
              sourceUf: null,
              page: FISCAL_NOTE_LIST_DEFAULT_PAGE,
            })
          }
          onClearAll={clearAdvancedFilters}
        />
      </section>

      {isLoading ? <FiscalNotesSkeleton /> : null}

      {!isLoading && listErrorPresentation ? (
        <div className="rounded-2xl border border-border bg-card p-4">
          <ApiErrorAlert
            error={listErrorPresentation}
            onRetry={() => void refetch()}
          />
        </div>
      ) : null}

      {!isLoading && !isError && data ? (
        <div className="space-y-4">
          <FiscalNotesKpiGrid summary={data.summary} />

          {isFetching ? (
            <p
              aria-live="polite"
              className="text-xs font-medium text-muted-foreground"
            >
              Atualizando notas fiscais...
            </p>
          ) : null}

          {data.data.length === 0 ? (
            <FiscalNotesEmptyState
              hasFilters={hasAnyFilter}
              onClearFilters={clearAllFiltersAndSearch}
              onImportFiscalNote={onImportFiscalNote}
            />
          ) : (
            <div className="space-y-4">
              <FiscalNotesTable
                notes={data.data}
                onSelectNote={setSelectedNoteSummary}
                onOpenTransaction={onOpenTransaction}
                onUnlinkNote={(note) => setUnlinkTarget(note)}
              />

              <FiscalNotesPagination
                page={data.meta.page}
                limit={data.meta.limit}
                total={data.meta.total}
                totalPages={data.meta.totalPages}
                hasNextPage={data.meta.hasNextPage}
                hasPreviousPage={data.meta.hasPreviousPage}
                onPageChange={(nextPage) => updateUrlState({ page: nextPage })}
                onLimitChange={(nextLimit) =>
                  updateUrlState({
                    limit: nextLimit,
                    page: FISCAL_NOTE_LIST_DEFAULT_PAGE,
                  })
                }
              />
            </div>
          )}
        </div>
      ) : null}

      <FiscalNotesFiltersSheet
        open={filtersSheetOpen}
        filters={filtersDraft}
        onApply={handleApplyFilters}
        onOpenChange={setFiltersSheetOpen}
      />

      <FiscalNoteDetailsSheet
        open={selectedNoteSummary !== null}
        fiscalNote={detailQuery.data ?? null}
        isLoading={detailQuery.isLoading}
        error={detailQuery.error}
        onRetry={() => void detailQuery.refetch()}
        onViewTransaction={onOpenTransaction}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedNoteSummary(null)
          }
        }}
        onRequestUnlink={
          selectedNoteSummary
            ? () => setUnlinkTarget(detailQuery.data ?? selectedNoteSummary)
            : undefined
        }
      />

      <FiscalNoteUnlinkDialog
        open={unlinkTarget !== null}
        transactionId={unlinkTarget?.transactionId ?? null}
        fiscalNote={unlinkTarget}
        onOpenChange={(open) => {
          if (!open) {
            setUnlinkTarget(null)
          }
        }}
        onUnlinked={() => {
          if (
            selectedNoteSummary &&
            unlinkTarget &&
            selectedNoteSummary.id === unlinkTarget.id
          ) {
            setSelectedNoteSummary(null)
          }
        }}
      />
    </div>
  )
}
