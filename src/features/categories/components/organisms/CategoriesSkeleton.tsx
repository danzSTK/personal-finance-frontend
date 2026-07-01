export function CategoriesSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card">
      {Array.from({ length: 6 }).map((_, index) => (
        <div
          key={index}
          className="flex animate-pulse items-center gap-3 border-b border-border p-4 last:border-b-0"
        >
          <span className="h-10 w-10 rounded-xl bg-accent" />
          <span className="min-w-0 flex-1 space-y-2">
            <span className="block h-4 w-40 rounded bg-accent" />
            <span className="block h-3 w-64 max-w-full rounded bg-secondary" />
          </span>
          <span className="hidden h-7 w-24 rounded-full bg-secondary md:block" />
          <span className="hidden h-7 w-32 rounded-full bg-secondary lg:block" />
          <span className="h-9 w-9 rounded-lg bg-secondary" />
        </div>
      ))}
    </div>
  )
}
