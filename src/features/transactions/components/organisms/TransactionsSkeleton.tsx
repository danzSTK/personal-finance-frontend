import { Skeleton } from '@/shared/components/ui/skeleton'

export function TransactionsSkeleton() {
  return (
    <div className="min-w-0 max-w-full space-y-4">
      <div className="flex w-full min-w-0 max-w-full gap-3 overflow-hidden xl:grid xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton
            key={index}
            className="h-24 w-[224px] shrink-0 rounded-2xl bg-card sm:h-28 xl:w-auto"
          />
        ))}
      </div>

      <div className="hidden rounded-2xl border border-border bg-card p-4 md:block">
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={index} className="h-12 rounded-xl bg-secondary" />
          ))}
        </div>
      </div>

      <div className="grid gap-3 md:hidden">
        {Array.from({ length: 5 }).map((_, index) => (
          <Skeleton key={index} className="h-20 rounded-2xl bg-card" />
        ))}
      </div>
    </div>
  )
}
