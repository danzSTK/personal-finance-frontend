import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import {
  BadgePercent,
  ChevronLeft,
  ChevronRight,
  QrCode,
  ReceiptText,
  Scale,
} from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { cn } from '@/shared/lib/utils'
import { formatCurrencyFromCents } from '@/shared/utils/formatters'
import type { FiscalNoteListSummaryTotals } from '../../types/fiscal-note.types'

export interface FiscalNotesKpiGridProps {
  summary: FiscalNoteListSummaryTotals
}

interface KpiItem {
  label: string
  value: string
  icon: ReactNode
  iconToneClass: string
}

/**
 * Responsive 4-card KPI strip summarizing the active fiscal-note filter slice.
 * Uses a horizontal snap carousel on mobile/tablet and a 4-column grid on xl+ viewports.
 */
export function FiscalNotesKpiGrid({ summary }: FiscalNotesKpiGridProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)

  const checkScroll = useCallback(() => {
    const el = scrollContainerRef.current
    if (!el) return
    const { scrollLeft, scrollWidth, clientWidth } = el
    setCanScrollLeft(scrollLeft > 4)
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 4)
  }, [])

  useEffect(() => {
    checkScroll()
    const el = scrollContainerRef.current
    if (!el) return

    el.addEventListener('scroll', checkScroll, { passive: true })
    window.addEventListener('resize', checkScroll)

    return () => {
      el.removeEventListener('scroll', checkScroll)
      window.removeEventListener('resize', checkScroll)
    }
  }, [checkScroll])

  const scrollByAmount = (amount: number) => {
    scrollContainerRef.current?.scrollBy({ left: amount, behavior: 'smooth' })
  }

  const items: KpiItem[] = [
    {
      label: 'Total pago',
      value: formatCurrencyFromCents(summary.totalPayableAmountCents),
      icon: <ReceiptText className="h-4 w-4" />,
      iconToneClass: 'bg-state-expense/15 text-state-expense',
    },
    {
      label: 'Notas fiscais',
      value: String(summary.totalNotes),
      icon: <QrCode className="h-4 w-4" />,
      iconToneClass: 'bg-brand/15 text-brand',
    },
    {
      label: 'Descontos',
      value: formatCurrencyFromCents(summary.totalDiscountAmountCents),
      icon: <BadgePercent className="h-4 w-4" />,
      iconToneClass: 'bg-state-income/15 text-state-income',
    },
    {
      label: 'Tributos aprox.',
      value: formatCurrencyFromCents(summary.totalTaxAmountCents),
      icon: <Scale className="h-4 w-4" />,
      iconToneClass: 'bg-state-info/15 text-state-info',
    },
  ]

  return (
    <section aria-label="Indicadores de notas fiscais">
      <div className="relative w-full min-w-0 max-w-full overflow-hidden">
        {canScrollLeft ? (
          <div className="pointer-events-none absolute top-0 bottom-0 left-0 z-10 hidden w-12 items-center justify-start bg-gradient-to-r from-background via-background/85 to-transparent sm:flex xl:hidden">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => scrollByAmount(-240)}
              className="pointer-events-auto ml-1 h-8 w-8 rounded-full border border-border bg-card/95 text-foreground shadow-sm hover:bg-secondary"
              aria-label="Rolar indicadores para a esquerda"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
          </div>
        ) : null}

        <div
          ref={scrollContainerRef}
          data-testid="fiscal-notes-kpi-track"
          className="flex w-full min-w-0 max-w-full flex-nowrap snap-x snap-mandatory gap-3 overflow-x-auto overscroll-x-contain pb-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden xl:grid xl:grid-cols-4 xl:overflow-visible xl:pb-0"
        >
          {items.map((item) => (
            <article
              key={item.label}
              className="w-[224px] shrink-0 snap-start rounded-2xl border border-border bg-card p-4 xl:w-auto xl:min-w-0 xl:shrink"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-medium uppercase tracking-normal text-muted-foreground">
                    {item.label}
                  </p>
                  <p className="numeric mt-2 truncate text-xl font-semibold text-foreground sm:text-2xl">
                    {item.value}
                  </p>
                </div>
                <span
                  className={cn(
                    'inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl sm:h-10 sm:w-10',
                    item.iconToneClass
                  )}
                  aria-hidden="true"
                >
                  {item.icon}
                </span>
              </div>
            </article>
          ))}
        </div>

        {canScrollRight ? (
          <div className="pointer-events-none absolute top-0 right-0 bottom-0 z-10 hidden w-12 items-center justify-end bg-gradient-to-l from-background via-background/85 to-transparent sm:flex xl:hidden">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => scrollByAmount(240)}
              className="pointer-events-auto mr-1 h-8 w-8 rounded-full border border-border bg-card/95 text-foreground shadow-sm hover:bg-secondary"
              aria-label="Rolar indicadores para a direita"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        ) : null}
      </div>
    </section>
  )
}
