import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { CheckCircle2, Clock3, CircleDashed } from 'lucide-react'
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
import { DateOnlyPicker } from '@/shared/components/molecules/DateOnlyPicker'
import { Button } from '@/shared/lib/button'
import { cn } from '@/shared/lib/utils'
import { useIsMobile } from '@/shared/hooks/use-mobile'
import { compareDateOnly } from '@/shared/utils/dateOnly'
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
import type {
  TransactionAdvancedFilters,
  TransactionView,
} from '../../types/transaction-ui.types'

interface TransactionFiltersSheetProps {
  open: boolean
  view: TransactionView
  filters: TransactionAdvancedFilters
  accounts: Account[]
  categories: Category[]
  onApply: (filters: TransactionAdvancedFilters) => void
  onOpenChange: (isOpen: boolean) => void
}

const selectClassName =
  'h-11 rounded-xl border-border bg-secondary text-foreground focus:ring-0 focus:ring-offset-0 focus-visible:ring-0 focus-visible:ring-offset-0'
const ALL_VALUE = '__all__'

export function TransactionFiltersSheet({
  open,
  view,
  filters,
  accounts,
  categories,
  onApply,
  onOpenChange,
}: TransactionFiltersSheetProps) {
  const [draft, setDraft] = useState(filters)
  const [dateError, setDateError] = useState<string | null>(null)
  const isMobile = useIsMobile()

  useEffect(() => {
    if (open) {
      setDraft(filters)
      setDateError(null)
    }
  }, [filters, open])

  const availableCategories = categories.filter((category) => {
    if (category.isArchived) return false
    if (view === 'TRANSFER') return false
    if (view === 'INCOME') return category.type === 'INCOME'
    if (view === 'EXPENSE') return category.type === 'EXPENSE'
    return category.type === 'INCOME' || category.type === 'EXPENSE'
  })

  const apply = () => {
    if (compareDateOnly(draft.dateFrom, draft.dateTo) === 1) {
      setDateError('A data inicial precisa ser anterior ou igual à final.')
      return
    }

    onApply(draft)
    onOpenChange(false)
  }

  const cancel = () => {
    setDraft(filters)
    setDateError(null)
    onOpenChange(false)
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side={isMobile ? 'bottom' : 'right'}
        className="max-h-[calc(100dvh-1rem)] w-full overflow-y-auto rounded-t-3xl border-border bg-card text-foreground md:h-full md:max-h-none md:rounded-none md:sm:max-w-md"
      >
        <SheetHeader className="pr-8 text-left">
          <SheetTitle className="text-foreground">Filtros</SheetTitle>
          <SheetDescription className="text-muted-foreground">
            Conta, categoria, situação e período.
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-5">
          <FilterField label="Conta">
            <Select
              value={draft.accountId ?? ALL_VALUE}
              onValueChange={(value) =>
                setDraft((current) => ({
                  ...current,
                  accountId: value === ALL_VALUE ? null : value,
                }))
              }
            >
              <SelectTrigger className={selectClassName}>
                <AccountSelectLabel
                  account={
                    accounts.find((account) => account.id === draft.accountId) ??
                    null
                  }
                  fallback="Todas as contas"
                />
              </SelectTrigger>
              <SelectContent className="border-border bg-card text-foreground">
                <SelectItem
                  value={ALL_VALUE}
                  hideIndicator
                  className="focus:bg-accent focus:text-foreground"
                >
                  <span className="flex items-center gap-2">
                    <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-state-info/10 text-state-info">
                      <CircleDashed className="h-4 w-4" />
                    </span>
                    Todas as contas
                  </span>
                </SelectItem>
                {accounts
                  .filter((account) => !account.isArchived)
                  .map((account) => (
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
          </FilterField>

          {view !== 'TRANSFER' ? (
            <FilterField label="Categoria">
              <Select
                value={draft.categoryId ?? ALL_VALUE}
                onValueChange={(value) =>
                  setDraft((current) => ({
                    ...current,
                    categoryId: value === ALL_VALUE ? null : value,
                  }))
                }
              >
                <SelectTrigger className={selectClassName}>
                  <CategorySelectLabel
                    category={
                      availableCategories.find(
                        (category) => category.id === draft.categoryId
                      ) ?? null
                    }
                    fallback="Todas as categorias"
                  />
                </SelectTrigger>
                <SelectContent className="border-border bg-card text-foreground">
                  <SelectItem
                    value={ALL_VALUE}
                    hideIndicator
                    className="focus:bg-accent focus:text-foreground"
                  >
                    <span className="flex items-center gap-2">
                      <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-state-info/10 text-state-info">
                        <CircleDashed className="h-4 w-4" />
                      </span>
                      Todas as categorias
                    </span>
                  </SelectItem>
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
            </FilterField>
          ) : (
            <div className="rounded-2xl border border-border bg-secondary p-4 text-sm text-muted-foreground">
              Transferências usam categoria técnica e não podem ser filtradas por
              categoria nesta versão.
            </div>
          )}

          <FilterField label="Situação">
            <Select
              value={draft.status ?? ALL_VALUE}
              onValueChange={(value) =>
                setDraft((current) => ({
                  ...current,
                  status:
                    value === ALL_VALUE
                      ? null
                      : (value as TransactionAdvancedFilters['status']),
                }))
              }
            >
              <SelectTrigger className={selectClassName}>
                <StatusSelectLabel status={draft.status} />
              </SelectTrigger>
              <SelectContent className="border-border bg-card text-foreground">
                <SelectItem
                  value={ALL_VALUE}
                  hideIndicator
                  className="focus:bg-accent focus:text-foreground"
                >
                  <StatusSelectLabel status={null} />
                </SelectItem>
                <SelectItem
                  value="PENDING"
                  hideIndicator
                  className="focus:bg-accent focus:text-foreground"
                >
                  <StatusSelectLabel status="PENDING" />
                </SelectItem>
                <SelectItem
                  value="EFFECTIVE"
                  hideIndicator
                  className="focus:bg-accent focus:text-foreground"
                >
                  <StatusSelectLabel status="EFFECTIVE" />
                </SelectItem>
              </SelectContent>
            </Select>
          </FilterField>

          <div className="grid gap-3 sm:grid-cols-2">
            <FilterField label="De">
              <DateOnlyPicker
                value={draft.dateFrom}
                onChange={(value) =>
                  setDraft((current) => ({ ...current, dateFrom: value }))
                }
              />
            </FilterField>
            <FilterField label="Até">
              <DateOnlyPicker
                value={draft.dateTo}
                onChange={(value) =>
                  setDraft((current) => ({ ...current, dateTo: value }))
                }
              />
            </FilterField>
          </div>
          {dateError ? (
            <p className="text-xs font-medium text-destructive">{dateError}</p>
          ) : null}
        </div>

        <SheetFooter className="mt-6 flex-row justify-end gap-2 space-x-0">
          <Button
            type="button"
            variant="outline"
            className="h-11 flex-1 rounded-xl border-border bg-secondary text-foreground hover:bg-accent hover:text-foreground sm:flex-none"
            onClick={cancel}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            className="h-11 flex-1 rounded-xl bg-primary px-4 text-primary-foreground hover:bg-primary/90 sm:flex-none"
            onClick={apply}
          >
            Aplicar filtros
          </Button>
        </SheetFooter>
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

  return (
    <div className="flex min-w-0 items-center gap-2">
      <span
        className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-foreground"
        style={{ backgroundColor: color.hex }}
      >
        <Icon className="h-4 w-4" />
      </span>
      <span className="truncate">{category.displayName}</span>
    </div>
  )
}

interface StatusSelectLabelProps {
  status: TransactionAdvancedFilters['status']
}

function StatusSelectLabel({ status }: StatusSelectLabelProps) {
  const Icon =
    status === 'EFFECTIVE' ? CheckCircle2 : status === 'PENDING' ? Clock3 : CircleDashed
  const label =
    status === 'EFFECTIVE' ? 'Efetuadas' : status === 'PENDING' ? 'Pendentes' : 'Todas'
  const tone =
    status === 'EFFECTIVE'
      ? 'bg-state-income/10 text-state-income'
      : status === 'PENDING'
        ? 'bg-state-info/10 text-state-info'
        : 'bg-secondary text-muted-foreground'

  return (
    <div className="flex min-w-0 items-center gap-2">
      <span
        className={cn(
          'inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg',
          tone
        )}
      >
        <Icon className="h-4 w-4" />
      </span>
      <span className="truncate">{label}</span>
    </div>
  )
}

interface FilterFieldProps {
  label: string
  children: ReactNode
}

function FilterField({ label, children }: FilterFieldProps) {
  return (
    <label className="block space-y-2">
      <span className="text-sm font-medium text-foreground">{label}</span>
      {children}
    </label>
  )
}
