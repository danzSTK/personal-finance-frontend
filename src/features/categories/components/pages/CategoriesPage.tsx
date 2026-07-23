import { useEffect, useMemo, useRef, useState } from 'react'
import type { ReactNode, RefObject } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  Archive,
  ChevronFirst,
  ChevronLast,
  ChevronLeft,
  ChevronRight,
  EllipsisVertical,
  Search,
  X,
} from 'lucide-react'
import { AuthAppShell } from '@/features/auth/components/templates/AuthAppShell'
import { Button } from '@/shared/lib/button'
import { Input } from '@/shared/lib/input'
import { cn } from '@/shared/lib/utils'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
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
import { useArchiveCategory, useUnarchiveCategory } from '../../api/mutations'
import { useCategories } from '../../api/queries'
import {
  CATEGORY_DEFAULT_LIMIT,
  CATEGORY_DEFAULT_PAGE,
  CATEGORY_MANAGEMENT_TABS,
  CATEGORY_PAGE_SIZE_OPTIONS,
  CATEGORY_SEARCH_DEBOUNCE_MS,
  CATEGORY_URL_PARAMS,
} from '../../constants/category.constants'
import type { CategoryManagementType } from '../../types/category.types'
import type {
  CategoryArchiveView,
  CategoryDeleteState,
  CategorySheetState,
} from '../../types/category-ui.types'
import {
  getCategoryTypeLabel,
  parseCategoryManagementType,
} from '../../utils/category.utils'
import { CategoryCreateButton } from '../molecules/CategoryCreateButton'
import { CategoryDeleteDialogs } from '../organisms/CategoryDeleteDialogs'
import { CategoryFormSheet } from '../organisms/CategoryFormSheet'
import { CategoriesSkeleton } from '../organisms/CategoriesSkeleton'
import {
  CategoriesEmptyState,
  CategoriesErrorState,
} from '../organisms/CategoriesStatePanels'
import { CategoriesTable } from '../organisms/CategoriesTable'

