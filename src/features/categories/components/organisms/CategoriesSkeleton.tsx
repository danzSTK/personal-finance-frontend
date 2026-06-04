export function CategoriesSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-app-border bg-app-surface">
      {Array.from({ length: 6 }).map((_, index) => (
        <div
          key={index}
          className="flex animate-pulse items-center gap-3 border-b border-app-border p-4 last:border-b-0"
        >
          <span className="h-10 w-10 rounded-xl bg-app-elevated" />
          <span className="min-w-0 flex-1 space-y-2">
            <span className="block h-4 w-40 rounded bg-app-elevated" />
            <span className="block h-3 w-64 max-w-full rounded bg-app-panel" />
          </span>
          <span className="hidden h-7 w-24 rounded-full bg-app-panel md:block" />
          <span className="hidden h-7 w-32 rounded-full bg-app-panel lg:block" />
          <span className="h-9 w-9 rounded-lg bg-app-panel" />
        </div>
      ))}
    </div>
  )
}
