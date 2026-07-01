import { Skeleton } from '@/shared/components/ui/skeleton'

export function TransactionsSkeleton() {
  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton
            key={index}
            className="h-32 rounded-2xl bg-card"
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
