import { useEffect, useState } from 'react'
import { X } from 'lucide-react'
import { CurrencyInput } from '@/shared/components/atoms/CurrencyInput'
import { DateOnlyPicker } from '@/shared/components/molecules/DateOnlyPicker'
import { Button } from '@/shared/components/ui/button'
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
import { useIsMobile } from '@/shared/hooks/use-mobile'
import { cn } from '@/shared/lib/utils'
import {
  compareDateOnly,
  getCurrentYearMonth,
  getMonthEndDateOnly,
  getMonthStartDateOnly,
  getTodayDateOnly,
} from '@/shared/utils/dateOnly'
import { FISCAL_NOTE_SUPPORTED_UF_OPTIONS } from '../../constants/fiscal-notes.constants'
import {
  formatCnpjMask,
  normalizeCnpjDigits,
} from '../../utils/fiscalNoteListUrl.utils'

export interface FiscalNotesFiltersDraft {
  issuedFrom: string | null
  issuedTo: string | null
  minAmountCents: number | null
  maxAmountCents: number | null
  issuerCnpj: string | null
  sourceUf: string | null
}

export interface FiscalNotesFiltersSheetProps {
  open: boolean
  filters: FiscalNotesFiltersDraft
  onApply: (filters: FiscalNotesFiltersDraft) => void
  onOpenChange: (open: boolean) => void
}

interface FilterValidationErrors {
  date?: string
  amount?: string
  cnpj?: string
}

const ALL_UF_VALUE = '__all__'
const CNPJ_LENGTH = 14

const EMPTY_FILTERS_DRAFT: FiscalNotesFiltersDraft = {
  issuedFrom: null,
  issuedTo: null,
  minAmountCents: null,
  maxAmountCents: null,
  issuerCnpj: null,
  sourceUf: null,
}

/**
 * Responsive drawer/sheet for advanced fiscal-note filtering (period presets, DateOnly range, amount range, CNPJ, and UF).
 */
