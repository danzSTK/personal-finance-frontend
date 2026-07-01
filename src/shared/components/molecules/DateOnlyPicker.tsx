import { useEffect, useMemo, useState } from 'react'
import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/shared/lib/button'
import { cn } from '@/shared/lib/utils'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/shared/components/ui/popover'
import {
  MONTH_LABELS,
  compareDateOnly,
  formatDateOnlyForDisplay,
  getTodayDateOnly,
} from '@/shared/utils/dateOnly'

interface DateOnlyPickerProps {
  id?: string
  value: string
  onChange: (value: string) => void
  className?: string
  disabled?: boolean
  label?: string
  placeholder?: string
}

export function DateOnlyPicker({
  id,
  value,
  onChange,
  className,
  disabled,
  label,
  placeholder = 'Selecionar data',
}: DateOnlyPickerProps) {
  const [open, setOpen] = useState(false)
  const [draftValue, setDraftValue] = useState(value || getTodayDateOnly())
  const [displayMonth, setDisplayMonth] = useState(() =>
    getYearMonthFromDateOnly(value)
  )

  useEffect(() => {
    if (open) {
      setDraftValue(value || getTodayDateOnly())
      setDisplayMonth(getYearMonthFromDateOnly(value))
    }
  }, [open, value])

  const days = useMemo(() => getCalendarDays(displayMonth), [displayMonth])
  const headerLabel = `${MONTH_LABELS[displayMonth.month - 1]} ${displayMonth.year}`

  const confirm = () => {
    onChange(draftValue)
    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          type="button"
          variant="outline"
          disabled={disabled}
          className={cn(
            'h-11 w-full justify-between rounded-xl border-border bg-secondary px-3 text-foreground hover:bg-accent hover:text-foreground focus-visible:ring-ring focus-visible:ring-offset-secondary',
            className
          )}
        >
          <span className="flex min-w-0 items-center gap-2">
            <CalendarDays className="h-4 w-4 shrink-0 text-muted-foreground" />
            <span className="numeric truncate">
              {label ?? (value ? formatDateOnlyForDisplay(value) : placeholder)}
            </span>
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="w-[calc(100vw-2rem)] max-w-xs rounded-3xl border-border bg-card p-0 text-foreground shadow-xl"
      >
        <div className="p-4">
          <div className="flex items-center justify-between">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-9 w-9 rounded-full text-foreground hover:bg-accent hover:text-foreground"
              onClick={() =>
                setDisplayMonth((current) => shiftMonth(current, -1))
              }
              aria-label="Mês anterior"
              title="Mês anterior"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <p className="text-sm font-medium text-foreground">{headerLabel}</p>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-9 w-9 rounded-full text-foreground hover:bg-accent hover:text-foreground"
              onClick={() => setDisplayMonth((current) => shiftMonth(current, 1))}
              aria-label="Próximo mês"
              title="Próximo mês"
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>

          <div className="mt-4 grid grid-cols-7 gap-1 text-center text-xs text-muted-foreground">
            {['Do', '2ª', '3ª', '4ª', '5ª', '6ª', 'Sá'].map((day) => (
              <span key={day}>{day}</span>
            ))}
          </div>

          <div className="mt-2 grid grid-cols-7 gap-1">
            {days.map((day) =>
              day.date ? (
                <button
                  key={day.date}
                  type="button"
                  className={cn(
                    'numeric h-9 rounded-full text-sm transition focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card',
                    draftValue === day.date
                      ? 'bg-primary text-primary-foreground'
                      : compareDateOnly(day.date, getTodayDateOnly()) === 0
                        ? 'text-primary hover:bg-primary/10'
                        : 'text-foreground hover:bg-secondary'
                  )}
                  onClick={() => setDraftValue(day.date ?? getTodayDateOnly())}
                >
                  {day.day}
                </button>
              ) : (
                <span key={day.key} className="h-9" aria-hidden />
              )
            )}
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-border px-4 py-3">
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
            onClick={confirm}
          >
            OK
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}

interface PickerYearMonth {
  year: number
  month: number
}

interface CalendarDay {
  key: string
  date: string | null
  day: number | null
}

const getYearMonthFromDateOnly = (value: string): PickerYearMonth => {
  const fallback = getTodayDateOnly()
  const source = /^\d{4}-\d{2}-\d{2}$/.test(value) ? value : fallback
  const [year = '0', month = '0'] = source.split('-')

  return {
    year: Number(year),
    month: Number(month),
  }
}

const getCalendarDays = (value: PickerYearMonth): CalendarDay[] => {
  const firstDay = getWeekday(value.year, value.month, 1)
  const daysInMonth = getDaysInMonth(value.year, value.month)
  const blanks = Array.from({ length: firstDay }, (_, index) => ({
    key: `blank-${index}`,
    date: null,
    day: null,
  }))
  const days = Array.from({ length: daysInMonth }, (_, index) => {
    const day = index + 1

    return {
      key: `${value.year}-${value.month}-${day}`,
      date: `${value.year}-${pad2(value.month)}-${pad2(day)}`,
      day,
    }
  })

  return [...blanks, ...days]
}

const shiftMonth = (
  value: PickerYearMonth,
  deltaMonths: number
): PickerYearMonth => {
  const zeroBasedMonth = value.month - 1 + deltaMonths
  const year = value.year + Math.floor(zeroBasedMonth / 12)
  const monthIndex = ((zeroBasedMonth % 12) + 12) % 12

  return {
    year,
    month: monthIndex + 1,
  }
}

const getWeekday = (year: number, month: number, day: number): number => {
  const adjustedMonth = month < 3 ? month + 12 : month
  const adjustedYear = month < 3 ? year - 1 : year
  const k = adjustedYear % 100
  const j = Math.floor(adjustedYear / 100)
  const h =
    (day +
      Math.floor((13 * (adjustedMonth + 1)) / 5) +
      k +
      Math.floor(k / 4) +
      Math.floor(j / 4) +
      5 * j) %
    7

  return (h + 6) % 7
}

const getDaysInMonth = (year: number, month: number): number => {
  if (month === 2) {
    return year % 400 === 0 || (year % 4 === 0 && year % 100 !== 0) ? 29 : 28
  }

  return [4, 6, 9, 11].includes(month) ? 30 : 31
}

const pad2 = (value: number): string => String(value).padStart(2, '0')
