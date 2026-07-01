import { useEffect, useState } from 'react'
import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/shared/lib/button'
import { cn } from '@/shared/lib/utils'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/shared/components/ui/popover'
import {
  MONTH_SHORT_LABELS,
  type YearMonth,
  formatMonthYearLabel,
  getCurrentYearMonth,
} from '@/shared/utils/dateOnly'

interface MonthYearPickerProps {
  value: YearMonth
  onChange: (value: YearMonth) => void
  ariaLabel?: string
  triggerClassName?: string
  showCalendarIcon?: boolean
}

export function MonthYearPicker({
  value,
  onChange,
  ariaLabel,
  triggerClassName,
  showCalendarIcon = true,
}: MonthYearPickerProps) {
  const [open, setOpen] = useState(false)
  const [displayYear, setDisplayYear] = useState(value.year)

  useEffect(() => {
    if (open) {
      setDisplayYear(value.year)
    }
  }, [open, value.year])

  const selectMonth = (month: number) => {
    onChange({ year: displayYear, month })
    setOpen(false)
  }

  const selectCurrentMonth = () => {
    onChange(getCurrentYearMonth())
    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          className={cn(
            'h-11 min-w-40 justify-center gap-3 rounded-full border-primary bg-primary/10 px-5 text-primary hover:bg-primary/15 hover:text-primary',
            triggerClassName
          )}
          aria-label={
            ariaLabel ?? `Selecionar periodo, atual ${formatMonthYearLabel(value)}`
          }
          title="Selecionar periodo"
        >
          {showCalendarIcon ? (
            <CalendarDays className="h-4 w-4 text-primary" />
          ) : null}
          <span className="min-w-0 truncate text-sm font-semibold">
            {formatMonthYearLabel(value)}
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="center"
        className="max-h-[min(32rem,calc(100dvh-2rem))] w-[calc(100vw-2rem)] max-w-sm overflow-y-auto rounded-3xl border-border bg-card p-0 text-foreground shadow-xl"
      >
        <div className="rounded-t-3xl bg-secondary p-4">
          <div className="flex items-center justify-between">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-9 w-9 rounded-full text-foreground hover:bg-accent hover:text-foreground"
              onClick={() => setDisplayYear((year) => year - 1)}
              aria-label="Ano anterior"
              title="Ano anterior"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <p className="numeric text-xl font-semibold text-foreground">
              {displayYear}
            </p>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-9 w-9 rounded-full text-foreground hover:bg-accent hover:text-foreground"
              onClick={() => setDisplayYear((year) => year + 1)}
              aria-label="Proximo ano"
              title="Proximo ano"
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 p-5 sm:grid-cols-4">
          {MONTH_SHORT_LABELS.map((label, index) => {
            const month = index + 1
            const isSelected = value.year === displayYear && value.month === month

            return (
              <button
                key={label}
                type="button"
                className={cn(
                  'h-11 rounded-xl text-sm font-medium transition focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card',
                  isSelected
                    ? 'bg-primary/15 text-primary'
                    : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                )}
                onClick={() => selectMonth(month)}
                aria-pressed={isSelected}
                title={label}
              >
                {label}
              </button>
            )
          })}
        </div>

        <div className="flex items-center justify-between gap-2 border-t border-border px-5 py-4">
          <Button
            type="button"
            variant="ghost"
            className="h-10 rounded-xl text-muted-foreground hover:bg-secondary hover:text-foreground"
            onClick={() => setOpen(false)}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            variant="ghost"
            className="h-10 rounded-xl text-primary hover:bg-primary/10 hover:text-primary"
            onClick={selectCurrentMonth}
          >
            Mes atual
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}