export function CategoriesPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const activeType =
    parseCategoryManagementType(searchParams.get(CATEGORY_URL_PARAMS.type)) ??
    'EXPENSE'
  const createIntent = parseCategoryManagementType(
    searchParams.get(CATEGORY_URL_PARAMS.create)
  )
  const [archiveView, setArchiveView] = useState<CategoryArchiveView>('active')
  const [page, setPage] = useState(CATEGORY_DEFAULT_PAGE)
  const [limit, setLimit] = useState(CATEGORY_DEFAULT_LIMIT)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [searchDraft, setSearchDraft] = useState('')
  const [search, setSearch] = useState('')
  const [sheetState, setSheetState] = useState<CategorySheetState>(null)
  const [deleteState, setDeleteState] = useState<CategoryDeleteState>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)

  const archiveCategoryMutation = useArchiveCategory()
  const unarchiveCategoryMutation = useUnarchiveCategory()

  useEffect(() => {
    if (!createIntent) {
      return
    }

    setSheetState({ mode: 'create', type: createIntent })

    const nextSearchParams = new URLSearchParams(searchParams)
    nextSearchParams.delete(CATEGORY_URL_PARAMS.create)

    if (createIntent === 'EXPENSE') {
      nextSearchParams.delete(CATEGORY_URL_PARAMS.type)
    } else {
      nextSearchParams.set(CATEGORY_URL_PARAMS.type, createIntent)
    }

    setSearchParams(nextSearchParams, { replace: true })
  }, [createIntent, searchParams, setSearchParams])

  useEffect(() => {
    const debounceId = window.setTimeout(() => {
      setSearch(searchDraft)
      setPage(CATEGORY_DEFAULT_PAGE)
    }, CATEGORY_SEARCH_DEBOUNCE_MS)

    return () => window.clearTimeout(debounceId)
  }, [searchDraft])

  useEffect(() => {
    if (isSearchOpen) {
      searchInputRef.current?.focus()
    }
  }, [isSearchOpen])

  const {
    data: categoriesResponse,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useCategories({
    page,
    limit,
    type: activeType,
    search,
    includeArchived: archiveView === 'archived',
  })

  const visibleCategories = useMemo(() => {
    const categories = categoriesResponse?.data ?? []

    return categories.filter(
      (category) =>
        category.type === activeType &&
        category.isArchived === (archiveView === 'archived')
    )
  }, [activeType, archiveView, categoriesResponse?.data])
  const meta = categoriesResponse?.meta
  const totalPages = Math.max(meta?.totalPages ?? 1, 1)
  const currentTypeLabel = getCategoryTypeLabel(activeType)
  const isMutating =
    archiveCategoryMutation.isPending || unarchiveCategoryMutation.isPending

  const handleTypeChange = (type: CategoryManagementType) => {
    const nextSearchParams = new URLSearchParams(searchParams)

    if (type === 'EXPENSE') {
      nextSearchParams.delete(CATEGORY_URL_PARAMS.type)
    } else {
      nextSearchParams.set(CATEGORY_URL_PARAMS.type, type)
    }

    setSearchParams(nextSearchParams)
    setPage(CATEGORY_DEFAULT_PAGE)
  }

  const handleArchiveViewChange = (view: CategoryArchiveView) => {
    setArchiveView(view)
    setPage(CATEGORY_DEFAULT_PAGE)
  }

  const openCreateSheet = () =>
    setSheetState({ mode: 'create', type: activeType })

  const clearSearch = () => {
    setSearchDraft('')
    setSearch('')
    setPage(CATEGORY_DEFAULT_PAGE)
    setIsSearchOpen(false)
  }

  return (
    <AuthAppShell
      activeSection="categories"
      title="Categorias"
      subtitle="Organize receitas e despesas"
    >
      <div className="min-w-0 space-y-5 overflow-hidden">
        <section
          className="min-w-0 overflow-hidden flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between"
          aria-labelledby="categories-title"
        >
          <div className="min-w-0">
            <h1
              id="categories-title"
              className="text-2xl font-semibold tracking-tight text-foreground"
            >
              Categorias
            </h1>
            <p className="mt-1 max-w-2xl text-sm leading-6 text-muted-foreground">
              Organize lançamentos por tipo e mantenha relatórios fáceis de
              entender.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <CategorySearch
              isOpen={isSearchOpen}
              value={searchDraft}
              inputRef={searchInputRef}
              onOpen={() => setIsSearchOpen(true)}
              onChange={setSearchDraft}
              onClear={clearSearch}
              onBlur={() => {
                setIsSearchOpen(false)
              }}
            />

            <CategoryCreateButton type={activeType} onClick={openCreateSheet} />

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className={cn(
                    'h-11 w-11 rounded-xl border-border bg-secondary text-foreground hover:bg-accent hover:text-foreground',
                    archiveView === 'archived' &&
                      'border-state-warning bg-state-warning/10 text-state-warning hover:text-state-warning'
                  )}
                  aria-label="Mais opções de categorias"
                  title="Mais opções"
                >
                  <EllipsisVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-64 rounded-2xl border-border bg-card p-2 text-foreground"
              >
                <DropdownMenuLabel className="text-xs text-muted-foreground">
                  Visualização
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-border" />
                <DropdownMenuCheckboxItem
                  checked={archiveView === 'archived'}
                  className="rounded-xl focus:bg-accent focus:text-foreground"
                  onCheckedChange={(checked) =>
                    handleArchiveViewChange(
                      checked === true ? 'archived' : 'active'
                    )
                  }
                >
                  <Archive className="mr-2 h-4 w-4" />
                  {archiveView === 'archived'
                    ? 'Ver categorias ativas'
                    : 'Ver arquivadas'}
                </DropdownMenuCheckboxItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-3 md:flex-row md:items-center md:justify-between">
            <div
              className="grid grid-cols-2 gap-2 rounded-xl bg-secondary p-1"
              role="tablist"
              aria-label="Tipo de categoria"
            >
              {CATEGORY_MANAGEMENT_TABS.map((tab) => (
                <button
                  key={tab.value}
                  type="button"
                  className={cn(
                    'rounded-lg px-4 py-2 text-sm font-medium transition focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-secondary',
                    activeType === tab.value
                      ? tab.value === 'EXPENSE'
                        ? 'bg-state-expense/15 text-state-expense'
                        : 'bg-state-income/15 text-state-income'
                      : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                  )}
                  role="tab"
                  aria-selected={activeType === tab.value}
                  title={tab.label}
                  onClick={() => handleTypeChange(tab.value)}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              {isFetching && !isLoading ? (
                <span>Atualizando categorias...</span>
              ) : (
                <span>
                  {archiveView === 'archived'
                    ? 'Categorias arquivadas'
                    : 'Categorias ativas'}{' '}
                  de {currentTypeLabel.toLowerCase()}
                </span>
              )}
            </div>
          </div>

          {isLoading ? <CategoriesSkeleton /> : null}

          {!isLoading && isError ? (
            <CategoriesErrorState
              error={error}
              onRetry={() => void refetch()}
            />
          ) : null}

          {!isLoading && !isError && visibleCategories.length > 0 ? (
            <>
              <CategoriesTable
                categories={visibleCategories}
                isMutating={isMutating}
                onArchive={(category) =>
                  archiveCategoryMutation.mutate(category.id)
                }
                onDelete={(category) =>
                  setDeleteState({ mode: 'confirm', category })
                }
                onEdit={(category) => setSheetState({ mode: 'edit', category })}
                onUnarchive={(category) =>
                  unarchiveCategoryMutation.mutate(category.id)
                }
              />

              <CategoriesPagination
                page={page}
                limit={limit}
                totalPages={totalPages}
                hasNextPage={meta?.hasNextPage ?? page < totalPages}
                hasPreviousPage={meta?.hasPreviousPage ?? page > 1}
                onLimitChange={(nextLimit) => {
                  setLimit(nextLimit)
                  setPage(CATEGORY_DEFAULT_PAGE)
                }}
                onPageChange={setPage}
              />
            </>
          ) : null}

          {!isLoading && !isError && visibleCategories.length === 0 ? (
            <CategoriesEmptyState
              archiveView={archiveView}
              search={search}
              type={activeType}
              typeLabel={currentTypeLabel}
              onCreate={openCreateSheet}
            />
          ) : null}
        </section>
      </div>

      <CategoryFormSheet
        state={sheetState}
        onOpenChange={(isOpen) => {
          if (!isOpen) {
            setSheetState(null)
          }
        }}
      />

      <CategoryDeleteDialogs
        state={deleteState}
        onStateChange={setDeleteState}
      />
    </AuthAppShell>
  )
}

interface CategorySearchProps {
  isOpen: boolean
  value: string
  inputRef: RefObject<HTMLInputElement>
  onOpen: () => void
  onChange: (value: string) => void
  onClear: () => void
  onBlur: () => void
}

function CategorySearch({
  isOpen,
  value,
  inputRef,
  onOpen,
  onChange,
  onClear,
  onBlur,
}: CategorySearchProps) {
  const hasActiveSearch = value.trim() !== ''

  if (!isOpen) {
    return (
      <Button
        type="button"
        variant="outline"
        size="icon"
        className={cn(
          'h-11 w-11 rounded-xl border-border bg-secondary text-foreground hover:bg-accent hover:text-foreground',
          hasActiveSearch &&
            'border-state-info bg-state-info/10 text-state-info hover:text-state-info'
        )}
        onClick={onOpen}
        aria-label={
          hasActiveSearch
            ? 'Pesquisa ativa em categorias'
            : 'Pesquisar categorias'
        }
        title={hasActiveSearch ? 'Pesquisa ativa' : 'Pesquisar'}
      >
        <Search className="h-4 w-4" />
      </Button>
    )
  }

  return (
    <div
      className="flex h-11 w-full min-w-0 items-center gap-2 rounded-xl border border-border bg-secondary px-3 opacity-100 transition-[width,opacity] duration-300 ease-out animate-in fade-in-0 zoom-in-95 motion-reduce:animate-none sm:w-72"
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) {
          onBlur()
        }
      }}
    >
      <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
      <Input
        ref={inputRef}
        className="h-9 border-0 bg-transparent px-0 text-foreground shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
        placeholder="Buscar categoria"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="h-8 w-8 rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground"
        onClick={onClear}
        aria-label="Limpar pesquisa"
        title="Limpar pesquisa"
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  )
}

interface CategoriesPaginationProps {
  page: number
  limit: number
  totalPages: number
  hasNextPage: boolean
  hasPreviousPage: boolean
  onLimitChange: (limit: number) => void
  onPageChange: (page: number) => void
}

function CategoriesPagination({
  page,
  limit,
  totalPages,
  hasNextPage,
  hasPreviousPage,
  onLimitChange,
  onPageChange,
}: CategoriesPaginationProps) {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-3 md:flex-row md:items-center md:justify-between">
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
            {CATEGORY_PAGE_SIZE_OPTIONS.map((option) => (
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