export function FiscalNotesFiltersSheet({
  open,
  filters,
  onApply,
  onOpenChange,
}: FiscalNotesFiltersSheetProps) {
  const isMobile = useIsMobile()
  const [draft, setDraft] = useState<FiscalNotesFiltersDraft>(filters)
  const [cnpjInput, setCnpjInput] = useState('')
  const [errors, setErrors] = useState<FilterValidationErrors>({})

  useEffect(() => {
    if (open) {
      setDraft(filters)
      setCnpjInput(filters.issuerCnpj ? formatCnpjMask(filters.issuerCnpj) : '')
      setErrors({})
    }
  }, [filters, open])

  const today = getTodayDateOnly()
  const currentMonth = getCurrentYearMonth()
  const presets = [
    {
      id: 'this-month',
      label: 'Este mês',
      issuedFrom: getMonthStartDateOnly(currentMonth),
      issuedTo: getMonthEndDateOnly(currentMonth),
    },
    {
      id: 'last-30',
      label: 'Últimos 30 dias',
      issuedFrom: shiftCivilDateDays(today, -29),
      issuedTo: today,
    },
    {
      id: 'last-90',
      label: 'Últimos 90 dias',
      issuedFrom: shiftCivilDateDays(today, -89),
      issuedTo: today,
    },
    {
      id: 'all-time',
      label: 'Todo o período',
      issuedFrom: null,
      issuedTo: null,
    },
  ] as const

  const handleApply = () => {
    const nextErrors: FilterValidationErrors = {}

    if (
      draft.issuedFrom &&
      draft.issuedTo &&
      compareDateOnly(draft.issuedFrom, draft.issuedTo) > 0
    ) {
      nextErrors.date = 'A data inicial precisa ser anterior ou igual à final.'
    }

    if (
      draft.minAmountCents !== null &&
      draft.maxAmountCents !== null &&
      draft.minAmountCents > draft.maxAmountCents
    ) {
      nextErrors.amount =
        'O valor mínimo não pode ser maior que o valor máximo.'
    }

    const cnpjDigits = normalizeCnpjDigits(cnpjInput)
    if (cnpjDigits.length > 0 && cnpjDigits.length < CNPJ_LENGTH) {
      nextErrors.cnpj = 'Informe os 14 dígitos do CNPJ do emitente.'
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors)
      return
    }

    onApply({
      ...draft,
      issuerCnpj: cnpjDigits.length === CNPJ_LENGTH ? cnpjDigits : null,
    })
    onOpenChange(false)
  }

  const handleClear = () => {
    setDraft(EMPTY_FILTERS_DRAFT)
    setCnpjInput('')
    setErrors({})
    onApply(EMPTY_FILTERS_DRAFT)
    onOpenChange(false)
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side={isMobile ? 'bottom' : 'right'}
        className="flex max-h-[calc(100dvh-1rem)] w-full flex-col overflow-hidden rounded-t-3xl border-border bg-card p-0 text-foreground md:h-full md:max-h-none md:rounded-none md:sm:max-w-md"
      >
        <div className="flex-1 overflow-y-auto p-6">
          <SheetHeader className="p-0 pr-8 text-left">
            <SheetTitle className="text-foreground">Filtros</SheetTitle>
            <SheetDescription className="text-muted-foreground">
              Período de emissão, faixa de valor pago, CNPJ e UF emissora.
            </SheetDescription>
          </SheetHeader>

          <div className="mt-6 space-y-6">
            <section className="space-y-3" aria-label="Período de emissão">
              <span className="block text-xs font-medium uppercase tracking-normal text-muted-foreground">
                Período de emissão
              </span>

              <div className="grid grid-cols-2 gap-2">
                {presets.map((preset) => {
                  const isActive =
                    draft.issuedFrom === preset.issuedFrom &&
                    draft.issuedTo === preset.issuedTo

                  return (
                    <Button
                      key={preset.id}
                      type="button"
                      variant="outline"
                      aria-pressed={isActive}
                      onClick={() => {
                        setDraft((current) => ({
                          ...current,
                          issuedFrom: preset.issuedFrom,
                          issuedTo: preset.issuedTo,
                        }))
                        setErrors((current) => ({
                          ...current,
                          date: undefined,
                        }))
                      }}
                      className={cn(
                        'h-9 rounded-xl border-border bg-secondary text-xs font-medium text-foreground hover:bg-accent hover:text-foreground',
                        isActive &&
                          'border-brand bg-brand/15 text-brand hover:bg-brand/20 hover:text-brand'
                      )}
                    >
                      {preset.label}
                    </Button>
                  )
                })}
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <label
                      htmlFor="fiscal-notes-filter-issued-from"
                      className="text-xs font-medium text-muted-foreground"
                    >
                      De
                    </label>
                    {draft.issuedFrom ? (
                      <button
                        type="button"
                        aria-label="Limpar data inicial"
                        onClick={() => {
                          setDraft((current) => ({
                            ...current,
                            issuedFrom: null,
                          }))
                          setErrors((current) => ({
                            ...current,
                            date: undefined,
                          }))
                        }}
                        className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
                      >
                        <X className="h-3 w-3" aria-hidden="true" />
                        Limpar
                      </button>
                    ) : null}
                  </div>
                  <DateOnlyPicker
                    id="fiscal-notes-filter-issued-from"
                    value={draft.issuedFrom ?? ''}
                    placeholder="Data inicial"
                    onChange={(value) => {
                      setDraft((current) => ({
                        ...current,
                        issuedFrom: value,
                      }))
                      setErrors((current) => ({ ...current, date: undefined }))
                    }}
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <label
                      htmlFor="fiscal-notes-filter-issued-to"
                      className="text-xs font-medium text-muted-foreground"
                    >
                      Até
                    </label>
                    {draft.issuedTo ? (
                      <button
                        type="button"
                        aria-label="Limpar data final"
                        onClick={() => {
                          setDraft((current) => ({
                            ...current,
                            issuedTo: null,
                          }))
                          setErrors((current) => ({
                            ...current,
                            date: undefined,
                          }))
                        }}
                        className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
                      >
                        <X className="h-3 w-3" aria-hidden="true" />
                        Limpar
                      </button>
                    ) : null}
                  </div>
                  <DateOnlyPicker
                    id="fiscal-notes-filter-issued-to"
                    value={draft.issuedTo ?? ''}
                    placeholder="Data final"
                    onChange={(value) => {
                      setDraft((current) => ({
                        ...current,
                        issuedTo: value,
                      }))
                      setErrors((current) => ({ ...current, date: undefined }))
                    }}
                  />
                </div>
              </div>

              {errors.date ? (
                <p role="alert" className="text-xs font-medium text-destructive">
                  {errors.date}
                </p>
              ) : null}
            </section>

            <section className="space-y-3" aria-label="Faixa de valor pago">
              <span className="block text-xs font-medium uppercase tracking-normal text-muted-foreground">
                Faixa de valor pago
              </span>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label
                    htmlFor="fiscal-notes-filter-min-amount"
                    className="block text-xs font-medium text-muted-foreground"
                  >
                    Valor mínimo
                  </label>
                  <CurrencyInput
                    id="fiscal-notes-filter-min-amount"
                    valueCents={draft.minAmountCents}
                    placeholder="Sem mínimo"
                    aria-invalid={Boolean(errors.amount)}
                    onValueCentsChange={(value) => {
                      setDraft((current) => ({
                        ...current,
                        minAmountCents: value ?? null,
                      }))
                      setErrors((current) => ({
                        ...current,
                        amount: undefined,
                      }))
                    }}
                    className="h-11 rounded-xl border-border bg-secondary text-foreground"
                  />
                </div>

                <div className="space-y-1.5">
                  <label
                    htmlFor="fiscal-notes-filter-max-amount"
                    className="block text-xs font-medium text-muted-foreground"
                  >
                    Valor máximo
                  </label>
                  <CurrencyInput
                    id="fiscal-notes-filter-max-amount"
                    valueCents={draft.maxAmountCents}
                    placeholder="Sem máximo"
                    aria-invalid={Boolean(errors.amount)}
                    onValueCentsChange={(value) => {
                      setDraft((current) => ({
                        ...current,
                        maxAmountCents: value ?? null,
                      }))
                      setErrors((current) => ({
                        ...current,
                        amount: undefined,
                      }))
                    }}
                    className="h-11 rounded-xl border-border bg-secondary text-foreground"
                  />
                </div>
              </div>

              {errors.amount ? (
                <p role="alert" className="text-xs font-medium text-destructive">
                  {errors.amount}
                </p>
              ) : null}
            </section>

            <div className="space-y-1.5">
              <label
                htmlFor="fiscal-notes-filter-cnpj"
                className="block text-xs font-medium uppercase tracking-normal text-muted-foreground"
              >
                CNPJ do emitente
              </label>
              <Input
                id="fiscal-notes-filter-cnpj"
                type="text"
                inputMode="numeric"
                maxLength={18}
                value={cnpjInput}
                placeholder="00.000.000/0000-00"
                aria-invalid={Boolean(errors.cnpj)}
                onChange={(event) => {
                  const masked = formatCnpjMask(event.target.value)
                  const digits = normalizeCnpjDigits(masked)
                  setCnpjInput(masked)
                  setDraft((current) => ({
                    ...current,
                    issuerCnpj: digits.length === CNPJ_LENGTH ? digits : null,
                  }))
                  setErrors((current) => ({ ...current, cnpj: undefined }))
                }}
                className="numeric h-11 rounded-xl border-border bg-secondary text-foreground placeholder:text-muted-foreground"
              />
              {errors.cnpj ? (
                <p role="alert" className="text-xs font-medium text-destructive">
                  {errors.cnpj}
                </p>
              ) : null}
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="fiscal-notes-filter-uf"
                className="block text-xs font-medium uppercase tracking-normal text-muted-foreground"
              >
                UF emissora
              </label>
              <Select
                value={draft.sourceUf ?? ALL_UF_VALUE}
                onValueChange={(value) =>
                  setDraft((current) => ({
                    ...current,
                    sourceUf: value === ALL_UF_VALUE ? null : value,
                  }))
                }
              >
                <SelectTrigger
                  id="fiscal-notes-filter-uf"
                  className="h-11 rounded-xl border-border bg-secondary text-foreground focus:ring-ring"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="border-border bg-card text-foreground">
                  <SelectItem
                    value={ALL_UF_VALUE}
                    className="focus:bg-accent focus:text-foreground"
                  >
                    Todas as UFs
                  </SelectItem>
                  {FISCAL_NOTE_SUPPORTED_UF_OPTIONS.map((option) => (
                    <SelectItem
                      key={option.code}
                      value={option.code}
                      className="focus:bg-accent focus:text-foreground"
                    >
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <SheetFooter className="mt-auto flex-row justify-end gap-2 space-x-0 border-t border-border bg-card p-4">
          <Button
            type="button"
            variant="outline"
            className="h-11 flex-1 rounded-xl border-border bg-secondary text-foreground hover:bg-accent hover:text-foreground sm:flex-none"
            onClick={handleClear}
          >
            Limpar
          </Button>
          <Button
            type="button"
            className="h-11 flex-1 rounded-xl bg-primary px-4 text-primary-foreground hover:bg-primary/90 sm:flex-none"
            onClick={handleApply}
          >
            Aplicar filtros
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}

/**
 * Shifts a civil DateOnly string (`YYYY-MM-DD`) by a signed number of days without local timezone/DST drift.
 */
const shiftCivilDateDays = (dateOnly: string, deltaDays: number): string => {
  const [yearStr = '1970', monthStr = '01', dayStr = '01'] = dateOnly.split('-')
  const utcDate = new Date(
    Date.UTC(Number(yearStr), Number(monthStr) - 1, Number(dayStr) + deltaDays)
  )

  const year = utcDate.getUTCFullYear()
  const month = String(utcDate.getUTCMonth() + 1).padStart(2, '0')
  const day = String(utcDate.getUTCDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}
