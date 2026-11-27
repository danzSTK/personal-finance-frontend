import { Skeleton } from '@/shared/components/ui/skeleton'

/**
 * Layout-stable loading skeleton matching the KPI strip and 5 fiscal-note rows.
 */
export function FiscalNotesSkeleton() {
  return (
    <div
      role="status"
      aria-busy="true"
      aria-label="Carregando notas fiscais"
      className="space-y-4"
    >
      <div className="flex w-full min-w-0 max-w-full flex-nowrap gap-3 overflow-hidden pb-1 xl:grid xl:grid-cols-4 xl:pb-0">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="w-[224px] shrink-0 rounded-2xl border border-border bg-card p-4 xl:w-auto xl:min-w-0 xl:shrink"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 space-y-2">
                <Skeleton className="h-3 w-20 animate-pulse rounded bg-secondary" />
                <Skeleton className="h-7 w-28 animate-pulse rounded bg-secondary" />
              </div>
              <Skeleton className="h-10 w-10 shrink-0 animate-pulse rounded-xl bg-secondary" />
            </div>
          </div>
        ))}
      </div>

      <div className="space-y-3 rounded-2xl border border-border bg-card p-4">
        {Array.from({ length: 5 }).map((_, index) => (
          <div
            key={index}
            className="flex items-center justify-between gap-4 rounded-xl border border-border/60 bg-secondary/40 p-3"
          >
            <div className="min-w-0 flex-1 space-y-2">
              <Skeleton className="h-4 w-48 animate-pulse rounded bg-secondary" />
              <Skeleton className="h-3 w-36 animate-pulse rounded bg-secondary" />
            </div>
            <Skeleton className="h-5 w-16 animate-pulse rounded-full bg-secondary" />
            <Skeleton className="h-5 w-24 animate-pulse rounded bg-secondary" />
          </div>
        ))}
      </div>
    </div>
  )
}
